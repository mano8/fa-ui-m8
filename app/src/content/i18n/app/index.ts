import en from "./en";
import es from "./es";
import fr from "./fr";

export const translations = {
  en,
  es,
  fr,
};

export type Locale = keyof typeof translations;

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALES = Object.keys(translations) as Locale[];

export function isLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

export function getTranslations(locale: Locale) {
  return translations[locale] ?? translations.en;
}

export type AppTranslations = typeof en;
