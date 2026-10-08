import { NextRequest, NextResponse } from "next/server";
import { getBookById, getBookBySlug } from "@/lib/repositories/books-repo";
import { findOrCreateCustomer } from "@/lib/repositories/customers-repo";
import { createOrderRecord } from "@/lib/repositories/orders-repo";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const createOrderSchema = z.object({
  bookId: z.string().optional(),
  bookSlug: z.string().optional(),
  email: z.string().email("Please provide a valid email address."),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "client";
    const rateCheck = checkRateLimit(`create-order-${ip}`, 15, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: "Too many checkout requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid input parameters." },
        { status: 400 }
      );
    }

    const { bookId, bookSlug, email, name } = parsed.data;
    const book = bookId ? await getBookById(bookId) : bookSlug ? await getBookBySlug(bookSlug) : null;

    if (!book || !book.published) {
      return NextResponse.json(
        { success: false, error: "Monograph not found or unavailable for purchase." },
        { status: 404 }
      );
    }

    // 1. Find or create customer record
    const customer = await findOrCreateCustomer(email, name);

    // 2. Pre-generate order identifier
    const tempReceipt = `MER-${Date.now().toString(36).toUpperCase()}`;

    // 3. Create Razorpay order on server
    const rzOrder = await createRazorpayOrder({
      amountINR: book.price,
      receipt: tempReceipt,
      notes: {
        bookId: book.id,
        bookTitle: book.title,
        customerEmail: customer.email,
      },
    });

    // 4. Save pending order in database
    const order = await createOrderRecord({
      customerId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      bookId: book.id,
      bookTitle: book.title,
      bookSlug: book.slug,
      amount: book.price,
      currency: "INR",
      razorpayOrderId: rzOrder.id,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        bookTitle: book.title,
        bookSubtitle: book.subtitle,
        amount: book.price,
        currency: "INR",
      },
      razorpay: {
        orderId: rzOrder.id,
        amount: rzOrder.amount, // in paise
        currency: "INR",
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_meridian",
        isTestMode: !isRazorpayConfigured(),
      },
    });
  } catch (error: unknown) {
    console.error("[Create Order API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate payment order." },
      { status: 500 }
    );
  }
}
