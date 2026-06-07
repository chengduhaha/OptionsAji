export type Locale = "zh" | "en";

export type DictionaryValue = string | DictionaryTree;

export type DictionaryTree = {
  [key: string]: DictionaryValue;
};

export type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
  translateText: (text: string) => string;
};
