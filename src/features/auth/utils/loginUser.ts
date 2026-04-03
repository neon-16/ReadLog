import { signInWithEmailAndPassword, type Auth } from 'firebase/auth';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getReadableAuthError(message: string): string {
  if (message.includes('auth/invalid-email')) return 'Invalid email format.';
  if (message.includes('auth/user-not-found')) return 'No account found for this email.';
  if (message.includes('auth/wrong-password')) return 'Incorrect password.';
  if (message.includes('auth/invalid-credential')) return 'Email or password is incorrect.';
  if (message.includes('auth/network-request-failed')) return 'Network error. Please try again.';
  return 'Authentication failed. Please try again.';
}

export async function loginUser(currentAuth: Auth, email: string, password: string) {
  try {
    return await signInWithEmailAndPassword(currentAuth, normalizeEmail(email), password);
  } catch (error) {
    throw new Error(getReadableAuthError(String(error)));
  }
}
