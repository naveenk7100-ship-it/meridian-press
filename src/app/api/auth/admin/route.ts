import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminSession,
  verifyAdminPasscode,
  generateAdminSessionHash,
  ADMIN_COOKIE_CONFIG,
} from "@/lib/auth";

export async function GET() {
  try {
    const isAuthed = await verifyAdminSession();
    return NextResponse.json({ authenticated: isAuthed });
  } catch (error) {
    console.error("API /api/auth/admin GET error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passcode } = body;

    if (!passcode) {
      return NextResponse.json(
        { success: false, error: "Passcode required" },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPasscode(passcode);

    if (isValid) {
      const sessionHash = generateAdminSessionHash();
      if (!sessionHash) {
        return NextResponse.json(
          { success: false, error: "Admin configuration error on server." },
          { status: 500 }
        );
      }

      const response = NextResponse.json({
        success: true,
        message: "Authenticated successfully",
      });

      response.cookies.set({
        name: ADMIN_COOKIE_CONFIG.name,
        value: sessionHash,
        httpOnly: ADMIN_COOKIE_CONFIG.httpOnly,
        secure: ADMIN_COOKIE_CONFIG.secure,
        sameSite: ADMIN_COOKIE_CONFIG.sameSite,
        path: ADMIN_COOKIE_CONFIG.path,
        maxAge: ADMIN_COOKIE_CONFIG.maxAge,
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid admin passcode." },
      { status: 401 }
    );
  } catch (error) {
    console.error("API /api/auth/admin POST error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set({
      name: ADMIN_COOKIE_CONFIG.name,
      value: "",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("API /api/auth/admin DELETE error:", error);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
