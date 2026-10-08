import fs from "fs";
import path from "path";
import { NewsletterSubscriber } from "@/types/database";
import { query, queryOne, isPostgresConfigured } from "@/lib/db";

const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");

let memorySubscribers: NewsletterSubscriber[] = [];
let initialized = false;

function ensureLocalStore(): void {
  if (initialized) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const content = fs.readFileSync(SUBSCRIBERS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        memorySubscribers = parsed;
      }
    }
  } catch (err) {
    console.warn("Using in-memory subscriber storage:", err);
  }
  initialized = true;
}

function persistLocal(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(memorySubscribers, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write subscribers to disk:", err);
  }
}

export async function addSubscriber(
  email: string,
  frequency: "monthly" | "quarterly" = "monthly",
  interests: string[] = []
): Promise<{ subscriber: NewsletterSubscriber; isNew: boolean }> {
  ensureLocalStore();
  const normalizedEmail = email.toLowerCase().trim();

  // Check in Postgres
  if (isPostgresConfigured()) {
    try {
      const existing = await queryOne(
        "SELECT * FROM newsletter_subscribers WHERE email = $1 LIMIT 1",
        [normalizedEmail]
      );

      if (existing) {
        return {
          subscriber: {
            id: String(existing.id),
            email: String(existing.email),
            frequency: existing.frequency as "monthly" | "quarterly",
            interests: Array.isArray(existing.interests) ? (existing.interests as string[]) : [],
            createdAt: new Date(String(existing.created_at)).toISOString(),
          },
          isNew: false,
        };
      }

      const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      await query(
        "INSERT INTO newsletter_subscribers (id, email, frequency, interests, created_at) VALUES ($1, $2, $3, $4, $5)",
        [id, normalizedEmail, frequency, interests, now]
      );

      return {
        subscriber: { id, email: normalizedEmail, frequency, interests, createdAt: now },
        isNew: true,
      };
    } catch (err) {
      console.error("[Newsletter Repo] Postgres query failed, using local store fallback:", err);
    }
  }

  // Local fallback
  const existing = memorySubscribers.find((s) => s.email === normalizedEmail);
  if (existing) {
    return { subscriber: existing, isNew: false };
  }

  const newSub: NewsletterSubscriber = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: normalizedEmail,
    frequency,
    interests,
    createdAt: new Date().toISOString(),
  };

  memorySubscribers.push(newSub);
  persistLocal();
  return { subscriber: newSub, isNew: true };
}

export async function getAllSubscribers(): Promise<NewsletterSubscriber[]> {
  if (isPostgresConfigured()) {
    try {
      const rows = await query("SELECT * FROM newsletter_subscribers ORDER BY created_at DESC");
      return rows.map((r) => ({
        id: String(r.id),
        email: String(r.email),
        frequency: r.frequency as "monthly" | "quarterly",
        interests: Array.isArray(r.interests) ? (r.interests as string[]) : [],
        createdAt: new Date(String(r.created_at)).toISOString(),
      }));
    } catch (err) {
      console.error("[Newsletter Repo] Postgres query error:", err);
    }
  }

  ensureLocalStore();
  return [...memorySubscribers];
}
