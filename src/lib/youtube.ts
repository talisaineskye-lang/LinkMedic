import { google, Auth } from "googleapis";
import { prisma } from "./db";
import pLimit from "p-limit";

const youtube = google.youtube("v3");

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  viewCount: number;
  publishedAt: Date;
}

interface FetchVideosResult {
  videos: YouTubeVideo[];
  nextPageToken?: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
}

/**
 * Creates an OAuth2 client with the user's tokens
 */
export function createOAuth2Client(accessToken: string, refreshToken?: string | null) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken || undefined,
  });

  return oauth2Client;
}

/**
 * Gets a valid access token, refreshing if necessary
 * Updates the database with new tokens if refreshed
 */
export async function getValidAccessToken(userId: string): Promise<{ accessToken: string; refreshToken: string | null }> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
    select: {
      id: true,
      access_token: true,
      refresh_token: true,
      expires_at: true,
    },
  });

  if (!account?.access_token) {
    throw new Error("No Google account found for user");
  }

  // Check if token is expired (with 5 min buffer)
  const now = Math.floor(Date.now() / 1000);
  const isExpired = account.expires_at && account.expires_at < now + 300;

  if (isExpired && account.refresh_token) {
    console.log("[YouTube] Access token expired, refreshing...");

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: account.refresh_token,
    });

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();

      // Update database with new tokens
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: credentials.access_token,
          expires_at: credentials.expiry_date
            ? Math.floor(credentials.expiry_date / 1000)
            : null,
        },
      });

      console.log("[YouTube] Token refreshed successfully");

      return {
        accessToken: credentials.access_token!,
        refreshToken: account.refresh_token,
      };
    } catch (error) {
      console.error("[YouTube] Failed to refresh token:", error);
      throw new Error("Failed to refresh access token. Please sign in again.");
    }
  }

  return {
    accessToken: account.access_token,
    refreshToken: account.refresh_token,
  };
}

/**
 * Gets the user's YouTube channel ID (primary channel)
 */
export async function getChannelId(accessToken: string, refreshToken?: string | null): Promise<string | null> {
  const auth = createOAuth2Client(accessToken, refreshToken);

  try {
    const response = await youtube.channels.list({
      auth,
      part: ["id"],
      mine: true,
    });

    return response.data.items?.[0]?.id || null;
  } catch (error) {
    console.error("Error fetching channel ID:", error);
    throw error;
  }
}

/**
 * Gets all YouTube channels the user has access to (including brand accounts)
 */
export async function getAllUserChannels(accessToken: string, refreshToken?: string | null): Promise<YouTubeChannel[]> {
  const auth = createOAuth2Client(accessToken, refreshToken);

  try {
    // Get all channels the user owns or manages
    const response = await youtube.channels.list({
      auth,
      part: ["snippet", "statistics"],
      mine: true,
      maxResults: 50,
    });

    const channels: YouTubeChannel[] = response.data.items?.map(channel => ({
      id: channel.id!,
      title: channel.snippet?.title || "Unnamed Channel",
      thumbnailUrl: channel.snippet?.thumbnails?.medium?.url || channel.snippet?.thumbnails?.default?.url || "",
      subscriberCount: parseInt(channel.statistics?.subscriberCount || "0", 10),
      videoCount: parseInt(channel.statistics?.videoCount || "0", 10),
    })) || [];

    return channels;
  } catch (error) {
    console.error("Error fetching user channels:", error);
    throw error;
  }
}

/**
 * Gets the uploads playlist ID for a channel (called ONCE per sync)
 * This is a separate call to avoid redundant API requests
 */
async function getUploadsPlaylistId(
  auth: Auth.OAuth2Client,
  channelId: string
): Promise<string> {
  const response = await youtube.channels.list({
    auth,
    part: ["contentDetails"],
    id: [channelId],
  });

  const playlistId = response.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlistId) {
    throw new Error("Could not find uploads playlist for channel");
  }
  return playlistId;
}

/**
 * Fetches videos from an uploads playlist (without redundant channels.list call)
 * @param auth - OAuth2 client
 * @param uploadsPlaylistId - The uploads playlist ID (fetched once via getUploadsPlaylistId)
 * @param pageToken - Optional page token for pagination
 * @param maxResults - Maximum results per page (max 50)
 */
async function fetchVideosFromPlaylist(
  auth: Auth.OAuth2Client,
  uploadsPlaylistId: string,
  pageToken?: string,
  maxResults: number = 50
): Promise<FetchVideosResult> {
  // Fetch video IDs from the uploads playlist
  const playlistResponse = await youtube.playlistItems.list({
    auth,
    part: ["contentDetails"],
    playlistId: uploadsPlaylistId,
    maxResults,
    pageToken,
  });

  const videoIds = playlistResponse.data.items
    ?.map(item => item.contentDetails?.videoId)
    .filter((id): id is string => !!id) || [];

  if (videoIds.length === 0) {
    return { videos: [], nextPageToken: undefined };
  }

  // Fetch detailed video info (batches up to 50 IDs per request)
  const videosResponse = await youtube.videos.list({
    auth,
    part: ["snippet", "statistics"],
    id: videoIds,
  });

  const videos: YouTubeVideo[] = videosResponse.data.items?.map(video => ({
    id: video.id!,
    title: video.snippet?.title || "Untitled",
    description: video.snippet?.description || "",
    thumbnailUrl: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url || "",
    viewCount: parseInt(video.statistics?.viewCount || "0", 10),
    publishedAt: new Date(video.snippet?.publishedAt || Date.now()),
  })) || [];

  return {
    videos,
    nextPageToken: playlistResponse.data.nextPageToken || undefined,
  };
}

