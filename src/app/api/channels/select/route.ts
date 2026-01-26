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
    // Support both internal channelId (for switching) and youtubeChannelId (for onboarding)
    const { channelId, youtubeChannelId, channelTitle, thumbnailUrl } = body;

    // If internal channelId is provided, switch to that channel
    if (channelId) {
      // Verify the channel belongs to this user
      const channel = await (prisma as any).channel.findFirst({
        where: {
          id: channelId,
          userId: session.user.id,
        },
      });

      if (!channel) {
        return NextResponse.json(
          { error: "Channel not found" },
          { status: 404 }
        );
      }

      // Set as active channel
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          activeChannelId: channel.id,
          youtubeChannelId: channel.youtubeChannelId, // Keep for backward compatibility
        },
      });

      return NextResponse.json({
        success: true,
        channel: {
          id: channel.id,
          youtubeChannelId: channel.youtubeChannelId,
          title: channel.title,
        },
      });
    }

    // If youtubeChannelId is provided, this is initial onboarding selection
    if (youtubeChannelId) {
      // Check if channel already exists for this user
      let channel = await (prisma as any).channel.findUnique({
        where: {
          userId_youtubeChannelId: {
            userId: session.user.id,
            youtubeChannelId,
          },
        },
      });

      if (!channel) {
        // Check tier limits before creating new channel
        const limitCheck = await checkChannelLimit(session.user.id);

        if (!limitCheck.allowed) {
          return NextResponse.json(
            {
              error: limitCheck.reason || "Channel limit reached",
              upgradeRequired: limitCheck.upgradeRequired,
            },
            { status: 403 }
          );
        }

        // Create the channel
        channel = await (prisma as any).channel.create({
          data: {
            youtubeChannelId,
            title: channelTitle || "YouTube Channel",
            thumbnailUrl: thumbnailUrl || null,
            userId: session.user.id,
          },
        });
      }

      // Set as active channel
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          activeChannelId: channel.id,
          youtubeChannelId, // Keep for backward compatibility
        },
      });

      return NextResponse.json({
        success: true,
        channel: {
          id: channel.id,
          youtubeChannelId: channel.youtubeChannelId,
          title: channel.title,
        },
      });
    }

    return NextResponse.json(
      { error: "Either channelId or youtubeChannelId is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error selecting channel:", error);
    return NextResponse.json(
      { error: "Failed to select channel" },
      { status: 500 }
    );
  }
}
