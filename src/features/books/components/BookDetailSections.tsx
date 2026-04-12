import BookCover from '@/components/shared/BookCover';
import Button from '@/components/shared/Button';
import ProgressBar from '@/components/shared/ProgressBar';
import type { BookData } from '@/src/features/books/hooks/useBookDetailData';
import { Save, Trash2 } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import type { BookDetailStyles } from './bookDetailStyles';

export function formatBookStatus(status: string): string {
  if (status === 'reading') return 'Reading';
  if (status === 'want_to_read') return 'Want to Read';
  if (status === 'finished') return 'Finished';
  return status;
}

type LoadingStateProps = {
  styles: BookDetailStyles;
};

export function BookDetailLoadingState({ styles }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    </View>
  );
}

type ErrorStateProps = {
  message: string;
  onBack: () => void;
  styles: BookDetailStyles;
};

export function BookDetailErrorState({ message, onBack, styles }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>{message}</Text>
        <Pressable onPress={onBack} style={styles.errorBackButton}>
          <Text style={styles.errorBackButtonText}>Go Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

type HeaderProps = {
  leftContent: ReactNode;
  onBack: () => void;
  styles: BookDetailStyles;
};

export function BookDetailHeader({ leftContent, onBack, styles }: HeaderProps) {
  return (
    <>
      <Pressable style={styles.backButton} onPress={onBack}>
        {leftContent}
      </Pressable>
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Book Detail</Text>
      </View>
    </>
  );
}

type MetaProps = {
  book: BookData;
  status: string;
  styles: BookDetailStyles;
};

export function BookDetailMeta({ book, status, styles }: MetaProps) {
  return (
    <>
      <View style={styles.coverContainer}>
        <BookCover genre={book.genre} size="large" />
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>by {book.author}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>Status: {formatBookStatus(status)}</Text>
        </View>
      </View>
    </>
  );
}

type StatusProps = {
  status: string;
  styles: BookDetailStyles;
};

export function BookDetailStatusSection({ status, styles }: StatusProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Status</Text>
      <View style={styles.statusRow}>
        <Text style={styles.statusText}>{formatBookStatus(status)}</Text>
        {status === 'finished' && <Text style={styles.completedBadge}>Completed ✓</Text>}
      </View>
      {status === 'want_to_read' && (
        <Text style={styles.hintText}>Status updates automatically when you save page progress</Text>
      )}
    </View>
  );
}

type ProgressProps = {
  current: number;
  total: number;
  styles: BookDetailStyles;
};

export function BookDetailProgressSection({ current, total, styles }: ProgressProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Progress</Text>
      <ProgressBar current={current} total={total} />
      <Text style={styles.pageText}>{`${current} / ${total} pages`}</Text>
    </View>
  );
}

type PageInputProps = {
  value: string;
  onChange: (value: string) => void;
  styles: BookDetailStyles;
};

export function BookDetailPageInputSection({ value, onChange, styles }: PageInputProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.inputLabel}>Update Current Page</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        placeholder="1"
        editable
      />
    </View>
  );
}

type ActionProps = {
  saving: boolean;
  onSave: () => void;
  onDelete: () => void;
  styles: BookDetailStyles;
};

export function BookDetailActionButtons({ saving, onSave, onDelete, styles }: ActionProps) {
  return (
    <View style={styles.buttonsContainer}>
      <Button
        variant="primary"
        onPress={onSave}
        icon={saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Save size={18} color="#FFFFFF" strokeWidth={2} />}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Progress'}
      </Button>
      <Button variant="danger" onPress={onDelete} icon={<Trash2 size={18} color="#DC2626" strokeWidth={2} />}>
        Delete Book
      </Button>
    </View>
  );
}
