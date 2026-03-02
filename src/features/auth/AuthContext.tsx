import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/src/services/firebaseConfig';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    try {
      await signInWithEmailAndPassword(currentAuth, email.trim(), password);
    } catch (error) {
      throw new Error(getReadableAuthError(String(error)));
    }
  }, [ensureAuthReady]);

  const signUp = useCallback(async (email: string, password: string) => {
    const currentAuth = ensureAuthReady();
    try {
      await createUserWithEmailAndPassword(currentAuth, email.trim(), password);
    } catch (error) {
      throw new Error(getReadableAuthError(String(error)));
    }
  }, [ensureAuthReady]);

  const signOut = useCallback(async () => {
    const currentAuth = ensureAuthReady();
    await firebaseSignOut(currentAuth);
  }, [ensureAuthReady]);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut }),
    [loading, signIn, signOut, signUp, user]
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