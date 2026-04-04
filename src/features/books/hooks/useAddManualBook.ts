import { addBook } from '@/src/services/bookService';
import { showAlert } from '@/utils/alert';
import { router } from 'expo-router';
import type { User } from 'firebase/auth';
import { useCallback, useState } from 'react';

type ManualBookDraft = {
  title: string;
  author: string;
  totalPages: string;
};

function validateDraft(draft: ManualBookDraft): string | null {
  if (!draft.title.trim()) {
    return 'Please enter a book title.';
  }
  if (!draft.author.trim()) {
    return 'Please enter an author name.';
  }
  if (!draft.totalPages.trim()) {
    return 'Please enter total pages.';
  }

  const pages = parseInt(draft.totalPages, 10);
  if (Number.isNaN(pages) || pages < 0) {
    return 'Please enter a valid number for total pages.';
  }

  return null;
}

export function useAddManualBook(user: User | null) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [status, setStatus] = useState('Reading');
  const [genre, setGenre] = useState('Fiction');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddBook = useCallback(async () => {
    const validationError = validateDraft({ title, author, totalPages });
    if (validationError) {
      showAlert('Validation Error', validationError);
      return;
    }

    if (!user) {
      showAlert('Error', 'You must be logged in to add books');
      return;
    }

    setIsSaving(true);
    try {
      const pages = parseInt(totalPages, 10);
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
