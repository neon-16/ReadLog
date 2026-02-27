import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface StatusSelectorProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  label?: string;
}

const STATUS_OPTIONS = ['Reading', 'Want to Read', 'Completed'];

export default function StatusSelector({ selectedStatus, onStatusChange, label = 'Status' }: StatusSelectorProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelectStatus = (status: string) => {
    onStatusChange(status);
    setIsModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Pressable style={styles.button} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.buttonText}>{selectedStatus}</Text>
          <Text style={styles.dropdownIcon}>▾</Text>
        </Pressable>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Status</Text>
            {STATUS_OPTIONS.map((status) => (
              <Pressable
                key={status}
                style={[
                  styles.statusOption,
                  selectedStatus === status && styles.statusOptionSelected,
                ]}
                onPress={() => handleSelectStatus(status)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedStatus === status && styles.statusOptionTextSelected,
                  ]}
                >
                  {status}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  statusOptionSelected: {
    backgroundColor: '#DBEAFE',
  },
  statusOptionText: {
    fontSize: 16,
    color: '#111827',
  },
  statusOptionTextSelected: {
    fontWeight: '600',
    color: '#2563EB',
  },
  closeButton: {
    height: 48,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
