# ReadLog Pre-Release Checklist

Use this checklist before each production release.

If development works but production fails, run `PRODUCTION_DEBUG_RUNBOOK.md` before shipping.

## 1. Environment and Config

- [ ] Copy `.env.example` to `.env` and fill all required values.
- [ ] Run `npm run verify:env` and confirm it passes.
- [ ] Run `npm run verify:env:strict` before preview/production EAS builds.
- [ ] Confirm `EXPO_PUBLIC_FIREBASE_PROJECT_ID` points to the production Firebase project.
- [ ] Confirm `EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION` matches deployed Cloud Functions.
- [ ] Keep `EXPO_PUBLIC_USE_CUSTOM_RESET_URL=false` unless a verified reset URL is ready.

## 2. Firebase Readiness

- [ ] Deploy latest Firestore rules: `firebase deploy --only firestore:rules`.
- [ ] Review Firestore rules in `firestore.rules` for least-privilege access.
- [ ] Confirm Authentication sign-in providers are correctly configured.
- [ ] If transactional reset is enabled, confirm `RESEND_API_KEY` secret is set.
- [ ] If transactional reset is enabled, verify function env vars (`RESET_EMAIL_FROM`, `PASSWORD_RESET_CONTINUE_URL`, `FUNCTIONS_REGION`).

## 3. App Quality

- [ ] Run lint: `npm run lint`.
- [ ] Run tests: `npm test`.
- [ ] Test on iOS, Android, and Web (login, signup, add book, update progress, delete, discover).
- [ ] Test offline behavior and reconnect sync.
- [ ] Verify no development logs are shown during normal app usage.

## 4. Performance and UX

- [ ] Confirm home and discover lists scroll smoothly on a lower-end device.
- [ ] Confirm loading and error states are user-friendly.
- [ ] Confirm images and icons render correctly on web and native.

## 5. Build and Deploy

- [ ] Build web output: `npm run build:web`.
- [ ] Deploy hosting: `firebase deploy --only hosting`.
- [ ] Hard-refresh browser and verify latest version is served.
- [ ] Verify `index.html` is no-cache and hashed assets are long-cache.

## 6. Post-Deploy Smoke Test

- [ ] Create a new account and login.
- [ ] Add a manual book and verify it appears on home.
- [ ] Search and add an online book.
- [ ] Update reading progress and status.
- [ ] Trigger reset password flow and verify email arrives.
