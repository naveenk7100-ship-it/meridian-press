import fs from "fs";
import path from "path";
import { Book, BookCreateInput, BookUpdateInput } from "@/types/book";
import { INITIAL_BOOKS } from "@/data/initial-books";
import { slugify } from "@/lib/utils";
import { query, queryOne, isPostgresConfigured } from "@/lib/db";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "books.json");

let memoryBooks: Book[] = [...INITIAL_BOOKS];
let initialized = false;

function ensureLocalFile(): void {
  if (initialized) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryBooks = parsed;
      } else {
        fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_BOOKS, null, 2), "utf-8");
      }
    } else {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_BOOKS, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Using in-memory book storage:", err);
  }
  initialized = true;
}

function persistLocal(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryBooks, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write books to disk:", err);
  }
}

function mapRowToBook(row: Record<string, unknown>): Book {
  const published = Boolean(row.published);
  const status = (row.status as Book["status"]) || (published ? "published" : "draft");

  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    subtitle: String(row.subtitle || ""),
    description: String(row.description || ""),
    synopsis: String(row.synopsis || ""),
    author: {
      name: String(row.author_name),
      bio: String(row.author_bio || ""),
      avatarUrl: String(row.author_avatar || ""),
    },
    category: row.category as Book["category"],
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    price: parseFloat(String(row.price)),
    currency: (row.currency as Book["currency"]) || "INR",
    coverImage: String(row.cover_image || ""),
    coverColorTheme: row.cover_color_theme as Book["coverColorTheme"] || undefined,
    pageCount: Number(row.page_count),
    wordCount: Number(row.word_count),
    readingTimeMinutes: Number(row.reading_time_minutes),
    isbn: String(row.isbn || ""),
    edition: String(row.edition || "First Edition"),
    publishedYear: Number(row.published_year) || 2025,
    publishedDate: String(row.published_date || ""),
    formats: typeof row.formats === "string" ? JSON.parse(row.formats) : (row.formats as Book["formats"]) || [],
    sampleChapter: typeof row.sample_chapter === "string" ? JSON.parse(row.sample_chapter) : (row.sample_chapter as Book["sampleChapter"]) || { title: "", content: "" },
    tableOfContents: typeof row.table_of_contents === "string" ? JSON.parse(row.table_of_contents) : (row.table_of_contents as string[]) || [],
    digitalFileReference: typeof row.digital_file_reference === "string" ? JSON.parse(row.digital_file_reference) : (row.digital_file_reference as Book["digitalFileReference"]) || { fileName: "", fileSize: "" },
    status,
    gumroadUrl: row.gumroad_url ? String(row.gumroad_url) : undefined,
    seoTitle: row.seo_title ? String(row.seo_title) : undefined,
    seoDescription: row.seo_description ? String(row.seo_description) : undefined,
    isFeatured: Boolean(row.is_featured),
    isBestseller: Boolean(row.is_bestseller),
    published: status === "published",
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getAllBooks(): Promise<Book[]> {
  if (isPostgresConfigured()) {
    try {
      const rows = await query("SELECT * FROM books ORDER BY created_at DESC");
      return rows.map(mapRowToBook);
    } catch (err) {
      console.error("[Books Repo] Postgres query failed, falling back to local store:", err);
    }
  }

  ensureLocalFile();
  return [...memoryBooks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getPublishedBooks(): Promise<Book[]> {
  if (isPostgresConfigured()) {
    try {
      const rows = await query("SELECT * FROM books WHERE (status = 'published' OR (status IS NULL AND published = true)) ORDER BY published_date DESC");
      return rows.map(mapRowToBook);
    } catch (err) {
      console.error("[Books Repo] Postgres query failed, falling back to local store:", err);
    }
  }

  ensureLocalFile();
  return memoryBooks
    .filter((b) => b.status === "published" || (b.status === undefined && b.published))
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
}

export async function getFeaturedBooks(): Promise<Book[]> {
  const published = await getPublishedBooks();
  return published.filter((b) => b.isFeatured);
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  if (isPostgresConfigured()) {
    try {
      const row = await queryOne("SELECT * FROM books WHERE slug = $1 LIMIT 1", [slug]);
      return row ? mapRowToBook(row) : null;
    } catch (err) {
      console.error("[Books Repo] Postgres query failed:", err);
    }
  }

  ensureLocalFile();
  return memoryBooks.find((b) => b.slug === slug) || null;
}

export async function getBookById(id: string): Promise<Book | null> {
  if (isPostgresConfigured()) {
    try {
      const row = await queryOne("SELECT * FROM books WHERE id = $1 LIMIT 1", [id]);
      return row ? mapRowToBook(row) : null;
    } catch (err) {
      console.error("[Books Repo] Postgres query failed:", err);
    }
  }

  ensureLocalFile();
  return memoryBooks.find((b) => b.id === id) || null;
}

export async function getRelatedBooks(currentBook: Book, limit = 3): Promise<Book[]> {
  const all = await getPublishedBooks();
  return all
    .filter(
      (b) =>
        b.id !== currentBook.id &&
        (b.category === currentBook.category ||
          b.tags.some((t) => currentBook.tags.includes(t)) ||
          b.author.name === currentBook.author.name)
    )
    .slice(0, limit);
}

export async function createBookRecord(input: BookCreateInput): Promise<Book> {
  ensureLocalFile();

  const baseSlug = input.slug ? slugify(input.slug) : slugify(input.title);
  let finalSlug = baseSlug;
  let counter = 1;
  while (memoryBooks.some((b) => b.slug === finalSlug)) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const status = input.status || (input.published !== false ? "published" : "draft");
  const published = status === "published";
  const now = new Date().toISOString();
  const newBook: Book = {
    ...input,
    id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    slug: finalSlug,
    status,
    published,
    gumroadUrl: input.gumroadUrl || undefined,
    seoTitle: input.seoTitle || undefined,
    seoDescription: input.seoDescription || undefined,
    createdAt: now,
    updatedAt: now,
  };

  if (isPostgresConfigured()) {
    try {
      await query(
        `INSERT INTO books (
          id, slug, title, subtitle, description, synopsis,
          author_name, author_bio, author_avatar, category, tags,
          price, currency, cover_image, cover_color_theme,
          page_count, word_count, reading_time_minutes, isbn,
          edition, published_year, published_date, formats,
          sample_chapter, table_of_contents, digital_file_reference,
          status, gumroad_url, seo_title, seo_description,
          is_featured, is_bestseller, published, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
          $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35
        )`,
        [
          newBook.id,
          newBook.slug,
          newBook.title,
          newBook.subtitle,
          newBook.description,
          newBook.synopsis,
          newBook.author.name,
          newBook.author.bio,
          newBook.author.avatarUrl || null,
          newBook.category,
          newBook.tags,
          newBook.price,
          newBook.currency,
          newBook.coverImage,
          JSON.stringify(newBook.coverColorTheme || null),
          newBook.pageCount,
          newBook.wordCount,
          newBook.readingTimeMinutes,
          newBook.isbn,
          newBook.edition,
          newBook.publishedYear,
          newBook.publishedDate,
          JSON.stringify(newBook.formats),
          JSON.stringify(newBook.sampleChapter),
          JSON.stringify(newBook.tableOfContents),
          JSON.stringify(newBook.digitalFileReference),
          newBook.status,
          newBook.gumroadUrl || null,
          newBook.seoTitle || null,
          newBook.seoDescription || null,
          newBook.isFeatured,
          newBook.isBestseller || false,
          newBook.published,
          newBook.createdAt,
          newBook.updatedAt,
        ]
      );
    } catch (err) {
      console.error("[Books Repo] Postgres INSERT error:", err);
    }
  }

  memoryBooks.unshift(newBook);
  persistLocal();
  return newBook;
}

export async function updateBookRecord(id: string, input: BookUpdateInput): Promise<Book | null> {
  ensureLocalFile();
  const existing = await getBookById(id);
  if (!existing) return null;

  let slug = existing.slug;
  if (input.slug && input.slug !== existing.slug) {
    const baseSlug = slugify(input.slug);
    let finalSlug = baseSlug;
    let counter = 1;
    while (memoryBooks.some((b) => b.slug === finalSlug && b.id !== id)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    slug = finalSlug;
  }

  let status = input.status !== undefined ? input.status : existing.status;
  let published = input.published !== undefined ? input.published : existing.published;
  if (input.status !== undefined && input.published === undefined) {
    published = input.status === "published";
  } else if (input.published !== undefined && input.status === undefined) {
    status = input.published ? "published" : "draft";
  }

  const updated: Book = {
    ...existing,
    ...input,
    slug,
    status,
    published,
    updatedAt: new Date().toISOString(),
  };

  if (isPostgresConfigured()) {
    try {
      await query(
        `UPDATE books SET
          slug = $1, title = $2, subtitle = $3, description = $4, synopsis = $5,
          author_name = $6, author_bio = $7, author_avatar = $8, category = $9,
          tags = $10, price = $11, currency = $12, cover_image = $13,
          cover_color_theme = $14, page_count = $15, word_count = $16,
          reading_time_minutes = $17, isbn = $18, edition = $19,
          published_year = $20, published_date = $21, formats = $22,
          sample_chapter = $23, table_of_contents = $24, digital_file_reference = $25,
          status = $26, gumroad_url = $27, seo_title = $28, seo_description = $29,
          is_featured = $30, is_bestseller = $31, published = $32, updated_at = $33
        WHERE id = $34`,
        [
          updated.slug,
          updated.title,
          updated.subtitle,
          updated.description,
          updated.synopsis,
          updated.author.name,
          updated.author.bio,
          updated.author.avatarUrl || null,
          updated.category,
          updated.tags,
          updated.price,
          updated.currency,
          updated.coverImage,
          JSON.stringify(updated.coverColorTheme || null),
          updated.pageCount,
          updated.wordCount,
          updated.readingTimeMinutes,
          updated.isbn,
          updated.edition,
          updated.publishedYear,
          updated.publishedDate,
          JSON.stringify(updated.formats),
          JSON.stringify(updated.sampleChapter),
          JSON.stringify(updated.tableOfContents),
          JSON.stringify(updated.digitalFileReference),
          updated.status,
          updated.gumroadUrl || null,
          updated.seoTitle || null,
          updated.seoDescription || null,
          updated.isFeatured,
          updated.isBestseller || false,
          updated.published,
          updated.updatedAt,
          id,
        ]
      );
    } catch (err) {
      console.error("[Books Repo] Postgres UPDATE error:", err);
    }
  }

  const idx = memoryBooks.findIndex((b) => b.id === id);
  if (idx !== -1) {
    memoryBooks[idx] = updated;
    persistLocal();
  }
  return updated;
}

export async function deleteBookRecord(id: string): Promise<boolean> {
  ensureLocalFile();

  if (isPostgresConfigured()) {
    try {
      await query("DELETE FROM books WHERE id = $1", [id]);
    } catch (err) {
      console.error("[Books Repo] Postgres DELETE error:", err);
    }
  }

  const initialLen = memoryBooks.length;
  memoryBooks = memoryBooks.filter((b) => b.id !== id);
  if (memoryBooks.length !== initialLen) {
    persistLocal();
    return true;
  }
  return false;
}

export async function toggleBookPublishRecord(id: string): Promise<Book | null> {
  const book = await getBookById(id);
  if (!book) return null;
  const newStatus = book.status === "published" ? "draft" : "published";
  return updateBookRecord(id, { status: newStatus, published: newStatus === "published" });
}
