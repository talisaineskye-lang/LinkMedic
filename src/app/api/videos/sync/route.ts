import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { syncUserVideos, ScanType } from "@/lib/youtube";
import { extractLinksForUser } from "@/lib/scanner";
import { checkTierLimits, getUpgradeMessage, getMaxChannels } from "@/lib/tier-limits";
import { sendScanCompleteEmail } from "@/lib/email";
import { calculateRevenueImpact, DEFAULT_SETTINGS } from "@/lib/revenue-estimator";
import { LinkStatus } from "@prisma/client";

// Cooldown periods in milliseconds
const QUICK_SCAN_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const FULL_SCAN_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Check if a scan type is available based on cooldown periods
 */
function getScanEligibility(
  lastQuickScan: Date | null,
  lastFullScan: Date | null
): {
  quickScanAvailable: boolean;
  fullScanAvailable: boolean;
  quickScanCooldownEnds: Date | null;
  fullScanCooldownEnds: Date | null;
} {
  const now = Date.now();

  const quickCooldownEnds = lastQuickScan
    ? new Date(lastQuickScan.getTime() + QUICK_SCAN_COOLDOWN_MS)
    : null;
  const fullCooldownEnds = lastFullScan
    ? new Date(lastFullScan.getTime() + FULL_SCAN_COOLDOWN_MS)
    : null;

  return {
    quickScanAvailable: !quickCooldownEnds || quickCooldownEnds.getTime() <= now,
    fullScanAvailable: !fullCooldownEnds || fullCooldownEnds.getTime() <= now,
    quickScanCooldownEnds: quickCooldownEnds && quickCooldownEnds.getTime() > now ? quickCooldownEnds : null,
    fullScanCooldownEnds: fullCooldownEnds && fullCooldownEnds.getTime() > now ? fullCooldownEnds : null,
  };
}

// Statuses that indicate a broken/problematic link
const PROBLEM_STATUSES: LinkStatus[] = [
  LinkStatus.NOT_FOUND,
  LinkStatus.OOS,
  LinkStatus.OOS_THIRD_PARTY,
  LinkStatus.SEARCH_REDIRECT,
  LinkStatus.MISSING_TAG,
];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body for channelId and scanType
    let channelId: string | undefined;
    let scanType: ScanType = "full"; // Default to full scan
    try {
      const body = await request.json();
      channelId = body.channelId;
      if (body.scanType === "quick" || body.scanType === "full") {
        scanType = body.scanType;
      }
    } catch {
      // No body or invalid JSON is fine - we'll use defaults
    }

    // If a specific channel is requested, check if it's within the user's tier limit
    if (channelId) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { tier: true },
      });

      if (user) {
        const channelLimit = getMaxChannels(user.tier);

        // Get all user's channels ordered by creation date
        const userChannels = await (prisma as any).channel.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });

        // Find the position of the requested channel
        const channelIndex = userChannels.findIndex((c: { id: string }) => c.id === channelId);

        // If the channel is beyond the limit, block the sync
        if (channelIndex >= channelLimit) {
          return NextResponse.json({
            error: "Channel over limit",
            message: "This channel exceeds your plan's limit. Upgrade to Operator to sync additional channels.",
            upgradeRequired: true,
            currentTier: user.tier,
          }, { status: 403 });
        }
      }
    }

    // Check if user has ever synced before
    const existingVideos = await prisma.video.count({
      where: { userId: session.user.id },
    });
    const isFirstScan = existingVideos === 0;

    // Get user data for eligibility check
    // Note: Using type assertion for new fields until prisma db push regenerates types
    const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
    }) as { tier: string; lastQuickScan: Date | null; lastFullScan: Date | null } | null;

    // Check scan eligibility based on cooldowns (skip for first scan)
    if (!isFirstScan && userData) {
      const eligibility = getScanEligibility(
        userData.lastQuickScan,
        userData.lastFullScan
      );

      if (scanType === "quick" && !eligibility.quickScanAvailable) {
        return NextResponse.json({
          error: "Quick scan on cooldown",
          message: `Quick scan is available again ${eligibility.quickScanCooldownEnds?.toLocaleDateString()} at ${eligibility.quickScanCooldownEnds?.toLocaleTimeString()}`,
          cooldownEnds: eligibility.quickScanCooldownEnds?.toISOString(),
          scanType: "quick",
        }, { status: 429 });
      }

      if (scanType === "full" && !eligibility.fullScanAvailable) {
        return NextResponse.json({
          error: "Full scan on cooldown",
          message: `Full scan is available again on ${eligibility.fullScanCooldownEnds?.toLocaleDateString()}`,
          cooldownEnds: eligibility.fullScanCooldownEnds?.toISOString(),
          scanType: "full",
        }, { status: 429 });
      }
    }

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

    // Sync videos from YouTube (optionally for a specific channel)
    const { synced, total, channelId: syncedChannelId } = await syncUserVideos(
      session.user.id,
      channelId,
      scanType
    );

    // Update scan timestamps based on scan type
    const timestampUpdate = scanType === "quick"
      ? { lastQuickScan: new Date() }
      : { lastFullScan: new Date() };

    await (prisma.user.update as Function)({
      where: { id: session.user.id },
      data: timestampUpdate,
    });

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
      // Channel that was synced (if using multi-channel)
      channelId: syncedChannelId,
      // Scan type that was performed
      scanType,
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

/**
 * GET /api/videos/sync - Check scan eligibility status
 * Returns cooldown information for both quick and full scans
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user scan timestamps
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    }) as { lastQuickScan: Date | null; lastFullScan: Date | null; hasCompletedFirstScan: boolean } | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // First-time users can always scan
    if (!user.hasCompletedFirstScan) {
      return NextResponse.json({
        isFirstScan: true,
        quickScanAvailable: true,
        fullScanAvailable: true,
        quickScanCooldownEnds: null,
        fullScanCooldownEnds: null,
      });
    }

    const eligibility = getScanEligibility(
      user.lastQuickScan,
      user.lastFullScan
    );

    return NextResponse.json({
      isFirstScan: false,
      quickScanAvailable: eligibility.quickScanAvailable,
      fullScanAvailable: eligibility.fullScanAvailable,
      quickScanCooldownEnds: eligibility.quickScanCooldownEnds?.toISOString() || null,
      fullScanCooldownEnds: eligibility.fullScanCooldownEnds?.toISOString() || null,
      lastQuickScan: user.lastQuickScan?.toISOString() || null,
      lastFullScan: user.lastFullScan?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error checking scan eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check scan eligibility" },
      { status: 500 }
    );
  }
}
