"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import V4LanguageToggle from "@/components/v4/V4LanguageToggle";
import V4ThemeToggle from "@/components/v4/V4ThemeToggle";
import { useI18n } from "@/lib/i18n/context";

type V4AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function V4AuthShell({ title, subtitle, children }: V4AuthShellProps) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8">
        <header className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <Link href="/options/unusual" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-heading text-sm font-bold text-primary-foreground">
              A
            </span>
            <span className="font-heading text-sm font-bold">OptionsAji</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <V4ThemeToggle />
            <V4LanguageToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-6 text-center">
            <h1 className="font-heading text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">{children}</section>
        </div>

        <footer className="mt-6 text-center text-[11px] leading-5 text-muted-foreground">
          {t("v3.auth.disclaimer")}{" "}
          <Link href="/terms" className="underline hover:text-primary">
            {t("v3.auth.terms")}
          </Link>
          {" / "}
          <Link href="/privacy" className="underline hover:text-primary">
            {t("v3.auth.privacy")}
          </Link>
        </footer>
      </div>
    </div>
  );
}
