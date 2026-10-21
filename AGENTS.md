# AGENTS.md

Rules and workflow for AI coding agents. Implementation details live in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Project overview

LetRent is a rental-management mobile app with tenant and owner modes (properties, tenants, receipts, bank accounts, Google/OTP login).

- Expo SDK 57, Expo Router (file-based routes), React Native 0.86, React 19, TypeScript (`strict`).
- Libraries in use: axios, expo-secure-store, AsyncStorage, reanimated + gesture-handler, lottie-react-native.
- Entry: `main` is `expo-router/entry`; the root layout is [app/_layout.tsx](app/_layout.tsx).

## Architecture conventions

- Routes/screens: `app/` only (Expo Router). Nested folders (`app/owner/`, `app/tenant/`) mirror URLs.
- Shared UI: `components/`. Theme and tokens: `theme/`. Global state/providers: `context/`. HTTP, storage and repositories: `services/`. Shared types: `types/`. Pure helpers: `utils/`.
- Screens compose shared components and call services/context; do not put HTTP calls inline in components.
- New global providers are registered in `app/_layout.tsx`; keep `ThemeProvider` outermost.

## Design-system rules

- Import tokens from `theme` (`../theme`). Read theme values via `useTheme()`; build styles with `useThemedStyles(createStyles)` where `createStyles(theme: AppTheme)` returns `StyleSheet.create(...)`.
- Never hardcode colors in screens/components. Use semantic tokens (`colors.primary`, `colors.surface`, `colors.text`, ...). Do not use the legacy static `colors` export or `secondaryText` in new code.
- Text: use `AppText` (with `variant`/`color`), not raw `Text`. Spacing: `spacing.*`. Radius: `radius.*`.
- Prefer existing `Button`, `Input`, `Screen`, `AppShell`, `Loading`, `SearchFilterBar`, `AnimatedBottomSheet` before creating anything new. Extend them with props/variants rather than duplicating.
- New colors must be added to **both** light and dark palettes in `theme/colors.ts`. New type variants go in `theme/typography.ts` and `AppText`. Steps: see ARCHITECTURE.md section G.
- Do not add a second styling/theming library.

## Code quality rules

- Follow the existing TypeScript style (double quotes, function components, named exports for components/hooks). Avoid new `any`.
- Reuse existing dependencies; add one only when no existing one fits.
- Keep changes focused; no broad rewrites or drive-by refactors.
- Keep business logic in `context/`/`services/`, presentation in components.

## Protected behavior

Preserve existing authentication (Google and OTP), session restore, token storage (`services/tokenStorage.ts`, `context/AuthContext.tsx`), API contracts in `services/`, navigation/redirects, and owner/tenant workflows (including mode switching) unless the task explicitly requires changing them. Necessary fixes are allowed: read the relevant code first, make the smallest change, and validate it. Never log or document tokens, secrets or user data.

## Validation commands

Only these are supported by the project config:

- `npx tsc --noEmit` — type check (primary check).
- `npx expo config --type public` — validates `app.json`.
- `npx expo export --platform ios --output-dir <temp dir>` — bundling check; delete the output afterward.
- `git diff --check` — whitespace check.

Limitations: there is no test script and no ESLint/Prettier installed, so `npm run format` and `npm run clean` do not work. `expo export --platform web` fails (missing `@lottiefiles/dotlottie-react` for `lottie-react-native`). Visual behavior needs a device/simulator.

## AI workflow

1. Read this file.
2. Inspect relevant source before editing.
3. Consult `docs/ARCHITECTURE.md` for architectural context.
4. Reuse the existing implementation.
5. Make focused changes.
6. Run the relevant validation above.
7. Report actual results and any remaining issues; do not claim untested things work.
