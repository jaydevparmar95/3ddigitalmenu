import { NextResponse } from "next/server";
import { ensureDatabaseAndTables, getAllShopsFromDb } from "@/lib/db";

export async function GET() {
  try {
    await ensureDatabaseAndTables();
    const shops = await getAllShopsFromDb();
    return NextResponse.json({
      success: true,
      message: "MySQL Database and tables verified successfully!",
      shopsCount: shops.length,
    });
  } catch (error: any) {
    console.error("Init DB error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Database connection/initialization failed" },
      { status: 500 }
    );
  }
}
