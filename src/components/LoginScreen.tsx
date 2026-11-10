"use client";

import { FormEvent, useState } from "react";
import { readJson } from "@/lib/api";

const ACCOUNTS = [
  { email: "maksim@ajaia.test", label: "Maksim (owner)" },
  { email: "reviewer@ajaia.test", label: "Reviewer (shared)" },
];

export function LoginScreen({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState(ACCOUNTS[0].email);
  const [password, setPassword] = useState("ajaia-demo");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await readJson(
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }),
      );
      onSignedIn();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-sm tracking-[0.2em] text-[#1f5c57] uppercase">Ajaia LLC</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Docs</h1>
      <p className="mt-3 text-[var(--muted)]">
        A small collaborative editor: create, format, import a file, and share with a seeded teammate.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
        <label className="block text-sm">
          Email
          <input
            className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="text-sm text-[#9b2c2c]">{error}</p> : null}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-white disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <div className="flex flex-wrap gap-2 pt-1">
          {ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              className="rounded-full border border-[var(--line)] px-3 py-1 text-xs"
              onClick={() => {
                setEmail(account.email);
                setPassword("ajaia-demo");
              }}
            >
              {account.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--muted)]">
          Demo password for both accounts: <code>ajaia-demo</code>
        </p>
      </form>
    </main>
  );
}
