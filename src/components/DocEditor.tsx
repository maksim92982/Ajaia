"use client";

import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, readJson } from "@/lib/api";

type SharePerson = { userId: string; email: string; name: string };
type Payload = {
  document: { id: string; title: string; contentHtml: string; ownerId: string };
  role: "owner" | "shared";
  shares: SharePerson[];
};

export function DocEditor({ id }: { id: string }) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [title, setTitle] = useState("");
  const [shares, setShares] = useState<SharePerson[]>([]);
  const [status, setStatus] = useState("Loading");
  const [error, setError] = useState("");
  const [shareEmail, setShareEmail] = useState("reviewer@ajaia.test");
  const [shareOpen, setShareOpen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const htmlRef = useRef("");
  const titleRef = useRef("");

  const persist = useCallback(
    async (nextTitle: string, nextHtml: string) => {
      setStatus("Saving…");
      try {
        await readJson(
          await apiFetch(`/api/docs/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: nextTitle, contentHtml: nextHtml }),
          }),
        );
        setStatus("Saved");
        setError("");
      } catch (caught) {
        setStatus("Save failed");
        setError(caught instanceof Error ? caught.message : "Save failed.");
      }
    },
    [id],
  );

  const scheduleSave = useCallback(
    (nextTitle: string, nextHtml: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void persist(nextTitle, nextHtml);
      }, 700);
    },
    [persist],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2] }, underline: false }),
      Underline,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    editorProps: {
      attributes: { class: "min-h-[60vh]" },
    },
    onUpdate: ({ editor: instance }) => {
      htmlRef.current = instance.getHTML();
      scheduleSave(titleRef.current, htmlRef.current);
    },
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await readJson<Payload>(await apiFetch(`/api/docs/${id}`));
        if (cancelled) return;
        setPayload(data);
        setTitle(data.document.title);
        titleRef.current = data.document.title;
        setShares(data.shares);
        htmlRef.current = data.document.contentHtml;
        editor?.commands.setContent(data.document.contentHtml, { emitUpdate: false });
        setStatus("Saved");
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not open document.");
      }
    }
    if (editor) void load();
    return () => {
      cancelled = true;
    };
  }, [editor, id]);

  function onTitle(next: string) {
    setTitle(next);
    titleRef.current = next;
    scheduleSave(next, htmlRef.current);
  }

  async function share(event: FormEvent) {
    event.preventDefault();
    const email = shareEmail.trim().toLowerCase();
    try {
      const result = await readJson<{ shares: SharePerson[] }>(
        await apiFetch(`/api/docs/${id}/share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }),
      );
      setShares(result.shares);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Share failed.");
    }
  }

  async function unshare(userId: string) {
    const result = await readJson<{ shares: SharePerson[] }>(
      await apiFetch(`/api/docs/${id}/share`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      }),
    );
    setShares(result.shares);
  }

  async function remove() {
    if (!window.confirm("Delete this document?")) return;
    await readJson(await apiFetch(`/api/docs/${id}`, { method: "DELETE" }));
    window.location.href = "/";
  }

  if (error && !payload) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-[#9b2c2c]">{error}</p>
        <Link href="/" className="mt-4 inline-block underline">
          Back
        </Link>
      </main>
    );
  }

  if (!payload || !editor) {
    return <p className="px-6 py-16 text-[var(--muted)]">Opening document…</p>;
  }

  const isOwner = payload.role === "owner";

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/" className="text-sm text-[var(--muted)]">
            ← Docs
          </Link>
          <input
            value={title}
            onChange={(event) => onTitle(event.target.value)}
            className="min-w-[12rem] flex-1 bg-transparent text-lg font-semibold outline-none"
            aria-label="Document title"
          />
          <span className="text-xs text-[var(--muted)]">{status}</span>
          <span className="rounded-full bg-[#efe6d8] px-2 py-0.5 text-[11px] uppercase">{payload.role}</span>
          {isOwner ? (
            <button type="button" className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm text-white" onClick={() => setShareOpen(true)}>
              Share
            </button>
          ) : null}
          {isOwner ? (
            <button type="button" className="text-sm text-[#9b2c2c]" onClick={() => void remove()}>
              Delete
            </button>
          ) : null}
        </div>
        <div className="mx-auto flex max-w-4xl flex-wrap gap-1 px-4 pb-2">
          <Tool action={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="B" title="Bold" />
          <Tool action={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="I" title="Italic" />
          <Tool action={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="U" title="Underline" />
          <Tool
            action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            label="H1"
            title="Heading"
          />
          <Tool
            action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            label="H2"
            title="Subheading"
          />
          <Tool action={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="•" title="Bulleted list" />
          <Tool action={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="1." title="Numbered list" />
        </div>
      </header>

      <div className="editor mx-auto max-w-3xl px-6 py-10">
        <EditorContent editor={editor} />
        {error ? <p className="mt-6 text-sm text-[#9b2c2c]">{error}</p> : null}
      </div>

      {shareOpen ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--white)] p-5 shadow-lg">
            <h2 className="text-lg font-semibold">Share this document</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Grants edit access. Try <code>reviewer@ajaia.test</code>, then sign in as that user.
            </p>
            <form onSubmit={share} className="mt-4 flex gap-2">
              <input
                name="email"
                className="flex-1 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                value={shareEmail}
                onChange={(event) => setShareEmail(event.target.value)}
                placeholder="reviewer@ajaia.test"
              />
              <button type="submit" className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm text-white">
                Add
              </button>
            </form>
            {error ? <p className="mt-3 text-sm text-[#9b2c2c]">{error}</p> : null}
            <ul className="mt-4 space-y-2">
              {shares.length === 0 ? <li className="text-sm text-[var(--muted)]">Not shared yet.</li> : null}
              {shares.map((person) => (
                <li key={person.userId} className="flex items-center justify-between text-sm">
                  <span>
                    {person.name} · {person.email}
                  </span>
                  <button type="button" className="text-[#9b2c2c]" onClick={() => void unshare(person.userId)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="mt-4 text-sm underline" onClick={() => setShareOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Tool({
  action,
  active,
  label,
  title,
}: {
  action: () => void;
  active: boolean;
  label: string;
  title: string;
}) {
  return (
    <button type="button" title={title} onClick={action} className={`toolbar-btn ${active ? "is-active" : ""}`}>
      {label}
    </button>
  );
}
