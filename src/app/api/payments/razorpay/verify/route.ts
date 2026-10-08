import { NextRequest, NextResponse } from "next/server";
import { getOrderByRazorpayOrderId, markOrderPaid, getOrderById } from "@/lib/repositories/orders-repo";
import { getBookById } from "@/lib/repositories/books-repo";
import { createPaymentRecord, getPaymentByProviderPaymentId } from "@/lib/repositories/payments-repo";
import { createDownloadEntitlementRecord, getEntitlementByOrderId } from "@/lib/repositories/entitlements-repo";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1, "Razorpay Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Razorpay Payment ID is required"),
  razorpay_signature: z.string().min(1, "Payment signature is required"),
  order_id: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "client";
    const rateCheck = checkRateLimit(`verify-payment-${ip}`, 20, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Too many verification requests." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid payment payload." },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = parsed.data;

    // 1. Strict Cryptographic Signature Verification
    const isValidSignature = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValidSignature) {
      console.warn(`[Payment Verification Failed]: Invalid signature for order ${razorpay_order_id}`);
      return NextResponse.json(
        { success: false, error: "Payment verification failed. Invalid cryptographic signature." },
        { status: 400 }
      );
    }

    // 2. Fetch order from database
    let order = await getOrderByRazorpayOrderId(razorpay_order_id);
    if (!order && order_id) {
      order = await getOrderById(order_id);
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order record not found." },
        { status: 404 }
      );
    }

    // 3. Replay attack check: Ensure this payment ID is not bound to a DIFFERENT order
    const existingPayment = await getPaymentByProviderPaymentId(razorpay_payment_id);
    if (existingPayment && existingPayment.orderId !== order.id) {
      console.warn(`[Security Alert]: Replay attack attempt detected. Payment ${razorpay_payment_id} belongs to order ${existingPayment.orderId}, not ${order.id}`);
      return NextResponse.json(
        { success: false, error: "Payment has already been applied to another transaction." },
        { status: 400 }
      );
    }

    // 4. Check if already marked paid (idempotency)
    if (order.status !== "paid") {
      // Transition order status to PAID
      const updatedOrder = await markOrderPaid(order.id, {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      });
      if (updatedOrder) order = updatedOrder;

      // Log payment record
      if (!existingPayment) {
        await createPaymentRecord({
          orderId: order.id,
          providerPaymentId: razorpay_payment_id,
          providerOrderId: razorpay_order_id,
          amount: order.amount,
          currency: order.currency,
          status: "captured",
        });
      }
    }

    // 5. Ensure download entitlement exists
    let entitlement = await getEntitlementByOrderId(order.id);
    if (!entitlement) {
      entitlement = await createDownloadEntitlementRecord({
        orderId: order.id,
        bookId: order.bookId,
        customerEmail: order.customerEmail,
        expiresInDays: 14,
        maxDownloads: 15,
      });

      // Send order confirmation email
      const book = await getBookById(order.bookId);
      if (book) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://meridianpress.pub";
        const downloadPageUrl = `${appUrl}/orders/${order.id}?token=${entitlement.accessToken}`;
        await sendOrderConfirmationEmail({
          order,
          book,
          downloadUrl: downloadPageUrl,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
        });
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const directDownloadUrl = `${appUrl}/orders/${order.id}?token=${entitlement.accessToken}`;

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified.",
      orderId: order.id,
      accessToken: entitlement.accessToken,
      downloadUrl: directDownloadUrl,
    });
  } catch (error: unknown) {
    console.error("[Verify API Error]:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while verifying payment." },
      { status: 500 }
    );
  }
}
