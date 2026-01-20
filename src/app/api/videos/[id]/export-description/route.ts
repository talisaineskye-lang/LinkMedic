import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get video with description and links
    const video = await prisma.video.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        affiliateLinks: {
          select: {
            originalUrl: true,
            suggestedLink: true,
            status: true,
            isFixed: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (!video.description) {
      return NextResponse.json({ error: "Video has no description" }, { status: 400 });
    }

    // Build the corrected description
    let correctedDescription = video.description;
    const replacements: { original: string; suggested: string }[] = [];

    for (const link of video.affiliateLinks) {
      // Only replace broken links that have suggestions
      if (
        (link.status === "NOT_FOUND" || link.status === "OOS") &&
        link.suggestedLink &&
        !link.isFixed
      ) {
        correctedDescription = correctedDescription.replace(
          link.originalUrl,
          link.suggestedLink
        );
        replacements.push({
          original: link.originalUrl,
          suggested: link.suggestedLink,
        });
      }
    }

    return NextResponse.json({
      videoId: video.id,
      videoTitle: video.title,
      originalDescription: video.description,
      correctedDescription,
      replacements,
      hasChanges: replacements.length > 0,
    });
  } catch (error) {
    console.error("Error generating corrected description:", error);
    return NextResponse.json(
      { error: "Failed to generate corrected description" },
      { status: 500 }
    );
  }
}
