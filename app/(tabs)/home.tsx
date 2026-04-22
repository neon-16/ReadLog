import OfflineBanner from '@/src/core/components/OfflineBanner';
import useNetworkStatus from '@/src/core/hooks/useNetworkStatus';
import { useAuth } from '@/src/features/auth/AuthContext';
import { HomeBookCard, HomeBookSection, HomeErrorState } from '@/src/features/books/components/HomeSections';
import { homeStyles as styles } from '@/src/features/books/components/homeStyles';
import { useHomeData } from '@/src/features/books/hooks/useHomeData';
import type { HomeBook } from '@/src/features/books/types';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import AppHeader from '../../components/shared/AppHeader';

const BOOK_ROW_HEIGHT = 144;

export default function Home() {
  const { user } = useAuth();
  const { isOffline } = useNetworkStatus();
  const {
    profile,
    readingBooks,
    wantToReadBooks,
    finishedBooks,
    loading,
    error,
    fetchBooks,
  } = useHomeData(user);

  const keyExtractor = useCallback((item: HomeBook) => item.id, []);
  const renderReadingItem = useCallback(
    ({ item }: { item: HomeBook }) => <HomeBookCard book={item} isOffline={isOffline} styles={styles} />,
    [isOffline]
  );
  const renderWantToReadItem = useCallback(
    ({ item }: { item: HomeBook }) => <HomeBookCard book={item} isOffline={isOffline} styles={styles} />,
    [isOffline]
  );
  const renderFinishedItem = useCallback(
    ({ item }: { item: HomeBook }) => <HomeBookCard book={item} isFinished isOffline={isOffline} styles={styles} />,
    [isOffline]
  );
  const getItemLayout = useCallback(
    (_: ArrayLike<HomeBook> | null | undefined, index: number) => ({
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
        <HomeErrorState error={error} onRetry={() => fetchBooks(true)} styles={styles} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <HomeBookSection
            title="Active Books"
            emptyMessage="No active books. Start reading something!"
            data={readingBooks}
            styles={styles}
            keyExtractor={keyExtractor}
            renderItem={renderReadingItem}
            getItemLayout={getItemLayout}
          />

          <HomeBookSection
            title="Want to Read"
            emptyMessage="No books in your reading list yet."
            data={wantToReadBooks}
            styles={styles}
            keyExtractor={keyExtractor}
            renderItem={renderWantToReadItem}
            getItemLayout={getItemLayout}
          />

          <HomeBookSection
            title="Recently Finished"
            emptyMessage="No finished books yet. Keep reading!"
            data={finishedBooks}
            styles={styles}
            keyExtractor={keyExtractor}
            renderItem={renderFinishedItem}
            getItemLayout={getItemLayout}
          />
        </ScrollView>
      )}

      <Pressable style={styles.fab} onPress={() => router.push('/add-manual')}>
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