// Concurrency limit for parallel page fetching (conservative to avoid API throttling)
const pageFetchLimit = pLimit(2);

/**
 * Fetches all videos with light parallelism (2 concurrent page requests)
 * @param auth - OAuth2 client
 * @param uploadsPlaylistId - The uploads playlist ID
 * @param maxVideos - Maximum videos to fetch
 * @param scanType - 'quick' or 'full' scan type
 * @param thirtyDaysAgo - Date threshold for quick scan
 */
async function fetchAllVideos(
  auth: Auth.OAuth2Client,
  uploadsPlaylistId: string,
  maxVideos: number,
  scanType: "quick" | "full",
  thirtyDaysAgo: Date
): Promise<YouTubeVideo[]> {
  const allVideos: YouTubeVideo[] = [];
  let currentPageToken: string | undefined = undefined;
  let hitOldVideo = false;

  // Sequential pagination but without artificial delays
  // We use pageFetchLimit for potential future parallel fetching
  while (allVideos.length < maxVideos && !hitOldVideo) {
    const result = await pageFetchLimit(() =>
      fetchVideosFromPlaylist(auth, uploadsPlaylistId, currentPageToken, 50)
    );

    if (result.videos.length === 0) break;

    for (const video of result.videos) {
      if (allVideos.length >= maxVideos) break;

      // For quick scan, stop when we hit videos older than 30 days
      if (scanType === "quick" && video.publishedAt < thirtyDaysAgo) {
        hitOldVideo = true;
        break;
      }

      allVideos.push(video);
    }

    if (!result.nextPageToken || allVideos.length >= maxVideos || hitOldVideo) {
      break;
    }

    currentPageToken = result.nextPageToken;
  }

  return allVideos;
}

/**
 * Batch upserts videos using chunked Prisma transactions
 * Much faster than individual upserts due to reduced DB round trips
 * Chunks to avoid transaction timeout (default 5s)
 */
async function batchUpsertVideos(
  videos: YouTubeVideo[],
  userId: string,
  channelId: string | null
): Promise<number> {
  if (videos.length === 0) return 0;

  // Chunk size of 50 to stay well under 5s transaction timeout
  const CHUNK_SIZE = 50;
  const chunks: YouTubeVideo[][] = [];

  for (let i = 0; i < videos.length; i += CHUNK_SIZE) {
    chunks.push(videos.slice(i, i + CHUNK_SIZE));
  }

  // Process each chunk in a separate transaction
  for (const chunk of chunks) {
    await prisma.$transaction(
      chunk.map(video =>
        prisma.video.upsert({
          where: { youtubeVideoId: video.id },
          create: {
            youtubeVideoId: video.id,
            title: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
            viewCount: video.viewCount,
            publishedAt: video.publishedAt,
            userId,
            channelId,
          },
          update: {
            title: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
            viewCount: video.viewCount,
            // IMPORTANT: Update userId to ensure video belongs to current user
            // This fixes the case where a video was previously synced by another account
            userId,
            channelId,
          },
        })
      )
    );
  }

  return videos.length;
}

/**
 * Refreshes top 20 videos by view count (for quick scan)
 * These high-traffic videos are more likely to have updated descriptions
 */
async function refreshTopVideos(
  auth: Auth.OAuth2Client,
  userId: string,
  channelId: string | undefined
): Promise<void> {
  const topVideoWhere = channelId
    ? { userId, channelId }
    : { userId };

  const topVideos = await prisma.video.findMany({
    where: topVideoWhere,
    orderBy: { viewCount: "desc" },
    take: 20,
    select: { youtubeVideoId: true },
  });

  if (topVideos.length === 0) return;

  try {
    const topVideoIds = topVideos.map(v => v.youtubeVideoId);

    const videosResponse = await youtube.videos.list({
      auth,
      part: ["snippet", "statistics"],
      id: topVideoIds,
    });

    const updates = (videosResponse.data.items || [])
      .filter(video => video.id)
      .map(video =>
        prisma.video.update({
          where: { youtubeVideoId: video.id! },
          data: {
            title: video.snippet?.title || "Untitled",
            description: video.snippet?.description || "",
            viewCount: parseInt(video.statistics?.viewCount || "0", 10),
          },
        })
      );

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }
  } catch (error) {
    console.error("[YouTube] Error refreshing top videos:", error);
    // Don't fail the entire sync if top video refresh fails
  }
}

