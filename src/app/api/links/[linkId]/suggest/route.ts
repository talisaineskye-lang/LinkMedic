import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { findReplacementProduct, getConfidenceLevel } from "@/lib/suggestion-engine";
import { isAmazonDomain } from "@/lib/link-audit-engine";
import { hasSpecialistAccess } from "@/lib/tier-limits";
import { LinkStatus } from "@prisma/client";

const BROKEN_STATUSES: LinkStatus[] = [
  LinkStatus.NOT_FOUND,
  LinkStatus.OOS,
  LinkStatus.OOS_THIRD_PARTY,
  LinkStatus.SEARCH_REDIRECT,
  LinkStatus.MISSING_TAG,
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { linkId } = await params;

    // Check tier access - must be SPECIALIST or OPERATOR (or active founding member)
    const hasAccess = await hasSpecialistAccess(session.user.id);
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        error: "UPGRADE_REQUIRED",
        message: "Upgrade to Specialist to unlock AI-powered replacement suggestions",
      }, { status: 403 });
    }

    // Check required API keys
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "ANTHROPIC_API_KEY is not configured",
      }, { status: 500 });
    }

    if (!process.env.SCRAPINGBEE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "SCRAPINGBEE_API_KEY is not configured",
      }, { status: 500 });
    }

    // Get the link and verify ownership
    const link = await prisma.affiliateLink.findFirst({
      where: {
        id: linkId,
        video: { userId: session.user.id },
        status: { in: BROKEN_STATUSES },
        isFixed: false,
      },
      select: {
        id: true,
        originalUrl: true,
        merchant: true,
        suggestedLink: true,
        suggestedTitle: true,
        suggestedPrice: true,
        suggestedAsin: true,  // Need this to exclude on refresh
        confidenceScore: true,
        video: {
          select: {
            title: true,
            description: true,
          },
        },
      },
    });

    if (!link) {
      return NextResponse.json({
        success: false,
        error: "Link not found or not a broken link",
      }, { status: 404 });
    }

    // Check for force refresh
    const body = await request.json().catch(() => ({}));
    const forceRefresh = body.refresh === true;

    // If suggestion already exists and not forcing refresh, return cached
    if (link.suggestedLink && !forceRefresh) {
      return NextResponse.json({
        success: true,
        cached: true,
        suggestion: {
          suggestedLink: link.suggestedLink,
          suggestedTitle: link.suggestedTitle,
          suggestedPrice: link.suggestedPrice,
          confidenceScore: link.confidenceScore,
          confidenceLevel: getConfidenceLevel(link.confidenceScore || 0),
        },
      });
    }

    // Only process Amazon links
    if (!isAmazonDomain(link.originalUrl) && link.merchant !== "amazon") {
      return NextResponse.json({
        success: false,
        error: "Only Amazon links are supported for AI suggestions",
      }, { status: 400 });
    }

    // Get user's affiliate tag
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { affiliateTag: true },
    });

    if (!user?.affiliateTag) {
      return NextResponse.json({
        success: false,
        error: "Please add your Amazon affiliate tag in Settings before finding replacements",
        requiresTag: true,
      }, { status: 400 });
    }

    // Build list of ASINs to exclude (previous suggestions that didn't work)
    const excludeAsins: string[] = [];
    if (forceRefresh && link.suggestedAsin) {
      excludeAsins.push(link.suggestedAsin);
      console.log(`[suggest] Excluding previous suggestion ASIN: ${link.suggestedAsin}`);
    }

    // Find replacement using AI
    console.log(`[suggest] Finding replacement for link ${linkId}`);
    const suggestion = await findReplacementProduct(
      link.originalUrl,
      link.video.title,
      link.video.description || undefined,
      undefined,
      user.affiliateTag,
      excludeAsins
    );

    if (suggestion.success && suggestion.bestMatch) {
      const { product, confidenceScore } = suggestion.bestMatch;

      // Save to database
      await prisma.affiliateLink.update({
        where: { id: linkId },
        data: {
          suggestedLink: product.url,
          suggestedTitle: product.title,
          suggestedAsin: product.asin,
          suggestedPrice: product.price,
          confidenceScore: confidenceScore,
          searchQuery: suggestion.searchQuery,
        },
      });

      console.log(`[suggest] Found: "${product.title.slice(0, 40)}..." (${confidenceScore}%)`);

      return NextResponse.json({
        success: true,
        cached: false,
        suggestion: {
          suggestedLink: product.url,
          suggestedTitle: product.title,
          suggestedPrice: product.price,
          confidenceScore: confidenceScore,
          confidenceLevel: getConfidenceLevel(confidenceScore),
        },
      });
    } else {
      console.log(`[suggest] No match for ${linkId}: ${suggestion.error}`);
      return NextResponse.json({
        success: false,
        error: suggestion.error || "No reliable replacement found",
      });
    }
  } catch (error) {
    console.error("Error finding replacement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to find replacement" },
      { status: 500 }
    );
  }
}
