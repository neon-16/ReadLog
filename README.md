# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Environment setup (required)

1. Create a local env file:

   ```bash
   cp .env.example .env
   ```

2. Fill in your production Firebase values in `.env`.

3. Verify required variables:

   ```bash
   npm run verify:env
   ```

Required values are:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

## Optional auth email config

Spark-safe default:

- Leave custom reset URL disabled and Firebase will use its hosted reset page link.

To use your own reset page URL, enable and set:

```bash
EXPO_PUBLIC_USE_CUSTOM_RESET_URL=true
EXPO_PUBLIC_PASSWORD_RESET_URL=https://your-domain.com/reset-password
```

The URL must be added to Firebase Auth authorized domains.

## Transactional password reset emails (recommended)

This project can send reset emails through a Firebase Cloud Function using Resend, which typically has better inbox placement than default template emails.

### 1) Install function dependencies

```bash
cd functions
npm install
```

### 2) Configure server-side secrets/env

Set secret for Resend API key:

```bash
firebase functions:secrets:set RESEND_API_KEY
```

Set runtime env vars for function deploy:

```bash
export RESET_EMAIL_FROM="ReadLog <noreply@yourdomain.com>"
export RESET_EMAIL_REPLY_TO="support@yourdomain.com"
export PASSWORD_RESET_CONTINUE_URL="https://your-domain.com/reset-password"
export APP_NAME="ReadLog"
export FUNCTIONS_REGION="us-central1"
```

Notes:
- `PASSWORD_RESET_CONTINUE_URL` should be an `https://` web URL (not a custom app scheme).
- Use a verified sending domain for `RESET_EMAIL_FROM` (SPF + DKIM configured in Resend).
- Add your sending domain DMARC record to improve inbox placement.

### 3) Deploy functions

```bash
firebase deploy --only functions
```

### 4) Client env

Set function region in app env when using non-default region:

```bash
EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION=us-central1
```

Spark-friendly default:

- By default, the app uses Firebase built-in `sendPasswordResetEmail`.
- To use transactional reset emails via Cloud Functions/Resend, enable this client env:

```bash
EXPO_PUBLIC_USE_TRANSACTIONAL_RESET=true
```

## Pre-release checklist

Use `PRE_RELEASE_CHECKLIST.md` before shipping. Recommended release flow:

```bash
npm run verify:env
npm run lint
npm test
npm run build:web
firebase deploy --only hosting
```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
