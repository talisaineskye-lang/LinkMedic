import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { email, category, subject, message } = await req.json();

    // Validate required fields
    if (!email || !category || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate category
    if (!["support", "billing", "partnerships", "general"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Validate lengths
    if (subject.length > 200) {
      return NextResponse.json(
        { error: "Subject too long (max 200 characters)" },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        email,
        category,
        subject,
        message,
        userId: session?.user?.id || null,
      },
    });

    // Log for now (can add email notification later)
    console.log("New contact submission:", {
      id: submission.id,
      category: submission.category,
      email: submission.email,
      subject: submission.subject,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit message" },
      { status: 500 }
    );
  }
}
