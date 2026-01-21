import { extractLinksFromDescription, filterAffiliateLinks, ParsedLink } from "./link-parser";
import { checkLinksParallel, LinkCheckResult } from "./link-checker";
import { calculateRevenueImpact, CONSERVATIVE_SETTINGS } from "./revenue-estimator";
import { prisma } from "./db";
import crypto from "crypto";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const MAX_VIDEOS_TO_SCAN = 15; // Free audit: last 15 videos only (not full channel history)
const MAX_LINKS_TO_CHECK = 20; // Limit link checks to avoid timeout
const PARALLEL_CONCURRENCY = 5; // Check 5 links simultaneously

// Required for YouTube API key with HTTP referrer restrictions
const YOUTUBE_API_HEADERS = {
  "Referer": "https://link-medic.vercel.app/",
};

interface YouTubeChannel {
  id: string;
  title: string;
  thumbnail: string;
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  viewCount: number;
  thumbnailUrl: string;
  publishedAt: string;
}

interface AuditLink extends ParsedLink {
  videoId: string;
  videoTitle: string;
  viewCount: number;
  videoAgeMonths: number;
  status?: LinkCheckResult["status"];
  revenueImpact?: number;
}

export interface AuditResult {
  channelId: string;
  channelName: string;
  channelThumbnail: string | null;
  totalVideos: number;
  totalLinks: number;
  brokenLinks: number;
  outOfStockLinks: number;
  redirectLinks: number;
  healthyLinks: number;
  // Split-metric approach for transparency
  verifiedMonthlyLoss: number;      // Loss from scanned videos only (100% verifiable)
  corruptionRate: number;           // % of scanned links that are broken
  potentialMonthlyImpact: number;   // Conservative total estimate (for display)
  topIssues: {
    videoTitle: string;
    videoId: string;
    url: string;
    status: string;
    revenueImpact: number;
  }[];
}

/**
 * Extracts channel ID from various YouTube URL formats
 */
export function extractChannelId(input: string): string | null {
  const trimmed = input.trim();
  console.log("extractChannelId input:", trimmed);

  // Direct channel ID (starts with UC)
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(trimmed)) {
    console.log("Matched direct channel ID");
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.toLowerCase();
    console.log("Parsed URL hostname:", hostname, "pathname:", url.pathname);

    if (!hostname.includes("youtube.com") && !hostname.includes("youtu.be")) {
      console.log("Not a YouTube URL");
      return null;
    }

    const pathname = url.pathname;

    // /channel/UC... format
    const channelMatch = pathname.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
    if (channelMatch) {
      console.log("Matched /channel/ format:", channelMatch[1]);
      return channelMatch[1];
    }

    // /@handle format - need to resolve via API
    const handleMatch = pathname.match(/\/@([^/]+)/);
    if (handleMatch) {
      console.log("Matched /@handle format:", handleMatch[1]);
      return `@${handleMatch[1]}`;
    }

    // /c/customname format - need to resolve via API
    const customMatch = pathname.match(/\/c\/([^/]+)/);
    if (customMatch) {
      console.log("Matched /c/ format:", customMatch[1]);
      return `c/${customMatch[1]}`;
    }

    // /user/username format - need to resolve via API
    const userMatch = pathname.match(/\/user\/([^/]+)/);
    if (userMatch) {
      console.log("Matched /user/ format:", userMatch[1]);
      return `user/${userMatch[1]}`;
    }

    console.log("No pattern matched for pathname:", pathname);

  } catch {
    // Not a valid URL, check if it's a handle
    if (trimmed.startsWith("@")) {
      console.log("Matched bare @handle format");
      return trimmed;
    }
    console.log("Not a valid URL and not a handle");
  }

  return null;
}

/**
 * Resolves a handle or custom URL to a channel ID using YouTube API
 */
