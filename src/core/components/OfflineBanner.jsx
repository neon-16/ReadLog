import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import useNetworkStatus from '../hooks/useNetworkStatus';

export default function OfflineBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <View style={styles.container}>
      <WifiOff size={16} color="#D97706" strokeWidth={2} />
      <Text style={styles.text}>
        You are offline. Showing cached data.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: '#92400E',
    fontSize: 13,
  },
});
