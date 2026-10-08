import { NextRequest, NextResponse } from "next/server";
import { getEntitlementByToken, recordDownloadActivity } from "@/lib/repositories/entitlements-repo";
import { getOrderById } from "@/lib/repositories/orders-repo";
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
    if (!token || token.trim().length < 10) {
      return new NextResponse("Access Denied. Invalid download token format.", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const formatParam = (searchParams.get("format") || "epub").toLowerCase();

    if (!["epub", "pdf", "mobi"].includes(formatParam)) {
      return new NextResponse("Invalid format requested. Supported formats: EPUB, PDF, MOBI.", { status: 400 });
    }
    const format = formatParam as "epub" | "pdf" | "mobi";

    // 1. Verify Entitlement in Database
    const entitlement = await getEntitlementByToken(token);
    if (!entitlement) {
      return new NextResponse("Access Denied. Invalid or unrecognized download token.", { status: 401 });
    }

    if (entitlement.isRevoked) {
      return new NextResponse("Access Denied. This download entitlement has been revoked by the publisher.", { status: 403 });
    }

    // 2. Verify Associated Order Status (Failed/Pending payments NEVER unlock files)
    const order = await getOrderById(entitlement.orderId);
    if (!order || order.status !== "paid") {
      return new NextResponse("Access Denied. Order payment has not been verified or has failed.", { status: 403 });
    }

    // 3. Check Expiration
    const now = new Date();
    const expiry = new Date(entitlement.expiresAt);
    if (now > expiry) {
      return new NextResponse(
        "This download link has expired. Please use the order recovery desk to obtain a refreshed access link.",
        { status: 410 }
      );
    }

    // 4. Check Download Quota
    if (entitlement.downloadCount >= entitlement.maxDownloads) {
      return new NextResponse(
        `Maximum download limit (${entitlement.maxDownloads}) reached for this token. Please contact support.`,
        { status: 429 }
      );
    }

    // 5. Retrieve Book
    const book = await getBookById(entitlement.bookId);
    if (!book) {
      return new NextResponse("Requested monograph not found in catalog.", { status: 404 });
    }

    // 6. Record Download Activity & Quota Increment
    await recordDownloadActivity(entitlement.id);

    // 7. Generate or Serve Master Monograph Package
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
    return new NextResponse("Failed to process digital download stream.", { status: 500 });
  }
}
