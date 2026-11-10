import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/passwords";
import { users } from "@/lib/schema";
import { seedIfNeeded } from "@/lib/seed";

export async function POST(request: Request) {
  await seedIfNeeded();
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  const rows = await db().select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Unknown email or password." }, { status: 401 });
  }
  await setSession(user.id);
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
}
