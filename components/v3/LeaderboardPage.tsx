"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";

import { MembershipExpiryBanner } from "@/components/v3/MembershipPaywall";
import { NeoPanel } from "@/components/v3/NeoPanel";
import { useAuth } from "@/lib/auth-context";
import { authFetch } from "@/lib/apiBase";
import { BOARD_CONFIGS } from "@/lib/leaderboard/boardConfig";
import { formatContractStrike } from "@/lib/leaderboard/formatContract";
import type { BoardId, ColumnKey, LeaderboardResponse, LeaderboardRow } from "@/lib/leaderboard/types";
import { useLeaderboardFilters } from "@/lib/leaderboard/useLeaderboardFilters";
import { defaultBoardAccess, type BoardAccessMeta } from "@/lib/membership";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";

function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

function fmtKmb(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return fmtNum(Math.round(v));
}

function fmtMoney(v: number): string {
  return `$${fmtKmb(v)}`;
}

function fmtMoney2(v: number): string {
  return `$${v.toFixed(2)}`;
}

function fmtPct(v: number | null, signed = false): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const sign = signed && v > 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

function fmtNum2(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toFixed(2);
}

function fmtNum3(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toFixed(3);
}

function fmtNum4(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toFixed(4);
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 7V5a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1zm2 0h4V5a2 2 0 1 0-4 0v2z" />
    </svg>
  );
}

function ContractCell({ row, t }: { row: LeaderboardRow; t: (key: string) => string }) {
  const isCall = row.option_type === "C";
  const expiryShort = row.expiry ? row.expiry.slice(5) : "—";
  const mTag = (row.moneyness ?? "OTM").toUpperCase();
  const masked = row.symbol_masked === true;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {masked ? (
        <span
          className="inline-flex items-center gap-1 font-display text-sm font-extrabold tracking-wide text-ink/50"
          title={t("v3.tier.symbolMasked")}
        >
          <LockIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="font-mono tracking-widest">•••</span>
        </span>
      ) : (
        <span className="font-display text-sm font-extrabold tracking-wide">{row.underlying}</span>
      )}
      <span
        className={clsx(
          "inline-flex h-[18px] w-[18px] items-center justify-center border-2 border-ink font-mono text-[10px] font-bold shadow-[2px_2px_0_#151617]",
          isCall ? "bg-green-tint text-[#0A6B52]" : "bg-red-tint text-[#A03030]",
        )}
      >
        {row.option_type}
      </span>
      <span className="font-mono text-[12px] font-semibold tabular-nums">
        {formatContractStrike(row)}
      </span>
      <span className="font-mono text-[11px] text-ink/70">{expiryShort}</span>
      {row.dte === 0 ? (
        <span className="border-2 border-ink bg-lavender px-1.5 py-0 font-mono text-[9px] font-bold">
          0DTE
        </span>
      ) : row.dte != null ? (
        <span className="font-mono text-[10px] text-ink/50">{row.dte}d</span>
      ) : null}
      <span
        className={clsx(
          "border px-1.5 py-0 font-mono text-[9px] font-bold",
          mTag === "ITM" && "border-ink bg-green-tint text-[#0A6B52]",
          mTag === "ATM" && "border-ink bg-peach text-ink",
          mTag === "OTM" && "border-ink bg-cream text-ink/60",
        )}
      >
        {mTag}
      </span>
    </div>
  );
}

