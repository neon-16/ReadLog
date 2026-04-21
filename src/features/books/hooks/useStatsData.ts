import useNetworkStatus from '@/src/core/hooks/useNetworkStatus';
import { useUserProfileData } from '@/src/features/auth/hooks/useUserProfileData';
import { getBookStats } from '@/src/services/bookService';
import { updateUserDisplayName } from '@/src/services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

type StatsCachePayload = {
  stats: StatsState;
  timestamp: number;
};

const STATS_CACHE_PREFIX = 'stats:cache:';

const getStatsCacheKey = (uid?: string) => `${STATS_CACHE_PREFIX}${uid || 'guest'}`;

function isStatsState(value: unknown): value is StatsState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const stats = value as Partial<StatsState>;
  return (
    typeof stats.total === 'number' &&
    typeof stats.reading === 'number' &&
    typeof stats.wantToRead === 'number' &&
    typeof stats.finished === 'number' &&
    typeof stats.readingGoal === 'number' &&
    typeof stats.goalProgress === 'number'
  );
}

const toTitleCaseName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export function useStatsData(user: User | null) {
  const { isOffline } = useNetworkStatus();
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
  const [usingCachedStats, setUsingCachedStats] = useState(false);
  const hasLoadedStatsRef = useRef(false);
  const statsRequestIdRef = useRef(0);

  const loadCachedStats = useCallback(async (requestId: number): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const raw = await AsyncStorage.getItem(getStatsCacheKey(user.uid));
      if (!raw || requestId !== statsRequestIdRef.current) {
        return false;
      }

      const parsed = JSON.parse(raw) as Partial<StatsCachePayload>;
      if (!isStatsState(parsed?.stats)) {
        return false;
      }

      setStats(parsed.stats);
      setStatsError(null);
      setUsingCachedStats(true);
      hasLoadedStatsRef.current = true;
      return true;
    } catch {
      return false;
    }
  }, [user]);

  const fetchStats = useCallback(async (showFullLoader = false) => {
    const requestId = ++statsRequestIdRef.current;

    try {
      if (showFullLoader) {
        setStatsLoading(true);
      }

      if (!user) {
        if (requestId === statsRequestIdRef.current) {
          setStatsLoading(false);
          setStatsError(null);
          setUsingCachedStats(false);
        }
        return;
      }

      if (isOffline) {
        const hasCachedStats = await loadCachedStats(requestId);
        if (requestId === statsRequestIdRef.current && !hasCachedStats) {
          setStatsError('You are offline and no cached stats are available yet.');
        }
        return;
      }

      setUsingCachedStats(false);
      setStatsError(null);

      const data = await getBookStats();
      if (requestId !== statsRequestIdRef.current) {
        return;
      }

      setStats(data);
      hasLoadedStatsRef.current = true;
      try {
        await AsyncStorage.setItem(
          getStatsCacheKey(user.uid),
          JSON.stringify({ stats: data, timestamp: Date.now() } satisfies StatsCachePayload)
        );
      } catch {
        // Ignore cache persistence failures and keep UI responsive.
      }
    } catch (fetchError) {
      const hasCachedStats = await loadCachedStats(requestId);
      if (requestId === statsRequestIdRef.current && !hasCachedStats) {
        setStatsError(fetchError instanceof Error ? fetchError.message : 'Failed to load stats');
      }
    } finally {
      if (requestId === statsRequestIdRef.current) {
        setStatsLoading(false);
      }
    }
  }, [isOffline, loadCachedStats, user]);

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
      // Keep save flow responsive; refresh profile in background.
      void refreshProfile();
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
    usingCachedStats,
    fetchStats,
    handleUpdateDisplayName,
  };
}
