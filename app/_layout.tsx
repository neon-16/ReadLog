import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="splash" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-manual" />
      <Stack.Screen name="add-online" />
      <Stack.Screen name="book-detail" />
    </Stack>
  );
}
