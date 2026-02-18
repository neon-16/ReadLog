import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Library, CheckCircle, Bookmark, BookOpen } from 'lucide-react-native';
import { statsData, readingGoal } from '../../constants/mockData';
import AppHeader from '../../components/shared/AppHeader';
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
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader />

        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Reading Stats</Text>
          <Text style={styles.pageSubtitle}>Track your progress and achievements.</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard 
            title="Total Books" 
            value={statsData.totalBooks} 
            icon={<Library size={28} color="#2563EB" strokeWidth={2} />}
            iconBgColor="#EFF6FF"
          />
          <StatCard 
            title="Finished" 
            value={statsData.finished} 
            icon={<CheckCircle size={28} color="#16A34A" strokeWidth={2} />}
            iconBgColor="#ECFDF5"
          />
          <StatCard 
            title="Want to Read" 
            value={statsData.wantToRead} 
            icon={<Bookmark size={28} color="#7C3AED" strokeWidth={2} />}
            iconBgColor="#F5F3FF"
          />
          <StatCard 
            title="Reading" 
            value={statsData.reading} 
            icon={<BookOpen size={28} color="#EA580C" strokeWidth={2} />}
            iconBgColor="#FFF7ED"
          />
        </View>

        <View style={styles.goalSection}>
          <Text style={styles.goalTitle}>Reading Goal</Text>
          <Text style={styles.goalText}>
            {readingGoal.completed} of {readingGoal.target} books completed
          </Text>
          <ProgressBar current={readingGoal.completed} total={readingGoal.target} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
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
});
