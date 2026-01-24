import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyDigestEmail } from "@/lib/email";
import { calculateRevenueImpact, DEFAULT_SETTINGS } from "@/lib/revenue-estimator";

/**
 * Weekly Digest Cron Job
 * Sends weekly email digest to paid users with monitoring enabled
 * Summarizes new broken links and out-of-stock items
 *
 * Called weekly by Vercel Cron (Mondays at 9am UTC)
 * Protected by CRON_SECRET
 */

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Weekly Digest] Starting weekly email digest...");

  try {
    // Get all paid users with alerts enabled
    const paidUsers = await prisma.user.findMany({
      where: {
        tier: { in: ["SPECIALIST", "PORTFOLIO"] },
        alertsEnabled: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`[Weekly Digest] Processing ${paidUsers.length} users`);

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const results: Array<{
      userId: string;
      email: string;
      sent: boolean;
      totalIssues: number;
      error?: string;
    }> = [];

    for (const user of paidUsers) {
      try {
        if (!user.email) continue;

        // Get new broken links from the past week
        const newBrokenLinks = await prisma.affiliateLink.findMany({
          where: {
            video: { userId: user.id },
            status: "NOT_FOUND",
            updatedAt: { gte: oneWeekAgo },
          },
          select: {
            video: { select: { viewCount: true } },
          },
        });

        // Get new out of stock links from the past week
        const newOutOfStockLinks = await prisma.affiliateLink.findMany({
          where: {
            video: { userId: user.id },
            status: { in: ["OOS", "OOS_THIRD_PARTY"] },
            updatedAt: { gte: oneWeekAgo },
          },
          select: {
            video: { select: { viewCount: true } },
          },
        });

        const newBrokenCount = newBrokenLinks.length;
        const newOutOfStockCount = newOutOfStockLinks.length;
        const totalIssues = newBrokenCount + newOutOfStockCount;

        // Calculate monthly impact from new issues
        const allNewIssues = [...newBrokenLinks, ...newOutOfStockLinks];
        const monthlyImpact = Math.round(
          allNewIssues.reduce((sum, link) => {
            return sum + calculateRevenueImpact(
              link.video.viewCount,
              "NOT_FOUND",
              DEFAULT_SETTINGS
            );
          }, 0)
        );

        // Use user's name for channel reference (or default)
        const channelName = user.name ? `${user.name}'s Channel` : "Your Channel";

        // Send the digest email
        await sendWeeklyDigestEmail(
          user.email,
          user.name || "there",
          channelName,
          {
            newBrokenLinks: newBrokenCount,
            newOutOfStock: newOutOfStockCount,
            totalIssues,
            monthlyImpact,
          }
        );

        console.log(`[Weekly Digest] Email sent to ${user.email} (${totalIssues} issues)`);

        results.push({
          userId: user.id,
          email: user.email,
          sent: true,
          totalIssues,
        });

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (userError) {
        console.error(`[Weekly Digest] Failed to process user ${user.id}:`, userError);
        results.push({
          userId: user.id,
          email: user.email || "unknown",
          sent: false,
          totalIssues: 0,
          error: userError instanceof Error ? userError.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.sent).length;
    const failCount = results.filter((r) => !r.sent).length;

    console.log(
      `[Weekly Digest] Complete. Sent ${successCount} emails, ${failCount} failed`
    );

    return NextResponse.json({
      success: true,
      processed: paidUsers.length,
      sent: successCount,
      failed: failCount,
      results,
    });
  } catch (error) {
    console.error("[Weekly Digest] Cron error:", error);
    return NextResponse.json(
      { error: "Weekly digest cron failed" },
      { status: 500 }
    );
  }
}
