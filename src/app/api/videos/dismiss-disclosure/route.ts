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
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json({ error: "Video ID required" }, { status: 400 });
    }

    // Verify the video belongs to the user
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Mark disclosure issue as dismissed
    await prisma.video.update({
      where: { id: videoId },
      data: { disclosureDismissed: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error dismissing disclosure issue:", error);
    return NextResponse.json(
      { error: "Failed to dismiss disclosure issue" },
      { status: 500 }
    );
  }
}
