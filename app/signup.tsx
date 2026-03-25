import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { useAuth } from '@/src/features/auth/AuthContext';
import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailError = useMemo(() => {
    if (!email) return '';
    return isValidEmail(email) ? '' : 'Please enter a valid email.';
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return '';
    return password.length >= 6 ? '' : 'Password must be at least 6 characters.';
  }, [password]);

  const confirmPasswordError = useMemo(() => {
    if (!confirmPassword) return '';
    return password === confirmPassword ? '' : 'Passwords do not match.';
  }, [confirmPassword, password]);

  const handleSignUp = async () => {
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (emailError || passwordError || confirmPasswordError) {
      setError('Please fix the input errors.');
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password);
      router.replace('/(tabs)/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start saving your reading progress with your own account.</Text>

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={emailError}
        />

        <Input
          label="Password"
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          passwordToggle
          error={passwordError}
        />

        <Input
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          passwordToggle
          error={confirmPasswordError}
        />

        {!!error && <Text style={styles.formError}>{error}</Text>}

        <Button onPress={handleSignUp} disabled={submitting}>
          {submitting ? 'Creating Account...' : 'Sign Up'}
        </Button>

        <View style={styles.linkRow}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <Link href="/login" style={styles.link}>
            Sign In
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  formError: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 12,
  },
  linkRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    color: '#6B7280',
    fontSize: 14,
  },
  link: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
  },
});