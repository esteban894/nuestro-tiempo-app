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

## Domain model

- **User** — starts with no Couple. Becomes part of one by either creating a `CoupleInvite` (from the account page) or entering another user's invite code.
- **Couple** — made up of exactly 2 users. Formed when one user creates a `CoupleInvite`, which generates an 8-character hexadecimal code; a second user joins the Couple by entering that code.
- **Album** — belongs to a creator (`User`). Has no direct relation to a `Couple`, but a user must belong to a Couple to create one.
  - Can be marked `private` at creation. A private album is visible only to its creator, not to the creator's partner.
  - The creator can toggle an album's private state at any time.
  - Related to `AlbumMember`s — the creator and their Couple partner.
- **Image** — belongs to an `Album`. Deleted in cascade when its Album is deleted.

## State of the codebase

The app is wired to the API. Key infrastructure already in place:

- **HTTP client** — `features/common/api/httpClient.ts` (`apiFetch`) reads the API base URL from `features/common/config/env.ts` (which validates `EXPO_PUBLIC_API_URL` at module load, failing fast if unset), attaches the `Authorization: Bearer` header, and on a 401 runs a deduplicated refresh-and-retry flow. Errors are typed as `ApiError` (non-2xx response) or `NetworkError` (request never completed). `resolveMediaUrl` prefixes relative media paths; `uploadToPresignedUrl` posts directly to S3.
- **Auth/session** — `features/auth/store/authStore.ts` (Zustand) holds the session, persists tokens in `expo-secure-store`, hydrates on launch, and wires the refresh flow into the HTTP client via `configureApiAuth`. The root layout gates routes on `status` with `Stack.Protected`.
- **Server state — React Query.** Each feature owns an `api/queryKeys.ts` (namespaced key factory) plus `hooks/` wrapping `useQuery`/`useMutation` (e.g. `useCoupleQuery`, `useAlbumsInfiniteQuery`, `useUploadImagesMutation`). Mutations revalidate by invalidating the relevant keys. The global `queryClient` (`features/common/api/queryClient.ts`) surfaces errors as toasts unless a query/mutation sets `meta.suppressErrorToast`. Prefer this pattern over ad-hoc stores for anything server-derived. Zustand is reserved for pure client state (`themeStore`).
- **Features wired:** auth, couple (create/join + `useCoupleQuery`), albums, images (presigned S3 upload with multipart fallback on a 501), and notifications (`expo-notifications` push, registered post-auth, routed through a type-safe dispatcher in `features/notifications/notificationDispatch.ts`).

When adding endpoints, check the sibling `nuestro-tiempo-api` README/entities for the contract before inventing one.

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
