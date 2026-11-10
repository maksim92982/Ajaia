import { mkdirSync } from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

let cached: LibSQLDatabase<typeof schema> | null = null;
let rawClient: Client | null = null;

function createRawClient(): Client {
  const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "";
  if (tursoUrl.startsWith("libsql://") || tursoUrl.startsWith("https://")) {
    return createClient({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  const dir = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "ajaia.db").replaceAll("\\", "/");
  return createClient({ url: `file:${file}` });
}

export function db(): LibSQLDatabase<typeof schema> {
  if (!cached) {
    rawClient = createRawClient();
    cached = drizzle(rawClient, { schema });
  }
  return cached;
}

export async function ensureSchema(): Promise<void> {
  const conn = db();
  await conn.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
  await conn.run(sql`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content_html TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
  await conn.run(sql`
    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
  await conn.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS shares_doc_user ON shares (document_id, user_id)`);
}
