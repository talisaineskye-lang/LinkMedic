import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncUserVideos } from "@/lib/youtube";
import { extractLinksForUser } from "@/lib/scanner";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sync videos from YouTube
    const { synced, total } = await syncUserVideos(session.user.id);

    // Extract affiliate links from video descriptions
    const { links } = await extractLinksForUser(session.user.id);

    return NextResponse.json({
      success: true,
      synced,
      total,
      linksExtracted: links,
    });
  } catch (error) {
    console.error("Error syncing videos:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to sync videos: ${errorMessage}` },
      { status: 500 }
    );
  }
}
