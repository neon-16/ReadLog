import OfflineBanner from '@/src/core/components/OfflineBanner';
import useNetworkStatus from '@/src/core/hooks/useNetworkStatus';
import { useAuth } from '@/src/features/auth/AuthContext';
import {
    BookDetailActionButtons,
    BookDetailErrorState,
    BookDetailHeader,
    BookDetailLoadingState,
    BookDetailMeta,
    BookDetailPageInputSection,
    BookDetailProgressSection,
    BookDetailStatusSection,
} from '@/src/features/books/components/BookDetailSections';
import { bookDetailStyles as styles } from '@/src/features/books/components/bookDetailStyles';
import { useBookDetailData } from '@/src/features/books/hooks/useBookDetailData';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import DeleteModal from '../components/shared/DeleteModal';

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
    return <BookDetailLoadingState styles={styles} />;
  }

  if (!book || error) {
    return <BookDetailErrorState message={error || 'Book not found'} onBack={() => router.back()} styles={styles} />;
  }

  const parsedCurrentPage = parseInt(currentPage, 10);
  const safeCurrentPage = Number.isNaN(parsedCurrentPage)
    ? (status === 'finished' ? book.totalPages : status === 'want_to_read' ? 0 : book.currentPage)
    : parsedCurrentPage;
  const displayCurrentPage = status === 'finished'
    ? book.totalPages
    : status === 'want_to_read'
      ? 0
      : Math.min(Math.max(safeCurrentPage, 0), book.totalPages);

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false}>
        <BookDetailHeader
          leftContent={<ArrowLeft size={24} color="#2563EB" strokeWidth={2} />}
          onBack={() => router.back()}
          styles={styles}
        />

        <BookDetailMeta book={book} status={status} styles={styles} />
        <BookDetailStatusSection status={status} styles={styles} />
        <BookDetailProgressSection current={displayCurrentPage} total={book.totalPages} styles={styles} />
        <BookDetailPageInputSection value={currentPage} onChange={handleCurrentPageChange} styles={styles} />

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <BookDetailActionButtons
          saving={saving}
          onSave={handleSaveProgress}
          onDelete={handleDeleteBook}
          styles={styles}
        />
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
