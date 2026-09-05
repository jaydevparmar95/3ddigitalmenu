import { NextRequest, NextResponse } from "next/server";
import { recordUniqueShopVisitorInDb, getDbPool, ensureDatabaseAndTables } from "@/lib/db";
import mysql from "mysql2/promise";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params;
    
    // 1. Parse client body for visitorId
    let clientVisitorId = "";
    try {
      const body = await request.json();
      clientVisitorId = body?.visitorId || "";
    } catch {
      // ignore JSON parse error
    }

    // 2. Check for cookie fallback (helpful for mobile Safari private & in-app webviews)
    if (!clientVisitorId) {
      clientVisitorId = request.cookies.get("digital_menu_vid")?.value || "";
    }

    // 3. IP & User-Agent for server-side deduplication
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = (forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1").trim();
    const userAgent = request.headers.get("user-agent") || "unknown-mobile-browser";

    // 4. Compute composite unique visitor hash
    const visitorHash = clientVisitorId
      ? clientVisitorId.trim()
      : `mob_${Buffer.from(`${ipAddress}_${userAgent}`).toString("base64").substring(0, 48)}`;

    const result = await recordUniqueShopVisitorInDb(
      shopId,
      visitorHash,
      ipAddress,
      userAgent
    );

    const response = NextResponse.json({
      success: true,
      shopId,
      visitorsCount: result.count,
      isNewVisitor: result.isNewVisitor,
      visitorId: visitorHash,
    });

    // Set 1-year persistent cookie for mobile browsers
    response.cookies.set("digital_menu_vid", visitorHash, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
      httpOnly: false,
    });

    return response;
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
    // Direct targeted query — no need to load full shop + all items + all categories
    await ensureDatabaseAndTables();
    const db = getDbPool();
    const [rows] = await db.query<mysql.RowDataPacket[]>(
      "SELECT `visitors_count` FROM `shops` WHERE `id` = ? LIMIT 1",
      [shopId]
    );
    return NextResponse.json({
      success: true,
      shopId,
      visitorsCount: Number(rows[0]?.visitors_count || 0),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get visitors count" },
      { status: 500 }
    );
  }
}
