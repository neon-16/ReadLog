import { Search } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { discoverStyles as styles } from './discoverStyles';

type SearchBarProps = {
  searchQuery: string;
  isSearching: boolean;
  onSearchChange: (value: string) => void;
};

export function DiscoverSearchBar({ searchQuery, isSearching, onSearchChange }: SearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputWrapper}>
        <Search size={20} color="#6B7280" strokeWidth={2} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or author..."
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor="#6B7280"
          editable={!isSearching}
          autoFocus={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => onSearchChange('')} style={styles.cancelButton} disabled={isSearching}>
            <Text style={styles.cancelText}>Clear</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

type RecentSearchesProps = {
  recentSearches: string[];
  onSearch: (value: string) => void;
  onClearAll: () => void;
};

export function DiscoverRecentSearches({ recentSearches, onSearch, onClearAll }: RecentSearchesProps) {
  if (recentSearches.length === 0) {
    return null;
  }

  return (
    <View style={styles.historySection}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Recent Searches</Text>
        <Pressable onPress={onClearAll}>
          <Text style={styles.historyClearText}>Clear All</Text>
        </Pressable>
      </View>
      <View style={styles.historyChipList}>
        {recentSearches.map((item) => (
          <Pressable key={item} style={styles.historyChip} onPress={() => onSearch(item)}>
            <Text style={styles.historyChipText}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

type LoadingStateProps = {
  message: string;
};

export function DiscoverLoadingState({ message }: LoadingStateProps) {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.searchingText}>{message}</Text>
    </View>
  );
}

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function DiscoverErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export function DiscoverEmptyState() {
  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateText}>Start searching for books</Text>
      <Text style={styles.emptyStateSubtext}>Type at least 2 characters to search</Text>
    </View>
  );
}
