# Drizzle ORM Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire a shared `@repo/db` Drizzle ORM workspace into the monorepo, connect `apps/api` to a local Dockerised Postgres via `.env`, and establish a manual migration workflow with millisecond-timestamp-prefixed migration files. Zero TS/ESLint errors, 100% Jest coverage on both `@repo/db` and `@repo/api`.

**Architecture:** New source-only `packages/db` workspace (no build step, exports map → `./src/*.ts`, matching `@repo/ui`). `@repo/api` consumes it via `tsx` at runtime — `start` switches from `node dist/server.js` to `tsx src/server.ts`. Drizzle Kit config uses `prefix: 'timestamp'` for millisecond UNIX-epoch migration filenames. Local Postgres runs via Docker Compose in `/home/ronyv/Develop/Projects/docker-images/smartodo-ce/postgres/` (outside the repo).

**Tech Stack:** drizzle-orm 0.45.2, drizzle-kit 0.31.10, pg 8.20.0, @types/pg 8.20.0, dotenv 17.4.2, postgres:latest (Docker), Fastify 5 (existing), Jest 29 + ts-jest (existing), TypeScript 5.9 (existing), Yarn 4 workspaces (existing).

---

## Task 1: Set up local Postgres via Docker (outside the repo)

**Files:**
- Create: `/home/ronyv/Develop/Projects/docker-images/smartodo-ce/postgres/docker-compose.yml`
- Create: `/home/ronyv/Develop/Projects/docker-images/smartodo-ce/postgres/README.md`
- Create: `/home/ronyv/Develop/Projects/docker-images/smartodo-ce/postgres/.gitignore`

- [ ] **Step 1: Create the directory tree**

```bash
mkdir -p /home/ronyv/Develop/Projects/docker-images/smartodo-ce/postgres
```

- [ ] **Step 2: Write `docker-compose.yml`**

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
      - '5432:5432'
    volumes:
      - ./data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U smartodo -d smartodo']
      interval: 5s
      timeout: 5s
      retries: 5
```

- [ ] **Step 3: Write `.gitignore`**

```
data/
```

- [ ] **Step 4: Write `README.md`**

```markdown
# smartodo-ce local Postgres

Local development database for the `smartodo-ce` monorepo. Lives outside the
repo so the repo stays clean of infra state.

## Start

    docker compose up -d

## Stop

    docker compose down

## Wipe volumes (destroys data)

    docker compose down -v

## Connection string

    postgresql://smartodo:smartodo_dev@localhost:5432/smartodo

Copy this into `apps/api/.env` (as `DATABASE_URL`) and
`packages/db/.env` (as `DATABASE_URL`) in the monorepo.
```

- [ ] **Step 5: Start the container and verify it is healthy**

```bash
cd /home/ronyv/Develop/Projects/docker-images/smartodo-ce/postgres && docker compose up -d
```

Then wait for healthy status:

```bash
docker inspect --format='{{.State.Health.Status}}' smartodo-postgres
```

Expected: `healthy` (may take 10–15s on first boot — re-run if `starting`).

- [ ] **Step 6: (no commit — this folder is outside the repo)**

The Docker folder is not part of the monorepo. There is no `git add` for this task.

---

## Task 2: Create `packages/db` workspace skeleton

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/eslint.config.js`
- Create: `packages/db/jest.config.ts`
- Create: `packages/db/.env.example`
- Create: `packages/db/.env` (gitignored)
- Create: `packages/db/.gitignore`
- Create: `packages/db/migrations/.gitkeep`

- [ ] **Step 1: Create `packages/db/package.json`**

```json
{
  "name": "@repo/db",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "lint": "eslint --max-warnings 0",
    "check-types": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:generate": "drizzle-kit generate --name",
    "db:migrate": "tsx src/bin/migrate.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "drizzle-orm": "0.45.2",
    "pg": "8.20.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.15.3",
    "@types/pg": "8.20.0",
    "dotenv": "17.4.2",
    "drizzle-kit": "0.31.10",
    "eslint": "^9.39.1",
    "jest": "^29.7.0",
    "ts-jest": "^29.3.2",
    "tsx": "^4.19.4",
    "typescript": "5.9.2"
  }
}
```

