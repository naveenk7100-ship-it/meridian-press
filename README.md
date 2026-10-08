# Meridian Press — Independent Digital Monograph Publishing House

A production-ready, editorial-first digital publishing house and modern digital bookstore for original monographs and books. Built with **Next.js (App Router)**, **TypeScript**, **PostgreSQL**, **Razorpay (INR ₹)**, **Tailwind CSS**, and **Framer Motion**.

---

## 🏛️ Publishing Brand Ethos

- **Real Editorial Experience**: Designed with the visual poise of boutique publishing houses (Stripe Press, Fitzcarraldo, Pushkin Press, Faber & Faber).
- **No Fake Metrics**: 100% genuine data model, real sample chapters, authentic metadata, and zero fake review counters.
- **Razorpay INR Integration**: Real server-side order creation, HMAC-SHA256 signature verification, and secure webhook handler.
- **100% DRM-Free Binary Generation**: Every monograph is delivered with reflowable **EPUB**, vector-grade **PDF**, and Kindle-compatible **MOBI** files.
- **Cryptographic Entitlement System**: Single-use tokenized download links with rate-limiting, expiration windows, and download count tracking.
- **Dedicated Order Confirmation & Recovery**: Dedicated order receipt page (`/orders/[id]`) and self-service patron recovery desk (`/orders/recover`).
- **Protected Editorial Desk (Admin)**: Full administrative control to manage monographs, view real database transactions, total revenue metrics in INR, and toggle catalog visibility.

---

## 🚀 Getting Started

### 1. Active Workspace Location
```
C:\Users\navee\.gemini\antigravity\scratch\meridian-press
```

### 2. Install & Run Locally
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Or test production build
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Administrative Access

- **Admin Login Route**: [`/admin/login`](http://localhost:3000/admin/login)
- **Protected Dashboard**: [`/admin`](http://localhost:3000/admin)
- **Production Passcode**: Set `ADMIN_SECRET` in `.env.local` or your Vercel Environment Variables.

---

## 💳 Razorpay Payments Setup

1. Sign in to your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to **Account & Settings** > **API Keys** > Generate Test/Live Keys.
3. Add the following to `.env.local` / Vercel:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```
4. Set up a Webhook in Razorpay pointing to:
   `https://your-domain.vercel.app/api/payments/razorpay/webhook`
   - Subscribed Events: `payment.captured`, `order.paid`

---

## 🗄️ Database Setup (PostgreSQL)

Meridian Press supports PostgreSQL (Neon, Supabase, Vercel Postgres, AWS RDS, Railway) with automated schema migrations:

1. Obtain your PostgreSQL connection string:
   ```env
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```
2. Run migration and catalog seed:
   ```bash
   npm run db:migrate
   ```
*Note: If no `DATABASE_URL` is configured, Meridian Press runs smoothly using its built-in disk store in `data/`.*

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub / GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Under **Settings > Environment Variables**, add:
   - `NEXT_PUBLIC_APP_URL` = `https://your-domain.vercel.app`
   - `ADMIN_SECRET` = `your_strong_admin_passcode`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` = `rzp_live_xxxxxxxx`
   - `RAZORPAY_KEY_ID` = `rzp_live_xxxxxxxx`
   - `RAZORPAY_KEY_SECRET` = `your_razorpay_secret`
   - `RAZORPAY_WEBHOOK_SECRET` = `your_webhook_secret`
   - `DATABASE_URL` = `your_neon_or_supabase_postgres_url`
   - `RESEND_API_KEY` (Optional) = `re_xxxxxxxx`
4. Click **Deploy**. Vercel will build and deploy the entire Next.js App Router application.
