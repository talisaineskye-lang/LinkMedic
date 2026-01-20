import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllUserChannels, getValidAccessToken } from "@/lib/youtube";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get valid tokens (refreshes if expired)
    const { accessToken, refreshToken } = await getValidAccessToken(session.user.id);

    const channels = await getAllUserChannels(accessToken, refreshToken);

    return NextResponse.json({ channels });
  } catch (error) {
    console.error("Error fetching channels:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch channels: ${errorMessage}` },
      { status: 500 }
    );
  }
}
