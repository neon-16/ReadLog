import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export default function useNetworkStatus() {
  // Keep initial value stable between SSR and client hydration to avoid mismatch.
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const updateOnlineStatus = () => setIsOnline(navigator.onLine);

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      updateOnlineStatus();

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    }

    const unsubscribe = NetInfo.addEventListener(state => {
      if (typeof state.isInternetReachable === 'boolean') {
        setIsOnline(state.isInternetReachable);
        return;
      }

      if (typeof state.isConnected === 'boolean') {
        setIsOnline(state.isConnected);
        return;
      }

      setIsOnline(true);
    });

    return () => unsubscribe();
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
  };
}
