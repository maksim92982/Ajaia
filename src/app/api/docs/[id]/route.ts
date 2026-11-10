import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { canWrite, canRead } from "@/lib/access";
import { db } from "@/lib/db";
import { accessFor, shareList } from "@/lib/docs";
import { documents } from "@/lib/schema";
import { seedIfNeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  await seedIfNeeded();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await params;
  const { role, document } = await accessFor(id, user.id);
  if (!document || !canRead(role)) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
  const people = await shareList(id);
  return NextResponse.json(
    { document, role, shares: people },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(request: Request, { params }: Params) {
  await seedIfNeeded();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await params;
  const { role, document } = await accessFor(id, user.id);
  if (!document || !canWrite(role)) {
    return NextResponse.json({ error: "You cannot edit this document." }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { title?: string; contentHtml?: string } | null;
  const title = body?.title !== undefined ? String(body.title).trim() || "Untitled" : document.title;
  const contentHtml = body?.contentHtml !== undefined ? String(body.contentHtml) : document.contentHtml;
  const now = new Date();
  await db()
    .update(documents)
    .set({ title, contentHtml, updatedAt: now })
    .where(eq(documents.id, id));
  return NextResponse.json({ ok: true, title, updatedAt: now.toISOString() });
}

export async function DELETE(_: Request, { params }: Params) {
  await seedIfNeeded();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await params;
  const { role, document } = await accessFor(id, user.id);
  if (!document || role !== "owner") {
    return NextResponse.json({ error: "Only the owner can delete this document." }, { status: 403 });
  }
  await db().delete(documents).where(eq(documents.id, id));
  return NextResponse.json({ ok: true });
}
