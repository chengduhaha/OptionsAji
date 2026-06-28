"use client";

import Link from "next/link";
import { Check, Crown, Star } from "lucide-react";

import { BLOG_MEMBERSHIP_TIERS } from "@/lib/membership-offer";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export default function BlogMembershipSection() {
  const { t, locale } = useI18n();

  return (
    <section id="membership" className="scroll-mt-24">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">{t("blog.membership.title")}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t("blog.membership.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {BLOG_MEMBERSHIP_TIERS.map((tier) => {
          const featured = tier.id === "standard";
          const Icon = tier.id === "premium" ? Crown : Star;
          const price = locale === "zh" ? tier.priceZh : tier.priceEn;
          return (
            <div
              key={tier.id}
              className={cn(
                "relative rounded-2xl border-2 bg-card p-6 shadow-sm",
                featured ? "border-primary shadow-[4px_4px_0_0_hsl(var(--primary)/0.25)]" : "border-border",
              )}
            >
              {featured ? (
                <span className="absolute -top-3 right-4 rounded-full border-2 border-primary bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
                  {t("membershipOffer.recommended")}
                </span>
              ) : null}
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="font-heading text-lg font-bold">{t(tier.nameKey)}</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{t(tier.descriptionKey)}</p>
              <p className="mt-4 font-mono text-3xl font-bold text-primary">{price}</p>
              <ul className="mt-6 space-y-3">
                {tier.featureKeys.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className={cn(
                  "mt-6 inline-flex w-full items-center justify-center rounded-lg border-2 py-2.5 text-sm font-semibold transition-colors",
                  featured
                    ? "border-primary bg-primary text-primary-foreground hover:brightness-95"
                    : "border-border hover:bg-secondary",
                )}
              >
                {t(tier.ctaKey)}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border-2 border-dashed border-border bg-secondary/30 px-5 py-4 text-center">
        <p className="text-sm text-muted-foreground">{t("blog.membership.sampleHint")}</p>
        <Link href="/blog/documents" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
          {t("blog.membership.sampleCta")} →
        </Link>
      </div>
    </section>
  );
}
