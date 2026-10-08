import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "private", "books");
const MAX_BOOK_SIZE = 75 * 1024 * 1024; // 75MB limit for ebooks/manuscripts

const VALID_FORMATS = new Set(["epub", "pdf", "mobi", "zip"]);

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawFormat = (formData.get("format") as string || "").toLowerCase();
    const slug = (formData.get("slug") as string || "").toLowerCase().trim();

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No digital file was provided." },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Book slug is required to associate digital asset." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BOOK_SIZE) {
      return NextResponse.json(
        { success: false, error: "Digital file exceeds the 75MB limit." },
        { status: 400 }
      );
    }

    // Auto-detect format from file extension if not provided explicitly
    const fileExt = path.extname(file.name).toLowerCase().replace(".", "");
    const format = rawFormat || fileExt;

    if (!VALID_FORMATS.has(format)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file format "${format}". Supported formats: EPUB (.epub), PDF (.pdf), MOBI (.mobi), ZIP (.zip).`,
        },
        { status: 400 }
      );
    }

    // Ensure private storage book directory exists
    const bookDir = path.join(STORAGE_ROOT, slug);
    if (!fs.existsSync(bookDir)) {
      fs.mkdirSync(bookDir, { recursive: true });
    }

    // Save the file securely with canonical name
    const destinationFileName = `${slug}.${format}`;
    const destinationPath = path.join(bookDir, destinationFileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(destinationPath, buffer);

    // Compute cryptographic SHA-256 checksum for audit and integrity
    const checksum = `sha256:${crypto.createHash("sha256").update(buffer).digest("hex")}`;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const formattedSize = file.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${(file.size / 1024).toFixed(1)} KB`;

    return NextResponse.json({
      success: true,
      format: format.toUpperCase(),
      fileName: destinationFileName,
      fileSize: formattedSize,
      checksum,
      message: `Digital master file for ${slug} (${format.toUpperCase()}) stored securely in private vault.`,
    });
  } catch (error) {
    console.error("API /api/upload/book-file error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to store digital book file." },
      { status: 500 }
    );
  }
}
