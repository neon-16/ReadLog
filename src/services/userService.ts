import { app, isFirebaseConfigured } from '@/src/services/firebaseConfig';
import {
    doc,
    getDoc,
    getFirestore,
    setDoc,
    type Firestore,
} from 'firebase/firestore';

export interface UserProfile {
  displayName: string;
  email: string;
}

export type DefaultBookStatus = 'want_to_read' | 'reading' | 'finished';

function toSafeDefaultBookStatus(value: unknown): DefaultBookStatus {
  return value === 'reading' || value === 'finished' || value === 'want_to_read'
    ? value
    : 'want_to_read';
}

const firestoreDb: Firestore | null = isFirebaseConfigured && app ? getFirestore(app as any) : null;

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!firestoreDb) return null;

  try {
    const docSnap = await getDoc(doc(firestoreDb, 'users', uid));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data?.profile || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function createInitialUserProfile(
  uid: string,
  email: string
): Promise<void> {
  if (!firestoreDb) return;

  try {
    const userDocRef = doc(firestoreDb, 'users', uid);
    const profile: UserProfile = {
      displayName: 'User', // Default display name
      email,
    };
    await setDoc(userDocRef, { profile, readingGoal: 24, defaultBookStatus: 'want_to_read' }, { merge: true });
  } catch {
    // Keep this non-blocking for first-run onboarding.
  }
}

export async function getUserDefaultBookStatus(uid: string): Promise<DefaultBookStatus> {
  if (!firestoreDb) return 'want_to_read';

  try {
    const docSnap = await getDoc(doc(firestoreDb, 'users', uid));
    if (!docSnap.exists()) {
      return 'want_to_read';
    }

    const data = docSnap.data();
    return toSafeDefaultBookStatus(data?.defaultBookStatus);
  } catch {
    return 'want_to_read';
  }
}

export async function updateUserDefaultBookStatus(
  uid: string,
  status: DefaultBookStatus
): Promise<void> {
  if (!firestoreDb) return;

  try {
    const userDocRef = doc(firestoreDb, 'users', uid);
    await setDoc(
      userDocRef,
      {
        defaultBookStatus: toSafeDefaultBookStatus(status),
      },
      { merge: true }
    );
  } catch (error) {
    throw error;
  }
}

export async function updateUserDisplayName(
  uid: string,
  displayName: string
): Promise<void> {
  if (!firestoreDb) return;

  try {
    const userDocRef = doc(firestoreDb, 'users', uid);
    await setDoc(
      userDocRef,
      {
        profile: {
          displayName,
        },
      },
      { merge: true }
    );
  } catch (error) {
    throw error;
  }
}
