import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAllUserChannels } from "@/lib/youtube";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get tokens from Account table
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "google",
      },
      select: {
        access_token: true,
        refresh_token: true,
      },
    });

    if (!account?.access_token) {
      return NextResponse.json(
        { error: "Not authenticated with YouTube" },
        { status: 401 }
      );
    }

    const channels = await getAllUserChannels(
      account.access_token,
      account.refresh_token
    );

    return NextResponse.json({ channels });
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
}
