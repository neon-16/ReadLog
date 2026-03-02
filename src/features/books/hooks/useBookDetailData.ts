import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import type { User } from 'firebase/auth';
import { deleteBook, getBookById, updateBookProgress } from '@/src/services/bookService';

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

  const handleSaveProgress = useCallback(async () => {
    if (!book) return;

    if (isOffline) {
      setError('Progress saving requires an internet connection');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const updatedBook = await updateBookProgress(book.id, {
        currentPage: parseInt(currentPage, 10) || 0,
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
    setCurrentPage,
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
