import { describe, expect, it } from 'vitest';
import {
  buildSecurityConfig,
  connectSrc,
  CONNECT_ORIGIN_ENV_KEYS,
  cspDirectives,
  hardenCspMeta,
  originOf,
  RELAXED_STYLE_SRC,
  relaxStyleSrc,
  STATIC_CSP_DIRECTIVES,
} from '@/lib/csp';

describe('originOf', () => {
  it('returns null for an empty / undefined value', () => {
    expect(originOf(undefined)).toBeNull();
    expect(originOf('')).toBeNull();
  });

  it('returns null for a relative path (same-origin, covered by self)', () => {
    expect(originOf('/user')).toBeNull();
    expect(originOf('/media/v1')).toBeNull();
  });

  it('returns null for a non-http(s) absolute URL', () => {
    expect(originOf('mailto:nobody@example.com')).toBeNull();
    expect(originOf('ftp://files.example.com')).toBeNull();
  });

  it('returns the origin for absolute http(s) URLs (dropping path/query)', () => {
    expect(originOf('https://auth.example.com')).toBe('https://auth.example.com');
    expect(originOf('https://auth.example.com/user?x=1')).toBe('https://auth.example.com');
    expect(originOf('http://localhost:8000/media')).toBe('http://localhost:8000');
  });
});

describe('connectSrc', () => {
  it("defaults to just 'self' when nothing is configured", () => {
    expect(connectSrc({})).toEqual(["'self'"]);
  });

  it("keeps just 'self' when API bases are relative", () => {
    expect(
      connectSrc({ PUBLIC_AUTH_API_BASE: '/user', PUBLIC_MEDIA_API_BASE: '/media' }),
    ).toEqual(["'self'"]);
  });

  it('appends configured absolute origins', () => {
    expect(
      connectSrc({
        PUBLIC_AUTH_API_BASE: 'https://auth.example.com/user',
        PUBLIC_MEDIA_API_BASE: 'https://media.example.com/media',
        PUBLIC_PROMPT_API_BASE: 'https://prompt.example.com/prompt',
      }),
    ).toEqual([
      "'self'",
      'https://auth.example.com',
      'https://media.example.com',
      'https://prompt.example.com',
    ]);
  });

  it('deduplicates origins shared across keys', () => {
    expect(
      connectSrc({
        PUBLIC_AUTH_API_BASE: 'https://api.example.com/user',
        PUBLIC_MEDIA_API_BASE: 'https://api.example.com/media',
        PUBLIC_MEDIA_V1_BASE: 'https://api.example.com/v1',
        PUBLIC_PROMPT_API_BASE: 'https://api.example.com/prompt',
      }),
    ).toEqual(["'self'", 'https://api.example.com']);
  });

  it('reads from process.env by default', () => {
    expect(connectSrc()).toContain("'self'");
  });

  it('scans the documented connect-origin keys', () => {
    expect(CONNECT_ORIGIN_ENV_KEYS).toContain('PUBLIC_SITE_URL');
    expect(CONNECT_ORIGIN_ENV_KEYS).toContain('PUBLIC_AUTH_API_BASE');
    expect(CONNECT_ORIGIN_ENV_KEYS).toContain('PUBLIC_PROMPT_API_BASE');
    expect(CONNECT_ORIGIN_ENV_KEYS).toContain('PUBLIC_REPARTO_API_BASE');
    expect(CONNECT_ORIGIN_ENV_KEYS).toContain('PUBLIC_MEDIA_STORAGE_ORIGIN');
  });

  it('appends storage origin when PUBLIC_MEDIA_STORAGE_ORIGIN is configured', () => {
    expect(
      connectSrc({
        PUBLIC_AUTH_API_BASE: 'https://api.example.com/user',
        PUBLIC_MEDIA_API_BASE: 'https://api.example.com/media',
        PUBLIC_MEDIA_STORAGE_ORIGIN: 'https://storage.example.com',
      }),
    ).toEqual(["'self'", 'https://api.example.com', 'https://storage.example.com']);
  });

  it('ignores an empty storage origin safely', () => {
    expect(connectSrc({ PUBLIC_MEDIA_STORAGE_ORIGIN: '' })).toEqual(["'self'"]);
  });

  it('ignores an invalid (non-http) storage origin', () => {
    expect(connectSrc({ PUBLIC_MEDIA_STORAGE_ORIGIN: 'not-a-url' })).toEqual(["'self'"]);
  });

  it('deduplicates storage origin when it matches an API origin', () => {
    expect(
      connectSrc({
        PUBLIC_MEDIA_API_BASE: 'https://api.example.com/media',
        PUBLIC_MEDIA_STORAGE_ORIGIN: 'https://api.example.com',
      }),
    ).toEqual(["'self'", 'https://api.example.com']);
  });
});

