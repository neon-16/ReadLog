import { router, useLocalSearchParams } from 'expo-router';
import { CheckCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function BookAddedSuccessfully() {
  const { bookTitle = 'Your Book' } = useLocalSearchParams<{ bookTitle?: string }>();

  return (
    <View style={styles.container}>
      {/* Icon Container */}
      <View style={styles.outerCircle}>
        <View style={styles.innerCircle}>
          <CheckCheck size={36} color="#FFFFFF" strokeWidth={2} />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Book Saved!</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        <Text style={styles.boldBlue}>{bookTitle}</Text>
        {'\n'}has been successfully{'\n'}saved to your reading shelf.
      </Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Text style={styles.primaryButtonText}>Go to Home</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Add Another Book</Text>
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
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  innerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  boldBlue: {
    fontWeight: '600',
    color: '#2563EB',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
});
