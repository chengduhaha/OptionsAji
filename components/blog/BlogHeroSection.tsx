"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { useI18n } from "@/lib/i18n/context";

export default function BlogHeroSection() {
  const { t } = useI18n();

  return (
    <section className="border-b-2 border-border pb-8 sm:pb-10">
      <div className="max-w-3xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          {t("blog.hero.badge")}
        </div>
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          {t("blog.hero.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("blog.hero.subtitle")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t("blog.hero.tagline")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="#posts"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-95"
          >
            {t("blog.hero.ctaPrimary")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/blog/documents"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            {t("blog.hero.ctaSecondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}
