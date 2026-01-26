import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scanUserLinks, getScanStats } from "@/lib/scanner";
import { sendScanSummaryAlert } from "@/lib/email";
import { calculateEstimatedLoss } from "@/lib/revenue-estimator";

/**
 * Cron endpoint to scan all users' links
 * Called weekly by Vercel Cron
 *
 * Protected by CRON_SECRET
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all active users (paid tiers or active trial)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { tier: { in: ["SPECIALIST", "OPERATOR"] } },
          {
            tier: "TRIAL",
            trialEndsAt: { gt: new Date() },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        ctrPercent: true,
        conversionPercent: true,
        avgOrderValue: true,
      },
    });

    const results = [];

    for (const user of users) {
      try {
        // Scan user's links (stale = older than 7 days)
        const { checked, issues } = await scanUserLinks(user.id, 7);

        // Get updated stats
        const stats = await getScanStats(user.id);

        // Calculate estimated loss
        const brokenLinks = await prisma.affiliateLink.findMany({
          where: {
            video: { userId: user.id },
            status: { in: ["NOT_FOUND", "OOS"] },
          },
          select: {
            video: { select: { viewCount: true } },
          },
        });

        const totalEstimatedLoss = brokenLinks.reduce((sum: number, link: { video: { viewCount: number } }) => {
          return (
            sum +
            calculateEstimatedLoss(link.video.viewCount, {
              ctrPercent: user.ctrPercent ?? 2.0,
              conversionPercent: user.conversionPercent ?? 3.0,
              avgOrderValue: user.avgOrderValue ?? 45.0,
            })
          );
        }, 0);

        // Send email summary if there are issues
        if (issues > 0 && user.email) {
          await sendScanSummaryAlert({
            userEmail: user.email,
            userName: user.name || "",
            totalScanned: checked,
            issuesFound: issues,
            totalEstimatedLoss,
          });
        }

        results.push({
          userId: user.id,
          checked,
          issues,
          success: true,
        });
      } catch (error) {
        console.error(`Error scanning user ${user.id}:`, error);
        results.push({
          userId: user.id,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      usersProcessed: users.length,
      results,
    });
  } catch (error) {
    console.error("Cron scan error:", error);
    return NextResponse.json(
      { error: "Cron scan failed" },
      { status: 500 }
    );
  }
}
