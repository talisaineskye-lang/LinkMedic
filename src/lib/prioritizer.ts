import { calculateRevenueImpact, RevenueSettings, DEFAULT_SETTINGS } from "./revenue-estimator";

export type LinkStatus = "OK" | "OOS" | "NOT_FOUND" | "REDIRECT" | "MISSING_TAG" | "UNKNOWN";

/**
 * Represents an issue (broken or OOS link) for prioritization
 */
export interface Issue {
  id: string;
  videoId: string;
  videoTitle: string;
  videoViewCount: number;
  videoAgeMonths?: number;
  url: string;
  status: LinkStatus;
  merchant: string;
  lastCheckedAt: Date | null;
  estimatedLoss: number;
  // Fix tracking fields
  suggestedLink: string | null;
  isFixed: boolean;
  dateFixed: Date | null;
}

/**
 * Raw link data from database
 */
export interface RawLinkData {
  id: string;
  originalUrl: string;
  status: LinkStatus;
  merchant: string;
  lastCheckedAt: Date | null;
  suggestedLink: string | null;
  isFixed: boolean;
  dateFixed: Date | null;
  video: {
    id: string;
    title: string;
    viewCount: number;
    publishedAt?: Date;
  };
}

/**
 * Calculate video age in months from publish date
 */
function getVideoAgeMonths(publishedAt?: Date): number {
  if (!publishedAt) return 12; // Default to 12 months if unknown
  const now = new Date();
  const diffMs = now.getTime() - publishedAt.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);
  return Math.max(diffMonths, 1); // Minimum 1 month
}

/**
 * Converts raw link data to an Issue with calculated estimated loss
 * Now uses status-aware revenue calculation with decay function
 */
export function toIssue(link: RawLinkData, settings: RevenueSettings = DEFAULT_SETTINGS): Issue {
  const videoAgeMonths = getVideoAgeMonths(link.video.publishedAt);

  return {
    id: link.id,
    videoId: link.video.id,
    videoTitle: link.video.title,
    videoViewCount: link.video.viewCount,
    videoAgeMonths,
    url: link.originalUrl,
    status: link.status,
    merchant: link.merchant,
    lastCheckedAt: link.lastCheckedAt,
    // Use new formula with status awareness and decay
    estimatedLoss: calculateRevenueImpact(
      link.video.viewCount,
      link.status,
      settings,
      videoAgeMonths
    ),
    suggestedLink: link.suggestedLink,
    isFixed: link.isFixed,
    dateFixed: link.dateFixed,
  };
}

/**
 * Filters links to only include broken/OOS issues (excludes fixed issues by default)
 */
export function filterIssues(links: RawLinkData[], includeFixed: boolean = false): RawLinkData[] {
  return links.filter(link =>
    (link.status === "NOT_FOUND" || link.status === "OOS") &&
    (includeFixed || !link.isFixed)
  );
}

/**
 * Sorts issues by priority:
 * 1. Estimated revenue impact (highest first)
 * 2. Video views (highest first)
 * 3. Status severity (NOT_FOUND > OOS > UNKNOWN)
 */
export function sortByPriority(issues: Issue[]): Issue[] {
  return [...issues].sort((a, b) => {
    // First, sort by estimated loss (descending)
    if (a.estimatedLoss !== b.estimatedLoss) {
      return b.estimatedLoss - a.estimatedLoss;
    }

    // Then by view count (descending)
    if (a.videoViewCount !== b.videoViewCount) {
      return b.videoViewCount - a.videoViewCount;
    }

    // Finally by status severity
    const statusPriority: Record<LinkStatus, number> = {
      MISSING_TAG: 4,  // Highest priority - link works but no credit
      NOT_FOUND: 3,
      OOS: 2,
      UNKNOWN: 1,
      REDIRECT: 0,
      OK: -1,
    };
    return statusPriority[b.status] - statusPriority[a.status];
  });
}

/**
 * Gets the top N issues (Fix First list)
 */
export function getFixFirst(
  links: RawLinkData[],
  settings: RevenueSettings = DEFAULT_SETTINGS,
  limit: number = 5
): Issue[] {
  const issues = filterIssues(links).map(link => toIssue(link, settings));
  const sorted = sortByPriority(issues);
  return sorted.slice(0, limit);
}

/**
 * Gets all issues sorted by priority
 */
export function getAllIssues(
  links: RawLinkData[],
  settings: RevenueSettings = DEFAULT_SETTINGS
): Issue[] {
  const issues = filterIssues(links).map(link => toIssue(link, settings));
  return sortByPriority(issues);
}

/**
 * Groups issues by video
 */
export function groupByVideo(issues: Issue[]): Map<string, Issue[]> {
  const grouped = new Map<string, Issue[]>();

  for (const issue of issues) {
    const existing = grouped.get(issue.videoId) || [];
    existing.push(issue);
    grouped.set(issue.videoId, existing);
  }

  return grouped;
}

/**
 * Calculates summary statistics for issues
 */
export function getIssueStats(issues: Issue[]): {
  total: number;
  broken: number;
  outOfStock: number;
  totalEstimatedLoss: number;
  affectedVideos: number;
} {
  const videoIds = new Set(issues.map(i => i.videoId));

  return {
    total: issues.length,
    broken: issues.filter(i => i.status === "NOT_FOUND").length,
    outOfStock: issues.filter(i => i.status === "OOS").length,
    totalEstimatedLoss: Math.round(
      issues.reduce((sum, i) => sum + i.estimatedLoss, 0) * 100
    ) / 100,
    affectedVideos: videoIds.size,
  };
}
