# web — Next.js dashboard

Next 15 (App Router) + React 19 + Tailwind v4. Port 3000. Consumes `@repo/ui`.

## Layout

```
app/
  layout.tsx       # root layout
  page.tsx         # /
  globals.css      # Tailwind v4 entry (@import "tailwindcss")
__tests__/         # jest + @testing-library/react (jsdom)
```

## Conventions

- **Dashboard components come from `@repo/ui`.** Import via subpath exports, not deep paths:
  ```ts
  import { Button } from '@repo/ui/components/ui/button/Button';
  import { AppHeader } from '@repo/ui/layout/AppHeader';
  ```
  When you need a new dashboard-style component, check `packages/ui/src/components/**` first — don't duplicate.
- Tailwind v4 — config is CSS-first in `globals.css`, no `tailwind.config.js` here. `@tailwindcss/postcss` is wired via `postcss.config.js`.
- Server components by default; add `"use client"` only when you need hooks/interactivity.
- ESM (`"type": "module"`). `next.config.js` is CJS.
- `check-types` runs `next typegen && tsc --noEmit` — always run it, not bare `tsc`, so Next's generated route types are fresh.

## Commands

```sh
yarn workspace web dev         # :3000
yarn workspace web build
yarn workspace web test
yarn workspace web check-types
yarn workspace web lint
```

## Before completing a task

`npx turbo run lint check-types test --filter=web`
