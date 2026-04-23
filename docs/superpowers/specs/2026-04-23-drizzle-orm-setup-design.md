# Drizzle ORM Setup — Design

**Date:** 2026-04-23
**Status:** Approved
**Scope:** Add Drizzle ORM to the monorepo as a shared workspace (`@repo/db`), wire `apps/api` to it, set up a local Postgres via Docker outside the repo, and establish a migration workflow with timestamp-prefixed, meaningfully named files.

## Goals

- Provide a single source of truth for database schema and migrations that can be shared across current and future microservices that target the same database.
- Keep per-service configuration (connection string, pool size, etc.) inside each service's `.env`.
- Require meaningful migration names, with a millisecond-timestamp prefix so parallel branches don't collide on filenames.
- Maintain the repo's existing quality bar: ESM-only, strict TypeScript, zero ESLint warnings, 100% Jest coverage.
- Keep the local development workflow ergonomic: one `docker compose up -d`, one `.env` edit, then `yarn dev`.

## Non-goals

- Defining any domain tables (todos, users, etc.). The starter schema is intentionally empty; the first real migration happens when the first table is added.
- Auto-applying migrations at API boot. Migrations are applied explicitly via CLI in both dev and prod.
- Supporting a `drizzle-kit push`-only workflow. Migration files are the source of truth.
- Integrating Drizzle into `apps/web`, `apps/mobile`, or `apps/docs`. This spec is backend-only.

## Decisions

| Decision | Choice | Rationale |
| -------- | ------ | --------- |
| Package placement | `packages/db` (new workspace, name `@repo/db`) | Multiple services may target the same DB; migrations must be single-sourced. |
| Build step for `@repo/db` | None — source-only, exports map points at `./src/*.ts` | Matches `@repo/ui`'s pattern; consumers resolve TS directly via tsx / ts-jest. |
| Runtime loader for `apps/api` | `tsx` in both `dev` and `start` | `apps/api` imports `@repo/db`, whose exports resolve to `.ts` source. Node cannot execute `.ts`, so `start` switches from `node dist/server.js` to `tsx src/server.ts`. Keeps a single, simple runtime pattern across workspaces. |
| Driver | `pg` + `drizzle-orm/node-postgres` | Standard Node-Postgres driver; stable, widely used. |
| Migration prefix | `timestamp` (Drizzle Kit option, millisecond UNIX epoch) | Avoids name collisions on parallel branches per user requirement. |
| Migration application | Manual only (`yarn workspace @repo/db db:migrate`) | Same command in dev, CI, prod; no divergent behavior. |
| Env loading | `dotenv/config` at the top of each runtime entry (API server, migrate CLI, drizzle.config.ts) | tsx does not auto-load `.env`. |
| Local Postgres location | `/home/ronyv/Develop/Projects/docker-images/smartodo-ce/postgres/` (outside the repo) | Per user instruction; keeps infra out of source. |
| Initial schema | Empty (`export const schema = {} as const`) | Per user — no tables yet. |

## Repository layout

```
packages/db/
  package.json
  tsconfig.json
  eslint.config.js
  jest.config.ts
  drizzle.config.ts
  CLAUDE.md
  .env.example
  .gitignore              # .env, coverage/
  src/
    index.ts              # barrel exports
    schema.ts             # empty schema (placeholder)
    env.ts                # parseDbEnv(source): DbConfig
    client.ts             # createDb(config): { db, pool }
    migrate.ts            # runMigrations(db, folder): Promise<void>
    bin/
      migrate.ts          # CLI entry (excluded from coverage)
    __tests__/
      schema.test.ts
      env.test.ts
      client.test.ts
      migrate.test.ts
  migrations/
    .gitkeep              # drizzle-kit will populate this

apps/api/
  .env.example            # PORT, DATABASE_URL template
  .gitignore              # adds .env
  package.json            # adds @repo/db, dotenv; `start` switches to `tsx src/server.ts`
  src/
    config/
      env.ts              # parseApiEnv(source): ApiConfig
    db.ts                 # singleton db built from env
    app.ts                # unchanged
    server.ts             # + import 'dotenv/config' at top
    __tests__/
      health.test.ts      # unchanged
      env.test.ts         # new
      db.test.ts          # new
```

