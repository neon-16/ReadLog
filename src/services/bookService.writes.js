import Book from '@/src/models/Book';
import {
    REQUEST_TIMEOUT_MS,
    getAuthenticatedUserId,
    getBookDocumentById,
    getUserBooksRef,
    withTimeout,
} from '@/src/services/bookService.core';
import { db } from '@/src/services/firebaseConfig';
import {
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from 'firebase/firestore';

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

    return updatedBook;
  } catch (error) {
    throw new Error(`Failed to update book status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteBook(bookId) {
  try {
    const userId = getAuthenticatedUserId();
    const snapshotDoc = await getBookDocumentById(bookId);
    if (!snapshotDoc) {
      throw new Error('Book not found');
    }

    await deleteDoc(doc(db, 'users', userId, 'books', snapshotDoc.id));
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