function formatRefreshTime(iso: string | undefined, locale: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

function cellValue(row: LeaderboardRow, key: ColumnKey): number | null {
  switch (key) {
    case "vol_oi_ratio":
      return row.vol_oi_ratio;
    case "volume":
      return row.volume;
    case "oi":
      return row.oi;
    case "turnover":
      return row.turnover;
    case "oi_mcap":
      return row.oi_mcap;
    case "iv":
      return row.iv;
    case "hv":
      return row.hv;
    case "iv_hv":
      return row.iv_hv;
    case "change_ratio":
      return row.change_ratio;
    case "price":
      return row.price ?? row.premium;
    case "dte":
      return row.dte;
    case "delta":
      return row.delta;
    case "gamma":
      return row.gamma;
    case "vega":
      return row.vega;
    case "theta":
      return row.theta;
    case "sell_ann":
      return row.sell_ann;
    case "sell_prob":
      return row.sell_prob;
    case "itm_prob":
      return row.itm_prob;
    case "spread":
      return row.spread;
    case "bid_vol":
      return row.bid_vol;
    case "ask_vol":
      return row.ask_vol;
    default:
      return null;
  }
}

function formatCell(key: ColumnKey, value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  switch (key) {
    case "volume":
    case "oi":
    case "bid_vol":
    case "ask_vol":
      return fmtKmb(value);
    case "turnover":
    case "oi_mcap":
      return fmtMoney(value);
    case "price":
    case "spread":
      return fmtMoney2(value);
    case "iv":
    case "hv":
    case "sell_ann":
    case "sell_prob":
    case "itm_prob":
      return `${value.toFixed(1)}%`;
    case "change_ratio":
      return fmtPct(value, true);
    case "dte":
      return value === 0 ? "0DTE" : `${Math.round(value)}d`;
    case "delta":
      return fmtNum2(value);
    case "gamma":
      return fmtNum4(value);
    case "vega":
    case "theta":
      return fmtNum3(value);
    case "iv_hv":
    case "vol_oi_ratio":
      return fmtNum2(value);
    default:
      return String(value);
  }
}

type SegButtonProps<T extends string | number> = {
  value: T;
  current: T;
  label: string;
  onSelect: (value: T) => void;
};

function SegButton<T extends string | number>({ value, current, label, onSelect }: SegButtonProps<T>) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={clsx(
        "border-r-2 border-ink last:border-r-0 px-3 py-1.5 font-mono text-[11px] font-bold transition-colors",
        current === value ? "bg-lavender text-ink" : "bg-cream hover:bg-peach/40",
      )}
    >
      {label}
    </button>
  );
}

type LeaderboardPageProps = {
  boardId: BoardId;
};

