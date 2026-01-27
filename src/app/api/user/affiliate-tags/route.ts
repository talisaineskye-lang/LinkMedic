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
        // Amazon region tags
        affiliateTagUS: true,
        affiliateTagUK: true,
        affiliateTagCA: true,
        affiliateTagDE: true,
        // Multi-network partner IDs
        bhphoto_bi: true,
        bhphoto_kbid: true,
        impact_sid: true,
        cj_pid: true,
        rakuten_id: true,
        shareasale_id: true,
        awin_id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      // Amazon region tags
      affiliateTagUS: user.affiliateTagUS,
      affiliateTagUK: user.affiliateTagUK,
      affiliateTagCA: user.affiliateTagCA,
      affiliateTagDE: user.affiliateTagDE,
      // Multi-network partner IDs
      bhphoto_bi: user.bhphoto_bi,
      bhphoto_kbid: user.bhphoto_kbid,
      impact_sid: user.impact_sid,
      cj_pid: user.cj_pid,
      rakuten_id: user.rakuten_id,
      shareasale_id: user.shareasale_id,
      awin_id: user.awin_id,
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
    const {
      // Amazon region tags
      affiliateTagUS,
      affiliateTagUK,
      affiliateTagCA,
      affiliateTagDE,
      // Multi-network partner IDs
      bhphoto_bi,
      bhphoto_kbid,
      impact_sid,
      cj_pid,
      rakuten_id,
      shareasale_id,
      awin_id,
    } = body;

    // Validate Amazon tag format (alphanumeric with dashes, typically ending in -20)
    const validateAmazonTag = (tag: string | null | undefined): string | null => {
      if (!tag || tag.trim() === "") return null;
      const cleaned = tag.trim();
      // Basic validation: alphanumeric with dashes, reasonable length
      if (!/^[a-zA-Z0-9-]{1,50}$/.test(cleaned)) {
        return null;
      }
      return cleaned;
    };

    // Validate partner ID (more flexible - alphanumeric with dashes/underscores)
    const validatePartnerId = (id: string | null | undefined): string | null => {
      if (!id || id.trim() === "") return null;
      const cleaned = id.trim();
      // Allow alphanumeric with dashes, underscores, reasonable length
      if (!/^[a-zA-Z0-9_-]{1,100}$/.test(cleaned)) {
        return null;
      }
      return cleaned;
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // Amazon region tags
        affiliateTagUS: validateAmazonTag(affiliateTagUS),
        affiliateTagUK: validateAmazonTag(affiliateTagUK),
        affiliateTagCA: validateAmazonTag(affiliateTagCA),
        affiliateTagDE: validateAmazonTag(affiliateTagDE),
        // Multi-network partner IDs
        bhphoto_bi: validatePartnerId(bhphoto_bi),
        bhphoto_kbid: validatePartnerId(bhphoto_kbid),
        impact_sid: validatePartnerId(impact_sid),
        cj_pid: validatePartnerId(cj_pid),
        rakuten_id: validatePartnerId(rakuten_id),
        shareasale_id: validatePartnerId(shareasale_id),
        awin_id: validatePartnerId(awin_id),
      },
    });

    console.log(`[AffiliateTags] Updated tags for user ${session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update affiliate tags:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
