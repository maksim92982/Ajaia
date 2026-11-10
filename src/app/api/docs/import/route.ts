import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fileToHtml } from "@/lib/import-file";
import { documents } from "@/lib/schema";
import { seedIfNeeded } from "@/lib/seed";

export async function POST(request: Request) {
  await seedIfNeeded();
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a .txt, .md, or .docx file." }, { status: 400 });
  }
  try {
    const imported = await fileToHtml(file);
    const now = new Date();
    const id = randomUUID();
    await db().insert(documents).values({
      id,
      ownerId: user.id,
      title: imported.title,
      contentHtml: imported.html,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ id, title: imported.title });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
