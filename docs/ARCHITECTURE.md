# LetRent Mobile Architecture

Factual description of the current code. Rules and workflow are in [AGENTS.md](../AGENTS.md). Items marked **Recommendation** are not implemented.

## A. Project structure

| Path | Responsibility |
|---|---|
| [app/](../app) | Expo Router routes (screens) |
| [components/](../components) | Shared UI components |
| [theme/](../theme) | Tokens, theme provider, style hooks |
| [context/AuthContext.tsx](../context/AuthContext.tsx) | Only context: auth/session/mode |
| [services/](../services) | HTTP client, API modules, storage, mock repositories |
| [types/](../types) | `auth.ts` (OTP/Google responses), `user.ts` (`AppMode`, `User`) |
| [utils/](../utils) | `async.ts` (`wait`, `withMinimumDuration`), `validation.ts` (`validateEmail/Phone/Password`, currently unused), `building.json` (Lottie) |
| [app.json](../app.json) / [eas.json](../eas.json) | Expo config (scheme `letrent`, `userInterfaceStyle: automatic`, API base URL and Google client IDs under `extra`) / EAS profiles |

## B. Application entry and navigation

- Entry: `expo-router/entry` ([package.json](../package.json) `main`).
- Root layout [app/_layout.tsx](../app/_layout.tsx): `ThemeProvider` > `AuthProvider` > `RootNavigator`.
- `RootNavigator` renders `GestureHandlerRootView`, `StatusBar` (style from `colorScheme`), a `Stack` (`headerShown: false`, `animation: "none"`; `login` is a `transparentModal`), plus `BottomNav` and `ModeTransitionLoader` conditionally.
- `BottomNav` is shown when a user is logged in and the path starts with `/tenant`, `/owner`, `/profile` or `/edit-profile`; the active tab is derived from the pathname.
- Routes: `index` (welcome), `login` (bottom sheet), `otp`, `select-role`, `profile`, `edit-profile`, `tenant`, `tenant/payment`, `tenant/receipts`, `owner`, `owner/properties`, `owner/properties/add` (also edit via params), `owner/properties/[id]`, `owner/tenants`, `owner/bank-accounts`.
- Navigation uses `router.push`/`router.replace` from `expo-router`. React Navigation's theme is **not** wired to the app theme; screens set their own backgrounds.

## C. Theme architecture

Files in [theme/](../theme):

- [colors.ts](../theme/colors.ts): `brandColors` (`blue`, `green`), `palettes` (`light`, `dark`), type `ThemeColors`, legacy `colors` (= light palette).
- [ThemeProvider.tsx](../theme/ThemeProvider.tsx): `ThemeProvider`, `useTheme()` (throws outside provider), type `AppTheme` = `{ colorScheme, colors, radius, spacing, typography }`.
- [useThemedStyles.ts](../theme/useThemedStyles.ts): `useThemedStyles(createStyles)`.
- [platformShadow.ts](../theme/platformShadow.ts): `createPlatformShadow` maps theme shadow tokens to web `boxShadow` and native shadow styles.
- [spacing.ts](../theme/spacing.ts): `xs 4, sm 8, md 12, lg 16, xl 24, xxl 32`. [radius.ts](../theme/radius.ts): `sm 8, md 12, lg 16, xl 24, pill 999`.
- [typography.ts](../theme/typography.ts), [index.ts](../theme/index.ts) (re-exports everything above).

Color tokens (both palettes): `primary, primaryForeground, secondary, background, surface, surfaceSecondary, text, textSecondary, secondaryText (deprecated alias), textDisabled, disabled, border, inputBackground, placeholder, success, successForeground, successBackground, warning, error, info, overlay`.

Selection: light and dark are both implemented. `ThemeProvider` follows the OS scheme via `useColorScheme()`. There is no manual override and **no persistence** of a theme preference. The status bar follows `colorScheme`.

Usage pattern:

```tsx
function createStyles(theme: AppTheme) {
  return StyleSheet.create({ card: { backgroundColor: theme.colors.surface, padding: theme.spacing.lg } });
}
const styles = useThemedStyles(createStyles);
```

