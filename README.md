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

### Data model and migrations

The schema lives in `prisma/schema.prisma`:

- `Question`: title, Markdown answer, `Difficulty` (`EASY` | `MEDIUM` | `HARD`)
  and timestamps
- `Tag`: unique `name` and unique `slug`
- `QuestionTag`: explicit join table between questions and tags. Its primary
  key is `(questionId, tagId)`, it has an index on `tagId` for tag filtering,
  and both foreign keys use `ON DELETE CASCADE`, so deleting a question or a
  tag never leaves orphan rows.

Migrations are SQL files in `prisma/migrations/` and are committed to git.

```bash
npm run db:migrate   # create and apply a migration after editing the schema
npm run db:studio    # browse the data in Prisma Studio
```

`db:migrate` is for development. Production uses `prisma migrate deploy`, which
only applies existing migrations.

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
| `npm run db:migrate`  | Create and apply a Prisma migration        |
| `npm run db:studio`   | Open Prisma Studio                         |

## Verify it works

```bash
npm run db:up
npm run dev
curl localhost:3000/health      # {"status":"ok"}
curl localhost:3000/health/db   # {"status":"ok","database":"connected"}
```
