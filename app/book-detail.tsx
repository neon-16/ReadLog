import { router } from 'expo-router';
import { ArrowLeft, RefreshCw, Save, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import BookCover from '../components/shared/BookCover';
import Button from '../components/shared/Button';
import DeleteModal from '../components/shared/DeleteModal';
import ProgressBar from '../components/shared/ProgressBar';
import { mockBook } from '../constants/mockData';
import { showActionSheet } from '../utils/alert';

export default function BookDetail() {
  const [currentPage, setCurrentPage] = useState(mockBook.currentPage.toString());
  const [status, setStatus] = useState('Reading');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const handleSaveProgress = () => {
    router.push({
      pathname: '/progress-saved',
      params: { bookTitle: mockBook.title },
    });
  };

  const handleChangeStatus = () => {
    showActionSheet(
      'Change Status',
      'Select the new status for this book:',
      [
        {
          text: 'Reading',
          onPress: () => {
            setStatus('Reading');
          },
        },
        {
          text: 'Completed',
          onPress: () => {
            setStatus('Completed');
          },
        },
        {
          text: 'Want to Read',
          onPress: () => {
            setStatus('Want to Read');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleDeleteBook = () => {
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalVisible(false);
    router.push('/book-deleted-successfully');
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#2563EB" strokeWidth={2} />
        </Pressable>

        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Book Detail</Text>
        </View>

        <View style={styles.coverContainer}>
          <BookCover genre={mockBook.genre} size="large" />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>{mockBook.title}</Text>
          <Text style={styles.author}>by {mockBook.author}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <Text style={styles.statusText}>{status}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <ProgressBar current={parseInt(currentPage)} total={mockBook.totalPages} />
          <Text style={styles.pageText}>
            Page {currentPage} of {mockBook.totalPages}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.inputLabel}>Update Current Page</Text>
          <TextInput
            style={styles.textInput}
            value={currentPage}
            onChangeText={setCurrentPage}
            keyboardType="number-pad"
            placeholder="0"
          />
        </View>

        <View style={styles.buttonsContainer}>
          <Button variant="primary" onPress={handleSaveProgress} icon={<Save size={18} color="#FFFFFF" strokeWidth={2} />}>
            Save Progress
          </Button>
          <Button variant="secondary" onPress={handleChangeStatus} icon={<RefreshCw size={18} color="#2563EB" strokeWidth={2} />}>
            Change Status
          </Button>
          <Button variant="danger" onPress={handleDeleteBook} icon={<Trash2 size={18} color="#DC2626" strokeWidth={2} />}>
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
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
});
