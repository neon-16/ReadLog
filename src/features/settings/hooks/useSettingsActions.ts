import { router } from 'expo-router';
import { useState } from 'react';
import { showAlert } from '@/utils/alert';
import { useAuth } from '@/src/features/auth/AuthContext';
import { clearAllBooks } from '@/src/services/bookService';

export function useSettingsActions() {
  const [defaultStatus, setDefaultStatus] = useState('Reading');
  const { signOut } = useAuth();

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

  return {
    defaultStatus,
    setDefaultStatus,
    handleClearBooks,
    handleSignOut,
  };
}
