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
  translatePhraseToEnglish,
} from "./dictionary";
import type { I18nContextValue, Locale } from "./types";

const I18nContext = createContext<I18nContextValue | null>(null);

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE"]);
const ATTRIBUTES_TO_TRANSLATE = ["aria-label", "title", "placeholder", "value"] as const;
const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();

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

function shouldSkipElement(element: Element | null): boolean {
  for (let current = element; current; current = current.parentElement) {
    if (SKIP_TAGS.has(current.tagName)) return true;
    if (current instanceof HTMLElement && current.isContentEditable) return true;
  }
  return false;
}

function restoreTranslatedDom(root: ParentNode): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const original = originalText.get(node);
    if (original !== undefined) {
      node.nodeValue = original;
    }
  }

  const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll("*"))] : Array.from(document.body.querySelectorAll("*"));
  for (const element of elements) {
    const attrMap = originalAttributes.get(element);
    if (!attrMap) continue;
    for (const [name, value] of attrMap) {
      element.setAttribute(name, value);
    }
  }
}

function translateDomToEnglish(root: ParentNode): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
      return shouldSkipElement(node.parentElement)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });

  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const source = originalText.get(node) ?? node.nodeValue ?? "";
    const translated = translatePhraseToEnglish(source);
    if (translated !== source) {
      originalText.set(node, source);
      node.nodeValue = translated;
    }
  }

  const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll("*"))] : Array.from(document.body.querySelectorAll("*"));
  for (const element of elements) {
    if (shouldSkipElement(element)) continue;
    for (const name of ATTRIBUTES_TO_TRANSLATE) {
      const value = element.getAttribute(name);
      if (!value?.trim()) continue;
      let attrMap = originalAttributes.get(element);
      if (!attrMap) {
        attrMap = new Map();
        originalAttributes.set(element, attrMap);
      }
      const source = attrMap.get(name) ?? value;
      const translated = translatePhraseToEnglish(source);
      if (translated !== source) {
        attrMap.set(name, source);
        element.setAttribute(name, translated);
      }
    }
  }
}

function applyPhraseTranslation(locale: Locale): void {
  if (typeof document === "undefined" || !document.body) return;
  restoreTranslatedDom(document.body);
  if (locale === "en") {
    translateDomToEnglish(document.body);
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  useEffect(() => {
    persistLocale(locale);
    applyPhraseTranslation(locale);

    const observe = (observer: MutationObserver) => {
      if (!document.body) return;
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: [...ATTRIBUTES_TO_TRANSLATE],
      });
    };
    const observer = new MutationObserver(() => {
      observer.disconnect();
      applyPhraseTranslation(locale);
      observe(observer);
    });
    observe(observer);
    return () => observer.disconnect();
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) =>
      resolveDictionaryValue(locale, key) ??
      resolveDictionaryValue(DEFAULT_LOCALE, key) ??
      fallback ??
      key,
    [locale],
  );

  const translateText = useCallback(
    (text: string) => (locale === "en" ? translatePhraseToEnglish(text) : text),
    [locale],
  );

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
