import { prisma } from "./db";
import { UserTier } from "@prisma/client";

/**
 * Get display name for a tier
 */
export function getTierDisplayName(tier: UserTier | string): string {
  const tierStr = String(tier);
  switch (tierStr) {
    case "TRIAL":
      return "Trial";
    case "AUDITOR":
      return "Free";
    case "SPECIALIST":
      return "Specialist";
    case "OPERATOR":
      return "Operator";
    default:
      return tierStr;
  }
}

/**
 * Check if tier is a paid tier
 */
export function isPaidTier(tier: UserTier | string): boolean {
  const tierStr = String(tier);
  return tierStr === "SPECIALIST" || tierStr === "OPERATOR";
}

/**
 * Get tier badge color classes
 */
export function getTierBadgeColors(tier: UserTier | string): string {
  const tierStr = String(tier);
  switch (tierStr) {
    case "SPECIALIST":
    case "OPERATOR":
      return "bg-profit-green/20 border-profit-green/50 text-profit-green";
    case "TRIAL":
      return "bg-orange-500/20 border-orange-500/50 text-orange-400";
    case "AUDITOR":
    default:
      return "bg-yt-light/20 border-yt-light/50 text-yt-light";
  }
}

// Feature flags for each tier
export const TIER_FEATURES = {
  // TRIAL: Brand new users who haven't scanned yet
  TRIAL: {
    maxVideos: 15,
    aiSuggestions: false,
    csvExport: false,
    monitoring: false,
    resync: false,
    fullHistory: false,
    emailAlerts: false,
  },
  // AUDITOR: Completed free scan OR cancelled paid plan
  AUDITOR: {
    maxVideos: 15,
    aiSuggestions: false,
    csvExport: false,
    monitoring: false,
    resync: false,
    fullHistory: false,
    emailAlerts: false,
  },
  // SPECIALIST: Paying $19/mo
  SPECIALIST: {
    maxVideos: 100,
    aiSuggestions: true,
    csvExport: true,
    monitoring: true,
    resync: true,
    fullHistory: true,
    emailAlerts: true,
  },
  // OPERATOR: Paying $29/mo (future)
  OPERATOR: {
    maxVideos: 500,
    maxChannels: 5,
    aiSuggestions: true,
    csvExport: true,
    monitoring: true,
    resync: true,
    fullHistory: true,
    emailAlerts: true,
    prioritySupport: true,
  },
} as const;

export type FeatureKey = keyof typeof TIER_FEATURES.TRIAL;

export interface TierCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  currentTier?: UserTier;
  limit?: number;
  current?: number;
}

/**
 * Check if a user has access to a specific feature based on their tier
 */
export async function checkTierLimits(
  userId: string,
  feature: FeatureKey
): Promise<TierCheckResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tier: true,
      videoScanLimit: true,
      _count: {
        select: { videos: true },
      },
    },
  });

  if (!user) {
    return {
      allowed: false,
      reason: "User not found",
    };
  }

  const tierFeatures = TIER_FEATURES[user.tier];

  // Special handling for video limit checks
  if (feature === "maxVideos") {
    const currentVideoCount = user._count.videos;
    const maxAllowed = user.videoScanLimit || tierFeatures.maxVideos;

    return {
      allowed: currentVideoCount < maxAllowed,
      reason:
        currentVideoCount >= maxAllowed
          ? `Video limit reached (${currentVideoCount}/${maxAllowed})`
          : undefined,
      upgradeRequired: currentVideoCount >= maxAllowed,
      currentTier: user.tier,
      limit: maxAllowed,
      current: currentVideoCount,
    };
  }

  // Boolean feature checks
  const hasAccess = tierFeatures[feature];

  if (typeof hasAccess === "boolean") {
    return {
      allowed: hasAccess,
      reason: !hasAccess ? `${feature} requires a paid plan` : undefined,
      upgradeRequired: !hasAccess,
      currentTier: user.tier,
    };
  }

  return {
    allowed: true,
    currentTier: user.tier,
  };
}

/**
 * Get all tier features for a user
 */
export async function getUserTierFeatures(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tier: true,
      videoScanLimit: true,
      monitoringEnabled: true,
      alertsEnabled: true,
      _count: {
        select: { videos: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  const tierFeatures = TIER_FEATURES[user.tier];

  return {
    tier: user.tier,
    features: tierFeatures,
    videoCount: user._count.videos,
    videoLimit: user.videoScanLimit || tierFeatures.maxVideos,
    monitoringEnabled: user.monitoringEnabled,
    alertsEnabled: user.alertsEnabled,
  };
}

/**
 * Check if user can scan more videos
 */
export async function canScanMoreVideos(userId: string): Promise<TierCheckResult> {
  return checkTierLimits(userId, "maxVideos");
}

/**
 * Get remaining video slots for a user
 */
export async function getRemainingVideoSlots(userId: string): Promise<number> {
  const result = await checkTierLimits(userId, "maxVideos");
  if (result.limit && result.current !== undefined) {
    return Math.max(0, result.limit - result.current);
  }
  return 0;
}

/**
 * Quick check if user is on a paid tier
 */
export async function isPaidUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true },
  });

  return user?.tier !== "TRIAL" && user?.tier !== "AUDITOR";
}

/**
 * Get upgrade prompt message based on feature
 */
export function getUpgradeMessage(feature: FeatureKey): string {
  const messages: Record<FeatureKey, string> = {
    maxVideos: "Upgrade to scan more videos and unlock full channel monitoring",
    aiSuggestions: "Upgrade to get AI-powered replacement suggestions for broken links",
    csvExport: "Upgrade to export your correction sheet as CSV",
    monitoring: "Upgrade to enable weekly scans for your links",
    resync: "Upgrade to rescan your channel for new videos",
    fullHistory: "Upgrade to access your complete fix history",
    emailAlerts: "Upgrade to receive weekly revenue alerts via email",
  };

  return messages[feature];
}
