import OfflineBanner from '@/src/core/components/OfflineBanner';
import { useAuth } from '@/src/features/auth/AuthContext';
import { useStatsData } from '@/src/features/books/hooks/useStatsData';
import { Bookmark, BookOpen, CheckCircle, Edit3, Library, User } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EditProfileModal from '../../components/shared/EditProfileModal';
import ProgressBar from '../../components/shared/ProgressBar';

function StatCard({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  iconBgColor: string; 
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.iconBackground, { backgroundColor: iconBgColor }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title.toUpperCase()}</Text>
    </View>
  );
}

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
    fetchStats,
    handleUpdateDisplayName,
  } = useStatsData(user);

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reading Stats</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatarContainer}>
            <View style={styles.profileAvatar}>
              <User size={32} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileDisplayName}>
                {profileLoading ? 'Loading...' : profile?.displayName || 'User'}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setEditModalVisible(true)}
            disabled={profileLoading}
            style={styles.editButton}
          >
            <Edit3 size={18} color="#2563EB" strokeWidth={2} />
          </Pressable>
        </View>

        {statsLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : statsError ? (
          <View style={styles.centerContainer}>
            <Text style={{ color: '#EF4444', textAlign: 'center', marginBottom: 16, fontSize: 16 }}>
              Failed to load stats.
            </Text>
            <TouchableOpacity onPress={() => fetchStats(true)} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard 
                title="Total Books" 
                value={stats.total} 
                icon={<Library size={28} color="#2563EB" strokeWidth={2} />}
                iconBgColor="#EFF6FF"
              />
              <StatCard 
                title="Finished" 
                value={stats.finished} 
                icon={<CheckCircle size={28} color="#16A34A" strokeWidth={2} />}
                iconBgColor="#ECFDF5"
              />
              <StatCard 
                title="Want to Read" 
                value={stats.wantToRead} 
                icon={<Bookmark size={28} color="#7C3AED" strokeWidth={2} />}
                iconBgColor="#F5F3FF"
              />
              <StatCard 
                title="Reading" 
                value={stats.reading} 
                icon={<BookOpen size={28} color="#EA580C" strokeWidth={2} />}
                iconBgColor="#FFF7ED"
              />
            </View>

            <View style={styles.goalSection}>
              <Text style={styles.goalTitle}>Reading Goal</Text>
              <Text style={styles.goalText}>
                {stats.finished} of {stats.readingGoal} books for {currentYear}.
              </Text>
              <ProgressBar current={stats.finished} total={stats.readingGoal} />
            </View>
          </>
        )}
      </ScrollView>

      <EditProfileModal
        visible={editModalVisible}
        displayName={profile?.displayName || ''}
        onClose={() => setEditModalVisible(false)}
        onSave={handleUpdateDisplayName}
        isLoading={savingProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileAvatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextContainer: {
    flex: 1,
  },
  profileDisplayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
  editButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: '1.5%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBackground: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  goalSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
