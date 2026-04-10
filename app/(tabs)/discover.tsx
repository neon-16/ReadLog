import OfflineBanner from '@/src/core/components/OfflineBanner';
import { useAuth } from '@/src/features/auth/AuthContext';
import DiscoverBookItem, { type DiscoverBook } from '@/src/features/books/components/DiscoverBookItem';
import { useDiscoverBooks } from '@/src/features/books/hooks/useDiscoverBooks';
import { useFocusEffect } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
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
    hasMore,
    handleSearch,
    clearRecentSearches,
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <Search size={20} color="#6B7280" strokeWidth={2} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholderTextColor="#6B7280"
                  editable={!isSearching}
                  autoFocus={false}
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => handleSearch('')}
                    style={styles.cancelButton}
                    disabled={isSearching}
                  >
                    <Text style={styles.cancelText}>Clear</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {searchQuery.trim().length === 0 && recentSearches.length > 0 && (
              <View style={styles.historySection}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>Recent Searches</Text>
                  <Pressable onPress={clearRecentSearches}>
                    <Text style={styles.historyClearText}>Clear All</Text>
                  </Pressable>
                </View>
                <View style={styles.historyChipList}>
                  {recentSearches.map((item) => (
                    <Pressable
                      key={item}
                      style={styles.historyChip}
                      onPress={() => handleSearch(item)}
                    >
                      <Text style={styles.historyChipText}>{item}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {isSearching ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.searchingText}>Searching books...</Text>
              </View>
            ) : hasSearched ? (
              <>
                <View style={styles.sectionLabelContainer}>
                  <Text style={styles.sectionLabel}>
                    {searchError ? 'NO RESULTS' : `SEARCH RESULTS (${searchResults.length})`}
                  </Text>
                </View>

                {searchError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{searchError}</Text>
                    <TouchableOpacity
                      onPress={() => handleSearch(searchQuery)}
                      style={styles.retryButton}
                    >
                      <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <FlatList
                    data={searchResults}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    onEndReachedThreshold={0.5}
                    onEndReached={loadNextPage}
                    initialNumToRender={8}
                    maxToRenderPerBatch={8}
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
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>Start searching for books</Text>
                <Text style={styles.emptyStateSubtext}>Type at least 2 characters to search</Text>
              </View>
            )}
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  paginationLoader: {
    marginTop: 8,
    marginBottom: 12,
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
  historySection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
  },
  historyClearText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },
  historyChipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  historyChipText: {
    fontSize: 13,
    color: '#374151',
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
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  offlineText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  searchingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bookYear: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});
