import { LinkStatus } from "@prisma/client";
import { calculateEstimatedLoss, RevenueSettings, DEFAULT_SETTINGS } from "./revenue-estimator";

/**
 * Represents an issue (broken or OOS link) for prioritization
 */
export interface Issue {
  id: string;
  videoId: string;
  videoTitle: string;
  videoViewCount: number;
  url: string;
  status: LinkStatus;
  merchant: string;
  lastCheckedAt: Date | null;
  estimatedLoss: number;
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
  video: {
    id: string;
    title: string;
    viewCount: number;
  };
}

/**
 * Converts raw link data to an Issue with calculated estimated loss
 */
export function toIssue(link: RawLinkData, settings: RevenueSettings = DEFAULT_SETTINGS): Issue {
  return {
    id: link.id,
    videoId: link.video.id,
    videoTitle: link.video.title,
    videoViewCount: link.video.viewCount,
    url: link.originalUrl,
    status: link.status,
    merchant: link.merchant,
    lastCheckedAt: link.lastCheckedAt,
    estimatedLoss: calculateEstimatedLoss(link.video.viewCount, settings),
  };
}

/**
 * Filters links to only include broken/OOS issues
 */
export function filterIssues(links: RawLinkData[]): RawLinkData[] {
  return links.filter(link =>
    link.status === "NOT_FOUND" ||
    link.status === "OOS"
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
