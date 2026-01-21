import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateSuggestedLink, extractAffiliateTag } from "@/lib/claude";
import { isAmazonUrl } from "@/lib/link-parser";
import { LinkStatus } from "@prisma/client";

// Rate limiting: max 10 suggestions at a time to avoid API overload
const MAX_SUGGESTIONS_PER_REQUEST = 10;
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { linkIds } = body;

    // If specific link IDs provided, use those; otherwise get all broken links without suggestions
    let linksToProcess;

    // All statuses that indicate a broken or problematic link needing a replacement
    const BROKEN_STATUSES: LinkStatus[] = [
      LinkStatus.NOT_FOUND,
      LinkStatus.OOS,
      LinkStatus.OOS_THIRD_PARTY,
      LinkStatus.SEARCH_REDIRECT,
      LinkStatus.MISSING_TAG,
    ];

    if (linkIds && Array.isArray(linkIds) && linkIds.length > 0) {
      // Process specific links
      linksToProcess = await prisma.affiliateLink.findMany({
        where: {
          id: { in: linkIds },
          video: { userId: session.user.id },
          status: { in: BROKEN_STATUSES },
          isFixed: false,
        },
        select: {
          id: true,
          originalUrl: true,
          merchant: true,
          suggestedLink: true,
          video: {
            select: {
              title: true,
              description: true,
            },
          },
        },
        take: MAX_SUGGESTIONS_PER_REQUEST,
      });
    } else {
      // Get all broken links without suggestions for this user
      // Include both "amazon" and "unknown" merchants (unknown may be Amazon links that weren't detected)
      linksToProcess = await prisma.affiliateLink.findMany({
        where: {
          video: { userId: session.user.id },
          status: { in: BROKEN_STATUSES },
          isFixed: false,
          suggestedLink: null, // Only links without suggestions
          // Include amazon and unknown (unknown may be Amazon links from before proper detection)
          merchant: { in: ["amazon", "unknown"] },
        },
        select: {
          id: true,
          originalUrl: true,
          merchant: true,
          suggestedLink: true,
          video: {
            select: {
              title: true,
              description: true,
            },
          },
        },
        take: MAX_SUGGESTIONS_PER_REQUEST,
      });
    }

    console.log(`[generate-suggestions] Found ${linksToProcess.length} links to process`);

    if (linksToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        generated: 0,
        message: "No links to process",
      });
    }

    // Log links for debugging
    linksToProcess.forEach((link, i) => {
      console.log(`[generate-suggestions] Link ${i + 1}: merchant=${link.merchant}, url=${link.originalUrl.slice(0, 50)}...`);
    });

    // Try to find a fallback affiliate tag from user's existing Amazon links
    // This is needed because many Amazon links (like amzn.to shortlinks) don't have visible ?tag= params
    let fallbackAffiliateTag: string | null = null;
    const allUserLinks = await prisma.affiliateLink.findMany({
      where: {
        video: { userId: session.user.id },
        merchant: "amazon",
      },
      select: { originalUrl: true },
      take: 50,
    });

    for (const link of allUserLinks) {
      const tag = extractAffiliateTag(link.originalUrl);
      if (tag) {
        fallbackAffiliateTag = tag;
        console.log(`[generate-suggestions] Found fallback affiliate tag from user's links: ${tag}`);
        break;
      }
    }

    if (!fallbackAffiliateTag) {
      console.log(`[generate-suggestions] No fallback affiliate tag found in user's links`);
    }

    let generated = 0;
    const errors: string[] = [];
    const skipped: string[] = [];

    for (const link of linksToProcess) {
      // Check if this is an Amazon link
      const isAmazon = link.merchant === "amazon" || isAmazonUrl(link.originalUrl);

      if (!isAmazon) {
        console.log(`[generate-suggestions] Skipping non-amazon link: ${link.id}, merchant: ${link.merchant}, url: ${link.originalUrl.slice(0, 50)}`);
        skipped.push(link.id);
        continue;
      }

      // Update merchant if it was "unknown" but is actually Amazon
      if (link.merchant === "unknown") {
        console.log(`[generate-suggestions] Updating merchant to 'amazon' for link: ${link.id}`);
        await prisma.affiliateLink.update({
          where: { id: link.id },
          data: { merchant: "amazon" },
        });
      }

      try {
        console.log(`[generate-suggestions] Calling Claude for link ${link.id}: ${link.originalUrl}`);
        const suggestedLink = await generateSuggestedLink(
          link.originalUrl,
          link.video.title,
          link.video.description || undefined,
          fallbackAffiliateTag || undefined
        );

        console.log(`[generate-suggestions] Claude response for ${link.id}: ${suggestedLink ? suggestedLink.slice(0, 50) + '...' : 'null'}`);

        if (suggestedLink) {
          await prisma.affiliateLink.update({
            where: { id: link.id },
            data: { suggestedLink },
          });
          generated++;
          console.log(`[generate-suggestions] Saved suggestion for ${link.id}`);
        } else {
          console.log(`[generate-suggestions] No suggestion returned for ${link.id}`);
        }
      } catch (error) {
        console.error(`Error generating suggestion for link ${link.id}:`, error);
        errors.push(link.id);
      }

      // Rate limiting between requests
      if (linksToProcess.indexOf(link) < linksToProcess.length - 1) {
        await sleep(DELAY_BETWEEN_REQUESTS);
      }
    }

    console.log(`[generate-suggestions] Complete: processed=${linksToProcess.length}, generated=${generated}, skipped=${skipped.length}, errors=${errors.length}`);

    return NextResponse.json({
      success: true,
      processed: linksToProcess.length,
      generated,
      skipped: skipped.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Generated ${generated} suggestion(s) for ${linksToProcess.length} link(s)`,
    });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}

// GET endpoint to check how many links need suggestions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // All statuses that indicate a broken or problematic link needing a replacement
    const BROKEN_STATUSES: LinkStatus[] = [
      LinkStatus.NOT_FOUND,
      LinkStatus.OOS,
      LinkStatus.OOS_THIRD_PARTY,
      LinkStatus.SEARCH_REDIRECT,
      LinkStatus.MISSING_TAG,
    ];

    const count = await prisma.affiliateLink.count({
      where: {
        video: { userId: session.user.id },
        status: { in: BROKEN_STATUSES },
        isFixed: false,
        suggestedLink: null,
        merchant: { in: ["amazon", "unknown"] },
      },
    });

    return NextResponse.json({
      linksNeedingSuggestions: count,
    });
  } catch (error) {
    console.error("Error checking suggestion status:", error);
    return NextResponse.json(
      { error: "Failed to check suggestion status" },
      { status: 500 }
    );
  }
}
