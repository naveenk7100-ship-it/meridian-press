import { NextRequest, NextResponse } from "next/server";
import { getAllBooks, getPublishedBooks, createBookRecord } from "@/lib/repositories/books-repo";
import { verifyAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const showAll = searchParams.get("all") === "true";

    let books = showAll ? await getAllBooks() : await getPublishedBooks();

    if (category && category !== "All") {
      books = books.filter((b) => b.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      books = books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.subtitle.toLowerCase().includes(q) ||
          b.author.name.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({ success: true, books });
  } catch (error) {
    console.error("API /api/books GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.title || !body.author?.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (title, author, price, category)" },
        { status: 400 }
      );
    }

    const newBook = await createBookRecord({
      title: body.title,
      slug: body.slug,
      subtitle: body.subtitle || "",
      description: body.description || "",
      synopsis: body.synopsis || "",
      author: {
        name: body.author.name,
        bio: body.author.bio || "",
        avatarUrl: body.author.avatarUrl || "",
      },
      category: body.category,
      tags: Array.isArray(body.tags) ? body.tags : [],
      price: parseFloat(body.price) || 0,
      currency: body.currency || "INR",
      coverImage: body.coverImage || "",
      coverColorTheme: body.coverColorTheme,
      pageCount: parseInt(body.pageCount) || 200,
      wordCount: parseInt(body.wordCount) || 50000,
      readingTimeMinutes: parseInt(body.readingTimeMinutes) || 250,
      isbn: body.isbn || `978-1-962045-${Math.floor(10 + Math.random() * 90)}-0`,
      edition: body.edition || "First Edition",
      publishedYear: parseInt(body.publishedYear) || new Date().getFullYear(),
      publishedDate: body.publishedDate || new Date().toISOString().split("T")[0],
      formats: Array.isArray(body.formats) && body.formats.length > 0
        ? body.formats
        : [
            { type: "EPUB", size: "4.5 MB", drmFree: true, version: "3.0" },
            { type: "PDF", size: "12.0 MB", drmFree: true, version: "Standard" },
            { type: "MOBI", size: "6.2 MB", drmFree: true, version: "KF8" },
          ],
      sampleChapter: body.sampleChapter || {
        title: "Chapter 1: Opening Discourse",
        content: "The opening lines of this monograph...",
      },
      tableOfContents: Array.isArray(body.tableOfContents) ? body.tableOfContents : [],
      digitalFileReference: body.digitalFileReference || {
        fileName: `${body.title.replace(/\s+/g, "-")}-Digital-Edition.zip`,
        fileSize: "15 MB",
      },
      isFeatured: Boolean(body.isFeatured),
      isBestseller: Boolean(body.isBestseller),
      published: body.published !== undefined ? Boolean(body.published) : true,
    });

    return NextResponse.json({ success: true, book: newBook }, { status: 201 });
  } catch (error) {
    console.error("API /api/books POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create book" },
      { status: 500 }
    );
  }
}
