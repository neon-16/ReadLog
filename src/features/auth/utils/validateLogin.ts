export type LoginValidationErrors = {
  email?: string;
  password?: string;
};

export type LoginValidationResult = {
  isValid: boolean;
  errors: LoginValidationErrors;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: unknown): string {
  if (typeof email !== 'string') {
    return 'Email must be a string';
  }

  const normalizedEmail = email.trim();
  if (!normalizedEmail) {
    return 'Email is required';
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return 'Invalid email format';
  }

  return '';
}

export function validatePassword(password: unknown): string {
  if (typeof password !== 'string') {
    return 'Password must be a string';
  }

  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return '';
}

export function validateLogin(email: unknown, password: unknown): LoginValidationResult {
  const errors: LoginValidationErrors = {};

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  return {
    isValid: !errors.email && !errors.password,
    errors,
  };
}
