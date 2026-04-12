import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import {
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
} from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { Platform } from 'react-native';

function readPublicEnv(name) {
  const publicEnv = {
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION: process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION,
  };
  const value = publicEnv[name];
  return typeof value === 'string' ? value.trim() : '';
}

function isPlaceholder(value) {
  const normalized = value.toLowerCase();
  return normalized.includes('your_') || normalized.includes('replace_me') || normalized.includes('changeme');
}

function hasRealValue(value) {
  return value.length > 0 && !isPlaceholder(value);
}

const firebaseConfig = {
  apiKey: readPublicEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: readPublicEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: readPublicEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: readPublicEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readPublicEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readPublicEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
};

const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];

const missingConfigKeys = requiredConfigKeys.filter((key) => !hasRealValue(firebaseConfig[key] || ''));

export const isFirebaseConfigured = missingConfigKeys.length === 0;

if (!isFirebaseConfigured) {
  throw new Error(
    `Firebase is not configured. Missing/invalid: ${missingConfigKeys.join(', ')}. Add EXPO_PUBLIC_FIREBASE_* values in .env.`
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({}),
  });
} catch {
  db = getFirestore(app);
}

let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }
}

const functionsRegion = readPublicEnv('EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION') || 'us-central1';
const functions = getFunctions(app, functionsRegion);

export { app, auth, db, functions };
