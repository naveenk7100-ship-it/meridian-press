import fs from "fs";
import path from "path";
import { Payment } from "@/types/database";
import { query, queryOne, isPostgresConfigured } from "@/lib/db";

const DATA_DIR = path.join(process.cwd(), "data");
const PAYMENTS_FILE = path.join(DATA_DIR, "payments.json");

let memoryPayments: Payment[] = [];
let initialized = false;

function ensureLocalFile(): void {
  if (initialized) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(PAYMENTS_FILE)) {
      const content = fs.readFileSync(PAYMENTS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        memoryPayments = parsed;
      }
    }
  } catch (err) {
    console.warn("Using in-memory payment storage:", err);
  }
  initialized = true;
}

function persistLocal(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(memoryPayments, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write payments to disk:", err);
  }
}

function mapRowToPayment(row: Record<string, unknown>): Payment {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    provider: "razorpay",
    providerPaymentId: String(row.provider_payment_id),
    providerOrderId: String(row.provider_order_id),
    amount: parseFloat(String(row.amount)),
    currency: (row.currency as Payment["currency"]) || "INR",
    status: (row.status as Payment["status"]) || "captured",
    method: row.method ? String(row.method) : undefined,
    fee: row.fee ? parseFloat(String(row.fee)) : undefined,
    tax: row.tax ? parseFloat(String(row.tax)) : undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export async function createPaymentRecord(data: {
  orderId: string;
  providerPaymentId: string;
  providerOrderId: string;
  amount: number;
  currency?: string;
  status?: "captured" | "failed" | "refunded";
  method?: string;
  fee?: number;
  tax?: number;
  rawResponse?: unknown;
}): Promise<Payment> {
  ensureLocalFile();

  const id = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newPayment: Payment = {
    id,
    orderId: data.orderId,
    provider: "razorpay",
    providerPaymentId: data.providerPaymentId,
    providerOrderId: data.providerOrderId,
    amount: data.amount,
    currency: data.currency || "INR",
    status: data.status || "captured",
    method: data.method,
    fee: data.fee,
    tax: data.tax,
    createdAt: now,
  };

  if (isPostgresConfigured()) {
    try {
      await query(
        `INSERT INTO payments (
          id, order_id, provider, provider_payment_id,
          provider_order_id, amount, currency, status,
          method, fee, tax, raw_response, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          newPayment.id,
          newPayment.orderId,
          newPayment.provider,
          newPayment.providerPaymentId,
          newPayment.providerOrderId,
          newPayment.amount,
          newPayment.currency,
          newPayment.status,
          newPayment.method || null,
          newPayment.fee || null,
          newPayment.tax || null,
          JSON.stringify(data.rawResponse || null),
          newPayment.createdAt,
        ]
      );
    } catch (err) {
      console.error("[Payments Repo] Postgres INSERT error:", err);
    }
  }

  memoryPayments.unshift(newPayment);
  persistLocal();
  return newPayment;
}

export async function getPaymentByOrderId(orderId: string): Promise<Payment | null> {
  if (isPostgresConfigured()) {
    try {
      const row = await queryOne("SELECT * FROM payments WHERE order_id = $1 LIMIT 1", [orderId]);
      if (row) return mapRowToPayment(row);
    } catch (err) {
      console.error("[Payments Repo] Postgres error:", err);
    }
  }

  ensureLocalFile();
  return memoryPayments.find((p) => p.orderId === orderId) || null;
}
