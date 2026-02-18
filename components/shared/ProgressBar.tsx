import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export default function ProgressBar({ current, total, showLabel = false }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <View>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>Reading progress</Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      )}
      <View style={styles.container}>
        <View style={styles.background}>
          <View style={[styles.fill, { width: `${percentage}%` }]} />
        </View>
        {!showLabel && <Text style={styles.percentageText}>{percentage}%</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  background: {
    flex: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
    width: 45,
    textAlign: 'right',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
});
