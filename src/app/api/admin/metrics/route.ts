import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getRealRevenueMetrics } from "@/lib/repositories/orders-repo";
import { getAllBooks } from "@/lib/repositories/books-repo";

export async function GET() {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const revenueMetrics = await getRealRevenueMetrics();
    const books = await getAllBooks();
    const publishedCount = books.filter((b) => b.published).length;
    const draftCount = books.length - publishedCount;

    return NextResponse.json({
      success: true,
      metrics: {
        ...revenueMetrics,
        totalBooks: books.length,
        publishedBooks: publishedCount,
        draftBooks: draftCount,
      },
    });
  } catch (error: unknown) {
    console.error("[Admin Metrics API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch metrics." },
      { status: 500 }
    );
  }
}
