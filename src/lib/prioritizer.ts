import { calculateRevenueImpact, RevenueSettings, DEFAULT_SETTINGS } from "./revenue-estimator";

export type LinkStatus = "OK" | "OOS" | "OOS_THIRD_PARTY" | "NOT_FOUND" | "SEARCH_REDIRECT" | "REDIRECT" | "MISSING_TAG" | "UNKNOWN";

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
  suggestedTitle: string | null;
  suggestedAsin: string | null;
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
  suggestedTitle: string | null;
  suggestedAsin: string | null;
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
    suggestedTitle: link.suggestedTitle,
    suggestedAsin: link.suggestedAsin,
    isFixed: link.isFixed,
    dateFixed: link.dateFixed,
  };
}

/**
 * Filters links to only include broken/OOS issues (excludes fixed issues by default)
 * Includes all problematic statuses: NOT_FOUND, OOS, OOS_THIRD_PARTY, SEARCH_REDIRECT, MISSING_TAG
 */
export function filterIssues(links: RawLinkData[], includeFixed: boolean = false): RawLinkData[] {
  const PROBLEM_STATUSES: LinkStatus[] = [
    "NOT_FOUND",
    "OOS",
    "OOS_THIRD_PARTY",
    "SEARCH_REDIRECT",
    "MISSING_TAG",
  ];

  return links.filter(link =>
    PROBLEM_STATUSES.includes(link.status) &&
    (includeFixed || !link.isFixed)
  );
}

/**
 * Sorts issues by priority:
 * 1. Estimated revenue impact (highest first)
 * 2. Video views (highest first)
 * 3. Status severity (MISSING_TAG > NOT_FOUND > SEARCH_REDIRECT > OOS > OOS_THIRD_PARTY)
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

    // Finally by status severity (higher = more severe = fix first)
    const statusPriority: Record<LinkStatus, number> = {
      MISSING_TAG: 6,       // Highest - link works but no credit (100% loss)
      NOT_FOUND: 5,         // Dead link / dog page (100% loss)
      SEARCH_REDIRECT: 4,   // Product gone, redirected to search (100% loss)
      OOS: 3,               // Out of stock (partial loss)
      OOS_THIRD_PARTY: 2,   // Third party only (lower loss)
      REDIRECT: 1,          // Generic redirect
      UNKNOWN: 0,           // Unknown status
      OK: -1,               // Healthy - shouldn't appear in issues
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
  searchRedirects: number;
  missingTags: number;
  totalEstimatedLoss: number;
  affectedVideos: number;
} {
  const videoIds = new Set(issues.map(i => i.videoId));

  return {
    total: issues.length,
    broken: issues.filter(i => i.status === "NOT_FOUND").length,
    outOfStock: issues.filter(i => i.status === "OOS" || i.status === "OOS_THIRD_PARTY").length,
    searchRedirects: issues.filter(i => i.status === "SEARCH_REDIRECT").length,
    missingTags: issues.filter(i => i.status === "MISSING_TAG").length,
    totalEstimatedLoss: Math.round(
      issues.reduce((sum, i) => sum + i.estimatedLoss, 0) * 100
    ) / 100,
    affectedVideos: videoIds.size,
  };
}
