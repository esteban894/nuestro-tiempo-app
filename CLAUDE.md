# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Nuestro Tiempo App** — Expo (React Native) + TypeScript mobile app for couples to link accounts, share albums, and upload photos together. Consumes the sibling API project `nuestro-tiempo-api` (NestJS, not in this repo). See [README.md](README.md) for setup, environments, and build instructions — read it before doing environment/build-related work.

## Stack

- Expo SDK 54, React Native 0.81, React 19, TypeScript 5.9 (`strict: true`)
- Expo Router 6 — file-based routing under `app/`, `typedRoutes` enabled
- React Compiler enabled (`experiments.reactCompiler` in `app.json`) — avoid manual `useMemo`/`useCallback` unless there's a proven need, the compiler handles most memoization
- EAS Build for cloud builds (`eas.json`: `development`, `preview`, `production` profiles)
- Package manager: **npm** (`package-lock.json` is the lockfile — don't introduce yarn/pnpm files here even though the sibling API uses pnpm)

## Structure

```
app/                # Expo Router routes only — screens/layouts, minimal logic
  (auth)/            # login, register
  (tabs)/            # index (home), albums, account
features/           # domain code, one folder per feature
  <feature>/
    components/
    index.ts        # barrel export — the feature's public API
constants/           # shared constants (colors.ts, etc.)
assets/               # fonts, images
```

- Import alias `@/*` resolves to the repo root (`tsconfig.json`) — use `@/features/...`, `@/constants/...` instead of relative `../../` paths.
- Route files in `app/` should stay thin: compose components from `features/`, don't build UI logic directly in route files.
- Every `features/<name>` folder re-exports its public surface through `index.ts`; import from the feature root (`@/features/common`), not from deep component paths, unless the barrel doesn't cover it yet.
- Shared UI primitives (Button, Card, Input, Title, CounterCards, ImageCarousel) live in `features/common/components/ui/` — check there before adding a new primitive.

## State of the codebase

This is an early-stage app: auth screens (`LoginForm`, `RegisterForm`) exist but are **not yet wired to the API** — submit handlers currently just navigate. There is no API client, no env var wiring (`EXPO_PUBLIC_*`), and no auth/session state management yet. When implementing real API integration, check the sibling `nuestro-tiempo-api` README for endpoint shapes (`/api/v1/auth/...`, JWT access + refresh tokens) before inventing a contract.

## Commands

- `npx expo start` — dev server (Expo Go or dev client)
- `npx expo start --clear` — same, clearing Metro cache (use after dependency/native changes acting weird)
- `npm run lint` — ESLint (`eslint-config-expo`)
- `npm run android` / `npm run ios` — local native build/run (requires Android Studio/Xcode; generates gitignored `android/`/`ios/` via CNG)
- `eas build --profile <development|preview|production> --platform <android|ios>` — cloud builds

## Conventions

- TypeScript strict mode — don't loosen `tsconfig.json` to work around a type error; fix the type.
- Match the existing component style: functional components, `StyleSheet.create` at the bottom of the file, props typed inline or via a local `type`/`interface`.
- Don't add native modules unsupported by Expo Go without flagging it — doing so forces every contributor onto a development build (see README's Expo Go vs. development build section).
- No test suite exists yet — don't assume `npm test` works.
