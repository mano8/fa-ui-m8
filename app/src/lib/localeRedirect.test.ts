import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE } from '@/content/i18n/app';
import { defaultLocaleRootRedirectUrl } from '@/lib/localeRedirect';

describe('defaultLocaleRootRedirectUrl', () => {
  it('redirects the site root to the default locale root', () => {
    const redirect = defaultLocaleRootRedirectUrl(new URL('http://localhost:4321/'));

    expect(redirect?.href).toBe(`http://localhost:4321/${DEFAULT_LOCALE}/`);
  });

  it('preserves query parameters on the root redirect', () => {
    const redirect = defaultLocaleRootRedirectUrl(new URL('http://localhost:4321/?next=/media'));

    expect(redirect?.href).toBe(`http://localhost:4321/${DEFAULT_LOCALE}/?next=/media`);
  });

  it('leaves localized paths untouched', () => {
    expect(defaultLocaleRootRedirectUrl(new URL('http://localhost:4321/en/media'))).toBeNull();
    expect(defaultLocaleRootRedirectUrl(new URL('http://localhost:4321/fr/'))).toBeNull();
  });
});
