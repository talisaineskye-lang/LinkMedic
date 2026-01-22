import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auditLinks } from "@/lib/link-audit-engine";
import { LinkStatus } from "@prisma/client";

/**
 * Link Guard Cron Job
 * Daily monitoring for paid users with monitoring enabled
 * Tracks status changes and creates history entries
 *
 * Called daily by Vercel Cron
 * Protected by CRON_SECRET
 */

const LINKS_PER_USER = 100; // Max links to check per user per day

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Link Guard] Starting daily monitoring...");

  try {
    // Get all paid users with monitoring enabled
    const usersWithMonitoring = await prisma.user.findMany({
      where: {
        monitoringEnabled: true,
        tier: { in: ["SPECIALIST", "PORTFOLIO"] },
      },
      select: {
        id: true,
        email: true,
        name: true,
        alertsEnabled: true,
      },
    });

    console.log(`[Link Guard] Found ${usersWithMonitoring.length} users with monitoring enabled`);

    const results: Array<{
      userId: string;
      linksChecked: number;
      statusChanges: number;
      success: boolean;
      error?: string;
    }> = [];

    for (const user of usersWithMonitoring) {
      try {
        // Get all affiliate links for this user
        const links = await prisma.affiliateLink.findMany({
          where: {
            video: { userId: user.id },
            // Only check links that haven't been checked in the last 20 hours
            OR: [
              { lastCheckedAt: null },
              { lastCheckedAt: { lt: new Date(Date.now() - 20 * 60 * 60 * 1000) } },
            ],
          },
          select: {
            id: true,
            originalUrl: true,
            status: true,
          },
          take: LINKS_PER_USER,
        });

        console.log(`[Link Guard] Checking ${links.length} links for user ${user.id}`);

        if (links.length === 0) {
          results.push({
            userId: user.id,
            linksChecked: 0,
            statusChanges: 0,
            success: true,
          });
          continue;
        }

        // Use the batch audit function
        const urls = links.map((l) => l.originalUrl);
        const auditResults = await auditLinks({ urls });

        let statusChanges = 0;

        // Process results and update database
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          const auditResult = auditResults[i];

          if (!auditResult) continue;

          const newStatus = auditResult.status;
          const previousStatus = link.status;

          // Update link with new status
          await prisma.affiliateLink.update({
            where: { id: link.id },
            data: {
              status: newStatus,
              previousStatus: previousStatus !== newStatus ? previousStatus : undefined,
              lastCheckedAt: new Date(),
            },
          });

          // If status changed, record in history
          if (previousStatus !== newStatus) {
            statusChanges++;

            await prisma.linkStatusHistory.create({
              data: {
                affiliateLinkId: link.id,
                status: newStatus,
                httpCode: auditResult.httpStatus,
              },
            });

            console.log(
              `[Link Guard] Status change for ${link.id}: ${previousStatus} -> ${newStatus}`
            );
          }
        }

        results.push({
          userId: user.id,
          linksChecked: links.length,
          statusChanges,
          success: true,
        });

        // If user has alerts enabled and there were status changes, we could send an email
        // This is handled separately by the weekly email alert cron
        if (statusChanges > 0 && user.alertsEnabled) {
          console.log(
            `[Link Guard] ${statusChanges} status changes for user ${user.id} - will be included in weekly alert`
          );
        }
      } catch (userError) {
        console.error(`[Link Guard] Error processing user ${user.id}:`, userError);
        results.push({
          userId: user.id,
          linksChecked: 0,
          statusChanges: 0,
          success: false,
          error: userError instanceof Error ? userError.message : "Unknown error",
        });
      }
    }

    const totalLinksChecked = results.reduce((sum, r) => sum + r.linksChecked, 0);
    const totalStatusChanges = results.reduce((sum, r) => sum + r.statusChanges, 0);

    console.log(
      `[Link Guard] Complete. Checked ${totalLinksChecked} links, found ${totalStatusChanges} status changes`
    );

    return NextResponse.json({
      success: true,
      usersProcessed: usersWithMonitoring.length,
      totalLinksChecked,
      totalStatusChanges,
      results,
    });
  } catch (error) {
    console.error("[Link Guard] Cron error:", error);
    return NextResponse.json(
      { error: "Link Guard cron failed" },
      { status: 500 }
    );
  }
}
