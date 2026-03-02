import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import Book from '@/src/models/Book';
import { auth, db } from '@/src/services/firebaseConfig';

const getUserBooksRef = () => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');
  return collection(db, 'users', userId, 'books');
};

const withTimeout = async (promise, timeoutMs = 10000, timeoutMessage = 'Request timed out') => {
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

const getBookDocumentById = async (bookId) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  const byDocumentId = await getDoc(doc(db, 'users', userId, 'books', bookId));
  if (byDocumentId.exists()) {
    return byDocumentId;
  }

  const booksRef = getUserBooksRef();
  const byIdField = await getDocs(query(booksRef, where('id', '==', bookId)));

  if (!byIdField.empty) {
    return byIdField.docs[0];
  }

  const allSnapshot = await getDocs(booksRef);
  return allSnapshot.docs.find((snapshotDoc) => snapshotDoc.id === bookId) || null;
};

export async function getAllBooks() {
  try {
    const booksRef = getUserBooksRef();
    const snapshot = await getDocs(booksRef);

    return snapshot.docs
      .map((snapshotDoc) => Book.fromFirestore(snapshotDoc))
      .sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
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
    const booksQuery = query(booksRef, where('status', '==', status));
    const snapshot = await getDocs(booksQuery);

    return snapshot.docs
      .map((snapshotDoc) => Book.fromFirestore(snapshotDoc))
      .sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
  } catch (error) {
    throw new Error(`Failed to fetch books by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBookStats() {
  try {
    const books = await getAllBooks();

    const reading = books.filter((book) => book.status === 'reading').length;
    const wantToRead = books.filter((book) => book.status === 'want_to_read').length;
    const finished = books.filter((book) => book.status === 'finished').length;

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
      total: books.length,
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

export async function addBook({ title, author, totalPages, genre, source }) {
  try {
    const booksRef = getUserBooksRef();

    const baseBook = new Book({
      title,
      author,
      totalPages,
      genre,
      source,
      status: 'want_to_read',
      currentPage: 0,
      progress: 0,
      createdAt: null,
    });

    const payload = {
      ...baseBook.toFirestore(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(booksRef, payload);
    await updateDoc(docRef, { id: docRef.id });

    return new Book({
      ...payload,
      id: docRef.id,
      createdAt: null,
    });
  } catch (error) {
    throw new Error(`Failed to add book: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateBookProgress(bookId, { currentPage, totalPages }) {
  try {
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

        await updateDoc(doc(db, 'users', auth.currentUser.uid, 'books', snapshotDoc.id), {
          currentPage: safeCurrentPage,
          totalPages: safeTotalPages,
          progress: nextProgress,
          status: nextStatus,
        });

        return new Book({
          ...book.toFirestore(),
          id: snapshotDoc.id,
          currentPage: safeCurrentPage,
          totalPages: safeTotalPages,
          progress: nextProgress,
          status: nextStatus,
        });
      })(),
      10000,
      'Update book progress timed out after 10 seconds'
    );
  } catch (error) {
    throw new Error(`Failed to update book progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateBookStatus(bookId, newStatus) {
  try {
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

    await updateDoc(doc(db, 'users', auth.currentUser.uid, 'books', snapshotDoc.id), {
      status: updatedBook.status,
      currentPage: updatedBook.currentPage,
      progress: updatedBook.progress,
    });

    return updatedBook;
  } catch (error) {
    throw new Error(`Failed to update book status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteBook(bookId) {
  try {
    const snapshotDoc = await getBookDocumentById(bookId);
    if (!snapshotDoc) {
      throw new Error('Book not found');
    }

    await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'books', snapshotDoc.id));
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to delete book: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function clearAllBooks() {
  try {
    const booksRef = getUserBooksRef();
    const snapshot = await getDocs(booksRef);
    const batch = writeBatch(db);

    snapshot.docs.forEach((snapshotDoc) => {
      batch.delete(snapshotDoc.ref);
    });

    await batch.commit();
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
      10000,
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
