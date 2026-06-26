import { describe, expect, it } from 'vitest';
import {
  getOAuthRedirect,
  getOAuthRedirectPrefixes,
  isGoogleLoginAvailable,
  isValidOAuthRedirect,
  isValidOAuthRedirectOverride,
} from '@/lib/authConfig';

// ---------------------------------------------------------------------------
// getOAuthRedirectPrefixes
// ---------------------------------------------------------------------------

describe('getOAuthRedirectPrefixes', () => {
  it('returns an empty list when the env var is absent', () => {
    expect(getOAuthRedirectPrefixes({})).toEqual([]);
  });

  it('returns an empty list when the env var is an empty string', () => {
    expect(getOAuthRedirectPrefixes({ PUBLIC_AUTH_OAUTH_ALLOWED_REDIRECT_PREFIXES: '' })).toEqual([]);
  });

  it('returns a single prefix', () => {
    expect(
      getOAuthRedirectPrefixes({
        PUBLIC_AUTH_OAUTH_ALLOWED_REDIRECT_PREFIXES: 'chrome-extension://abc123/',
      }),
    ).toEqual(['chrome-extension://abc123/']);
  });

  it('returns multiple prefixes (comma-separated)', () => {
    expect(
      getOAuthRedirectPrefixes({
        PUBLIC_AUTH_OAUTH_ALLOWED_REDIRECT_PREFIXES: 'chrome-extension://aaa/,chrome-extension://bbb/',
      }),
    ).toEqual(['chrome-extension://aaa/', 'chrome-extension://bbb/']);
  });

  it('trims whitespace from each prefix', () => {
    expect(
      getOAuthRedirectPrefixes({
        PUBLIC_AUTH_OAUTH_ALLOWED_REDIRECT_PREFIXES: '  chrome-extension://aaa/  ,  chrome-extension://bbb/  ',
      }),
    ).toEqual(['chrome-extension://aaa/', 'chrome-extension://bbb/']);
  });

  it('filters out empty entries produced by trailing commas', () => {
    expect(
      getOAuthRedirectPrefixes({
        PUBLIC_AUTH_OAUTH_ALLOWED_REDIRECT_PREFIXES: 'chrome-extension://aaa/,',
      }),
    ).toEqual(['chrome-extension://aaa/']);
  });
});

// ---------------------------------------------------------------------------
// getOAuthRedirect
// ---------------------------------------------------------------------------

