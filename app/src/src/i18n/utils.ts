import { ui, defaultLang, showDefaultLang } from './ui';

type TranslationKey = keyof typeof ui[typeof defaultLang];
type SupportedLang = keyof typeof ui;

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: SupportedLang) {
  return function t(key: TranslationKey) {
    return ui[lang]?.[key] || ui[defaultLang][key];
  }
}

export function useTranslatedPath(lang: SupportedLang) {
  return function translatePath(path: string, l: SupportedLang = lang) {
    return !showDefaultLang && l === defaultLang ? path : `/${l}${path}`
  }
}
