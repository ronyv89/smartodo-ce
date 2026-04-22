# docs — Fumadocs site

Next 15 + Fumadocs UI/MDX. Port 3001. Root redirects to `/docs`.

## Layout

```
app/
  layout.tsx     # root
  page.tsx       # / → redirect('/docs')
  source.ts      # fumadocs source loader
  docs/          # docs route segment
content/         # MDX content — add pages here
source.config.ts # fumadocs-mdx config
.source/         # generated — do not edit
```

## Conventions

- **Add a doc page:** create an `.mdx` file under `content/`. Fumadocs auto-picks it up via `source.config.ts`. Run `dev` to regenerate `.source/`.
- Do not edit `.source/` — it's generated output.
- Cypress directory exists (`cypress/`) but is empty scaffolding. No Cypress tests are wired up yet. Jest is present but `test` uses `--passWithNoTests`.

## Commands

```sh
yarn workspace docs dev         # :3001
yarn workspace docs build
yarn workspace docs check-types
yarn workspace docs lint
```

## Before completing a task

`npx turbo run lint check-types --filter=docs` (tests are no-op here).
