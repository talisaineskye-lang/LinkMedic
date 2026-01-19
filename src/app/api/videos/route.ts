import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videos = await prisma.video.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        youtubeVideoId: true,
        title: true,
        thumbnailUrl: true,
        viewCount: true,
        publishedAt: true,
        _count: {
          select: { affiliateLinks: true },
        },
        affiliateLinks: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { publishedAt: "desc" },
    });

    // Transform to include link stats
    const videosWithStats = videos.map(video => ({
      id: video.id,
      youtubeVideoId: video.youtubeVideoId,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      viewCount: video.viewCount,
      publishedAt: video.publishedAt,
      linkCount: video._count.affiliateLinks,
      brokenCount: video.affiliateLinks.filter(l => l.status === "NOT_FOUND" || l.status === "OOS").length,
      hasIssues: video.affiliateLinks.some(l => l.status === "NOT_FOUND" || l.status === "OOS"),
    }));

    return NextResponse.json({ videos: videosWithStats });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
