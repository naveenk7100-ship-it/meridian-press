import Razorpay from "razorpay";
import crypto from "crypto";

export interface CreateOrderParams {
  amountINR: number; // in INR rupees, e.g. 799
  receipt: string;
  notes?: Record<string, string>;
}

export function getRazorpayClient(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export async function createRazorpayOrder(params: CreateOrderParams): Promise<{
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}> {
  const client = getRazorpayClient();

  // Razorpay requires amounts in paise (1 INR = 100 paise)
  const amountPaise = Math.round(params.amountINR * 100);

  if (client) {
    const order = await client.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes,
    });

    return {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      receipt: order.receipt || params.receipt,
    };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Razorpay credentials are not configured in production environment.");
  }

  // Development sandbox fallback when Razorpay credentials have not been configured yet
  const mockOrderId = `order_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  return {
    id: mockOrderId,
    amount: amountPaise,
    currency: "INR",
    receipt: params.receipt,
  };
}

export function verifyPaymentSignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[CRITICAL SECURITY]: RAZORPAY_KEY_SECRET is not configured in production. Rejecting verification.");
      return false;
    }
    // Sandbox test signatures in dev/test only
    return (
      params.razorpay_order_id.startsWith("order_test_") ||
      params.razorpay_signature.startsWith("sig_test_")
    );
  }

  try {
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${params.razorpay_order_id}|${params.razorpay_payment_id}`)
      .digest("hex");

    const genBuf = Buffer.from(generatedSignature, "utf-8");
    const sigBuf = Buffer.from(params.razorpay_signature, "utf-8");

    if (genBuf.length !== sigBuf.length) {
      crypto.timingSafeEqual(genBuf, genBuf);
      return false;
    }

    return crypto.timingSafeEqual(genBuf, sigBuf);
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(params: {
  rawBody: string;
  signature: string;
  webhookSecret?: string;
}): boolean {
  const secret = params.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(params.rawBody)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const sigBuf = Buffer.from(params.signature, "utf-8");

    if (expectedBuf.length !== sigBuf.length) {
      crypto.timingSafeEqual(expectedBuf, expectedBuf);
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, sigBuf);
  } catch {
    return false;
  }
}