- [ ] **Step 2: Create `packages/db/tsconfig.json`**

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "dist"
  },
  "include": ["src", "drizzle.config.ts"],
  "exclude": ["node_modules", "dist", "coverage"]
}
```

- [ ] **Step 3: Create `packages/db/eslint.config.js`**

```js
import { config } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: ['dist/**', 'coverage/**', 'migrations/**'],
  },
];
```

- [ ] **Step 4: Create `packages/db/jest.config.ts`**

```ts
import type { Config } from 'jest';

const config: Config = {
  displayName: 'db',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'Node10',
        },
      },
    ],
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/bin/**'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

export default config;
```

- [ ] **Step 5: Create `packages/db/.env.example`**

```
DATABASE_URL=postgresql://smartodo:smartodo_dev@localhost:5432/smartodo
```

- [ ] **Step 6: Create `packages/db/.env`** (same content — used by `drizzle-kit` and `db:migrate`)

```
DATABASE_URL=postgresql://smartodo:smartodo_dev@localhost:5432/smartodo
```

- [ ] **Step 7: Create `packages/db/.gitignore`**

```
node_modules/
dist/
coverage/
.env
```

- [ ] **Step 8: Create `packages/db/migrations/.gitkeep`** (empty file — ensures the folder is tracked before Drizzle Kit writes to it)

```bash
mkdir -p packages/db/migrations && : > packages/db/migrations/.gitkeep
```

- [ ] **Step 9: Install workspace deps**

```bash
yarn install
```

Expected: yarn resolves the new `@repo/db` workspace, installs `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`, `dotenv`, updates `yarn.lock`.

- [ ] **Step 10: Verify the workspace is registered**

```bash
yarn workspaces list
```

Expected: output includes `@repo/db` pointing to `packages/db`.

- [ ] **Step 11: Commit**

```bash
git add packages/db yarn.lock
git commit -m "feat(db): scaffold @repo/db workspace with drizzle-orm dependencies"
```

---

## Task 3: Implement `packages/db/src/env.ts` (TDD)

**Files:**
- Create: `packages/db/src/env.ts`
- Create: `packages/db/src/__tests__/env.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/db/src/__tests__/env.test.ts`:

```ts
import { parseDbEnv } from '../env.js';

describe('parseDbEnv', () => {
  it('returns connectionString when DATABASE_URL is set', () => {
    expect(parseDbEnv({ DATABASE_URL: 'postgresql://u:p@h:5432/d' })).toEqual({
      connectionString: 'postgresql://u:p@h:5432/d',
    });
  });

  it('throws when DATABASE_URL is missing', () => {
    expect(() => parseDbEnv({})).toThrow('DATABASE_URL is required');
  });

  it('throws when DATABASE_URL is an empty string', () => {
    expect(() => parseDbEnv({ DATABASE_URL: '' })).toThrow(
      'DATABASE_URL is required'
    );
  });

  it('throws when DATABASE_URL is whitespace only', () => {
    expect(() => parseDbEnv({ DATABASE_URL: '   ' })).toThrow(
      'DATABASE_URL is required'
    );
  });
});
```

- [ ] **Step 2: Run the test — verify it fails**

```bash
yarn workspace @repo/db test --testPathPattern env
```

Expected: FAIL with `Cannot find module '../env.js'` (module does not exist yet).

- [ ] **Step 3: Write the implementation**

Create `packages/db/src/env.ts`:

```ts
export interface DbConfig {
  connectionString: string;
}

export function parseDbEnv(source: NodeJS.ProcessEnv): DbConfig {
  const value = source.DATABASE_URL;
  if (value === undefined || value.trim() === '') {
    throw new Error('DATABASE_URL is required');
  }
  return { connectionString: value };
}
```

- [ ] **Step 4: Run the test — verify it passes**

```bash
yarn workspace @repo/db test --testPathPattern env
```

Expected: PASS, all 4 test cases green.

- [ ] **Step 5: Commit**

```bash
git add packages/db/src/env.ts packages/db/src/__tests__/env.test.ts
git commit -m "feat(db): add parseDbEnv with required DATABASE_URL validation"
```

---

## Task 4: Implement `packages/db/src/schema.ts` (TDD)

**Files:**
- Create: `packages/db/src/schema.ts`
- Create: `packages/db/src/__tests__/schema.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/db/src/__tests__/schema.test.ts`:

```ts
import { schema } from '../schema.js';

describe('schema', () => {
  it('is an object', () => {
    expect(typeof schema).toBe('object');
  });

  it('has no keys (starter schema is empty)', () => {
    expect(Object.keys(schema)).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run the test — verify it fails**

```bash
yarn workspace @repo/db test --testPathPattern schema
```

Expected: FAIL with `Cannot find module '../schema.js'`.

- [ ] **Step 3: Write the implementation**

Create `packages/db/src/schema.ts`:

```ts
export const schema = {} as const;
export type Schema = typeof schema;
```

- [ ] **Step 4: Run the test — verify it passes**

```bash
yarn workspace @repo/db test --testPathPattern schema
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/db/src/schema.ts packages/db/src/__tests__/schema.test.ts
git commit -m "feat(db): add empty starter schema"
```

---

## Task 5: Implement `packages/db/src/client.ts` (TDD)

**Files:**
- Create: `packages/db/src/client.ts`
- Create: `packages/db/src/__tests__/client.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/db/src/__tests__/client.test.ts`:

```ts
const poolMock = jest.fn();
const drizzleMock = jest.fn();

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation((cfg) => {
    poolMock(cfg);
    return { _tag: 'pool', _cfg: cfg };
  }),
}));

jest.mock('drizzle-orm/node-postgres', () => ({
  drizzle: (...args: unknown[]) => {
    drizzleMock(...args);
    return { _tag: 'db' };
  },
}));

import { createDb } from '../client.js';
import { schema } from '../schema.js';

describe('createDb', () => {
  beforeEach(() => {
    poolMock.mockClear();
    drizzleMock.mockClear();
  });

  it('constructs a Pool with the provided connection string', () => {
    createDb({ connectionString: 'postgresql://x/y' });
    expect(poolMock).toHaveBeenCalledWith({
      connectionString: 'postgresql://x/y',
    });
  });

  it('wraps the pool with drizzle and the package schema', () => {
    const { pool, db } = createDb({ connectionString: 'postgresql://x/y' });
    expect(drizzleMock).toHaveBeenCalledWith(pool, { schema });
    expect(db).toEqual({ _tag: 'db' });
  });

  it('returns the Pool instance alongside the db', () => {
    const { pool } = createDb({ connectionString: 'postgresql://a/b' });
    expect(pool).toEqual({ _tag: 'pool', _cfg: { connectionString: 'postgresql://a/b' } });
  });
});
```

- [ ] **Step 2: Run the test — verify it fails**

```bash
yarn workspace @repo/db test --testPathPattern client
```

Expected: FAIL with `Cannot find module '../client.js'`.

- [ ] **Step 3: Write the implementation**

Create `packages/db/src/client.ts`:

```ts
import { Pool } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema, type Schema } from './schema.js';

export interface DbConfig {
  connectionString: string;
}

export interface DbClient {
  db: NodePgDatabase<Schema>;
  pool: Pool;
}

export function createDb(config: DbConfig): DbClient {
  const pool = new Pool({ connectionString: config.connectionString });
  const db = drizzle(pool, { schema });
  return { db, pool };
}
```

- [ ] **Step 4: Run the test — verify it passes**

```bash
yarn workspace @repo/db test --testPathPattern client
```

Expected: PASS, all 3 test cases green.

- [ ] **Step 5: Commit**

```bash
git add packages/db/src/client.ts packages/db/src/__tests__/client.test.ts
git commit -m "feat(db): add createDb factory wiring pg.Pool + drizzle"
```

---

## Task 6: Implement `packages/db/src/migrate.ts` (TDD)

**Files:**
- Create: `packages/db/src/migrate.ts`
- Create: `packages/db/src/__tests__/migrate.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/db/src/__tests__/migrate.test.ts`:

```ts
const migrateFn = jest.fn();

jest.mock('drizzle-orm/node-postgres/migrator', () => ({
  migrate: (...args: unknown[]) => migrateFn(...args),
}));

import { runMigrations } from '../migrate.js';

describe('runMigrations', () => {
  beforeEach(() => {
    migrateFn.mockReset();
    migrateFn.mockResolvedValue(undefined);
  });

  it('invokes the drizzle migrator with db and migrationsFolder', async () => {
    const db = { _tag: 'db' } as never;
    await runMigrations(db, './migrations');
    expect(migrateFn).toHaveBeenCalledWith(db, { migrationsFolder: './migrations' });
  });

  it('resolves when the migrator resolves', async () => {
    const db = { _tag: 'db' } as never;
    await expect(runMigrations(db, './migrations')).resolves.toBeUndefined();
  });

  it('rejects when the migrator throws', async () => {
    migrateFn.mockRejectedValueOnce(new Error('boom'));
    const db = { _tag: 'db' } as never;
    await expect(runMigrations(db, './migrations')).rejects.toThrow('boom');
  });
});
```

- [ ] **Step 2: Run the test — verify it fails**

```bash
yarn workspace @repo/db test --testPathPattern migrate
```

Expected: FAIL with `Cannot find module '../migrate.js'`.

- [ ] **Step 3: Write the implementation**

Create `packages/db/src/migrate.ts`:

```ts
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export async function runMigrations<TSchema extends Record<string, unknown>>(
  db: NodePgDatabase<TSchema>,
  migrationsFolder: string
): Promise<void> {
  await migrate(db, { migrationsFolder });
}
```

- [ ] **Step 4: Run the test — verify it passes**

```bash
yarn workspace @repo/db test --testPathPattern migrate
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/db/src/migrate.ts packages/db/src/__tests__/migrate.test.ts
git commit -m "feat(db): add runMigrations wrapper over drizzle migrator"
```

---

## Task 7: Barrel, CLI entry, and Drizzle Kit config

**Files:**
- Create: `packages/db/src/index.ts`
- Create: `packages/db/src/bin/migrate.ts`
- Create: `packages/db/drizzle.config.ts`
- Create: `packages/db/src/__tests__/index.test.ts`

- [ ] **Step 1: Write the failing test for the barrel**

Create `packages/db/src/__tests__/index.test.ts`:

```ts
import * as pkg from '../index.js';

describe('@repo/db public API', () => {
  it('exports schema', () => {
    expect(pkg.schema).toEqual({});
  });

  it('exports createDb', () => {
    expect(typeof pkg.createDb).toBe('function');
  });

  it('exports runMigrations', () => {
    expect(typeof pkg.runMigrations).toBe('function');
  });

  it('exports parseDbEnv', () => {
    expect(typeof pkg.parseDbEnv).toBe('function');
  });
});
```

- [ ] **Step 2: Run the test — verify it fails**

```bash
yarn workspace @repo/db test --testPathPattern index
```

Expected: FAIL with `Cannot find module '../index.js'`.

- [ ] **Step 3: Write the barrel**

Create `packages/db/src/index.ts`:

```ts
export { schema, type Schema } from './schema.js';
export { createDb, type DbConfig, type DbClient } from './client.js';
export { runMigrations } from './migrate.js';
export { parseDbEnv } from './env.js';
```

- [ ] **Step 4: Run the test — verify it passes**

```bash
yarn workspace @repo/db test --testPathPattern index
```

Expected: PASS.

- [ ] **Step 5: Write the migration CLI entry (excluded from coverage)**

Create `packages/db/src/bin/migrate.ts`:

```ts
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDbEnv } from '../env.js';
import { createDb } from '../client.js';
import { runMigrations } from '../migrate.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(here, '../../migrations');

async function main(): Promise<void> {
  const config = parseDbEnv(process.env);
  const { db, pool } = createDb(config);
  try {
    await runMigrations(db, migrationsFolder);
    console.log('Migrations complete');
  } finally {
    await pool.end();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 6: Write the Drizzle Kit config**

Create `packages/db/drizzle.config.ts`:

```ts
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

- [ ] **Step 7: Run the full `@repo/db` test suite with coverage**

```bash
yarn workspace @repo/db test:coverage
```

Expected: PASS, 100% coverage across statements / branches / functions / lines.

- [ ] **Step 8: Commit**

```bash
git add packages/db/src/index.ts packages/db/src/__tests__/index.test.ts packages/db/src/bin/migrate.ts packages/db/drizzle.config.ts
git commit -m "feat(db): add public barrel, migrate CLI entry, and drizzle-kit config"
```

---

## Task 8: `@repo/db` lint + check-types gate

- [ ] **Step 1: Run check-types**

```bash
yarn workspace @repo/db check-types
```

Expected: no output, exit 0.

If errors appear (e.g. missing `@types/node`, wrong import paths): read the error, fix the root cause (typically a missing `.js` suffix on a relative import or a missing type import), re-run. Do NOT suppress with `@ts-ignore`.

- [ ] **Step 2: Run lint**

```bash
yarn workspace @repo/db lint
```

Expected: no output, exit 0.

If lint fails: read the rule, fix the code. Do NOT add eslint-disable comments unless the rule is demonstrably wrong for the file (none of the rules in `@repo/eslint-config/base` should trigger false positives here). Re-run until clean.

- [ ] **Step 3: (no commit unless fixes were required)**

If you had to make fixes in Steps 1 or 2:

```bash
git add packages/db
git commit -m "fix(db): satisfy check-types and lint"
```

---

## Task 9: Prepare `apps/api` for `@repo/db` (env files, deps, scripts, jest config)

**Files:**
- Modify: `apps/api/package.json`
- Modify: `apps/api/jest.config.ts`
- Create: `apps/api/.env.example`
- Create: `apps/api/.env` (gitignored)
- Create: `apps/api/.gitignore`

- [ ] **Step 1: Create `apps/api/.env.example`**

```
PORT=3002
DATABASE_URL=postgresql://smartodo:smartodo_dev@localhost:5432/smartodo
```

- [ ] **Step 2: Create `apps/api/.env`** (same content — gitignored)

```
PORT=3002
DATABASE_URL=postgresql://smartodo:smartodo_dev@localhost:5432/smartodo
```

- [ ] **Step 3: Create `apps/api/.gitignore`**

```
dist/
coverage/
.env
```

- [ ] **Step 4: Update `apps/api/package.json` — add deps and switch `start`**

Replace the whole file content with:

```json
{
  "name": "@repo/api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "tsx src/server.ts",
    "lint": "eslint --max-warnings 0",
    "check-types": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "@repo/db": "*",
    "dotenv": "17.4.2",
    "fastify": "^5.3.2"
  },
  "devDependencies": {
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.15.3",
    "eslint": "^9.39.1",
    "jest": "^29.7.0",
    "ts-jest": "^29.3.2",
    "tsx": "^4.19.4",
    "typescript": "5.9.2"
  }
}
```

- [ ] **Step 5: Update `apps/api/jest.config.ts` — map `@repo/db` to its source**

Replace the whole file content with:

```ts
import type { Config } from 'jest';

const config: Config = {
  displayName: 'api',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@repo/db$': '<rootDir>/../../packages/db/src/index.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'Node10',
        },
      },
    ],
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

export default config;
```

- [ ] **Step 6: Install**

```bash
yarn install
```

Expected: `@repo/db` linked into `apps/api/node_modules`, `dotenv` installed, `yarn.lock` updated.

- [ ] **Step 7: Verify existing tests still pass**

```bash
yarn workspace @repo/api test
```

Expected: the existing `health.test.ts` still passes.

- [ ] **Step 8: Commit**

```bash
git add apps/api/package.json apps/api/jest.config.ts apps/api/.env.example apps/api/.gitignore yarn.lock
git commit -m "chore(api): wire @repo/db and dotenv, switch start to tsx, add env files"
```

(Note: `apps/api/.env` is gitignored and is NOT committed.)

---

## Task 10: `apps/api/src/config/env.ts` — `parseApiEnv` (TDD)

**Files:**
- Create: `apps/api/src/config/env.ts`
- Create: `apps/api/src/__tests__/env.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/__tests__/env.test.ts`:

```ts
import { parseApiEnv } from '../config/env.js';

describe('parseApiEnv', () => {
  const validDb = 'postgresql://u:p@h:5432/d';

  it('parses a complete environment', () => {
    expect(parseApiEnv({ PORT: '4000', DATABASE_URL: validDb })).toEqual({
      port: 4000,
      database: { connectionString: validDb },
    });
  });

  it('defaults PORT to 3002 when unset', () => {
    expect(parseApiEnv({ DATABASE_URL: validDb })).toEqual({
      port: 3002,
      database: { connectionString: validDb },
    });
  });

  it('throws when PORT is not a number', () => {
    expect(() =>
      parseApiEnv({ PORT: 'abc', DATABASE_URL: validDb })
    ).toThrow('PORT must be a positive integer, got: abc');
  });

  it('throws when PORT is zero', () => {
    expect(() =>
      parseApiEnv({ PORT: '0', DATABASE_URL: validDb })
    ).toThrow('PORT must be a positive integer, got: 0');
  });

  it('throws when PORT is negative', () => {
    expect(() =>
      parseApiEnv({ PORT: '-1', DATABASE_URL: validDb })
    ).toThrow('PORT must be a positive integer, got: -1');
  });

  it('throws when PORT is a non-integer number', () => {
    expect(() =>
      parseApiEnv({ PORT: '3.5', DATABASE_URL: validDb })
    ).toThrow('PORT must be a positive integer, got: 3.5');
  });

  it('propagates the DATABASE_URL error', () => {
    expect(() => parseApiEnv({ PORT: '4000' })).toThrow(
      'DATABASE_URL is required'
    );
  });
});
```

- [ ] **Step 2: Run the test — verify it fails**

```bash
yarn workspace @repo/api test --testPathPattern env
```

Expected: FAIL with `Cannot find module '../config/env.js'`.

- [ ] **Step 3: Write the implementation**

Create `apps/api/src/config/env.ts`:

```ts
import { parseDbEnv, type DbConfig } from '@repo/db';

export interface ApiConfig {
  port: number;
  database: DbConfig;
}

export function parseApiEnv(source: NodeJS.ProcessEnv): ApiConfig {
  const rawPort = source.PORT;
  let port = 3002;
  if (rawPort !== undefined) {
    const parsed = Number(rawPort);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error(`PORT must be a positive integer, got: ${rawPort}`);
    }
    port = parsed;
  }
  const database = parseDbEnv(source);
  return { port, database };
}
```

- [ ] **Step 4: Run the test — verify it passes**

```bash
yarn workspace @repo/api test --testPathPattern env
```

Expected: PASS, all 7 cases green.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/config/env.ts apps/api/src/__tests__/env.test.ts
git commit -m "feat(api): add parseApiEnv validating PORT and DATABASE_URL"
```

---

## Task 11: `apps/api/src/db.ts` singleton (TDD)

**Files:**
- Create: `apps/api/src/db.ts`
- Create: `apps/api/src/__tests__/db.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/__tests__/db.test.ts`:

```ts
const createDbMock = jest.fn();

jest.mock('@repo/db', () => {
  const actual = jest.requireActual('@repo/db');
  return {
    ...actual,
    createDb: (...args: unknown[]) => {
      createDbMock(...args);
      return { db: { _tag: 'db' }, pool: { _tag: 'pool' } };
    },
  };
});

describe('apps/api db singleton', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    createDbMock.mockClear();
    process.env = {
      ...ORIGINAL_ENV,
      PORT: '3002',
      DATABASE_URL: 'postgresql://u:p@h:5432/d',
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('calls createDb with the parsed database config', async () => {
    await import('../db.js');
    expect(createDbMock).toHaveBeenCalledWith({
      connectionString: 'postgresql://u:p@h:5432/d',
    });
  });

  it('exports db and pool from the created client', async () => {
    const mod = await import('../db.js');
    expect(mod.db).toEqual({ _tag: 'db' });
    expect(mod.pool).toEqual({ _tag: 'pool' });
  });

  it('exports the full dbClient object', async () => {
    const mod = await import('../db.js');
    expect(mod.dbClient).toEqual({
      db: { _tag: 'db' },
      pool: { _tag: 'pool' },
    });
  });
});
```

- [ ] **Step 2: Run the test — verify it fails**

```bash
yarn workspace @repo/api test --testPathPattern db
```

Expected: FAIL with `Cannot find module '../db.js'`.

- [ ] **Step 3: Write the implementation**

Create `apps/api/src/db.ts`:

```ts
import { createDb, type DbClient } from '@repo/db';
import { parseApiEnv } from './config/env.js';

const config = parseApiEnv(process.env);

export const dbClient: DbClient = createDb(config.database);
export const { db, pool } = dbClient;
```

- [ ] **Step 4: Run the test — verify it passes**

```bash
yarn workspace @repo/api test --testPathPattern db
```

Expected: PASS, all 3 cases green.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/db.ts apps/api/src/__tests__/db.test.ts
git commit -m "feat(api): add db singleton wired through @repo/db and env config"
```

---

## Task 12: Load `.env` in `apps/api/src/server.ts`

**Files:**
- Modify: `apps/api/src/server.ts:1`

- [ ] **Step 1: Add `dotenv/config` as the first import**

Replace the whole file content with:

```ts
import 'dotenv/config';
import { buildApp } from './app.js';

const app = buildApp();

app.listen({ port: 3002, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('API service listening on http://0.0.0.0:3002');
});
```

- [ ] **Step 2: Verify coverage is unaffected**

```bash
yarn workspace @repo/api test:coverage
```

Expected: PASS, 100% coverage (server.ts is already excluded by `collectCoverageFrom`).

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/server.ts
git commit -m "feat(api): load .env via dotenv at server entrypoint"
```

---

## Task 13: `apps/api` lint + check-types gate

- [ ] **Step 1: Run check-types**

```bash
yarn workspace @repo/api check-types
```

Expected: exit 0. Fix any errors at the root cause (typically a missing `.js` import suffix or a missing type import from `@repo/db`).

- [ ] **Step 2: Run lint**

```bash
yarn workspace @repo/api lint
```

Expected: exit 0. Fix any lint issues at the root cause.

- [ ] **Step 3: (commit only if fixes were needed)**

```bash
git add apps/api
git commit -m "fix(api): satisfy check-types and lint"
```

---

## Task 14: Documentation updates

**Files:**
- Modify: `CLAUDE.md` (root)
- Modify: `apps/api/CLAUDE.md`
- Create: `packages/db/CLAUDE.md`

- [ ] **Step 1: Add `packages/db` row + local-Postgres section to root `CLAUDE.md`**

In `CLAUDE.md`, within the Layout table, insert this row after the `packages/ui` row:

```markdown
| `packages/db` | Shared Drizzle ORM schema + migrations | drizzle-orm, pg, drizzle-kit | `packages/db/CLAUDE.md` |
```

Then add a new section after the Workspace commands section:

```markdown
## Local database

Postgres runs via Docker outside this repo at
`/home/ronyv/Develop/Projects/docker-images/smartodo-ce/postgres/`. Start it
with `docker compose up -d` from that folder. Connection string:
`postgresql://smartodo:smartodo_dev@localhost:5432/smartodo` — already set in
the `.env.example` files for `apps/api` and `packages/db`.

Schema + migrations live in `@repo/db`. To add a migration:

    yarn workspace @repo/db db:generate <meaningful_name>   # emits <ms-timestamp>_<name>.sql
    yarn workspace @repo/db db:migrate                      # applies pending migrations
```

- [ ] **Step 2: Add a Database section to `apps/api/CLAUDE.md`**

Append this section at the end of `apps/api/CLAUDE.md` (before the "Before completing a task" section):

```markdown
## Database

- Local Postgres runs outside the repo at
  `/home/ronyv/Develop/Projects/docker-images/smartodo-ce/postgres/`
  (`docker compose up -d` there to start).
- Copy `.env.example` → `.env` to configure `PORT` and `DATABASE_URL`.
- `src/db.ts` exports a module-level `{ db, pool }` built via `@repo/db`'s
  `createDb`. Import it only from modules that actually need the database
  (importing it anywhere opens a pool at module-load time).
- Migrations are owned by `@repo/db`, not here:
  `yarn workspace @repo/db db:generate <name>` then
  `yarn workspace @repo/db db:migrate`.
```

- [ ] **Step 3: Create `packages/db/CLAUDE.md`**

```markdown
# @repo/db — shared Drizzle ORM package

Owns the Postgres schema, migrations, and client factory for any service in
this repo that talks to the database.

## Layout

    src/
      index.ts     # public barrel
      schema.ts    # Drizzle schema (currently empty)
      env.ts       # parseDbEnv(process.env) → { connectionString }
      client.ts    # createDb(config) → { db, pool }
      migrate.ts   # runMigrations(db, folder)
      bin/
        migrate.ts # CLI entry — loads .env and runs migrations
    drizzle.config.ts
    migrations/    # drizzle-kit output

## Public API

    import { schema, createDb, runMigrations, parseDbEnv } from '@repo/db';

## Conventions

- No build step — consumers import `.ts` directly via the `exports` map.
  `apps/api` therefore runs via `tsx` in both `dev` and `start`.
- Relative imports inside the package must use the `.js` suffix (ESM).
- Schema lives in `src/schema.ts`. When it changes, generate a migration
  with a meaningful name:

      yarn workspace @repo/db db:generate add_users_table

  Drizzle Kit is configured with `prefix: 'timestamp'`, so filenames are
  `<ms-unix-epoch>_<name>.sql` — safe for parallel branches.

- Apply migrations explicitly (never auto-apply at service boot):

      yarn workspace @repo/db db:migrate

- `db:push` and `db:studio` are available for local exploration but are
  NOT the checked-in workflow.

## Testing

Jest is configured with 100% coverage across statements / branches /
functions / lines. `src/bin/**` is the only path excluded from coverage
(bootstrap entry).

## Before completing a task

    npx turbo run lint check-types test --filter=@repo/db
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md apps/api/CLAUDE.md packages/db/CLAUDE.md
git commit -m "docs: document @repo/db, local Postgres, and api database wiring"
```

---

## Task 15: Add project memory for Docker-compose location

**Files:**
- Create: `/home/ronyv/.claude/projects/-home-ronyv-Develop-Projects-smartodo-ce/memory/local_postgres_docker.md`
- Modify: `/home/ronyv/.claude/projects/-home-ronyv-Develop-Projects-smartodo-ce/memory/MEMORY.md`

- [ ] **Step 1: Write the memory file**

Create `/home/ronyv/.claude/projects/-home-ronyv-Develop-Projects-smartodo-ce/memory/local_postgres_docker.md`:

```markdown
---
name: Local Postgres docker-compose lives outside the repo
description: Location of the local-dev Postgres Docker compose for smartodo-ce — not derivable from repo contents
type: project
---

Local development Postgres for this monorepo runs via Docker Compose at
`/home/ronyv/Develop/Projects/docker-images/smartodo-ce/postgres/`. Control it with
`docker compose up -d` / `docker compose down` from that folder. Data persists
in the (gitignored) `./data/` subfolder.

**Why:** The user chose to keep infra state out of the repo. The path is not
visible from any file inside the repo, so future sessions need this pointer.

**How to apply:** When the user mentions running the DB, connecting to it, or
bringing it up/down, suggest commands rooted at that folder. The connection
string used by `apps/api/.env` and `packages/db/.env` is
`postgresql://smartodo:smartodo_dev@localhost:5432/smartodo`.
```

- [ ] **Step 2: Append a pointer to `MEMORY.md`**

Edit `/home/ronyv/.claude/projects/-home-ronyv-Develop-Projects-smartodo-ce/memory/MEMORY.md`:

```markdown
- [Local Postgres docker-compose lives outside the repo](local_postgres_docker.md) — smartodo-ce local DB lives at `~/Develop/Projects/docker-images/smartodo-ce/postgres/`
```

(Append under any existing entries.)

- [ ] **Step 3: (no commit — memory is outside the repo)**

Memory files are not part of the repo.

---

## Task 16: Final verification loop (zero errors required)

Run the full filtered suite and iterate until clean. This is the explicit "loop until fixed" requirement.

- [ ] **Step 1: Run the full filtered gate**

```bash
npx turbo run lint check-types test --filter=@repo/db --filter=@repo/api
```

Expected: all three tasks PASS across both workspaces, with 100% coverage on each.

- [ ] **Step 2: If any task fails, iterate**

For each failure:

1. Read the actual error (not just the exit code).
2. Identify the root cause. Common cases:
   - Missing `.js` suffix on a relative import → add it.
   - Type mismatch between `@repo/db` and `@repo/api` → fix the type at definition.
   - Jest moduleNameMapper doesn't resolve `@repo/db` → re-check the `rootDir` path.
   - Coverage below 100% → identify the uncovered branch, add a test; do NOT widen `collectCoverageFrom` exclusions.
   - Lint error → fix the code; do NOT add `eslint-disable`.
3. Commit the fix: `git commit -m "fix(<scope>): <one-line>"`.
4. Re-run Step 1.

- [ ] **Step 3: Smoke-test the migration CLI end-to-end**

Confirm Docker Postgres is up (`docker ps | grep smartodo-postgres`). Then:

```bash
yarn workspace @repo/db db:migrate
```

Expected: `Migrations complete` (no migration files exist yet, so the migrator is a no-op but must connect successfully and report success).

If it fails to connect: verify `packages/db/.env` has the correct `DATABASE_URL` and the container is healthy.

- [ ] **Step 4: Smoke-test the API boots with dotenv**

```bash
yarn workspace @repo/api start &
API_PID=$!
sleep 2
curl -sf http://localhost:3002/health
kill $API_PID 2>/dev/null || true
```

Expected: `{"status":"ok"}`.

- [ ] **Step 5: Final commit if any fixes were applied in Step 2**

(If the loop produced commits, Step 5 is already satisfied. If not, there is nothing to commit.)

- [ ] **Step 6: Announce completion**

Only once:

1. `yarn workspace @repo/db test:coverage` reports 100/100/100/100.
2. `yarn workspace @repo/api test:coverage` reports 100/100/100/100.
3. `npx turbo run lint check-types test --filter=@repo/db --filter=@repo/api` exits 0.
4. The API boots and `/health` returns `{status:"ok"}`.
5. `yarn workspace @repo/db db:migrate` connects and reports success.

…is the work complete.
