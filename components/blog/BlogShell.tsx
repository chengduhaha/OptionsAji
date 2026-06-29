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
  title?: string;
  subtitle?: string;
  children: ReactNode;
  variant?: "default" | "hub" | "wide";
  hideHeader?: boolean;
};

const NAV_LINKS = [
  { href: "/blog", key: "blog.nav.home", exact: true },
  { href: "/blog#posts", key: "blog.nav.posts", hash: true },
  { href: "/blog/documents", key: "blog.nav.documents" },
] as const;

export default function BlogShell({
  title,
  subtitle,
  children,
  variant = "default",
  hideHeader = false,
}: BlogShellProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const maxWidth = variant === "wide" || variant === "hub" ? "max-w-6xl" : "max-w-4xl";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b-2 border-border bg-card/95 backdrop-blur-sm">
        <div className={cn("mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-3", maxWidth)}>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-primary bg-primary font-heading text-sm font-bold text-primary-foreground shadow-[2px_2px_0_0_hsl(var(--primary))]">
                A
              </span>
              <span className="hidden font-heading text-sm font-bold sm:inline">OptionsAji</span>
            </Link>
            <span className="hidden text-muted-foreground sm:inline">/</span>
            <Link
              href="/blog"
              className="font-heading text-sm font-bold text-primary underline-offset-4 hover:underline"
            >
              {t("blog.brand")}
            </Link>
          </div>
          <nav className="flex flex-wrap items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/blog"
                  ? pathname === "/blog"
                  : !("hash" in link && link.hash) &&
                    (pathname === link.href || pathname.startsWith(`${link.href}/`));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                    active
                      ? "bg-primary text-primary-foreground shadow-[1px_1px_0_0_hsl(var(--foreground)/0.2)]"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {t(link.key)}
                </Link>
              );
            })}
            <div className="ml-1 flex items-center gap-1 border-l border-border pl-2 sm:ml-2">
              <V4ThemeToggle />
              <V4LanguageToggle />
            </div>
          </nav>
        </div>
      </header>

      <main className={cn("mx-auto w-full flex-1 px-4 py-8 sm:py-10", maxWidth)}>
        {!hideHeader && title ? (
          <div className="mb-8 border-b-2 border-border pb-6">
            <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p> : null}
          </div>
        ) : null}
        {children}
      </main>

      <div className={cn("mx-auto w-full px-4 pb-10", maxWidth)}>
        <p className="mb-4 rounded-xl border-2 border-border bg-card px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          {t("blog.disclaimer")}
        </p>
        <V4SiteFooter />
      </div>
    </div>
  );
}
