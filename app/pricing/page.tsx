"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { Check } from "lucide-react";

import V4StandaloneShell from "@/components/v4/V4StandaloneShell";
import { MEMBER_BILLING, PRICING_TIERS } from "@/lib/membership-offer";
import { useI18n } from "@/lib/i18n/context";

export default function PricingPage() {
  const { t, locale } = useI18n();
  const isZh = locale === "zh";

  const freeTier = PRICING_TIERS.find((tier) => tier.id === "free");
  const memberTier = PRICING_TIERS.find((tier) => tier.id === "member");

  if (!freeTier || !memberTier) {
    return null;
  }

  const annualBilling = MEMBER_BILLING.annual;

  return (
    <V4StandaloneShell
      title={t("membershipOffer.pricingPage.title")}
      subtitle={t("membershipOffer.pricingPage.subtitle")}
    >
      <div className="space-y-8">
        <div className="grid gap-5 md:grid-cols-2 md:items-stretch">
          <PricingCard tier={freeTier as FreePricingTier} isZh={isZh} t={t} />

          <article
            className={clsx(
              "relative flex flex-col rounded-xl border border-primary/50 bg-card shadow-sm ring-1 ring-primary/20",
            )}
          >
            <div className="absolute -top-3 left-4 rounded-md bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
              {t("membershipOffer.recommended")}
            </div>
            <header className="border-b border-border px-4 py-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {t(memberTier.eyebrowKey)}
              </p>
              <h2 className="font-heading text-xl font-bold">{t(memberTier.nameKey)}</h2>
              <p className="mt-2 min-h-[3rem] text-sm leading-6 text-muted-foreground">
                {t(memberTier.descriptionKey)}
              </p>
            </header>
            <div className="flex flex-1 flex-col px-4 py-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground line-through">
                  {isZh ? annualBilling.wasZh : annualBilling.wasEn}
                </p>
                <p className="font-heading text-5xl font-bold tracking-tight">
                  {isZh ? annualBilling.priceZh : annualBilling.priceEn}
                  <span className="text-lg font-semibold text-muted-foreground">
                    {isZh ? annualBilling.periodZh : annualBilling.periodEn}
                  </span>
                </p>
                <p className="text-sm font-medium text-primary">
                  {isZh ? annualBilling.monthlyEquivZh : annualBilling.monthlyEquivEn}
                  <span className="mx-1.5 text-muted-foreground">·</span>
                  <span className="text-muted-foreground">
                    {isZh ? "参考价" : "Reference"} {annualBilling.referenceEn}
                  </span>
                </p>
              </div>

              <ul className="mt-5 flex-1 space-y-3">
                {memberTier.featureKeys.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm leading-5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={memberTier.ctaHref}
                className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-95"
              >
                {t(memberTier.ctaKey)}
              </Link>
              <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                {t("membershipOffer.trialHint")}
              </p>
            </div>
          </article>
        </div>

        <p className="rounded-lg border border-dashed border-border bg-secondary/20 px-4 py-3 text-center text-sm text-muted-foreground">
          {t("membershipOffer.activationCodeNote")}
        </p>

        <section className="rounded-xl border border-border bg-secondary/30 p-6">
          <h2 className="font-heading text-lg font-bold">{t("v3.membership.contactTitle")}</h2>
          <ul className="mt-4 space-y-2 font-mono text-sm">
            <li>
              {t("v3.membership.contactWechat")}: <strong className="text-base">futurepulse5788</strong>
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

        <p className="text-center text-sm text-muted-foreground">
          {t("membershipOffer.privateGroupHint")}{" "}
          <Link href="/contact" className="font-semibold text-primary underline-offset-2 hover:underline">
            {t("membershipOffer.privateGroupCta")}
          </Link>
        </p>
      </div>
    </V4StandaloneShell>
  );
}

type FreePricingTier = Extract<(typeof PRICING_TIERS)[number], { id: "free" }>;

type PricingCardProps = {
  tier: FreePricingTier;
  isZh: boolean;
  t: (key: string) => string;
};

function PricingCard({ tier, isZh, t }: PricingCardProps) {
  const price = isZh ? tier.priceZh : tier.priceEn;

  return (
    <article className="relative flex flex-col rounded-xl border border-border bg-card shadow-sm">
      <header className="border-b border-border px-4 py-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {t(tier.eyebrowKey)}
        </p>
        <h2 className="font-heading text-xl font-bold">{t(tier.nameKey)}</h2>
        <p className="mt-2 min-h-[3rem] text-sm leading-6 text-muted-foreground">{t(tier.descriptionKey)}</p>
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
          className="mt-6 inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          {t(tier.ctaKey)}
        </Link>
      </div>
    </article>
  );
}