async function resolveChannelId(identifier: string): Promise<YouTubeChannel | null> {
  if (!YOUTUBE_API_KEY) {
    console.error("YOUTUBE_API_KEY is not configured");
    throw new Error("YouTube API key not configured");
  }

  console.log("Resolving channel identifier:", identifier);

  let searchQuery = identifier;

  // Handle @ prefix
  if (identifier.startsWith("@")) {
    searchQuery = identifier;
  } else if (identifier.startsWith("c/") || identifier.startsWith("user/")) {
    searchQuery = identifier.split("/")[1];
  }

  // Use forHandle for @ handles (newer API)
  if (identifier.startsWith("@")) {
    const handle = identifier.substring(1);
    console.log("Looking up handle:", handle);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${encodeURIComponent(handle)}&key=${YOUTUBE_API_KEY}`,
      { headers: YOUTUBE_API_HEADERS }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("YouTube API error (forHandle):", response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log("forHandle API response items:", data.items?.length || 0);
    if (data.items && data.items.length > 0) {
      const channel = data.items[0];
      return {
        id: channel.id,
        title: channel.snippet.title,
        thumbnail: channel.snippet.thumbnails?.default?.url || null,
      };
    }
    // If forHandle returns no results, fall through to search
    console.log("forHandle returned no results, trying search...");
  }

  // Search for channel
  console.log("Searching for channel:", searchQuery);
  const searchResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(searchQuery)}&maxResults=1&key=${YOUTUBE_API_KEY}`,
    { headers: YOUTUBE_API_HEADERS }
  );

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text();
    console.error("YouTube search API error:", searchResponse.status, errorText);
    return null;
  }

  const searchData = await searchResponse.json();
  console.log("Search API response items:", searchData.items?.length || 0);
  if (searchData.items && searchData.items.length > 0) {
    const item = searchData.items[0];
    return {
      id: item.snippet.channelId,
      title: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.default?.url || null,
    };
  }

  console.log("No channel found for identifier:", identifier);
  return null;
}

/**
 * Fetches channel info by ID
 */
async function getChannelById(channelId: string): Promise<YouTubeChannel | null> {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YouTube API key not configured");
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`,
    { headers: YOUTUBE_API_HEADERS }
  );

  if (!response.ok) {
    console.error("YouTube API error:", await response.text());
    return null;
  }

  const data = await response.json();
  if (data.items && data.items.length > 0) {
    const channel = data.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      thumbnail: channel.snippet.thumbnails?.default?.url || null,
    };
  }

  return null;
}

/**
 * Fetches recent videos from a channel
 */
async function getChannelVideos(channelId: string, maxResults: number = MAX_VIDEOS_TO_SCAN): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YouTube API key not configured");
  }

  // First, get the uploads playlist ID
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`,
    { headers: YOUTUBE_API_HEADERS }
  );

  if (!channelResponse.ok) {
    throw new Error("Failed to fetch channel details");
  }

  const channelData = await channelResponse.json();
  if (!channelData.items || channelData.items.length === 0) {
    throw new Error("Channel not found");
  }

  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // Fetch videos from uploads playlist
  const videosResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`,
    { headers: YOUTUBE_API_HEADERS }
  );

  if (!videosResponse.ok) {
    throw new Error("Failed to fetch videos");
  }

  const videosData = await videosResponse.json();
  const videoIds = videosData.items.map((item: { contentDetails: { videoId: string } }) => item.contentDetails.videoId);

  if (videoIds.length === 0) {
    return [];
  }

  // Fetch full video details including statistics and description
  const detailsResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(",")}&key=${YOUTUBE_API_KEY}`,
    { headers: YOUTUBE_API_HEADERS }
  );

  if (!detailsResponse.ok) {
    throw new Error("Failed to fetch video details");
  }

  const detailsData = await detailsResponse.json();

  return detailsData.items.map((video: {
    id: string;
    snippet: { title: string; description: string; publishedAt: string; thumbnails?: { default?: { url: string } } };
    statistics: { viewCount?: string };
  }) => ({
    id: video.id,
    title: video.snippet.title,
    description: video.snippet.description,
    viewCount: parseInt(video.statistics.viewCount || "0", 10),
    thumbnailUrl: video.snippet.thumbnails?.default?.url || "",
    publishedAt: video.snippet.publishedAt,
  }));
}

/**
 * Calculate video age in months from publish date
 */
function getVideoAgeMonths(publishedAt: string): number {
  const publishDate = new Date(publishedAt);
  const now = new Date();
  const diffMs = now.getTime() - publishDate.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);
  return Math.max(diffMonths, 1); // Minimum 1 month
}

/**
 * Runs a public audit on a YouTube channel
 */
