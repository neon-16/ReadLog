require('dotenv/config');

const requiredVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

const recommendedVars = [
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION',
  'EXPO_PUBLIC_USE_CUSTOM_RESET_URL',
  'EXPO_PUBLIC_PASSWORD_RESET_URL',
  'EXPO_PUBLIC_USE_TRANSACTIONAL_RESET',
];

const placeholderPatterns = ['your_', 'replace_me', 'changeme'];

function readEnv(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function isPlaceholder(value) {
  const normalized = value.toLowerCase();
  return placeholderPatterns.some((pattern) => normalized.includes(pattern));
}

function checkVars(names, { required }) {
  const missing = [];
  const placeholders = [];

  for (const name of names) {
    const value = readEnv(name);
    if (!value) {
      if (required) {
        missing.push(name);
      }
      continue;
    }

    if (isPlaceholder(value)) {
      placeholders.push(name);
    }
  }

  return { missing, placeholders };
}

function printList(title, items) {
  if (items.length === 0) {
    return;
  }

  console.log(`\n${title}`);
  for (const item of items) {
    console.log(`- ${item}`);
  }
}

function main() {
  const required = checkVars(requiredVars, { required: true });
  const recommended = checkVars(recommendedVars, { required: false });

  const hasErrors = required.missing.length > 0 || required.placeholders.length > 0;

  if (hasErrors) {
    console.error('Environment validation failed.');
    printList('Missing required variables:', required.missing);
    printList('Required variables with placeholder values:', required.placeholders);
    process.exit(1);
  }

  console.log('Environment validation passed for required variables.');
  printList('Recommended variables with placeholder values:', recommended.placeholders);

  if (recommended.placeholders.length > 0) {
    console.log('\nTip: update recommended placeholders before production release.');
  }
}

main();
