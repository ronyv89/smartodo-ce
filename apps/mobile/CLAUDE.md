# mobile — Expo app

Expo 54 + expo-router + React Native 0.81 + Gluestack UI v3 + NativeWind 4. iOS, Android, and web via `react-native-web`.

**Do not import `@repo/ui`** — that package is web-DOM only. Mobile uses its own local `components/ui/**` (Gluestack).

## Layout

```
app/                        # expo-router file-based routes
  _layout.tsx               # root layout — wraps with GluestackUIProvider
  index.tsx                 # /
  +html.tsx +not-found.tsx  # web + 404
components/
  ui/                       # Gluestack primitives (accordion, button, box, …)
  Themed.tsx, ExternalLink.tsx, useColorScheme.ts, …
assets/                     # icons, fonts, images
e2e/                        # Detox tests
  landing.test.ts
  jest.config.js
  tsconfig.json
android/                    # native Android project (required for Detox builds)
.detoxrc.js                 # Detox config — AVD: Pixel_4_API_30, iPhone 15 sim
```

## Conventions

- **Import alias:** `@/*` → mobile root. Use `@/components/ui/button`, `@/global.css`, `@/assets/...`.
- **Styling:** NativeWind `className` on Gluestack primitives. Tailwind v3 config at `tailwind.config.js` — design tokens (`bg-background-0`, `text-typography-500`, `bg-primary-500`) come from the Gluestack theme. Don't invent tokens; reuse existing ones.
- **New screen:** add a file under `app/`; expo-router auto-routes by filename. Wrap content in `Box`/`VStack` from `@/components/ui/*`.
- **Detox E2E:** every interactive element added to a screen under test needs a `testID`. Tests rely on `by.id(...)` and `by.text(...)` matchers. Existing pattern in `e2e/landing.test.ts`.
- **Fonts:** `useFonts({})` is called in `_layout.tsx`. Splash screen held until fonts resolve — add entries to the map if you ship new fonts.

## Commands

```sh
yarn workspace mobile dev               # expo start
yarn workspace mobile android           # expo run:android
yarn workspace mobile ios               # expo run:ios
yarn workspace mobile web               # expo start --web

yarn workspace mobile test              # jest (watchAll)
yarn workspace mobile build:e2e:android # detox build
yarn workspace mobile test:e2e          # detox test on android.emu.debug
yarn workspace mobile build:e2e:ios
yarn workspace mobile test:e2e:ios
```

Detox needs a running emulator/simulator — Claude cannot run E2E headlessly in this environment. If E2E verification is needed, ask the user to run `yarn workspace mobile test:e2e`.

## Development workflow: TDD-first with high coverage

**Every feature must follow this workflow before marking complete.**

### 1. Write tests first
- Unit tests for logic, hooks, utilities in `__tests__/`
- Integration tests for new screens
- Target **~100% code coverage** on new code
- Verify: `yarn workspace mobile test --coverage`

### 2. Implement feature to pass tests

### 3. Add Detox E2E tests
- Update or create tests in `e2e/` for the feature
- Add `testID` to all new interactive elements
- Example pattern: `element(by.id('my-button')).tap()`

### 4. Validation gates (all must pass)
```sh
yarn workspace mobile check-types  # TypeScript strict
yarn workspace mobile lint         # ESLint --max-warnings 0
yarn workspace mobile test         # Jest with coverage
yarn workspace mobile test:e2e     # Detox (user runs on device/simulator)
```

### 5. Mark complete only after all gates pass

**Why:** Mobile is the highest-friction surface (native + web, device-specific issues, app store regulations). TDD + near-100% coverage + Detox E2E catches regressions before they ship.

**Note:** Claude cannot run Detox headlessly (requires emulator/simulator), so ask the user to run `test:e2e` after you've completed implementation and verified the other gates.
