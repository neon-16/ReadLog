import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { GENRE_CONFIG } from '../../utils/genreIcons';

interface GenreSelectorProps {
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
}

export default function GenreSelector({ selectedGenre, onGenreChange }: GenreSelectorProps) {
  const config = GENRE_CONFIG[selectedGenre as keyof typeof GENRE_CONFIG];
  const Icon = config?.icon;

  const handleSelectGenre = () => {
    const genreOptions = Object.keys(GENRE_CONFIG).map((g) => ({
      text: g,
      onPress: () => onGenreChange(g),
    }));
    genreOptions.push({ text: 'Cancel', style: 'cancel' } as any);
    Alert.alert('Select Genre', 'Choose a genre for this book:', genreOptions as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Genre</Text>
      <View style={styles.preview}>
        <View style={[styles.colorSquare, { backgroundColor: config?.bg }]}>
          {Icon && <Icon size={14} color={config?.color} />}
        </View>
        <Text style={styles.genreName}>{selectedGenre}</Text>
      </View>
      <Pressable style={styles.button} onPress={handleSelectGenre}>
        <Text style={styles.buttonText}>Change Genre</Text>
        <Text style={styles.dropdownIcon}>▾</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  preview: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorSquare: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genreName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  button: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonText: {
    fontSize: 16,
    color: '#111827',
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
});
