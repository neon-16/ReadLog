import BookCover from '@/components/shared/BookCover';
import { showAlert } from '@/utils/alert';
import { memo, useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { DiscoverStyles } from './discoverStyles';

type DiscoverBook = {
  title: string;
  author: string;
  genre: string;
  source: string;
  externalId?: string;
  year?: number;
  coverUrl?: string | null;
  totalPages?: number;
};

type DiscoverBookItemProps = {
  book: DiscoverBook;
  onAdd: (book: DiscoverBook) => Promise<void>;
  styles: DiscoverStyles;
};

const DiscoverBookItem = memo(function DiscoverBookItem({ book, onAdd, styles }: DiscoverBookItemProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = useCallback(async () => {
    setIsAdding(true);
    try {
      await onAdd(book);
      setIsAdded(true);
      showAlert('Added to Library', "Book added as 'Want to Read'.");
    } catch (error) {
      showAlert('Error', error instanceof Error ? error.message : 'Failed to add book');
    } finally {
      setIsAdding(false);
    }
  }, [book, onAdd]);

  return (
    <View style={styles.bookItem}>
      <BookCover genre={book.genre} size="small" imageUrl={book.coverUrl} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{book.title ?? 'Untitled'}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{book.author ?? 'Unknown Author'}</Text>
        {book.year && <Text style={styles.bookYear}>{book.year}</Text>}
        <View style={styles.genreBadge}>
          <Text style={styles.genreText}>{book.genre?.toUpperCase?.() ?? 'OTHER'}</Text>
        </View>
      </View>
      <Pressable
        style={[styles.addButton, isAdded && styles.addedButton]}
        onPress={handleAdd}
        disabled={isAdded || isAdding}
      >
        {isAdding ? (
          <ActivityIndicator size="small" color={isAdded ? '#6B7280' : '#FFFFFF'} />
        ) : (
          <Text style={[styles.addButtonText, isAdded && styles.addedButtonText]}>
            {isAdded ? 'Added' : 'Add'}
          </Text>
        )}
      </Pressable>
    </View>
  );
});

export default DiscoverBookItem;
export type { DiscoverBook };
