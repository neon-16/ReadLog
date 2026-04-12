import { useAuth } from '@/src/features/auth/AuthContext';
import { clearAllBooks, updateAllBooksStatus } from '@/src/services/bookService';
import { runFirestoreConnectionCheck } from '@/src/services/firestoreConnectionCheck';
import type { DefaultBookStatus } from '@/src/services/userService';
import { getUserDefaultBookStatus, updateUserDefaultBookStatus } from '@/src/services/userService';
import { showAlert } from '@/utils/alert';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

const LABEL_TO_DB_STATUS: Record<string, DefaultBookStatus> = {
  'Want to Read': 'want_to_read',
  Completed: 'finished',
};

const DB_STATUS_TO_LABEL: Record<DefaultBookStatus, string> = {
  reading: 'Want to Read',
  want_to_read: 'Want to Read',
  finished: 'Completed',
};

export function useSettingsActions() {
  const [defaultStatus, setDefaultStatus] = useState('Want to Read');
  const [isUpdatingDefaultStatus, setIsUpdatingDefaultStatus] = useState(false);
  const [isCheckingFirestoreConnection, setIsCheckingFirestoreConnection] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function loadDefaultStatus() {
      if (!user?.uid) {
        return;
      }

      const savedStatus = await getUserDefaultBookStatus(user.uid);
      if (isMounted) {
        setDefaultStatus(DB_STATUS_TO_LABEL[savedStatus] ?? 'Want to Read');
      }
    }

    void loadDefaultStatus();

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  const handleDefaultStatusChange = useCallback((nextStatusLabel: string) => {
    if (isUpdatingDefaultStatus || nextStatusLabel === defaultStatus) {
      return;
    }

    if (!user?.uid) {
      showAlert('Error', 'You must be logged in to update settings.');
      return;
    }

    const dbStatus = LABEL_TO_DB_STATUS[nextStatusLabel] ?? 'want_to_read';

    showAlert(
      'Apply Status to All Books',
      `This will change every book in your library to "${nextStatusLabel}". Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          style: 'destructive',
          onPress: async () => {
            setIsUpdatingDefaultStatus(true);

            try {
              await Promise.all([
                updateAllBooksStatus(dbStatus),
                  updateUserDefaultBookStatus(user.uid, dbStatus),
              ]);
              setDefaultStatus(nextStatusLabel);
            } catch {
              showAlert('Error', 'Failed to update all book statuses. Please try again.');
            } finally {
              setIsUpdatingDefaultStatus(false);
            }
          },
        },
      ]
    );
  }, [defaultStatus, isUpdatingDefaultStatus, user?.uid]);

  const handleClearBooks = () => {
    showAlert(
      'Clear All Books',
      'This will permanently delete your entire reading history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllBooks();
              router.push('/data-cleared');
            } catch {
              showAlert('Error', 'Failed to clear books. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    showAlert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleFirestoreConnectionCheck = useCallback(async () => {
    if (isCheckingFirestoreConnection) {
      return;
    }

    if (!user?.uid) {
      showAlert('Not Logged In', 'Please sign in before running Firestore check.');
      return;
    }

    setIsCheckingFirestoreConnection(true);
    try {
      const result = await runFirestoreConnectionCheck(user.uid);
      showAlert(
        'Firestore Connected',
        `Write and read succeeded. New test book id: ${result.newBookId}. Fetched ${result.books.length} books.`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Firestore error';
      showAlert('Firestore Check Failed', message);
    } finally {
      setIsCheckingFirestoreConnection(false);
    }
  }, [isCheckingFirestoreConnection, user?.uid]);

  return {
    defaultStatus,
    handleDefaultStatusChange,
    isUpdatingDefaultStatus,
    isCheckingFirestoreConnection,
    handleClearBooks,
    handleFirestoreConnectionCheck,
    handleSignOut,
  };
}
