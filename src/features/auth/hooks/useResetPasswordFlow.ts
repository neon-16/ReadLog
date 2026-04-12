import { getCopyableResetLink, getReadableResetError, parseResetParams } from '@/src/features/auth/utils/resetPasswordHelpers';
import { confirmPasswordReset, getAuth, verifyPasswordResetCode } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';

const auth = getAuth();

type ParamValue = string | string[] | undefined;

type ResetParamsInput = Record<string, ParamValue>;

export function useResetPasswordFlow(params: ResetParamsInput) {
  const { oobCode, mode } = useMemo(() => parseResetParams(params), [params]);
  const copyableResetLink = useMemo(() => getCopyableResetLink(params, oobCode), [oobCode, params]);

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

    void verifyLink();

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

  return {
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
  };
}
