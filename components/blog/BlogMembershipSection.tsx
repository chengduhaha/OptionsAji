"use client";

import Link from "next/link";
import { Check, Star } from "lucide-react";

import { BLOG_MEMBERSHIP_TIERS } from "@/lib/membership-offer";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export default function BlogMembershipSection() {
  const { t } = useI18n();
  const memberTier = BLOG_MEMBERSHIP_TIERS[0];

  if (!memberTier) {
    return null;
  }

  return (
    <section id="membership" className="scroll-mt-24">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">{t("blog.membership.title")}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t("blog.membership.subtitle")}
        </p>
      </div>

      <div className="mx-auto max-w-lg">
        <div
          className={cn(
            "relative rounded-2xl border-2 border-primary bg-card p-6 shadow-[4px_4px_0_0_hsl(var(--primary)/0.25)]",
          )}
        >
          <span className="absolute -top-3 right-4 rounded-full border-2 border-primary bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
            {t("membershipOffer.recommended")}
          </span>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-lg font-bold">{t(memberTier.nameKey)}</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t(memberTier.descriptionKey)}</p>
          <ul className="mt-6 space-y-3">
            {memberTier.featureKeys.map((key) => (
              <li key={key} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/pricing"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg border-2 border-primary bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-95"
          >
            {t("blog.membership.cta")}
          </Link>
        </div>
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