describe('getOAuthRedirect', () => {
  it('returns PUBLIC_AUTH_OAUTH_REDIRECT verbatim when configured', () => {
    const target = 'chrome-extension://abc123/auth/callback';
    expect(
      getOAuthRedirect('en', { PUBLIC_AUTH_OAUTH_REDIRECT: target }),
    ).toBe(target);
  });

  it('builds a URL from window.location.origin when env var is absent', () => {
    const result = getOAuthRedirect('en', {});
    expect(result).toContain('/en/auth/callback');
    expect(result).toMatch(/^https?:\/\//);
  });

  it('builds a URL from window.location.origin for a different locale', () => {
    const result = getOAuthRedirect('fr', {});
    expect(result).toContain('/fr/auth/callback');
  });
});

// ---------------------------------------------------------------------------
// isValidOAuthRedirect
// ---------------------------------------------------------------------------

describe('isValidOAuthRedirect', () => {
  it('accepts a valid https URL (no prefix check needed)', () => {
    expect(isValidOAuthRedirect('https://app.example.com/auth/callback', [])).toBe(true);
  });

  it('accepts a valid http URL', () => {
    expect(isValidOAuthRedirect('http://localhost:4321/en/auth/callback', [])).toBe(true);
  });

  it('rejects an invalid URL', () => {
    expect(isValidOAuthRedirect('not-a-url', [])).toBe(false);
  });

  it('rejects a chrome-extension URL when no prefixes are configured (fail-closed)', () => {
    expect(
      isValidOAuthRedirect('chrome-extension://abc123/auth/callback', []),
    ).toBe(false);
  });

  it('rejects a chrome-extension URL when it does not match any configured prefix', () => {
    expect(
      isValidOAuthRedirect('chrome-extension://abc123/auth/callback', [
        'chrome-extension://other/',
      ]),
    ).toBe(false);
  });

  it('accepts a chrome-extension URL that starts with a configured prefix', () => {
    expect(
      isValidOAuthRedirect('chrome-extension://abc123/auth/callback', [
        'chrome-extension://abc123/',
      ]),
    ).toBe(true);
  });

  it('accepts a chrome-extension URL that matches any one of multiple prefixes', () => {
    expect(
      isValidOAuthRedirect('chrome-extension://bbb/auth/callback', [
        'chrome-extension://aaa/',
        'chrome-extension://bbb/',
      ]),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isValidOAuthRedirectOverride
// ---------------------------------------------------------------------------

describe('isValidOAuthRedirectOverride', () => {
  it('accepts an https URL that starts with an allowed prefix', () => {
    expect(
      isValidOAuthRedirectOverride('https://app.example.com/auth/callback', [
        'https://app.example.com/',
      ]),
    ).toBe(true);
  });

  it('rejects an https URL when no prefixes are configured (fail-closed)', () => {
    expect(isValidOAuthRedirectOverride('https://app.example.com/auth/callback', [])).toBe(false);
  });

  it('rejects an https URL when it does not match any configured prefix', () => {
    expect(
      isValidOAuthRedirectOverride('https://other.example.com/auth/callback', [
        'https://app.example.com/',
      ]),
    ).toBe(false);
  });

  it('accepts http://localhost (dev-only allowance)', () => {
    expect(isValidOAuthRedirectOverride('http://localhost:4321/en/auth/callback', [])).toBe(true);
  });

  it('accepts http://127.0.0.1 (dev-only allowance)', () => {
    expect(isValidOAuthRedirectOverride('http://127.0.0.1:4321/en/auth/callback', [])).toBe(true);
  });

  it('rejects http for a non-localhost host', () => {
    expect(isValidOAuthRedirectOverride('http://app.example.com/auth/callback', [])).toBe(false);
  });

  it('accepts a chrome-extension URL that starts with an allowed prefix', () => {
    expect(
      isValidOAuthRedirectOverride('chrome-extension://abc123/auth/callback', [
        'chrome-extension://abc123/',
      ]),
    ).toBe(true);
  });

  it('rejects a chrome-extension URL with no allowed prefixes (fail-closed)', () => {
    expect(isValidOAuthRedirectOverride('chrome-extension://abc123/auth/callback', [])).toBe(false);
  });

  it('rejects an invalid URL', () => {
    expect(isValidOAuthRedirectOverride('not-a-url', [])).toBe(false);
  });

  it('rejects other protocols (ftp:)', () => {
    expect(isValidOAuthRedirectOverride('ftp://files.example.com/callback', [])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isGoogleLoginAvailable
// ---------------------------------------------------------------------------

describe('isGoogleLoginAvailable', () => {
  it('returns false when PUBLIC_AUTH_GOOGLE_ENABLED is "false"', () => {
    expect(
      isGoogleLoginAvailable('en', { PUBLIC_AUTH_GOOGLE_ENABLED: 'false' }),
    ).toBe(false);
  });

  it('returns true when google is not disabled and no override is configured (same-origin)', () => {
    expect(isGoogleLoginAvailable('en', {})).toBe(true);
  });

  it('returns false when the configured redirect is a chrome-extension URL with no allowed prefixes', () => {
    expect(
      isGoogleLoginAvailable('en', {
        PUBLIC_AUTH_OAUTH_REDIRECT: 'chrome-extension://abc123/callback',
        // no PUBLIC_AUTH_OAUTH_ALLOWED_REDIRECT_PREFIXES → fail-closed
      }),
    ).toBe(false);
  });

  it('returns true when the configured chrome-extension redirect matches the allowed prefix', () => {
    expect(
      isGoogleLoginAvailable('en', {
        PUBLIC_AUTH_OAUTH_REDIRECT: 'chrome-extension://abc123/callback',
        PUBLIC_AUTH_OAUTH_ALLOWED_REDIRECT_PREFIXES: 'chrome-extension://abc123/',
      }),
    ).toBe(true);
  });

  it('returns true for an https override redirect that matches an allowed prefix', () => {
    expect(
      isGoogleLoginAvailable('en', {
        PUBLIC_AUTH_OAUTH_REDIRECT: 'https://app.example.com/en/auth/callback',
        PUBLIC_AUTH_OAUTH_ALLOWED_REDIRECT_PREFIXES: 'https://app.example.com/',
      }),
    ).toBe(true);
  });

  it('returns false for an https override redirect without a matching prefix', () => {
    expect(
      isGoogleLoginAvailable('en', {
        PUBLIC_AUTH_OAUTH_REDIRECT: 'https://app.example.com/en/auth/callback',
        // no prefix configured → fail-closed
      }),
    ).toBe(false);
  });

  it('returns true for an http localhost override redirect (dev case)', () => {
    expect(
      isGoogleLoginAvailable('en', {
        PUBLIC_AUTH_OAUTH_REDIRECT: 'http://localhost:4321/en/auth/callback',
      }),
    ).toBe(true);
  });

  it('returns false for an http non-localhost override redirect', () => {
    expect(
      isGoogleLoginAvailable('en', {
        PUBLIC_AUTH_OAUTH_REDIRECT: 'http://app.example.com/en/auth/callback',
      }),
    ).toBe(false);
  });
});