export async function runPublicAudit(channelInput: string, ipAddress?: string): Promise<AuditResult> {
  // Parse channel identifier
  const identifier = extractChannelId(channelInput);
  if (!identifier) {
    throw new Error("Invalid YouTube channel URL or ID");
  }

  // Resolve to actual channel
  let channel: YouTubeChannel | null = null;

  if (identifier.startsWith("UC")) {
    channel = await getChannelById(identifier);
  } else {
    channel = await resolveChannelId(identifier);
  }

  if (!channel) {
    throw new Error("Channel not found. Please check the URL or channel ID.");
  }

  // Fetch videos
  const videos = await getChannelVideos(channel.id, MAX_VIDEOS_TO_SCAN);

  if (videos.length === 0) {
    throw new Error("No videos found on this channel");
  }

  // Extract affiliate links from all videos
  const allLinks: AuditLink[] = [];

  for (const video of videos) {
    const links = extractLinksFromDescription(video.description);
    const affiliateLinks = filterAffiliateLinks(links);
    const videoAgeMonths = getVideoAgeMonths(video.publishedAt);

    for (const link of affiliateLinks) {
      allLinks.push({
        ...link,
        videoId: video.id,
        videoTitle: video.title,
        viewCount: video.viewCount,
        videoAgeMonths,
      });
    }
  }

  // Check link health (limited to avoid timeout)
  // Using parallel processing for 5-10x faster audits
  const linksToCheck = allLinks.slice(0, MAX_LINKS_TO_CHECK);

  console.log(`[PublicAudit] Starting parallel link check for ${linksToCheck.length} links...`);
  const startTime = Date.now();

  // Prepare links for parallel checking
  const linksForCheck = linksToCheck.map(link => ({
    url: link.url,
    isAmazon: link.merchant === "amazon",
  }));

  // Run checks in parallel with concurrency limit
  const results = await checkLinksParallel(linksForCheck, {
    concurrency: PARALLEL_CONCURRENCY,
    onProgress: (completed, total, result) => {
      // Log each result as it completes
      console.log(`[LinkCheck ${completed}/${total}] ${result.originalUrl.substring(0, 50)}...`);
      console.log(`  -> Status: ${result.status} | Reason: ${result.reason}`);
    },
  });

  // Map results back to our links and calculate revenue impact
  for (const link of linksToCheck) {
    const result = results.get(link.url);
    if (result) {
      link.status = result.status;
      // Calculate revenue impact using CONSERVATIVE settings for free audit
      // Uses lower CTR (1%), lower conversion (1.5%), lower commission (3%)
      // and conservative severity factors
      link.revenueImpact = calculateRevenueImpact(
        link.viewCount,
        link.status,
        CONSERVATIVE_SETTINGS,
        link.videoAgeMonths,
        false,  // isEvergreen
        undefined,  // actualMonthlyViews
        true  // useConservativeSeverity
      );
    } else {
      // Should not happen, but handle gracefully
      link.status = "UNKNOWN";
      link.revenueImpact = 0;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[PublicAudit] Completed ${linksToCheck.length} link checks in ${totalTime}s`);

  // For remaining unchecked links, mark as UNKNOWN with no impact (we don't know their status)
  for (let i = MAX_LINKS_TO_CHECK; i < allLinks.length; i++) {
    allLinks[i].status = "UNKNOWN";
    allLinks[i].revenueImpact = 0; // Don't count unknown links in revenue impact
  }

  // Calculate metrics - include new status types
  // 'Broken' bucket: NOT_FOUND, MISSING_TAG (complete failures)
  const brokenLinks = allLinks.filter(l =>
    l.status === "NOT_FOUND" || l.status === "MISSING_TAG"
  ).length;
  // 'Out of Stock/Alerts' bucket: OOS, OOS_THIRD_PARTY
  const outOfStockLinks = allLinks.filter(l =>
    l.status === "OOS" || l.status === "OOS_THIRD_PARTY"
  ).length;
  // 'Redirect Errors' bucket: SEARCH_REDIRECT, REDIRECT
  const redirectLinks = allLinks.filter(l =>
    l.status === "REDIRECT" || l.status === "SEARCH_REDIRECT"
  ).length;
  const healthyLinks = allLinks.filter(l => l.status === "OK").length;

  // ============================================
  // SPLIT-METRIC APPROACH FOR TRANSPARENCY
  // ============================================

  // 1. VERIFIED LOSS: Only from scanned videos (100% verifiable)
  // This is the most accurate number - what we actually found and checked
  // Includes all issue types: NOT_FOUND, SEARCH_REDIRECT, OOS, OOS_THIRD_PARTY, REDIRECT, MISSING_TAG
  const confirmedIssues = allLinks.filter(l =>
    l.status === "NOT_FOUND" ||
    l.status === "SEARCH_REDIRECT" ||
    l.status === "MISSING_TAG" ||
    l.status === "OOS" ||
    l.status === "OOS_THIRD_PARTY" ||
    l.status === "REDIRECT"
  );
  const verifiedMonthlyLoss = Math.round(
    confirmedIssues.reduce((sum, link) => sum + (link.revenueImpact || 0), 0) * 100
  ) / 100;

  // 2. CORRUPTION RATE: What % of checked links have issues?
  // This tells us how "sick" the channel is
  const checkedLinks = allLinks.filter(l => l.status !== "UNKNOWN");
  const corruptionRate = checkedLinks.length > 0
    ? Math.round((confirmedIssues.length / checkedLinks.length) * 100)
    : 0;

  // 3. POTENTIAL IMPACT: Conservative estimate for display
  // We use the verified loss as-is since we're already using conservative settings
  // No extrapolation multiplier for free audit - just show what we found
  const potentialMonthlyImpact = verifiedMonthlyLoss;

  // Get top issues (all problem statuses sorted by revenue impact)
  const issues = allLinks
    .filter(l =>
      l.status === "NOT_FOUND" ||
      l.status === "SEARCH_REDIRECT" ||
      l.status === "MISSING_TAG" ||
      l.status === "OOS" ||
      l.status === "OOS_THIRD_PARTY" ||
      l.status === "REDIRECT"
    )
    .sort((a, b) => (b.revenueImpact || 0) - (a.revenueImpact || 0))
    .slice(0, 10)
    .map(link => ({
      videoTitle: link.videoTitle,
      videoId: link.videoId,
      url: link.url,
      status: link.status || "UNKNOWN",
      revenueImpact: link.revenueImpact || 0,
    }));

  const result: AuditResult = {
    channelId: channel.id,
    channelName: channel.title,
    channelThumbnail: channel.thumbnail,
    totalVideos: videos.length,
    totalLinks: allLinks.length,
    brokenLinks,
    outOfStockLinks,
    redirectLinks,
    healthyLinks,
    verifiedMonthlyLoss,
    corruptionRate,
    potentialMonthlyImpact,
    topIssues: issues,
  };

  // Store audit result
  const ipHash = ipAddress ? crypto.createHash("sha256").update(ipAddress).digest("hex").slice(0, 16) : null;

  await prisma.publicAudit.create({
    data: {
      channelId: channel.id,
      channelName: channel.title,
      channelThumbnail: channel.thumbnail,
      totalVideos: videos.length,
      totalLinks: allLinks.length,
      brokenLinks,
      outOfStockLinks,
      redirectLinks,
      healthyLinks,
      estimatedMonthlyLoss: potentialMonthlyImpact, // DB field name unchanged for compatibility
      topIssues: issues,
      ipHash,
    },
  });

  return result;
}

/**
 * Gets an existing audit result by ID
 */
export async function getAuditById(auditId: string): Promise<AuditResult | null> {
  const audit = await prisma.publicAudit.findUnique({
    where: { id: auditId },
  });

  if (!audit) return null;

  // Calculate corruption rate from stored data
  const checkedLinks = audit.brokenLinks + audit.outOfStockLinks + audit.redirectLinks + audit.healthyLinks;
  const issueLinks = audit.brokenLinks + audit.outOfStockLinks + audit.redirectLinks;
  const corruptionRate = checkedLinks > 0 ? Math.round((issueLinks / checkedLinks) * 100) : 0;

  return {
    channelId: audit.channelId,
    channelName: audit.channelName,
    channelThumbnail: audit.channelThumbnail,
    totalVideos: audit.totalVideos,
    totalLinks: audit.totalLinks,
    brokenLinks: audit.brokenLinks,
    outOfStockLinks: audit.outOfStockLinks,
    redirectLinks: audit.redirectLinks,
    healthyLinks: audit.healthyLinks,
    verifiedMonthlyLoss: audit.estimatedMonthlyLoss, // DB field stores verified loss
    corruptionRate,
    potentialMonthlyImpact: audit.estimatedMonthlyLoss, // Same as verified for now
    topIssues: audit.topIssues as AuditResult["topIssues"],
  };
}

/**
 * Increments the share count for an audit
 */
export async function incrementShareCount(auditId: string): Promise<void> {
  await prisma.publicAudit.update({
    where: { id: auditId },
    data: { sharedCount: { increment: 1 } },
  });
}

/**
 * Marks an audit as converted to signup
 */
export async function markAuditConverted(auditId: string): Promise<void> {
  await prisma.publicAudit.update({
    where: { id: auditId },
    data: { convertedToSignup: true },
  });
}
