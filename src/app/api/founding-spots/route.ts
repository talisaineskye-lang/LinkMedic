import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const FOUNDING_MEMBER_LIMIT = 50;

export async function GET() {
  try {
    const foundingMemberCount = await prisma.user.count({
      where: { isFoundingMember: true },
    });

    const spotsRemaining = Math.max(0, FOUNDING_MEMBER_LIMIT - foundingMemberCount);
    const isClosed = spotsRemaining === 0;

    return NextResponse.json({
      spotsRemaining,
      totalSpots: FOUNDING_MEMBER_LIMIT,
      spotsTaken: foundingMemberCount,
      isClosed,
    });
  } catch (error) {
    console.error("[API] Failed to fetch founding spots:", error);
    return NextResponse.json(
      { error: "Failed to fetch founding spots" },
      { status: 500 }
    );
  }
}
