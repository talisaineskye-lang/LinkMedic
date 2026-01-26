import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/revenue-estimator";

/**
 * Ensure URL has the correct affiliate tag
 * Replaces any existing tag with the user's tag
 */
function ensureAffiliateTag(url: string, userTag: string): string {
  try {
    const urlObj = new URL(url);
    // Set the tag parameter, replacing any existing one
    urlObj.searchParams.set("tag", userTag);
    return urlObj.toString();
  } catch {
    // If URL parsing fails, try simple string replacement
    if (url.includes("tag=")) {
      return url.replace(/tag=[^&]+/, `tag=${userTag}`);
    }
    // Add tag if not present
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}tag=${userTag}`;
  }
}

/**
 * Fix common UTF-8 encoding issues in text
 */
function fixUtf8Encoding(text: string): string {
  return text
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€"/g, "—")
    .replace(/â€"/g, "–")
    .replace(/â€¦/g, "...")
    .replace(/Ã©/g, "é")
    .replace(/Ã¨/g, "è")
    .replace(/Ã /g, "à")
    .replace(/Ã¢/g, "â")
    .replace(/Ã®/g, "î")
    .replace(/Ã´/g, "ô")
    .replace(/Ã»/g, "û")
    .replace(/Ã§/g, "ç");
}

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
  // Get user info including affiliate tag
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, affiliateTag: true },
  });

  // User's affiliate tag for ensuring correct tags in replacement URLs
  const userTag = user?.affiliateTag;

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
      // Ensure replacement URL has user's affiliate tag (if they have one set)
      let finalSuggestedLink = link.suggestedLink!;
      if (userTag) {
        finalSuggestedLink = ensureAffiliateTag(finalSuggestedLink, userTag);
      }

      grouped.set(key, {
        originalUrl: link.originalUrl,
        suggestedLink: finalSuggestedLink,
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

/**
 * Generates a TubeBuddy-optimized Fix Script for bulk fixing broken links.
 * Video IDs are comma-separated for easy pasting into TubeBuddy's bulk editor.
 */
async function generateTubeBuddyFixScript(userId: string): Promise<{
  script: string;
  channelName: string;
  uniqueLinks: number;
  totalInstances: number;
}> {
  // Get user info including affiliate tag
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, affiliateTag: true },
  });

  // User's affiliate tag for ensuring correct tags in replacement URLs
  const userTag = user?.affiliateTag;

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
        select: { id: true, title: true, youtubeVideoId: true },
      },
    },
    orderBy: { originalUrl: "asc" },
  });

  // Group by original URL, skipping search URL suggestions
  const grouped = new Map<
    string,
    {
      originalUrl: string;
      suggestedLink: string;
      videos: { title: string; youtubeVideoId: string }[];
    }
  >();

  for (const link of links) {
    // Skip if suggested link is a search URL (not a valid product replacement)
    if (link.suggestedLink?.includes("/s?k=") || link.suggestedLink?.includes("/s?")) {
      continue;
    }

    const key = link.originalUrl;
    if (!grouped.has(key)) {
      // Ensure replacement URL has user's affiliate tag (if they have one set)
      let finalSuggestedLink = link.suggestedLink!;
      if (userTag) {
        finalSuggestedLink = ensureAffiliateTag(finalSuggestedLink, userTag);
      }

      grouped.set(key, {
        originalUrl: link.originalUrl,
        suggestedLink: finalSuggestedLink,
        videos: [],
      });
    }
    grouped.get(key)!.videos.push({
      title: fixUtf8Encoding(link.video.title),
      youtubeVideoId: link.video.youtubeVideoId,
    });
  }

  const channelName = user?.name || "Channel";
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate totals
  const totalUniqueLinks = grouped.size;
  const totalVideoInstances = Array.from(grouped.values()).reduce((sum, g) => sum + g.videos.length, 0);

  // Generate TubeBuddy-optimized script
  let script = `================================================================================
LINKMEDIC FIX SCRIPT - TUBEBUDDY EDITION
================================================================================
Channel: ${channelName}
Generated: ${date}
Total: ${totalUniqueLinks} unique broken links across ${totalVideoInstances} video instances

================================================================================
HOW TO USE WITH TUBEBUDDY
================================================================================

REQUIREMENTS:
- TubeBuddy browser extension installed
- TubeBuddy Pro or higher for bulk editing

STEPS:
1. Click the TubeBuddy dropdown (browser extension)
2. Select "Find & Replace Text" from Bulk Video Processing
3. Paste the FIND value into "Find Text" field
4. Paste the REPLACE value into "Replace Text" field
5. Click Continue
6. Choose "A list of video IDs that I specify"
7. Paste the VIDEO IDs below (comma-separated)
8. Click Continue
9. Select All Videos (make sure all are checked)
10. Confirm Action (Yes, do it)
11. Click Start
12. Repeat for each link below

`;

  let linkNum = 1;
  for (const [, data] of grouped) {
    // Create comma-separated video ID list (no spaces)
    const videoIds = data.videos.map((v) => v.youtubeVideoId).join(",");

    script += `================================================================================
LINK ${linkNum} OF ${totalUniqueLinks}
================================================================================

FIND:
${data.originalUrl}

REPLACE:
${data.suggestedLink}

VIDEO IDs (copy this entire line):
${videoIds}

`;
    linkNum++;
  }

  script += `================================================================================
SUMMARY
================================================================================
Total links to fix: ${totalUniqueLinks}
Total videos affected: ${totalVideoInstances}

Once complete, return to LinkMedic and click "Resync" to verify fixes.

Questions? support@link-medic.app
================================================================================
`;

  // Fix any remaining UTF-8 encoding issues
  script = fixUtf8Encoding(script);

  return {
    script,
    channelName,
    uniqueLinks: totalUniqueLinks,
    totalInstances: totalVideoInstances,
  };
}

/**
 * Generates a detailed summary report of broken links.
 * Includes statistics breakdown and link details.
 */
async function generateReport(userId: string): Promise<{
  script: string;
  channelName: string;
  uniqueLinks: number;
  totalInstances: number;
  totalRevenue: number;
}> {
  // Get user info including affiliate tag
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, affiliateTag: true },
  });

  const userTag = user?.affiliateTag;

  // Get all broken links (with or without suggestions)
  const links = await prisma.affiliateLink.findMany({
    where: {
      video: { userId },
      status: { in: ["NOT_FOUND", "OOS", "OOS_THIRD_PARTY", "SEARCH_REDIRECT", "MISSING_TAG", "REDIRECT"] },
      isFixed: false,
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
      suggestedLink: string | null;
      suggestedTitle: string | null;
      suggestedPrice: string | null;
      confidenceScore: number | null;
      status: string;
      videos: { title: string; youtubeVideoId: string; viewCount: number }[];
    }
  >();

  // Count by status for breakdown
  const statusCounts = {
    NOT_FOUND: 0,
    OOS: 0,
    OOS_THIRD_PARTY: 0,
    SEARCH_REDIRECT: 0,
    MISSING_TAG: 0,
    REDIRECT: 0,
  };

  let totalRevenue = 0;

  for (const link of links) {
    const key = link.originalUrl;

    // Count statuses
    if (link.status in statusCounts) {
      statusCounts[link.status as keyof typeof statusCounts]++;
    }

    if (!grouped.has(key)) {
      // Ensure replacement URL has user's affiliate tag (if they have one set)
      let finalSuggestedLink = link.suggestedLink;
      if (finalSuggestedLink && userTag) {
        finalSuggestedLink = ensureAffiliateTag(finalSuggestedLink, userTag);
      }

      grouped.set(key, {
        originalUrl: link.originalUrl,
        suggestedLink: finalSuggestedLink,
        suggestedTitle: link.suggestedTitle,
        suggestedPrice: link.suggestedPrice,
        confidenceScore: link.confidenceScore,
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

  // Calculate estimated revenue
  for (const [, data] of grouped) {
    const totalViews = data.videos.reduce((sum, v) => sum + v.viewCount, 0);
    const monthlyViews = totalViews * 0.07;
    const impact = monthlyViews * 0.01 * 0.015 * 45 * 0.03;
    totalRevenue += Math.min(impact * 12, 600);
  }

  const channelName = user?.name || "Channel";
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate report text
  let script = `================================================================================
LINKMEDIC REPORT
================================================================================
Channel: ${channelName}
Generated: ${date}

================================================================================
SUMMARY
================================================================================
Total broken links: ${grouped.size} unique links across ${links.length} video instances
Estimated annual loss: ${formatCurrency(Math.round(totalRevenue))}

================================================================================
BREAKDOWN BY ISSUE TYPE
================================================================================
404 Dead Links:        ${statusCounts.NOT_FOUND}
Out of Stock:          ${statusCounts.OOS}
3rd Party Only:        ${statusCounts.OOS_THIRD_PARTY}
Search Redirects:      ${statusCounts.SEARCH_REDIRECT}
Missing Tag:           ${statusCounts.MISSING_TAG}
Other Redirects:       ${statusCounts.REDIRECT}

================================================================================
BROKEN LINKS DETAIL
================================================================================
`;

  let linkNum = 1;
  for (const [, data] of grouped) {
    const statusLabel = getStatusLabel(data.status);
    const confidenceLabel = data.confidenceScore ? `${data.confidenceScore}%` : "N/A";
    const totalViews = data.videos.reduce((sum, v) => sum + v.viewCount, 0);

    script += `
--------------------------------------------------------------------------------
${linkNum}. [${statusLabel}]
--------------------------------------------------------------------------------
BROKEN URL:
${data.originalUrl}

`;

    if (data.suggestedLink) {
      script += `REPLACEMENT:
${data.suggestedLink}
`;
      if (data.suggestedTitle) {
        script += `Product: ${data.suggestedTitle}
`;
      }
      if (data.suggestedPrice) {
        script += `Price: ${data.suggestedPrice}
`;
      }
      script += `Confidence: ${confidenceLabel}
`;
    } else {
      script += `REPLACEMENT: No suggestion found yet
`;
    }

    script += `
Affects: ${data.videos.length} video${data.videos.length !== 1 ? "s" : ""} (${totalViews.toLocaleString()} total views)
Videos:
`;

    data.videos.slice(0, 5).forEach((video, i) => {
      const truncatedTitle = video.title.length > 50 ? video.title.slice(0, 47) + "..." : video.title;
      script += `  ${i + 1}. ${truncatedTitle}
`;
    });

    if (data.videos.length > 5) {
      script += `  ... and ${data.videos.length - 5} more
`;
    }

    linkNum++;
  }

  script += `
================================================================================
NEXT STEPS
================================================================================
1. Use "Find AI Replacements" in LinkMedic to get suggestions for links without them
2. Export the TubeBuddy script for bulk fixing
3. After fixing, click "Resync" in LinkMedic to verify

Questions? Contact support@link-medic.app
================================================================================
`;

  script = fixUtf8Encoding(script);

  return {
    script,
    channelName,
    uniqueLinks: grouped.size,
    totalInstances: links.length,
    totalRevenue,
  };
}

export async function GET(request: NextRequest) {
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

    if (!user || user.tier === "TRIAL" || user.tier === "AUDITOR") {
      return NextResponse.json(
        { error: "Fix Script export is available for paid tiers only" },
        { status: 403 }
      );
    }

    // Check format parameter - default to standard, support "tubebuddy" and "report"
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    let script: string;
    let channelName: string;
    let uniqueLinks: number;
    let totalInstances: number;

    if (format === "tubebuddy") {
      const result = await generateTubeBuddyFixScript(session.user.id);
      script = result.script;
      channelName = result.channelName;
      uniqueLinks = result.uniqueLinks;
      totalInstances = result.totalInstances;
    } else if (format === "report") {
      const result = await generateReport(session.user.id);
      script = result.script;
      channelName = result.channelName;
      uniqueLinks = result.uniqueLinks;
      totalInstances = result.totalInstances;
    } else {
      const result = await generateFixScript(session.user.id);
      script = result.script;
      channelName = result.channelName;
      uniqueLinks = result.uniqueLinks;
      totalInstances = result.totalInstances;
    }

    if (uniqueLinks === 0) {
      // Report format can show all broken links, even without suggestions
      const errorMsg = format === "report"
        ? "No broken links found."
        : "No broken links with suggestions found. Run AI replacement finder first.";
      return NextResponse.json(
        { error: errorMsg },
        { status: 404 }
      );
    }

    // Generate filename based on format
    const date = new Date().toISOString().split("T")[0];
    const safeChannelName = channelName.replace(/[^a-z0-9]/gi, "_").slice(0, 30);
    let filename: string;
    if (format === "tubebuddy") {
      filename = `LinkMedic_TubeBuddy_FixScript_${safeChannelName}_${date}.txt`;
    } else if (format === "report") {
      filename = `LinkMedic_Report_${safeChannelName}_${date}.txt`;
    } else {
      filename = `LinkMedic_FixScript_${safeChannelName}_${date}.txt`;
    }

    console.log(
      `[FixScript] Generated ${format || "standard"} script for ${channelName}: ${uniqueLinks} unique links, ${totalInstances} total instances`
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
