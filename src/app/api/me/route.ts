import { NextResponse } from "next/server";
import { currentUser, publicUser } from "@/lib/auth";
import { seedIfNeeded } from "@/lib/seed";

export async function GET() {
  await seedIfNeeded();
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: publicUser(user) });
}
