import {
    createInitialUserProfile,
    getUserProfile,
    type UserProfile,
} from '@/src/services/userService';
import type { User } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';

type UseUserProfileDataOptions = {
  createIfMissing?: boolean;
};

type CachedProfile = {
  profile: UserProfile | null;
  timestamp: number;
};

const PROFILE_CACHE_TTL_MS = 60 * 1000;
const profileCache = new Map<string, CachedProfile>();

function isFresh(cacheEntry: CachedProfile | undefined): boolean {
  if (!cacheEntry) {
    return false;
  }
  return Date.now() - cacheEntry.timestamp < PROFILE_CACHE_TTL_MS;
}

export function useUserProfileData(user: User | null, options: UseUserProfileDataOptions = {}) {
  const { createIfMissing = false } = options;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const requestIdRef = useRef(0);

  const loadProfile = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!user) {
      if (requestId === requestIdRef.current) {
        setProfile(null);
        setProfileLoading(false);
      }
      return;
    }

    const cacheEntry = profileCache.get(user.uid);
    if (isFresh(cacheEntry)) {
      if (requestId === requestIdRef.current) {
        setProfile(cacheEntry?.profile ?? null);
        setProfileLoading(false);
      }
      return;
    }

    if (requestId === requestIdRef.current) {
      setProfileLoading(true);
    }

    try {
      let userProfile = await getUserProfile(user.uid);

      if (!userProfile && createIfMissing) {
        await createInitialUserProfile(user.uid, user.email || 'User');
        userProfile = await getUserProfile(user.uid);
      }

      const normalizedProfile = userProfile ?? null;
      if (requestId === requestIdRef.current) {
        setProfile(normalizedProfile);
        profileCache.set(user.uid, { profile: normalizedProfile, timestamp: Date.now() });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      if (requestId === requestIdRef.current) {
        setProfile(null);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setProfileLoading(false);
      }
    }
  }, [createIfMissing, user]);

  useEffect(() => {
    loadProfile();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      profileCache.delete(user.uid);
    }
    await loadProfile();
  }, [loadProfile, user]);

  const updateProfileLocally = useCallback((nextProfile: UserProfile | null) => {
    setProfile(nextProfile);
    if (user) {
      profileCache.set(user.uid, { profile: nextProfile, timestamp: Date.now() });
    }
  }, [user]);

  return {
    profile,
    profileLoading,
    refreshProfile,
    updateProfileLocally,
  };
}
