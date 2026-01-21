import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractProductSearchQuery, extractAffiliateTag } from "@/lib/claude";
import { searchAmazon } from "@/lib/amazon-search";
import { isAmazonUrl } from "@/lib/link-parser";
import { LinkStatus } from "@prisma/client";

// Rate limiting: max 5 at a time to avoid API overload
const MAX_PER_REQUEST = 5;
const DELAY_BETWEEN_REQUESTS = 1500; // 1.5 seconds

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if required API keys are configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "ANTHROPIC_API_KEY is not configured",
        processed: 0,
        found: 0,
      }, { status: 500 });
    }

    if (!process.env.SCRAPINGBEE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "SCRAPINGBEE_API_KEY is not configured",
        processed: 0,
        found: 0,
      }, { status: 500 });
    }

    const body = await request.json();
    const { linkIds } = body;

    // All statuses that indicate a broken link needing replacement
    const BROKEN_STATUSES: LinkStatus[] = [
      LinkStatus.NOT_FOUND,
      LinkStatus.OOS,
      LinkStatus.OOS_THIRD_PARTY,
      LinkStatus.SEARCH_REDIRECT,
      LinkStatus.MISSING_TAG,
    ];

    // Get links to process
    let linksToProcess;

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
        take: MAX_PER_REQUEST,
      });
    } else {
      // Get broken links without replacements
      linksToProcess = await prisma.affiliateLink.findMany({
        where: {
          video: { userId: session.user.id },
          status: { in: BROKEN_STATUSES },
          isFixed: false,
          suggestedLink: null,
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
        take: MAX_PER_REQUEST,
      });
    }

    console.log(`[find-replacements] Found ${linksToProcess.length} links to process`);

    if (linksToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        found: 0,
        message: "No links to process",
      });
    }

    // Try to find a fallback affiliate tag from user's existing Amazon links
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
        console.log(`[find-replacements] Found fallback affiliate tag: ${tag}`);
        break;
      }
    }

    let found = 0;
    const errors: string[] = [];
    const skipped: string[] = [];
    const results: Array<{
      linkId: string;
      productTitle: string | null;
      productUrl: string | null;
      confidenceScore?: number;
    }> = [];

    for (const link of linksToProcess) {
      // Check if this is an Amazon link
      const isAmazon = link.merchant === "amazon" || isAmazonUrl(link.originalUrl);

      if (!isAmazon) {
        console.log(`[find-replacements] Skipping non-Amazon link: ${link.id}`);
        skipped.push(link.id);
        continue;
      }

      try {
        // Step 1: Extract product search query using Claude
        console.log(`[find-replacements] Extracting search query for: ${link.originalUrl.slice(0, 50)}...`);

        const searchQuery = await extractProductSearchQuery(
          link.originalUrl,
          link.video.title,
          link.video.description || undefined
        );

        if (!searchQuery) {
          console.log(`[find-replacements] No search query extracted for ${link.id}`);
          results.push({ linkId: link.id, productTitle: null, productUrl: null });
          continue;
        }

        // Step 2: Search Amazon for the product
        console.log(`[find-replacements] Searching Amazon for: "${searchQuery}"`);

        const affiliateTag = extractAffiliateTag(link.originalUrl) || fallbackAffiliateTag;
        const searchResult = await searchAmazon(searchQuery, affiliateTag);

        if (!searchResult.success || !searchResult.result) {
          console.log(`[find-replacements] No search results for ${link.id}: ${searchResult.error}`);
          results.push({ linkId: link.id, productTitle: null, productUrl: null });
          continue;
        }

        // Step 3: Save the result
        const { title, url, asin, price, confidenceScore } = searchResult.result;

        console.log(`[find-replacements] Found replacement for ${link.id}: "${title.slice(0, 40)}..." (${confidenceScore}% confidence)`);

        await prisma.affiliateLink.update({
          where: { id: link.id },
          data: {
            suggestedLink: url,
            suggestedTitle: title,
            suggestedAsin: asin,
            suggestedPrice: price,
            confidenceScore: confidenceScore,
            searchQuery: searchQuery,
          },
        });

        found++;
        results.push({ linkId: link.id, productTitle: title, productUrl: url, confidenceScore });

      } catch (error) {
        console.error(`[find-replacements] Error processing ${link.id}:`, error);
        errors.push(link.id);
      }

      // Rate limiting between requests
      if (linksToProcess.indexOf(link) < linksToProcess.length - 1) {
        await sleep(DELAY_BETWEEN_REQUESTS);
      }
    }

    console.log(`[find-replacements] Complete: processed=${linksToProcess.length}, found=${found}, skipped=${skipped.length}, errors=${errors.length}`);

    // Build response message
    let message = `Found ${found} replacement(s) for ${linksToProcess.length} link(s)`;
    if (skipped.length > 0) {
      message += ` (${skipped.length} non-Amazon links skipped)`;
    }
    if (errors.length > 0) {
      message += ` (${errors.length} errors)`;
    }

    return NextResponse.json({
      success: true,
      processed: linksToProcess.length,
      found,
      skipped: skipped.length,
      errors: errors.length > 0 ? errors : undefined,
      results,
      message,
    });
  } catch (error) {
    console.error("Error finding replacements:", error);
    return NextResponse.json(
      { error: "Failed to find replacements" },
      { status: 500 }
    );
  }
}

// GET endpoint to check how many links need replacements
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      },
    });

    return NextResponse.json({
      linksNeedingReplacements: count,
    });
  } catch (error) {
    console.error("Error checking replacement status:", error);
    return NextResponse.json(
      { error: "Failed to check replacement status" },
      { status: 500 }
    );
  }
}
