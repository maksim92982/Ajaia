import { mkdirSync } from "node:fs";
import path from "node:path";
import { createClient as createNodeClient, type Client } from "@libsql/client";
import { createClient as createWebClient } from "@libsql/client/web";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

let cached: LibSQLDatabase<typeof schema> | null = null;
let rawClient: Client | null = null;

function envValue(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

export function databaseUrl(): string {
  return envValue(
    "TURSO_DATABASE_URL",
    "TURSO_URL",
    "LIBSQL_URL",
    "TURSO_DATABASE_TURSO_DATABASE_URL",
    "STORAGE_URL",
    "DATABASE_URL",
  );
}

export function databaseToken(): string {
  return envValue(
    "TURSO_AUTH_TOKEN",
    "TURSO_DATABASE_AUTH_TOKEN",
    "TURSO_DATABASE_TOKEN",
    "TURSO_TOKEN",
    "TURSO_DATABASE_TURSO_AUTH_TOKEN",
    "STORAGE_TOKEN",
    "STORAGE_AUTH_TOKEN",
  );
}

function createRawClient(): Client {
  const tursoUrl = databaseUrl();
  if (tursoUrl.startsWith("libsql://") || tursoUrl.startsWith("https://")) {
    return createWebClient({
      url: tursoUrl,
      authToken: databaseToken() || undefined,
    });
  }
  if (process.env.VERCEL) {
    throw new Error(
      "Missing Turso URL. In Vercel set TURSO_DATABASE_URL (libsql://...) and TURSO_AUTH_TOKEN.",
    );
  }
  const dir = path.join(process.cwd(), "data");
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "ajaia.db").replaceAll("\\", "/");
  return createNodeClient({ url: `file:${file}` });
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
