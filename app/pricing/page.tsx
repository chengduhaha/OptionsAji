"use client";

import Link from "next/link";

import { NeoPanel } from "@/components/v3/NeoPanel";
import { useI18n } from "@/lib/i18n/context";

const TIERS = [
  { id: "7D", usd: "$9.9", cny: "¥69", labelKey: "v3.membership.tier7", featured: false },
  { id: "30D", usd: "$29", cny: "¥199", labelKey: "v3.membership.tier30", featured: false },
  { id: "365D", usd: "$199", cny: "¥1,399", labelKey: "v3.membership.tier365", featured: true },
] as const;

export default function PricingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold uppercase">{t("v3.membership.pricingTitle")}</h1>
            <p className="text-sm text-ink/70 mt-1">{t("v3.membership.pricingSubtitle")}</p>
          </div>
          <Link href="/options/unusual" className="font-mono text-xs underline">
            ← Options
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map((tier) => (
            <NeoPanel
              key={tier.id}
              title={t(tier.labelKey)}
              accent={tier.featured ? "peach" : "lavender"}
            >
              {tier.featured ? (
                <span className="inline-block mb-3 border-2 border-ink bg-lavender px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                  ⭐ {t("v3.membership.tierFeatured")}
                </span>
              ) : null}
              <p className="font-display text-4xl font-extrabold">{tier.usd}</p>
              <p className="font-mono text-sm text-ink/70 mt-1">{tier.cny}</p>
              <p className="font-mono text-[11px] mt-3 text-ink/60">OAJI-{tier.id}-••••</p>
            </NeoPanel>
          ))}
        </div>

        <NeoPanel title={t("v3.membership.contactTitle")} accent="peach">
          <ul className="space-y-2 font-mono text-sm">
            <li>
              {t("v3.membership.contactWechat")}: <strong>183456821</strong>
            </li>
            <li>
              {t("v3.membership.contactDiscord")}: <strong>ajifinance</strong>
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-ink/80">{t("v3.membership.contactSteps")}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/register" className="neo-button">{t("v3.membership.register")}</Link>
            <Link href="/account" className="neo-button">{t("v3.membership.redeemCta")}</Link>
          </div>
        </NeoPanel>
      </div>
    </div>
  );
}
