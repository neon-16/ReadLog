import EditProfileModal from '@/components/shared/EditProfileModal';
import ProgressBar from '@/components/shared/ProgressBar';
import { Bookmark, BookOpen, CheckCircle, Edit3, Library, User } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from 'react-native';
import type { StatsStyles } from './statsStyles';

type StatCardProps = {
  title: string;
  value: number;
  icon: ReactNode;
  iconBgColor: string;
  styles: StatsStyles;
};

function StatCard({ title, value, icon, iconBgColor, styles }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.iconBackground, { backgroundColor: iconBgColor }]}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title.toUpperCase()}</Text>
    </View>
  );
}

type ProfileCardProps = {
  displayName: string;
  email?: string | null;
  profileLoading: boolean;
  onEdit: () => void;
  styles: StatsStyles;
};

export function StatsProfileCard({ displayName, email, profileLoading, onEdit, styles }: ProfileCardProps) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileAvatarContainer}>
        <View style={styles.profileAvatar}>
          <User size={32} color="#FFFFFF" strokeWidth={2} />
        </View>
        <View style={styles.profileTextContainer}>
          <Text style={styles.profileDisplayName}>{profileLoading ? 'Loading...' : displayName || 'User'}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>
      </View>
      <Pressable onPress={onEdit} disabled={profileLoading} style={styles.editButton}>
        <Edit3 size={18} color="#2563EB" strokeWidth={2} />
      </Pressable>
    </View>
  );
}

type LoadingProps = {
  styles: StatsStyles;
};

export function StatsLoadingState({ styles }: LoadingProps) {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}

type ErrorProps = {
  onRetry: () => void;
  styles: StatsStyles;
};

export function StatsErrorState({ onRetry, styles }: ErrorProps) {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.statsErrorText}>Failed to load stats.</Text>
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

type StatsGridProps = {
  total: number;
  finished: number;
  wantToRead: number;
  reading: number;
  styles: StatsStyles;
};

export function StatsGridSection({ total, finished, wantToRead, reading, styles }: StatsGridProps) {
  return (
    <View style={styles.statsGrid}>
      <StatCard
        title="Total Books"
        value={total}
        icon={<Library size={28} color="#2563EB" strokeWidth={2} />}
        iconBgColor="#EFF6FF"
        styles={styles}
      />
      <StatCard
        title="Finished"
        value={finished}
        icon={<CheckCircle size={28} color="#16A34A" strokeWidth={2} />}
        iconBgColor="#ECFDF5"
        styles={styles}
      />
      <StatCard
        title="Want to Read"
        value={wantToRead}
        icon={<Bookmark size={28} color="#7C3AED" strokeWidth={2} />}
        iconBgColor="#F5F3FF"
        styles={styles}
      />
      <StatCard
        title="Reading"
        value={reading}
        icon={<BookOpen size={28} color="#EA580C" strokeWidth={2} />}
        iconBgColor="#FFF7ED"
        styles={styles}
      />
    </View>
  );
}

type GoalProps = {
  currentYear: number;
  finished: number;
  readingGoal: number;
  styles: StatsStyles;
};

export function StatsGoalSection({ currentYear, finished, readingGoal, styles }: GoalProps) {
  return (
    <View style={styles.goalSection}>
      <Text style={styles.goalTitle}>Reading Goal</Text>
      <Text style={styles.goalText}>{finished} of {readingGoal} books for {currentYear}.</Text>
      <ProgressBar current={finished} total={readingGoal} />
    </View>
  );
}

type EditModalProps = {
  visible: boolean;
  displayName: string;
  onClose: () => void;
  onSave: (value: string) => Promise<void>;
  isLoading: boolean;
};

export function StatsEditProfileModal({ visible, displayName, onClose, onSave, isLoading }: EditModalProps) {
  return (
    <EditProfileModal
      visible={visible}
      displayName={displayName}
      onClose={onClose}
      onSave={onSave}
      isLoading={isLoading}
    />
  );
}
