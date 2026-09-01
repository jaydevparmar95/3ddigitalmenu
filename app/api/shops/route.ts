import { NextResponse } from "next/server";
import { getAllShopsFromDb, createShopInDb } from "@/lib/db";

export async function GET() {
  try {
    const shops = await getAllShopsFromDb();
    return NextResponse.json({ success: true, shops });
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
