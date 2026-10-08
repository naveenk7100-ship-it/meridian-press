import fs from "fs";
import path from "path";
import { Order, OrderStatus } from "@/types/database";
import { query, queryOne, isPostgresConfigured } from "@/lib/db";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

let memoryOrders: Order[] = [];
let initialized = false;

function ensureLocalFile(): void {
  if (initialized) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        memoryOrders = parsed;
      }
    }
  } catch (err) {
    console.warn("Using in-memory order storage:", err);
  }
  initialized = true;
}

function persistLocal(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(memoryOrders, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write orders to disk:", err);
  }
}

function mapRowToOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    customerEmail: String(row.customer_email),
    customerName: row.customer_name ? String(row.customer_name) : null,
    bookId: String(row.book_id),
    bookTitle: String(row.book_title),
    bookSlug: String(row.book_slug),
    amount: parseFloat(String(row.amount)),
    currency: (row.currency as Order["currency"]) || "INR",
    status: row.status as OrderStatus,
    razorpayOrderId: row.razorpay_order_id ? String(row.razorpay_order_id) : null,
    razorpayPaymentId: row.razorpay_payment_id ? String(row.razorpay_payment_id) : null,
    razorpaySignature: row.razorpay_signature ? String(row.razorpay_signature) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestampPart = Date.now().toString(36).substring(3, 7).toUpperCase();
  return `MER-${year}-${timestampPart}${randomPart}`;
}

export async function createOrderRecord(data: {
  id?: string;
  customerId: string;
  customerEmail: string;
  customerName?: string | null;
  bookId: string;
  bookTitle: string;
  bookSlug: string;
  amount: number;
  currency?: "INR" | "USD" | "EUR" | "GBP";
  razorpayOrderId?: string | null;
}): Promise<Order> {
  ensureLocalFile();

  const id = data.id || generateOrderNumber();
  const now = new Date().toISOString();

  const newOrder: Order = {
    id,
    customerId: data.customerId,
    customerEmail: data.customerEmail.toLowerCase().trim(),
    customerName: data.customerName?.trim() || null,
    bookId: data.bookId,
    bookTitle: data.bookTitle,
    bookSlug: data.bookSlug,
    amount: data.amount,
    currency: data.currency || "INR",
    status: "pending",
    razorpayOrderId: data.razorpayOrderId || null,
    createdAt: now,
    updatedAt: now,
  };

  if (isPostgresConfigured()) {
    try {
      await query(
        `INSERT INTO orders (
          id, customer_id, customer_email, customer_name,
          book_id, book_title, book_slug, amount, currency,
          status, razorpay_order_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          newOrder.id,
          newOrder.customerId,
          newOrder.customerEmail,
          newOrder.customerName,
          newOrder.bookId,
          newOrder.bookTitle,
          newOrder.bookSlug,
          newOrder.amount,
          newOrder.currency,
          newOrder.status,
          newOrder.razorpayOrderId,
          newOrder.createdAt,
          newOrder.updatedAt,
        ]
      );
    } catch (err) {
      console.error("[Orders Repo] Postgres INSERT error:", err);
    }
  }

  memoryOrders.unshift(newOrder);
  persistLocal();
  return newOrder;
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (isPostgresConfigured()) {
    try {
      const row = await queryOne("SELECT * FROM orders WHERE id = $1 LIMIT 1", [id]);
      if (row) return mapRowToOrder(row);
    } catch (err) {
      console.error("[Orders Repo] Postgres query failed:", err);
    }
  }

  ensureLocalFile();
  return memoryOrders.find((o) => o.id === id) || null;
}

export async function getOrderByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
  if (isPostgresConfigured()) {
    try {
      const row = await queryOne("SELECT * FROM orders WHERE razorpay_order_id = $1 LIMIT 1", [razorpayOrderId]);
      if (row) return mapRowToOrder(row);
    } catch (err) {
      console.error("[Orders Repo] Postgres error:", err);
    }
  }

  ensureLocalFile();
  return memoryOrders.find((o) => o.razorpayOrderId === razorpayOrderId) || null;
}

export async function markOrderPaid(
  id: string,
  paymentDetails: {
    razorpayPaymentId: string;
    razorpaySignature?: string | null;
  }
): Promise<Order | null> {
  ensureLocalFile();

  const now = new Date().toISOString();

  if (isPostgresConfigured()) {
    try {
      const updated = await queryOne(
        `UPDATE orders SET
          status = 'paid',
          razorpay_payment_id = $1,
          razorpay_signature = $2,
          updated_at = $3
        WHERE id = $4 RETURNING *`,
        [paymentDetails.razorpayPaymentId, paymentDetails.razorpaySignature || null, now, id]
      );
      if (updated) return mapRowToOrder(updated);
    } catch (err) {
      console.error("[Orders Repo] Postgres UPDATE error:", err);
    }
  }

  const order = memoryOrders.find((o) => o.id === id);
  if (!order) return null;

  order.status = "paid";
  order.razorpayPaymentId = paymentDetails.razorpayPaymentId;
  order.razorpaySignature = paymentDetails.razorpaySignature || null;
  order.updatedAt = now;
  persistLocal();
  return order;
}

export async function getAllOrders(limit = 100): Promise<Order[]> {
  if (isPostgresConfigured()) {
    try {
      const rows = await query("SELECT * FROM orders ORDER BY created_at DESC LIMIT $1", [limit]);
      if (rows.length > 0) {
        return rows.map(mapRowToOrder);
      }
    } catch (err) {
      console.error("[Orders Repo] Postgres query failed:", err);
    }
  }

  ensureLocalFile();
  return [...memoryOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export async function getOrdersByCustomerEmail(email: string): Promise<Order[]> {
  const cleanEmail = email.toLowerCase().trim();
  if (isPostgresConfigured()) {
    try {
      const rows = await query(
        "SELECT * FROM orders WHERE LOWER(customer_email) = $1 AND status = 'paid' ORDER BY created_at DESC",
        [cleanEmail]
      );
      return rows.map(mapRowToOrder);
    } catch (err) {
      console.error("[Orders Repo] Postgres query failed:", err);
    }
  }

  ensureLocalFile();
  return memoryOrders
    .filter((o) => o.customerEmail.toLowerCase() === cleanEmail && o.status === "paid")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getRealRevenueMetrics(): Promise<{
  totalRevenueINR: number;
  totalPaidOrders: number;
  totalPendingOrders: number;
}> {
  const orders = await getAllOrders(1000);
  const paidOrders = orders.filter((o) => o.status === "paid");
  const pendingOrders = orders.filter((o) => o.status === "pending");

  const totalRevenueINR = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

  return {
    totalRevenueINR,
    totalPaidOrders: paidOrders.length,
    totalPendingOrders: pendingOrders.length,
  };
}
