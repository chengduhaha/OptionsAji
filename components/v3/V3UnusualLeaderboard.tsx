"use client";

import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";

import { NeoPanel } from "@/components/v3/NeoPanel";
import { apiFetch } from "@/lib/apiBase";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";

type LeaderboardRow = {
  rank: number;
  code: string;
  option_name: string;
  underlying: string;
  option_type: string;
  strike: number | null;
  expiry: string | null;
  dte: number | null;
  volume: number;
  oi: number;
  vol_oi_ratio: number | null;
  premium: number | null;
  iv: number | null;
  delta: number | null;
  change_ratio: number | null;
};

type LeaderboardResponse = {
  contracts: LeaderboardRow[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  universe_count?: number;
  latency_ms?: number;
  synced_at?: string;
  cache_ttl_seconds?: number;
  filters?: { vol_oi_min?: number; volume_min?: number };
  error?: string;
};

const TOTAL_PAGES = 10;

function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

function fmtVolOi(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toFixed(2);
}

function fmtPct(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

function fmtDelta(d: number | null): string {
  if (d == null || !Number.isFinite(d)) return "—";
  return d.toFixed(3);
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

export default function V3UnusualLeaderboard() {
  const { t, locale } = useI18n();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(
        `/api/options/unusual-leaderboard?page=${targetPage}&limit=10`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = (await res.json()) as LeaderboardResponse;
      if (payload.error) throw new Error(payload.error);
      setData(payload);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : t("v3.unusual.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load(page);
  }, [page, load]);

  const volOiMin = data?.filters?.vol_oi_min ?? 3;
  const volumeMin = data?.filters?.volume_min ?? 500;

  return (
    <>
      <NeoPanel title={t("v3.unusual.title")} subtitle={t("v3.unusual.subtitle")} accent="lavender">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-[3px] border-ink pb-4 mb-0">
          <div className="filter-badge inline-flex items-center gap-2 border-[3px] border-ink bg-peach px-4 py-2 font-mono text-[11px] font-bold shadow-neo-sm">
            <span>{formatMessage(t("v3.unusual.filterVolOi"), { min: String(volOiMin) })}</span>
            <span className="opacity-40">·</span>
            <span>{formatMessage(t("v3.unusual.filterVolume"), { min: String(volumeMin) })}</span>
          </div>
          <span className="font-mono text-[11px] font-semibold border-2 border-ink px-3 py-1.5 bg-cream">
            {formatMessage(t("v3.unusual.refreshAt"), {
              time: formatRefreshTime(data?.synced_at, locale),
            })}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 py-3 border-b-[3px] border-ink bg-peach/10">
          <span className="neo-stat">
            {t("v3.unusual.universe")}{" "}
            <strong>{data?.universe_count != null ? fmtNum(data.universe_count) : "—"}</strong>
          </span>
          <span className="neo-stat">
            {t("v3.unusual.latency")}{" "}
            <strong>{data?.latency_ms != null ? `~${data.latency_ms} ms` : "—"}</strong>
          </span>
          <span className="neo-stat">
            {t("v3.unusual.lastUpdated")}{" "}
            <strong>
              {data?.synced_at
                ? new Date(data.synced_at).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")
                : "—"}
            </strong>
          </span>
          <span className="neo-stat">
            {t("v3.unusual.rowsPerPage")} <strong>10</strong>
          </span>
          <span className="neo-stat">
            {t("v3.unusual.source")} <strong>Futu OpenD</strong>
          </span>
        </div>

        <p className="px-4 md:px-6 py-2 font-mono text-[11px] text-ink/60 border-b-[3px] border-ink">
          {t("v3.unusual.sortNote")}
        </p>

        {error ? (
          <div className="m-4 border-[3px] border-ink bg-red-tint px-4 py-3 font-sans text-sm shadow-neo-sm">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px] min-w-[1100px]">
            <thead>
              <tr className="bg-ink text-cream">
                {[
                  t("v3.unusual.col.rank"),
                  t("v3.unusual.col.contract"),
                  t("v3.unusual.col.underlying"),
                  t("v3.unusual.col.type"),
                  t("v3.unusual.col.strike"),
                  t("v3.unusual.col.expiry"),
                  t("v3.unusual.col.volume"),
                  t("v3.unusual.col.oi"),
                  t("v3.unusual.col.volOi"),
                  t("v3.unusual.col.premium"),
                  t("v3.unusual.col.iv"),
                  t("v3.unusual.col.delta"),
                  t("v3.unusual.col.change"),
                ].map((label, idx) => (
                  <th
                    key={label}
                    className={clsx(
                      "px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                      idx >= 4 && idx !== 5 ? "text-right" : "text-left",
                    )}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center font-mono text-ink/60">
                    {t("v3.unusual.loading")}
                  </td>
                </tr>
              ) : !data?.contracts?.length ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center font-mono text-ink/60">
                    {t("v3.unusual.empty")}
                  </td>
                </tr>
              ) : (
                data.contracts.map((row) => {
                  const isHot = (row.vol_oi_ratio ?? 0) > 10;
                  const isCall = row.option_type === "C";
                  const changeClass =
                    (row.change_ratio ?? 0) >= 0 ? "text-[#0A6B52]" : "text-[#C03030]";
                  const expiryShort = row.expiry ? row.expiry.slice(5) : "—";

                  return (
                    <tr
                      key={`${row.code}-${row.rank}`}
                      className={clsx(
                        "border-b-2 border-ink transition-colors hover:bg-lavender/20",
                        isHot && "bg-peach/35 hover:bg-peach/50",
                      )}
                    >
                      <td className="px-3 py-2 text-center font-display text-base font-extrabold w-10">
                        {row.rank}
                      </td>
                      <td className="px-3 py-2 font-mono text-[12px] font-bold">{row.option_name}</td>
                      <td className="px-3 py-2 font-display text-sm font-extrabold tracking-wide">
                        {row.underlying}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={clsx(
                            "inline-block border-2 border-ink px-2 py-0.5 font-mono text-[10px] font-bold shadow-[2px_2px_0_#151617]",
                            isCall ? "bg-green-tint text-[#0A6B52]" : "bg-red-tint text-[#A03030]",
                          )}
                        >
                          {row.option_type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums">
                        {row.strike != null ? row.strike.toFixed(2) : "—"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {expiryShort}
                        {row.dte === 0 ? (
                          <span className="ml-1.5 inline-block border-2 border-ink bg-lavender px-1.5 py-0 font-mono text-[9px] font-bold align-middle">
                            0DTE
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums">
                        {fmtNum(row.volume)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums">
                        {fmtNum(row.oi)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums">
                        {isHot ? (
                          <span className="inline-block border-2 border-ink bg-peach px-1.5 py-0 font-bold shadow-[2px_2px_0_#151617]">
                            {fmtVolOi(row.vol_oi_ratio)}
                          </span>
                        ) : (
                          fmtVolOi(row.vol_oi_ratio)
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums">
                        {row.premium != null ? `$${row.premium.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums">
                        {row.iv != null ? `${row.iv.toFixed(1)}%` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums">
                        {fmtDelta(row.delta)}
                      </td>
                      <td className={clsx("px-3 py-2 text-right font-mono font-semibold tabular-nums", changeClass)}>
                        {fmtPct(row.change_ratio)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-4 border-t-[3px] border-ink bg-cream">
          {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              disabled={loading}
              onClick={() => setPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={clsx(
                "min-w-[2.25rem] border-2 border-ink px-2.5 py-1.5 font-mono text-xs font-bold transition-colors",
                p === page
                  ? "bg-lavender shadow-neo-sm"
                  : "bg-cream hover:bg-peach/40 disabled:opacity-50",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </NeoPanel>

      <footer className="mt-2 border-[3px] border-ink px-4 py-3 text-center text-[11px] leading-relaxed text-ink/70 shadow-neo-sm">
        {t("v3.disclaimer")}
        <br />
        <span className="font-mono">{t("v3.unusual.footerNote")}</span>
      </footer>
    </>
  );
}
