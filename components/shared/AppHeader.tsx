import { router } from 'expo-router';
import { ArrowLeft, BookOpen, ChevronLeft, Search } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  variant?: 'default' | 'centered';
  backIcon?: 'arrow' | 'chevron';
}

export default function AppHeader({ 
  title = 'ReadLog', 
  showBackButton = false, 
  showSearch = false,
  variant = 'default',
  backIcon = 'arrow'
}: AppHeaderProps) {
  const BackIcon = backIcon === 'chevron' ? ChevronLeft : ArrowLeft;

  if (variant === 'centered') {
    return (
      <View style={styles.centeredHeader}>
        {showBackButton && (
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <BackIcon size={24} color="#2563EB" strokeWidth={2} />
          </Pressable>
        )}
        <Text style={styles.centeredTitle}>{title}</Text>
        <View style={styles.spacer} />
      </View>
    );
  }

  return (
    <View style={styles.header}>
      {showBackButton ? (
        <Pressable onPress={() => router.back()} style={styles.backButtonInline}>
          <BackIcon size={24} color="#2563EB" strokeWidth={2} />
        </Pressable>
      ) : (
        <View style={styles.headerLeft}>
          <BookOpen size={28} color="#2563EB" strokeWidth={2} />
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      )}
      {showSearch && (
        <Pressable>
          <Search size={24} color="#6B7280" strokeWidth={2} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  centeredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  centeredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
  },
  backButtonInline: {
    padding: 8,
  },
  spacer: {
    width: 40,
  },
});
