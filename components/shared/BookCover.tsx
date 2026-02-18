import { View, StyleSheet } from 'react-native';
import { getGenreIcon } from '../../utils/genreIcons';

interface BookCoverProps {
  genre?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function BookCover({ genre, size = 'medium' }: BookCoverProps) {
  const Icon = genre ? getGenreIcon(genre) : null;
  const dimensions = {
    small: { width: 80, height: 100, iconSize: 28 },
    medium: { width: 120, height: 160, iconSize: 48 },
    large: { width: 160, height: 240, iconSize: 80 },
  }[size];

  return (
    <View style={[styles.cover, { width: dimensions.width, height: dimensions.height }]}>
      {Icon && <Icon size={dimensions.iconSize} color="#2563EB" strokeWidth={size === 'large' ? 1.5 : 2} />}
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
});
