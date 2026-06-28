"use client";

import Link from "next/link";
import { useState } from "react";
import { Lock, RefreshCw, Sparkles, TrendingUp } from "lucide-react";

import { MembershipExpiryBanner } from "@/components/v3/MembershipPaywall";
import { useAuth } from "@/lib/auth-context";
import { BOARD_CONFIGS } from "@/lib/leaderboard/boardConfig";
import {
  cellValue,
  formatCell,
  formatRefreshTime,
} from "@/lib/leaderboard/display";
import { formatContractStrike } from "@/lib/leaderboard/formatContract";
import type { BoardId, ColumnKey, DteFilter, LeaderboardRow } from "@/lib/leaderboard/types";
import { useLeaderboardFilters } from "@/lib/leaderboard/useLeaderboardFilters";
import { useLeaderboardData } from "@/lib/leaderboard/useLeaderboardData";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

function SideTag({ side }: { side: "C" | "P" }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold",
        side === "C" ? "bg-up/15 text-up" : "bg-down/15 text-down",
      )}
      title={side === "C" ? "Call" : "Put"}
    >
      {side}
    </span>
  );
}

function MoneynessTag({ m }: { m: string }) {
  const tag = m.toUpperCase();
  const styles: Record<string, string> = {
    ITM: "bg-primary/10 text-primary",
    ATM: "bg-accent/25 text-accent-foreground",
    OTM: "bg-secondary text-muted-foreground",
  };
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", styles[tag] ?? styles.OTM)}>
      {tag}
    </span>
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
          className="inline-flex items-center gap-1.5 text-muted-foreground"
          title={t("v3.tier.symbolMasked")}
        >
          <Lock className="h-3.5 w-3.5" />
          <span className="font-mono text-sm tracking-widest">••••</span>
        </span>
      ) : (
        <span className="font-heading text-sm font-bold">{row.underlying}</span>
      )}
      <SideTag side={isCall ? "C" : "P"} />
      <span className="font-mono text-sm tabular-nums">{formatContractStrike(row)}</span>
      <span className="font-mono text-sm text-muted-foreground">{expiryShort}</span>
      {row.dte === 0 ? (
        <span className="rounded bg-accent/25 px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
          0DTE
        </span>
      ) : row.dte != null ? (
        <span className="text-[11px] text-muted-foreground/70">{row.dte}d</span>
      ) : null}
      <MoneynessTag m={mTag} />
    </div>
  );
}

type SegProps<T extends string | number> = {
  value: T;
  current: T;
  label: string;
  onSelect: (value: T) => void;
};

function SegButton<T extends string | number>({ value, current, label, onSelect }: SegProps<T>) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm transition-colors",
        current === value
          ? "bg-card font-medium text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

type V4LeaderboardPageProps = {
  boardId: BoardId;
  defaultDteFilter?: DteFilter;
};

