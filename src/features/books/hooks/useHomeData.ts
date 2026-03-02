import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { User } from 'firebase/auth';
import { getUserProfile, type UserProfile } from '@/src/services/userService';
import { getAllBooks, splitBooksByStatus } from '@/src/services/bookService';

export function useHomeData(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [readingBooks, setReadingBooks] = useState<any[]>([]);
  const [wantToReadBooks, setWantToReadBooks] = useState<any[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedBooksRef = useRef(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
      } catch (loadError) {
        console.error('Error loading profile:', loadError);
      }
    };

    loadProfile();
  }, [user]);

  const fetchBooks = useCallback(async (showFullLoader = false) => {
    try {
      if (showFullLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const books = await getAllBooks();
      const { reading, wantToRead, finished } = splitBooksByStatus(books);

      setReadingBooks(reading);
      setWantToReadBooks(wantToRead);
      setFinishedBooks(finished);
      hasLoadedBooksRef.current = true;
    } catch (fetchError) {
      console.error('Book fetch error:', fetchError);
      const errorMsg = fetchError instanceof Error ? fetchError.message : JSON.stringify(fetchError);
      setError(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchBooks(!hasLoadedBooksRef.current);
      }
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
