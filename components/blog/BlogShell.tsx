"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import V4LanguageToggle from "@/components/v4/V4LanguageToggle";
import V4SiteFooter from "@/components/v4/V4SiteFooter";
import V4ThemeToggle from "@/components/v4/V4ThemeToggle";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type BlogShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const NAV_LINKS = [
  { href: "/blog", key: "blog.nav.posts" },
  { href: "/blog/about", key: "blog.nav.about" },
] as const;

export default function BlogShell({ title, subtitle, children }: BlogShellProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/options/unusual" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-heading text-sm font-bold text-primary-foreground">
                A
              </span>
              <span className="font-heading text-sm font-bold">OptionsAji</span>
            </Link>
            <span className="hidden text-muted-foreground sm:inline">/</span>
            <Link href="/blog" className="font-heading text-sm font-semibold text-primary">
              {t("blog.brand")}
            </Link>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/blog"
                  ? pathname === "/blog"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {t(link.key)}
                </Link>
              );
            })}
            <div className="ml-2 flex items-center gap-1 border-l border-border pl-2">
              <V4ThemeToggle />
              <V4LanguageToggle />
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
        </div>
        {children}
      </main>

      <div className="mx-auto w-full max-w-4xl px-4 pb-8">
        <p className="mb-4 rounded-lg border border-border bg-card px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          {t("blog.disclaimer")}
        </p>
        <V4SiteFooter />
      </div>
    </div>
  );
}
