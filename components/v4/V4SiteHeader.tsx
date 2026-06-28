"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Check } from "lucide-react";

import V4LanguageToggle from "@/components/v4/V4LanguageToggle";
import V4ThemeToggle from "@/components/v4/V4ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { membershipLabel } from "@/lib/membership";
import { V4_NAV_GROUPS, type V4NavLink } from "@/lib/v4/navConfig";
import { cn } from "@/lib/utils";

function NavDropdown({
  groupKey,
  links,
  pathname,
  t,
}: {
  groupKey: string;
  links: V4NavLink[];
  pathname: string;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeInGroup = links.some((l) => l.href === pathname);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors",
          activeInGroup
            ? "bg-primary/10 font-medium text-primary"
            : "text-foreground/70 hover:bg-secondary hover:text-foreground",
        )}
      >
        {t(groupKey)}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-40 mt-1.5 w-72 rounded-lg border border-border bg-popover p-1.5 shadow-lg">
          {links.map((l) => {
            const active = l.href === pathname;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                  active ? "bg-primary/10" : "hover:bg-secondary",
                )}
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  {active ? <Check className="h-4 w-4 text-primary" /> : null}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm font-medium",
                      active ? "text-primary" : "text-foreground",
                    )}
                  >
                    {t(l.labelKey)}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{t(l.taglineKey)}</span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function V4SiteHeader() {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const { user, ready, isMember, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/options/unusual" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-heading text-sm font-bold text-primary-foreground">
            A
          </span>
          <span className="leading-tight">
            <span className="block font-heading text-base font-bold tracking-tight">OptionsAji</span>
            <span className="block text-[11px] text-muted-foreground">{t("v4.brand.tagline")}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {V4_NAV_GROUPS.map((g) => (
            <NavDropdown
              key={g.groupKey}
              groupKey={g.groupKey}
              links={g.links}
              pathname={pathname}
              t={t}
            />
          ))}
          <Link
            href="/pricing"
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors",
              pathname === "/pricing"
                ? "bg-primary/10 font-medium text-primary"
                : "text-foreground/70 hover:bg-secondary hover:text-foreground",
            )}
          >
            {t("v3.membership.pricing")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <V4ThemeToggle />
          <V4LanguageToggle className="hidden sm:block" />
          {ready && user ? (
            <>
              <Link
                href="/account"
                className="hidden rounded-md border border-border px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary sm:block"
              >
                {membershipLabel(user.membership, locale)}
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin/codes"
                  className="hidden rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium sm:block"
                >
                  Admin
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => void logout()}
                className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                {t("v3.membership.logout")}
              </button>
            </>
          ) : ready ? (
            <>
              <Link
                href="/login"
                className="hidden rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground sm:block"
              >
                {t("v3.membership.login")}
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:brightness-95"
              >
                {t("v3.membership.register")}
              </Link>
            </>
          ) : null}
          {!isMember && ready ? (
            <Link
              href="/pricing"
              className="hidden rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary lg:block"
            >
              {t("v3.tier.unlockFull")}
            </Link>
          ) : null}
          <button
            type="button"
            aria-label={t("v4.nav.openMenu")}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-card lg:hidden">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="mb-3 sm:hidden">
              <V4LanguageToggle className="w-full" />
            </div>
            {V4_NAV_GROUPS.map((g) => (
              <div key={g.groupKey} className="mb-3">
                <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t(g.groupKey)}
                </div>
                <div className="flex flex-col gap-1">
                  {g.links.map((l) => {
                    const active = l.href === pathname;
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        className={cn(
                          "flex items-center justify-between rounded-md px-3 py-2 text-left transition-colors",
                          active ? "bg-primary/10" : "hover:bg-secondary",
                        )}
                      >
                        <span>
                          <span
                            className={cn(
                              "block text-sm font-medium",
                              active ? "text-primary" : "text-foreground",
                            )}
                          >
                            {t(l.labelKey)}
                          </span>
                          <span className="block text-xs text-muted-foreground">{t(l.taglineKey)}</span>
                        </span>
                        {active ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            <Link
              href="/pricing"
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground"
            >
              {t("v3.membership.pricing")}
            </Link>
            {ready && user ? (
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                <Link href="/account" className="rounded-md px-3 py-2 text-sm hover:bg-secondary">
                  {membershipLabel(user.membership, locale)}
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary"
                >
                  {t("v3.membership.logout")}
                </button>
              </div>
            ) : ready ? (
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                <Link href="/login" className="flex-1 rounded-md border border-border px-3 py-2 text-center text-sm">
                  {t("v3.membership.login")}
                </Link>
                <Link
                  href="/register"
                  className="flex-1 rounded-md bg-accent px-3 py-2 text-center text-sm font-semibold text-accent-foreground"
                >
                  {t("v3.membership.register")}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
