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
 * Gets the user's YouTube channel ID
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
 * Fetches videos from the user's channel with pagination
 * @param accessToken - OAuth access token
 * @param refreshToken - OAuth refresh token
 * @param pageToken - Optional page token for pagination
 * @param maxResults - Maximum results per page (max 50)
 */
export async function fetchChannelVideos(
  accessToken: string,
  refreshToken: string | null,
  pageToken?: string,
  maxResults: number = 50
): Promise<FetchVideosResult> {
  const auth = createOAuth2Client(accessToken, refreshToken);

  try {
    // First, get the uploads playlist ID for the channel
    const channelResponse = await youtube.channels.list({
      auth,
      part: ["contentDetails"],
      mine: true,
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
 * Syncs all videos from a user's channel to the database
 * Handles pagination and respects the 500 video limit
 */
export async function syncUserVideos(userId: string): Promise<{ synced: number; total: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      accessToken: true,
      refreshToken: true,
      youtubeChannelId: true,
    },
  });

  if (!user?.accessToken) {
    throw new Error("User not authenticated with YouTube");
  }

  // Get channel ID if not stored
  let channelId = user.youtubeChannelId;
  if (!channelId) {
    channelId = await getChannelId(user.accessToken, user.refreshToken);
    if (channelId) {
      await prisma.user.update({
        where: { id: userId },
        data: { youtubeChannelId: channelId },
      });
    }
  }

  const MAX_VIDEOS = 500; // Limit per plan
  let synced = 0;
  let pageToken: string | undefined;

  while (synced < MAX_VIDEOS) {
    const { videos, nextPageToken } = await fetchChannelVideos(
      user.accessToken,
      user.refreshToken,
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
