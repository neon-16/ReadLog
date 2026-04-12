import { db } from '@/src/services/firebaseConfig';
import {
    addDoc,
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
} from 'firebase/firestore';

export type FirestoreCheckBook = {
  id: string;
  title?: string;
  author?: string;
  status?: string;
  progress?: number;
};

export async function addDummyBookForCheck(uid: string): Promise<string> {
  const booksRef = collection(db, 'users', uid, 'books');

  const docRef = await addDoc(booksRef, {
    title: 'Firestore Test Book',
    author: 'QA Bot',
    genre: 'other',
    status: 'want_to_read',
    totalPages: 100,
    currentPage: 0,
    progress: 0,
    source: 'manual',
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function fetchRecentBooksForCheck(uid: string): Promise<FirestoreCheckBook[]> {
  const booksRef = collection(db, 'users', uid, 'books');
  const q = query(booksRef, orderBy('createdAt', 'desc'), limit(10));
  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<FirestoreCheckBook, 'id'>),
  }));
}

export async function runFirestoreConnectionCheck(uid: string) {
  const newBookId = await addDummyBookForCheck(uid);
  console.log('[Firestore Check] Write OK. New book id:', newBookId);

  const books = await fetchRecentBooksForCheck(uid);
  console.log('[Firestore Check] Read OK. Book count:', books.length);
  console.log('[Firestore Check] Recent books:', books);

  return {
    newBookId,
    books,
  };
}
