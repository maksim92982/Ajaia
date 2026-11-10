# Architecture note

## Product cut

The assignment is a 4–6 hour slice, not Google Docs. I prioritized one coherent loop: **sign in → own vs shared lists → edit with formatting → persist HTML → share by email → import a file into a new doc**.

I skipped realtime collaboration, comments, history, and public links. Those are expensive and easy to fake poorly. Sharing with two seeded accounts is enough to demonstrate access logic. After the core shipped, I added one stretch: client-side **Export to Markdown** from the editor toolbar.

## Stack

- **Next.js App Router** (frontend + API on one deploy, matches a Vercel review)
- **TipTap** for the editor (StarterKit + underline)
- **Drizzle + libSQL** so local SQLite and Turso (Vercel) share the same schema
- **HMAC cookie session**, not NextAuth — two demo users, no OAuth tax
- **scrypt** password hashes; seeded accounts use a deterministic demo hash so they survive restarts

Layers:

1. `src/lib/schema.ts` — tables: users, documents, shares
2. `src/lib/access.ts` — owner / shared / none (tested)
3. `src/app/api/**` — HTTP, validation, DTO-shaped JSON
4. `src/components/**` — UI, autosave debounce, share modal

Document body is stored as HTML from TipTap. That preserves headings, lists, and marks without a custom document model.

## Sharing model

- Owner always has full control (edit, share, delete)
- Shared users can edit, cannot share or delete
- Unique `(document_id, user_id)` so double-share is a conflict, not a duplicate row
- Home page splits **Owned by you** and **Shared with you**

## File import

Server-side: extension allowlist, 2 MB cap, `.docx` via mammoth, `.txt`/`.md` via a small block parser. Import always creates a new document so it cannot clobber an open draft.

## Persistence on Vercel

Serverless file SQLite is not durable. Production path is Turso (`TURSO_DATABASE_URL`). Local path is `data/ajaia.db`. Schema is created on first request (`ensureSchema` + `seedIfNeeded`).

## Tests

`src/lib/access.test.ts` — the access matrix reviewers care about.  
`src/lib/import-file.test.ts` — markdown/list conversion and rejection of bad uploads.
