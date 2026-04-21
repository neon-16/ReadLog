import { BookMarked } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

type AppLogoProps = {
  size?: number;
};

export default function AppLogo({ size = 24 }: AppLogoProps) {
  return (
    <View style={[styles.logoContainer, { width: size, height: size }]}> 
      <BookMarked size={size} color="#2563EB" strokeWidth={2.2} />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});