import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { Link, useLocalSearchParams } from 'expo-router';
import { confirmPasswordReset, getAuth, verifyPasswordResetCode } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Linking, Platform, StyleSheet, Text, View } from 'react-native';

const auth = getAuth();

function readQueryParam(value: unknown): string {
  if (Array.isArray(value)) {
    return String(value[0] || '');
  }
  return String(value || '');
}

function parseResetParams(params: Record<string, unknown>) {
  const directOobCode =
    readQueryParam(params.oobCode).trim() ||
    readQueryParam(params.oobcode).trim() ||
    readQueryParam(params.code).trim();

  const directMode = readQueryParam(params.mode).trim();
  if (directOobCode) {
    return {
      oobCode: directOobCode,
      mode: directMode,
    };
  }

  const nestedLink =
    readQueryParam(params.continueUrl).trim() ||
    readQueryParam(params.link).trim() ||
    readQueryParam(params.deep_link_id).trim();

  if (!nestedLink) {
    return {
      oobCode: '',
      mode: directMode,
    };
  }

  try {
    const nestedUrl = new URL(nestedLink);
    return {
      oobCode:
        nestedUrl.searchParams.get('oobCode') ||
        nestedUrl.searchParams.get('oobcode') ||
        nestedUrl.searchParams.get('code') ||
        '',
      mode: nestedUrl.searchParams.get('mode') || directMode,
    };
  } catch {
    return {
      oobCode: '',
      mode: directMode,
    };
  }
}

function getCopyableResetLink(params: Record<string, unknown>, oobCode: string) {
  const nestedLink =
    readQueryParam(params.continueUrl).trim() ||
    readQueryParam(params.link).trim() ||
    readQueryParam(params.deep_link_id).trim();

  if (nestedLink) {
    return nestedLink;
  }

  if (!oobCode) {
    return '';
  }

  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  if (!authDomain) {
    return `mode=resetPassword&oobCode=${encodeURIComponent(oobCode)}`;
  }

  return `https://${authDomain}/__/auth/action?mode=resetPassword&oobCode=${encodeURIComponent(oobCode)}`;
}

function getReadableResetError(message: string): string {
  if (message.includes('auth/invalid-action-code')) return 'This reset link is invalid or already used.';
  if (message.includes('auth/expired-action-code')) return 'This reset link has expired. Request a new one.';
  if (message.includes('auth/weak-password')) return 'Password must be at least 6 characters.';
  if (message.includes('auth/network-request-failed')) return 'Network error. Please try again.';
  return 'Unable to reset password. Please request a new link.';
}

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const { oobCode, mode } = useMemo(
    () => parseResetParams(params),
    [params]
  );
  const copyableResetLink = useMemo(
    () => getCopyableResetLink(params, oobCode),
    [oobCode, params]
  );

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [linkMessage, setLinkMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const verifyLink = async () => {
      // Some providers omit mode on custom links, but oobCode is sufficient for Firebase verification.
      if (!oobCode || (mode && mode !== 'resetPassword')) {
        setLinkError('This password reset link is incomplete. Please request a new reset email.');
        setVerifying(false);
        return;
      }

      try {
        const recoveredEmail = await verifyPasswordResetCode(auth, oobCode);
        if (!cancelled) {
          setEmail(recoveredEmail || '');
        }
      } catch (error) {
        if (!cancelled) {
          setLinkError(getReadableResetError(String(error)));
        }
      } finally {
        if (!cancelled) {
          setVerifying(false);
        }
      }
    };

    verifyLink();

    return () => {
      cancelled = true;
    };
  }, [mode, oobCode]);

  const passwordError = useMemo(() => {
    if (!newPassword) return '';
    return newPassword.length >= 6 ? '' : 'Password must be at least 6 characters.';
  }, [newPassword]);

  const confirmError = useMemo(() => {
    if (!confirmPassword) return '';
    return confirmPassword === newPassword ? '' : 'Passwords do not match.';
  }, [confirmPassword, newPassword]);

  const handleReset = async () => {
    setFormError('');

    if (!oobCode) {
      setFormError('Reset code is missing. Please request a new reset email.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setFormError('Please fill in all fields.');
      return;
    }

    if (passwordError || confirmError) {
      setFormError('Please fix the input errors.');
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
    } catch (error) {
      setFormError(getReadableResetError(String(error)));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenResetLink = async () => {
    if (!copyableResetLink) return;

    const canOpen = await Linking.canOpenURL(copyableResetLink);
    if (!canOpen) {
      setLinkMessage('Unable to open link.');
      return;
    }

    await Linking.openURL(copyableResetLink);
  };

  if (verifying) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.statusText}>Verifying reset link...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Reset Password</Text>

        {!!linkError ? (
          <>
            <Text style={styles.formError}>{linkError}</Text>
            {!!copyableResetLink && (
              <>
                <Button variant="secondary" onPress={handleOpenResetLink}>Open in Browser</Button>
                {!!linkMessage && <Text style={styles.infoText}>{linkMessage}</Text>}
              </>
            )}
            <Link href="/login" style={styles.link}>Back to Login</Link>
          </>
        ) : success ? (
          <>
            <Text style={styles.successText}>Password reset successful. You can now sign in with your new password.</Text>
            <Link href="/login" style={styles.link}>Go to Login</Link>
          </>
        ) : (
          <>
            {!!email && <Text style={styles.subtitle}>Resetting password for {email}</Text>}

            <Input
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              passwordToggle
              editable={!submitting}
              error={passwordError}
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              passwordToggle
              editable={!submitting}
              error={confirmError}
            />

            {!!formError && <Text style={styles.formError}>{formError}</Text>}

            <Button onPress={handleReset} disabled={submitting}>
              {submitting ? 'Resetting...' : 'Reset Password'}
            </Button>

            {!!copyableResetLink && (
              <>
                <Button variant="secondary" onPress={handleOpenResetLink}>Open in Browser</Button>
                {!!linkMessage && <Text style={styles.infoText}>{linkMessage}</Text>}
              </>
            )}

            <Link href="/login" style={styles.link}>Back to Login</Link>
          </>
        )}
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
  centerContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  formError: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  successText: {
    color: '#047857',
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  infoText: {
    color: '#2563EB',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
  link: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
});
