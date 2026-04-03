import { getBookStats } from '@/src/services/bookService';
import {
    createInitialUserProfile,
    getUserProfile,
    updateUserDisplayName,
    type UserProfile,
} from '@/src/services/userService';
import { useFocusEffect } from 'expo-router';
import type { User } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';

type StatsState = {
  total: number;
  reading: number;
  wantToRead: number;
  finished: number;
  readingGoal: number;
  goalProgress: number;
};

export function useStatsData(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [stats, setStats] = useState<StatsState>({
    total: 0,
    reading: 0,
    wantToRead: 0,
    finished: 0,
    readingGoal: 24,
    goalProgress: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const hasLoadedStatsRef = useRef(false);
  const statsRequestIdRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user) {
        if (isMounted) {
          setProfileLoading(false);
        }
        return;
      }

      try {
        let userProfile = await getUserProfile(user.uid);

        if (!userProfile) {
          await createInitialUserProfile(user.uid, user.email || 'User');
          userProfile = await getUserProfile(user.uid);
        }

        if (isMounted) {
          setProfile(userProfile);
        }
      } catch (loadError) {
        console.error('Error loading profile:', loadError);
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const fetchStats = useCallback(async (showFullLoader = false) => {
    const requestId = ++statsRequestIdRef.current;

    try {
      if (showFullLoader) {
        setStatsLoading(true);
      }
      setStatsError(null);
      const data = await getBookStats();
      if (requestId !== statsRequestIdRef.current) {
        return;
      }

      setStats(data);
      hasLoadedStatsRef.current = true;
    } catch (fetchError) {
      if (requestId === statsRequestIdRef.current) {
        setStatsError(fetchError instanceof Error ? fetchError.message : 'Failed to load stats');
      }
    } finally {
      if (requestId === statsRequestIdRef.current) {
        setStatsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchStats(!hasLoadedStatsRef.current);
      }

      return () => {
        statsRequestIdRef.current += 1;
      };
    }, [fetchStats, user])
  );

  const handleUpdateDisplayName = useCallback(async (newDisplayName: string) => {
    if (!user) return;

    setSavingProfile(true);
    try {
      await updateUserDisplayName(user.uid, newDisplayName);
      setProfile((prev) => (prev ? { ...prev, displayName: newDisplayName } : null));
    } finally {
      setSavingProfile(false);
    }
  }, [user]);

  return {
    profile,
    profileLoading,
    savingProfile,
    stats,
    statsLoading,
    statsError,
    fetchStats,
    handleUpdateDisplayName,
  };
}
