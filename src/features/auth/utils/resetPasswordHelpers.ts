type ParamValue = string | string[] | undefined;

function readQueryParam(value: ParamValue): string {
  if (Array.isArray(value)) {
    return String(value[0] || '');
  }
  return String(value || '');
}

export function parseResetParams(params: Record<string, ParamValue>) {
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

export function getCopyableResetLink(params: Record<string, ParamValue>, oobCode: string) {
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

export function getReadableResetError(message: string): string {
  if (message.includes('auth/invalid-action-code')) return 'This reset link is invalid or already used.';
  if (message.includes('auth/expired-action-code')) return 'This reset link has expired. Request a new one.';
  if (message.includes('auth/weak-password')) return 'Password must be at least 6 characters.';
  if (message.includes('auth/network-request-failed')) return 'Network error. Please try again.';
  return 'Unable to reset password. Please request a new link.';
}
