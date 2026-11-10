"use client";

import { useCallback, useEffect, useState } from "react";
import { HomeScreen } from "@/components/HomeScreen";
import { LoginScreen } from "@/components/LoginScreen";

type Me = { id: string; email: string; name: string };
type Lists = {
  owned: Array<{ id: string; title: string; updatedAt: string; role: "owner" }>;
  shared: Array<{ id: string; title: string; updatedAt: string; role: "shared"; ownerName?: string }>;
};

export function AppHome() {
  const [me, setMe] = useState<Me | null>(null);
  const [lists, setLists] = useState<Lists | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const meRes = await fetch("/api/me");
      const meJson = (await meRes.json().catch(() => null)) as { user: Me | null; error?: string } | null;
      if (!meRes.ok) {
        setError(meJson?.error || "Server error while loading session.");
        setReady(true);
        return;
      }
      if (!meJson?.user) {
        setMe(null);
        setLists(null);
        setError("");
        setReady(true);
        return;
      }
      const docsRes = await fetch("/api/docs");
      const docsJson = (await docsRes.json().catch(() => null)) as (Lists & { error?: string }) | null;
      if (!docsRes.ok) {
        setError(docsJson?.error || "Could not load documents.");
        setReady(true);
        return;
      }
      setMe(meJson.user);
      setLists(docsJson);
      setError("");
      setReady(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not reach the server.");
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!ready) {
    return <p className="px-6 py-16 text-[var(--muted)]">Loading…</p>;
  }
  if (error) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <p className="text-[#9b2c2c]">{error}</p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          On Vercel this usually means Turso env vars are missing or named differently. Need TURSO_DATABASE_URL and
          TURSO_AUTH_TOKEN.
        </p>
        <button type="button" className="mt-4 underline" onClick={() => void load()}>
          Retry
        </button>
      </main>
    );
  }
  if (!me) {
    return <LoginScreen onSignedIn={() => void load()} />;
  }
  return <HomeScreen me={me} lists={lists ?? { owned: [], shared: [] }} onRefresh={() => void load()} />;
}
