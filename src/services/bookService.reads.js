import Book from '@/src/models/Book';
import {
    DEFAULT_PAGE_SIZE,
    DEFAULT_STATUS_PAGE_SIZE,
    MAX_PAGE_SIZE,
    buildStatusFallbackQuery,
    buildStatusPrimaryQuery,
    getBookDocumentById,
    getSafePageSize,
    getUserBooksRef,
    isMissingIndexError,
    mapAndSortBooks,
    mapBooksFromSnapshot,
    sortByCreatedAtDesc,
} from '@/src/services/bookService.core';
import { auth, db } from '@/src/services/firebaseConfig';
import {
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    startAfter,
    where,
} from 'firebase/firestore';

export async function getBooksPage({
  pageSize = DEFAULT_PAGE_SIZE,
  lastVisible = null,
} = {}) {
  try {
    const booksRef = getUserBooksRef();
    const safePageSize = getSafePageSize(pageSize, DEFAULT_PAGE_SIZE);

    const constraints = [orderBy('createdAt', 'desc')];
    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }
    constraints.push(limit(safePageSize));

    const snapshot = await getDocs(query(booksRef, ...constraints));
    const books = mapBooksFromSnapshot(snapshot);

    return {
      books,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === safePageSize,
    };
  } catch (error) {
    throw new Error(`Failed to fetch books page: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getAllBooks() {
  try {
    const allBooks = [];
    let cursor = null;
    let hasMore = true;

    while (hasMore) {
      const page = await getBooksPage({ pageSize: MAX_PAGE_SIZE, lastVisible: cursor });
      allBooks.push(...page.books);
      cursor = page.lastVisible;
      hasMore = page.hasMore && !!cursor;
    }

    return allBooks.sort(sortByCreatedAtDesc);
  } catch (error) {
    throw new Error(`Failed to fetch books: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBookById(bookId) {
  try {
    const snapshotDoc = await getBookDocumentById(bookId);
    if (!snapshotDoc) {
      return null;
    }
    return Book.fromFirestore(snapshotDoc);
  } catch (error) {
    throw new Error(`Failed to fetch book: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function splitBooksByStatus(books = []) {
  return books.reduce(
    (acc, book) => {
      if (book.status === 'reading') acc.reading.push(book);
      else if (book.status === 'want_to_read') acc.wantToRead.push(book);
      else if (book.status === 'finished') acc.finished.push(book);
      return acc;
    },
    { reading: [], wantToRead: [], finished: [] }
  );
}

export async function getBooksByStatus(status) {
  try {
    const booksRef = getUserBooksRef();
    const booksQuery = query(booksRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(booksQuery);

    return mapAndSortBooks(snapshot);
  } catch (error) {
    if (isMissingIndexError(error)) {
      const booksRef = getUserBooksRef();
      const fallbackSnapshot = await getDocs(query(booksRef, where('status', '==', status)));
      return mapAndSortBooks(fallbackSnapshot);
    }

    throw new Error(`Failed to fetch books by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBooksByStatusPage(status, {
  pageSize = DEFAULT_STATUS_PAGE_SIZE,
  lastVisible = null,
} = {}) {
  try {
    const booksRef = getUserBooksRef();
    const safePageSize = getSafePageSize(pageSize, DEFAULT_STATUS_PAGE_SIZE);
    const booksQuery = buildStatusPrimaryQuery(booksRef, status, safePageSize, lastVisible);
    const snapshot = await getDocs(booksQuery);
    const books = mapBooksFromSnapshot(snapshot);

    return {
      books,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === safePageSize,
    };
  } catch (error) {
    if (isMissingIndexError(error)) {
      const booksRef = getUserBooksRef();
      const safePageSize = getSafePageSize(pageSize, DEFAULT_STATUS_PAGE_SIZE);

      if (lastVisible) {
        return {
          books: [],
          lastVisible: null,
          hasMore: false,
        };
      }

      const fallbackQuery = buildStatusFallbackQuery(booksRef, status, safePageSize);
      const fallbackSnapshot = await getDocs(fallbackQuery);
      const fallbackBooks = mapAndSortBooks(fallbackSnapshot);

      return {
        books: fallbackBooks,
        lastVisible: fallbackSnapshot.docs[fallbackSnapshot.docs.length - 1] || null,
        hasMore: fallbackSnapshot.docs.length === safePageSize,
      };
    }

    throw new Error(`Failed to fetch books by status page: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function subscribeBooksByStatus(status, {
  pageSize = DEFAULT_STATUS_PAGE_SIZE,
  onUpdate,
  onError,
} = {}) {
  const booksRef = getUserBooksRef();
  const safePageSize = getSafePageSize(pageSize, DEFAULT_STATUS_PAGE_SIZE);
  const primaryQuery = buildStatusPrimaryQuery(booksRef, status, safePageSize);
  const fallbackQuery = buildStatusFallbackQuery(booksRef, status, safePageSize);

  let activeUnsubscribe = () => {};

  const subscribe = (booksQuery, shouldSort = false) => {
    activeUnsubscribe = onSnapshot(
      booksQuery,
      (snapshot) => {
        const books = mapBooksFromSnapshot(snapshot);
        onUpdate?.(shouldSort ? books.sort(sortByCreatedAtDesc) : books);
      },
      (error) => {
        if (booksQuery === primaryQuery && isMissingIndexError(error)) {
          activeUnsubscribe();
          subscribe(fallbackQuery, true);
          return;
        }

        onError?.(error);
      }
    );
  };

  subscribe(primaryQuery, false);

  return () => {
    activeUnsubscribe();
  };
}

export async function getBookStats() {
  try {
    const booksRef = getUserBooksRef();

    const [
      totalSnapshot,
      readingSnapshot,
      wantToReadSnapshot,
      finishedSnapshot,
    ] = await Promise.all([
      getDocs(booksRef),
      getDocs(query(booksRef, where('status', '==', 'reading'))),
      getDocs(query(booksRef, where('status', '==', 'want_to_read'))),
      getDocs(query(booksRef, where('status', '==', 'finished'))),
    ]);

    const total = totalSnapshot.size;
    const reading = readingSnapshot.size;
    const wantToRead = wantToReadSnapshot.size;
    const finished = finishedSnapshot.size;

    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    let readingGoal = 24;
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const rawReadingGoal = userDoc.data()?.readingGoal;
      if (typeof rawReadingGoal === 'number' && rawReadingGoal > 0) {
        readingGoal = rawReadingGoal;
      }
    }

    const goalProgress = readingGoal > 0 ? Math.round((finished / readingGoal) * 100) : 0;

    return {
      total,
      reading,
      wantToRead,
      finished,
      readingGoal,
      goalProgress,
    };
  } catch (error) {
    throw new Error(`Failed to fetch book stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
