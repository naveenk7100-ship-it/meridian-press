import { NextRequest, NextResponse } from "next/server";
import { getBookById, getBookBySlug } from "@/lib/repositories/books-repo";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, bookSlug, email } = body;

    const book = bookId ? await getBookById(bookId) : bookSlug ? await getBookBySlug(bookSlug) : null;

    if (!book) {
      return NextResponse.json(
        { success: false, error: "Book not found." },
        { status: 404 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Reader email address is required for digital delivery." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Direct caller to Razorpay endpoint
    return NextResponse.json({
      success: true,
      message: "Please proceed with Razorpay checkout at /api/payments/razorpay/create-order",
      book: {
        id: book.id,
        title: book.title,
        price: book.price,
        currency: book.currency,
      },
    });
  } catch (error: unknown) {
    console.error("API /api/checkout POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process acquisition." },
      { status: 500 }
    );
  }
}
