import { useEffect } from 'react';
import { router, type Href } from 'expo-router';
import type { User } from 'firebase/auth';

export function useSplashRedirect(user: User | null, loading: boolean) {
  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      router.replace((user ? '/(tabs)/home' : '/login') as Href);
    }, 350);

    return () => clearTimeout(timer);
  }, [loading, user]);
}
