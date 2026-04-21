import Book from '@/src/models/Book';
import {
    REQUEST_TIMEOUT_MS,
    getAuthenticatedUserId,
    getBookDocumentById,
    getUserBooksRef,
    withTimeout,
} from '@/src/services/bookService.core';
import { db } from '@/src/services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    setDoc,
    updateDoc,
    writeBatch
} from 'firebase/firestore';

const STATS_CACHE_PREFIX = 'stats:cache:';

function getStatsCacheKey(userId) {
  return `${STATS_CACHE_PREFIX}${userId || 'guest'}`;
}

function toSafeCount(value) {
  return Math.max(0, Number(value) || 0);
}

function normalizeCachedStats(stats) {
  const total = toSafeCount(stats?.total);
  const reading = toSafeCount(stats?.reading);
  const wantToRead = toSafeCount(stats?.wantToRead);
  const finished = toSafeCount(stats?.finished);
  const readingGoal = Math.max(1, Number(stats?.readingGoal) || 24);

  return {
    total,
    reading,
    wantToRead,
    finished,
    readingGoal,
    goalProgress: readingGoal > 0 ? Math.round((finished / readingGoal) * 100) : 0,
  };
}

async function mutateCachedStats(userId, mutateFn) {
  try {
    const cacheKey = getStatsCacheKey(userId);
    const raw = await AsyncStorage.getItem(cacheKey);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    const currentStats = normalizeCachedStats(parsed?.stats);
    const mutatedStats = mutateFn(currentStats);
    if (!mutatedStats) {
      return;
    }

    const nextStats = normalizeCachedStats(mutatedStats);
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({
        stats: nextStats,
        timestamp: Date.now(),
      })
    );
  } catch {
    // Cache synchronization should never block write operations.
  }
}

function applyStatusDelta(stats, previousStatus, nextStatus) {
  const prev = toSafeBookStatus(previousStatus);
  const next = toSafeBookStatus(nextStatus);

  if (prev === next) {
    return stats;
  }

  const nextStats = { ...stats };

  if (prev === 'reading') nextStats.reading = Math.max(0, nextStats.reading - 1);
  if (prev === 'want_to_read') nextStats.wantToRead = Math.max(0, nextStats.wantToRead - 1);
  if (prev === 'finished') nextStats.finished = Math.max(0, nextStats.finished - 1);

  if (next === 'reading') nextStats.reading += 1;
  if (next === 'want_to_read') nextStats.wantToRead += 1;
  if (next === 'finished') nextStats.finished += 1;

  return nextStats;
}

function toSafeBookStatus(value) {
  return ['want_to_read', 'reading', 'finished'].includes(value) ? value : 'want_to_read';
}

function getBulkStatusUpdateFields(book, status) {
  const totalPages = Math.max(0, Number(book?.totalPages) || 0);

  if (status === 'finished') {
    return {
      status: 'finished',
      currentPage: totalPages,
      progress: 100,
    };
  }

  return {
    status: 'want_to_read',
    currentPage: 0,
    progress: 0,
  };
}

