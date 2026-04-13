import OfflineBanner from '@/src/core/components/OfflineBanner';
import { useAuth } from '@/src/features/auth/AuthContext';
import DiscoverBookItem, { type DiscoverBook } from '@/src/features/books/components/DiscoverBookItem';
import {
    DiscoverEmptyState,
    DiscoverErrorState,
    DiscoverLoadingState,
    DiscoverRecentSearches,
    DiscoverSearchBar,
} from '@/src/features/books/components/DiscoverScreenSections';
import { discoverStyles as styles } from '@/src/features/books/components/discoverStyles';
import { useDiscoverBooks } from '@/src/features/books/hooks/useDiscoverBooks';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Platform, Text, TouchableWithoutFeedback, View } from 'react-native';
import AppHeader from '../../components/shared/AppHeader';

const ROW_HEIGHT = 126;

export default function Discover() {
  const { user } = useAuth();
  const {
    isOffline,
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    hasSearched,
    recentSearches,
    discoverSuggestions,
    isLoadingSuggestions,
    suggestionsError,
    hasMore,
    handleSearch,
    clearRecentSearches,
    loadDiscoverSuggestions,
    resetDiscoverState,
    loadNextPage,
    handleAddBook,
  } = useDiscoverBooks(user);

  useFocusEffect(
    useCallback(() => {
      Keyboard.dismiss();

      return () => {
        resetDiscoverState();
      };
    }, [resetDiscoverState])
  );

  const keyExtractor = useCallback(
    (item: DiscoverBook, index: number) => `${item.externalId ?? item.title ?? 'book'}-${index}`,
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: DiscoverBook }) => <DiscoverBookItem book={item} onAdd={handleAddBook} styles={styles} />,
    [handleAddBook]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<DiscoverBook> | null | undefined, index: number) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    []
  );

  const content = (
    <View style={styles.container}>
      <AppHeader title="Discover" variant="centered" showBackButton backIcon="chevron" />
      <OfflineBanner />

      {isOffline ? (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>
            Discover requires an internet connection
          </Text>
        </View>
      ) : (
        <>
          <DiscoverSearchBar
            searchQuery={searchQuery}
            isSearching={isSearching}
            onSearchChange={handleSearch}
          />

          {searchQuery.trim().length === 0 && (
            <DiscoverRecentSearches
              recentSearches={recentSearches}
              onSearch={handleSearch}
              onClearAll={clearRecentSearches}
            />
          )}

          {searchQuery.trim().length === 0 && (
            <>
              <View style={styles.sectionLabelContainer}>
                <Text style={styles.sectionLabel}>
                  {suggestionsError ? 'SUGGESTIONS UNAVAILABLE' : 'RANDOM PICKS FOR YOU'}
                </Text>
              </View>

              {isLoadingSuggestions ? (
                <DiscoverLoadingState message="Loading random books..." />
              ) : suggestionsError ? (
                <DiscoverErrorState message={suggestionsError} onRetry={loadDiscoverSuggestions} />
              ) : (
                <FlatList
                  data={discoverSuggestions}
                  keyExtractor={keyExtractor}
                  renderItem={renderItem}
                  initialNumToRender={8}
                  maxToRenderPerBatch={8}
                  updateCellsBatchingPeriod={50}
                  windowSize={7}
                  removeClippedSubviews
                  getItemLayout={getItemLayout}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={<DiscoverEmptyState />}
                />
              )}
            </>
          )}

          {searchQuery.trim().length > 0 && isSearching ? (
            <DiscoverLoadingState message="Searching books..." />
          ) : searchQuery.trim().length > 0 && hasSearched ? (
            <>
              <View style={styles.sectionLabelContainer}>
                <Text style={styles.sectionLabel}>
                  {searchError ? 'SOMETHING WENT WRONG' : `SEARCH RESULTS (${searchResults.length})`}
                </Text>
              </View>

              {searchError ? (
                <DiscoverErrorState message={searchError} onRetry={() => handleSearch(searchQuery)} />
              ) : (
                <FlatList
                  data={searchResults}
                  keyExtractor={keyExtractor}
                  renderItem={renderItem}
                  onEndReachedThreshold={0.5}
                  onEndReached={loadNextPage}
                  initialNumToRender={8}
                  maxToRenderPerBatch={8}
                  updateCellsBatchingPeriod={50}
                  windowSize={7}
                  removeClippedSubviews
                  getItemLayout={getItemLayout}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  ListFooterComponent={
                    isSearching && hasMore
                      ? <ActivityIndicator size="small" color="#2563EB" style={styles.paginationLoader} />
                      : null
                  }
                />
              )}
            </>
          ) : null}
        </>
      )}
    </View>
  );

  if (Platform.OS === 'web') {
    return content;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {content}
    </TouchableWithoutFeedback>
  );
}
