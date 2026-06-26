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

/**
 * Validate an absolute `PUBLIC_AUTH_OAUTH_REDIRECT` override against the same
 * policy the auth backend applies:
 *
 * - `https://`           → must start with an entry in `allowedPrefixes` (fail-closed)
 * - `chrome-extension://`→ must start with an entry in `allowedPrefixes` (fail-closed)
 * - `http://`            → localhost / 127.0.0.1 only (dev-only allowance)
 * - anything else        → rejected
 *
 * This function is only called for explicit overrides.  Same-origin callbacks
 * (the no-override default) are always accepted without a prefix check because
 * they are generated from the current site's own origin.
 *
 * Backend validation remains the security authority; this is an early-warning
 * gate so operators see unsafe config at build/startup time instead of at the
 * backend rejection step.
 */
export function isValidOAuthRedirectOverride(
  redirectTarget: string,
  allowedPrefixes: string[],
): boolean {
  try {
    const url = new URL(redirectTarget);
    if (url.protocol === 'https:' || url.protocol === 'chrome-extension:') {
      return allowedPrefixes.some((prefix) => redirectTarget.startsWith(prefix));
    }
    if (url.protocol === 'http:') {
      return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    }
    return false;
  } catch {
    return false;
  }
}

export function isGoogleLoginAvailable(locale: string, env: EnvLike = import.meta.env): boolean {
  if (env['PUBLIC_AUTH_GOOGLE_ENABLED'] === 'false') {
    return false;
  }
  const override = env['PUBLIC_AUTH_OAUTH_REDIRECT'];
  if (override) {
    return isValidOAuthRedirectOverride(override, getOAuthRedirectPrefixes(env));
  }
  // Same-origin generated callback is always acceptable.
  return true;
}
