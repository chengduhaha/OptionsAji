"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import V4LanguageToggle from "@/components/v4/V4LanguageToggle";
import V4SiteFooter from "@/components/v4/V4SiteFooter";
import V4SiteHeader from "@/components/v4/V4SiteHeader";
import V4ThemeToggle from "@/components/v4/V4ThemeToggle";

type V4StandaloneShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showHeader?: boolean;
};

/** Standalone pages (pricing, account) outside /options layout. */
export default function V4StandaloneShell({
  title,
  subtitle,
  children,
  showHeader = true,
}: V4StandaloneShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {showHeader ? (
        <V4SiteHeader />
      ) : (
        <header className="border-b border-border bg-card px-4 py-3">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-heading text-sm font-bold text-primary-foreground">
                A
              </span>
              <span className="font-heading text-sm font-bold">OptionsAji</span>
            </Link>
            <div className="flex items-center gap-1.5">
              <V4ThemeToggle />
              <V4LanguageToggle />
            </div>
          </div>
        </header>
      )}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
        </div>
        {children}
      </main>
      <V4SiteFooter />
    </div>
  );
}