export async function addBook({ title, author, totalPages, genre, source, status }, options = {}) {
  try {
    const { deferWriteAck = false, ackTimeoutMs = 0 } = options;
    const userId = getAuthenticatedUserId();
    const booksRef = getUserBooksRef();
    const requestedStatus = toSafeBookStatus(status);

    let defaultStatus = requestedStatus;
    if (!status) {
      const userDoc = await getDoc(doc(db, 'users', userId));
      defaultStatus = toSafeBookStatus(userDoc.data()?.defaultBookStatus);
    }

    const baseBook = new Book({
      title,
      author,
      totalPages,
      genre,
      source,
      status: defaultStatus,
      currentPage: 0,
      progress: 0,
      createdAt: null,
    });

    const payload = {
      ...baseBook.toFirestore(),
      id: doc(booksRef).id,
      createdAt: serverTimestamp(),
    };

    const docRef = doc(booksRef, payload.id);
    const persistPromise = setDoc(docRef, payload);
    if (deferWriteAck) {
      void persistPromise.catch(() => {
        // The caller intentionally opted out of waiting for ack.
      });
    } else {
      const safeAckTimeoutMs = Math.max(0, Number(ackTimeoutMs) || 0);
      if (safeAckTimeoutMs > 0) {
        try {
          await withTimeout(persistPromise, safeAckTimeoutMs, 'Write acknowledgment timed out');
        } catch (error) {
          const message = error instanceof Error ? error.message : '';
          if (message === 'Write acknowledgment timed out') {
            // Keep UI responsive on flaky connections while the write continues in background.
            void persistPromise.catch(() => {});
          } else {
            throw error;
          }
        }
      } else {
        await persistPromise;
      }
    }

    await mutateCachedStats(userId, (stats) => {
      const nextStats = {
        ...stats,
        total: stats.total + 1,
      };

      if (defaultStatus === 'reading') nextStats.reading += 1;
      if (defaultStatus === 'want_to_read') nextStats.wantToRead += 1;
      if (defaultStatus === 'finished') nextStats.finished += 1;

      return nextStats;
    });

    return new Book({
      ...payload,
      id: payload.id,
      createdAt: null,
    });
  } catch (error) {
    throw new Error(`Failed to add book: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateBookProgress(bookId, { currentPage, totalPages }) {
  try {
    const userId = getAuthenticatedUserId();

    return await withTimeout(
      (async () => {
        const snapshotDoc = await getBookDocumentById(bookId);
        if (!snapshotDoc) {
          throw new Error('Book not found');
        }

        const book = Book.fromFirestore(snapshotDoc);

        const safeTotalPages = Math.max(0, Number(totalPages) || book.totalPages);
        const requestedCurrentPage = Math.max(0, Number(currentPage) || 0);
        const safeCurrentPage = safeTotalPages > 0
          ? Math.min(requestedCurrentPage, safeTotalPages)
          : requestedCurrentPage;
        const calculatedProgress = safeTotalPages > 0
          ? Math.round((safeCurrentPage / safeTotalPages) * 100)
          : 0;

        const nextProgress = Math.min(100, Math.max(0, calculatedProgress));
        const nextStatus = safeTotalPages > 0
          ? (safeCurrentPage >= safeTotalPages
              ? 'finished'
              : safeCurrentPage > 0
                ? 'reading'
                : 'want_to_read')
          : (safeCurrentPage > 0 ? 'reading' : 'want_to_read');

        await updateDoc(doc(db, 'users', userId, 'books', snapshotDoc.id), {
          currentPage: safeCurrentPage,
          totalPages: safeTotalPages,
          progress: nextProgress,
          status: nextStatus,
        });

        await mutateCachedStats(userId, (stats) => applyStatusDelta(stats, book.status, nextStatus));

        return new Book({
          ...book.toFirestore(),
          id: snapshotDoc.id,
          currentPage: safeCurrentPage,
          totalPages: safeTotalPages,
          progress: nextProgress,
          status: nextStatus,
        });
      })(),
      REQUEST_TIMEOUT_MS,
      'Update book progress timed out after 10 seconds'
    );
  } catch (error) {
    throw new Error(`Failed to update book progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateBookStatus(bookId, newStatus) {
  try {
    const userId = getAuthenticatedUserId();
    const snapshotDoc = await getBookDocumentById(bookId);
    if (!snapshotDoc) {
      throw new Error('Book not found');
    }

    const book = Book.fromFirestore(snapshotDoc);
    const updatedBook = new Book({
      ...book.toFirestore(),
      id: snapshotDoc.id,
      status: newStatus,
      createdAt: book.createdAt,
    });

    await updateDoc(doc(db, 'users', userId, 'books', snapshotDoc.id), {
      status: updatedBook.status,
      currentPage: updatedBook.currentPage,
      progress: updatedBook.progress,
    });

    await mutateCachedStats(userId, (stats) => applyStatusDelta(stats, book.status, updatedBook.status));

    return updatedBook;
  } catch (error) {
    throw new Error(`Failed to update book status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateAllBooksStatus(newStatus) {
  try {
    const userId = getAuthenticatedUserId();
    const booksRef = getUserBooksRef();
    const snapshot = await getDocs(booksRef);
    const safeStatus = newStatus === 'finished' ? 'finished' : 'want_to_read';

    if (snapshot.empty) {
      return { success: true, updatedCount: 0, status: safeStatus };
    }

    let batch = writeBatch(db);
    let operationCount = 0;
    let updatedCount = 0;

    for (const snapshotDoc of snapshot.docs) {
      const book = Book.fromFirestore(snapshotDoc);
      const fields = getBulkStatusUpdateFields(book, safeStatus);

      batch.update(snapshotDoc.ref, {
        status: fields.status,
        currentPage: fields.currentPage,
        progress: fields.progress,
      });

      operationCount += 1;
      updatedCount += 1;

      // Keep room under Firestore's max 500 operations per batch.
      if (operationCount >= 450) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      await batch.commit();
    }

    await mutateCachedStats(userId, (stats) => {
      if (safeStatus === 'finished') {
        return {
          ...stats,
          reading: 0,
          wantToRead: 0,
          finished: stats.total,
        };
      }

      return {
        ...stats,
        reading: 0,
        wantToRead: stats.total,
        finished: 0,
      };
    });

    return { success: true, updatedCount, status: safeStatus };
  } catch (error) {
    throw new Error(`Failed to update all books status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteBook(bookId) {
  try {
    const userId = getAuthenticatedUserId();
    const snapshotDoc = await getBookDocumentById(bookId);
    if (!snapshotDoc) {
      throw new Error('Book not found');
    }

    const book = Book.fromFirestore(snapshotDoc);

    await deleteDoc(doc(db, 'users', userId, 'books', snapshotDoc.id));

    await mutateCachedStats(userId, (stats) => {
      const nextStats = {
        ...stats,
        total: Math.max(0, stats.total - 1),
      };

      if (book.status === 'reading') nextStats.reading = Math.max(0, nextStats.reading - 1);
      if (book.status === 'want_to_read') nextStats.wantToRead = Math.max(0, nextStats.wantToRead - 1);
      if (book.status === 'finished') nextStats.finished = Math.max(0, nextStats.finished - 1);

      return nextStats;
    });

    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete book: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function clearAllBooks() {
  try {
    const userId = getAuthenticatedUserId();
    const booksRef = getUserBooksRef();
    const snapshot = await getDocs(booksRef);
    const batch = writeBatch(db);

    snapshot.docs.forEach((snapshotDoc) => {
      batch.delete(snapshotDoc.ref);
    });

    await batch.commit();

    await mutateCachedStats(userId, (stats) => ({
      ...stats,
      total: 0,
      reading: 0,
      wantToRead: 0,
      finished: 0,
    }));

    return { success: true };
  } catch (error) {
    throw new Error(`Failed to clear all books: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function searchOnlineBooks(searchQuery) {
  try {
    if (!searchQuery || !searchQuery.trim()) {
      return [];
    }

    const encodedQuery = encodeURIComponent(searchQuery.trim());
    const endpoint = `https://openlibrary.org/search.json?q=${encodedQuery}`;

    const response = await withTimeout(
      fetch(endpoint),
      REQUEST_TIMEOUT_MS,
      'Search request timed out after 10 seconds'
    );

    if (!response || response.status !== 200) {
      throw new Error(`Open Library request failed with status ${response?.status ?? 'unknown'}`);
    }

    const payload = await response.json();
    const docs = Array.isArray(payload?.docs) ? payload.docs : [];

    return docs.map((item, index) => new Book({
      id: item?.key ? String(item.key).replace('/works/', 'ol_') : `online_${index}`,
      title: item?.title ?? '',
      author: item?.author_name?.[0] ?? 'Unknown',
      totalPages: item?.number_of_pages_median ?? 0,
      currentPage: 0,
      status: 'want_to_read',
      progress: 0,
      genre: 'other',
      source: 'online',
      createdAt: null,
    }));
  } catch (error) {
    throw new Error(`Failed to search online books: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
