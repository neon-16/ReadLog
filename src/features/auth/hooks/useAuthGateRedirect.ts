import { useAuth } from '@/src/features/auth/AuthContext';
import { router, useRootNavigationState, useSegments } from 'expo-router';
import { useEffect } from 'react';

export function useAuthGateRedirect() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || loading) return;

    const firstSegment = segments[0] as string;
    const isAuthScreen = firstSegment === 'login' || firstSegment === 'signup';
    const isPasswordResetScreen = firstSegment === 'reset-password';
    const isPublicScreen =
      firstSegment === 'index' ||
      firstSegment === 'landing' ||
      firstSegment === 'splash' ||
      isAuthScreen ||
      isPasswordResetScreen;

    if (!user && !isPublicScreen) {
      router.replace('/login');
      return;
    }

    if (user && (isAuthScreen || firstSegment === 'index' || firstSegment === 'splash')) {
      router.replace('/(tabs)/home');
    }
  }, [loading, navigationState?.key, segments, user]);
}
