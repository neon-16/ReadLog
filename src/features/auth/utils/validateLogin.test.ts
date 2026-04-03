import { validateLogin } from '@/src/features/auth/utils/validateLogin';

describe('validateLogin', () => {
  it('returns isValid=true with no errors for a valid email and password', () => {
    // Happy path: valid credential input should pass validation.
    const result = validateLogin('reader@example.com', 'secure123');

    expect(result).toEqual({
      isValid: true,
      errors: {},
    });
  });

  it('accepts email with leading and trailing spaces after trimming', () => {
    // Edge case: whitespace around a valid email should still pass validation.
    const result = validateLogin('  reader@example.com  ', 'secure123');

    expect(result).toEqual({
      isValid: true,
      errors: {},
    });
  });

  it('returns required-field errors when both email and password are empty strings', () => {
    // Edge case: blank fields should return clear required messages.
    const result = validateLogin('', '');

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      email: 'Email is required',
      password: 'Password is required',
    });
  });

  it('returns an email-format error when email does not match a valid format', () => {
    // Invalid input: malformed email should be rejected.
    const result = validateLogin('invalid-email-format', 'secure123');

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      email: 'Invalid email format',
    });
  });

  it('returns a required-password error when email is valid but password is empty', () => {
    // Edge case: only password is missing.
    const result = validateLogin('reader@example.com', '');

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      password: 'Password is required',
    });
  });

  it('returns a required-email error when password is valid but email is empty', () => {
    // Edge case: only email is missing.
    const result = validateLogin('', 'secure123');

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      email: 'Email is required',
    });
  });

  it('accepts password with exactly 6 characters', () => {
    // Boundary case: minimum password length should pass.
    const result = validateLogin('reader@example.com', '123456');

    expect(result).toEqual({
      isValid: true,
      errors: {},
    });
  });

  it('returns a short-password error when password has fewer than 6 characters', () => {
    // Invalid input: short passwords should not pass validation.
    const result = validateLogin('reader@example.com', '12345');

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      password: 'Password must be at least 6 characters',
    });
  });

  it('returns type errors when email and password are wrong types', () => {
    // Invalid input: wrong runtime types should fail fast with explicit errors.
    const result = validateLogin(123 as unknown as string, null as unknown as string);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      email: 'Email must be a string',
      password: 'Password must be a string',
    });
  });
});
