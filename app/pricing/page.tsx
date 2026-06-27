"use client";

import Link from "next/link";
import { clsx } from "clsx";

import LanguageToggle from "@/components/LanguageToggle";
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
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4 border-[3px] border-ink bg-cream px-4 py-3 shadow-neo-sm">
          <div>
            <Link href="/options/unusual" className="font-display text-sm font-extrabold uppercase tracking-wider">
              OptionsAji <span className="opacity-55">v3</span>
            </Link>
            <h1 className="font-display mt-3 text-3xl font-extrabold uppercase tracking-tight">
              {t("v3.membership.pricingTitle")}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-ink/70">{t("v3.membership.pricingSubtitle")}</p>
          </div>
          <LanguageToggle variant="neo" />
        </header>

        <div className="grid gap-5 md:grid-cols-3 md:items-end">
          {TIERS.map((tier) => {
            const price = isZh ? tier.cny : tier.usd;
            const wasPrice = isZh ? tier.cnyWas : tier.usdWas;
            const perDay = isZh ? tier.perDayCny : tier.perDayUsd;

            return (
              <article
                key={tier.id}
                className={clsx(
                  "relative flex flex-col border-[3px] border-ink bg-cream shadow-neo",
                  tier.featured && "md:-translate-y-2 md:scale-[1.02] bg-lavender/20",
                )}
              >
                {tier.featured ? (
                  <div className="absolute -top-3 left-4 border-[3px] border-ink bg-peach px-2 py-0.5 font-mono text-[10px] font-bold uppercase shadow-neo-sm">
                    ⭐ {t("v3.membership.tierFeatured")}
                  </div>
                ) : null}
                <header className="border-b-[3px] border-ink px-4 py-4">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50">
                    {t(tier.daysKey)}
                  </p>
                  <h2 className="font-display text-xl font-extrabold uppercase">{t(tier.labelKey)}</h2>
                </header>
                <div className="flex flex-1 flex-col px-4 py-5">
                  <p className="font-mono text-[11px] text-ink/50 line-through">
                    {t("v3.membership.tierWas")} {wasPrice}
                  </p>
                  <p className="font-display mt-1 text-5xl font-extrabold tracking-tight">{price}</p>
                  <p className="mt-2 font-mono text-[11px] text-ink/60">
                    {formatMessage(t("v3.membership.tierPerDay"), { price: perDay })}
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/75">{t("v3.membership.tierUnlock")}</p>
                  <p className="mt-4 border-t-2 border-ink/15 pt-3 font-mono text-[10px] text-ink/45">
                    OAJI-{tier.id}-••••••••
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <section className="border-[3px] border-ink bg-peach/30 p-6 shadow-neo">
          <h2 className="font-display text-lg font-extrabold uppercase">{t("v3.membership.contactTitle")}</h2>
          <ul className="mt-4 space-y-2 font-mono text-sm">
            <li>
              {t("v3.membership.contactWechat")}: <strong className="text-base">183456821</strong>
            </li>
            <li>
              {t("v3.membership.contactDiscord")}: <strong className="text-base">ajifinance</strong>
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-ink/80">{t("v3.membership.contactSteps")}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="border-[3px] border-ink bg-peach px-4 py-2 font-mono text-xs font-bold uppercase shadow-neo-sm hover:-translate-x-px hover:-translate-y-px"
            >
              {t("v3.membership.register")}
            </Link>
            <Link
              href="/account"
              className="border-[3px] border-ink bg-cream px-4 py-2 font-mono text-xs font-bold uppercase shadow-neo-sm hover:-translate-x-px hover:-translate-y-px"
            >
              {t("v3.membership.redeemCta")}
            </Link>
            <Link href="/options/unusual" className="self-center font-mono text-xs underline text-ink/70">
              ← Options
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
