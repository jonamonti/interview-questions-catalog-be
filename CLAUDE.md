# Interview Questions Catalog: Backend

Express 5 + TypeScript + Prisma 7 + PostgreSQL API. Public read endpoints, one
API key for writes. Linear team: Interview-questions-catalog (tickets `INT-xx`).

Follow `docs/CONVENTIONS.md` for structure, naming, responses and testing.

## Commands

- `npm run dev`: dev server with auto-reload
- `npm run lint`, `npx prettier --check .`, `npm run typecheck`, `npm run build`: the checks CI runs
- `npm run db:up` / `db:down`: start / stop local Postgres (Docker Compose, port 5432)
- `npm run db:migrate`: create and apply a migration; `npm run db:studio`: browse data

## Gotchas

- Create `.env` (`cp .env.example .env`) **before** `npm install`: the Prisma
  `postinstall` needs `DATABASE_URL`.
- Port 5432 must be free; the project database runs only while `db:up` is active.
- The Prisma client is generated into `src/generated/prisma` (git-ignored) and
  imported only through `src/db.ts`.
- TypeScript is pinned to `~6.0` because `typescript-eslint` does not support 7 yet.
- Imports are relative; there are no path aliases (plain `tsc` does not rewrite them).
- IDs are integers on purpose (see conventions).

## Working style

- Arrow functions and modern JavaScript.
- Branch per ticket from an up-to-date `main`; PRs say `Closes INT-xx` only when
  the ticket is fully done, otherwise `Part of INT-xx`.
- Every environment variable the code reads goes in `.env.example`.
- Do not commit `.env` or secrets.
