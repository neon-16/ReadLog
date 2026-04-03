import { getBooksByStatusPage } from '@/src/services/bookService';
import { getUserProfile, type UserProfile } from '@/src/services/userService';
import { useFocusEffect } from 'expo-router';
import type { User } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';

const HOME_PAGE_SIZE = 10;

export function useHomeData(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [readingBooks, setReadingBooks] = useState<any[]>([]);
  const [wantToReadBooks, setWantToReadBooks] = useState<any[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedBooksRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user) return;
      try {
        const userProfile = await getUserProfile(user.uid);
        if (isMounted) {
          setProfile(userProfile);
        }
      } catch (loadError) {
        console.error('Error loading profile:', loadError);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const fetchBooks = useCallback(async (showFullLoader = false) => {
    const requestId = ++requestIdRef.current;

    try {
      if (showFullLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
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
      hasLoadedBooksRef.current = true;
    } catch (fetchError) {
      console.error('Book fetch error:', fetchError);
      const errorMsg = fetchError instanceof Error ? fetchError.message : JSON.stringify(fetchError);
      if (requestId === requestIdRef.current) {
        setError(errorMsg);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchBooks(!hasLoadedBooksRef.current);
      }

      return () => {
        requestIdRef.current += 1;
      };
    }, [fetchBooks, user])
  );

  return {
    profile,
    readingBooks,
    wantToReadBooks,
    finishedBooks,
    loading,
    refreshing,
    error,
    fetchBooks,
  };
}
