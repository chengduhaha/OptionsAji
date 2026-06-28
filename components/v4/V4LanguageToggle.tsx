"use client";

import { ChevronDown } from "lucide-react";

import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

const OPTIONS: Locale[] = ["zh", "en"];

export default function V4LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className={cn("relative shrink-0", className)}>
      <label htmlFor="v4-lang-select" className="sr-only">
        {t("language.label")}
      </label>
      <select
        id="v4-lang-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t("language.label")}
        className="h-9 min-w-[5.5rem] cursor-pointer appearance-none rounded-md border border-border bg-card py-0 pl-2.5 pr-7 text-sm text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {OPTIONS.map((option) => (
          <option key={option} value={option}>
            {t(`language.${option}`)}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}
