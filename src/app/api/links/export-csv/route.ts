import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkTierLimits, getUpgradeMessage } from "@/lib/tier-limits";
import {
  fetchExportData,
  generateBrokenLinksCSV,
  generateDisclosureCSV,
  getExportFilename,
} from "@/lib/export-generator";

/**
 * Export CSV files
 *
 * Query params:
 * - type: "broken-links" (default) | "disclosure-issues"
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check tier access for CSV export
    const tierCheck = await checkTierLimits(session.user.id, "csvExport");
    if (!tierCheck.allowed) {
      return NextResponse.json(
        {
          error: "Upgrade required",
          message: getUpgradeMessage("csvExport"),
          upgradeRequired: true,
          currentTier: tierCheck.currentTier,
        },
        { status: 403 }
      );
    }

    // Get export type from query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "broken-links";

    // Fetch export data
    const data = await fetchExportData(session.user.id);

    let csv: string;
    let filename: string;

    if (type === "disclosure-issues") {
      if (data.disclosureIssues.length === 0) {
        return NextResponse.json(
          { error: "No disclosure issues found" },
          { status: 404 }
        );
      }
      csv = generateDisclosureCSV(data);
      filename = getExportFilename(data.channelName, "disclosure-issues");
    } else {
      if (data.brokenLinks.length === 0) {
        return NextResponse.json(
          { error: "No broken links found" },
          { status: 404 }
        );
      }
      csv = generateBrokenLinksCSV(data);
      filename = getExportFilename(data.channelName, "broken-links");
    }

    console.log(
      `[Export] Generated ${type} CSV for ${data.channelName}: ${type === "disclosure-issues" ? data.disclosureIssues.length : data.brokenLinks.length} rows`
    );

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}
