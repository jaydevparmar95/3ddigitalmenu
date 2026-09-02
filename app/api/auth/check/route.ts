import { NextRequest, NextResponse } from "next/server";
import { isRequestAdminAuthenticated, ADMIN_USERNAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const isAuthenticated = isRequestAdminAuthenticated(request);
  if (isAuthenticated) {
    return NextResponse.json({
      authenticated: true,
      user: { username: ADMIN_USERNAME, role: "admin" },
    });
  } else {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
