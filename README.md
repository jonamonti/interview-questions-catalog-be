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

| Variable            | Default                 | Description                                                    |
| ------------------- | ----------------------- | -------------------------------------------------------------- |
| `PORT`              | `3000`                  | Port the server uses                                           |
| `NODE_ENV`          | `development`           | Runtime environment                                            |
| `POSTGRES_USER`     | none                    | Database user created by Docker                                |
| `POSTGRES_PASSWORD` | none                    | Database password created by Docker                            |
| `POSTGRES_DB`       | none                    | Database name created by Docker                                |
| `DATABASE_URL`      | none                    | Connection string used by Prisma (required)                    |
| `API_KEY`           | none                    | Secret for write requests (required)                           |
| `CORS_ORIGINS`      | `http://localhost:5173` | Comma-separated origins allowed to call the API from a browser |

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

## Tests

`npm test` runs the whole suite (unit tests with mocks and integration tests
with Supertest). The integration tests need Postgres, so run `npm run db:up`
first. They use their own database, `interview_catalog_test`, on the same
container: it is created and migrated automatically, emptied before every
test, and never touches your development data. Set `TEST_DATABASE_URL` in your
shell to use a different server; its database name must end in `_test`.

## Scripts

| Command               | What it does                               |
| --------------------- | ------------------------------------------ |
| `npm run dev`         | Start with auto-reload                     |
| `npm run build`       | Compile TypeScript to `dist/`              |
| `npm start`           | Run the compiled build (run `build` first) |
| `npm run typecheck`   | Type-check without emitting files          |
| `npm test`            | Run unit and integration tests             |
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
curl -i localhost:3000/api/health
```

`GET /api/health` returns `200` when the API and the database are reachable and
`503` when the database is down.

### Response format

Every response uses one envelope. See `docs/CONVENTIONS.md` for details.

```json
{ "success": true, "message": "Service is healthy", "data": {} }
```

```json
{
  "success": false,
  "message": "Route GET /api/nope not found",
  "error": { "code": "NOT_FOUND" }
}
```

Unknown routes return `404`, malformed JSON returns `400` and unexpected errors
return `500`. In `NODE_ENV=production` a `500` never includes a stack trace;
in development the stack is in `error.details`. Each request is logged as
`METHOD /path status duration`.

### Write requests need the API key

POST / PATCH / DELETE routes require the `API_KEY` from your `.env`, sent in the
`x-api-key` header. A missing or wrong key returns `401`; GET routes are public.
Generate a key with `openssl rand -hex 32`.

## API documentation

The API is documented with OpenAPI, generated from the same Zod schemas that
validate requests, so it cannot drift from the code.

- Interactive docs (Swagger UI): `http://localhost:3000/api/docs`
- Raw document (import it into Postman): `http://localhost:3000/api/openapi.json`

| Endpoint              | Access      | What it does                                |
| --------------------- | ----------- | ------------------------------------------- |
| `GET /api/health`     | public      | API and database status                     |
| `GET /api/questions`  | public      | Paginated list of questions with their tags |
| `POST /api/questions` | `x-api-key` | Create a question and attach tags by name   |

In Swagger UI, click **Authorize** and paste your `API_KEY` to try the write
endpoints. Endpoint details (parameters, bodies, responses, errors) live only
in the OpenAPI document: `src/openapi/openapi.document.ts`.
