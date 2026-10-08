import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_COOKIE_NAME = "meridian_admin_session";

export function getAdminSecret(): string | null {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.trim().length === 0) {
    if (process.env.NODE_ENV === "production") {
      console.error("[CRITICAL SECURITY]: ADMIN_SECRET is not configured in environment. Refusing administrative access.");
    }
    return null;
  }
  return secret.trim();
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

    const cookieBuf = Buffer.from(sessionCookie.value, "utf-8");
    const expectedBuf = Buffer.from(expectedHash, "utf-8");

    if (cookieBuf.length !== expectedBuf.length) {
      crypto.timingSafeEqual(cookieBuf, cookieBuf);
      return false;
    }

    return crypto.timingSafeEqual(cookieBuf, expectedBuf);
  } catch {
    return false;
  }
}

export function verifyAdminPasscode(inputPasscode: string): boolean {
  const secret = getAdminSecret();
  if (!secret || !inputPasscode) return false;

  try {
    const inputBuf = Buffer.from(inputPasscode.trim(), "utf-8");
    const secretBuf = Buffer.from(secret, "utf-8");

    if (inputBuf.length !== secretBuf.length) {
      crypto.timingSafeEqual(inputBuf, inputBuf);
      return false;
    }

    return crypto.timingSafeEqual(inputBuf, secretBuf);
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
