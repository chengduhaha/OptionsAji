"use client";

import Link from "next/link";

import { useI18n } from "@/lib/i18n/context";

const LEGAL_LINKS = [
  { href: "/about", key: "about" },
  { href: "/terms", key: "terms" },
  { href: "/privacy", key: "privacy" },
  { href: "/refund", key: "refund" },
  { href: "/disclaimer", key: "disclaimer" },
  { href: "/contact", key: "contact" },
  { href: "/pricing", key: "pricing" },
] as const;

type V3SiteFooterProps = {
  compact?: boolean;
};

export default function V3SiteFooter({ compact = false }: V3SiteFooterProps) {
  const { t } = useI18n();

  return (
    <footer
      className={
        compact
          ? "mt-4 border-[3px] border-ink bg-cream px-4 py-4 text-[11px] leading-relaxed text-ink/70 shadow-neo-sm"
          : "mt-6 border-[3px] border-ink bg-cream px-4 py-5 text-[11px] leading-relaxed text-ink/70 shadow-neo-sm"
      }
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <p className="font-display text-xs font-extrabold uppercase tracking-wider text-ink">
            {t("v3.footer.brand")}
          </p>
          <p className="text-ink/60">{t("v3.footer.tagline")}</p>
          <p className="font-mono text-[10px] text-ink/50">{t("v3.footer.address")}</p>
        </div>
        <nav aria-label={t("v3.footer.legalNav")} className="flex flex-wrap gap-x-3 gap-y-1">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[10px] font-bold uppercase tracking-wide text-ink/70 hover:text-ink underline-offset-2 hover:underline"
            >
              {t(`v3.footer.links.${link.key}`)}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mt-4 border-t-2 border-ink/15 pt-3 font-mono text-[10px] text-ink/50">
        {t("v3.footer.copyright")}{" "}
        <Link href="/disclaimer" className="underline underline-offset-2 hover:text-ink">
          {t("v3.footer.disclaimerLink")}
        </Link>
      </p>
    </footer>
  );
}
