import { router } from 'expo-router';
import { BookMarked } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Landing() {
  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.card}>
        <View style={styles.brandRow}>
          <View style={styles.logoWrap}>
            <BookMarked size={20} color="#2563EB" strokeWidth={2.5} />
          </View>
          <Text style={styles.brandTitle}>ReadLog</Text>
        </View>

        <Text style={styles.kicker}>READING TRACKER</Text>
        <Text style={styles.title}>Track Books You Love</Text>
        <Text style={styles.subtitle}>
          Keep your reading list, log progress, and stay consistent with your reading goals.
        </Text>

        <View style={styles.actions}>
          <Pressable onPress={() => router.push('/login')} style={[styles.button, styles.primaryButton]}>
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Get Started</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/login')} style={[styles.button, styles.secondaryButton]}>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: -140,
    right: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#1D4ED8',
    opacity: 0.22,
    pointerEvents: 'none',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -180,
    left: -120,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: '#0EA5E9',
    opacity: 0.16,
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: 760,
    backgroundColor: 'rgba(15, 23, 42, 0.74)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    paddingVertical: 42,
    paddingHorizontal: 34,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  logoWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
  },
  kicker: {
    color: '#93C5FD',
    letterSpacing: 2,
    fontSize: 12,
    marginBottom: 14,
    fontWeight: '700',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '800',
    maxWidth: 560,
    marginBottom: 14,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 620,
    marginBottom: 28,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  button: {
    minWidth: 140,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryButtonText: {
    color: '#E2E8F0',
  },
});
