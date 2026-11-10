# AI workflow note

## Tools

- **Cursor** (Grok 4.6 agent) for scaffolding, API routes, TipTap wiring, and first-pass copy
- No codegen of the access model or share uniqueness — those were specified and then implemented/checked by hand

## Where AI sped things up

- Next.js 16 project layout, TipTap toolbar, and Drizzle/libSQL boilerplate
- README / architecture / submission drafts
- Import parser for simple markdown lists and headings

## What I changed or rejected

- Rejected a full Google-Docs clone and realtime CRDT (Yjs) as out of the timebox
- Rejected NextAuth + OAuth for a two-user demo
- Tightened access helpers so share/delete stay owner-only
- Fixed stale-title autosave with refs instead of closing over React state
- Kept Vercel persistence honest: Turso required for a reviewable deploy, not a silent `/tmp` demo

## How I verified

- `npm test` for access + import
- `npm run build` for typecheck/compile
- Manual flow locally, then on Vercel: login as Maksim, create, format, refresh, import, share with reviewer, login as reviewer
- Walkthrough: https://www.youtube.com/watch?v=Q0hyxoMRua8

## Production issues I fixed instead of ignoring

- First Vercel deploy returned 500 on `/api/me`: native `@libsql/client` is wrong on serverless. Switched remote Turso to `@libsql/client/web`.
- Share looked “broken” because the 400 error rendered behind the modal. Errors now show inside the dialog; TipTap had a duplicate `underline` extension.
