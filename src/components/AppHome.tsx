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

  const load = useCallback(async () => {
    const meRes = await fetch("/api/me");
    const meJson = (await meRes.json()) as { user: Me | null };
    if (!meJson.user) {
      setMe(null);
      setLists(null);
      setReady(true);
      return;
    }
    const docsRes = await fetch("/api/docs");
    const docsJson = (await docsRes.json()) as Lists;
    setMe(meJson.user);
    setLists(docsJson);
    setReady(true);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!ready) {
    return <p className="px-6 py-16 text-[var(--muted)]">Loading…</p>;
  }
  if (!me) {
    return <LoginScreen onSignedIn={() => void load()} />;
  }
  return <HomeScreen me={me} lists={lists ?? { owned: [], shared: [] }} onRefresh={() => void load()} />;
}
