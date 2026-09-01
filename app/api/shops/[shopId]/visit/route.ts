import { NextRequest, NextResponse } from "next/server";
import { recordUniqueShopVisitorInDb, getShopFromDb } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params;
    
    // Parse client body for visitorId / fingerprint
    let clientVisitorId = "";
    try {
      const body = await request.json();
      clientVisitorId = body?.visitorId || "";
    } catch {
      // ignore JSON parse error if empty
    }

    // IP & User-Agent for server-side deduplication
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = (forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1").trim();
    const userAgent = request.headers.get("user-agent") || "unknown-browser";

    // Compute composite unique visitor hash
    const visitorHash = clientVisitorId
      ? clientVisitorId.trim()
      : `${ipAddress}_${userAgent.substring(0, 100)}`;

    const result = await recordUniqueShopVisitorInDb(
      shopId,
      visitorHash,
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      shopId,
      visitorsCount: result.count,
      isNewVisitor: result.isNewVisitor,
    });
  } catch (error: any) {
    console.error("Record unique visitor error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record visitor" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params;
    const shop = await getShopFromDb(shopId);
    return NextResponse.json({
      success: true,
      shopId,
      visitorsCount: shop?.visitorsCount || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get visitors count" },
      { status: 500 }
    );
  }
}