## Module contracts

### `@repo/db` — public API

```ts
// packages/db/src/index.ts
export { schema } from './schema.js';
export { createDb, type DbClient, type DbConfig } from './client.js';
export { runMigrations } from './migrate.js';
export { parseDbEnv } from './env.js';
```

### `parseDbEnv(source: NodeJS.ProcessEnv): DbConfig`

- **Input:** a `process.env`-shaped object (injected for testability).
- **Output:** `{ connectionString: string }`.
- **Errors:** throws `Error('DATABASE_URL is required')` if missing or empty.
- **Pure** — no filesystem or network access; no side effects.

### `createDb(config: DbConfig): DbClient`

- **Input:** `{ connectionString: string }`.
- **Output:** `{ db: NodePgDatabase<typeof schema>, pool: Pool }`.
- **Behavior:** constructs a `pg.Pool` with `{ connectionString }`, wraps it via `drizzle(pool, { schema })`, returns both so callers can close the pool.
- **Testability:** `pg` and `drizzle-orm/node-postgres` are mocked in unit tests.

### `runMigrations(db: NodePgDatabase, migrationsFolder: string): Promise<void>`

- Thin wrapper over `drizzle-orm/node-postgres/migrator`'s `migrate` function.
- **Testability:** `migrate` is mocked; test asserts it is invoked with the right arguments.

### `apps/api/src/config/env.ts` — `parseApiEnv(source)`

- Returns `{ port: number, database: DbConfig }`.
- `PORT` defaults to `3002` if unset. Throws if `PORT` is set but not a valid positive integer.
- Delegates `DATABASE_URL` parsing to `parseDbEnv` from `@repo/db`.

### `apps/api/src/db.ts`

- Reads `process.env` via `parseApiEnv`, calls `createDb`, exports `{ db, pool }` as a module-level singleton.
- Unit test mocks `@repo/db`'s `createDb` and asserts it receives the parsed env.

## Drizzle Kit configuration

```ts
// packages/db/drizzle.config.ts
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './migrations',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
  migrations: { prefix: 'timestamp' },
});
```

If `DATABASE_URL` is missing at CLI time Drizzle Kit will surface a connection error — that's acceptable for a CLI tool (no silent success).

## Scripts

`packages/db/package.json`:

```jsonc
{
  "scripts": {
    "lint": "eslint --max-warnings 0",
    "check-types": "tsc --noEmit",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "db:generate": "drizzle-kit generate --name",
    "db:migrate": "tsx src/bin/migrate.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

Usage:

```sh
yarn workspace @repo/db db:generate add_users_table
# produces migrations/1713876543210_add_users_table.sql
yarn workspace @repo/db db:migrate
```

`db:generate` requires a `--name` argument — Drizzle Kit will fail if omitted, enforcing the "meaningful name" requirement at the tool level.

`apps/api/package.json` changes:

```jsonc
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "tsx src/server.ts",        // changed — was `node dist/server.js`
    "lint": "eslint --max-warnings 0",
    "check-types": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Module-load side effects

`apps/api/src/db.ts` creates its pool at module-load time, so importing it from a test without mocking would open a real connection. `app.ts` does **not** import `db.ts` yet (no DB-touching routes exist). Tests that exercise `db.ts` stub `@repo/db`'s `createDb` via `jest.mock` before the first `require`, and set `process.env` fixtures through `jest.resetModules()` + re-import.

## Docker / local Postgres

Folder: `/home/ronyv/Develop/Projects/docker-images/smartodo-ce/postgres/`

**`docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:latest
    container_name: smartodo-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: smartodo
      POSTGRES_PASSWORD: smartodo_dev
      POSTGRES_DB: smartodo
    ports:
      - "5432:5432"
    volumes:
      - ./data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U smartodo -d smartodo"]
      interval: 5s
      timeout: 5s
      retries: 5
```

**`README.md`** — documents:

