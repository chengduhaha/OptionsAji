"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n/context";

type V3AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function V3AuthShell({ title, subtitle, children }: V3AuthShellProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
        <header className="mb-6 flex items-center justify-between gap-3 border-[3px] border-ink bg-cream px-4 py-2.5 shadow-neo-sm">
          <Link href="/options/unusual" className="font-display text-sm font-extrabold uppercase tracking-wider">
            OptionsAji <span className="opacity-55">v3</span>
          </Link>
          <LanguageToggle variant="neo" />
        </header>

        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-6 text-center">
            <span className="neo-badge font-mono text-[10px] uppercase">OA</span>
            <h1 className="font-display mt-4 text-3xl font-extrabold uppercase tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-ink/70">{subtitle}</p>
          </div>

          <section className="border-[3px] border-ink bg-cream p-6 shadow-neo">{children}</section>
        </div>

        <footer className="mt-6 text-center font-mono text-[11px] leading-5 text-ink/60">
          {t("v3.auth.disclaimer")}{" "}
          <Link href="/terms" className="underline hover:text-ink">
            {t("v3.auth.terms")}
          </Link>
          {" / "}
          <Link href="/privacy" className="underline hover:text-ink">
            {t("v3.auth.privacy")}
          </Link>
        </footer>
      </div>
    </div>
  );
}
