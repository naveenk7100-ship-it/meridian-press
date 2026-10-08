import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DownloadEntitlement } from "@/types/database";
import { query, queryOne, isPostgresConfigured } from "@/lib/db";

const DATA_DIR = path.join(process.cwd(), "data");
const ENTITLEMENTS_FILE = path.join(DATA_DIR, "entitlements.json");

let memoryEntitlements: DownloadEntitlement[] = [];
let initialized = false;

function ensureLocalFile(): void {
  if (initialized) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ENTITLEMENTS_FILE)) {
      const content = fs.readFileSync(ENTITLEMENTS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        memoryEntitlements = parsed;
      }
    }
  } catch (err) {
    console.warn("Using in-memory entitlement storage:", err);
  }
  initialized = true;
}

function persistLocal(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ENTITLEMENTS_FILE, JSON.stringify(memoryEntitlements, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write entitlements to disk:", err);
  }
}

function mapRowToEntitlement(row: Record<string, unknown>): DownloadEntitlement {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    bookId: String(row.book_id),
    customerEmail: String(row.customer_email),
    accessToken: String(row.access_token),
    expiresAt: new Date(String(row.expires_at)).toISOString(),
    maxDownloads: Number(row.max_downloads),
    downloadCount: Number(row.download_count),
    formatAccess: (row.format_access as "ALL" | "EPUB" | "PDF" | "MOBI") || "ALL",
    isRevoked: Boolean(row.is_revoked),
    lastDownloadedAt: row.last_downloaded_at ? new Date(String(row.last_downloaded_at)).toISOString() : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export function generateSecureAccessToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export async function createDownloadEntitlementRecord(data: {
  orderId: string;
  bookId: string;
  customerEmail: string;
  expiresInDays?: number;
  maxDownloads?: number;
  formatAccess?: "ALL" | "EPUB" | "PDF" | "MOBI";
}): Promise<DownloadEntitlement> {
  ensureLocalFile();

  const id = `ent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const accessToken = generateSecureAccessToken();
  const now = new Date();
  const expiryDate = new Date(now.getTime() + (data.expiresInDays || 14) * 24 * 60 * 60 * 1000);

  const newEntitlement: DownloadEntitlement = {
    id,
    orderId: data.orderId,
    bookId: data.bookId,
    customerEmail: data.customerEmail.toLowerCase().trim(),
    accessToken,
    expiresAt: expiryDate.toISOString(),
    maxDownloads: data.maxDownloads || 15,
    downloadCount: 0,
    formatAccess: data.formatAccess || "ALL",
    isRevoked: false,
    lastDownloadedAt: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  if (isPostgresConfigured()) {
    try {
      await query(
        `INSERT INTO download_entitlements (
          id, order_id, book_id, customer_email, access_token,
          expires_at, max_downloads, download_count, format_access,
          is_revoked, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          newEntitlement.id,
          newEntitlement.orderId,
          newEntitlement.bookId,
          newEntitlement.customerEmail,
          newEntitlement.accessToken,
          newEntitlement.expiresAt,
          newEntitlement.maxDownloads,
          newEntitlement.downloadCount,
          newEntitlement.formatAccess,
          newEntitlement.isRevoked,
          newEntitlement.createdAt,
          newEntitlement.updatedAt,
        ]
      );
    } catch (err) {
      console.error("[Entitlements Repo] Postgres INSERT error:", err);
    }
  }

  memoryEntitlements.unshift(newEntitlement);
  persistLocal();
  return newEntitlement;
}

export async function getEntitlementByToken(token: string): Promise<DownloadEntitlement | null> {
  if (isPostgresConfigured()) {
    try {
      const row = await queryOne(
        "SELECT * FROM download_entitlements WHERE access_token = $1 LIMIT 1",
        [token]
      );
      if (row) return mapRowToEntitlement(row);
    } catch (err) {
      console.error("[Entitlements Repo] Postgres query failed:", err);
    }
  }

  ensureLocalFile();
  return memoryEntitlements.find((e) => e.accessToken === token) || null;
}

export async function getEntitlementByOrderId(orderId: string): Promise<DownloadEntitlement | null> {
  if (isPostgresConfigured()) {
    try {
      const row = await queryOne(
        "SELECT * FROM download_entitlements WHERE order_id = $1 AND is_revoked = false ORDER BY created_at DESC LIMIT 1",
        [orderId]
      );
      if (row) return mapRowToEntitlement(row);
    } catch (err) {
      console.error("[Entitlements Repo] Postgres query failed:", err);
    }
  }

  ensureLocalFile();
  return memoryEntitlements.find((e) => e.orderId === orderId && !e.isRevoked) || null;
}

export async function getEntitlementsByCustomerEmail(email: string): Promise<DownloadEntitlement[]> {
  const cleanEmail = email.toLowerCase().trim();
  if (isPostgresConfigured()) {
    try {
      const rows = await query(
        "SELECT * FROM download_entitlements WHERE LOWER(customer_email) = $1 AND is_revoked = false ORDER BY created_at DESC",
        [cleanEmail]
      );
      return rows.map(mapRowToEntitlement);
    } catch (err) {
      console.error("[Entitlements Repo] Postgres error:", err);
    }
  }

  ensureLocalFile();
  return memoryEntitlements
    .filter((e) => e.customerEmail.toLowerCase() === cleanEmail && !e.isRevoked)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function recordDownloadActivity(id: string): Promise<DownloadEntitlement | null> {
  ensureLocalFile();

  const now = new Date().toISOString();

  if (isPostgresConfigured()) {
    try {
      const updated = await queryOne(
        `UPDATE download_entitlements SET
          download_count = download_count + 1,
          last_downloaded_at = $1,
          updated_at = $1
        WHERE id = $2 RETURNING *`,
        [now, id]
      );
      if (updated) return mapRowToEntitlement(updated);
    } catch (err) {
      console.error("[Entitlements Repo] Postgres UPDATE error:", err);
    }
  }

  const ent = memoryEntitlements.find((e) => e.id === id);
  if (!ent) return null;

  ent.downloadCount += 1;
  ent.lastDownloadedAt = now;
  ent.updatedAt = now;
  persistLocal();
  return ent;
}

export async function revokeEntitlementRecord(id: string): Promise<boolean> {
  ensureLocalFile();
  const now = new Date().toISOString();

  if (isPostgresConfigured()) {
    try {
      await query("UPDATE download_entitlements SET is_revoked = true, updated_at = $1 WHERE id = $2", [now, id]);
    } catch (err) {
      console.error("[Entitlements Repo] Postgres error:", err);
    }
  }

  const ent = memoryEntitlements.find((e) => e.id === id);
  if (ent) {
    ent.isRevoked = true;
    ent.updatedAt = now;
    persistLocal();
    return true;
  }
  return false;
}
