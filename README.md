# Interview Questions Catalog: Backend

Express + TypeScript API for the interview questions catalog.

## Prerequisites

- Node.js 22+
- npm
- Docker with the Compose plugin (for the local database)

## Setup

Create your `.env` **before** installing: `npm install` generates the Prisma
client, which needs `DATABASE_URL`.

```bash
cp .env.example .env
npm install
```

Edit `.env` if you need different ports or credentials.

## Environment variables

| Variable            | Default       | Description                                 |
| ------------------- | ------------- | ------------------------------------------- |
| `PORT`              | `3000`        | Port the server uses                        |
| `NODE_ENV`          | `development` | Runtime environment                         |
| `POSTGRES_USER`     | none          | Database user created by Docker             |
| `POSTGRES_PASSWORD` | none          | Database password created by Docker         |
| `POSTGRES_DB`       | none          | Database name created by Docker             |
| `DATABASE_URL`      | none          | Connection string used by Prisma (required) |

`.env.example` has working local values for all of them. Keep `DATABASE_URL`
consistent with the `POSTGRES_*` values and port 5432.

## Database

PostgreSQL runs locally in Docker (Compose).

> Port 5432 must be free. Stop any other local Postgres first.

```bash
npm run db:up      # start Postgres and wait until it is healthy
npm run db:down    # stop and remove the container (data is kept)
```

Data is stored in the `pgdata` Docker volume and survives `db:down`. To delete
it as well: `docker compose down -v`. Changed the `POSTGRES_*` values? Delete
the volume the same way so Postgres re-initialises.

Prisma generates its client into `src/generated/prisma` on `npm install`
(`postinstall`). Regenerate it manually with `npm run db:generate`.

## Scripts

| Command               | What it does                               |
| --------------------- | ------------------------------------------ |
| `npm run dev`         | Start with auto-reload                     |
| `npm run build`       | Compile TypeScript to `dist/`              |
| `npm start`           | Run the compiled build (run `build` first) |
| `npm run typecheck`   | Type-check without emitting files          |
| `npm run lint`        | Lint with ESLint                           |
| `npm run format`      | Format with Prettier                       |
| `npm run db:up`       | Start local Postgres (Docker)              |
| `npm run db:down`     | Stop local Postgres                        |
| `npm run db:generate` | Regenerate the Prisma client               |

## Verify it works

```bash
npm run db:up
npm run dev
curl localhost:3000/health      # {"status":"ok"}
curl localhost:3000/health/db   # {"status":"ok","database":"connected"}
```
