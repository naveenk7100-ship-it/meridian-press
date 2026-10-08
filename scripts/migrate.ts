import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { INITIAL_BOOKS } from "../src/data/initial-books";

async function runMigration() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    console.log("[Migration Notice] No DATABASE_URL or POSTGRES_URL provided.");
    console.log("[Migration Notice] The app will run smoothly using the robust local file storage in data/.");
    console.log("[Migration Notice] Set DATABASE_URL in Vercel to activate persistent PostgreSQL storage.");
    return;
  }

  console.log("[Migration] Connecting to PostgreSQL database...");

  const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
  const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  try {
    const schemaPath = path.join(__dirname, "..", "src", "lib", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");

    console.log("[Migration] Executing DDL schema statements...");
    await pool.query(schemaSql);
    console.log("[Migration] Database schema and indexes successfully applied.");

    // Check if books table is populated
    const checkBooks = await pool.query("SELECT COUNT(*) FROM books");
    const bookCount = parseInt(checkBooks.rows[0].count, 10);

    const shouldSeed = process.argv.includes("--seed") || process.env.SEED_INITIAL_DATA === "true";

    if (bookCount === 0 && shouldSeed) {
      console.log(`[Migration] Explicit seed requested. Seeding sample catalog (${INITIAL_BOOKS.length} monographs)...`);
      for (const b of INITIAL_BOOKS) {
        await pool.query(
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
          ) ON CONFLICT (id) DO NOTHING`,
          [
            b.id,
            b.slug,
            b.title,
            b.subtitle,
            b.description,
            b.synopsis,
            b.author.name,
            b.author.bio,
            b.author.avatarUrl || null,
            b.category,
            b.tags,
            b.price,
            b.currency,
            b.coverImage,
            JSON.stringify(b.coverColorTheme || null),
            b.pageCount,
            b.wordCount,
            b.readingTimeMinutes,
            b.isbn,
            b.edition,
            b.publishedYear,
            b.publishedDate,
            JSON.stringify(b.formats),
            JSON.stringify(b.sampleChapter),
            JSON.stringify(b.tableOfContents),
            JSON.stringify(b.digitalFileReference),
            b.status || "published",
            b.gumroadUrl || null,
            b.seoTitle || null,
            b.seoDescription || null,
            b.isFeatured,
            b.isBestseller || false,
            b.published,
            b.createdAt,
            b.updatedAt,
          ]
        );
      }
      console.log("[Migration] Initial catalog seeded successfully.");
    } else if (bookCount === 0) {
      console.log("[Migration] Database schema applied. Zero demo records inserted. Ready for production book uploads via /admin.");
    } else {
      console.log(`[Migration] Catalog already contains ${bookCount} monographs. Skipped seeding.`);
    }

    console.log("[Migration] Migration completed successfully!");
  } catch (error) {
    console.error("[Migration Error]:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