- `docker compose up -d` to start, `docker compose down` to stop, `docker compose down -v` to wipe volumes.
- Connection string: `postgresql://smartodo:smartodo_dev@localhost:5432/smartodo`.
- Data persists in `./data/` (gitignored).

**`.gitignore`** — `data/`.

Connection string copied into `apps/api/.env` and `packages/db/.env` (both gitignored; their `.env.example` siblings are committed with the same value).

## Testing strategy

All coverage targets are 100% (branches / functions / lines / statements) in both `packages/db` and `apps/api`.

| File | Strategy | Coverage |
| ---- | -------- | -------- |
| `packages/db/src/env.ts` | Pure — test valid URL, missing var, empty string | Included |
| `packages/db/src/schema.ts` | Assert the exported `schema` object shape | Included |
| `packages/db/src/client.ts` | `jest.mock('pg')` + `jest.mock('drizzle-orm/node-postgres')` — assert wiring | Included |
| `packages/db/src/migrate.ts` | `jest.mock('drizzle-orm/node-postgres/migrator')` — assert migrator called with `(db, { migrationsFolder })` | Included |
| `packages/db/src/bin/migrate.ts` | CLI bootstrap — excluded | `!src/bin/**` |
| `packages/db/drizzle.config.ts` | CLI-only config — excluded | Not in `collectCoverageFrom` |
| `packages/db/src/index.ts` | Barrel — tested transitively via other imports | Included |
| `apps/api/src/config/env.ts` | Pure — valid / missing / invalid `PORT` and `DATABASE_URL` | Included |
| `apps/api/src/db.ts` | `jest.mock('@repo/db')` — assert `createDb` called with parsed env | Included |
| `apps/api/src/server.ts` | Already excluded | Unchanged |
| `apps/api/src/app.ts` | Unchanged | Unchanged |
| `apps/api/src/routes/health.ts` | Unchanged | Unchanged |

`jest.config.ts` in `packages/db` mirrors the existing `apps/api` config (ts-jest + ESM extension mapper + 100% threshold) and excludes `src/bin/**`.

## Documentation updates

- **Root `CLAUDE.md`** — append a `packages/db` row to the Layout table and a short "Local database" section pointing at the Docker folder and the `db:generate` / `db:migrate` flow.
- **`apps/api/CLAUDE.md`** — new "Database" section: how to copy `.env.example`, that `db` is imported from `./db.js`, migration commands live in `@repo/db`.
- **New `packages/db/CLAUDE.md`** — purpose, public exports, `db:generate`/`db:migrate`/`db:push`/`db:studio`, convention that migration names must be descriptive and the prefix is millisecond timestamp.
- **Auto-memory** — a new project memory at `/home/ronyv/.claude/projects/-home-ronyv-Develop-Projects-smartodo-ce/memory/local_postgres_docker.md` recording the out-of-repo Docker-compose path (not derivable from the code).

## Verification

Before claiming complete, run:

```sh
npx turbo run lint check-types test --filter=@repo/db --filter=@repo/api
```

All three tasks must pass with zero warnings and 100% coverage on both workspaces. If any fails, fix root cause and re-run — do not bypass (`--no-verify`, disabling rules, excluding files from coverage) without a documented reason.

## Risks and mitigations

| Risk | Mitigation |
| ---- | ---------- |
| `@repo/db` source-only exports break `node dist/server.js` for `apps/api` | `apps/api`'s `start` script switches to `tsx src/server.ts` so TS sources from workspace packages are loaded directly at runtime. `build` remains as `tsc` for type-check-with-emit, but the emitted `dist/` is no longer the run target. |
| Empty schema makes `schema.ts` hard to cover | `export const schema = {} as const` is one statement — trivially covered by importing and asserting keys length. |
| `drizzle-kit` CLI cannot load ESM `drizzle.config.ts` | `drizzle-kit` v0.29+ supports ESM configs via its bundled loader. Pin to a supported version in `devDependencies`. |
| `dotenv` side-effect import masks missing vars in tests | Tests inject `process.env`-shaped objects directly into `parseDbEnv` / `parseApiEnv`; they never rely on real `.env` files. |
