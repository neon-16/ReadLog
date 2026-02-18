import { BookOpen, BookText, Book, Rocket, Lightbulb, Cpu, Target, Library, Heart, Brain, Code, Clock, Zap } from 'lucide-react-native';

export const GENRE_CONFIG = {
  'Fiction': { icon: BookOpen, bg: '#EFF6FF', color: '#2563EB' },
  'Non-Fiction': { icon: BookText, bg: '#F0FDF4', color: '#16A34A' },
  'Classic': { icon: Book, bg: '#FDF4FF', color: '#9333EA' },
  'Sci-Fi': { icon: Rocket, bg: '#FFF7ED', color: '#EA580C' },
  'Self-Help': { icon: Heart, bg: '#FEFCE8', color: '#CA8A04' },
  'Technology': { icon: Cpu, bg: '#EFF6FF', color: '#2563EB' },
  'Productivity': { icon: Target, bg: '#F0FDF4', color: '#16A34A' },
  'Programming': { icon: Code, bg: '#EFF6FF', color: '#2563EB' },
  'Science': { icon: Brain, bg: '#F0FDF4', color: '#16A34A' },
  'Mystery': { icon: Zap, bg: '#FDF4FF', color: '#9333EA' },
  'Motivation': { icon: Lightbulb, bg: '#FEFCE8', color: '#CA8A04' },
  'Other': { icon: Library, bg: '#F3F4F6', color: '#6B7280' },
};

export function getGenreIcon(genre: string) {
  const config = GENRE_CONFIG[genre as keyof typeof GENRE_CONFIG];
  return config ? config.icon : Book;
}

export function getGenreConfig(genre: string) {
  return GENRE_CONFIG[genre as keyof typeof GENRE_CONFIG] || GENRE_CONFIG['Other'];
}
