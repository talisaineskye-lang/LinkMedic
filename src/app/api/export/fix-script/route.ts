import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  fetchExportData,
  generateFixScriptMarkdown,
  generateTubeBuddyGuide,
  getExportFilename,
} from "@/lib/export-generator";

/**
 * Export Fix Scripts and TubeBuddy Guides
 *
 * Query params:
 * - format: "manual" (default) | "tubebuddy"
 *
 * Both formats now generate polished Markdown files with:
 * - Professional headers and summaries
 * - Progress tracking checkboxes
 * - Properly formatted code blocks
 * - Sorted by priority/views
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is on paid tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true },
    });

    if (!user || user.tier === "TRIAL" || user.tier === "AUDITOR") {
      return NextResponse.json(
        { error: "Fix Script export is available for paid tiers only" },
        { status: 403 }
      );
    }

    // Get format from query params
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "manual";

    // Fetch export data
    const data = await fetchExportData(session.user.id);

    // Check if we have links with suggestions
    const linksWithSuggestions = data.groupedLinks.filter((g) => g.suggestedFix);

    if (linksWithSuggestions.length === 0) {
      return NextResponse.json(
        {
          error: "No broken links with suggestions found. Run AI replacement finder first.",
        },
        { status: 404 }
      );
    }

    let content: string;
    let filename: string;
    let contentType: string;

    if (format === "tubebuddy") {
      content = generateTubeBuddyGuide(data);
      filename = getExportFilename(data.channelName, "tubebuddy-guide");
      contentType = "text/markdown; charset=utf-8";
    } else {
      content = generateFixScriptMarkdown(data);
      filename = getExportFilename(data.channelName, "fix-script");
      contentType = "text/markdown; charset=utf-8";
    }

    console.log(
      `[Export] Generated ${format} script for ${data.channelName}: ${data.stats.uniqueBrokenLinks} unique links, ${data.stats.totalBrokenInstances} total instances`
    );

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
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
