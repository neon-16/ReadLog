import OfflineBanner from '@/src/core/components/OfflineBanner';
import { useAuth } from '@/src/features/auth/AuthContext';
import { useHomeData } from '@/src/features/books/hooks/useHomeData';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../components/shared/AppHeader';
import BookCover from '../../components/shared/BookCover';
import ProgressBar from '../../components/shared/ProgressBar';

const BOOK_ROW_HEIGHT = 144;

const BookCard = memo(function BookCard({ book, isFinished }: { book: any; isFinished?: boolean }) {
  const handlePress = useCallback(() => {
    router.push({ pathname: '/book-detail', params: { bookId: book.id } });
  }, [book.id]);

  return (
    <Pressable
      style={[styles.bookCard, isFinished && styles.finishedCard]}
      onPress={handlePress}
    >
      <BookCover genre={book.genre} size="small" />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
        <View style={styles.genreBadge}>
          <Text style={styles.genreText}>{book.genre.toUpperCase()}</Text>
        </View>
        <ProgressBar current={book.progress} total={100} showLabel />
      </View>
    </Pressable>
  );
});

export default function Home() {
  const { user } = useAuth();
  const {
    profile,
    readingBooks,
    wantToReadBooks,
    finishedBooks,
    loading,
    error,
    fetchBooks,
  } = useHomeData(user);

  const keyExtractor = useCallback((item: any) => item.id, []);
  const renderReadingItem = useCallback(({ item }: { item: any }) => <BookCard book={item} />, []);
  const renderWantToReadItem = useCallback(({ item }: { item: any }) => <BookCard book={item} />, []);
  const renderFinishedItem = useCallback(({ item }: { item: any }) => <BookCard book={item} isFinished />, []);
  const getItemLayout = useCallback(
    (_: ArrayLike<any> | null | undefined, index: number) => ({
      length: BOOK_ROW_HEIGHT,
      offset: BOOK_ROW_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <AppHeader />
      <OfflineBanner />

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome, {profile?.displayName || 'User'}! 👋</Text>
      </View>

      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>{readingBooks.length} BOOKS ACTIVE</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : error ? (
        <ScrollView contentContainerStyle={styles.errorContainer} showsVerticalScrollIndicator={false}>
          <Text style={{ color: '#EF4444', marginBottom: 12, fontSize: 16, fontWeight: '600' }}>
            Error Loading Books
          </Text>
          <View style={{ backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <Text style={{ color: '#991B1B', fontSize: 13, lineHeight: 18 }}>
              {error}
            </Text>
          </View>
          <Text style={{ color: '#6B7280', fontSize: 13, marginBottom: 16 }}>
            Check that:
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 13, marginBottom: 4 }}>
            • Firestore database is created in Firebase Console
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 13, marginBottom: 4 }}>
            • Security rules are properly configured
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 13, marginBottom: 16 }}>
            • You are logged in to the correct account
          </Text>
          <TouchableOpacity onPress={() => fetchBooks(true)} style={styles.retryButton}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Section 1: ACTIVE BOOKS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Books</Text>
            {readingBooks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No active books. Start reading something!
                </Text>
              </View>
            ) : (
              <FlatList
                data={readingBooks}
                keyExtractor={keyExtractor}
                renderItem={renderReadingItem}
                scrollEnabled={false}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews
                getItemLayout={getItemLayout}
              />
            )}
          </View>

          {/* Section 2: WANT TO READ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Want to Read</Text>
            {wantToReadBooks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No books in your reading list yet.
                </Text>
              </View>
            ) : (
              <FlatList
                data={wantToReadBooks}
                keyExtractor={keyExtractor}
                renderItem={renderWantToReadItem}
                scrollEnabled={false}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews
                getItemLayout={getItemLayout}
              />
            )}
          </View>

          {/* Section 3: RECENTLY FINISHED */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recently Finished</Text>
            {finishedBooks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No finished books yet. Keep reading!
                </Text>
              </View>
            ) : (
              <FlatList
                data={finishedBooks}
                keyExtractor={keyExtractor}
                renderItem={renderFinishedItem}
                scrollEnabled={false}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews
                getItemLayout={getItemLayout}
              />
            )}
          </View>
        </ScrollView>
      )}

      <Pressable style={styles.fab} onPress={() => router.push('/add-manual')}>
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    letterSpacing: 1,
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
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  finishedCard: {
    opacity: 0.7,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 8,
  },
  genreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  genreText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
