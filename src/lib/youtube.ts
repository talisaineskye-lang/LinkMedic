import { google } from "googleapis";
import { prisma } from "./db";

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
 * Fetches videos from a specific channel with pagination
 * @param accessToken - OAuth access token
 * @param refreshToken - OAuth refresh token
 * @param channelId - The YouTube channel ID to fetch videos from
 * @param pageToken - Optional page token for pagination
 * @param maxResults - Maximum results per page (max 50)
 */
export async function fetchChannelVideos(
  accessToken: string,
  refreshToken: string | null,
  channelId: string,
  pageToken?: string,
  maxResults: number = 50
): Promise<FetchVideosResult> {
  const auth = createOAuth2Client(accessToken, refreshToken);

  try {
    // First, get the uploads playlist ID for the specific channel
    const channelResponse = await youtube.channels.list({
      auth,
      part: ["contentDetails"],
      id: [channelId],
    });

    const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      throw new Error("Could not find uploads playlist for channel");
    }

    // Fetch videos from the uploads playlist
    const playlistResponse = await youtube.playlistItems.list({
      auth,
      part: ["snippet", "contentDetails"],
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

    // Fetch detailed video statistics
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
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    throw error;
  }
}

/**
 * Syncs all videos from a user's selected channel to the database
 * Handles pagination and respects the 500 video limit
 * Requires user to have selected a channel first (youtubeChannelId must be set)
 */
export async function syncUserVideos(userId: string): Promise<{ synced: number; total: number }> {
  // Get tokens from Account table (where NextAuth stores them)
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
    select: {
      access_token: true,
      refresh_token: true,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      youtubeChannelId: true,
    },
  });

  if (!account?.access_token) {
    throw new Error("User not authenticated with YouTube");
  }

  const channelId = user?.youtubeChannelId;
  if (!channelId) {
    throw new Error("No YouTube channel selected. Please select a channel first.");
  }

  const MAX_VIDEOS = 500; // Limit per plan
  let synced = 0;
  let pageToken: string | undefined;

  while (synced < MAX_VIDEOS) {
    const { videos, nextPageToken } = await fetchChannelVideos(
      account.access_token,
      account.refresh_token,
      channelId,
      pageToken,
      Math.min(50, MAX_VIDEOS - synced)
    );

    if (videos.length === 0) break;

    // Upsert videos into database
    for (const video of videos) {
      await prisma.video.upsert({
        where: { youtubeVideoId: video.id },
        create: {
          youtubeVideoId: video.id,
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          viewCount: video.viewCount,
          publishedAt: video.publishedAt,
          userId,
        },
        update: {
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          viewCount: video.viewCount,
        },
      });
      synced++;
    }

    if (!nextPageToken || synced >= MAX_VIDEOS) break;
    pageToken = nextPageToken;

    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Get total count
  const total = await prisma.video.count({ where: { userId } });

  return { synced, total };
}
