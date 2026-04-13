import { useUserProfileData } from '@/src/features/auth/hooks/useUserProfileData';
import { getBookStats } from '@/src/services/bookService';
import { updateUserDisplayName } from '@/src/services/userService';
import { useFocusEffect } from 'expo-router';
import type { User } from 'firebase/auth';
import { useCallback, useRef, useState } from 'react';

type StatsState = {
  total: number;
  reading: number;
  wantToRead: number;
  finished: number;
  readingGoal: number;
  goalProgress: number;
};

const toTitleCaseName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export function useStatsData(user: User | null) {
  const {
    profile,
    profileLoading,
    refreshProfile,
    updateProfileLocally,
  } = useUserProfileData(user, { createIfMissing: true });
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

    const normalizedDisplayName = toTitleCaseName(newDisplayName);

    setSavingProfile(true);
    try {
      await updateUserDisplayName(user.uid, normalizedDisplayName, user.email || '');
      updateProfileLocally({
        displayName: normalizedDisplayName,
        email: profile?.email || user.email || '',
      });
      await refreshProfile();
    } finally {
      setSavingProfile(false);
    }
  }, [profile?.email, refreshProfile, updateProfileLocally, user]);

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