export default function V4LeaderboardPage({
  boardId,
  defaultDteFilter = "all",
}: V4LeaderboardPageProps) {
  const config = BOARD_CONFIGS[boardId];
  const { t, locale } = useI18n();
  const { user, isMember, ready: authReady } = useAuth();
  const { data, access, loading, error, reload } = useLeaderboardData({
    boardId,
    isMember,
    authReady,
    loadErrorMessage: t("v3.leaderboard.loadError"),
  });

  const items = data?.items ?? [];
  const filters = useLeaderboardFilters(items, {
    paginated: config?.paginated ?? false,
    defaultDte: defaultDteFilter,
  });

  const [typeFilter, setTypeFilter] = useState<"all" | "C" | "P">("all");

  if (!config) return null;

  const allowFilter = (name: string) => access.allowed_filters.includes(name);
  const showExpiryBanner =
    user?.membership?.expiring_soon === true &&
    typeof user.membership.days_remaining === "number";

  const cpFilteredRows =
    typeFilter === "all"
      ? filters.visibleRows
      : filters.visibleRows.filter((row) => row.option_type === typeFilter);

  return (
    <>
      {showExpiryBanner ? (
        <div className="mb-4">
          <MembershipExpiryBanner daysRemaining={user.membership!.days_remaining!} />
        </div>
      ) : null}

      <section>
        <div className="rounded-t-xl border border-border bg-card px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
                {t(config.titleKey)}
              </h1>
              <p className="mt-1.5 flex items-start gap-1.5 text-pretty text-sm text-muted-foreground">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>
                  <span className="font-medium text-foreground">{t("v3.leaderboard.answerPrefix")}</span>
                  {t(config.answerKey)}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => void reload()}
              disabled={loading}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              {formatMessage(t("v3.leaderboard.refreshAt"), {
                time: formatRefreshTime(data?.updated_at, locale),
              })}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {allowFilter("cp") ? (
              <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
                <SegButton value="all" current={typeFilter} label={t("v3.leaderboard.all")} onSelect={setTypeFilter} />
                <SegButton value="C" current={typeFilter} label="Call" onSelect={setTypeFilter} />
                <SegButton value="P" current={typeFilter} label="Put" onSelect={setTypeFilter} />
              </div>
            ) : null}

            {allowFilter("dte") ? (
              <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
                <SegButton value="all" current={filters.dte} label={t("v3.leaderboard.all")} onSelect={filters.setDte} />
                <SegButton value="0" current={filters.dte} label="0DTE" onSelect={filters.setDte} />
                <SegButton value="7" current={filters.dte} label={t("v3.leaderboard.dte7")} onSelect={filters.setDte} />
                <SegButton value="30" current={filters.dte} label={t("v3.leaderboard.dte30")} onSelect={filters.setDte} />
              </div>
            ) : null}

            {allowFilter("moneyness") ? (
              <div className="flex flex-wrap items-center gap-1 rounded-lg bg-secondary p-1">
                <SegButton value="all" current={filters.moneyness} label={t("v3.leaderboard.all")} onSelect={filters.setMoneyness} />
                <SegButton value="ITM" current={filters.moneyness} label="ITM" onSelect={filters.setMoneyness} />
                <SegButton value="ATM" current={filters.moneyness} label="ATM" onSelect={filters.setMoneyness} />
                <SegButton value="OTM" current={filters.moneyness} label="OTM" onSelect={filters.setMoneyness} />
              </div>
            ) : null}

            <span className="text-xs text-muted-foreground">
              {formatMessage(t("v3.leaderboard.matchCount"), { count: String(filters.filteredCount) })}
            </span>
          </div>
        </div>

        {error ? (
          <div className="border-x border-border bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="hidden overflow-hidden border-x border-border bg-card md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2.5 pl-4 pr-2 text-center font-medium">#</th>
                <th className="px-2 py-2.5 font-medium">{t("v3.leaderboard.col.contract")}</th>
                {config.columns.map((col) => (
                  <th
                    key={col}
                    className={cn(
                      "px-2 py-2.5 text-right font-medium",
                      col === config.heroColumn && "bg-primary/5 font-bold text-primary",
                    )}
                  >
                    {t(`v3.leaderboard.col.${col}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={config.columns.length + 2} className="py-12 text-center text-muted-foreground">
                    {t("v3.leaderboard.loading")}
                  </td>
                </tr>
              ) : !cpFilteredRows.length ? (
                <tr>
                  <td colSpan={config.columns.length + 2} className="py-12 text-center text-muted-foreground">
                    {t("v3.leaderboard.empty")}
                  </td>
                </tr>
              ) : (
                cpFilteredRows.map((row) => (
                  <tr key={`${row.code}-${row.rank}`} className="border-b border-border/70 transition-colors hover:bg-secondary/50">
                    <td className="py-3 pl-4 pr-2 text-center font-heading text-sm font-bold text-muted-foreground">
                      {row.rank}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      <ContractCell row={row} t={t} />
                    </td>
                    {config.columns.map((col) => {
                      const raw = cellValue(row, col);
                      const isHero = col === config.heroColumn;
                      const isSigned = col === "change_ratio" || col === "delta" || col === "theta";
                      const signedClass =
                        isSigned && raw != null
                          ? raw >= 0
                            ? "text-up"
                            : "text-down"
                          : undefined;
                      const showBadge =
                        config.showUnusualBadge && col === "vol_oi_ratio" && raw != null && raw > 1;

                      if (isHero && raw != null) {
                        return (
                          <td
                            key={col}
                            className="bg-primary/5 px-2 py-3 text-right font-mono text-sm font-bold tabular-nums text-primary"
                          >
                            {formatCell(col, raw)}
                            {showBadge ? (
                              <span className="ml-1 inline-block rounded bg-down/15 px-1 py-0 text-[9px] font-bold text-down">
                                {t("v3.leaderboard.unusualBadge")}
                              </span>
                            ) : null}
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col}
                          className={cn(
                            "px-2 py-3 text-right font-mono text-sm tabular-nums",
                            signedClass,
                          )}
                        >
                          {formatCell(col as ColumnKey, raw)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-x border-border bg-card p-3 md:hidden">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t("v3.leaderboard.loading")}</p>
          ) : (
            cpFilteredRows.map((row) => {
              const heroVal = cellValue(row, config.heroColumn);
              return (
                <div key={`${row.code}-${row.rank}`} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-sm font-bold text-muted-foreground">#{row.rank}</span>
                      <ContractCell row={row} t={t} />
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md bg-primary/10 py-1.5">
                      <div className="text-[10px] text-primary/80">
                        {t(`v3.leaderboard.col.${config.heroColumn}`)}
                      </div>
                      <div className="font-mono text-sm font-bold tabular-nums text-primary">
                        {formatCell(config.heroColumn, heroVal)}
                      </div>
                    </div>
                    <div className="rounded-md bg-secondary/60 py-1.5">
                      <div className="text-[10px] text-muted-foreground">{t("v3.leaderboard.col.volume")}</div>
                      <div className="font-mono text-sm font-medium tabular-nums">
                        {formatCell("volume", row.volume)}
                      </div>
                    </div>
                    <div className="rounded-md bg-secondary/60 py-1.5">
                      <div className="text-[10px] text-muted-foreground">{t("v3.leaderboard.col.iv")}</div>
                      <div className="font-mono text-sm font-medium tabular-nums">
                        {formatCell("iv", row.iv)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {config.paginated && allowFilter("page") ? (
          <div className="flex flex-wrap items-center justify-center gap-2 border-x border-border bg-card px-4 py-4">
            {Array.from({ length: filters.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                disabled={loading}
                onClick={() => filters.setPage(p)}
                aria-current={p === filters.page ? "page" : undefined}
                className={cn(
                  "min-w-[2.25rem] rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  p === filters.page ? "bg-primary text-primary-foreground" : "hover:bg-secondary disabled:opacity-50",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        ) : null}

        {!access.is_member ? (
          <div className="rounded-b-xl border border-border bg-secondary/30 p-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-heading text-lg font-bold">{t("v4.paywall.title")}</h3>
            <p className="mx-auto mt-1 max-w-md text-pretty text-sm text-muted-foreground">
              {formatMessage(t("v3.tier.freePreviewHint"), {
                limit: String(access.row_limit ?? 10),
                mask: String(access.symbol_mask_ranks ?? 3),
              })}
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:brightness-95"
            >
              {t("v3.tier.unlockFull")}
            </Link>
          </div>
        ) : (
          <div className="rounded-b-xl border border-border" />
        )}

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" />
          {t("v4.disclaimer.dataOnly")}
        </p>
      </section>
    </>
  );
}
