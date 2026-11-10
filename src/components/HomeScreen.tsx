"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { readJson } from "@/lib/api";

type DocRow = {
  id: string;
  title: string;
  updatedAt: string | Date;
  role: "owner" | "shared";
  ownerName?: string;
};

type Lists = { owned: DocRow[]; shared: DocRow[] };
type Me = { id: string; email: string; name: string };

function when(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export function HomeScreen({ me, lists, onRefresh }: { me: Me; lists: Lists; onRefresh: () => void }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function createDoc() {
    setBusy(true);
    setError("");
    try {
      const created = await readJson<{ id: string }>(
        await fetch("/api/docs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Untitled", contentHtml: "<h1></h1><p></p>" }),
        }),
      );
      router.push(`/docs/${created.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create.");
      setBusy(false);
    }
  }

  async function importFile(file: File) {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const created = await readJson<{ id: string }>(await fetch("/api/docs/import", { method: "POST", body: form }));
      router.push(`/docs/${created.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Import failed.");
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    onRefresh();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm tracking-[0.2em] text-[#1f5c57] uppercase">Ajaia Docs</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your documents</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Signed in as {me.name} ({me.email})
          </p>
        </div>
        <button className="text-sm underline" onClick={signOut} type="button">
          Sign out
        </button>
      </header>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          disabled={busy}
          onClick={createDoc}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-white disabled:opacity-60"
        >
          New document
        </button>
        <button
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-[var(--line)] bg-[var(--white)] px-4 py-2"
        >
          Import .txt / .md / .docx
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.docx,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void importFile(file);
          }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">Uploads become a new editable document. Max 2 MB.</p>
      {error ? <p className="mt-3 text-sm text-[#9b2c2c]">{error}</p> : null}

      <Section title="Owned by you" empty="No documents yet." rows={lists.owned} onOpen={(id) => router.push(`/docs/${id}`)} />
      <Section
        title="Shared with you"
        empty="Nothing shared with this account yet. Sign in as reviewer@ajaia.test to see the welcome doc."
        rows={lists.shared}
        onOpen={(id) => router.push(`/docs/${id}`)}
      />
    </main>
  );
}

function Section({
  title,
  empty,
  rows,
  onOpen,
}: {
  title: string;
  empty: string;
  rows: DocRow[];
  onOpen: (id: string) => void;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--white)]">
          {rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onOpen(row.id)}
                className="flex w-full items-start justify-between gap-4 px-4 py-3 text-left hover:bg-[#f8f1e6]"
              >
                <span>
                  <span className="block font-medium">{row.title || "Untitled"}</span>
                  <span className="block text-xs text-[var(--muted)]">
                    {row.role === "shared" && row.ownerName ? `From ${row.ownerName} · ` : ""}
                    Updated {when(row.updatedAt)}
                  </span>
                </span>
                <span className="rounded-full bg-[#efe6d8] px-2 py-0.5 text-[11px] uppercase tracking-wide">
                  {row.role}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
