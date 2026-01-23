import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncUserVideos } from "@/lib/youtube";
import { extractLinksForUser } from "@/lib/scanner";
import { checkTierLimits, getUpgradeMessage } from "@/lib/tier-limits";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check tier access for resync feature
    const tierCheck = await checkTierLimits(session.user.id, "resync");
    if (!tierCheck.allowed) {
      return NextResponse.json({
        error: "Upgrade required",
        message: getUpgradeMessage("resync"),
        upgradeRequired: true,
        currentTier: tierCheck.currentTier,
      }, { status: 403 });
    }

    // Sync videos from YouTube
    const { synced, total } = await syncUserVideos(session.user.id);

    // Extract affiliate links from video descriptions and analyze disclosures
    // Also auto-detects and saves affiliate tag if user doesn't have one
    const { links, disclosureIssues, detectedAffiliateTag } = await extractLinksForUser(session.user.id);

    return NextResponse.json({
      success: true,
      synced,
      total,
      linksExtracted: links,
      disclosureIssues,
      // Let frontend know if we auto-detected their affiliate tag
      detectedAffiliateTag,
    });
  } catch (error) {
    console.error("Error syncing videos:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to sync videos: ${errorMessage}` },
      { status: 500 }
    );
  }
}
