import { addBook } from '@/src/services/bookService';
import { showAlert } from '@/utils/alert';
import { router } from 'expo-router';
import type { User } from 'firebase/auth';
import { useCallback, useState } from 'react';

export function useAddManualBook(user: User | null) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [status, setStatus] = useState('Reading');
  const [genre, setGenre] = useState('Fiction');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddBook = useCallback(async () => {
    if (!title.trim()) {
      showAlert('Validation Error', 'Please enter a book title.');
      return;
    }
    if (!author.trim()) {
      showAlert('Validation Error', 'Please enter an author name.');
      return;
    }
    if (!totalPages.trim()) {
      showAlert('Validation Error', 'Please enter total pages.');
      return;
    }

    if (!user) {
      showAlert('Error', 'You must be logged in to add books');
      return;
    }

    setIsSaving(true);
    try {
      const pages = parseInt(totalPages, 10);
      if (isNaN(pages) || pages < 0) {
        showAlert('Validation Error', 'Please enter a valid number for total pages.');
        setIsSaving(false);
        return;
      }

      const dbGenre = genre.toLowerCase();

      await addBook({
        title: title.trim(),
        author: author.trim(),
        totalPages: pages,
        genre: dbGenre,
        source: 'manual',
      });

      router.push({
        pathname: '/book-added-successfully',
        params: { bookTitle: title },
      });
    } catch (error) {
      console.error('Error adding book:', error);
      showAlert('Error', error instanceof Error ? error.message : 'Failed to add book');
    } finally {
      setIsSaving(false);
    }
  }, [author, genre, title, totalPages, user]);

  return {
    title,
    setTitle,
    author,
    setAuthor,
    totalPages,
    setTotalPages,
    status,
    setStatus,
    genre,
    setGenre,
    isSaving,
    handleAddBook,
  };
}