export default function LeaderboardPage({ boardId }: LeaderboardPageProps) {
  const config = BOARD_CONFIGS[boardId];
  const { t, locale } = useI18n();
  const { user, isMember, ready: authReady } = useAuth();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [access, setAccess] = useState<BoardAccessMeta>(() => defaultBoardAccess(false, boardId));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/api/options/leaderboard/${boardId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = (await res.json()) as LeaderboardResponse;
      if (payload.error && (!payload.items || payload.items.length === 0)) {
        throw new Error(payload.error);
      }
      setData(payload);
      setAccess(payload.access ?? defaultBoardAccess(isMember, boardId));
    } catch (err) {
      setData(null);
      setAccess(defaultBoardAccess(isMember, boardId));
      setError(err instanceof Error ? err.message : t("v3.leaderboard.loadError"));
    } finally {
      setLoading(false);
    }
  }, [boardId, isMember, t]);

  useEffect(() => {
    if (!authReady) return;
    void load();
  }, [load, authReady]);

  const items = data?.items ?? [];
  const filters = useLeaderboardFilters(items, { paginated: config.paginated });
  const heroMax = useMemo(() => {
    const vals = filters.visibleRows
      .map((row) => cellValue(row, config.heroColumn))
      .filter((v): v is number => v != null && Number.isFinite(v))
      .map((v) => Math.abs(v));
    return Math.max(...vals, 1e-9);
  }, [filters.visibleRows, config.heroColumn]);

  if (!config) {
    return null;
  }

  const allowFilter = (name: string) => access.allowed_filters.includes(name);
  const showExpiryBanner =
    user?.membership?.expiring_soon === true &&
    typeof user.membership.days_remaining === "number";

  return (
    <>
      {showExpiryBanner ? (
        <div className="mb-4">
          <MembershipExpiryBanner daysRemaining={user.membership!.days_remaining!} />
        </div>
      ) : null}
      <NeoPanel title={t(config.titleKey)} accent={config.accent}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink pb-4">
          <p className="text-sm leading-relaxed text-ink max-w-3xl">
            <span className="font-mono text-[11px] text-ink/50 mr-2">{t("v3.leaderboard.answerPrefix")}</span>
            {t(config.answerKey)}
          </p>
          <span className="font-mono text-[11px] font-semibold border-2 border-ink px-3 py-1.5 bg-cream whitespace-nowrap">
            {formatMessage(t("v3.leaderboard.refreshAt"), {
              time: formatRefreshTime(data?.updated_at, locale),
            })}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 py-3 border-b-[3px] border-ink bg-peach/10 items-center">
          {allowFilter("cp") ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase text-ink/50">{t("v3.leaderboard.filterType")}</span>
            <div className="flex border-2 border-ink shadow-neo-sm overflow-hidden">
              <SegButton value="all" current={filters.cp} label={t("v3.leaderboard.all")} onSelect={filters.setCp} />
              <SegButton value="C" current={filters.cp} label="Call" onSelect={filters.setCp} />
              <SegButton value="P" current={filters.cp} label="Put" onSelect={filters.setCp} />
            </div>
          </div>
          ) : null}
          {allowFilter("dte") ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase text-ink/50">DTE</span>
            <div className="flex border-2 border-ink shadow-neo-sm overflow-hidden">
              <SegButton value="all" current={filters.dte} label={t("v3.leaderboard.all")} onSelect={filters.setDte} />
              <SegButton value="0" current={filters.dte} label="0DTE" onSelect={filters.setDte} />
              <SegButton value="7" current={filters.dte} label={t("v3.leaderboard.dte7")} onSelect={filters.setDte} />
              <SegButton value="30" current={filters.dte} label={t("v3.leaderboard.dte30")} onSelect={filters.setDte} />
            </div>
          </div>
          ) : null}
          {allowFilter("moneyness") ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase text-ink/50">{t("v3.leaderboard.moneyness")}</span>
            <div className="flex border-2 border-ink shadow-neo-sm overflow-hidden">
              <SegButton value="all" current={filters.moneyness} label={t("v3.leaderboard.all")} onSelect={filters.setMoneyness} />
              <SegButton value="ITM" current={filters.moneyness} label="ITM" onSelect={filters.setMoneyness} />
              <SegButton value="ATM" current={filters.moneyness} label="ATM" onSelect={filters.setMoneyness} />
              <SegButton value="OTM" current={filters.moneyness} label="OTM" onSelect={filters.setMoneyness} />
            </div>
          </div>
          ) : null}
          {filters.showTopFilter && allowFilter("topN") ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase text-ink/50">TOP</span>
              <div className="flex border-2 border-ink shadow-neo-sm overflow-hidden">
                {(access.allowed_top_n.includes(10) ? [10] : []).map((n) => (
                  <SegButton key={n} value={n as 10 | 25} current={filters.topN} label="10" onSelect={filters.setTopN} />
                ))}
                {(access.allowed_top_n.includes(25) ? [25] : []).map((n) => (
                  <SegButton key={n} value={n as 10 | 25} current={filters.topN} label="25" onSelect={filters.setTopN} />
                ))}
              </div>
            </div>
          ) : null}
          {!access.is_member ? (
            <Link
              href="/pricing"
              className="border-2 border-ink bg-lavender px-3 py-1 font-mono text-[10px] font-bold uppercase shadow-neo-sm"
            >
              {t("v3.tier.unlockFull")}
            </Link>
          ) : null}
          <span className="ml-auto font-mono text-[11px] text-ink/60">
            {formatMessage(t("v3.leaderboard.matchCount"), { count: String(filters.filteredCount) })}
          </span>
        </div>

        {error ? (
          <div className="m-4 border-[3px] border-ink bg-red-tint px-4 py-3 font-sans text-sm shadow-neo-sm">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto -mx-4 px-0 md:-mx-0">
          <table className="w-full border-collapse text-[13px] min-w-[960px]">
            <thead>
              <tr className="bg-ink text-cream">
                <th className="px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider w-10 text-center">
                  #
                </th>
                <th className="px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-left">
                  {t("v3.leaderboard.col.contract")}
                </th>
                {config.columns.map((col) => (
                  <th
                    key={col}
                    className={clsx(
                      "px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-right whitespace-nowrap",
                      col === config.heroColumn && "text-peach",
                    )}
                  >
                    {t(`v3.leaderboard.col.${col}`)}
                    {col === config.heroColumn ? " ▾" : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={config.columns.length + 2} className="py-12 text-center font-mono text-ink/60">
                    {t("v3.leaderboard.loading")}
                  </td>
                </tr>
              ) : !filters.visibleRows.length ? (
                <tr>
                  <td colSpan={config.columns.length + 2} className="py-12 text-center font-mono text-ink/60">
                    {t("v3.leaderboard.empty")}
                  </td>
                </tr>
              ) : (
                filters.visibleRows.map((row) => (
                    <tr key={`${row.code}-${row.rank}`} className="border-b-2 border-ink hover:bg-lavender/15">
                      <td className="px-3 py-2 text-center font-display text-base font-extrabold">{row.rank}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <ContractCell row={row} t={t} />
                      </td>
                      {config.columns.map((col) => {
                        const raw = cellValue(row, col);
                        const isHero = col === config.heroColumn;
                        const isSigned = col === "change_ratio" || col === "delta" || col === "theta";
                        const signedClass =
                          isSigned && raw != null
                            ? raw >= 0
                              ? "text-[#0A6B52]"
                              : "text-[#C03030]"
                            : undefined;
                        const showBadge =
                          config.showUnusualBadge && col === "vol_oi_ratio" && raw != null && raw > 1;

                        if (isHero && raw != null) {
                          let width = (Math.abs(raw) / heroMax) * 100;
                          if (config.invertHeroBar) {
                            width = (1 - Math.abs(raw) / heroMax) * 85 + 15;
                          }
                          return (
                            <td key={col} className="relative px-3 py-2 text-right font-mono font-semibold tabular-nums">
                              <div
                                className="absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-sm bg-peach/30"
                                style={{ width: `${width}%` }}
                              />
                              <span className="relative z-10 font-bold">{formatCell(col, raw)}</span>
                              {showBadge ? (
                                <span className="relative z-10 ml-1 inline-block border-2 border-ink bg-red-tint px-1 py-0 text-[9px] font-bold text-[#A03030]">
                                  {t("v3.leaderboard.unusualBadge")}
                                </span>
                              ) : null}
                            </td>
                          );
                        }

                        return (
                          <td
                            key={col}
                            className={clsx(
                              "px-3 py-2 text-right font-mono font-semibold tabular-nums",
                              signedClass,
                            )}
                          >
                            {formatCell(col, raw)}
                          </td>
                        );
                      })}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {config.paginated && allowFilter("page") ? (
          <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-4 border-t-[3px] border-ink bg-cream">
            {Array.from({ length: filters.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                disabled={loading}
                onClick={() => filters.setPage(p)}
                aria-current={p === filters.page ? "page" : undefined}
                className={clsx(
                  "min-w-[2.25rem] border-2 border-ink px-2.5 py-1.5 font-mono text-xs font-bold transition-colors",
                  p === filters.page
                    ? "bg-lavender shadow-neo-sm"
                    : "bg-cream hover:bg-peach/40 disabled:opacity-50",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        ) : null}

        {!access.is_member ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-ink bg-lavender/20 px-4 py-4">
            <p className="text-sm text-ink/70 leading-relaxed">
              {formatMessage(t("v3.tier.freePreviewHint"), {
                limit: String(access.row_limit ?? 5),
                mask: String(access.symbol_mask_ranks ?? 3),
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

      <footer className="mt-2 border-[3px] border-ink px-4 py-3 text-center text-[11px] leading-relaxed text-ink/70 shadow-neo-sm">
        {t("v3.disclaimer")}
      </footer>
    </>
  );
}
