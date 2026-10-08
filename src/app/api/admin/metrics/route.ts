import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getRealRevenueMetrics } from "@/lib/repositories/orders-repo";
import { getAllBooks } from "@/lib/repositories/books-repo";
import { getDatabaseHostInfo, isPostgresConfigured } from "@/lib/db";

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
    const dbInfo = getDatabaseHostInfo();

    return NextResponse.json({
      success: true,
      metrics: {
        ...revenueMetrics,
        totalBooks: books.length,
        publishedBooks: publishedCount,
        draftBooks: draftCount,
        isPostgres: isPostgresConfigured(),
        dbHost: dbInfo.host || null,
        dbBranch: dbInfo.branch || null,
        dbName: dbInfo.database || null,
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
