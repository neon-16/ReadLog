import { deleteBook, getBookById, updateBookProgress } from '@/src/services/bookService';
import { router } from 'expo-router';
import type { User } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';

type UseBookDetailDataParams = {
  user: User | null;
  bookId: string;
  isOffline: boolean;
};

export interface BookData {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: string;
  progress: number;
  genre: string;
}

export function useBookDetailData({ user, bookId, isOffline }: UseBookDetailDataParams) {
  const [book, setBook] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('');
  const [status, setStatus] = useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      if (!user || !bookId) {
        setLoading(false);
        setError('Book ID not found');
        return;
      }

      try {
        setLoading(true);
        const foundBook = await getBookById(bookId);

        if (!foundBook) {
          setError('Book not found');
          return;
        }

        setBook(foundBook);
        setCurrentPage(foundBook.currentPage.toString());
        setStatus(foundBook.status);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [user, bookId]);

  const handleCurrentPageChange = useCallback((value: string) => {
    const digitsOnly = value.replace(/\D/g, '');

    if (!digitsOnly) {
      setCurrentPage('');
      setError(null);
      return;
    }

    const parsedPage = parseInt(digitsOnly, 10);
    const maxPages = book?.totalPages ?? Number.MAX_SAFE_INTEGER;
    const normalizedPage = Math.min(Math.max(parsedPage, 1), maxPages);

    setCurrentPage(String(normalizedPage));
    setError(null);
  }, [book?.totalPages]);

  const handleSaveProgress = useCallback(async () => {
    if (!book) return;

    if (isOffline) {
      setError('Progress saving requires an internet connection');
      return;
    }

    try {
      if (!currentPage) {
        setError(`Current page must be between 1 and ${book.totalPages}`);
        return;
      }

      const parsedPage = parseInt(currentPage, 10);
      if (Number.isNaN(parsedPage) || parsedPage < 1 || parsedPage > book.totalPages) {
        setError(`Current page must be between 1 and ${book.totalPages}`);
        return;
      }

      setSaving(true);
      setError(null);
      const updatedBook = await updateBookProgress(book.id, {
        currentPage: parsedPage,
        totalPages: book.totalPages,
      });
      setBook(updatedBook);
      setCurrentPage(String(updatedBook.currentPage));
      setStatus(updatedBook.status);
      router.push({
        pathname: '/progress-saved',
        params: { bookTitle: book.title },
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save progress');
    } finally {
      setSaving(false);
    }
  }, [book, currentPage, isOffline]);

  const handleDeleteBook = useCallback(() => {
    setIsDeleteModalVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!book) return;

    try {
      setSaving(true);
      setError(null);
      await deleteBook(book.id);
      setIsDeleteModalVisible(false);
      router.push({
        pathname: '/book-deleted-successfully',
        params: { bookTitle: book.title },
      });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete book');
      setIsDeleteModalVisible(false);
    } finally {
      setSaving(false);
    }
  }, [book]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalVisible(false);
  }, []);

  return {
    book,
    loading,
    currentPage,
    handleCurrentPageChange,
    status,
    isDeleteModalVisible,
    saving,
    error,
    handleSaveProgress,
    handleDeleteBook,
    handleConfirmDelete,
    handleCancelDelete,
  };
}
