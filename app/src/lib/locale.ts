import { DEFAULT_LOCALE, type Locale, isLocale } from "@/content/i18n/app";

export function localePath(locale: Locale, path: `/${string}`): string {
  return `/${locale}${path}`;
}

export function localeFromPath(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && isLocale(segment) ? segment : DEFAULT_LOCALE;
}
