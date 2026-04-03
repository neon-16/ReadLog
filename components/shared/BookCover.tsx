import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { getGenreConfig, getGenreIcon } from '../../utils/genreIcons';

interface BookCoverProps {
  genre?: string;
  size?: 'small' | 'medium' | 'large';
  imageUrl?: string | null;
}

export default function BookCover({ genre, size = 'medium', imageUrl = null }: BookCoverProps) {
  const Icon = genre ? getGenreIcon(genre) : null;
  const config = genre ? getGenreConfig(genre) : null;
  const dimensions = {
    small: { width: 80, height: 100, iconSize: 28 },
    medium: { width: 120, height: 160, iconSize: 48 },
    large: { width: 160, height: 240, iconSize: 80 },
  }[size];

  return (
    <View style={[
      styles.cover, 
      { width: dimensions.width, height: dimensions.height, backgroundColor: config?.bg || '#EFF6FF' }
    ]}>
      {imageUrl ? (
        // Expo Image provides memory/disk cache and downscales decode by view size.
        <Image
          source={{ uri: imageUrl }}
          style={styles.coverImage}
          contentFit="cover"
          transition={120}
          cachePolicy="memory-disk"
        />
      ) : (
        Icon && <Icon size={dimensions.iconSize} color={config?.color || '#2563EB'} strokeWidth={size === 'large' ? 1.5 : 2} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});
