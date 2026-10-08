import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { getOrderByRazorpayOrderId, markOrderPaid } from "@/lib/repositories/orders-repo";
import { getBookById } from "@/lib/repositories/books-repo";
import { createPaymentRecord, getPaymentByProviderPaymentId } from "@/lib/repositories/payments-repo";
import { createDownloadEntitlementRecord, getEntitlementByOrderId } from "@/lib/repositories/entitlements-repo";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    const rawBody = await request.text();
    const isValid = verifyWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      console.warn("[Webhook Rejected]: Invalid Razorpay webhook signature.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.log(`[Razorpay Webhook Event]: ${event}`);

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const rzOrderId = paymentEntity?.order_id || payload.payload?.order?.entity?.id;
      const rzPaymentId = paymentEntity?.id;

      if (rzOrderId) {
        const order = await getOrderByRazorpayOrderId(rzOrderId);
        if (order) {
          // Replay check
          if (rzPaymentId) {
            const existingPayment = await getPaymentByProviderPaymentId(rzPaymentId);
            if (existingPayment && existingPayment.orderId !== order.id) {
              console.warn(`[Webhook Security Warning]: Payment ID ${rzPaymentId} already assigned to another order ${existingPayment.orderId}`);
              return NextResponse.json({ error: "Payment replay detected" }, { status: 400 });
            }
          }

          if (order.status !== "paid") {
            const updatedOrder = await markOrderPaid(order.id, {
              razorpayPaymentId: rzPaymentId || "webhook_captured",
              razorpaySignature: signature,
            });

            await createPaymentRecord({
              orderId: order.id,
              providerPaymentId: rzPaymentId || "webhook_captured",
              providerOrderId: rzOrderId,
              amount: paymentEntity?.amount ? paymentEntity.amount / 100 : order.amount,
              currency: paymentEntity?.currency || order.currency,
              status: "captured",
              method: paymentEntity?.method,
              rawResponse: paymentEntity,
            });

            let entitlement = await getEntitlementByOrderId(order.id);
            if (!entitlement) {
              entitlement = await createDownloadEntitlementRecord({
                orderId: order.id,
                bookId: order.bookId,
                customerEmail: order.customerEmail,
                expiresInDays: 14,
                maxDownloads: 15,
              });

              const book = await getBookById(order.bookId);
              if (book) {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://meridianpress.pub";
                const downloadPageUrl = `${appUrl}/orders/${order.id}?token=${entitlement.accessToken}`;
                await sendOrderConfirmationEmail({
                  order: updatedOrder || order,
                  book,
                  downloadUrl: downloadPageUrl,
                  customerEmail: order.customerEmail,
                  customerName: order.customerName,
                });
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: unknown) {
    console.error("[Razorpay Webhook Error]:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
