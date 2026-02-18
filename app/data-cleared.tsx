import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { CheckCheck } from 'lucide-react-native';

export default function DataCleared() {
  return (
    <View style={styles.container}>
      {/* Icon Container */}
      <View style={styles.outerCircle}>
        <View style={styles.innerCircle}>
          <CheckCheck size={36} color="#FFFFFF" strokeWidth={2} />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Data Cleared!</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        All books and reading progress have been successfully removed.
      </Text>

      {/* Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Text style={styles.primaryButtonText}>Go to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  outerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  innerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
    marginTop: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
