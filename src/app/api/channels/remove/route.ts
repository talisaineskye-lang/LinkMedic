import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { channelId } = body;

    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      );
    }

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

    // Get current user to check if this is the active channel
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { activeChannelId: true, youtubeChannelId: true },
    });

    // Disassociate videos from this channel (set channelId to null)
    // Videos remain in the system, just not associated with a channel
    await prisma.video.updateMany({
      where: {
        channelId: channelId,
        userId: session.user.id,
      },
      data: {
        channelId: null,
      },
    });

    // Delete the channel
    await (prisma as any).channel.delete({
      where: { id: channelId },
    });

    // If this was the active channel, switch to another channel if available
    let newActiveChannel = null;
    if (user?.activeChannelId === channelId) {
      // Find another channel for this user
      const anotherChannel = await (prisma as any).channel.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
      });

      if (anotherChannel) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            activeChannelId: anotherChannel.id,
            youtubeChannelId: anotherChannel.youtubeChannelId,
          },
        });
        newActiveChannel = anotherChannel;
      } else {
        // No channels left, clear the active channel
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            activeChannelId: null,
            youtubeChannelId: null,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      removedChannelId: channelId,
      newActiveChannel: newActiveChannel
        ? {
            id: newActiveChannel.id,
            youtubeChannelId: newActiveChannel.youtubeChannelId,
            title: newActiveChannel.title,
          }
        : null,
    });
  } catch (error) {
    console.error("Error removing channel:", error);
    return NextResponse.json(
      { error: "Failed to remove channel" },
      { status: 500 }
    );
  }
}
