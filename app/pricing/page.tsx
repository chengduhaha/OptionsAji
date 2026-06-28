"use client";

import Link from "next/link";
import { clsx } from "clsx";

import V4StandaloneShell from "@/components/v4/V4StandaloneShell";
import { useI18n } from "@/lib/i18n/context";
import { formatMessage } from "@/lib/i18n/dictionary";

const TIERS = [
  {
    id: "7D",
    daysKey: "v3.membership.tierDays7",
    labelKey: "v3.membership.tier7",
    usd: "$9.9",
    usdWas: "$19.9",
    cny: "¥69",
    cnyWas: "¥129",
    perDayUsd: "$1.41",
    perDayCny: "¥9.9",
    featured: false,
  },
  {
    id: "30D",
    daysKey: "v3.membership.tierDays30",
    labelKey: "v3.membership.tier30",
    usd: "$29",
    usdWas: "$59",
    cny: "¥199",
    cnyWas: "¥399",
    perDayUsd: "$0.97",
    perDayCny: "¥6.6",
    featured: false,
  },
  {
    id: "365D",
    daysKey: "v3.membership.tierDays365",
    labelKey: "v3.membership.tier365",
    usd: "$199",
    usdWas: "$399",
    cny: "¥1,399",
    cnyWas: "¥2,799",
    perDayUsd: "$0.55",
    perDayCny: "¥3.8",
    featured: true,
  },
] as const;

export default function PricingPage() {
  const { t, locale } = useI18n();
  const isZh = locale === "zh";

  return (
    <V4StandaloneShell
      title={t("v3.membership.pricingTitle")}
      subtitle={t("v3.membership.pricingSubtitle")}
    >
      <div className="space-y-8">
        <div className="grid gap-5 md:grid-cols-3 md:items-end">
          {TIERS.map((tier) => {
            const price = isZh ? tier.cny : tier.usd;
            const wasPrice = isZh ? tier.cnyWas : tier.usdWas;
            const perDay = isZh ? tier.perDayCny : tier.perDayUsd;

            return (
              <article
                key={tier.id}
                className={clsx(
                  "relative flex flex-col rounded-xl border border-border bg-card shadow-sm",
                  tier.featured && "md:-translate-y-2 border-primary/40 ring-1 ring-primary/20",
                )}
              >
                {tier.featured ? (
                  <div className="absolute -top-3 left-4 rounded-md bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                    ⭐ {t("v3.membership.tierFeatured")}
                  </div>
                ) : null}
                <header className="border-b border-border px-4 py-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t(tier.daysKey)}
                  </p>
                  <h2 className="font-heading text-xl font-bold">{t(tier.labelKey)}</h2>
                </header>
                <div className="flex flex-1 flex-col px-4 py-5">
                  <p className="font-mono text-[11px] text-muted-foreground line-through">
                    {t("v3.membership.tierWas")} {wasPrice}
                  </p>
                  <p className="mt-1 font-heading text-5xl font-bold tracking-tight">{price}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {formatMessage(t("v3.membership.tierPerDay"), { price: perDay })}
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {t("v3.membership.tierUnlock")}
                  </p>
                  <p className="mt-4 border-t border-border pt-3 font-mono text-[10px] text-muted-foreground">
                    OAJI-{tier.id}-••••••••
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <section className="rounded-xl border border-border bg-secondary/30 p-6">
          <h2 className="font-heading text-lg font-bold">{t("v3.membership.contactTitle")}</h2>
          <ul className="mt-4 space-y-2 font-mono text-sm">
            <li>
              {t("v3.membership.contactWechat")}: <strong className="text-base">183456821</strong>
            </li>
            <li>
              {t("v3.membership.contactDiscord")}: <strong className="text-base">ajifinance</strong>
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {t("v3.membership.contactSteps")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:brightness-95"
            >
              {t("v3.membership.register")}
            </Link>
            <Link
              href="/account"
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              {t("v3.membership.redeemCta")}
            </Link>
            <Link href="/options/unusual" className="self-center text-sm text-muted-foreground underline">
              ← Options
            </Link>
          </div>
        </section>
      </div>
    </V4StandaloneShell>
  );
}
