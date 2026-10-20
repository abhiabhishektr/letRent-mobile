# User Management

Simple frontend-only React Native app using Expo SDK 54, TypeScript, Expo Router and AsyncStorage.

## Run

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go.

## Google sign-in

The web OAuth client ID is configured in `app.json`. Add separate Android and iOS
OAuth client IDs to `googleAndroidClientId` and `googleIosClientId` in that file
before enabling Google sign-in on those platforms. The Google OAuth client must
also allow the redirect URI used by the app. The Google sign-in endpoint exchanges
the returned ID token and Google access token for the app's session tokens.

## Demo accounts

Admin:

- admin@example.com
- admin123

User:

- john@example.com
- user123

Demo OTP:

- 123456

## Features

- Local login/session
- Admin user CRUD
- Search users
- Enable/disable users
- User profile editing
- Local persistence with AsyncStorage

There is intentionally no backend or external database.

tree -I 'node_modules|.expo|.git|dist|build|coverage|*.lock' -L 3