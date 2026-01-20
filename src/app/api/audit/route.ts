import { NextRequest, NextResponse } from "next/server";
import { runPublicAudit } from "@/lib/public-audit";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// Rate limiting: max 10 audits per IP per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_AUDITS_PER_WINDOW = 10;

async function checkRateLimit(ipAddress: string): Promise<boolean> {
  const ipHash = crypto.createHash("sha256").update(ipAddress).digest("hex").slice(0, 16);
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW);

  const recentAudits = await prisma.publicAudit.count({
    where: {
      ipHash,
      createdAt: { gte: windowStart },
    },
  });

  return recentAudits < MAX_AUDITS_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelUrl } = body;

    if (!channelUrl || typeof channelUrl !== "string") {
      return NextResponse.json(
        { error: "Please provide a YouTube channel URL or ID" },
        { status: 400 }
      );
    }

    // Get IP for rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // Check rate limit
    const withinLimit = await checkRateLimit(ip);
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Run the audit
    const result = await runPublicAudit(channelUrl, ip);

    // Get the audit ID for sharing
    const audit = await prisma.publicAudit.findFirst({
      where: { channelId: result.channelId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      auditId: audit?.id,
      ...result,
    });
  } catch (error) {
    console.error("Audit error:", error);
    const message = error instanceof Error ? error.message : "Failed to run audit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
