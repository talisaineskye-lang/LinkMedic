import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateSuggestedLink } from "@/lib/claude";

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

    if (linkIds && Array.isArray(linkIds) && linkIds.length > 0) {
      // Process specific links
      linksToProcess = await prisma.affiliateLink.findMany({
        where: {
          id: { in: linkIds },
          video: { userId: session.user.id },
          status: { in: ["NOT_FOUND", "OOS"] },
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
      linksToProcess = await prisma.affiliateLink.findMany({
        where: {
          video: { userId: session.user.id },
          status: { in: ["NOT_FOUND", "OOS"] },
          isFixed: false,
          suggestedLink: null, // Only links without suggestions
          merchant: "amazon", // Only Amazon links for now
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

    if (linksToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        generated: 0,
        message: "No links to process",
      });
    }

    let generated = 0;
    const errors: string[] = [];

    for (const link of linksToProcess) {
      // Only process Amazon links
      if (link.merchant !== "amazon") {
        continue;
      }

      try {
        const suggestedLink = await generateSuggestedLink(
          link.originalUrl,
          link.video.title,
          link.video.description || undefined
        );

        if (suggestedLink) {
          await prisma.affiliateLink.update({
            where: { id: link.id },
            data: { suggestedLink },
          });
          generated++;
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

    return NextResponse.json({
      success: true,
      processed: linksToProcess.length,
      generated,
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

    const count = await prisma.affiliateLink.count({
      where: {
        video: { userId: session.user.id },
        status: { in: ["NOT_FOUND", "OOS"] },
        isFixed: false,
        suggestedLink: null,
        merchant: "amazon",
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
