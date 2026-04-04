import { useUserProfileData } from '@/src/features/auth/hooks/useUserProfileData';
import { getBooksByStatusPage, subscribeBooksByStatus } from '@/src/services/bookService';
import type { User } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';

const HOME_PAGE_SIZE = 10;

export function useHomeData(user: User | null) {
  const { profile } = useUserProfileData(user);
  const [readingBooks, setReadingBooks] = useState<any[]>([]);
  const [wantToReadBooks, setWantToReadBooks] = useState<any[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<any[]>([]);
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

      setReadingBooks(readingPage.books);
      setWantToReadBooks(wantToReadPage.books);
      setFinishedBooks(finishedPage.books);
    } catch (fetchError) {
      console.error('Book fetch error:', fetchError);
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
        setReadingBooks(books);
        markStatusLoaded('reading');
      },
      onError: handleRealtimeError,
    });

    const unsubWantToRead = subscribeBooksByStatus('want_to_read', {
      pageSize: HOME_PAGE_SIZE,
      onUpdate: (books) => {
        setWantToReadBooks(books);
        markStatusLoaded('want_to_read');
      },
      onError: handleRealtimeError,
    });

    const unsubFinished = subscribeBooksByStatus('finished', {
      pageSize: HOME_PAGE_SIZE,
      onUpdate: (books) => {
        setFinishedBooks(books);
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
    readingBooks,
    wantToReadBooks,
    finishedBooks,
    loading,
    error,
    fetchBooks,
  };
}
