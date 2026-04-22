# smartodo-ce

Turborepo monorepo (Yarn 4 workspaces, Node ≥18, TypeScript 5.9). Superpowers plugin is active — use the `Skill` tool, don't `Read` skill files.

## Cost-aware collaboration

**This root file loads every turn. Per-app files only load when you read/edit files in their subtree.** When the user asks you to work on a specific app, `cd` into it or read files inside it *first* — that pulls the nested `CLAUDE.md` (and nothing else) into context. Don't pre-load multiple apps.

Default to Sonnet 4.6 (`/model sonnet`) unless the task is architectural or cross-cutting.

## Layout

| Path | What | Stack | Nested CLAUDE.md |
| ---- | ---- | ----- | ---------------- |
| `apps/api` | Fastify REST API (port 3002) | Fastify 5, ESM, tsx, Jest | `apps/api/CLAUDE.md` |
| `apps/web` | Next.js dashboard (port 3000) | Next 15, React 19, Tailwind v4, consumes `@repo/ui` | `apps/web/CLAUDE.md` |
| `apps/mobile` | Expo app (iOS/Android/web) | Expo 54, expo-router, Gluestack UI, NativeWind, Detox | `apps/mobile/CLAUDE.md` |
| `apps/docs` | Docs site (port 3001) | Next 15, Fumadocs MDX | `apps/docs/CLAUDE.md` |
| `packages/ui` | Shared React dashboard components | React 19, Tailwind, ApexCharts, FullCalendar | `packages/ui/CLAUDE.md` |
| `packages/eslint-config` | Shared ESLint config | — | — |
| `packages/typescript-config` | Shared tsconfigs | — | — |

`@repo/ui` is consumed by `apps/web` only. `apps/mobile` has its own local UI (`components/ui/**` using Gluestack). Do not import `@repo/ui` into mobile — it's web-only.

## Workspace commands

Run from repo root. Prefer filtered tasks — full-repo runs rebuild unrelated workspaces and waste tokens.

```sh
# Filtered (preferred)
yarn workspace <name> <script>           # name = api, web, mobile, docs, @repo/ui
npx turbo run <task> --filter=<name>     # task = build, lint, check-types, test

# Whole repo (only for sanity passes)
yarn build | yarn lint | yarn check-types | yarn test | yarn format
```

Workspace names: `@repo/api`, `web`, `mobile`, `docs`, `@repo/ui`.

## Superpowers skills

The superpowers plugin is active. Claude **automatically invokes relevant skills** before responding — you don't need to ask. Below are the key skills for this codebase. If you want to be explicit, use `/skill <name>`.

| Scenario | Skill | Use when |
| -------- | ----- | -------- |
| **Multi-step feature work** | `superpowers:writing-plans` | "Add a new dashboard page" or "Refactor the auth flow" — Claude plans before coding |
| **Bug fix or error** | `superpowers:systematic-debugging` | "This test is failing" or "I got this error in the API" — structured investigation before fixes |
| **Test-driven work** | `superpowers:test-driven-development` | "Add X feature" — Claude writes tests first, then implementation |
| **Code review / feedback** | `superpowers:receiving-code-review` | "Here's feedback on my PR…" — Claude rigorously verifies before implementing |
| **Before merge** | `superpowers:verification-before-completion` | "Is my feature done?" — Claude runs verification before claiming completion |
| **Independent parallel work** | `superpowers:dispatching-parallel-agents` | "Refactor the API and update the dashboard simultaneously" — spawns agents for each |
| **Git worktrees** | `superpowers:using-git-worktrees` | "Work on a feature in isolation" — creates a clean worktree for feature work |

**Usage:** Claude detects these automatically. If you want to be explicit, say "use TDD for this" or "debug this systematically" — Claude will invoke the skill.

## Conventions

- Prettier: `.prettierrc` (semi, single quotes, 2 spaces, 100 cols, trailing commas es5).
- ESLint: each app extends `@repo/eslint-config`, `--max-warnings 0`.
- Tests: Jest everywhere; Detox for mobile E2E; Cypress scaffolded (empty) in `apps/docs`.
- TS: every workspace is strict TS via `@repo/typescript-config`.

## Before completing a task

Run the filtered subset for the workspace you changed:

```sh
npx turbo run lint check-types test --filter=<name>
```

Do not claim "done" until these pass — per `superpowers:verification-before-completion`.
