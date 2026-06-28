"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Lock } from "lucide-react";

import { MembershipExpiryBanner } from "@/components/v3/MembershipPaywall";
import V4Panel from "@/components/v4/V4Panel";
import { useAuth } from "@/lib/auth-context";
import { authFetch } from "@/lib/apiBase";
import { formatContractStrike } from "@/lib/leaderboard/formatContract";
import type { LeaderboardRow } from "@/lib/leaderboard/types";
import type { BoardAccessMeta } from "@/lib/membership";
import { fmtKmb } from "@/lib/leaderboard/display";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type SentimentContract = {
  rank: number;
  underlying: string;
  option_type: string;
  strike: number | null;
  expiry: string | null;
  volume: number;
  symbol_masked?: boolean;
};

type SentimentResponse = {
  call_volume: number;
  put_volume: number;
  put_call_ratio: number | null;
  top_calls: SentimentContract[];
  top_puts: SentimentContract[];
  updated_at?: string;
  error?: string;
  access?: BoardAccessMeta;
};

function ContractMini({ row }: { row: SentimentContract }) {
  const isCall = row.option_type === "C";
  const masked = row.symbol_masked === true;

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/70 py-2 last:border-b-0">
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="w-5 shrink-0 font-heading text-xs font-bold">{row.rank}</span>
        {masked ? (
          <span className="font-mono text-xs text-muted-foreground">•••</span>
        ) : (
          <span className="font-heading text-xs font-bold">{row.underlying}</span>
        )}
        <span
          className={cn(
            "inline-flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold",
            isCall ? "bg-up/15 text-up" : "bg-down/15 text-down",
          )}
        >
          {row.option_type}
        </span>
        <span className="truncate font-mono text-[11px] tabular-nums">
          {formatContractStrike(row as LeaderboardRow)}
        </span>
      </div>
      <span className="shrink-0 font-mono text-xs font-bold tabular-nums">{fmtKmb(row.volume)}</span>
    </div>
  );
}

function SidePanel({
  title,
  totalLabel,
  total,
  contracts,
}: {
  title: string;
  totalLabel: string;
  total: number;
  contracts: SentimentContract[];
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="font-heading text-sm font-bold">{title}</h3>
        <span className="font-mono text-xs font-bold tabular-nums">
          {totalLabel}: {fmtKmb(total)}
        </span>
      </div>
      <div className="mt-2">
        {contracts.length ? (
          contracts.map((row) => <ContractMini key={`${row.rank}-${row.option_type}`} row={row} />)
        ) : (
          <p className="py-4 text-center font-mono text-xs text-muted-foreground">—</p>
        )}
      </div>
    </div>
  );
}

export default function V4SentimentPage() {
  const { t } = useI18n();
  const { user, isMember, ready: authReady } = useAuth();
  const [data, setData] = useState<SentimentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/options/sentiment", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = (await res.json()) as SentimentResponse;
      if (payload.error && !payload.top_calls?.length && !payload.top_puts?.length) {
        throw new Error(payload.error);
      }
      setData(payload);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : t("v3.sentiment.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!authReady) return;
    void load();
  }, [load, authReady]);

  const showExpiryBanner =
    user?.membership?.expiring_soon === true &&
    typeof user.membership.days_remaining === "number";

  const pcRatio =
    data?.put_call_ratio != null && Number.isFinite(data.put_call_ratio)
      ? data.put_call_ratio.toFixed(2)
      : "—";

  return (
    <>
      {showExpiryBanner ? (
        <div className="mb-4">
          <MembershipExpiryBanner daysRemaining={user.membership!.days_remaining!} />
        </div>
      ) : null}

      <V4Panel title={t("v3.boards.sentiment.title")}>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          <span className="mr-2 font-medium text-foreground">{t("v3.leaderboard.answerPrefix")}</span>
          {t("v3.boards.sentiment.answer")}
        </p>

        {error ? (
          <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        ) : null}

        {loading ? (
          <p className="py-12 text-center text-muted-foreground">{t("v3.sentiment.loading")}</p>
        ) : data ? (
          <>
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-up/5 px-4 py-3">
                <p className="text-[10px] font-medium uppercase text-muted-foreground">{t("v3.sentiment.callSide")}</p>
                <p className="font-heading text-2xl font-bold tabular-nums">{fmtKmb(data.call_volume)}</p>
              </div>
              <div className="rounded-lg border border-border bg-card px-4 py-3 text-center">
                <p className="text-[10px] font-medium uppercase text-muted-foreground">{t("v3.sentiment.pcRatio")}</p>
                <p className="font-heading text-2xl font-bold tabular-nums">{pcRatio}</p>
              </div>
              <div className="rounded-lg border border-border bg-down/5 px-4 py-3 sm:text-right">
                <p className="text-[10px] font-medium uppercase text-muted-foreground">{t("v3.sentiment.putSide")}</p>
                <p className="font-heading text-2xl font-bold tabular-nums">{fmtKmb(data.put_volume)}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SidePanel
                title={t("v3.sentiment.topCalls")}
                totalLabel={t("v3.sentiment.totalVolume")}
                total={data.call_volume}
                contracts={data.top_calls}
              />
              <SidePanel
                title={t("v3.sentiment.topPuts")}
                totalLabel={t("v3.sentiment.totalVolume")}
                total={data.put_volume}
                contracts={data.top_puts}
              />
            </div>
          </>
        ) : null}

        {!isMember && data?.access && !data.access.is_member ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {formatMessage(t("v3.tier.freePreviewHint"), {
                limit: String(data.access.row_limit ?? 10),
                mask: String(data.access.symbol_mask_ranks ?? 3),
              })}
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              <Lock className="h-4 w-4" />
              {t("v3.tier.unlockFull")}
            </Link>
          </div>
        ) : null}
      </V4Panel>
    </>
  );
}
