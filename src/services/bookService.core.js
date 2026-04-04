import Book from '@/src/models/Book';
import { auth, db } from '@/src/services/firebaseConfig';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    where,
} from 'firebase/firestore';

export const MAX_PAGE_SIZE = 20;
export const DEFAULT_PAGE_SIZE = 15;
export const DEFAULT_STATUS_PAGE_SIZE = 10;
export const REQUEST_TIMEOUT_MS = 10000;

export const getUserBooksRef = () => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');
  return collection(db, 'users', userId, 'books');
};

export const getAuthenticatedUserId = () => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
};

export const withTimeout = async (promise, timeoutMs = REQUEST_TIMEOUT_MS, timeoutMessage = 'Request timed out') => {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getBookDocumentById = async (bookId) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  const byDocumentId = await getDoc(doc(db, 'users', userId, 'books', bookId));
  if (byDocumentId.exists()) {
    return byDocumentId;
  }

  const booksRef = getUserBooksRef();
  const byIdField = await getDocs(query(booksRef, where('id', '==', bookId), limit(1)));

  if (!byIdField.empty) {
    return byIdField.docs[0];
  }

  return null;
};

export function sortByCreatedAtDesc(a, b) {
  return (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0);
}

export function mapBooksFromSnapshot(snapshot) {
  return (snapshot?.docs ?? []).map((snapshotDoc) => Book.fromFirestore(snapshotDoc));
}

export function mapAndSortBooks(snapshot) {
  return mapBooksFromSnapshot(snapshot).sort(sortByCreatedAtDesc);
}

export function getSafePageSize(pageSize, fallbackSize = DEFAULT_PAGE_SIZE) {
  return Math.max(1, Math.min(MAX_PAGE_SIZE, Number(pageSize) || fallbackSize));
}

export function buildStatusPrimaryQuery(booksRef, status, safePageSize, lastVisible = null) {
  const constraints = [where('status', '==', status), orderBy('createdAt', 'desc')];

  if (lastVisible) {
    constraints.push(startAfter(lastVisible));
  }

  constraints.push(limit(safePageSize));
  return query(booksRef, ...constraints);
}

export function buildStatusFallbackQuery(booksRef, status, safePageSize) {
  return query(booksRef, where('status', '==', status), limit(safePageSize));
}

export function isMissingIndexError(error) {
  const message = String(error || '');
  return (
    message.includes('FAILED_PRECONDITION') ||
    message.includes('failed-precondition') ||
    message.includes('requires an index')
  );
}
