import OfflineBanner from '@/src/core/components/OfflineBanner';
import useNetworkStatus from '@/src/core/hooks/useNetworkStatus';
import { useAuth } from '@/src/features/auth/AuthContext';
import { useBookDetailData } from '@/src/features/books/hooks/useBookDetailData';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Save, Trash2 } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import BookCover from '../components/shared/BookCover';
import Button from '../components/shared/Button';
import DeleteModal from '../components/shared/DeleteModal';
import ProgressBar from '../components/shared/ProgressBar';

export default function BookDetail() {
  const { isOffline } = useNetworkStatus();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const bookId = params.bookId as string;

  const {
    book,
    loading,
    currentPage,
    handleCurrentPageChange,
    status,
    isDeleteModalVisible,
    saving,
    error,
    handleSaveProgress,
    handleDeleteBook,
    handleConfirmDelete,
    handleCancelDelete,
  } = useBookDetailData({ user, bookId, isOffline });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  if (!book || error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={{ color: '#EF4444', marginBottom: 16, fontSize: 16 }}>
            {error || 'Book not found'}
          </Text>
          <Pressable onPress={() => router.back()} style={styles.errorBackButton}>
            <Text style={styles.errorBackButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#2563EB" strokeWidth={2} />
        </Pressable>

        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Book Detail</Text>
        </View>

        <View style={styles.coverContainer}>
          <BookCover genre={book.genre} size="large" />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>by {book.author}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              Status: {status === 'reading' ? 'Reading' : status === 'want_to_read' ? 'Want to Read' : status === 'finished' ? 'Finished' : status}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.statusText}>
              {status === 'reading' ? 'Reading' : status === 'want_to_read' ? 'Want to Read' : status === 'finished' ? 'Finished' : status}
            </Text>
            {status === 'finished' && (
              <Text style={styles.completedBadge}>Completed ✓</Text>
            )}
          </View>
          {status === 'want_to_read' && (
            <Text style={styles.hintText}>
              Status updates automatically when you save page progress
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <ProgressBar 
            current={status === 'finished' ? book.totalPages : status === 'want_to_read' ? 0 : parseInt(currentPage)} 
            total={book.totalPages} 
          />
          <Text style={styles.pageText}>
            {status === 'finished' ? `Completed: ${book.totalPages} pages` : 
             status === 'want_to_read' ? '0 pages' : 
             `Page ${currentPage} of ${book.totalPages}`}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.inputLabel}>Update Current Page</Text>
          <TextInput
            style={styles.textInput}
            value={currentPage}
            onChangeText={handleCurrentPageChange}
            keyboardType="number-pad"
            placeholder="1"
            editable
          />
        </View>

        {error && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}

        <View style={styles.buttonsContainer}>
          <Button 
            variant="primary" 
            onPress={handleSaveProgress} 
            icon={saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Save size={18} color="#FFFFFF" strokeWidth={2} />}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Progress'}
          </Button>
          <Button 
            variant="danger" 
            onPress={handleDeleteBook} 
            icon={<Trash2 size={18} color="#DC2626" strokeWidth={2} />}
          >
            Delete Book
          </Button>
        </View>
      </ScrollView>

      <DeleteModal
        visible={isDeleteModalVisible}
        title="Delete Book?"
        message="This action cannot be undone. Are you sure you want to delete this book from your library?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  coverContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
  },
  statusBadge: {
    marginTop: 12,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'center',
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  pageText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  hintText: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  completedBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorBackButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  errorBackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
