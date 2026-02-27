import { router } from 'expo-router';
import { Info, Save } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AppHeader from '../components/shared/AppHeader';
import Button from '../components/shared/Button';
import GenreSelector from '../components/shared/GenreSelector';
import Input from '../components/shared/Input';
import StatusSelector from '../components/shared/StatusSelector';
import { showAlert } from '../utils/alert';

export default function AddManual() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [status, setStatus] = useState('Reading');
  const [genre, setGenre] = useState('Fiction');

  const handleAddBook = () => {
    if (!title.trim()) {
      showAlert('Validation Error', 'Please enter a book title.');
      return;
    }
    if (!author.trim()) {
      showAlert('Validation Error', 'Please enter an author name.');
      return;
    }
    if (!totalPages.trim()) {
      showAlert('Validation Error', 'Please enter total pages.');
      return;
    }

    const bookData = { title, author, totalPages, status, genre };
    console.log('Book saved:', bookData);

    router.push({
      pathname: '/book-added-successfully',
      params: { bookTitle: title },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <AppHeader title="Add New Book" variant="centered" showBackButton />
        </View>

        <View style={styles.form}>
          <Input label="Book Title" placeholder="Enter book title" value={title} onChangeText={setTitle} />
          <Input label="Author" placeholder="Enter author name" value={author} onChangeText={setAuthor} />

          <View style={styles.rowGroup}>
            <View style={styles.pagesInput}>
              <Input label="Total Pages" placeholder="0" value={totalPages} onChangeText={setTotalPages} keyboardType="number-pad" />
            </View>
            <View style={styles.statusInput}>
              <StatusSelector selectedStatus={status} onStatusChange={setStatus} />
            </View>
          </View>

          <GenreSelector selectedGenre={genre} onGenreChange={setGenre} />

          <View style={styles.infoBox}>
            <Info size={16} color="#2563EB" strokeWidth={2} style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>
              Once saved, this book will be added to your reading shelf. You can track your progress page by page offline.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="primary" onPress={handleAddBook} icon={<Save size={18} color="#FFFFFF" strokeWidth={2} />}>
          Save Book
        </Button>
        <Button variant="cancel" onPress={() => router.back()}>
          Cancel
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 0,
  },
  form: {
    paddingHorizontal: 20,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  pagesInput: {
    width: '40%',
  },
  statusInput: {
    width: '58%',
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2563EB',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
});
