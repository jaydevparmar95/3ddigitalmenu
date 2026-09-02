import { NextResponse } from "next/server";
import { addItemInDb } from "@/lib/db";
import { isRequestAdminAuthenticated } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    if (!isRequestAdminAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }

    const { shopId } = await params;
    const body = await request.json();

    if (!body.name || body.price === undefined) {
      return NextResponse.json(
        { success: false, error: "Item name and price are required" },
        { status: 400 }
      );
    }

    const newItem = await addItemInDb(shopId, body);
    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error("POST /api/shops/[shopId]/items error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add dish to database" },
      { status: 500 }
    );
  }
}
