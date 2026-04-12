import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { useResetPasswordFlow } from '@/src/features/auth/hooks/useResetPasswordFlow';
import { Link, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const {
    email,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    verifying,
    submitting,
    linkError,
    formError,
    success,
    linkMessage,
    copyableResetLink,
    passwordError,
    confirmError,
    handleReset,
    handleOpenResetLink,
  } = useResetPasswordFlow(params);

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
