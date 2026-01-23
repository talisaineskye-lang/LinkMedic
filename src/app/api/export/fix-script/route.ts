import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/revenue-estimator";

/**
 * Generates a Fix Script for bulk fixing broken links.
 * Groups broken links by original URL so creators can batch-fix efficiently.
 */
async function generateFixScript(userId: string): Promise<{
  script: string;
  channelName: string;
  uniqueLinks: number;
  totalInstances: number;
  totalRevenue: number;
}> {
  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  // Get all broken links with suggestions, grouped by original URL
  const links = await prisma.affiliateLink.findMany({
    where: {
      video: { userId },
      status: { in: ["NOT_FOUND", "OOS", "OOS_THIRD_PARTY", "SEARCH_REDIRECT", "MISSING_TAG", "REDIRECT"] },
      isFixed: false,
      suggestedLink: { not: null },
    },
    include: {
      video: {
        select: { id: true, title: true, youtubeVideoId: true, viewCount: true },
      },
    },
    orderBy: { originalUrl: "asc" },
  });

  // Group by original URL
  const grouped = new Map<
    string,
    {
      originalUrl: string;
      suggestedLink: string;
      suggestedTitle: string | null;
      status: string;
      videos: { title: string; youtubeVideoId: string; viewCount: number }[];
    }
  >();

  let totalRevenue = 0;

  for (const link of links) {
    const key = link.originalUrl;
    if (!grouped.has(key)) {
      grouped.set(key, {
        originalUrl: link.originalUrl,
        suggestedLink: link.suggestedLink!,
        suggestedTitle: link.suggestedTitle,
        status: link.status,
        videos: [],
      });
    }
    grouped.get(key)!.videos.push({
      title: link.video.title,
      youtubeVideoId: link.video.youtubeVideoId,
      viewCount: link.video.viewCount,
    });
  }

  // Calculate estimated revenue (simplified calculation)
  // Using conservative estimates: 1% CTR, 1.5% CR, $45 AOV, 3% commission
  for (const [, data] of grouped) {
    const totalViews = data.videos.reduce((sum, v) => sum + v.viewCount, 0);
    // Estimate monthly views as 7% of lifetime (conservative for older videos)
    const monthlyViews = totalViews * 0.07;
    const impact = monthlyViews * 0.01 * 0.015 * 45 * 0.03;
    totalRevenue += Math.min(impact * 12, 600); // Cap at $600/year per link
  }

  const channelName = user?.name || "Channel";
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate script text
  let script = `================================================================================
LINKMEDIC FIX SCRIPT
================================================================================
Channel: ${channelName}
Generated: ${date}
Total: ${grouped.size} unique broken links across ${links.length} video instances

================================================================================
HOW TO USE THIS SCRIPT:
================================================================================
1. For each link below, copy the FIND and REPLACE values
2. Open the YouTube Studio links in batches of 10-20 tabs
3. In each video: Ctrl+F (or Cmd+F) -> paste FIND -> delete it -> paste REPLACE
4. Save and close, move to next tab
5. Or use TubeBuddy/VidIQ bulk description editor with these find/replace pairs

`;

  let linkNum = 1;
  for (const [, data] of grouped) {
    const statusLabel = getStatusLabel(data.status);

    script += `================================================================================
LINK ${linkNum} OF ${grouped.size} [${statusLabel}]
================================================================================

FIND:
${data.originalUrl}

REPLACE WITH:
${data.suggestedLink}
${data.suggestedTitle ? `(${data.suggestedTitle})` : ""}

APPEARS IN ${data.videos.length} VIDEO${data.videos.length !== 1 ? "S" : ""}:
`;

    data.videos.forEach((video, i) => {
      const truncatedTitle = video.title.length > 60 ? video.title.slice(0, 57) + "..." : video.title;
      script += `  ${i + 1}. ${truncatedTitle}
     https://studio.youtube.com/video/${video.youtubeVideoId}/edit
`;
    });

    script += "\n";
    linkNum++;
  }

  script += `================================================================================
SUMMARY
================================================================================
Once you fix these ${grouped.size} unique links, you'll have repaired
${links.length} total video descriptions.

Estimated annual revenue recovered: ${formatCurrency(Math.round(totalRevenue))}

Questions? Contact support@link-medic.app
================================================================================
`;

  return {
    script,
    channelName,
    uniqueLinks: grouped.size,
    totalInstances: links.length,
    totalRevenue,
  };
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "NOT_FOUND":
      return "404 - Dead Link";
    case "OOS":
      return "Out of Stock";
    case "OOS_THIRD_PARTY":
      return "3rd Party Only";
    case "SEARCH_REDIRECT":
      return "Redirected to Search";
    case "MISSING_TAG":
      return "Missing Affiliate Tag";
    case "REDIRECT":
      return "Redirect";
    default:
      return status;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is on paid tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true, name: true },
    });

    if (!user || user.tier === "FREE") {
      return NextResponse.json(
        { error: "Fix Script export is available for paid tiers only" },
        { status: 403 }
      );
    }

    const { script, channelName, uniqueLinks, totalInstances } = await generateFixScript(
      session.user.id
    );

    if (uniqueLinks === 0) {
      return NextResponse.json(
        { error: "No broken links with suggestions found. Run AI replacement finder first." },
        { status: 404 }
      );
    }

    // Generate filename
    const date = new Date().toISOString().split("T")[0];
    const safeChannelName = channelName.replace(/[^a-z0-9]/gi, "_").slice(0, 30);
    const filename = `LinkMedic_FixScript_${safeChannelName}_${date}.txt`;

    console.log(
      `[FixScript] Generated for ${channelName}: ${uniqueLinks} unique links, ${totalInstances} total instances`
    );

    return new NextResponse(script, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating fix script:", error);
    return NextResponse.json(
      { error: "Failed to generate fix script" },
      { status: 500 }
    );
  }
}
