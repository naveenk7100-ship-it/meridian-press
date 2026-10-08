import fs from "fs";
import path from "path";
import { Customer } from "@/types/database";
import { queryOne, isPostgresConfigured } from "@/lib/db";

const DATA_DIR = path.join(process.cwd(), "data");
const CUSTOMERS_FILE = path.join(DATA_DIR, "customers.json");

let memoryCustomers: Customer[] = [];
let initialized = false;

function ensureLocalFile(): void {
  if (initialized) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(CUSTOMERS_FILE)) {
      const content = fs.readFileSync(CUSTOMERS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        memoryCustomers = parsed;
      }
    }
  } catch (err) {
    console.warn("Using in-memory customer storage:", err);
  }
  initialized = true;
}

function persistLocal(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(memoryCustomers, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write customers to disk:", err);
  }
}

function mapRowToCustomer(row: Record<string, unknown>): Customer {
  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function findOrCreateCustomer(email: string, name?: string | null): Promise<Customer> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = name?.trim() || null;

  if (isPostgresConfigured()) {
    try {
      const existing = await queryOne("SELECT * FROM customers WHERE email = $1 LIMIT 1", [cleanEmail]);
      if (existing) {
        if (cleanName && !existing.name) {
          const updated = await queryOne(
            "UPDATE customers SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            [cleanName, existing.id]
          );
          return mapRowToCustomer(updated || existing);
        }
        return mapRowToCustomer(existing);
      }

      const id = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const created = await queryOne(
        "INSERT INTO customers (id, email, name) VALUES ($1, $2, $3) RETURNING *",
        [id, cleanEmail, cleanName]
      );
      if (created) return mapRowToCustomer(created);
    } catch (err) {
      console.error("[Customers Repo] Postgres query failed, using local store:", err);
    }
  }

  ensureLocalFile();
  let cust = memoryCustomers.find((c) => c.email === cleanEmail);
  if (cust) {
    if (cleanName && !cust.name) {
      cust.name = cleanName;
      cust.updatedAt = new Date().toISOString();
      persistLocal();
    }
    return cust;
  }

  const now = new Date().toISOString();
  cust = {
    id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    name: cleanName,
    createdAt: now,
    updatedAt: now,
  };

  memoryCustomers.push(cust);
  persistLocal();
  return cust;
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const cleanEmail = email.toLowerCase().trim();
  if (isPostgresConfigured()) {
    try {
      const row = await queryOne("SELECT * FROM customers WHERE email = $1 LIMIT 1", [cleanEmail]);
      if (row) return mapRowToCustomer(row);
    } catch (err) {
      console.error("[Customers Repo] Postgres error:", err);
    }
  }

  ensureLocalFile();
  return memoryCustomers.find((c) => c.email === cleanEmail) || null;
}
