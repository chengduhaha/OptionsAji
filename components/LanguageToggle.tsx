"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";

const OPTIONS: Locale[] = ["zh", "en"];

type LanguageToggleProps = {
  variant?: "sidebar" | "header";
};

export default function LanguageToggle({ variant = "sidebar" }: LanguageToggleProps) {
  const { locale, setLocale, t } = useI18n();
  const isHeader = variant === "header";

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
      <Languages
        className={
          isHeader
            ? "mx-1.5 h-4 w-4 text-muted-foreground"
            : "mx-1 h-3.5 w-3.5 text-muted-foreground"
        }
      />
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
