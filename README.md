# Interview Questions Catalog: Backend

Express + TypeScript API for the interview questions catalog.

## Prerequisites

- Node.js 22+
- npm

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` if you need a different port.

## Environment variables

| Variable   | Default       | Description          |
| ---------- | ------------- | -------------------- |
| `PORT`     | `3000`        | Port the server uses |
| `NODE_ENV` | `development` | Runtime environment  |

## Scripts

| Command             | What it does                               |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start with auto-reload                     |
| `npm run build`     | Compile TypeScript to `dist/`              |
| `npm start`         | Run the compiled build (run `build` first) |
| `npm run typecheck` | Type-check without emitting files          |
| `npm run lint`      | Lint with ESLint                           |
| `npm run format`    | Format with Prettier                       |

## Verify it works

```bash
npm run dev
curl localhost:3000/health   # {"status":"ok"}
```
