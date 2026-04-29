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
| `packages/db` | Shared Drizzle ORM schema + migrations | drizzle-orm, pg, drizzle-kit | `packages/db/CLAUDE.md` |
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

Workspace names: `@repo/api`, `web`, `mobile`, `docs`, `@repo/ui`, `@repo/db`.

## Local database

Postgres runs via Docker. Connection string:
`postgresql://smartodo:smartodo_dev@localhost:5432/smartodo` — already set in
the `.env.example` files for `apps/api` and `packages/db`.

Schema + migrations live in `@repo/db`. To add a migration:

```sh
yarn workspace @repo/db db:generate <meaningful_name>   # emits <ms-timestamp>_<name>.sql
yarn workspace @repo/db db:migrate                      # applies pending migrations
```

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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **smartodo-ce** (1674 symbols, 1914 relationships, 3 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/smartodo-ce/context` | Codebase overview, check index freshness |
| `gitnexus://repo/smartodo-ce/clusters` | All functional areas |
| `gitnexus://repo/smartodo-ce/processes` | All execution flows |
| `gitnexus://repo/smartodo-ce/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
