import { View, Text, StyleSheet, Pressable, FlatList, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { activeBooks, recentlyFinished } from '../../constants/mockData';
import { getGenreIcon } from '../../utils/genreIcons';
import AppHeader from '../../components/shared/AppHeader';
import ProgressBar from '../../components/shared/ProgressBar';
import BookCover from '../../components/shared/BookCover';

function BookCard({ book, isFinished }: { book: typeof activeBooks[0]; isFinished?: boolean }) {
  return (
    <Pressable
      style={[styles.bookCard, isFinished && styles.finishedCard]}
      onPress={() => router.push('/book-detail')}
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
}

export default function Home() {
  return (
    <View style={styles.container}>
      <AppHeader showSearch />

      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>{activeBooks.length} BOOKS ACTIVE</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Books</Text>
          <FlatList
            data={activeBooks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <BookCard book={item} />}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Finished</Text>
          <BookCard book={recentlyFinished} isFinished />
        </View>
      </ScrollView>

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
});
