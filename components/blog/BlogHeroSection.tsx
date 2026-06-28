"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { useI18n } from "@/lib/i18n/context";

export default function BlogHeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 px-6 py-12 sm:px-10 sm:py-16">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative max-w-3xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {t("blog.hero.badge")}
        </div>
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {t("blog.hero.title")}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl">{t("blog.hero.subtitle")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t("blog.hero.tagline")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[3px_3px_0_0_hsl(var(--foreground)/0.15)] transition-transform hover:-translate-y-0.5"
          >
            {t("blog.hero.ctaPrimary")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/blog/documents"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            {t("blog.hero.ctaSecondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}
