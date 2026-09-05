import { NextResponse } from "next/server";
import { getAllShopsFromDb, createShopInDb } from "@/lib/db";
import { isRequestAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const shops = await getAllShopsFromDb();
    const res = NextResponse.json({ success: true, shops });
    // Cache at edge/CDN for 30s, serve stale for up to 60s while revalidating
    res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    return res;
  } catch (error: any) {
    console.error("GET /api/shops error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch shops from database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isRequestAdminAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Shop name is required" },
        { status: 400 }
      );
    }

    const newShop = await createShopInDb(body);
    return NextResponse.json({ success: true, shop: newShop });
  } catch (error: any) {
    console.error("POST /api/shops error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create shop in database" },
      { status: 500 }
    );
  }
}
