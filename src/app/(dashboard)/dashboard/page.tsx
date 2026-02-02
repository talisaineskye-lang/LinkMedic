import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard-client";
import { calculateRevenueImpact, DEFAULT_SETTINGS } from "@/lib/revenue-estimator";
import { LinkStatus, UserTier, DisclosureStatus } from "@prisma/client";
import { TIER_FEATURES } from "@/lib/tier-limits";

// All statuses that indicate a broken/problematic link
const PROBLEM_STATUSES: LinkStatus[] = [
  LinkStatus.NOT_FOUND,
  LinkStatus.OOS,
  LinkStatus.OOS_THIRD_PARTY,
  LinkStatus.SEARCH_REDIRECT,
  LinkStatus.MISSING_TAG,
];

// Inactive channel detection thresholds
const INACTIVE_CHANNEL_THRESHOLDS = {
  minTotalViews: 1000,        // Minimum total views across all videos
  minRecentViews: 100,        // Minimum views on videos published in last 30 days
  recentDays: 30,             // Days to consider for "recent" activity
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // Compute timestamp once at the start (safe in Server Components)
  // eslint-disable-next-line react-hooks/purity
  const currentTime = Date.now();

  // Get user settings for revenue estimation + tier info + scan timestamps
  // Note: Using type assertion for new scan timestamp fields until prisma db push
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  }) as {
    ctrPercent: number;
    conversionPercent: number;
    avgOrderValue: number;
    tier: UserTier;
    videoScanLimit: number;
    activeChannelId: string | null;
    hasCompletedFirstScan: boolean;
    lastQuickScan: Date | null;
    lastFullScan: Date | null;
  } | null;

  // Filter by active channel if set (multi-channel support)
  // Also fix any orphaned videos with null channelId
  if (user?.activeChannelId) {
    await prisma.video.updateMany({
      where: { userId: session.user.id, channelId: null },
      data: { channelId: user.activeChannelId },
    });
  }

  const channelFilter = user?.activeChannelId
    ? { channelId: user.activeChannelId }
    : {};

  const revenueSettings = {
    ctrPercent: user?.ctrPercent ?? DEFAULT_SETTINGS.ctrPercent,
    conversionPercent: user?.conversionPercent ?? DEFAULT_SETTINGS.conversionPercent,
    avgOrderValue: user?.avgOrderValue ?? DEFAULT_SETTINGS.avgOrderValue,
  };

  // Get all links with video data (filtered by active channel if set)
  const rawLinks = await prisma.affiliateLink.findMany({
    where: { video: { userId: session.user.id, ...channelFilter } },
    select: {
      id: true,
      originalUrl: true,
      status: true,
      lastCheckedAt: true,
      isFixed: true,
      video: {
        select: {
          id: true,
          title: true,
          viewCount: true,
          publishedAt: true,
        },
      },
    },
  });

  // Calculate stats
  const totalLinks = rawLinks.length;
  const healthyLinks = rawLinks.filter(l => l.status === "OK").length;

  // Get broken links (unfixed only)
  const brokenLinks = rawLinks.filter(
    l => PROBLEM_STATUSES.includes(l.status) && !l.isFixed
  );
  const brokenCount = brokenLinks.length;

  // Calculate monthly loss from broken links
  const monthlyLoss = Math.round(brokenLinks.reduce((sum, link) => {
    const videoAgeMonths = link.video.publishedAt
      ? Math.max((currentTime - new Date(link.video.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30), 1)
      : 12;
    return sum + calculateRevenueImpact(
      link.video.viewCount,
      link.status,
      revenueSettings,
      videoAgeMonths
    );
  }, 0));

  const healthScore = totalLinks > 0
    ? Math.round((healthyLinks / totalLinks) * 100)
    : 100;

  // Get the most recent scan date
  const lastScanDate = rawLinks.reduce<Date | null>((latest, link) => {
    if (!link.lastCheckedAt) return latest;
    if (!latest) return link.lastCheckedAt;
    return link.lastCheckedAt > latest ? link.lastCheckedAt : latest;
  }, null);

  // Get fixed links for revenue recovery tracking (filtered by active channel)
  const fixedLinks = await prisma.affiliateLink.findMany({
    where: {
      video: { userId: session.user.id, ...channelFilter },
      isFixed: true,
    },
    select: {
      id: true,
      status: true,
      dateFixed: true,
      video: {
        select: {
          viewCount: true,
          publishedAt: true,
        },
      },
    },
  });

  // Calculate recovered revenue from fixed links
  const recoveredMonthly = Math.round(fixedLinks.reduce((sum, link) => {
    const videoAgeMonths = link.video.publishedAt
      ? Math.max((currentTime - new Date(link.video.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30), 1)
      : 12;
    return sum + calculateRevenueImpact(
      link.video.viewCount,
      link.status,
      revenueSettings,
      videoAgeMonths
    );
  }, 0));

  // Get video count for tier limit tracking (filtered by active channel)
  const videoCount = await prisma.video.count({
    where: { userId: session.user.id, ...channelFilter },
  });

  // Get disclosure issues count (videos with affiliate links but missing/weak disclosure)
  const disclosureIssues = await prisma.video.count({
    where: {
      userId: session.user.id,
      ...channelFilter,
      hasAffiliateLinks: true,
      disclosureStatus: {
        in: [DisclosureStatus.MISSING, DisclosureStatus.WEAK],
      },
    },
  });

  // Detect inactive channel
  // A channel is considered inactive if it has very low total views
  const totalViews = rawLinks.reduce((sum, link) => sum + (link.video.viewCount || 0), 0);
  const thirtyDaysAgo = new Date(currentTime - INACTIVE_CHANNEL_THRESHOLDS.recentDays * 24 * 60 * 60 * 1000);

  // Get views from recent videos (published in last 30 days)
  const recentVideoViews = rawLinks
    .filter(link => link.video.publishedAt && new Date(link.video.publishedAt) > thirtyDaysAgo)
    .reduce((sum, link) => sum + (link.video.viewCount || 0), 0);

  // Channel is inactive if total views are below threshold OR recent activity is very low
  const isInactiveChannel = totalLinks > 0 && (
    totalViews < INACTIVE_CHANNEL_THRESHOLDS.minTotalViews ||
    (recentVideoViews < INACTIVE_CHANNEL_THRESHOLDS.minRecentViews && monthlyLoss === 0)
  );

  // Tier info
  const tier = user?.tier ?? UserTier.AUDITOR;
  const tierFeatures = TIER_FEATURES[tier];
  const videoLimit = user?.videoScanLimit ?? tierFeatures.maxVideos;

  const stats = {
    totalLinks,
    healthyLinks,
    brokenLinks: brokenCount,
    healthScore,
    monthlyLoss,
    annualLoss: monthlyLoss * 12,
    disclosureIssues,
  };

  const isFirstScan = videoCount === 0;

  // Calculate scan eligibility
  const QUICK_SCAN_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
  const FULL_SCAN_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  const now = currentTime;

  const quickCooldownEnds = user?.lastQuickScan
    ? new Date(user.lastQuickScan.getTime() + QUICK_SCAN_COOLDOWN_MS)
    : null;
  const fullCooldownEnds = user?.lastFullScan
    ? new Date(user.lastFullScan.getTime() + FULL_SCAN_COOLDOWN_MS)
    : null;

  const scanEligibility = {
    isFirstScan: !user?.hasCompletedFirstScan,
    quickScanAvailable: !quickCooldownEnds || quickCooldownEnds.getTime() <= now,
    fullScanAvailable: !fullCooldownEnds || fullCooldownEnds.getTime() <= now,
    quickScanCooldownEnds: quickCooldownEnds && quickCooldownEnds.getTime() > now
      ? quickCooldownEnds.toISOString()
      : null,
    fullScanCooldownEnds: fullCooldownEnds && fullCooldownEnds.getTime() > now
      ? fullCooldownEnds.toISOString()
      : null,
    lastQuickScan: user?.lastQuickScan?.toISOString() || null,
    lastFullScan: user?.lastFullScan?.toISOString() || null,
  };

  const tierInfo = {
    tier,
    videoCount,
    videoLimit,
    canResync: tierFeatures.resync || isFirstScan, // Allow first scan for free users
    canExportCSV: tierFeatures.csvExport,
    canUseAI: tierFeatures.aiSuggestions,
  };

  const recoveryStats = {
    linksFixed: fixedLinks.length,
    monthlyRecovered: recoveredMonthly,
    annualRecovered: recoveredMonthly * 12,
  };

  return (
    <DashboardClient
      stats={stats}
      lastScanDate={lastScanDate}
      tierInfo={tierInfo}
      recoveryStats={recoveryStats}
      isInactiveChannel={isInactiveChannel}
      scanEligibility={scanEligibility}
    />
  );
}
