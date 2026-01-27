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
    const { videoId, videoIds } = body;

    // Support both single videoId and bulk videoIds
    const idsToProcess = videoIds || (videoId ? [videoId] : []);

    if (idsToProcess.length === 0) {
      return NextResponse.json({ error: "Video ID(s) required" }, { status: 400 });
    }

    // Verify all videos belong to the user
    const videos = await prisma.video.findMany({
      where: {
        id: { in: idsToProcess },
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (videos.length === 0) {
      return NextResponse.json({ error: "No videos found" }, { status: 404 });
    }

    const validIds = videos.map((v) => v.id);

    // Mark disclosure issues as dismissed
    await prisma.video.updateMany({
      where: { id: { in: validIds } },
      data: { disclosureDismissed: true },
    });

    return NextResponse.json({ success: true, dismissed: validIds.length });
  } catch (error) {
    console.error("Error dismissing disclosure issue:", error);
    return NextResponse.json(
      { error: "Failed to dismiss disclosure issue" },
      { status: 500 }
    );
  }
}
