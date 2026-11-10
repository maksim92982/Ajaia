# Ajaia Docs

Take-home for **Ajaia LLC**: a small Google Docs–inspired editor. Not a clone. Create, rename, rich-text edit, autosave, import a file, share with a seeded teammate.

**Live demo:** [https://maksimaleksandrov.vercel.app/](https://maksimaleksandrov.vercel.app/)  
**Source:** [https://github.com/maksim92982/Ajaia](https://github.com/maksim92982/Ajaia)  
**Walkthrough:** [https://www.youtube.com/watch?v=Q0hyxoMRua8](https://www.youtube.com/watch?v=Q0hyxoMRua8)

## Reviewer accounts

Password for both: `ajaia-demo`

| Email | Role |
| --- | --- |
| `maksim@ajaia.test` | Owner of the seeded welcome document |
| `reviewer@ajaia.test` | Sees that document under **Shared with you** |

Sharing is by existing account email only. Do not use a personal inbox.

Quick share check: sign in as Maksim → open a document → Share → add `reviewer@ajaia.test` → sign out → sign in as Reviewer.

## Supported file import

`.txt`, `.md`, `.docx` become a **new** editable document. Max 2 MB. The home screen states the same limit.

A sample file is in `public/sample-import.md`.

## Local setup

Node 20+.

```bash
git clone https://github.com/maksim92982/Ajaia.git
cd Ajaia
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

1. Import this GitHub repo (root directory = repository root).
2. Set `AUTH_SECRET` to a long random string.
3. Create a free [Turso](https://turso.tech) database and set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`.
4. Without Turso, serverless instances can lose data. The live demo uses Turso Starter (free).

## What works

- Create / rename / rich text (bold, italic, underline, H1/H2, bullets, numbers)
- Export the open document as Markdown (toolbar, client-side download)
- Autosave and reopen after refresh
- Import `.txt` / `.md` / `.docx`
- Owner vs shared lists, grant/revoke access by email
- Seeded users, cookie session
- Access-control unit tests + import tests

## Intentionally not built

Realtime cursors, comments, version history, PDF export, Google-style ACL, self-registration.

With another 2–4 hours: live presence, Markdown export, and editor vs viewer share roles.
