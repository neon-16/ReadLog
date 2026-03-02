import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { showAlert } from '@/utils/alert';
import useNetworkStatus from '@/src/core/hooks/useNetworkStatus';
import { addBook } from '@/src/services/bookService';
import { searchOnlineBooks } from '@/src/services/bookSearchService';

const DEBOUNCE_DELAY = 500;
const MIN_SEARCH_LENGTH = 2;

export function useDiscoverBooks(user: User | null) {
  const { isOffline } = useNetworkStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setSearchError(null);
      setHasSearched(false);
      return;
    }

    if (isOffline) {
      setSearchError('Search requires an internet connection');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const results = await searchOnlineBooks(query);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No books found. Try a different search.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      setSearchError(message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [isOffline]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim().length === 0) {
      setSearchResults([]);
      setSearchError(null);
      setHasSearched(false);
      return;
    }

    if (query.trim().length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setSearchError(null);
      setHasSearched(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, DEBOUNCE_DELAY);
  }, [performSearch]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleAddBook = useCallback(async (book: any) => {
    if (!user) {
      showAlert('Error', 'You must be logged in to add books');
      return;
    }

    await addBook({
      title: book.title,
      author: book.author,
      totalPages: book.totalPages || 300,
      genre: book.genre,
      source: 'online',
    });
  }, [user]);

  return {
    isOffline,
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    hasSearched,
    handleSearch,
    handleAddBook,
  };
}
