import { router, useLocalSearchParams } from 'expo-router';
import { RefreshCw } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function StatusUpdated() {
  const { bookTitle = 'Your Book', newStatus = 'updated' } = useLocalSearchParams<{ 
    bookTitle?: string; 
    newStatus?: string;
  }>();

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'reading':
        return 'Reading';
      case 'want_to_read':
        return 'Want to Read';
      case 'finished':
        return 'Finished';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      {/* Icon Container */}
      <View style={styles.outerCircle}>
        <View style={styles.innerCircle}>
          <RefreshCw size={36} color="#FFFFFF" strokeWidth={2} />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Status Updated!</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        <Text style={styles.boldBlue}>{bookTitle}</Text>
        {'\n'}status changed to{'\n'}
        <Text style={styles.boldBlue}>{getStatusDisplay(newStatus)}</Text>
      </Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.dismissTo('/(tabs)/home')}
        >
          <Text style={styles.primaryButtonText}>Go to Home</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>View Book Details</Text>
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
  boldBlue: {
    fontWeight: 'bold',
    color: '#2563EB',
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
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
});