describe('cspDirectives', () => {
  it('includes the static baseline and an env-derived connect-src', () => {
    const directives = cspDirectives({ PUBLIC_SITE_URL: 'https://docs.example.com' });
    for (const line of STATIC_CSP_DIRECTIVES) expect(directives).toContain(line);
    expect(directives).toContain("connect-src 'self' https://docs.example.com");
  });

  it('locks the baseline down and never declares script-src/style-src itself', () => {
    const directives = cspDirectives({});
    expect(directives).toContain("default-src 'self'");
    expect(directives).toContain("object-src 'none'");
    expect(directives).toContain("frame-ancestors 'none'");
    // Astro owns script-src/style-src; they must not appear here or it errors.
    expect(directives.some((d) => d.startsWith('script-src'))).toBe(false);
    expect(directives.some((d) => d.startsWith('style-src'))).toBe(false);
  });
});

describe('buildSecurityConfig', () => {
  it('wires directives + a wasm-unsafe-eval script directive for Pagefind', () => {
    const config = buildSecurityConfig({});
    expect(config.csp.directives).toEqual(cspDirectives({}));
    expect(config.csp.scriptDirective.resources).toEqual(["'self'", "'wasm-unsafe-eval'"]);
    // script-src is left for Astro to manage (self + per-build hashes); we never
    // hand it 'unsafe-inline'.
    expect(config.csp.scriptDirective.resources).not.toContain("'unsafe-inline'");
  });

  it('threads the provided env into connect-src', () => {
    const config = buildSecurityConfig({ PUBLIC_AUTH_API_BASE: 'https://auth.example.com' });
    expect(config.csp.directives).toContain("connect-src 'self' https://auth.example.com");
  });
});

describe('relaxStyleSrc', () => {
  it("replaces Astro's hashed style-src with a hash-free unsafe-inline one", () => {
    const input = "default-src 'self'; style-src 'self' 'sha256-abc' 'sha256-def';";
    expect(relaxStyleSrc(input)).toBe(`default-src 'self'; ${RELAXED_STYLE_SRC};`);
  });

  it('drops the hashes so unsafe-inline is honored by browsers', () => {
    expect(relaxStyleSrc("style-src 'self' 'sha256-abc';")).not.toContain('sha256');
  });

  it('appends style-src when the policy has none (terminated)', () => {
    expect(relaxStyleSrc("default-src 'self';")).toBe(
      `default-src 'self';${RELAXED_STYLE_SRC};`,
    );
  });

  it('appends style-src when the policy has none (unterminated)', () => {
    expect(relaxStyleSrc("default-src 'self'")).toBe(
      `default-src 'self';${RELAXED_STYLE_SRC};`,
    );
  });

  it('appends style-src to an empty policy', () => {
    expect(relaxStyleSrc('')).toBe(`${RELAXED_STYLE_SRC};`);
  });
});

describe('hardenCspMeta', () => {
  const meta = (content: string) =>
    `<meta http-equiv="content-security-policy" content="${content}">`;

  it('relaxes style-src inside the CSP meta tag', () => {
    const html = `<head>${meta("script-src 'self' 'sha256-x'; style-src 'self' 'sha256-y';")}</head>`;
    const out = hardenCspMeta(html);
    expect(out).toContain(`style-src 'self' 'unsafe-inline'`);
    expect(out).toContain(`script-src 'self' 'sha256-x'`); // script-src untouched
    expect(out).not.toContain("'sha256-y'");
  });

  it('leaves HTML without a CSP meta unchanged', () => {
    const html = '<head><title>style-src in prose stays put</title></head>';
    expect(hardenCspMeta(html)).toBe(html);
  });
});
