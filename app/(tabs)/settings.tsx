import { useSettingsActions } from '@/src/features/settings/hooks/useSettingsActions';
import { BookOpen, Database, Info, LogOut, Trash2 } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/shared/Button';
import { showActionSheet } from '../../utils/alert';

function StatusSelector({ selectedStatus, onStatusChange }: { selectedStatus: string; onStatusChange: (status: string) => void }) {
  const handleSelectStatus = () => {
    showActionSheet(
      'Default Book Status',
      'Choose the default status for new books:',
      [
        { text: 'Want to Read', onPress: () => onStatusChange('Want to Read') },
        { text: 'Completed', onPress: () => onStatusChange('Completed') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <Pressable style={styles.statusSelector} onPress={handleSelectStatus}>
      <Text style={styles.label}>Default Book Status</Text>
      <View style={styles.statusValueContainer}>
        <Text style={styles.statusValue}>{selectedStatus}</Text>
        <Text style={styles.dropdownIcon}>▾</Text>
      </View>
    </Pressable>
  );
}

export default function Settings() {
  const {
    defaultStatus,
    handleDefaultStatusChange,
    isCheckingFirestoreConnection,
    handleClearBooks,
    handleFirestoreConnectionCheck,
    handleSignOut,
  } = useSettingsActions();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BookOpen size={14} color="#2563EB" strokeWidth={2} />
            <Text style={styles.sectionTitle}>READING PREFERENCES</Text>
          </View>
          <View style={styles.sectionContent}>
            <StatusSelector selectedStatus={defaultStatus} onStatusChange={handleDefaultStatusChange} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={14} color="#2563EB" strokeWidth={2} />
            <Text style={styles.sectionTitle}>DATA</Text>
          </View>
          <View style={styles.sectionContent}>
            <Button
              variant="secondary"
              onPress={handleFirestoreConnectionCheck}
              disabled={isCheckingFirestoreConnection}
              icon={<Database size={18} color="#2563EB" />}
              style={styles.checkButton}
            >
              {isCheckingFirestoreConnection ? 'Checking Firestore...' : 'Run Firestore Connection Check'}
            </Button>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Clearing all books will permanently delete your reading history. This action cannot be undone.
              </Text>
            </View>
            <Button variant="danger" onPress={handleClearBooks} icon={<Trash2 size={18} color="#DC2626"/>}>
              Clear All Books
            </Button>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={14} color="#2563EB" strokeWidth={2} />
            <Text style={styles.sectionTitle}>ABOUT</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.appInfoRow}>
              <View style={styles.appInfoLeft}>
                <View style={styles.appIcon}>
                  <BookOpen size={20} color="#FFFFFF" strokeWidth={2} />
                </View>
                <Text style={styles.appName}>ReadLog</Text>
              </View>
              <Text style={styles.appVersion}>v1.0.0</Text>
            </View>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>
                ReadLog is an offline-first reading companion app that helps you track your reading journey and build better reading habits.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <Button variant="secondary" onPress={handleSignOut} icon={<LogOut size={18} color="#2563EB"/>}>
              Sign Out
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  statusValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2563EB',
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#2563EB',
  },
  warningBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  checkButton: {
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  appInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  descriptionBox: {
    marginVertical: 16,
    paddingVertical: 8,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
  },
});
