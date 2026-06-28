"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { Check } from "lucide-react";

import V4StandaloneShell from "@/components/v4/V4StandaloneShell";
import { PRICING_TIERS } from "@/lib/membership-offer";
import { useI18n } from "@/lib/i18n/context";

export default function PricingPage() {
  const { t, locale } = useI18n();
  const isZh = locale === "zh";

  return (
    <V4StandaloneShell
      title={t("v3.membership.pricingTitle")}
      subtitle={t("v3.membership.pricingSubtitle")}
    >
      <div className="space-y-8">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-bold">{t("membershipOffer.pricingIntro.title")}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("membershipOffer.pricingIntro.body")}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3 md:items-stretch">
          {PRICING_TIERS.map((tier) => {
            const price = isZh ? tier.priceZh : tier.priceEn;

            return (
              <article
                key={tier.id}
                className={clsx(
                  "relative flex flex-col rounded-xl border border-border bg-card shadow-sm",
                  tier.featured && "border-primary/50 ring-1 ring-primary/20",
                )}
              >
                {tier.featured ? (
                  <div className="absolute -top-3 left-4 rounded-md bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                    {t("membershipOffer.recommended")}
                  </div>
                ) : null}
                <header className="border-b border-border px-4 py-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t(tier.eyebrowKey)}
                  </p>
                  <h2 className="font-heading text-xl font-bold">{t(tier.nameKey)}</h2>
                  <p className="mt-2 min-h-[3rem] text-sm leading-6 text-muted-foreground">
                    {t(tier.descriptionKey)}
                  </p>
                </header>
                <div className="flex flex-1 flex-col px-4 py-5">
                  <p className="mt-1 font-heading text-5xl font-bold tracking-tight">{price}</p>
                  <ul className="mt-5 flex-1 space-y-3">
                    {tier.featureKeys.map((key) => (
                      <li key={key} className="flex items-start gap-2 text-sm leading-5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{t(key)}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={tier.ctaHref}
                    className={clsx(
                      "mt-6 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold transition-colors",
                      tier.featured
                        ? "bg-primary text-primary-foreground hover:brightness-95"
                        : "border border-border bg-background hover:bg-secondary",
                    )}
                  >
                    {t(tier.ctaKey)}
                  </Link>
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
