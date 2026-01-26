import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        affiliateTagUS: true,
        affiliateTagUK: true,
        affiliateTagCA: true,
        affiliateTagDE: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      affiliateTagUS: user.affiliateTagUS,
      affiliateTagUK: user.affiliateTagUK,
      affiliateTagCA: user.affiliateTagCA,
      affiliateTagDE: user.affiliateTagDE,
    });
  } catch (error) {
    console.error("Failed to fetch affiliate tags:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { affiliateTagUS, affiliateTagUK, affiliateTagCA, affiliateTagDE } = body;

    // Validate tag format (should be alphanumeric with dashes, typically ending in -20)
    const validateTag = (tag: string | null | undefined): string | null => {
      if (!tag || tag.trim() === "") return null;
      const cleaned = tag.trim();
      // Basic validation: alphanumeric with dashes, reasonable length
      if (!/^[a-zA-Z0-9-]{1,50}$/.test(cleaned)) {
        return null;
      }
      return cleaned;
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        affiliateTagUS: validateTag(affiliateTagUS),
        affiliateTagUK: validateTag(affiliateTagUK),
        affiliateTagCA: validateTag(affiliateTagCA),
        affiliateTagDE: validateTag(affiliateTagDE),
      },
    });

    console.log(`[AffiliateTags] Updated tags for user ${session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update affiliate tags:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
