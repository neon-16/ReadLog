import useNetworkStatus from '@/src/core/hooks/useNetworkStatus';
import { searchOnlineBooks } from '@/src/services/bookSearchService';
import { addBook } from '@/src/services/bookService';
import { showAlert } from '@/utils/alert';
import type { User } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';

const DEBOUNCE_DELAY = 500;
const MIN_SEARCH_LENGTH = 2;
const SEARCH_PAGE_SIZE = 15;
const CACHE_TTL_MS = 60 * 1000;

type SearchResultItem = {
  title: string;
  author: string;
  genre: string;
  source: string;
  externalId?: string;
  year?: number;
  coverId?: number;
  coverUrl?: string | null;
  isbn?: string;
  totalPages?: number;
};

type CacheEntry = {
  items: SearchResultItem[];
  hasMore: boolean;
  timestamp: number;
};

export function useDiscoverBooks(user: User | null) {
  const { isOffline } = useNetworkStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const activeRequestIdRef = useRef(0);

  const clearSearchState = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
    setHasSearched(false);
    setHasMore(false);
    setCurrentPage(1);
  }, []);

  const isCacheValid = useCallback((entry: CacheEntry | undefined) => {
    if (!entry) {
      return false;
    }
    return Date.now() - entry.timestamp < CACHE_TTL_MS;
  }, []);

  const performSearch = useCallback(async (query: string, page = 1) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length < MIN_SEARCH_LENGTH) {
      clearSearchState();
      return;
    }

    if (isOffline) {
      setSearchError('Search requires an internet connection');
      return;
    }

    const cacheKey = `${normalizedQuery}:${page}`;
    const cached = cacheRef.current.get(cacheKey);
    if (isCacheValid(cached)) {
      setHasSearched(true);
      setSearchError(null);
      setCurrentPage(page);
      setHasMore(!!cached?.hasMore);
      setSearchResults((prev) => (page === 1 ? (cached?.items || []) : [...prev, ...(cached?.items || [])]));
      return;
    }

    const requestId = ++activeRequestIdRef.current;

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const { books, hasMore: hasNextPage } = await searchOnlineBooks(normalizedQuery, {
        page,
        pageSize: SEARCH_PAGE_SIZE,
      });

      if (requestId !== activeRequestIdRef.current) {
        return;
      }

      cacheRef.current.set(cacheKey, {
        items: books,
        hasMore: hasNextPage,
        timestamp: Date.now(),
      });

      setSearchResults((prev) => (page === 1 ? books : [...prev, ...books]));
      setCurrentPage(page);
      setHasMore(hasNextPage);

      if (page === 1 && books.length === 0) {
        setSearchError('No books found. Try a different search.');
      }
    } catch (error) {
      if (requestId !== activeRequestIdRef.current) {
        return;
      }
      const message = error instanceof Error ? error.message : 'Search failed';
      setSearchError(message);
      if (page === 1) {
        setSearchResults([]);
      }
    } finally {
      if (requestId === activeRequestIdRef.current) {
        setIsSearching(false);
      }
    }
  }, [clearSearchState, isCacheValid, isOffline]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim().length === 0) {
      clearSearchState();
      return;
    }

    if (query.trim().length < MIN_SEARCH_LENGTH) {
      clearSearchState();
      return;
    }

    setCurrentPage(1);
    debounceTimerRef.current = setTimeout(() => {
      performSearch(query, 1);
    }, DEBOUNCE_DELAY);
  }, [clearSearchState, performSearch]);

  const loadNextPage = useCallback(async () => {
    if (isSearching || !hasMore || searchQuery.trim().length < MIN_SEARCH_LENGTH) {
      return;
    }

    await performSearch(searchQuery, currentPage + 1);
  }, [currentPage, hasMore, isSearching, performSearch, searchQuery]);

  const resetDiscoverState = useCallback(() => {
    activeRequestIdRef.current += 1;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setSearchQuery('');
    clearSearchState();
    setIsSearching(false);
  }, [clearSearchState]);

  useEffect(() => {
    return () => {
      activeRequestIdRef.current += 1;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleAddBook = useCallback(async (book: SearchResultItem) => {
    if (!user) {
      showAlert('Error', 'You must be logged in to add books');
      return;
    }

    await addBook({
      title: book?.title?.trim?.() || 'Untitled',
      author: book?.author?.trim?.() || 'Unknown Author',
      totalPages: book?.totalPages || 300,
      genre: book?.genre || 'other',
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
    hasMore,
    handleSearch,
    resetDiscoverState,
    loadNextPage,
    handleAddBook,
  };
}
