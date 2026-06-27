"use client";

import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";

const OPTIONS: Locale[] = ["zh", "en"];

type LanguageToggleProps = {
  variant?: "sidebar" | "header" | "neo";
};

export default function LanguageToggle({ variant = "sidebar" }: LanguageToggleProps) {
  const { locale, setLocale, t } = useI18n();
  const isHeader = variant === "header";
  const isNeo = variant === "neo";

  if (isNeo) {
    return (
      <div className="relative shrink-0">
        <label htmlFor="v3-lang-select" className="sr-only">
          {t("v3.lang.label")}
        </label>
        <select
          id="v3-lang-select"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          aria-label={t("v3.lang.label")}
          className="h-[26px] min-w-[4.5rem] cursor-pointer appearance-none border-2 border-ink bg-cream py-0 pl-2 pr-6 font-mono text-[10px] font-bold uppercase tracking-wide text-ink shadow-neo-sm transition-colors hover:bg-peach/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-peach"
        >
          {OPTIONS.map((option) => (
            <option key={option} value={option}>
              {t(`v3.lang.${option}`)}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-ink"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      className={
        isHeader
          ? "flex items-center gap-0.5 rounded-lg border border-border2 bg-panel/90 p-0.5 shadow-sm backdrop-blur-sm"
          : "flex items-center gap-1 rounded-lg border border-glass-border bg-glass p-1"
      }
      aria-label={t("language.label")}
      title={t("language.label")}
    >
      {OPTIONS.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={active}
            aria-label={option === "zh" ? t("language.switchToZh") : t("language.switchToEn")}
            className={
              active
                ? isHeader
                  ? "rounded-md bg-primary px-2.5 py-1.5 text-[12px] font-medium text-primary-foreground"
                  : "rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground"
                : isHeader
                  ? "rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                  : "rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {t(`language.${option}`)}
          </button>
        );
      })}
    </div>
  );
}
