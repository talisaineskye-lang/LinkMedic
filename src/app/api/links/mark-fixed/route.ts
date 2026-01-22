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

    // Support both single linkId and array of linkIds for bulk operations
    const linkIds: string[] = body.linkIds || (body.linkId ? [body.linkId] : []);

    if (linkIds.length === 0) {
      return NextResponse.json({ error: "Link ID(s) required" }, { status: 400 });
    }

    // Verify all links belong to the user
    const links = await prisma.affiliateLink.findMany({
      where: {
        id: { in: linkIds },
        video: { userId: session.user.id },
      },
      select: { id: true },
    });

    if (links.length === 0) {
      return NextResponse.json({ error: "No valid links found" }, { status: 404 });
    }

    const validLinkIds = links.map(l => l.id);

    // Mark all as fixed (bulk update)
    const result = await prisma.affiliateLink.updateMany({
      where: { id: { in: validLinkIds } },
      data: {
        isFixed: true,
        dateFixed: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      fixedCount: result.count,
    });
  } catch (error) {
    console.error("Error marking link(s) as fixed:", error);
    return NextResponse.json(
      { error: "Failed to mark link(s) as fixed" },
      { status: 500 }
    );
  }
}
