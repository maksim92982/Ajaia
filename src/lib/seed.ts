import { eq } from "drizzle-orm";
import { db, ensureSchema } from "./db";
import { documents, shares, users } from "./schema";
import { demoHash } from "./passwords";

export const DEMO_PASSWORD = "ajaia-demo";

const MAKSIM_ID = "user-maksim";
const REVIEWER_ID = "user-reviewer";
const SHARED_DOC_ID = "doc-welcome";

export async function seedIfNeeded(): Promise<void> {
  await ensureSchema();
  const existing = await db().select({ id: users.id }).from(users).where(eq(users.id, MAKSIM_ID)).limit(1);
  if (existing.length > 0) return;

  const now = new Date();
  const passwordHash = demoHash(DEMO_PASSWORD);

  await db().insert(users).values([
    {
      id: MAKSIM_ID,
      email: "maksim@ajaia.test",
      name: "Maksim Aleksandrov",
      passwordHash,
      createdAt: now,
    },
    {
      id: REVIEWER_ID,
      email: "reviewer@ajaia.test",
      name: "Ajaia Reviewer",
      passwordHash,
      createdAt: now,
    },
  ]);

  await db().insert(documents).values({
    id: SHARED_DOC_ID,
    ownerId: MAKSIM_ID,
    title: "Welcome to Ajaia Docs",
    contentHtml: `<h1>Welcome</h1><p>This is a seeded document so reviewers can try <strong>sharing</strong> without extra setup.</p><ul><li>Log in as <em>maksim@ajaia.test</em></li><li>Or as <em>reviewer@ajaia.test</em> to see it under Shared with me</li></ul>`,
    createdAt: now,
    updatedAt: now,
  });

  await db().insert(shares).values({
    id: "share-welcome",
    documentId: SHARED_DOC_ID,
    userId: REVIEWER_ID,
    createdAt: now,
  });
}
