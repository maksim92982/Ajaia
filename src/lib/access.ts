export type AccessRole = "owner" | "shared" | "none";

export function roleFor(ownerId: string, userId: string, sharedUserIds: string[]): AccessRole {
  if (ownerId === userId) return "owner";
  if (sharedUserIds.includes(userId)) return "shared";
  return "none";
}

export function canRead(role: AccessRole): boolean {
  return role !== "none";
}

export function canWrite(role: AccessRole): boolean {
  return role === "owner" || role === "shared";
}

export function canShare(role: AccessRole): boolean {
  return role === "owner";
}
