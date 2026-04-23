# @repo/db — shared Drizzle ORM package

Owns the Postgres schema, migrations, and client factory for any service in
this repo that talks to the database.

## Layout

```
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
```

## Public API

```ts
import { schema, createDb, runMigrations, parseDbEnv } from '@repo/db';
```

## Conventions

- **No build step** — consumers import `.ts` directly via the `exports` map.
  `apps/api` therefore runs via `tsx` in both `dev` and `start`.
- Relative imports inside the package must use the `.js` suffix (ESM).
- Schema lives in `src/schema.ts`. When it changes, generate a migration
  with a **meaningful** name:

  ```sh
  yarn workspace @repo/db db:generate add_users_table
  ```

  Drizzle Kit is configured with `prefix: 'timestamp'`, so filenames are
  `<ms-unix-epoch>_<name>.sql` — safe for parallel branches.

- Apply migrations explicitly (never auto-apply at service boot):

  ```sh
  yarn workspace @repo/db db:migrate
  ```

- `db:push` and `db:studio` exist for local exploration but are NOT the
  checked-in workflow.

## Testing

Jest is configured with 100% coverage across statements / branches /
functions / lines. `src/bin/**` is the only path excluded from coverage
(bootstrap entry).

## Before completing a task

```sh
npx turbo run lint check-types test --filter=@repo/db
```
