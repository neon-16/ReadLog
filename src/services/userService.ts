import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import { app, isFirebaseConfigured } from '@/src/services/firebaseConfig';

export interface UserProfile {
  displayName: string;
  email: string;
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
  } catch (error) {
    console.error('Error fetching user profile:', error);
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
    await setDoc(userDocRef, { profile, readingGoal: 24 }, { merge: true });
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
}

export async function updateUserDisplayName(
  uid: string,
  displayName: string
): Promise<void> {
  if (!firestoreDb) return;

  try {
    const userDocRef = doc(firestoreDb, 'users', uid);
    await updateDoc(userDocRef, { 'profile.displayName': displayName });
  } catch (error) {
    console.error('Error updating display name:', error);
    throw error;
  }
}
