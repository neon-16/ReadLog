import { useEffect } from 'react';
import { router, useRootNavigationState, useSegments } from 'expo-router';
import { useAuth } from '@/src/features/auth/AuthContext';

export function useAuthGateRedirect() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || loading) return;

    const firstSegment = segments[0] as string;
    const isAuthScreen = firstSegment === 'login' || firstSegment === 'signup';
    const isPublicScreen = firstSegment === 'index' || firstSegment === 'splash' || isAuthScreen;

    if (!user && !isPublicScreen) {
      router.replace('/login');
      return;
    }

    if (user && (isAuthScreen || firstSegment === 'index' || firstSegment === 'splash')) {
      router.replace('/(tabs)/home');
    }
  }, [loading, navigationState?.key, segments, user]);
}
