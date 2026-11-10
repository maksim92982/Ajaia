import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { documents, shares, users } from "./schema";
import { roleFor, type AccessRole } from "./access";

export async function listDocuments(userId: string) {
  const owned = await db()
    .select()
    .from(documents)
    .where(eq(documents.ownerId, userId))
    .orderBy(desc(documents.updatedAt));

  const sharedRows = await db()
    .select({ document: documents, ownerName: users.name, ownerEmail: users.email })
    .from(shares)
    .innerJoin(documents, eq(shares.documentId, documents.id))
    .innerJoin(users, eq(documents.ownerId, users.id))
    .where(eq(shares.userId, userId))
    .orderBy(desc(documents.updatedAt));

  return {
    owned: owned.map((doc) => ({ ...doc, role: "owner" as const })),
    shared: sharedRows.map((row) => ({
      ...row.document,
      role: "shared" as const,
      ownerName: row.ownerName,
      ownerEmail: row.ownerEmail,
    })),
  };
}

export async function accessFor(documentId: string, userId: string): Promise<{
  role: AccessRole;
  document: typeof documents.$inferSelect | null;
}> {
  const rows = await db().select().from(documents).where(eq(documents.id, documentId)).limit(1);
  const document = rows[0] ?? null;
  if (!document) return { role: "none", document: null };
  const shareRows = await db()
    .select({ userId: shares.userId })
    .from(shares)
    .where(eq(shares.documentId, documentId));
  const role = roleFor(
    document.ownerId,
    userId,
    shareRows.map((row) => row.userId),
  );
  return { role, document };
}

export async function shareList(documentId: string) {
  return db()
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
    })
    .from(shares)
    .innerJoin(users, eq(shares.userId, users.id))
    .where(eq(shares.documentId, documentId));
}

export async function findUserByEmail(email: string) {
  const rows = await db().select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return rows[0] ?? null;
}
