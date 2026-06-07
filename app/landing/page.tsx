"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import {
  ArrowRight, BarChart3, Brain, Calendar,
  Globe, ScanLine, Sparkles, Star, Check, Activity, ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";
import { useI18n } from "@/lib/i18n/context";

const FEATURE_KEYS = ["gex", "ai", "scanner", "earnings", "macro"] as const;
const FEATURE_ICONS = [BarChart3, Brain, ScanLine, Calendar, Globe];

const STAT_KEYS = ["perspectives", "dataSources", "education", "noCustody"] as const;
const STAT_VALUES = ["50+", "多源", "教育", "0"];

const PRICING_TIERS = [
  { tier: "Free", price: "$0", periodKey: "freePeriod", descKey: "freeDesc", featuresKey: "freeFeatures", ctaKey: "ctaFree", popular: false },
  { tier: "Pro", price: "$49", periodKey: "monthly", descKey: "proDesc", featuresKey: "proFeatures", ctaKey: "ctaPro", popular: true },
  { tier: "Advanced", price: "$149", periodKey: "monthly", descKey: "advancedDesc", featuresKey: "advancedFeatures", ctaKey: "ctaSales", popular: false },
] as const;

const TESTIMONIAL_KEYS = [
  { key: "jason", author: "Jason L.", avatar: "JL" },
  { key: "sarah", author: "Sarah W.", avatar: "SW" },
  { key: "mike", author: "Mike C.", avatar: "MC" },
] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={clsx(
        "transition-all duration-700 ease-out will-change-transform",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
      {children}
    </span>
  );
}

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border2 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-[12px] font-bold text-primary-foreground">
              OA
            </div>
            <span className="text-[16px] font-semibold tracking-tight">OptionsAji</span>
          </Link>
          <div className="hidden items-center gap-9 md:flex">
            <a href="#features" className="text-[14px] text-muted-foreground transition-colors hover:text-foreground">{t("landing.nav.features")}</a>
            <a href="#ai" className="text-[14px] text-muted-foreground transition-colors hover:text-foreground">{t("landing.nav.ai")}</a>
            <a href="#pricing" className="text-[14px] text-muted-foreground transition-colors hover:text-foreground">{t("landing.nav.pricing")}</a>
            <a href="#testimonials" className="text-[14px] text-muted-foreground transition-colors hover:text-foreground">{t("landing.nav.testimonials")}</a>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle variant="header" />
            <Link href="/login" className="hidden rounded-lg px-4 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
              {t("landing.nav.login")}
            </Link>
            <Link href="/register" className="lift inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground">
              {t("landing.nav.getStarted")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative px-6 pt-40 pb-24">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px]"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border2 bg-card px-4 py-1.5 shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[13px] text-muted-foreground">{t("landing.hero.badge")}</span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="display-1 text-[clamp(2.75rem,6vw,5rem)] text-foreground">
              {t("landing.hero.titleLine1")}
              <br />
              <span className="text-primary">{t("landing.hero.titleLine2")}</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-7 max-w-2xl text-[17px] leading-relaxed text-muted-foreground md:text-[19px]">
              {t("landing.hero.subtitle")}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register" className="lift inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-[15px] font-semibold text-primary-foreground">
                {t("landing.hero.ctaPrimary")} <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:border-primary/40">
                {t("landing.hero.ctaSecondary")}
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={320} className="mx-auto mt-20 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-1.5 border-b border-border2 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red/60" />
              <span className="h-3 w-3 rounded-full bg-primary/60" />
              <span className="h-3 w-3 rounded-full bg-green/60" />
              <span className="ml-3 text-[11px] text-muted">{t("landing.hero.mockUrl")}</span>
            </div>
            <div className="flex">
              <div className="hidden w-16 space-y-3 border-r border-border2 p-3 md:block">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-9 w-9 rounded-lg surface-1" />
                ))}
              </div>
              <div className="flex-1 p-6">
                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {["SPY", "QQQ", "DIA", "IWM"].map((symbol, i) => (
                    <div key={symbol} className="rounded-xl surface-1 px-4 py-3.5">
                      <div className="stat-label">{symbol}</div>
                      <div className="stat-value mt-1.5 text-[24px]">{(540 + i * 56).toFixed(2)}</div>
                      <div className={clsx("mt-1 text-[12px] font-medium tabular-nums", i % 2 === 0 ? "text-green" : "text-red")}>
                        {i % 2 === 0 ? "+" : "−"}{(0.4 + i * 0.5).toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl surface-1 p-4">
                    <div className="stat-label mb-3">GEX PROFILE</div>
                    <div className="flex h-24 items-end gap-1">
                      {[...Array(22)].map((_, i) => (
                        <div key={i} className={clsx("flex-1 rounded-t", i < 11 ? "bg-red/35" : "bg-green/40")} style={{ height: `${24 + ((i * 37) % 60)}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl surface-1 p-4">
                    <div className="stat-label mb-3">{t("landing.hero.aiNotes")}</div>
                    <div className="space-y-2">
                      {[
                        { s: "NVDA", tag: t("landing.hero.tagScenario") },
                        { s: "AAPL", tag: t("landing.hero.tagVol") },
                        { s: "SPY", tag: t("landing.hero.tagStructure") },
                      ].map((r) => (
                        <div key={r.s} className="flex items-center gap-2 rounded-lg bg-card px-2.5 py-2">
                          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">{r.tag}</span>
                          <span className="font-mono text-[12px]">{r.s}</span>
                          <span className="ml-auto text-[11px] text-muted-foreground">{t("landing.hero.organized")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-y border-border2 bg-card/40 px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {STAT_KEYS.map((key, i) => (
            <Reveal key={key} delay={i * 80} className="text-center">
              <div className="stat-value text-[40px] text-foreground">{STAT_VALUES[i]}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{t(`landing.stats.${key}`)}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="features" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow><Sparkles className="h-3.5 w-3.5" /> {t("landing.features.eyebrow")}</Eyebrow>
            <h2 className="display-2 mt-4 text-foreground">{t("landing.features.title")}</h2>
            <p className="mt-4 text-[17px] text-muted-foreground">{t("landing.features.subtitle")}</p>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURE_KEYS.map((key, idx) => {
              const Icon = FEATURE_ICONS[idx];
              return (
                <Reveal key={key} delay={(idx % 3) * 90}>
                  <div className="lift h-full rounded-2xl border border-border bg-card p-7">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="heading-2 mt-5 text-foreground">{t(`landing.features.${key}.title`)}</h3>
                    <p className="mt-2.5 text-[14px] leading-relaxed text-muted-foreground">{t(`landing.features.${key}.description`)}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="ai" className="relative overflow-hidden bg-[#0b0f17] px-6 py-28 text-white">
        <div
          className="pointer-events-none absolute inset-0 -z-0"
          style={{ background: "radial-gradient(ellipse 60% 50% at 30% 0%, rgba(240,180,41,0.12) 0%, transparent 60%)" }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <Eyebrow><Brain className="h-3.5 w-3.5" /> {t("landing.ai.eyebrow")}</Eyebrow>
            <h2 className="display-2 mt-4 text-white">
              {t("landing.ai.titleLine1")}
              <br />
              <span className="text-primary">{t("landing.ai.titleLine2")}</span>
            </h2>
            <p className="mt-6 text-[17px] leading-relaxed text-white/65">{t("landing.ai.subtitle")}</p>
            <div className="mt-8 space-y-3.5">
              {(["bullet1", "bullet2", "bullet3", "bullet4"] as const).map((key) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-[15px] text-white/85">{t(`landing.ai.${key}`)}</span>
                </div>
              ))}
            </div>
            <Link href="/ai" className="lift mt-9 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[14px] font-semibold text-primary-foreground">
              {t("landing.ai.cta")} <Sparkles className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={160}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-[11px] font-bold text-primary-foreground">OA</div>
                <div>
                  <div className="text-[13px] font-semibold text-white">OptionsAji AI</div>
                  <div className="flex items-center gap-1 text-[11px] text-white/50"><Activity className="h-3 w-3 text-green" /> {t("landing.ai.online")}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-white/10 px-4 py-3">
                    <p className="text-[13px] text-white/90">{t("landing.ai.sampleQuestion")}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-[9px] font-bold text-primary-foreground">OA</div>
                  <div className="flex-1 rounded-2xl rounded-tl-md bg-white/[0.06] px-4 py-3">
                    <p className="text-[13px] leading-relaxed text-white/85">{t("landing.ai.sampleAnswer")}</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="pricing" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow><Star className="h-3.5 w-3.5" /> {t("landing.pricing.eyebrow")}</Eyebrow>
            <h2 className="display-2 mt-4 text-foreground">{t("landing.pricing.title")}</h2>
            <p className="mt-4 text-[17px] text-muted-foreground">{t("landing.pricing.subtitle")}</p>
          </Reveal>
          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {PRICING_TIERS.map((plan, idx) => (
              <Reveal key={plan.tier} delay={idx * 90}>
                <div className={clsx(
                  "relative flex h-full flex-col rounded-2xl border bg-card p-7",
                  plan.popular ? "border-primary/50 shadow-[0_20px_50px_-20px_rgba(200,136,26,0.45)]" : "border-border",
                )}>
                  {plan.popular ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
                      {t("landing.pricing.popular")}
                    </div>
                  ) : null}
                  <div className="text-[13px] font-semibold text-primary">{plan.tier}</div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="stat-value text-[38px] text-foreground">{plan.price}</span>
                    <span className="text-[14px] text-muted">{t(`landing.pricing.${plan.periodKey}`)}</span>
                  </div>
                  <p className="mt-2 text-[13px] text-muted-foreground">{t(`landing.pricing.${plan.descKey}`)}</p>
                  <div className="my-7 space-y-3 border-t border-border2 pt-7">
                    {t(`landing.pricing.${plan.featuresKey}`).split("|").map((feature) => (
                      <div key={feature} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 flex-shrink-0 text-green" />
                        <span className="text-[13px] text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={plan.tier === "Free" ? "/register" : plan.tier === "Pro" ? "/profile" : "/contact"}
                    className={clsx(
                      "mt-auto inline-flex w-full items-center justify-center rounded-xl py-3 text-[14px] font-semibold transition-all",
                      plan.popular
                        ? "lift bg-primary text-primary-foreground"
                        : "border border-border bg-card text-foreground hover:border-primary/40",
                    )}
                  >
                    {t(`landing.pricing.${plan.ctaKey}`)}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-7 text-center text-[12px] text-muted-foreground">{t("landing.pricing.footnote")}</p>
        </div>
      </section>

      <section id="testimonials" className="border-t border-border2 bg-card/40 px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow><Star className="h-3.5 w-3.5" /> {t("landing.testimonials.eyebrow")}</Eyebrow>
            <h2 className="display-2 mt-4 text-foreground">{t("landing.testimonials.title")}</h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIAL_KEYS.map((item, idx) => (
              <Reveal key={item.key} delay={idx * 90}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="flex-1 text-[15px] leading-relaxed text-foreground">
                    {`"${t(`landing.testimonials.${item.key}.quote`)}"`}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                      <span className="text-[11px] font-bold text-primary">{item.avatar}</span>
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-foreground">{item.author}</div>
                      <div className="text-[12px] text-muted">{t(`landing.testimonials.${item.key}.role`)}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <Reveal className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-border bg-card p-7">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-[17px] font-semibold text-foreground">{t("landing.risk.title")}</h2>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 text-[13px] leading-relaxed text-muted-foreground md:grid-cols-2">
              <p>{t("landing.risk.p1")}</p>
              <p>{t("landing.risk.p2")}</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="px-6 pb-28">
        <Reveal className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-[#0b0f17] px-8 py-20 text-center">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(240,180,41,0.16) 0%, transparent 60%)" }}
            />
            <div className="relative">
              <h2 className="display-1 text-[clamp(2rem,4vw,3.25rem)] text-white">{t("landing.cta.title")}</h2>
              <p className="mx-auto mt-5 max-w-xl text-[17px] text-white/65">{t("landing.cta.subtitle")}</p>
              <Link href="/register" className="lift mt-9 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-[16px] font-semibold text-primary-foreground">
                {t("landing.cta.button")} <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border2 px-6 py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">OA</div>
              <span className="text-[15px] font-semibold">OptionsAji</span>
            </div>
            <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-muted">{t("landing.footer.tagline")}</p>
          </div>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">{t("landing.footer.product")}</div>
            <div className="mt-4 flex flex-col gap-2.5 text-[13px] text-muted-foreground">
              <a href="#features" className="transition-colors hover:text-foreground">{t("landing.nav.features")}</a>
              <a href="#ai" className="transition-colors hover:text-foreground">{t("landing.nav.ai")}</a>
              <a href="#pricing" className="transition-colors hover:text-foreground">{t("landing.nav.pricing")}</a>
            </div>
          </div>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">{t("landing.footer.legal")}</div>
            <div className="mt-4 flex flex-col gap-2.5 text-[13px] text-muted-foreground">
              <Link href="/privacy" className="transition-colors hover:text-foreground">{t("landing.footer.privacy")}</Link>
              <Link href="/terms" className="transition-colors hover:text-foreground">{t("landing.footer.terms")}</Link>
              <Link href="/refund" className="transition-colors hover:text-foreground">{t("landing.footer.refund")}</Link>
            </div>
          </div>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">{t("landing.footer.company")}</div>
            <div className="mt-4 flex flex-col gap-2.5 text-[13px] text-muted-foreground">
              <Link href="/contact" className="transition-colors hover:text-foreground">{t("landing.footer.contact")}</Link>
              <Link href="/login" className="transition-colors hover:text-foreground">{t("landing.nav.login")}</Link>
              <Link href="/register" className="transition-colors hover:text-foreground">{t("shell.register")}</Link>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-border2 pt-6 text-center text-[12px] text-muted">
          {t("landing.footer.copyright")}
        </div>
      </footer>
    </div>
  );
}
