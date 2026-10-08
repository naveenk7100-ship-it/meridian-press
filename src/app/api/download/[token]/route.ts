import { NextRequest, NextResponse } from "next/server";
import { getEntitlementByToken, recordDownloadActivity } from "@/lib/repositories/entitlements-repo";
import { getBookById } from "@/lib/repositories/books-repo";
import { generateMonographPackage } from "@/lib/storage";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "client";
    const rateCheck = checkRateLimit(`download-${ip}`, 30, 60 * 1000);
    if (!rateCheck.success) {
      return new NextResponse("Too many download requests. Please try again later.", { status: 429 });
    }

    const { token } = await params;
    const { searchParams } = new URL(request.url);
    const formatParam = (searchParams.get("format") || "epub").toLowerCase();

    if (!["epub", "pdf", "mobi"].includes(formatParam)) {
      return new NextResponse("Invalid format requested. Supported formats: EPUB, PDF, MOBI.", { status: 400 });
    }
    const format = formatParam as "epub" | "pdf" | "mobi";

    // 1. Verify Entitlement in Database
    const entitlement = await getEntitlementByToken(token);
    if (!entitlement) {
      return new NextResponse("Access Denied. Invalid or expired download token.", { status: 401 });
    }

    if (entitlement.isRevoked) {
      return new NextResponse("This download entitlement has been revoked by the publisher.", { status: 403 });
    }

    // 2. Check Expiration
    const now = new Date();
    const expiry = new Date(entitlement.expiresAt);
    if (now > expiry) {
      return new NextResponse(
        "This download link has expired. Please use the order recovery page to generate a refreshed access link.",
        { status: 410 }
      );
    }

    // 3. Check Download Limit
    if (entitlement.downloadCount >= entitlement.maxDownloads) {
      return new NextResponse(
        `Maximum download limit (${entitlement.maxDownloads}) reached for this token. Please contact support.`,
        { status: 429 }
      );
    }

    // 4. Retrieve Book
    const book = await getBookById(entitlement.bookId);
    if (!book) {
      return new NextResponse("Requested monograph not found.", { status: 404 });
    }

    // 5. Record Download Activity
    await recordDownloadActivity(entitlement.id);

    // 6. Generate Digital Package
    const fileBuffer = generateMonographPackage(book, format, entitlement.customerEmail);

    const mimeTypes = {
      epub: "application/epub+zip",
      pdf: "application/pdf",
      mobi: "application/x-mobipocket-ebook",
    };

    const fileName = `${book.slug}-edition.${format}`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeTypes[format],
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
        "X-Meridian-Order": entitlement.orderId,
        "X-Meridian-License": "Perpetual-DRM-Free",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: unknown) {
    console.error("[Download API Error]:", error);
    return new NextResponse("Failed to process download stream.", { status: 500 });
  }
}
