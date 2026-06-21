type EnvLike = Record<string, string | undefined>;

/**
 * Parse `PUBLIC_AUTH_OAUTH_ALLOWED_REDIRECT_PREFIXES` into a list of exact
 * extension-origin prefixes (comma-separated, whitespace-trimmed).
 *
 * This is the UI-layer counterpart to `OAUTH_ALLOWED_REDIRECT_PREFIXES` in
 * the auth backend (plan item 8.2).  An empty list means no chrome-extension://
 * redirect is accepted — intentionally fail-closed.
 */
export function getOAuthRedirectPrefixes(env: EnvLike = import.meta.env): string[] {
  const raw = env['PUBLIC_AUTH_OAUTH_ALLOWED_REDIRECT_PREFIXES'] ?? '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Resolve the OAuth redirect target for this locale.
 *
 * Priority: `PUBLIC_AUTH_OAUTH_REDIRECT` build-time override → runtime
 * `window.location.origin` (always available: `output: static`, no SSR).
 */
export function getOAuthRedirect(locale: string, env: EnvLike = import.meta.env): string {
  if (env['PUBLIC_AUTH_OAUTH_REDIRECT']) {
    return env['PUBLIC_AUTH_OAUTH_REDIRECT'];
  }
  return new URL(`/${locale}/auth/callback`, window.location.origin).toString();
}

/**
 * Return true when `redirectTarget` is acceptable as an OAuth redirect.
 *
 * - Regular http(s)/native-app URLs: accepted when structurally valid.
 * - `chrome-extension://` URLs: accepted only when the target starts with at
 *   least one entry in `allowedPrefixes`.  An empty prefix list → rejected
 *   (fail-closed, mirrors the backend `OAUTH_ALLOWED_REDIRECT_PREFIXES` gate).
 */
export function isValidOAuthRedirect(
  redirectTarget: string,
  allowedPrefixes: string[] = getOAuthRedirectPrefixes(),
): boolean {
  try {
    const url = new URL(redirectTarget);
    if (url.protocol === 'chrome-extension:') {
      return allowedPrefixes.some((prefix) => redirectTarget.startsWith(prefix));
    }
    return url.protocol.length > 1 && url.host.length > 0;
  } catch {
    return false;
  }
}

export function isGoogleLoginAvailable(locale: string, env: EnvLike = import.meta.env): boolean {
  if (env['PUBLIC_AUTH_GOOGLE_ENABLED'] === 'false') {
    return false;
  }
  return isValidOAuthRedirect(getOAuthRedirect(locale, env), getOAuthRedirectPrefixes(env));
}
