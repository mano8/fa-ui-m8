import { DEFAULT_LOCALE } from '@/content/i18n/app';

export function defaultLocaleRootRedirectUrl(url: URL): URL | null {
  if (url.pathname !== '/') return null;

  const redirectUrl = new URL(url.href);
  redirectUrl.pathname = `/${DEFAULT_LOCALE}/`;
  return redirectUrl;
}
