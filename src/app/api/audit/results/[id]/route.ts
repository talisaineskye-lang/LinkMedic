import { NextRequest, NextResponse } from "next/server";
import { getAuditById, incrementShareCount } from "@/lib/public-audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const audit = await getAuditById(id);

    if (!audit) {
      return NextResponse.json(
        { error: "Audit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      auditId: id,
      ...audit,
    });
  } catch (error) {
    console.error("Error fetching audit:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit results" },
      { status: 500 }
    );
  }
}

// POST to track shares
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === "share") {
      await incrementShareCount(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error tracking share:", error);
    return NextResponse.json(
      { error: "Failed to track share" },
      { status: 500 }
    );
  }
}
