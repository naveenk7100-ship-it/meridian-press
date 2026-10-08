import { Pool, QueryResultRow } from "pg";
import { INITIAL_BOOKS } from "@/data/initial-books";

// Global connection pool instance
let pool: Pool | null = null;

export function isPostgresConfigured(): boolean {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  return Boolean(
    databaseUrl &&
      !databaseUrl.includes("[SENSITIVE]") &&
      (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))
  );
}

export function getDbPool(): Pool | null {
  if (!isPostgresConfigured()) {
    return null;
  }
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) {
    return null;
  }

  if (!pool) {
    const isLocalhost = databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on("error", (err) => {
      console.error("[Database Pool Error]:", err);
    });
  }

  return pool;
}

let schemaInitPromise: Promise<void> | null = null;

async function ensureSchema(p: Pool): Promise<void> {
  if (schemaInitPromise) return schemaInitPromise;

  schemaInitPromise = (async () => {
    try {
      await p.query(`
        CREATE TABLE IF NOT EXISTS books (
          id VARCHAR(64) PRIMARY KEY,
          slug VARCHAR(255) UNIQUE NOT NULL,
          title VARCHAR(512) NOT NULL,
          subtitle TEXT,
          description TEXT,
          synopsis TEXT,
          author_name VARCHAR(255) NOT NULL,
          author_bio TEXT,
          author_avatar TEXT,
          category VARCHAR(128) NOT NULL,
          tags TEXT[] DEFAULT '{}',
          price NUMERIC(10, 2) NOT NULL,
          currency VARCHAR(8) DEFAULT 'INR',
          cover_image TEXT,
          cover_color_theme JSONB,
          page_count INTEGER DEFAULT 200,
          word_count INTEGER DEFAULT 50000,
          reading_time_minutes INTEGER DEFAULT 250,
          isbn VARCHAR(64),
          edition VARCHAR(128) DEFAULT 'First Edition',
          published_year INTEGER DEFAULT 2025,
          published_date VARCHAR(32),
          formats JSONB DEFAULT '[]',
          sample_chapter JSONB,
          table_of_contents JSONB DEFAULT '[]',
          digital_file_reference JSONB,
          is_featured BOOLEAN DEFAULT false,
          is_bestseller BOOLEAN DEFAULT false,
          published BOOLEAN DEFAULT true,
          status VARCHAR(32) DEFAULT 'published',
          gumroad_url TEXT,
          seo_title VARCHAR(255),
          seo_description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE books ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'published';
        ALTER TABLE books ADD COLUMN IF NOT EXISTS gumroad_url TEXT;
        ALTER TABLE books ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);
        ALTER TABLE books ADD COLUMN IF NOT EXISTS seo_description TEXT;

        CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
        CREATE INDEX IF NOT EXISTS idx_books_published ON books(published);
        CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
        CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);

        CREATE TABLE IF NOT EXISTS customers (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(64) PRIMARY KEY,
          customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
          customer_email VARCHAR(255) NOT NULL,
          customer_name VARCHAR(255),
          book_id VARCHAR(64) REFERENCES books(id) ON DELETE RESTRICT,
          book_title VARCHAR(512) NOT NULL,
          book_slug VARCHAR(255) NOT NULL,
          amount NUMERIC(10, 2) NOT NULL,
          currency VARCHAR(8) DEFAULT 'INR',
          status VARCHAR(32) DEFAULT 'pending',
          razorpay_order_id VARCHAR(128),
          razorpay_payment_id VARCHAR(128),
          razorpay_signature VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);

        CREATE TABLE IF NOT EXISTS payments (
          id VARCHAR(64) PRIMARY KEY,
          order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
          provider VARCHAR(32) DEFAULT 'razorpay',
          provider_payment_id VARCHAR(128) NOT NULL,
          provider_order_id VARCHAR(128) NOT NULL,
          amount NUMERIC(10, 2) NOT NULL,
          currency VARCHAR(8) DEFAULT 'INR',
          status VARCHAR(32) DEFAULT 'captured',
          method VARCHAR(64),
          fee NUMERIC(10, 2),
          tax NUMERIC(10, 2),
          raw_response JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
        CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON payments(provider_payment_id);

        CREATE TABLE IF NOT EXISTS download_entitlements (
          id VARCHAR(64) PRIMARY KEY,
          order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
          book_id VARCHAR(64) REFERENCES books(id) ON DELETE CASCADE,
          customer_email VARCHAR(255) NOT NULL,
          access_token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          max_downloads INTEGER DEFAULT 10,
          download_count INTEGER DEFAULT 0,
          format_access VARCHAR(32) DEFAULT 'ALL',
          is_revoked BOOLEAN DEFAULT false,
          last_downloaded_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_entitlements_access_token ON download_entitlements(access_token);
        CREATE INDEX IF NOT EXISTS idx_entitlements_customer_email ON download_entitlements(customer_email);
        CREATE INDEX IF NOT EXISTS idx_entitlements_order_id ON download_entitlements(order_id);

        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          frequency VARCHAR(32) DEFAULT 'monthly',
          interests TEXT[] DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS contact_inquiries (
          id VARCHAR(64) PRIMARY KEY,
          reference_id VARCHAR(64) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          topic VARCHAR(128) NOT NULL,
          subject VARCHAR(255),
          message TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed / ensure all authoritative books exist in PostgreSQL
      for (const b of INITIAL_BOOKS) {
        await p.query(
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
          ) ON CONFLICT (id) DO UPDATE SET
            status = COALESCE(books.status, EXCLUDED.status),
            published = COALESCE(books.published, EXCLUDED.published),
            gumroad_url = COALESCE(books.gumroad_url, EXCLUDED.gumroad_url),
            seo_title = COALESCE(books.seo_title, EXCLUDED.seo_title),
            seo_description = COALESCE(books.seo_description, EXCLUDED.seo_description)`,
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
    } catch (err) {
      console.error("[Database Schema Sync Error]:", err);
      schemaInitPromise = null;
      throw err;
    }
  })();

  return schemaInitPromise;
}

export async function query<T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const p = getDbPool();
  if (!p) {
    throw new Error("DATABASE_URL is not configured.");
  }
  await ensureSchema(p);
  const res = await p.query<T>(text, params);
  return res.rows;
}

export async function queryOne<T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

export function getDatabaseHostInfo(): {
  configured: boolean;
  host?: string;
  database?: string;
  branch?: string;
} {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) return { configured: false };
  try {
    const url = new URL(
      databaseUrl.replace(/^postgresql:\/\//i, "http://").replace(/^postgres:\/\//i, "http://")
    );
    const host = url.hostname;
    const branch = host.split(".")[0] || host;
    const database = url.pathname.replace(/^\//, "");
    return {
      configured: true,
      host,
      database,
      branch,
    };
  } catch {
    return { configured: true };
  }
}

