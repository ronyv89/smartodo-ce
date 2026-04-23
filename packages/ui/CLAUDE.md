# @repo/ui — shared dashboard component library

React 19 + Tailwind (consumer-owned) + ApexCharts + FullCalendar + react-dnd + Swiper. **Web-only** — never import this from `apps/mobile`.

Consumed by `apps/web`. Exports via subpath patterns (see `package.json#exports`):

| Subpath | Source | Use |
| ------- | ------ | --- |
| `@repo/ui/<name>` | `src/<name>.tsx\|.ts` | Top-level helpers (`button`, `card`, `code`) |
| `@repo/ui/components/*` | `src/components/*` | All feature components |
| `@repo/ui/icons/*` | `src/icons/*` | SVG icon set |
| `@repo/ui/hooks/*` | `src/hooks/*` | `useModal`, `useGoBack` |
| `@repo/ui/layout/*` | `src/layout/*` | `AppHeader`, `AppSidebar`, `Backdrop`, `SidebarWidget` |
| `@repo/ui/context/*` | `src/context/*` | `SidebarContext`, `ThemeContext` |

## Component groups (`src/components/`)

`auth`, `calendar` (FullCalendar), `charts` (ApexCharts), `common` (breadcrumb, theme toggles, chart tabs), `ecommerce` (metrics, maps, recent orders), `example`, `form` (inputs, selects, date picker, switches, grouped inputs), `header`, `tables`, `ui` (alert, avatar, badge, button, dropdown, modal, table, video), `user-profile`, `videos`.

Before adding a new component, grep this tree — most dashboard primitives already exist.

## Conventions

- No build step. Files are consumed directly from `src/` via the `exports` map, so keep TS types self-contained and don't rely on a dist step.
- Components are client-side React; if you need a server-only helper, put it elsewhere.
- `svg.d.ts` + `@svgr/webpack` — SVGs import as React components.
- Tailwind classes are defined here but compiled by the consumer (`apps/web`). Don't add a Tailwind runtime config in this package.
- Context providers live in `src/context/`. Wire them in the consumer's root layout, not here.

## Commands

```sh
yarn workspace @repo/ui lint
yarn workspace @repo/ui check-types
yarn workspace @repo/ui test
yarn workspace @repo/ui generate:component   # turbo gen scaffold
```

## Before completing a task

`npx turbo run lint check-types test --filter=@repo/ui` — and if public exports changed, also run `--filter=web` since the consumer will break first.
