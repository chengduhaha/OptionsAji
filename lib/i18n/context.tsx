"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_KEY,
  LOCALE_STORAGE_KEY,
  resolveDictionaryValue,
} from "./dictionary";
import type { I18nContextValue, Locale } from "./types";

export const LOCALE_CHANGE_EVENT = "optionsaji:locale-change";

const I18nContext = createContext<I18nContextValue | null>(null);

function normalizeLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : DEFAULT_LOCALE;
}

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

function persistLocale(locale: Locale): void {
  document.documentElement.lang = locale === "en" ? "en" : "zh";
  document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore storage failures */
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState((prev) => {
      if (prev === nextLocale) return prev;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(LOCALE_CHANGE_EVENT, { detail: { locale: nextLocale } }),
        );
      }
      return nextLocale;
    });
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) =>
      resolveDictionaryValue(locale, key) ??
      resolveDictionaryValue(DEFAULT_LOCALE, key) ??
      fallback ??
      key,
    [locale],
  );

  const translateText = useCallback((text: string) => text, []);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t, translateText }),
    [locale, setLocale, t, translateText],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
