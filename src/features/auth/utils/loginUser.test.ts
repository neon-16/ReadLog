import { loginUser } from '@/src/features/auth/utils/loginUser';
import { signInWithEmailAndPassword } from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

describe('loginUser', () => {
  const mockAuth = { app: { name: 'test-app' } } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs in successfully with normalized email and valid password', async () => {
    // Happy path: Firebase resolves and loginUser forwards the credential result.
    const mockCredential = {
      user: { uid: 'user_1', email: 'reader@example.com' },
    };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce(mockCredential);

    const result = await loginUser(mockAuth, '  Reader@Example.com  ', 'secure123');

    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      'reader@example.com',
      'secure123'
    );
    expect(result).toEqual(mockCredential);
  });

  it('throws a friendly error when Firebase rejects with wrong password', async () => {
    // Sad path: auth/wrong-password should map to user-facing message.
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Firebase: Error (auth/wrong-password).')
    );

    await expect(loginUser(mockAuth, 'reader@example.com', 'bad-pass')).rejects.toThrow(
      'Incorrect password.'
    );

    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
  });

  it('throws credential mismatch message when Firebase rejects with invalid credential', async () => {
    // Sad path: auth/invalid-credential should map to a stable user-facing message.
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Firebase: Error (auth/invalid-credential).')
    );

    await expect(loginUser(mockAuth, 'reader@example.com', 'bad-pass')).rejects.toThrow(
      'Email or password is incorrect.'
    );

    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
  });

  it('throws a generic auth error when Firebase rejects with unknown code', async () => {
    // Sad path: unexpected provider errors should still produce a stable message.
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Firebase: Error (auth/internal-error).')
    );

    await expect(loginUser(mockAuth, 'reader@example.com', 'secure123')).rejects.toThrow(
      'Authentication failed. Please try again.'
    );
  });
});
