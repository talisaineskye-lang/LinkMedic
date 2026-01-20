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
    const { channelId, channelTitle } = body;

    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      );
    }

    // Update user with selected channel
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        youtubeChannelId: channelId,
      },
    });

    return NextResponse.json({
      success: true,
      channelId,
      channelTitle,
    });
  } catch (error) {
    console.error("Error selecting channel:", error);
    return NextResponse.json(
      { error: "Failed to select channel" },
      { status: 500 }
    );
  }
}
