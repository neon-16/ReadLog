import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { BookMarked, WifiOff } from 'lucide-react-native';

export default function Splash() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* App Icon Container */}
      <View style={styles.iconContainer}>
        <BookMarked size={64} color="#2563EB" strokeWidth={2} />
      </View>
      
      {/* App Name */}
      <Text style={styles.appName}>ReadLog</Text>
      
      {/* Tagline */}
      <Text style={styles.tagline}>TRACK YOUR JOURNEY</Text>
      
      {/* Offline Badge - Absolute Bottom */}
      <View style={styles.offlineBadge}>
        <WifiOff size={14} color="#9CA3AF" strokeWidth={2} />
        <Text style={styles.offlineText}>OFFLINE FIRST</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#DBEAFE',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 12,
    color: '#9CA3AF',
    letterSpacing: 3,
  },
  offlineBadge: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  offlineText: {
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 2,
  },
});
