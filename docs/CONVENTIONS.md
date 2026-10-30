# Conventions

How code is organised and written in this API. Adapted from the team's
`new-omniverse-be` guide for this project: public read API, one API key for
writes, PostgreSQL, Prisma 7. Follow these rules for every new endpoint.

## 1. Folder structure

```plaintext
prisma/
  schema.prisma            # DB schema (source of truth)
  migrations/              # committed SQL migrations
src/
  config/                  # typed environment variables (only place that reads process.env)
  constants/               # http-status.constants.ts, error-codes.constants.ts
  common/schemas/          # shared Zod schemas: pagination, error, api-response
  middlewares/             # error-handler, request-logger, api-key, not-found
  modules/
    question/              # one folder per domain, singular, kebab-case
      schemas/             # Zod request/response schemas + inferred types
      validation/          # one validation middleware per endpoint
      controllers/         # one controller per endpoint
      services/            # one service per use case
      repositories/        # *-read / *-write / *-queries
      format/              # DB shape -> API response shape
      question.routes.ts   # Express Router for the module
    tag/
  utils/                   # small cross-cutting helpers
  db.ts                    # the single shared Prisma Client
  app.ts                   # builds the Express app (no listen)
  api.routes.ts            # mounts every module router under /api
  index.ts                 # starts the server
```

`app.ts` never calls `listen`, so tests can import the app without opening a port.

## 2. Layers

| Layer          | Does                                                                                                      | Never                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **routes**     | map a path to the middleware chain: `apiKey` (writes only) -> validation -> controller                    | contain logic                                         |
| **validation** | parse `req.body` / `req.query` / `req.params` with a Zod schema, put the parsed value back, call `next()` | touch the database                                    |
| **controller** | call one service with the validated input and send the response with `httpStatus` constants               | validate input or hold business rules                 |
| **service**    | business logic: queries -> format -> return                                                               | validate input, write Prisma queries, know about HTTP |
| **repository** | Prisma calls (`*-read`, `*-write`, `*-queries` for aggregations)                                          | business rules                                        |
| **format**     | turn DB rows into the API response shape                                                                  | query the database                                    |

Express 5 forwards rejected promises from async handlers to the error
middleware, so controllers do not need `try/catch` + `next(error)`. Add a
`try/catch` only when a handler must build its own error response (for example
`/api/health`).

Write repositories accept an optional `tx?: Prisma.TransactionClient` and use
`(tx ?? prisma)`, so multi-step writes (for example creating a question with
its tags) can share one `prisma.$transaction`.

## 3. Naming

- Files and folders: `kebab-case`, domain folders singular (`question/`).
  File names say the layer: `create-question.controller.ts`,
  `question-read.repository.ts`, `question.schema.ts`.
- Functions are arrow functions, `camelCase`, verb first, no abbreviations:
  `createQuestionController`, `createQuestionService`, `findQuestionById`,
  `formatQuestionResponse`, `createQuestionValidation`.
- Zod schemas: `camelCase` + `Schema` (`createQuestionSchema`).
- Types from Zod: `PascalCase` + `Request` / `Response` / `Query`
  (`CreateQuestionRequest`). Never hand-write a type a schema already gives you.
- Enums: `PascalCase` name, `UPPER_CASE` members (`Difficulty.EASY`).
- Imports are relative (`../services/...`). No path aliases.

## 4. Validation (Zod 4)

- Request schemas use `.strict()` so unknown fields are rejected with 400.
- Describe schemas with `.meta({ id, description })`, and use `z.email()`
  style helpers rather than the deprecated `z.string().email()`.
- Query-string numbers are coerced (`z.coerce.number()`). Pagination uses one
  shared `paginationQuerySchema` in `src/common/schemas`: `page` defaults to 1,
  `limit` to 10 with a maximum; `skip` is derived, never client-supplied.
  `toPagination` in `src/utils/to-pagination.ts` turns the parsed query into
  Prisma's `{ skip, take }`. Keep the schema a plain object (no `.transform`)
  so endpoints can `.extend()` it with filters.
- Zod checks format, type and length. The database enforces uniqueness,
  foreign keys and NOT NULL. Do not duplicate one in the other.
