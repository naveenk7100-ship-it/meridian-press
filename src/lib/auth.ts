import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_COOKIE_NAME = "meridian_admin_session";

export function getAdminSecret(): string | null {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[CRITICAL SECURITY]: ADMIN_SECRET is not set in production environment variables.");
      return null;
    }
    // Local development fallback
    return "meridian_dev_secret_2025";
  }
  return secret;
}

export function generateAdminSessionHash(): string | null {
  const secret = getAdminSecret();
  if (!secret) return null;
  return crypto.createHash("sha256").update(`meridian_auth_${secret}`).digest("hex");
}

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const expectedHash = generateAdminSessionHash();
    if (!expectedHash) return false;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) return false;

    return crypto.timingSafeEqual(
      Buffer.from(sessionCookie.value, "utf-8"),
      Buffer.from(expectedHash, "utf-8")
    );
  } catch {
    return false;
  }
}

export function verifyAdminPasscode(inputPasscode: string): boolean {
  const secret = getAdminSecret();
  if (!secret || !inputPasscode) return false;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(inputPasscode.trim(), "utf-8"),
      Buffer.from(secret.trim(), "utf-8")
    );
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE_CONFIG = {
  name: ADMIN_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
