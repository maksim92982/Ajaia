# Portal paste (under 1000 lines)

Live product: https://maksimaleksandrov.vercel.app/

Demo accounts (password for both: `ajaia-demo`):
- maksim@ajaia.test — owner
- reviewer@ajaia.test — shared access to the welcome doc

GitHub: https://github.com/maksim92982/Ajaia.git

Google Drive folder: https://drive.google.com/drive/folders/1qIUmW40-zSetGYHavmR8ipJJrJBkB8Ni?usp=sharing

Walkthrough video: https://www.youtube.com/watch?v=Q0hyxoMRua8

## What works

Lightweight Docs slice: sign in with seeded users, create/rename documents, TipTap rich text (bold, italic, underline, H1/H2, bullets, numbers), debounce autosave to Turso, reopen after refresh. Import `.txt` / `.md` / `.docx` (max 2 MB) as a new document. Owner can share by existing-account email; home page splits Owned vs Shared. Reviewer can edit, cannot share or delete.

## How to review sharing in 2 minutes

1. Sign in as maksim@ajaia.test
2. Open or create a document, Share → add reviewer@ajaia.test
3. Sign out, sign in as reviewer@ajaia.test
4. Document appears under Shared with you

## Local run

```bash
git clone https://github.com/maksim92982/Ajaia.git
cd Ajaia
npm install
cp .env.example .env.local
npm run dev
npm test
```

Local persistence is SQLite at `data/ajaia.db`. Production uses Turso (free Starter).

## Incomplete / next 2–4 hours

Realtime presence, Markdown/PDF export, viewer-only role, registration.

Intentionally skipped: comments, version history, public links, full Google Docs parity.

Architecture: `ARCHITECTURE.md`. AI workflow: `AI_WORKFLOW.md`.
