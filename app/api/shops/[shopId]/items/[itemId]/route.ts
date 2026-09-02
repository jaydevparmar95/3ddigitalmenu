import { NextResponse } from "next/server";
import { updateItemInDb, deleteItemInDb } from "@/lib/db";
import { isRequestAdminAuthenticated } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ shopId: string; itemId: string }> }
) {
  try {
    if (!isRequestAdminAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }

    const { itemId } = await params;
    const body = await request.json();

    await updateItemInDb(itemId, body);
    return NextResponse.json({ success: true, message: "Dish updated successfully in database" });
  } catch (error: any) {
    console.error("PUT /api/shops/[shopId]/items/[itemId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update dish in database" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ shopId: string; itemId: string }> }
) {
  try {
    if (!isRequestAdminAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      );
    }

    const { itemId } = await params;
    await deleteItemInDb(itemId);

    return NextResponse.json({ success: true, message: "Dish deleted successfully from database" });
  } catch (error: any) {
    console.error("DELETE /api/shops/[shopId]/items/[itemId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete dish from database" },
      { status: 500 }
    );
  }
}
