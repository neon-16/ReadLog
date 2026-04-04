import { AuthProvider } from '@/src/features/auth/AuthContext';
import { useAuthGateRedirect } from '@/src/features/auth/hooks/useAuthGateRedirect';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

function AuthGate() {
  useAuthGateRedirect();
  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: Platform.OS === 'ios',
          fullScreenGestureEnabled: Platform.OS === 'ios',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-manual" />
        <Stack.Screen name="add-online" />
        <Stack.Screen name="book-detail" />
      </Stack>
    </AuthProvider>
  );
}
