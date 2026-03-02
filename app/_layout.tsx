import { Stack } from 'expo-router';
import { AuthProvider } from '@/src/features/auth/AuthContext';
import { useAuthGateRedirect } from '@/src/features/auth/hooks/useAuthGateRedirect';

function AuthGate() {
  useAuthGateRedirect();
  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-manual" />
        <Stack.Screen name="add-online" />
        <Stack.Screen name="book-detail" />
      </Stack>
    </AuthProvider>
  );
}
