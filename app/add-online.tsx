import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../utils/alert';

// Mock Online Books Data
const onlineBooks = [
  {
    id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
  },
  {
    id: '2',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
  },
  {
    id: '3',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
  },
  {
    id: '4',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
  },
  {
    id: '5',
    title: 'The Lean Startup',
    author: 'Eric Ries',
  },
  {
    id: '6',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
  },
  {
    id: '7',
    title: 'Educated',
    author: 'Tara Westover',
  },
  {
    id: '8',
    title: 'Dune',
    author: 'Frank Herbert',
  },
];

const ROW_HEIGHT = 116;

type OnlineBook = typeof onlineBooks[number];

// Book Item Component
const BookItem = memo(function BookItem({ book }: { book: OnlineBook }) {
  const handleAddBook = () => {
    showAlert('Book Added', 'Book added to your library.', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <View style={styles.bookItem}>
      {/* Placeholder Cover */}
      <View style={styles.placeholderCover} />

      {/* Book Info */}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.author}
        </Text>
      </View>

      {/* Add Button */}
      <Pressable style={styles.addButton} onPress={handleAddBook}>
        <Text style={styles.addButtonText}>Add</Text>
      </Pressable>
    </View>
  );
});

export default function AddOnline() {
  const keyExtractor = useCallback((item: OnlineBook) => item.id, []);

  const renderItem = useCallback(({ item }: { item: OnlineBook }) => (
    <BookItem book={item} />
  ), []);

  const getItemLayout = useCallback((_: ArrayLike<OnlineBook> | null | undefined, index: number) => ({
    length: ROW_HEIGHT,
    offset: ROW_HEIGHT * index,
    index,
  }), []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Discover Online</Text>
      </View>

      {/* Books List */}
      <FlatList
        data={onlineBooks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  placeholderCover: {
    width: 60,
    height: 90,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666666',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
