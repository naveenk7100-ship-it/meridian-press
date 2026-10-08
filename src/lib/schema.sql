-- Meridian Press Production PostgreSQL Schema
-- Compatible with Neon, Supabase, Vercel Postgres, AWS RDS, and Standard PostgreSQL

-- 1. Books Table
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

CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_books_published ON books(published);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY, -- e.g. MER-2025-ABCD
  customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  book_id VARCHAR(64) REFERENCES books(id) ON DELETE RESTRICT,
  book_title VARCHAR(512) NOT NULL,
  book_slug VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(8) DEFAULT 'INR',
  status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  razorpay_order_id VARCHAR(128),
  razorpay_payment_id VARCHAR(128),
  razorpay_signature VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);

-- 4. Payments Table
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

-- 5. Download Entitlements Table
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

-- 6. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  frequency VARCHAR(32) DEFAULT 'monthly',
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Contact Inquiries Table
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
