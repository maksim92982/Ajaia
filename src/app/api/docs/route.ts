import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { listDocuments } from "@/lib/docs";
import { documents } from "@/lib/schema";
import { seedIfNeeded } from "@/lib/seed";

export async function GET() {
  await seedIfNeeded();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const lists = await listDocuments(user.id);
  return NextResponse.json(lists);
}

export async function POST(request: Request) {
  await seedIfNeeded();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { title?: string; contentHtml?: string } | null;
  const title = String(body?.title || "Untitled").trim() || "Untitled";
  const contentHtml = String(body?.contentHtml || "<h1></h1><p></p>");
  const now = new Date();
  const id = randomUUID();
  await db().insert(documents).values({
    id,
    ownerId: user.id,
    title,
    contentHtml,
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json({ id, title, contentHtml, role: "owner" });
}
