"use client";

import Link from "next/link";

import LanguageToggle from "@/components/LanguageToggle";
import V3SiteFooter from "@/components/v3/V3SiteFooter";
import V3ThemeToggle from "@/components/v3/V3ThemeToggle";
import { useI18n } from "@/lib/i18n/context";

type V3LegalPageShellProps = {
  pageKey: "about" | "terms" | "privacy" | "refund" | "disclaimer" | "contact";
  children: React.ReactNode;
};

export default function V3LegalPageShell({ pageKey, children }: V3LegalPageShellProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-8 flex flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4 border-[3px] border-ink bg-cream px-4 py-3 shadow-neo-sm">
          <div>
            <Link href="/options/unusual" className="font-display text-sm font-extrabold uppercase tracking-wider">
              OptionsAji <span className="opacity-55">v3</span>
            </Link>
            <h1 className="font-display mt-3 text-2xl md:text-3xl font-extrabold uppercase tracking-tight">
              {t(`v3.legal.${pageKey}.title`)}
            </h1>
            <p className="mt-1 text-sm text-ink/60">{t(`v3.legal.${pageKey}.subtitle`)}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <V3ThemeToggle />
            <LanguageToggle variant="neo" />
          </div>
        </header>

        <article className="border-[3px] border-ink bg-cream px-5 py-6 shadow-neo-sm space-y-4 text-sm leading-relaxed text-ink/85">
          <p className="border-2 border-ink bg-peach/30 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wide text-ink">
            {t("v3.legal.placeholderBanner")}
          </p>
          {children}
        </article>

        <V3SiteFooter />
      </div>
    </div>
  );
}
