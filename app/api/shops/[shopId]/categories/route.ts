import { NextResponse } from "next/server";
import { addCategoryInDb, deleteCategoryInDb } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params;
    const body = await request.json();

    if (!body.id || !body.name) {
      return NextResponse.json(
        { success: false, error: "Category ID and name are required" },
        { status: 400 }
      );
    }

    await addCategoryInDb(shopId, body);
    return NextResponse.json({ success: true, category: body });
  } catch (error: any) {
    console.error("POST /api/shops/[shopId]/categories error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params;
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: "categoryId is required in query params" },
        { status: 400 }
      );
    }

    await deleteCategoryInDb(shopId, categoryId);
    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/shops/[shopId]/categories error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
