import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GENRE_CONFIG } from '../../utils/genreIcons';

interface GenreSelectorProps {
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
}

export default function GenreSelector({ selectedGenre, onGenreChange }: GenreSelectorProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const config = GENRE_CONFIG[selectedGenre as keyof typeof GENRE_CONFIG];
  const Icon = config?.icon;

  const handleSelectGenre = (genre: string) => {
    onGenreChange(genre);
    setIsModalVisible(false);
  };

  const genres = Object.keys(GENRE_CONFIG);

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>Genre</Text>
        <View style={styles.preview}>
          <View style={[styles.colorSquare, { backgroundColor: config?.bg }]}>
            {Icon && <Icon size={14} color={config?.color} />}
          </View>
          <Text style={styles.genreName}>{selectedGenre}</Text>
        </View>
        <Pressable style={styles.button} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.buttonText}>Change Genre</Text>
          <Text style={styles.dropdownIcon}>▾</Text>
        </Pressable>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Genre</Text>
            <ScrollView style={styles.genreList} showsVerticalScrollIndicator={false}>
              {genres.map((genre) => {
                const genreConfig = GENRE_CONFIG[genre as keyof typeof GENRE_CONFIG];
                const GenreIcon = genreConfig?.icon;
                return (
                  <Pressable
                    key={genre}
                    style={[
                      styles.genreOption,
                      selectedGenre === genre && styles.genreOptionSelected,
                    ]}
                    onPress={() => handleSelectGenre(genre)}
                  >
                    <View style={[styles.genreOptionColor, { backgroundColor: genreConfig?.bg }]}>
                      {GenreIcon && <GenreIcon size={12} color={genreConfig?.color} />}
                    </View>
                    <Text
                      style={[
                        styles.genreOptionText,
                        selectedGenre === genre && styles.genreOptionTextSelected,
                      ]}
                    >
                      {genre}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    minWidth: '85%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  genreList: {
    maxHeight: 450,
    marginBottom: 16,
  },
  genreOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#F3F4F6',
  },
  genreOptionSelected: {
    backgroundColor: '#DBEAFE',
  },
  genreOptionColor: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  genreOptionText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  genreOptionTextSelected: {
    fontWeight: '600',
    color: '#2563EB',
  },
  closeButton: {
    height: 48,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
