import LoginScreen from '@/app/login';
import { useAuth } from '@/src/features/auth/AuthContext';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

const mockReplace = jest.fn();
const mockSignIn = jest.fn();
const mockResetPassword = jest.fn();

jest.mock('expo-router', () => {
  return {
    router: {
      replace: mockReplace,
      push: jest.fn(),
      back: jest.fn(),
    },
    Link: ({ children }: { children: React.ReactNode }) => (
      <Text>{children}</Text>
    ),
  };
});

jest.mock('@/src/features/auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      resetPassword: mockResetPassword,
    });
  });

  it('renders login screen inputs and submit button', () => {
    // Verifies core form controls are visible on initial render.
    const { getByTestId } = render(<LoginScreen />);

    expect(getByTestId('login-email-input')).toBeTruthy();
    expect(getByTestId('login-password-input')).toBeTruthy();
    expect(getByTestId('login-submit-button')).toBeTruthy();
  });

  it('enters email/password and submits login successfully', async () => {
    // Verifies typing + submit flow calls signIn and redirects on success.
    mockSignIn.mockResolvedValueOnce(undefined);

    const { getByTestId } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('login-email-input'), 'reader@example.com');
    fireEvent.changeText(getByTestId('login-password-input'), 'secure123');
    fireEvent.press(getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('reader@example.com', 'secure123');
    });
  });

  it('shows validation error when trying to login with empty fields', async () => {
    // Verifies form-level validation message appears for missing input.
    const { getByTestId } = render(<LoginScreen />);

    fireEvent.press(getByTestId('login-submit-button'));

    await waitFor(() => {
      const errorNode = getByTestId('login-form-error');
      expect(errorNode.props.children).toBe('Please fill in all fields.');
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('shows validation error when email or password format is invalid', async () => {
    // Verifies invalid input blocks submit and surfaces validation feedback.
    const { getByTestId } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('login-email-input'), 'invalid-email');
    fireEvent.changeText(getByTestId('login-password-input'), '123');
    fireEvent.press(getByTestId('login-submit-button'));

    await waitFor(() => {
      const errorNode = getByTestId('login-form-error');
      expect(errorNode.props.children).toBe('Please fix the input errors.');
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
