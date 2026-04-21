import useNetworkStatus from '@/src/core/hooks/useNetworkStatus';
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

const STATUS_TO_DB_STATUS: Record<string, 'reading' | 'want_to_read' | 'finished'> = {
  Reading: 'reading',
  'Want to Read': 'want_to_read',
  Completed: 'finished',
};

function validateDraft(draft: ManualBookDraft): string | null {
  const trimmedPages = draft.totalPages.trim();

  if (!draft.title.trim()) {
    return 'Please enter a book title.';
  }
  if (!draft.author.trim()) {
    return 'Please enter an author name.';
  }
  if (!trimmedPages) {
    return 'Please enter total pages.';
  }

  if (!/^\d+$/.test(trimmedPages)) {
    return 'Total pages must contain numbers only.';
  }

  const pages = Number(trimmedPages);
  if (!Number.isInteger(pages) || pages <= 0) {
    return 'Please enter a valid number greater than 0 for total pages.';
  }

  return null;
}

export function useAddManualBook(user: User | null) {
  const { isOffline } = useNetworkStatus();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [status, setStatus] = useState('Reading');
  const [genre, setGenre] = useState('Fiction');
  const [isSaving, setIsSaving] = useState(false);

  const handleTotalPagesChange = useCallback((value: string) => {
    setTotalPages(value.replace(/\D/g, ''));
  }, []);

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
      const pages = Number(totalPages.trim());
      const dbGenre = genre.toLowerCase();
      const dbStatus = STATUS_TO_DB_STATUS[status] ?? 'reading';

      await addBook({
        title: title.trim(),
        author: author.trim(),
        totalPages: pages,
        genre: dbGenre,
        source: 'manual',
        status: dbStatus,
      }, {
        deferWriteAck: isOffline,
        ackTimeoutMs: isOffline ? 0 : 1800,
      });

      router.push({
        pathname: '/book-added-successfully',
        params: { bookTitle: title },
      });
    } catch (error) {
      showAlert('Error', error instanceof Error ? error.message : 'Failed to add book');
    } finally {
      setIsSaving(false);
    }
  }, [author, genre, isOffline, status, title, totalPages, user]);

  return {
    title,
    setTitle,
    author,
    setAuthor,
    totalPages,
    handleTotalPagesChange,
    status,
    setStatus,
    genre,
    setGenre,
    isSaving,
    handleAddBook,
  };
}
