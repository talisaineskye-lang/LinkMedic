import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAllUserChannels, getValidAccessToken } from "@/lib/youtube";
import { getMaxChannels } from "@/lib/tier-limits";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's tier and connected channels
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        tier: true,
        activeChannelId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's connected channels from our database
    const connectedChannels = await (prisma as any).channel.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        youtubeChannelId: true,
        title: true,
        thumbnailUrl: true,
        subscriberCount: true,
        videoCount: true,
        createdAt: true,
      },
    });

    // Get channel limit based on tier
    const channelLimit = getMaxChannels(user.tier);

    // Get valid tokens (refreshes if expired)
    const { accessToken, refreshToken } = await getValidAccessToken(session.user.id);

    // Get all channels from YouTube API (for adding new channels)
    const youtubeChannels = await getAllUserChannels(accessToken, refreshToken);

    // Mark which YouTube channels are already connected
    const connectedYoutubeIds = new Set(
      connectedChannels.map((c: any) => c.youtubeChannelId)
    );

    const availableChannels = youtubeChannels.map((channel) => ({
      ...channel,
      isConnected: connectedYoutubeIds.has(channel.id),
    }));

    return NextResponse.json({
      connectedChannels,
      availableChannels,
      activeChannelId: user.activeChannelId,
      channelLimit,
      channelCount: connectedChannels.length,
      canAddMore: connectedChannels.length < channelLimit,
    });
  } catch (error) {
    console.error("Error fetching channels:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch channels: ${errorMessage}` },
      { status: 500 }
    );
  }
}