- Validate with the `validate({ body, query, params })` middleware
  (`src/middlewares/validate.ts`). It parses each part and stores the result in
  `req.validated`; controllers read from there, never from the raw `req.body`.
  A failure throws a `ZodError`, which the error handler turns into a 400 with
  `error.details: [{ path, message }]` (one entry per failed field and per
  unknown key). Schemas are synchronous: no async refinements, so `parse` is
  enough.
- `src/modules/echo` is the reference example of a validated route (schema,
  validation, controller, routes). INT-11 replaces it with real endpoints.

## 5. Responses and errors

With data:

```json
{ "success": true, "message": "Question created successfully", "data": {} }
```

Without data (for example DELETE): `{ "success": true, "message": "..." }`.
Omit `data`; do not send `data: null`.

Lists: `data: { "pagination": { "page", "limit", "total" }, "list": [] }`.

Errors:

```json
{
  "success": false,
  "message": "Validation error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "path": "title", "message": "..." }]
  }
}
```

The central error middleware maps: `ZodError` -> 400, `AppError` -> its own
status, Prisma `P2002` -> 409, `P2025` -> 404, `P2003` -> 409, anything else ->
500 (without leaking internals). Services throw `AppError` with a code from
`error-codes.constants.ts`; they never catch Prisma errors. Use the
`httpStatus` constants, never raw numbers.

## 6. API conventions

- Every route is under `/api` (`/api/questions`, `/api/tags`). Resources are
  plural. Use GET, POST, PATCH, DELETE with their usual meaning.
- Reads are public. POST / PATCH / DELETE go through the API-key middleware
  (`x-api-key` header, compared in constant time). A missing and a wrong key
  both return 401, so a caller learns nothing about the key.
- Health check: `GET /api/health` (also reports whether the database is reachable).
- Order in a route: API key -> validation -> controller.

## 7. Database (PostgreSQL + Prisma 7)

- `prisma/schema.prisma` is the source of truth; every change ships as a
  committed migration (`npm run db:migrate`).
- IDs are auto-increment integers (this project's choice: public catalog, short
  URLs). The original guide uses `cuid()`; this is a deliberate deviation.
- Unique constraints and indexes live in the schema. Relations declare
  `onDelete`. Entities carry `createdAt` / `updatedAt`.
- Only `src/db.ts` creates a `PrismaClient`. Import it from there.
- The generated client lives in `src/generated/prisma` and is not committed.

## 8. Configuration

- All environment access goes through `src/config`. Required variables throw at
  startup; optional ones have defaults.
- Every variable the code reads is listed in `.env.example`, with no real
  secrets. `.env` is never committed.

## 9. Code quality

- TypeScript strict mode, no `any`, no unused code, no commented-out code.
- Before pushing: `npm run lint`, `npx prettier --check .`, `npm run typecheck`,
  `npm run build`. CI runs the same checks on every pull request.
- Use current JavaScript: `const`, arrow functions, template literals, `?.`,
  `??`, `async` / `await`, ES module syntax.

## 10. Testing (Jest + Supertest, from INT-18)

- A `.test.ts` file sits next to the file it tests.
- One flat `describe` per function (no nesting). Prefix the name to group
  scenarios: `describe('errorHandler - ZodError handling', ...)`.
- Each `it` uses the AAA pattern with `// ARRANGE`, `// ACT`, `// ASSERT`
  comments (`// ACT & ASSERT` when combined).
- `beforeEach(() => jest.clearAllMocks())`. Do not use `mockReset`.
- Service tests mock repositories; repository tests mock the Prisma client;
  controller tests mock services. Integration tests use a separate test
  database, never development data.
- Use `as never` for awkward mock return types instead of `eslint-disable`.

## 11. Pull request checklist

- [ ] Module follows the folder layout and layer rules above
- [ ] Request schemas are `.strict()`; types come from `z.infer`
- [ ] Controllers are thin; services hold no HTTP or validation code
- [ ] Responses use the standard envelope and `httpStatus` constants
- [ ] Schema changes include a committed migration
- [ ] New environment variables are in `.env.example` and the README
- [ ] CI is green
- [ ] PR description says `Closes INT-xx` only when the ticket is fully done,
      otherwise `Part of INT-xx`

## Deliberately not adopted from the original guide

Authentication, `roleGuard`, JWT / cookies and audit logging (this API has no
accounts), MySQL specifics, `cuid()` IDs, `@/` path aliases, Husky /
lint-staged and OpenAPI / Swagger (possible later tickets).
