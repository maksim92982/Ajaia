import { NextResponse } from "next/server";
import { currentUser, publicUser } from "@/lib/auth";
import { fail } from "@/lib/http";
import { seedIfNeeded } from "@/lib/seed";

export async function GET() {
  try {
    await seedIfNeeded();
    const user = await currentUser();
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user: publicUser(user) });
  } catch (error) {
    return fail(error, "Could not load session.");
  }
}
