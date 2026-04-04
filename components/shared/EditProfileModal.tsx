import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import Input from './Input';

interface EditProfileModalProps {
  visible: boolean;
  displayName: string;
  onClose: () => void;
  onSave: (newDisplayName: string) => Promise<void>;
  isLoading?: boolean;
}

export default function EditProfileModal({
  visible,
  displayName,
  onClose,
  onSave,
  isLoading = false,
}: EditProfileModalProps) {
  const [newDisplayName, setNewDisplayName] = useState(displayName);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setNewDisplayName(displayName);
      setError('');
    }
  }, [displayName, visible]);

  const handleSave = async () => {
    setError('');

    if (!newDisplayName.trim()) {
      setError('Display name cannot be empty.');
      return;
    }

    try {
      await onSave(newDisplayName.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.overlayBackdrop} onPress={onClose} />
        <View style={styles.modalContent}>
          <Text style={styles.title}>Edit Profile</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Input
              label="Display Name"
              placeholder="Enter your display name"
              value={newDisplayName}
              onChangeText={setNewDisplayName}
              editable={!isLoading}
            />

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.buttonRow}>
              <Button
                variant="cancel"
                onPress={onClose}
                disabled={isLoading}
                style={styles.actionButton}
                textStyle={styles.actionButtonText}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={handleSave}
                disabled={isLoading}
                style={styles.actionButton}
                textStyle={styles.actionButtonText}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  actionButtonText: {
    fontSize: 15,
  },
});
