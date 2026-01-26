import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { syncUserVideos } from "@/lib/youtube";
import { extractLinksForUser } from "@/lib/scanner";
import { checkTierLimits, getUpgradeMessage } from "@/lib/tier-limits";
import { sendScanCompleteEmail } from "@/lib/email";
import { calculateRevenueImpact, DEFAULT_SETTINGS } from "@/lib/revenue-estimator";
import { LinkStatus } from "@prisma/client";

// Statuses that indicate a broken/problematic link
const PROBLEM_STATUSES: LinkStatus[] = [
  LinkStatus.NOT_FOUND,
  LinkStatus.OOS,
  LinkStatus.OOS_THIRD_PARTY,
  LinkStatus.SEARCH_REDIRECT,
  LinkStatus.MISSING_TAG,
];

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has ever synced before
    const existingVideos = await prisma.video.count({
      where: { userId: session.user.id },
    });
    const isFirstScan = existingVideos === 0;

    // Only check tier limits for RE-syncs, not first scans
    if (!isFirstScan) {
      const tierCheck = await checkTierLimits(session.user.id, "resync");
      if (!tierCheck.allowed) {
        return NextResponse.json({
          error: "Upgrade required",
          message: getUpgradeMessage("resync"),
          upgradeRequired: true,
          currentTier: tierCheck.currentTier,
        }, { status: 403 });
      }
    }

    // Sync videos from YouTube
    const { synced, total } = await syncUserVideos(session.user.id);

    // Extract affiliate links from video descriptions and analyze disclosures
    // Also auto-detects and saves affiliate tag if user doesn't have one
    const { links, disclosureIssues, detectedAffiliateTag } = await extractLinksForUser(session.user.id);

    // Handle first-time scans: send email and upgrade TRIAL → AUDITOR
    if (isFirstScan) {
      try {
        // Get user info and broken links for email
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true, name: true, tier: true, hasCompletedFirstScan: true },
        });

        // Get all links with video data for revenue calculation
        const allLinks = await prisma.affiliateLink.findMany({
          where: { video: { userId: session.user.id } },
          select: {
            status: true,
            video: {
              select: { viewCount: true },
            },
          },
        });

        const totalLinks = allLinks.length;
        const brokenLinks = allLinks.filter(
          (l) => PROBLEM_STATUSES.includes(l.status)
        );
        const brokenCount = brokenLinks.length;

        // Calculate monthly recovery from broken links
        const monthlyRecovery = Math.round(
          brokenLinks.reduce((sum, link) => {
            return sum + calculateRevenueImpact(
              link.video.viewCount,
              link.status,
              DEFAULT_SETTINGS
            );
          }, 0)
        );

        if (user?.email) {
          await sendScanCompleteEmail(
            user.email,
            user.name || "there",
            {
              totalLinks,
              brokenLinks: brokenCount,
              monthlyRecovery,
            },
            user.tier
          );
          console.log(`[Scan] Results email sent to ${user.email}`);
        }

        // Mark first scan complete AND upgrade tier if they're on TRIAL
        if (!user?.hasCompletedFirstScan) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: {
              hasCompletedFirstScan: true,
              // Only upgrade if they're on TRIAL (don't downgrade paid users)
              ...(user?.tier === "TRIAL" && { tier: "AUDITOR" }),
            },
          });
          console.log(`[Scan] First scan complete for user ${session.user.id}, tier: ${user?.tier} → AUDITOR`);
        }
      } catch (emailError) {
        // Log but don't fail the scan
        console.error("[Scan] Failed to send results email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      total,
      linksExtracted: links,
      disclosureIssues,
      // Let frontend know if we auto-detected their affiliate tag
      detectedAffiliateTag,
    });
  } catch (error) {
    console.error("Error syncing videos:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to sync videos: ${errorMessage}` },
      { status: 500 }
    );
  }
}
