"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Check, Database, LineChart, LockKeyhole, Sparkles } from "lucide-react";

import BlogAdvantagesSection from "@/components/blog/BlogAdvantagesSection";
import V4SiteFooter from "@/components/v4/V4SiteFooter";
import V4SiteHeader from "@/components/v4/V4SiteHeader";
import { MEMBERSHIP_VALUE_KEYS } from "@/lib/membership-offer";
import { useI18n } from "@/lib/i18n/context";

const BOARD_PREVIEW = [
  { rank: "01", symbol: "SPY", signal: "GEX", value: "+2.4B" },
  { rank: "02", symbol: "NVDA", signal: "VOL/OI", value: "18.6x" },
  { rank: "03", symbol: "TSLA", signal: "IV Rank", value: "84" },
  { rank: "04", symbol: "QQQ", signal: "Flow", value: "$42M" },
] as const;

const PILLAR_ICONS = {
  contentLibrary: BookOpen,
  dataDashboards: BarChart3,
  courseArchive: Database,
  ongoingUpdates: LineChart,
  community: Sparkles,
} as const;

export default function HomeLandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <V4SiteHeader />
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {t("home.hero.badge")}
              </div>
              <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {t("home.hero.title")}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t("home.hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/options/unusual"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:brightness-95"
                >
                  {t("home.hero.primaryCta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  {t("home.hero.secondaryCta")}
                </Link>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t("home.hero.riskNote")}</p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("home.preview.label")}
                  </p>
                  <h2 className="font-heading text-lg font-bold">{t("home.preview.title")}</h2>
                </div>
                <span className="rounded-md border border-border px-2 py-1 font-mono text-xs text-muted-foreground">
                  US Options
                </span>
              </div>
              <div className="space-y-2">
                {BOARD_PREVIEW.map((row, index) => (
                  <div key={row.rank} className="grid grid-cols-[2.5rem_1fr_5rem_4rem] items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                    <span className="font-mono text-xs text-muted-foreground">{row.rank}</span>
                    <span className="font-mono font-semibold">{index < 3 ? "••••" : row.symbol}</span>
                    <span className="text-xs text-muted-foreground">{row.signal}</span>
                    <span className="text-right font-mono text-xs font-semibold text-primary">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-dashed border-border bg-secondary/30 p-3 text-xs leading-relaxed text-muted-foreground">
                <LockKeyhole className="mr-1 inline h-3.5 w-3.5 text-primary" />
                {t("home.preview.paywall")}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-7 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("home.value.eyebrow")}</p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight">{t("home.value.title")}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{t("home.value.subtitle")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MEMBERSHIP_VALUE_KEYS.map((key) => {
              const Icon = PILLAR_ICONS[key];
              return (
                <article key={key} className="rounded-lg border border-border bg-card p-5">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 font-heading text-base font-bold">{t(`membershipOffer.value.${key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(`membershipOffer.value.${key}.body`)}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-6">
              <h2 className="font-heading text-2xl font-bold">{t("home.data.title")}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t("home.data.body")}</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {["unusual", "gex", "volume", "sentiment"].map((item) => (
                  <Link
                    key={item}
                    href={item === "gex" ? "/options/gex" : `/options/${item}`}
                    className="rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    {t(`home.data.${item}`)}
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-6">
              <h2 className="font-heading text-2xl font-bold">{t("home.library.title")}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t("home.library.body")}</p>
              <ul className="mt-5 space-y-3">
                {["reports", "research", "courses"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{t(`home.library.${item}`)}</span>
                  </li>
                ))}
              </ul>
              <Link href="/blog/documents" className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline">
                {t("home.library.cta")} →
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <BlogAdvantagesSection />
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
            <h2 className="font-heading text-2xl font-bold">{t("home.cta.title")}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{t("home.cta.body")}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/pricing" className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                {t("home.cta.primary")}
              </Link>
              <Link href="/blog" className="rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-secondary">
                {t("home.cta.secondary")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <V4SiteFooter />
    </div>
  );
}
