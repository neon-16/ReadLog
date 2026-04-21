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
const profileListeners = new Map<string, Set<(profile: UserProfile | null) => void>>();

function emitProfileUpdate(uid: string, profile: UserProfile | null) {
  const listeners = profileListeners.get(uid);
  if (!listeners) {
    return;
  }

  for (const listener of listeners) {
    listener(profile);
  }
}

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

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const listeners = profileListeners.get(user.uid) || new Set<(profile: UserProfile | null) => void>();
    const listener = (nextProfile: UserProfile | null) => {
      setProfile(nextProfile);
      setProfileLoading(false);
    };

    listeners.add(listener);
    profileListeners.set(user.uid, listeners);

    return () => {
      const existing = profileListeners.get(user.uid);
      if (!existing) {
        return;
      }

      existing.delete(listener);
      if (existing.size === 0) {
        profileListeners.delete(user.uid);
      }
    };
  }, [user?.uid]);

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
        emitProfileUpdate(user.uid, normalizedProfile);
      }
    } catch {
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
      emitProfileUpdate(user.uid, nextProfile);
    }
  }, [user]);

  return {
    profile,
    profileLoading,
    refreshProfile,
    updateProfileLocally,
  };
}
