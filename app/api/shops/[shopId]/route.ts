import { NextResponse } from "next/server";
import { getShopFromDb, updateShopInDb, deleteShopInDb, softDeleteShopInDb, restoreShopInDb } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params;
    const shop = await getShopFromDb(shopId);

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Shop not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, shop });
  } catch (error: any) {
    console.error("GET /api/shops/[shopId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch shop" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params;
    const body = await request.json();

    if (body.action === "restore" || body.isDeleted === false) {
      await restoreShopInDb(shopId);
    } else {
      await updateShopInDb(shopId, body);
    }

    const updatedShop = await getShopFromDb(shopId);
    return NextResponse.json({ success: true, shop: updatedShop });
  } catch (error: any) {
    console.error("PUT /api/shops/[shopId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update shop" },
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
    const url = new URL(request.url);
    const isPermanent = url.searchParams.get("permanent") === "true";

    if (isPermanent) {
      await deleteShopInDb(shopId);
      return NextResponse.json({ success: true, message: "Shop permanently deleted from database" });
    } else {
      await softDeleteShopInDb(shopId);
      return NextResponse.json({ success: true, message: "Shop soft-deleted successfully (can be restored)" });
    }
  } catch (error: any) {
    console.error("DELETE /api/shops/[shopId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete shop" },
      { status: 500 }
    );
  }
}
