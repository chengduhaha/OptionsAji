"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";

import { MembershipExpiryBanner } from "@/components/v3/MembershipPaywall";
import { NeoPanel } from "@/components/v3/NeoPanel";
import { useAuth } from "@/lib/auth-context";
import { authFetch } from "@/lib/apiBase";
import { formatContractStrike } from "@/lib/leaderboard/formatContract";
import type { LeaderboardRow } from "@/lib/leaderboard/types";
import type { BoardAccessMeta } from "@/lib/membership";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";

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

function fmtKmb(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toLocaleString("en-US");
}

function ContractMini({ row }: { row: SentimentContract }) {
  const isCall = row.option_type === "C";
  const masked = row.symbol_masked === true;

  return (
    <div className="flex items-center justify-between gap-2 border-b-2 border-ink/15 py-2 last:border-b-0">
      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        <span className="font-display text-xs font-extrabold w-5 shrink-0">{row.rank}</span>
        {masked ? (
          <span className="font-mono text-xs text-ink/50">•••</span>
        ) : (
          <span className="font-display text-xs font-extrabold">{row.underlying}</span>
        )}
        <span
          className={clsx(
            "inline-flex h-4 w-4 items-center justify-center border border-ink font-mono text-[9px] font-bold",
            isCall ? "bg-green-tint text-[#0A6B52]" : "bg-red-tint text-[#A03030]",
          )}
        >
          {row.option_type}
        </span>
        <span className="font-mono text-[11px] tabular-nums truncate">
          {formatContractStrike(row as LeaderboardRow)}
        </span>
      </div>
      <span className="font-mono text-xs font-bold tabular-nums shrink-0">{fmtKmb(row.volume)}</span>
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
    <div className="border-[3px] border-ink bg-cream p-4 shadow-neo-sm flex flex-col gap-3">
      <div className="flex items-center justify-between border-b-2 border-ink pb-2">
        <h3 className="font-display text-sm font-extrabold uppercase tracking-wide">{title}</h3>
        <span className="font-mono text-xs font-bold tabular-nums">
          {totalLabel}: {fmtKmb(total)}
        </span>
      </div>
      <div>
        {contracts.length ? (
          contracts.map((row) => <ContractMini key={`${row.rank}-${row.option_type}`} row={row} />)
        ) : (
          <p className="py-4 text-center font-mono text-xs text-ink/50">—</p>
        )}
      </div>
    </div>
  );
}

export default function SentimentPage() {
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
      <NeoPanel title={t("v3.boards.sentiment.title")} accent="peach">
        <div className="border-b-[3px] border-ink pb-4 mb-4">
          <p className="text-sm leading-relaxed text-ink max-w-3xl">
            <span className="font-mono text-[11px] text-ink/50 mr-2">{t("v3.leaderboard.answerPrefix")}</span>
            {t("v3.boards.sentiment.answer")}
          </p>
        </div>

        {error ? (
          <div className="m-4 border-[3px] border-ink bg-red-tint px-4 py-3 font-sans text-sm shadow-neo-sm">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="py-12 text-center font-mono text-ink/60">{t("v3.sentiment.loading")}</p>
        ) : data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3 mb-6">
              <div className="border-2 border-ink bg-green-tint/30 px-4 py-3 shadow-neo-sm">
                <p className="font-mono text-[10px] font-bold uppercase text-ink/50">{t("v3.sentiment.callSide")}</p>
                <p className="font-display text-2xl font-extrabold tabular-nums">{fmtKmb(data.call_volume)}</p>
              </div>
              <div className="border-2 border-ink bg-cream px-4 py-3 shadow-neo-sm text-center">
                <p className="font-mono text-[10px] font-bold uppercase text-ink/50">{t("v3.sentiment.pcRatio")}</p>
                <p className="font-display text-2xl font-extrabold tabular-nums">{pcRatio}</p>
              </div>
              <div className="border-2 border-ink bg-red-tint/30 px-4 py-3 shadow-neo-sm text-right sm:text-left">
                <p className="font-mono text-[10px] font-bold uppercase text-ink/50">{t("v3.sentiment.putSide")}</p>
                <p className="font-display text-2xl font-extrabold tabular-nums">{fmtKmb(data.put_volume)}</p>
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-ink bg-lavender/20 px-4 py-4 mt-4">
            <p className="text-sm text-ink/70 leading-relaxed">
              {formatMessage(t("v3.tier.freePreviewHint"), {
                limit: String(data.access.row_limit ?? 10),
                mask: String(data.access.symbol_mask_ranks ?? 3),
              })}
            </p>
            <Link
              href="/pricing"
              className="border-[3px] border-ink bg-peach px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wide shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all whitespace-nowrap"
            >
              {t("v3.tier.unlockFull")}
            </Link>
          </div>
        ) : null}
      </NeoPanel>
    </>
  );
}
