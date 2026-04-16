import { Redirect, type Href } from 'expo-router';
import { Platform } from 'react-native';

export default function Index() {
  if (Platform.OS !== 'web') {
    return <Redirect href="/splash" />;
  }

  return <Redirect href={'/landing' as Href} />;
}
