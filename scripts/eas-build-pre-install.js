const { spawnSync } = require('node:child_process');

const profile = String(process.env.EAS_BUILD_PROFILE || '').trim().toLowerCase();
const shouldEnforceStrict = profile === 'production' || profile === 'preview';

if (!profile) {
  console.log('[EAS env gate] EAS_BUILD_PROFILE is not set. Skipping strict env validation.');
  process.exit(0);
}

if (!shouldEnforceStrict) {
  console.log(`[EAS env gate] Profile "${profile}" is not release-like. Skipping strict env validation.`);
  process.exit(0);
}

console.log(`[EAS env gate] Running strict env validation for "${profile}" profile...`);

const result = spawnSync(process.execPath, ['./scripts/verify-env.js', '--strict'], {
  stdio: 'inherit',
  env: process.env,
});

if (typeof result.status === 'number' && result.status !== 0) {
  console.error('[EAS env gate] Build blocked due to missing/invalid required environment variables.');
  process.exit(result.status);
}

if (result.error) {
  console.error('[EAS env gate] Failed to run env validation:', result.error.message);
  process.exit(1);
}

console.log('[EAS env gate] Strict env validation passed.');
