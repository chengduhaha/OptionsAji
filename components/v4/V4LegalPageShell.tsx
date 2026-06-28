"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import V4LanguageToggle from "@/components/v4/V4LanguageToggle";
import V4LegalSection from "@/components/v4/V4LegalSection";
import V4SiteFooter from "@/components/v4/V4SiteFooter";
import V4ThemeToggle from "@/components/v4/V4ThemeToggle";
import V3LegalSections from "@/components/v3/V3LegalSections";
import { useI18n } from "@/lib/i18n/context";

type V4LegalPageShellProps = {
  pageKey: "about" | "terms" | "privacy" | "refund" | "disclaimer" | "contact";
  children?: ReactNode;
};

export default function V4LegalPageShell({ pageKey, children }: V4LegalPageShellProps) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 md:py-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-card px-4 py-4">
          <div>
            <Link href="/options/unusual" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-heading text-sm font-bold text-primary-foreground">
                A
              </span>
              <span className="font-heading text-sm font-bold">OptionsAji</span>
            </Link>
            <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight md:text-3xl">
              {t(`v3.legal.${pageKey}.title`)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t(`v3.legal.${pageKey}.subtitle`)}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <V4ThemeToggle />
            <V4LanguageToggle />
          </div>
        </header>

        <article className="rounded-xl border border-border bg-card px-5 py-6 text-sm leading-relaxed">
          <p className="mb-4 rounded-md border border-border bg-secondary/50 px-3 py-2 text-[11px] font-medium text-muted-foreground">
            {t("v3.legal.placeholderBanner")}
          </p>
          {children ?? <V3LegalSections pageKey={pageKey} />}
        </article>
      </div>
      <div className="mx-auto w-full max-w-3xl px-4 pb-8">
        <V4SiteFooter />
      </div>
    </div>
  );
}

export { V4LegalSection };
