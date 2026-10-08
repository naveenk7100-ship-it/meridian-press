import { NextRequest, NextResponse } from "next/server";
import { getOrdersByCustomerEmail } from "@/lib/repositories/orders-repo";
import { getBookById } from "@/lib/repositories/books-repo";
import { getEntitlementByOrderId, createDownloadEntitlementRecord } from "@/lib/repositories/entitlements-repo";
import { sendOrderRecoveryEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const recoverSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "client";
    const rateCheck = checkRateLimit(`recover-${ip}`, 5, 10 * 60 * 1000); // 5 per 10 mins
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Too many recovery attempts. Please wait 10 minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = recoverSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid email." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const paidOrders = await getOrdersByCustomerEmail(email);

    if (paidOrders.length === 0) {
      // Don't disclose whether an email exists for security/privacy, return friendly success message
      return NextResponse.json({
        success: true,
        message: "If any monographs were purchased with this email address, access links have been dispatched.",
        found: 0,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const recoveryItems = [];

    for (const order of paidOrders) {
      const book = await getBookById(order.bookId);

      // Fetch or generate fresh entitlement
      let entitlement = await getEntitlementByOrderId(order.id);
      const isExpired = entitlement ? new Date() > new Date(entitlement.expiresAt) : true;

      if (!entitlement || isExpired || entitlement.isRevoked) {
        entitlement = await createDownloadEntitlementRecord({
          orderId: order.id,
          bookId: order.bookId,
          customerEmail: order.customerEmail,
          expiresInDays: 14,
          maxDownloads: 15,
        });
      }

      const downloadUrl = `${appUrl}/orders/${order.id}?token=${entitlement.accessToken}`;

      recoveryItems.push({
        order,
        book,
        downloadUrl,
      });
    }

    // Send email with all recovery links
    await sendOrderRecoveryEmail({
      customerEmail: email,
      orders: recoveryItems,
    });

    return NextResponse.json({
      success: true,
      message: `Access links for ${paidOrders.length} purchased monograph(s) have been dispatched to ${email}.`,
      found: paidOrders.length,
    });
  } catch (error: unknown) {
    console.error("[Order Recovery API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process order recovery." },
      { status: 500 }
    );
  }
}
