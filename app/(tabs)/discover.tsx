import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import AppHeader from '../../components/shared/AppHeader';
import BookCover from '../../components/shared/BookCover';
import { discoverBooks } from '../../constants/mockData';
import { showAlert } from '../../utils/alert';

function BookItem({ book }: { book: typeof discoverBooks[0] }) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    setIsAdded(true);
    showAlert(
      'Added to Library',
      "Book added as 'Want to Read'."
    );
  };

  return (
    <View style={styles.bookItem}>
      <BookCover genre={book.genre} size="small" />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
        <View style={styles.genreBadge}>
          <Text style={styles.genreText}>{book.genre.toUpperCase()}</Text>
        </View>
      </View>
      <Pressable 
        style={[styles.addButton, isAdded && styles.addedButton]} 
        onPress={handleAdd}
        disabled={isAdded}
      >
        <Text style={[styles.addButtonText, isAdded && styles.addedButtonText]}>
          {isAdded ? 'Added' : 'Add'}
        </Text>
      </Pressable>
    </View>
  );
}

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = discoverBooks.filter((book) => {
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  });

  return (
    <View style={styles.container}>
      <AppHeader title="Discover" variant="centered" showBackButton backIcon="chevron" />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#6B7280" strokeWidth={2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title or author..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6B7280"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.sectionLabelContainer}>
        <Text style={styles.sectionLabel}>SEARCH RESULTS</Text>
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookItem book={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  searchInputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    color: '#111827',
  },
  cancelButton: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  cancelText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '400',
  },
  sectionLabelContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
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
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
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
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  genreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  genreText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  pagesText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 12,
  },
  addedButton: {
    backgroundColor: '#E5E7EB',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addedButtonText: {
    color: '#6B7280',
  },
});
