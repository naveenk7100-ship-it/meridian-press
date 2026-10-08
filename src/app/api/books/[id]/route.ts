import { NextRequest, NextResponse } from "next/server";
import { getBookById, updateBookRecord, deleteBookRecord, toggleBookPublishRecord } from "@/lib/repositories/books-repo";
import { verifyAdminSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await getBookById(id);

    if (!book) {
      return NextResponse.json(
        { success: false, error: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, book });
  } catch (error) {
    console.error("API /api/books/[id] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await updateBookRecord(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Book not found to update" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, book: updated });
  } catch (error) {
    console.error("API /api/books/[id] PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const updated = await toggleBookPublishRecord(id);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, book: updated });
  } catch (error) {
    console.error("API /api/books/[id] PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const deleted = await deleteBookRecord(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Book not found to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    console.error("API /api/books/[id] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
