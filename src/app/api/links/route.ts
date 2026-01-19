import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type LinkStatus = "OK" | "OOS" | "NOT_FOUND" | "REDIRECT" | "UNKNOWN";
const VALID_STATUSES: LinkStatus[] = ["OK", "OOS", "NOT_FOUND", "REDIRECT", "UNKNOWN"];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as LinkStatus | null;
    const videoId = searchParams.get("videoId");

    const where: {
      video: { userId: string };
      status?: LinkStatus;
      videoId?: string;
    } = {
      video: { userId: session.user.id },
    };

    if (status && VALID_STATUSES.includes(status)) {
      where.status = status;
    }

    if (videoId) {
      where.videoId = videoId;
    }

    const links = await prisma.affiliateLink.findMany({
      where,
      select: {
        id: true,
        originalUrl: true,
        merchant: true,
        status: true,
        lastCheckedAt: true,
        video: {
          select: {
            id: true,
            title: true,
            viewCount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}
