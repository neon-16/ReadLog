# ReadLog Production Debug Runbook (React Native + Firebase)

Use this when development works but production APK/AAB fails.

## 1) Fast 5-minute triage

Run these first:

```bash
npm run verify:env
npm run lint
npm test
```

Then confirm these values are correct for production:
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION`

If any are missing or wrong, fix env first before rebuilding.

## 2) Most common production-only causes

### A) Firebase config mismatch (wrong project/app)
Symptoms:
- Login/read/write fails only in production
- Errors like app not initialized, invalid API key, project mismatch

Debug:
1. Confirm Android package in `app.json` is `com.nyanlinn.readlog`.
2. Confirm Firebase Console Android app package is exactly the same.
3. Confirm production env values belong to the same Firebase project.

Fix:
1. Correct Firebase app registration/package if needed.
2. Use the matching production `EXPO_PUBLIC_FIREBASE_*` values.
3. Rebuild production.

### B) EAS production env not set
Symptoms:
- Works locally, fails in cloud build/release app
- Runtime errors from missing Firebase env variables

Debug:
1. Check EAS build profile used for release.
2. Verify env vars exist in EAS secrets/environment for that profile.
3. Compare project id in app logs vs expected production project.

Fix:
1. Add required `EXPO_PUBLIC_FIREBASE_*` vars to your EAS environment.
2. Re-run a preview/production build.
3. Re-test login, add book, update progress, delete.

### C) Firestore rules reject requests
Symptoms:
- `permission-denied` on add/update/delete
- Reads may work but writes fail

Debug:
1. Reproduce write failure in production app.
2. Check Firebase Console logs for denied requests.
3. Verify rules in `firestore.rules` match your document structure.

Fix:
1. Update rules.
2. Deploy rules:

```bash
firebase deploy --only firestore:rules
```

3. Re-test core flows.

### D) Auth timing/race condition
Symptoms:
- On cold launch, Firestore calls fail intermittently
- User appears null briefly in production

Debug:
1. Confirm app waits for auth state before protected reads/writes.
2. Check auth gate paths and loading behavior.

Fix:
1. Keep protected queries behind auth-ready state.
2. Add graceful retry for first-load fetch if auth is still initializing.

### E) Release signing SHA mismatch (if using providers that require it)
Symptoms:
- Auth provider works in debug but fails in release

Debug:
1. Confirm release SHA-1/SHA-256 is added in Firebase Android app settings.
2. Confirm package name + SHA restrictions are correct.

Fix:
1. Add missing release SHA fingerprints in Firebase.
2. Rebuild production.

### F) Network/API key restrictions
Symptoms:
- `network-request-failed` or blocked API calls in release

Debug:
1. Confirm internet connectivity on physical device.
2. Verify API key restrictions are not blocking release package/SHA.

Fix:
1. Update API key restrictions.
2. Rebuild and retest.

## 3) Project-specific checks for ReadLog

- Firebase init is in `src/services/firebaseConfig.js` and throws if required env values are missing.
- Env validation script is `scripts/verify-env.js` (already passing locally).
- Build profiles are in `eas.json`.
- Android package id is in `app.json`.
- Firestore rules are in `firestore.rules` and deployed via `firebase.json`.

## 4) Repro + verify script (manual)

After each production build, verify in order:
1. Login
2. Add manual book
3. Update progress
4. Delete book
5. Force-close and reopen (persistence)
6. Optional: turn internet off/on to confirm offline/online recovery

If one fails, capture:
- exact screen
- exact action
- exact error text
- whether issue reproduces after restart

## 5) Safe fix workflow

1. Change one thing only (env, rules, or code).
2. Rebuild.
3. Re-run the same failing scenario.
4. If fixed, document cause + fix in release notes.

## 6) Recommended release commands

```bash
npm run verify:env
npm run lint
npm test
# Build using your chosen EAS profile
# Example: eas build -p android --profile production
```

For web deploys:

```bash
npm run build:web
firebase deploy --only hosting
```
