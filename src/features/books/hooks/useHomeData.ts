import { useUserProfileData } from '@/src/features/auth/hooks/useUserProfileData';
import type { HomeBook } from '@/src/features/books/types';
import { getBooksByStatusPage, subscribeBooksByStatus } from '@/src/services/bookService';
import type { User } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';

const HOME_PAGE_SIZE = 10;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toHomeBook(input: unknown): HomeBook {
  const book: Record<string, unknown> = isRecord(input) ? input : {};

  const readString = (key: string, fallback: string) => {
    const value = book[key];
    if (typeof value === 'string') {
      return value;
    }
    return fallback;
  };

  const readNumber = (key: string, fallback: number) => {
    const value = book[key];
    if (typeof value === 'number') {
      return value;
    }
    return fallback;
  };

  return {
    id: readString('id', ''),
    title: readString('title', 'Untitled'),
    author: readString('author', 'Unknown Author'),
    genre: readString('genre', 'other'),
    progress: readNumber('progress', 0),
    status: readString('status', 'want_to_read'),
    totalPages: readNumber('totalPages', 0),
    currentPage: readNumber('currentPage', 0),
  };
}

function normalizeHomeBooks(input: unknown): HomeBook[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map(toHomeBook).filter((book) => book.id.length > 0);
}

export function useHomeData(user: User | null) {
  const { profile, refreshProfile } = useUserProfileData(user);
  const [readingBooks, setReadingBooks] = useState<HomeBook[]>([]);
  const [wantToReadBooks, setWantToReadBooks] = useState<HomeBook[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<HomeBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchBooks = useCallback(async (showFullLoader = false) => {
    const requestId = ++requestIdRef.current;

    try {
      if (showFullLoader) {
        setLoading(true);
      }
      setError(null);

      // Load each section in parallel with capped page size to reduce cost and improve first paint.
      const [readingPage, wantToReadPage, finishedPage] = await Promise.all([
        getBooksByStatusPage('reading', { pageSize: HOME_PAGE_SIZE }),
        getBooksByStatusPage('want_to_read', { pageSize: HOME_PAGE_SIZE }),
        getBooksByStatusPage('finished', { pageSize: HOME_PAGE_SIZE }),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setReadingBooks(normalizeHomeBooks(readingPage.books));
      setWantToReadBooks(normalizeHomeBooks(wantToReadPage.books));
      setFinishedBooks(normalizeHomeBooks(finishedPage.books));
    } catch (fetchError) {
      const errorMsg = fetchError instanceof Error ? fetchError.message : JSON.stringify(fetchError);
      if (requestId === requestIdRef.current) {
        setError(errorMsg);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      requestIdRef.current += 1;
      setReadingBooks([]);
      setWantToReadBooks([]);
      setFinishedBooks([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const loadedStatuses = new Set<string>();

    const markStatusLoaded = (status: string) => {
      loadedStatuses.add(status);
      if (loadedStatuses.size === 3) {
        setLoading(false);
      }
    };

    const handleRealtimeError = (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to sync books in real time';
      setError(message);
      setLoading(false);
    };

    const unsubReading = subscribeBooksByStatus('reading', {
      pageSize: HOME_PAGE_SIZE,
      onUpdate: (books) => {
        setReadingBooks(normalizeHomeBooks(books));
        markStatusLoaded('reading');
      },
      onError: handleRealtimeError,
    });

    const unsubWantToRead = subscribeBooksByStatus('want_to_read', {
      pageSize: HOME_PAGE_SIZE,
      onUpdate: (books) => {
        setWantToReadBooks(normalizeHomeBooks(books));
        markStatusLoaded('want_to_read');
      },
      onError: handleRealtimeError,
    });

    const unsubFinished = subscribeBooksByStatus('finished', {
      pageSize: HOME_PAGE_SIZE,
      onUpdate: (books) => {
        setFinishedBooks(normalizeHomeBooks(books));
        markStatusLoaded('finished');
      },
      onError: handleRealtimeError,
    });

    return () => {
      requestIdRef.current += 1;
      unsubReading();
      unsubWantToRead();
      unsubFinished();
    };
  }, [user]);

  return {
    profile,
    refreshProfile,
    readingBooks,
    wantToReadBooks,
    finishedBooks,
    loading,
    error,
    fetchBooks,
  };
}
