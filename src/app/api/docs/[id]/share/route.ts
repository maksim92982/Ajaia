import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { currentUser } from "@/lib/auth";
import { canShare } from "@/lib/access";
import { db } from "@/lib/db";
import { accessFor, findUserByEmail, shareList } from "@/lib/docs";
import { shares } from "@/lib/schema";
import { seedIfNeeded } from "@/lib/seed";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  await seedIfNeeded();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await params;
  const { role, document } = await accessFor(id, user.id);
  if (!document || !canShare(role)) {
    return NextResponse.json({ error: "Only the owner can share this document." }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = String(body?.email || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Enter an email." }, { status: 400 });
  const target = await findUserByEmail(email);
  if (!target) {
    return NextResponse.json(
      { error: "No account with that email. Seeded users: maksim@ajaia.test and reviewer@ajaia.test." },
      { status: 404 },
    );
  }
  if (target.id === user.id) {
    return NextResponse.json({ error: "You already own this document." }, { status: 400 });
  }
  try {
    await db().insert(shares).values({
      id: randomUUID(),
      documentId: id,
      userId: target.id,
      createdAt: new Date(),
    });
  } catch {
    return NextResponse.json({ error: "Already shared with this person." }, { status: 409 });
  }
  const people = await shareList(id);
  return NextResponse.json({ shares: people });
}

export async function DELETE(request: Request, { params }: Params) {
  await seedIfNeeded();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await params;
  const { role, document } = await accessFor(id, user.id);
  if (!document || !canShare(role)) {
    return NextResponse.json({ error: "Only the owner can change sharing." }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { userId?: string } | null;
  const userId = String(body?.userId || "");
  if (!userId) return NextResponse.json({ error: "userId required." }, { status: 400 });
  await db()
    .delete(shares)
    .where(and(eq(shares.documentId, id), eq(shares.userId, userId)));
  const people = await shareList(id);
  return NextResponse.json({ shares: people });
}
