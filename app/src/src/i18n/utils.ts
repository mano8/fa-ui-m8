import { ui, defaultLang, showDefaultLang } from './ui';

type Ui = typeof ui;
type Lang = keyof Ui;
type TranslationKey = keyof Ui[typeof defaultLang];

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: TranslationKey) {
    return ui[lang]?.[key] || ui[defaultLang][key];
  }
}

export function useTranslatedPath(lang: Lang) {
  return function translatePath(path: string, l: Lang = lang) {
    return !showDefaultLang && l === defaultLang ? path : `/${l}${path}`
  }
}
