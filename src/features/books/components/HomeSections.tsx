import BookCover from '@/components/shared/BookCover';
import ProgressBar from '@/components/shared/ProgressBar';
import type { HomeBook } from '@/src/features/books/types';
import { router } from 'expo-router';
import type { ReactElement } from 'react';
import { memo, useCallback } from 'react';
import { FlatList, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { HomeStyles } from './homeStyles';

type BookCardProps = {
  book: HomeBook;
  isFinished?: boolean;
  isOffline?: boolean;
  styles: HomeStyles;
};

export const HomeBookCard = memo(function HomeBookCard({ book, isFinished, isOffline = false, styles }: BookCardProps) {
  const handlePress = useCallback(() => {
    router.push({ pathname: '/book-detail', params: { bookId: book.id } });
  }, [book.id]);

  return (
    <Pressable style={[styles.bookCard, isFinished && styles.finishedCard]} onPress={handlePress}>
      <BookCover genre={book.genre} size="small" />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
        {book.pendingSync && isOffline ? (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>SYNC PENDING</Text>
          </View>
        ) : null}
        <View style={styles.genreBadge}>
          <Text style={styles.genreText}>{book.genre.toUpperCase()}</Text>
        </View>
        <ProgressBar current={book.progress} total={100} showLabel />
      </View>
    </Pressable>
  );
});

type HomeBookSectionProps = {
  title: string;
  emptyMessage: string;
  data: HomeBook[];
  styles: HomeStyles;
  keyExtractor: (item: HomeBook) => string;
  renderItem: ({ item }: { item: HomeBook }) => ReactElement;
  getItemLayout: (_: ArrayLike<HomeBook> | null | undefined, index: number) => { length: number; offset: number; index: number };
};

export function HomeBookSection({
  title,
  emptyMessage,
  data,
  styles,
  keyExtractor,
  renderItem,
  getItemLayout,
}: HomeBookSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          scrollEnabled={false}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          windowSize={5}
          removeClippedSubviews
          getItemLayout={getItemLayout}
        />
      )}
    </View>
  );
}

type HomeErrorStateProps = {
  error: string;
  onRetry: () => void;
  styles: HomeStyles;
};

export function HomeErrorState({ error, onRetry, styles }: HomeErrorStateProps) {
  return (
    <ScrollView contentContainerStyle={styles.errorContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.errorTitle}>Error Loading Books</Text>
      <View style={styles.errorPanel}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
      <Text style={styles.errorChecklistTitle}>Check that:</Text>
      <Text style={styles.errorChecklistItem}>• Firestore database is created in Firebase Console</Text>
      <Text style={styles.errorChecklistItem}>• Security rules are properly configured</Text>
      <Text style={styles.errorChecklistTitle}>• You are logged in to the correct account</Text>
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
