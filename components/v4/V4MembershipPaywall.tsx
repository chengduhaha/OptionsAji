"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import V4Panel from "@/components/v4/V4Panel";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type V4MembershipPaywallProps = {
  boardId?: string;
  compact?: boolean;
};

export function V4MembershipPaywall({ boardId, compact = false }: V4MembershipPaywallProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-3 py-10 px-4" : "gap-4 py-16 px-6 min-h-[320px]",
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lock className="h-5 w-5" />
      </div>
      <h2 className="font-heading text-xl font-bold tracking-tight max-w-lg sm:text-2xl">
        {t("v3.membership.paywallTitle")}
      </h2>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
        {boardId ? t("v3.membership.paywallBoardHint") : t("v3.membership.paywallHint")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/pricing"
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:brightness-95"
        >
          {t("v3.membership.viewPricing")}
        </Link>
        <Link
          href="/account"
          className="rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
        >
          {t("v3.membership.redeemCta")}
        </Link>
      </div>
    </div>
  );
}

export function V4MembershipExpiryBanner({ daysRemaining }: { daysRemaining: number }) {
  const { t } = useI18n();

  return (
    <V4Panel title={t("v3.membership.expiringTitle")}>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t("v3.membership.expiringBody").replace("{days}", String(daysRemaining))}
      </p>
      <Link
        href="/pricing"
        className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:brightness-95"
      >
        {t("v3.membership.renewCta")}
      </Link>
    </V4Panel>
  );
}
