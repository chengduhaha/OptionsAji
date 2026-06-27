"use client";

import Link from "next/link";
import { clsx } from "clsx";

import { NeoPanel } from "@/components/v3/NeoPanel";
import { useI18n } from "@/lib/i18n/context";

type MembershipPaywallProps = {
  boardId?: string;
  compact?: boolean;
};

export function MembershipPaywall({ boardId, compact = false }: MembershipPaywallProps) {
  const { t } = useI18n();

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center text-center gap-4",
        compact ? "py-10 px-4" : "py-16 px-6 min-h-[320px]",
      )}
    >
      <div className="border-[3px] border-ink bg-lavender px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest shadow-neo-sm">
        {t("v3.membership.lockedBadge")}
      </div>
      <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight max-w-lg">
        {t("v3.membership.paywallTitle")}
      </h2>
      <p className="text-sm text-ink/70 max-w-md leading-relaxed">
        {boardId
          ? t("v3.membership.paywallBoardHint")
          : t("v3.membership.paywallHint")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/pricing"
          className="border-[3px] border-ink bg-peach px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wide shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          {t("v3.membership.viewPricing")}
        </Link>
        <Link
          href="/account"
          className="border-[3px] border-ink bg-cream px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wide shadow-neo-sm hover:bg-lavender/40 transition-colors"
        >
          {t("v3.membership.redeemCta")}
        </Link>
      </div>
    </div>
  );
}

export function MembershipExpiryBanner({ daysRemaining }: { daysRemaining: number }) {
  const { t } = useI18n();
  return (
    <NeoPanel accent="peach" title={t("v3.membership.expiringTitle")}>
      <p className="text-sm leading-relaxed">
        {t("v3.membership.expiringBody").replace("{days}", String(daysRemaining))}
      </p>
      <Link
        href="/pricing"
        className="mt-3 inline-block border-2 border-ink bg-lavender px-4 py-2 font-mono text-[11px] font-bold uppercase shadow-neo-sm"
      >
        {t("v3.membership.renewCta")}
      </Link>
    </NeoPanel>
  );
}
