"use client";

import Link from "next/link";

import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import { V4_FOOTER_COLS } from "@/lib/v4/navConfig";

export default function V4SiteFooter() {
  const { t } = useI18n();
  const { ready, isAdmin } = useAuth();

  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-heading text-sm font-bold text-primary-foreground">
                A
              </span>
              <span className="font-heading text-base font-bold tracking-tight">OptionsAji</span>
            </div>
            <p className="mt-3 max-w-xs text-pretty text-xs leading-relaxed text-muted-foreground">
              {t("v4.footer.tagline")}
            </p>
          </div>
          {V4_FOOTER_COLS.map((col) => (
            <div key={col.titleKey}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t(col.titleKey)}
              </h4>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={`${col.titleKey}-${l.href}-${l.labelKey}`}>
                    <Link
                      href={l.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-primary"
                    >
                      {t(l.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {ready && isAdmin ? (
          <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 px-4 py-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t("blog.admin.hub")}
            </h4>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link href="/admin/blog" className="text-foreground/80 hover:text-primary">
                {t("blog.admin.nav")}
              </Link>
              <Link href="/admin/documents" className="text-foreground/80 hover:text-primary">
                {t("blog.admin.documents.nav")}
              </Link>
              <Link href="/admin/courses" className="font-semibold text-primary hover:underline">
                {t("blog.admin.courses.nav")}
              </Link>
              <Link href="/admin/codes" className="text-foreground/80 hover:text-primary">
                {t("blog.admin.codes.nav")}
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          <p className="text-pretty">{t("v4.footer.risk")}</p>
          <p className="mt-2">
            {t("v4.footer.copyright")}{" "}
            <Link href="/disclaimer" className="underline hover:text-primary">
              {t("v3.footer.disclaimerLink")}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
