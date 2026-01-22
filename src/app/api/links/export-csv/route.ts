import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkTierLimits, getUpgradeMessage } from "@/lib/tier-limits";
import { LinkStatus, DisclosureStatus } from "@prisma/client";
import { calculateRevenueImpact, DEFAULT_SETTINGS } from "@/lib/revenue-estimator";
import { getDisclosureIssueText } from "@/lib/disclosure-detector";

// All statuses that indicate a broken/problematic link
const PROBLEM_STATUSES: LinkStatus[] = [
  LinkStatus.NOT_FOUND,
  LinkStatus.OOS,
  LinkStatus.OOS_THIRD_PARTY,
  LinkStatus.SEARCH_REDIRECT,
  LinkStatus.MISSING_TAG,
];

// Map LinkStatus to human-readable labels
const STATUS_LABELS: Record<LinkStatus, string> = {
  OK: "Healthy",
  OOS: "Out of Stock",
  OOS_THIRD_PARTY: "Third-Party Only",
  NOT_FOUND: "Not Found (404)",
  SEARCH_REDIRECT: "Search Redirect",
  MISSING_TAG: "Missing Affiliate Tag",
  REDIRECT: "Redirected",
  UNKNOWN: "Unknown",
};

// Priority order for sorting (highest priority first)
const STATUS_PRIORITY: Record<LinkStatus, number> = {
  NOT_FOUND: 1,
  SEARCH_REDIRECT: 2,
  OOS: 3,
  OOS_THIRD_PARTY: 4,
  MISSING_TAG: 5,
  REDIRECT: 6,
  UNKNOWN: 7,
  OK: 8,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check tier access for CSV export
    const tierCheck = await checkTierLimits(session.user.id, "csvExport");
    if (!tierCheck.allowed) {
      return NextResponse.json({
        error: "Upgrade required",
        message: getUpgradeMessage("csvExport"),
        upgradeRequired: true,
        currentTier: tierCheck.currentTier,
      }, { status: 403 });
    }

    // Get user settings for revenue calculation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        ctrPercent: true,
        conversionPercent: true,
        avgOrderValue: true,
      },
    });

    const revenueSettings = {
      ctrPercent: user?.ctrPercent ?? DEFAULT_SETTINGS.ctrPercent,
      conversionPercent: user?.conversionPercent ?? DEFAULT_SETTINGS.conversionPercent,
      avgOrderValue: user?.avgOrderValue ?? DEFAULT_SETTINGS.avgOrderValue,
    };

    // Get all broken links that need fixing
    const brokenLinks = await prisma.affiliateLink.findMany({
      where: {
        video: { userId: session.user.id },
        status: { in: PROBLEM_STATUSES },
        isFixed: false,
      },
      select: {
        id: true,
        originalUrl: true,
        status: true,
        suggestedLink: true,
        suggestedTitle: true,
        confidenceScore: true,
        video: {
          select: {
            title: true,
            youtubeVideoId: true,
            viewCount: true,
            publishedAt: true,
          },
        },
      },
    });

    // Transform and sort by priority
    const rows = brokenLinks
      .map((link) => {
        const videoAgeMonths = link.video.publishedAt
          ? Math.max(
              (Date.now() - new Date(link.video.publishedAt).getTime()) /
                (1000 * 60 * 60 * 24 * 30),
              1
            )
          : 12;

        const estimatedLoss = calculateRevenueImpact(
          link.video.viewCount,
          link.status,
          revenueSettings,
          videoAgeMonths
        );

        return {
          videoTitle: link.video.title,
          youtubeUrl: `https://youtube.com/watch?v=${link.video.youtubeVideoId}`,
          brokenLink: link.originalUrl,
          issue: STATUS_LABELS[link.status] || link.status,
          suggestedReplacement: link.suggestedLink || "",
          productName: link.suggestedTitle || "",
          confidence: link.confidenceScore ? `${link.confidenceScore}%` : "",
          estimatedMonthlyLoss: `$${estimatedLoss.toFixed(2)}`,
          priority: STATUS_PRIORITY[link.status] || 99,
          viewCount: link.video.viewCount,
        };
      })
      // Sort by priority first, then by estimated loss (descending)
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return parseFloat(b.estimatedMonthlyLoss.slice(1)) - parseFloat(a.estimatedMonthlyLoss.slice(1));
      });

    // Build CSV content - Broken Links section
    const headers = [
      "Video Title",
      "YouTube URL",
      "Broken Link",
      "Issue",
      "Suggested Replacement",
      "Product Name",
      "Confidence",
      "Est. Monthly Loss",
    ];

    const csvRows = rows.map((row) =>
      [
        escapeCSV(row.videoTitle),
        escapeCSV(row.youtubeUrl),
        escapeCSV(row.brokenLink),
        escapeCSV(row.issue),
        escapeCSV(row.suggestedReplacement),
        escapeCSV(row.productName),
        escapeCSV(row.confidence),
        escapeCSV(row.estimatedMonthlyLoss),
      ].join(",")
    );

    // Get disclosure issues for separate section
    const disclosureIssues = await prisma.video.findMany({
      where: {
        userId: session.user.id,
        hasAffiliateLinks: true,
        disclosureStatus: {
          in: [DisclosureStatus.MISSING, DisclosureStatus.WEAK],
        },
      },
      select: {
        title: true,
        youtubeVideoId: true,
        affiliateLinkCount: true,
        disclosureStatus: true,
        disclosurePosition: true,
      },
      orderBy: { viewCount: "desc" },
    });

    // Build disclosure section
    const disclosureHeaders = [
      "Video Title",
      "YouTube URL",
      "Affiliate Links",
      "Disclosure Status",
      "Issue",
    ];

    const disclosureRows = disclosureIssues.map((video) =>
      [
        escapeCSV(video.title),
        escapeCSV(`https://youtube.com/watch?v=${video.youtubeVideoId}`),
        String(video.affiliateLinkCount),
        video.disclosureStatus === "MISSING" ? "Missing" : "Weak",
        escapeCSV(getDisclosureIssueText(video.disclosureStatus, video.disclosurePosition)),
      ].join(",")
    );

    // Combine both sections
    const csvParts = [
      "=== BROKEN LINKS ===",
      headers.join(","),
      ...csvRows,
    ];

    if (disclosureIssues.length > 0) {
      csvParts.push(
        "",
        "=== DISCLOSURE ISSUES ===",
        disclosureHeaders.join(","),
        ...disclosureRows
      );
    }

    const csv = csvParts.join("\n");

    // Return as downloadable CSV file
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `linkmedic-correction-sheet-${timestamp}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return NextResponse.json(
      { error: "Failed to export CSV" },
      { status: 500 }
    );
  }
}

function escapeCSV(value: string): string {
  if (!value) return "";
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
