import { extractLinksFromDescription, filterAffiliateLinks, ParsedLink } from "./link-parser";
import { checkLink, LinkCheckResult } from "./link-checker";
import { calculateEstimatedLoss, DEFAULT_SETTINGS } from "./revenue-estimator";
import { prisma } from "./db";
import crypto from "crypto";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const MAX_VIDEOS_TO_SCAN = 50; // Limit for free audit
const MAX_LINKS_TO_CHECK = 30; // Limit link checks to avoid timeout
const RATE_LIMIT_DELAY = 300; // ms between link checks

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
}

interface AuditLink extends ParsedLink {
  videoId: string;
  videoTitle: string;
  viewCount: number;
  status?: LinkCheckResult["status"];
  estimatedLoss?: number;
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
  estimatedMonthlyLoss: number;
  topIssues: {
    videoTitle: string;
    videoId: string;
    url: string;
    status: string;
    estimatedLoss: number;
  }[];
}

/**
 * Extracts channel ID from various YouTube URL formats
 */
export function extractChannelId(input: string): string | null {
  const trimmed = input.trim();

  // Direct channel ID (starts with UC)
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.toLowerCase();

    if (!hostname.includes("youtube.com") && !hostname.includes("youtu.be")) {
      return null;
    }

    const pathname = url.pathname;

    // /channel/UC... format
    const channelMatch = pathname.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
    if (channelMatch) return channelMatch[1];

    // /@handle format - need to resolve via API
    const handleMatch = pathname.match(/\/@([^/]+)/);
    if (handleMatch) return `@${handleMatch[1]}`;

    // /c/customname format - need to resolve via API
    const customMatch = pathname.match(/\/c\/([^/]+)/);
    if (customMatch) return `c/${customMatch[1]}`;

    // /user/username format - need to resolve via API
    const userMatch = pathname.match(/\/user\/([^/]+)/);
    if (userMatch) return `user/${userMatch[1]}`;

  } catch {
    // Not a valid URL, check if it's a handle
    if (trimmed.startsWith("@")) {
      return trimmed;
    }
  }

  return null;
}

/**
 * Resolves a handle or custom URL to a channel ID using YouTube API
 */
async function resolveChannelId(identifier: string): Promise<YouTubeChannel | null> {
  if (!YOUTUBE_API_KEY) {
    throw new Error("YouTube API key not configured");
  }

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
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${encodeURIComponent(handle)}&key=${YOUTUBE_API_KEY}`
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
  }

  // Search for channel
  const searchResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(searchQuery)}&maxResults=1&key=${YOUTUBE_API_KEY}`
  );

  if (!searchResponse.ok) {
    console.error("YouTube search API error:", await searchResponse.text());
    return null;
  }

  const searchData = await searchResponse.json();
  if (searchData.items && searchData.items.length > 0) {
    const item = searchData.items[0];
    return {
      id: item.snippet.channelId,
      title: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.default?.url || null,
    };
  }

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
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`
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
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
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
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
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
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(",")}&key=${YOUTUBE_API_KEY}`
  );

  if (!detailsResponse.ok) {
    throw new Error("Failed to fetch video details");
  }

  const detailsData = await detailsResponse.json();

  return detailsData.items.map((video: {
    id: string;
    snippet: { title: string; description: string; thumbnails?: { default?: { url: string } } };
    statistics: { viewCount?: string };
  }) => ({
    id: video.id,
    title: video.snippet.title,
    description: video.snippet.description,
    viewCount: parseInt(video.statistics.viewCount || "0", 10),
    thumbnailUrl: video.snippet.thumbnails?.default?.url || "",
  }));
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

    for (const link of affiliateLinks) {
      allLinks.push({
        ...link,
        videoId: video.id,
        videoTitle: video.title,
        viewCount: video.viewCount,
      });
    }
  }

  // Check link health (limited to avoid timeout)
  const linksToCheck = allLinks.slice(0, MAX_LINKS_TO_CHECK);

  for (let i = 0; i < linksToCheck.length; i++) {
    const link = linksToCheck[i];
    try {
      const isAmazon = link.merchant === "amazon";
      const result = await checkLink(link.url, isAmazon);
      link.status = result.status;
      link.estimatedLoss = result.status === "NOT_FOUND" || result.status === "OOS"
        ? calculateEstimatedLoss(link.viewCount, DEFAULT_SETTINGS)
        : 0;
    } catch (error) {
      console.error(`Error checking link ${link.url}:`, error);
      link.status = "UNKNOWN";
      link.estimatedLoss = 0;
    }

    // Rate limiting
    if (i < linksToCheck.length - 1) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }
  }

  // For remaining unchecked links, assume UNKNOWN
  for (let i = MAX_LINKS_TO_CHECK; i < allLinks.length; i++) {
    allLinks[i].status = "UNKNOWN";
    allLinks[i].estimatedLoss = 0;
  }

  // Calculate metrics
  const brokenLinks = allLinks.filter(l => l.status === "NOT_FOUND").length;
  const outOfStockLinks = allLinks.filter(l => l.status === "OOS").length;
  const redirectLinks = allLinks.filter(l => l.status === "REDIRECT").length;
  const healthyLinks = allLinks.filter(l => l.status === "OK").length;

  const estimatedMonthlyLoss = allLinks.reduce((sum, link) => sum + (link.estimatedLoss || 0), 0);

  // Get top issues (broken/OOS links sorted by estimated loss)
  const issues = allLinks
    .filter(l => l.status === "NOT_FOUND" || l.status === "OOS")
    .sort((a, b) => (b.estimatedLoss || 0) - (a.estimatedLoss || 0))
    .slice(0, 10)
    .map(link => ({
      videoTitle: link.videoTitle,
      videoId: link.videoId,
      url: link.url,
      status: link.status || "UNKNOWN",
      estimatedLoss: link.estimatedLoss || 0,
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
    estimatedMonthlyLoss,
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
      estimatedMonthlyLoss,
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
    estimatedMonthlyLoss: audit.estimatedMonthlyLoss,
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