Changing global colors: edit `brandColors` and/or the matching entries in `lightColors` and `darkColors` in `theme/colors.ts`. Keep both palettes in sync and check contrast.

## D. Typography

- `fontFamilies.sans`: platform system font (`System` on iOS, `sans-serif` elsewhere). **No custom font assets are bundled and no font-loading code exists** (`expo-font` is only listed as a plugin; `assets/` holds just `images/logo.png`).
- Exports: `fontFamilies`, `fontSizes` (caption 12 … display 32), `lineHeights`, `fontWeights` (`regular 400, medium 500, semibold 600, bold 700, heavy 800`), `typography` (StyleSheet).
- Variants: `display, heading, subheading, body, bodySmall, label, caption, button`; legacy aliases `screenTitle, sectionTitle, secondary`.
- Add or change: edit `typography.ts` (size/line height/weight entries and the `typography` style), then add the name to `AppText`'s variant type in [AppText.tsx](../components/AppText.tsx). To adopt a custom font, add assets, load them (e.g. `useFonts`) before rendering, and update `fontFamilies`.

## E. Reusable UI components

All in [components/](../components); they read the theme via `useTheme`/`useThemedStyles`.

- [AppText](../components/AppText.tsx): `TextProps` + `variant?` + `color?`. Defaults to `colors.text`. Screens commonly `import { AppText as Text }`.
- [Button](../components/Button.tsx): `title`, `onPress` (required); `icon?`, `loading?`, `disabled?`, `danger?`, `outline?`, `style?`. Sets accessibility role/state. No other variants or sizes.
- [Input](../components/Input.tsx): `TextInputProps` + required `label`, `error?`. Handles focus/error/disabled styling.
- [Screen](../components/Screen.tsx): `children`, `scroll?` (default false), `style?`. Safe area, keyboard avoiding, optional ScrollView.
- [AppShell](../components/AppShell.tsx): wraps `Screen` (`children`, `scroll`, `style`). `active` is declared but unused.
- [BottomNav](../components/BottomNav.tsx): `mode` (`tenant`|`owner`), `active`. Tabs are hardcoded arrays with text glyph icons; routes via `router.replace`.
- [ConfirmDialog](../components/ConfirmDialog.tsx): exports only `confirmDelete(name, onConfirm)`, an `Alert.alert` wrapper with fixed "Delete user" copy. Not themed; no usages found in `app/` or `components/`.
- [Loading](../components/Loading.tsx): centered `ActivityIndicator` on the themed background.
- [SearchFilterBar](../components/SearchFilterBar.tsx): `query`, `onQueryChange`, `placeholder`, optional `filters`, `selectedFilters`, `onFilterChange`; exports type `FilterGroup`. Filtering itself is done by the caller.
- [AnimatedBottomSheet](../components/AnimatedBottomSheet.tsx): `children`, `onClose`, optional animation timings/spring configuration and close accessibility label. Reanimated + gesture-handler, pan-to-close, backdrop. Used by `login` and the owner tenant form.
- [ModeSwitch](../components/ModeSwitch.tsx): tenant/owner toggle via `useAuth().switchMode`. This switches app role, not appearance.
- [ModeTransitionLoader](../components/ModeTransitionLoader.tsx): full-screen overlay with pulsing logo while `isModeSwitching`.

Extend by adding props/variants to the existing component; create a new component only when no existing one covers the need.

## F. State and data flow

- [AuthContext](../context/AuthContext.tsx), `useAuth()` exposes: `currentUser, isLoading, isModeSwitching, pendingPhone, mode, loginWithGoogle, beginLogin, verifyOtp, resendOtp, updateProfile, switchMode, logout`.
  - Session user is stored in AsyncStorage (`letrent_session`); access/refresh tokens in SecureStore. Restore requires the user and both tokens.
  - `beginLogin` validates a 10-digit number, calls `authApi.sendOtp`, navigates to `/otp`; after verification the app goes to `/select-role`.
  - `switchMode` runs `withMinimumDuration(..., 2000)` then routes to `/tenant` or `/owner`. `logout` clears session and tokens and routes to `/`. `updateProfile` is local only.
