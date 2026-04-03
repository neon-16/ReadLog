import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { useAuth } from '@/src/features/auth/AuthContext';
import { Link, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const RESET_COOLDOWN_MS = 30000;

export default function LoginScreen() {
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownUntil]);

  const remainingCooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  const emailError = useMemo(() => {
    if (!email) return '';
    return isValidEmail(email) ? '' : 'Please enter a valid email.';
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return '';
    return password.length >= 6 ? '' : 'Password must be at least 6 characters.';
  }, [password]);

  const handleLogin = async () => {
    setError('');
    setResetMessage('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (emailError || passwordError) {
      setError('Please fix the input errors.');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setResetMessage('');

    if (remainingCooldownSeconds > 0) {
      setError(`Please wait ${remainingCooldownSeconds}s before requesting another reset email.`);
      return;
    }

    if (!email) {
      setError('Enter your email first, then tap Forgot Password.');
      return;
    }

    if (emailError) {
      setError('Please enter a valid email to reset your password.');
      return;
    }

    setResettingPassword(true);
    try {
      await resetPassword(email);
      setResetMessage('If an account exists for this email, a reset link has been sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset email.');
    } finally {
      setResettingPassword(false);
      setCooldownUntil(Date.now() + RESET_COOLDOWN_MS);
      setNow(Date.now());
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue tracking your reading journey.</Text>

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={emailError}
          testID="login-email-input"
        />

        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          passwordToggle
          error={passwordError}
          testID="login-password-input"
        />

        <Pressable onPress={handleForgotPassword} disabled={resettingPassword || submitting || remainingCooldownSeconds > 0}>
          <Text style={[styles.forgotPasswordLink, (resettingPassword || submitting || remainingCooldownSeconds > 0) && styles.forgotPasswordLinkDisabled]}>
            {resettingPassword
              ? 'Sending reset email...'
              : remainingCooldownSeconds > 0
                ? `Forgot Password? (${remainingCooldownSeconds}s)`
                : 'Forgot Password?'}
          </Text>
        </Pressable>

        {!!error && <Text testID="login-form-error" style={styles.formError}>{error}</Text>}
        {!!resetMessage && <Text style={styles.successText}>{resetMessage}</Text>}

        <Button testID="login-submit-button" onPress={handleLogin} disabled={submitting}>
          {submitting ? 'Signing In...' : 'Sign In'}
        </Button>

        <View style={styles.linkRow}>
          <Text style={styles.linkText}>Don&apos;t have an account? </Text>
          <Link href="/signup" style={styles.link}>
            Sign Up
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
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 460,
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
  successText: {
    color: '#047857',
    fontSize: 13,
    marginBottom: 12,
  },
  forgotPasswordLink: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
    alignSelf: 'flex-end',
    marginTop: 0,
    marginBottom: 16,
  },
  forgotPasswordLinkDisabled: {
    color: '#9CA3AF',
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