import { loginUser } from '@/src/features/auth/utils/loginUser';
import { auth, functions, isFirebaseConfigured } from '@/src/services/firebaseConfig';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    type ActionCodeSettings,
    type User,
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getResetActionCodeSettings(): ActionCodeSettings | undefined {
  const useCustomResetUrl = process.env.EXPO_PUBLIC_USE_CUSTOM_RESET_URL === 'true';
  if (!useCustomResetUrl) return undefined;

  const resetUrl = process.env.EXPO_PUBLIC_PASSWORD_RESET_URL?.trim();

  if (!resetUrl) return undefined;

  try {
    const parsed = new URL(resetUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return undefined;
    }

    return {
      url: parsed.toString(),
      handleCodeInApp: false,
    };
  } catch {
    return undefined;
  }
}

function getReadableAuthError(message: string): string {
  if (message.includes('auth/invalid-email')) return 'Invalid email format.';
  if (message.includes('auth/user-not-found')) return 'No account found for this email.';
  if (message.includes('auth/wrong-password')) return 'Incorrect password.';
  if (message.includes('auth/invalid-credential')) return 'Email or password is incorrect.';
  if (message.includes('auth/email-already-in-use')) return 'This email is already in use.';
  if (message.includes('auth/weak-password')) return 'Password must be at least 6 characters.';
  if (message.includes('auth/network-request-failed')) return 'Network error. Please try again.';
  return 'Authentication failed. Please try again.';
}

function getReadableResetError(message: string): string {
  if (message.includes('auth/user-not-found')) return 'If an account exists for this email, a reset link has been sent.';
  if (message.includes('auth/invalid-email')) return 'Please enter a valid email to reset your password.';
  if (message.includes('auth/operation-not-allowed')) return 'Password reset is not enabled. Please contact support.';
  if (message.includes('auth/too-many-requests')) return 'Too many requests. Please wait and try again.';
  if (message.includes('auth/network-request-failed')) return 'Network error. Please try again.';
  return 'Failed to send reset email. Please try again.';
}

function getReadableTransactionalResetError(message: string): string {
  if (message.includes('functions/unavailable')) {
    return 'Reset email service is unavailable right now. Please try again in a moment.';
  }
  if (message.includes('functions/not-found')) {
    return 'Reset email service is not deployed. Please contact support.';
  }
  if (message.includes('functions/permission-denied')) {
    return 'Reset email service permission denied. Please contact support.';
  }
  if (message.includes('functions/internal')) {
    return 'Reset email service failed. Please try again later.';
  }
  if (message.includes('network-request-failed')) {
    return 'Network error while sending reset email. Please try again.';
  }
  return 'Unable to send reset email at the moment. Please try again later.';
}

async function sendTransactionalResetEmail(email: string) {
  const callResetEmail = httpsCallable<{ email: string }, { ok: boolean }>(
    functions,
    'sendPasswordResetEmailTransactional'
  );
  await callResetEmail({ email });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const ensureAuthReady = useCallback(() => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_* values to your environment.');
    }
    return auth;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const currentAuth = ensureAuthReady();
    await loginUser(currentAuth, email, password);
  }, [ensureAuthReady]);

  const signUp = useCallback(async (email: string, password: string) => {
    const currentAuth = ensureAuthReady();
    try {
      await createUserWithEmailAndPassword(currentAuth, normalizeEmail(email), password);
    } catch (error) {
      throw new Error(getReadableAuthError(String(error)));
    }
  }, [ensureAuthReady]);

  const resetPassword = useCallback(async (email: string) => {
    const currentAuth = ensureAuthReady();
    const normalizedEmail = normalizeEmail(email);
    const actionCodeSettings = getResetActionCodeSettings();
    const useTransactionalReset = process.env.EXPO_PUBLIC_USE_TRANSACTIONAL_RESET === 'true';

    if (useTransactionalReset) {
      try {
        await sendTransactionalResetEmail(normalizedEmail);
        return;
      } catch (transactionalError) {
        throw new Error(getReadableTransactionalResetError(String(transactionalError)));
      }
    }

    try {
      if (actionCodeSettings) {
        await sendPasswordResetEmail(currentAuth, normalizedEmail, actionCodeSettings);
      } else {
        // Spark-safe default: Firebase hosted reset page link.
        await sendPasswordResetEmail(currentAuth, normalizedEmail);
      }
    } catch (error) {
      throw new Error(getReadableResetError(String(error)));
    }
  }, [ensureAuthReady]);

  const signOut = useCallback(async () => {
    const currentAuth = ensureAuthReady();
    await firebaseSignOut(currentAuth);
  }, [ensureAuthReady]);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, resetPassword, signOut }),
    [loading, resetPassword, signIn, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}