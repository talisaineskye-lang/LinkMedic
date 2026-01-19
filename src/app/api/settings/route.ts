import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validateSettings } from "@/lib/revenue-estimator";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ctrPercent, conversionPercent, avgOrderValue } = body;

    // Validate settings
    const validation = validateSettings({
      ctrPercent,
      conversionPercent,
      avgOrderValue,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    // Update user settings
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ctrPercent,
        conversionPercent,
        avgOrderValue,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
