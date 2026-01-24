import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { scanUserLinks, getScanStats } from "@/lib/scanner";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run the scan
    const { checked, issues } = await scanUserLinks(session.user.id);

    // Mark first scan as completed (for onboarding flow)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hasCompletedFirstScan: true },
    });

    // Get updated stats
    const stats = await getScanStats(session.user.id);

    return NextResponse.json({
      success: true,
      checked,
      issuesFound: issues,
      stats,
    });
  } catch (error) {
    console.error("Error scanning links:", error);
    return NextResponse.json(
      { error: "Failed to scan links" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getScanStats(session.user.id);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error getting scan stats:", error);
    return NextResponse.json(
      { error: "Failed to get scan stats" },
      { status: 500 }
    );
  }
}
