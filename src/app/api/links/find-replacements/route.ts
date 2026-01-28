import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { findReplacementProduct, getConfidenceLevel } from "@/lib/suggestion-engine";
import { isAmazonDomain } from "@/lib/link-audit-engine";
import { checkTierLimits, getUpgradeMessage } from "@/lib/tier-limits";
import { LinkStatus } from "@prisma/client";
import pLimit from "p-limit";

// Rate limiting: max 5 at a time, process 2 concurrently
const MAX_PER_REQUEST = 5;
const CONCURRENT_LIMIT = 2;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check tier access for AI suggestions
    const tierCheck = await checkTierLimits(session.user.id, "aiSuggestions");
    if (!tierCheck.allowed) {
      return NextResponse.json({
        error: "Upgrade required",
        message: getUpgradeMessage("aiSuggestions"),
        upgradeRequired: true,
        currentTier: tierCheck.currentTier,
      }, { status: 403 });
    }

    // Check required API keys
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

    // All statuses that need replacement
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

    console.log(`[find-replacements] Processing ${linksToProcess.length} links`);

    if (linksToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        found: 0,
        message: "No links to process",
      });
    }

    // Get user's affiliate tag from their settings - REQUIRED
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { affiliateTag: true },
    });

    if (!user?.affiliateTag) {
      return NextResponse.json({
        success: false,
        error: "Please add your Amazon affiliate tag in Settings before finding replacements.",
        processed: 0,
        found: 0,
        requiresTag: true,
      }, { status: 400 });
    }

    const affiliateTag = user.affiliateTag;
    console.log(`[find-replacements] Using user's affiliate tag: ${affiliateTag}`);

    let found = 0;
    const results: Array<{
      linkId: string;
      success: boolean;
      productTitle: string | null;
      productUrl: string | null;
      productImage: string | null;
      productPrice: string | null;
      confidenceScore: number | null;
      confidenceLevel: string;
      error?: string;
    }> = [];

    // Process links concurrently with limit
    const limit = pLimit(CONCURRENT_LIMIT);

    const processLink = async (link: typeof linksToProcess[0]) => {
      // Only process Amazon links
      if (!isAmazonDomain(link.originalUrl) && link.merchant !== "amazon") {
        console.log(`[find-replacements] Skipping non-Amazon link: ${link.id}`);
        return {
          linkId: link.id,
          success: false,
          productTitle: null,
          productUrl: null,
          productImage: null,
          productPrice: null,
          confidenceScore: null,
          confidenceLevel: "none",
          error: "Not an Amazon link",
        };
      }

      try {
        // Find replacement using new engine
        const suggestion = await findReplacementProduct(
          link.originalUrl,
          link.video.title,
          link.video.description || undefined,
          undefined, // We don't have original product title
          affiliateTag
        );

        if (suggestion.success && suggestion.bestMatch) {
          const { product, confidenceScore } = suggestion.bestMatch;

          console.log(`[find-replacements] Found: "${product.title.slice(0, 40)}..." (${confidenceScore}%)`);

          // Save to database
          await prisma.affiliateLink.update({
            where: { id: link.id },
            data: {
              suggestedLink: product.url,
              suggestedTitle: product.title,
              suggestedAsin: product.asin,
              suggestedPrice: product.price,
              confidenceScore: confidenceScore,
              searchQuery: suggestion.searchQuery,
            },
          });

          return {
            linkId: link.id,
            success: true,
            productTitle: product.title,
            productUrl: product.url,
            productImage: product.imageUrl,
            productPrice: product.price,
            confidenceScore: confidenceScore,
            confidenceLevel: getConfidenceLevel(confidenceScore),
          };
        } else {
          console.log(`[find-replacements] No match for ${link.id}: ${suggestion.error}`);
          return {
            linkId: link.id,
            success: false,
            productTitle: null,
            productUrl: null,
            productImage: null,
            productPrice: null,
            confidenceScore: null,
            confidenceLevel: "none",
            error: suggestion.error || "No reliable match found",
          };
        }
      } catch (error) {
        console.error(`[find-replacements] Error for ${link.id}:`, error);
        return {
          linkId: link.id,
          success: false,
          productTitle: null,
          productUrl: null,
          productImage: null,
          productPrice: null,
          confidenceScore: null,
          confidenceLevel: "none",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    };

    // Run all links through the concurrency limiter
    const processedResults = await Promise.all(
      linksToProcess.map(link => limit(() => processLink(link)))
    );

    // Collect results
    for (const result of processedResults) {
      results.push(result);
      if (result.success) found++;
    }

    const message = `Found ${found} replacement(s) for ${linksToProcess.length} link(s)`;
    console.log(`[find-replacements] ${message}`);

    return NextResponse.json({
      success: true,
      processed: linksToProcess.length,
      found,
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
