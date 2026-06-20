// src/lib/authConfig.ts
const GOOGLE_ENABLED = import.meta.env.PUBLIC_AUTH_GOOGLE_ENABLED;

export function getOAuthRedirect(locale: string): string {
  if (import.meta.env.PUBLIC_AUTH_OAUTH_REDIRECT) {
    return import.meta.env.PUBLIC_AUTH_OAUTH_REDIRECT;
  }

  if (typeof window === "undefined") {
    return "";
  }

  return new URL(`/${locale}/auth/callback`, window.location.origin).toString();
}

export function isValidOAuthRedirect(redirectTarget: string): boolean {
  try {
    const url = new URL(redirectTarget);
    return url.protocol.length > 1 && url.host.length > 0;
  } catch {
    return false;
  }
}

export function isGoogleLoginAvailable(locale: string): boolean {
  if (GOOGLE_ENABLED === "false") {
    return false;
  }

  return isValidOAuthRedirect(getOAuthRedirect(locale));
}