- [services/api.ts](../services/api.ts): `API_BASE_URL` (env `EXPO_PUBLIC_API_BASE_URL`, then `expo-constants` `extra.apiBaseUrl`, then a built-in default), `apiClient` (axios, 20s timeout), `getErrorMessage`. No interceptors and no token refresh; auth headers are set per call.
- [services/authApi.ts](../services/authApi.ts): `authApi.googleLogin`, `sendOtp`, `verifyOtp`, `resendOtp` (`/api/auth/...`; OTP calls send multipart form data).
- [services/propertyApi.ts](../services/propertyApi.ts): `lookupPinCode` (external postal-pincode API), `getProperties`, `getProperty`, `createProperty`, `updateProperty`, `deleteProperty`, plus input/response types. Reads the Bearer token from `tokenStorage`; throws if absent.
- [services/tokenStorage.ts](../services/tokenStorage.ts): `setTokens`, `getAccessToken`, `getRefreshToken`, `clearTokens` (SecureStore).
- [services/storage.ts](../services/storage.ts): JSON AsyncStorage wrapper (`get`, `set`, `remove`).
- [services/rentRepository.ts](../services/rentRepository.ts): **mock** data: `getTenantDashboard`, `getOwnerDashboard`, `getProperties`, `addProperty`, `getOwnerTenants`, `addOwnerTenant`, `getReceipts`. Tenant additions and demo property data are in memory only.
- [services/bankAccountRepository.ts](../services/bankAccountRepository.ts): **local** AsyncStorage CRUD (`letrent_bank_accounts`, seeded samples): `getAccounts`, `addAccount`, `deleteAccount`, `setReceivingAccount`.

## G. Common development tasks

- **Brand color**: change `brandColors` and the dependent entries (`primary`, `success`, and dark equivalents) in `theme/colors.ts`.
- **Typography variant**: add size/line height in `typography.ts`, add the `typography` style, extend `AppText`'s variant type, use `<AppText variant="x">`.
- **Shared component**: create `components/Name.tsx`, use `useThemedStyles` and tokens, accept `style` and accessibility props, check no existing component fits first.
- **Screen**: add `app/<path>.tsx` with a default export; wrap in `Screen`/`AppShell`. For a bottom-nav route, update the pathname checks in `_layout.tsx` and `BottomNav`. Add `Stack.Screen` options only if non-default presentation is needed.
- **API endpoint**: add a function in a `services/*Api.ts` module using `apiClient` and `getErrorMessage`; get the token from `tokenStorage` as `propertyApi.ts` does; put response types alongside or in `types/`. Call it from the screen or context, not from components.
- **Validate**: see "Validation commands" in AGENTS.md.

## H. Known limitations

Confirmed:

- No custom fonts or font loading; no manual theme toggle or persisted preference; navigation theme not synced.
- Legacy theme aliases remain (`colors` export, `secondaryText`, `disabled`, typography aliases). Many screens still use inline font sizes/weights and some hardcoded small paddings/radii.
- `AppShell.active` unused; `ConfirmDialog` unused and unthemed; `utils/validation.ts` unused; `Button` has no extra variants.
- Only auth and property endpoints use the real API. Dashboards, receipts, owner tenants and bank accounts are mock/local.
- The owner tenant add form uses local demo properties, validates tenant and rent details, and stores its collection date as `YYYY-MM-DD`; new tenants are not persisted across app restarts.
- No token refresh logic. `getProperty` requests `/api/properties/${id}` without a trailing slash, unlike the other property calls.
- `verifyOtp` in `AuthContext` falls back to a demo user when the API fails and the OTP is `1234`; the OTP UI is 6 digits, so it is likely unreachable. Security-sensitive; investigate before touching.
- Several screens use `any` for data.
- `expo export --platform web` fails (missing `@lottiefiles/dotlottie-react`). No test or lint setup; `format`/`clean` scripts reference tools not installed.
- `README.md` partly describes an older demo user-management app and does not match this architecture.
- Type check and iOS export passed after the design-system refactor; visuals were not verified on a device.

Recommendations (not implemented): add lint/test tooling, wire React Navigation theme to the app theme, persist a theme preference if wanted, migrate remaining inline typography to `AppText` variants, and remove legacy aliases once unused.
