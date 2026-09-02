import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "adminpassword123";
export const AUTH_COOKIE_NAME = "digital_menu_admin_auth";
export const AUTH_TOKEN_SECRET = process.env.AUTH_SECRET || "digital_menu_jwt_secret_token_2026";

/**
 * Generates an encrypted/hashed session token for admin
 */
export function generateAdminSessionToken(): string {
  const timestamp = Date.now();
  const payload = `${ADMIN_USERNAME}:${timestamp}:${AUTH_TOKEN_SECRET}`;
  const token = Buffer.from(payload).toString("base64");
  return token;
}

/**
 * Validates whether a token is a valid admin session token (within 7 days)
 */
export function validateAdminSessionToken(token: string): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [user, timestamp, secret] = decoded.split(":");
    if (user !== ADMIN_USERNAME || secret !== AUTH_TOKEN_SECRET) {
      return false;
    }
    const tokenTime = parseInt(timestamp, 10);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    return Date.now() - tokenTime < maxAge;
  } catch {
    return false;
  }
}

/**
 * Server-side helper to check if incoming NextRequest is from authenticated admin
 */
export function isRequestAdminAuthenticated(request: NextRequest | Request): boolean {
  try {
    // Check Authorization header first
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      if (validateAdminSessionToken(token)) return true;
    }

    // Check cookie
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`));
    if (match) {
      const token = decodeURIComponent(match[1]);
      return validateAdminSessionToken(token);
    }
  } catch {}
  return false;
}
