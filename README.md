# Ajaia Docs

Take-home assignment for **Ajaia LLC**: a small Google Docs–inspired editor. Not a clone. A usable slice: create, rename, rich-text edit, autosave, import a file, share with another seeded user.

Live URL: paste your Vercel URL here after deploy.

## Reviewer accounts

| Email | Password | Role |
| --- | --- | --- |
| `maksim@ajaia.test` | `ajaia-demo` | Owner of the seeded welcome document |
| `reviewer@ajaia.test` | `ajaia-demo` | Already has that document under **Shared with you** |

Sharing is by existing account email only (no public links, no invite emails).

## Supported file import

`.txt`, `.md`, `.docx` → a **new** editable document. Max 2 MB. Shown on the home screen.

## Local setup

Requires Node 20+.

```bash
cd ajaia
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). SQLite is created at `data/ajaia.db`.

```bash
npm test
npm run build
```

## Deploy on Vercel

1. Import this GitHub repo.
2. Set `AUTH_SECRET` to a long random string.
3. For data that survives serverless instances, create a free [Turso](https://turso.tech) database and set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`.
4. Without Turso, the app still boots (SQLite in `/tmp`) but documents can reset between instances. Do not use that mode for review.

Root directory on Vercel: `ajaia` if this folder sits inside a parent repo; otherwise leave default.

## What works

- Create / rename / rich text (bold, italic, underline, H1/H2, bullets, numbers)
- Autosave and reopen after refresh
- Import `.txt` / `.md` / `.docx`
- Owner vs shared lists, grant/revoke access by email
- Seeded users, cookie session
- Access-control unit tests + import tests

## Intentionally not built

Realtime cursors, comments, version history, PDF export, Google-style ACL, self-registration, mobile-native polish.

With another 2–4 hours: live presence, Markdown export, and editor vs viewer share roles.
