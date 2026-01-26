import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkChannelLimit } from "@/lib/tier-limits";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { youtubeChannelId, title, thumbnailUrl, subscriberCount, videoCount } = body;

    if (!youtubeChannelId) {
      return NextResponse.json(
        { error: "YouTube channel ID is required" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Channel title is required" },
        { status: 400 }
      );
    }

    // Check tier limits
    const limitCheck = await checkChannelLimit(session.user.id);

    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.reason || "Channel limit reached",
          upgradeRequired: limitCheck.upgradeRequired,
          limit: limitCheck.limit,
          current: limitCheck.current,
        },
        { status: 403 }
      );
    }

    // Check if this YouTube channel is already added for this user
    const existingChannel = await (prisma as any).channel.findUnique({
      where: {
        userId_youtubeChannelId: {
          userId: session.user.id,
          youtubeChannelId,
        },
      },
    });

    if (existingChannel) {
      return NextResponse.json(
        { error: "This channel is already connected to your account" },
        { status: 400 }
      );
    }

    // Create the channel
    const channel = await (prisma as any).channel.create({
      data: {
        youtubeChannelId,
        title,
        thumbnailUrl: thumbnailUrl || null,
        subscriberCount: subscriberCount || 0,
        videoCount: videoCount || 0,
        userId: session.user.id,
      },
    });

    // Check if this is the user's first channel - if so, set it as active
    const channelCount = await (prisma as any).channel.count({
      where: { userId: session.user.id },
    });

    if (channelCount === 1) {
      // This is the first channel, set it as active and also update youtubeChannelId for backward compatibility
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          activeChannelId: channel.id,
          youtubeChannelId, // Keep for backward compatibility
        },
      });
    }

    return NextResponse.json({
      success: true,
      channel: {
        id: channel.id,
        youtubeChannelId: channel.youtubeChannelId,
        title: channel.title,
        thumbnailUrl: channel.thumbnailUrl,
        subscriberCount: channel.subscriberCount,
        videoCount: channel.videoCount,
      },
      isActive: channelCount === 1,
    });
  } catch (error) {
    console.error("Error adding channel:", error);
    return NextResponse.json(
      { error: "Failed to add channel" },
      { status: 500 }
    );
  }
}
