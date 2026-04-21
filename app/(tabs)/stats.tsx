import OfflineBanner from '@/src/core/components/OfflineBanner';
import { useAuth } from '@/src/features/auth/AuthContext';
import {
    StatsEditProfileModal,
    StatsErrorState,
    StatsGoalSection,
    StatsGridSection,
    StatsLoadingState,
    StatsProfileCard,
} from '@/src/features/books/components/StatsSections';
import { statsStyles as styles } from '@/src/features/books/components/statsStyles';
import { useStatsData } from '@/src/features/books/hooks/useStatsData';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function Stats() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const {
    profile,
    profileLoading,
    savingProfile,
    stats,
    statsLoading,
    statsError,
    usingCachedStats,
    fetchStats,
    handleUpdateDisplayName,
  } = useStatsData(user);

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reading Stats</Text>
          {usingCachedStats && (
            <Text style={{ color: '#6B7280', marginTop: 6, fontSize: 12 }}>
              Offline mode: showing cached stats. Stats refresh when you are back online.
            </Text>
          )}
        </View>

        <StatsProfileCard
          displayName={profile?.displayName || 'User'}
          email={user?.email}
          profileLoading={profileLoading}
          onEdit={() => setEditModalVisible(true)}
          styles={styles}
        />

        {statsLoading ? (
          <StatsLoadingState styles={styles} />
        ) : statsError ? (
          <StatsErrorState onRetry={() => fetchStats(true)} styles={styles} />
        ) : (
          <>
            <StatsGridSection
              total={stats.total}
              finished={stats.finished}
              wantToRead={stats.wantToRead}
              reading={stats.reading}
              styles={styles}
            />

            <StatsGoalSection
              currentYear={currentYear}
              finished={stats.finished}
              readingGoal={stats.readingGoal}
              styles={styles}
            />
          </>
        )}
      </ScrollView>

      <StatsEditProfileModal
        visible={editModalVisible}
        displayName={profile?.displayName || ''}
        onClose={() => setEditModalVisible(false)}
        onSave={handleUpdateDisplayName}
        isLoading={savingProfile}
      />
    </View>
  );
}
