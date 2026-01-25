import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, tier, source, feedback } = body;

    if (!email || !tier) {
      return NextResponse.json(
        { error: "Email and tier are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if already on waitlist
    const existing = await prisma.waitlist.findUnique({
      where: { email },
    });

    if (existing) {
      // Update feedback if provided
      if (feedback && !existing.feedback) {
        await prisma.waitlist.update({
          where: { email },
          data: { feedback },
        });
      }
      return NextResponse.json({
        success: true,
        message: "You're already on the waitlist!",
        alreadyExists: true,
      });
    }

    // Create new waitlist entry
    await prisma.waitlist.create({
      data: {
        email,
        tier,
        source: source || "unknown",
        feedback: feedback || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "You're on the list! We'll email you when Operator tier launches.",
    });
  } catch (error) {
    console.error("Error adding to waitlist:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}

// GET endpoint to check waitlist status (for admin or user check)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 }
      );
    }

    const entry = await prisma.waitlist.findUnique({
      where: { email },
      select: {
        tier: true,
        joinedAt: true,
      },
    });

    return NextResponse.json({
      onWaitlist: !!entry,
      entry,
    });
  } catch (error) {
    console.error("Error checking waitlist:", error);
    return NextResponse.json(
      { error: "Failed to check waitlist" },
      { status: 500 }
    );
  }
}
