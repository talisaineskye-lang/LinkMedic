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

    const { linkId } = await request.json();

    if (!linkId) {
      return NextResponse.json({ error: "Link ID required" }, { status: 400 });
    }

    // Verify the link belongs to the user
    const link = await prisma.affiliateLink.findFirst({
      where: {
        id: linkId,
        video: { userId: session.user.id },
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Mark as fixed
    await prisma.affiliateLink.update({
      where: { id: linkId },
      data: {
        isFixed: true,
        dateFixed: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking link as fixed:", error);
    return NextResponse.json(
      { error: "Failed to mark link as fixed" },
      { status: 500 }
    );
  }
}