// Legacy function maintained for backwards compatibility
// Consider deprecating in favor of direct fetchVideosFromPlaylist usage
export async function fetchChannelVideos(
  accessToken: string,
  refreshToken: string | null,
  channelId: string,
  pageToken?: string,
  maxResults: number = 50
): Promise<FetchVideosResult> {
  const auth = createOAuth2Client(accessToken, refreshToken);

  try {
    // Get uploads playlist ID (legacy behavior - calls channels.list each time)
    const uploadsPlaylistId = await getUploadsPlaylistId(auth, channelId);
    return await fetchVideosFromPlaylist(auth, uploadsPlaylistId, pageToken, maxResults);
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    throw error;
  }
}

export type ScanType = "quick" | "full";

/**
 * Syncs videos from a user's selected channel to the database
 *
 * OPTIMIZED VERSION:
 * - Calls channels.list ONCE per sync (not per page)
 * - Fetches pages without artificial delays
 * - Batches all DB upserts in a single transaction
 *
 * Scan types:
 * - quick: Videos from last 30 days + top 20 by views (24h cooldown)
 * - full: All videos up to 500 (30 day cooldown)
 *
 * @param userId - The user ID
 * @param internalChannelId - Optional: specific channel ID from our database to sync
 * @param scanType - Type of scan: 'quick' or 'full' (default: 'full')
 */
export async function syncUserVideos(
  userId: string,
  internalChannelId?: string,
  scanType: ScanType = "full"
): Promise<{ synced: number; total: number; channelId?: string; scanType: ScanType }> {
  const startTime = Date.now();

  // Get valid tokens (refreshes if expired)
  const { accessToken, refreshToken } = await getValidAccessToken(userId);
  const auth = createOAuth2Client(accessToken, refreshToken);

  let youtubeChannelId: string | undefined;
  let dbChannelId: string | undefined;

  if (internalChannelId) {
    // Sync specific channel
    const channel = await (prisma as any).channel.findFirst({
      where: {
        id: internalChannelId,
        userId,
      },
      select: {
        id: true,
        youtubeChannelId: true,
      },
    });

    if (!channel) {
      throw new Error("Channel not found or doesn't belong to user");
    }

    youtubeChannelId = channel.youtubeChannelId;
    dbChannelId = channel.id;
  } else {
    // Get user's active channel or fallback to youtubeChannelId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        youtubeChannelId: true,
        activeChannelId: true,
      },
    });

    if (user?.activeChannelId) {
      const channel = await (prisma as any).channel.findUnique({
        where: { id: user.activeChannelId },
        select: {
          id: true,
          youtubeChannelId: true,
        },
      });

      if (channel) {
        youtubeChannelId = channel.youtubeChannelId;
        dbChannelId = channel.id;
      } else {
        // Channel record doesn't exist but activeChannelId is set
        // Use activeChannelId as dbChannelId to ensure dashboard filter works
        dbChannelId = user.activeChannelId;
      }
    }

    // Fallback to legacy youtubeChannelId
    if (!youtubeChannelId) {
      youtubeChannelId = user?.youtubeChannelId ?? undefined;
    }

    // If we still don't have a dbChannelId but have youtubeChannelId,
    // try to find a channel by youtubeChannelId
    if (!dbChannelId && youtubeChannelId) {
      const channelByYtId = await (prisma as any).channel.findFirst({
        where: { youtubeChannelId, userId },
        select: { id: true },
      });
      if (channelByYtId) {
        dbChannelId = channelByYtId.id;
      }
    }
  }

  if (!youtubeChannelId) {
    throw new Error("No YouTube channel selected. Please select a channel first.");
  }

  // Scan type limits
  const MAX_VIDEOS = scanType === "full" ? 500 : 200;
  const THIRTY_DAYS_AGO = new Date();
  THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);

  // Get uploads playlist ID ONCE (not per page)
  const uploadsPlaylistId = await getUploadsPlaylistId(auth, youtubeChannelId);

  // Fetch all videos without artificial delays
  const videos = await fetchAllVideos(
    auth,
    uploadsPlaylistId,
    MAX_VIDEOS,
    scanType,
    THIRTY_DAYS_AGO
  );

  // Batch upsert all videos
  const synced = await batchUpsertVideos(videos, userId, dbChannelId || null);

  // Fix any existing videos with null channelId (migration for older data)
  if (dbChannelId) {
    await prisma.video.updateMany({
      where: { userId, channelId: null },
      data: { channelId: dbChannelId },
    });
  }

  // For quick scan, also refresh the top 20 videos by views
  if (scanType === "quick") {
    await refreshTopVideos(auth, userId, dbChannelId);
  }

  // Get total count (for this channel if specified, otherwise all user videos)
  const total = await prisma.video.count({
    where: dbChannelId ? { userId, channelId: dbChannelId } : { userId },
  });

  console.log(`[Sync] Fetched ${synced} videos from YouTube in ${Date.now() - startTime}ms`);

  return { synced, total, channelId: dbChannelId, scanType };
}
