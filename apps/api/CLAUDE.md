# @repo/api — Fastify REST API

Listens on `http://0.0.0.0:3002`. Pure backend — no React, no DOM.

## Layout

```
src/
  server.ts        # entrypoint: buildApp() + listen()
  app.ts           # buildApp() — registers plugins/routes
  routes/          # one file per route group; exports a FastifyPluginAsync
  __tests__/       # Jest tests — import buildApp() and use app.inject()
```

## Conventions

- **ESM only** (`"type": "module"`). Relative imports must include `.js` extension: `import { healthRoutes } from './routes/health.js';` — this is required because `tsc` outputs ESM and Node resolves the compiled paths.
- Add a new route: create `src/routes/<name>.ts` exporting `async function <name>Routes(fastify: FastifyInstance): Promise<void>`, then `app.register(...)` in `app.ts`.
- Test new routes with `app.inject({ method, url, payload })` — do not spin up a real listener.
- Logger is off by default in `buildApp` (`{ logger: false }`). Flip on only for local debugging, never in tests.

## Commands

```sh
yarn workspace @repo/api dev            # tsx watch
yarn workspace @repo/api build          # tsc → dist/
yarn workspace @repo/api start          # run compiled dist/server.js
yarn workspace @repo/api test           # jest
yarn workspace @repo/api check-types    # tsc --noEmit
yarn workspace @repo/api lint
```

## Database

- Local Postgres runs via Docker; copy `.env.example` → `.env` to configure `PORT` and `DATABASE_URL`.
- `src/db.ts` exports a module-level `{ db, pool }` built via `@repo/db`'s
  `createDb`. Import it only from modules that actually need the database —
  importing it anywhere opens a pg pool at module-load time.
- Migrations are owned by `@repo/db`, not here:
  `yarn workspace @repo/db db:generate <name>` then
  `yarn workspace @repo/db db:migrate`.

## Before completing a task

`npx turbo run lint check-types test --filter=@repo/api`
