import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

interface StatusSelectorProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  label?: string;
}

export default function StatusSelector({ selectedStatus, onStatusChange, label = 'Status' }: StatusSelectorProps) {
  const handleSelectStatus = () => {
    Alert.alert(
      'Select Status',
      'Choose the reading status for this book:',
      [
        { text: 'Reading', onPress: () => onStatusChange('Reading') },
        { text: 'Want to Read', onPress: () => onStatusChange('Want to Read') },
        { text: 'Completed', onPress: () => onStatusChange('Completed') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.button} onPress={handleSelectStatus}>
        <Text style={styles.buttonText}>{selectedStatus}</Text>
        <Text style={styles.dropdownIcon}>▾</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  button: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonText: {
    fontSize: 16,
    color: '#111827',
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
});
