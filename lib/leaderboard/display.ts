import type { ColumnKey, LeaderboardRow } from "@/lib/leaderboard/types";

export function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

export function fmtKmb(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return fmtNum(Math.round(v));
}

export function fmtMoney(v: number): string {
  return `$${fmtKmb(v)}`;
}

export function fmtMoney2(v: number): string {
  return `$${v.toFixed(2)}`;
}

export function fmtPct(v: number | null, signed = false): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const sign = signed && v > 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

export function fmtNum2(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toFixed(2);
}

export function fmtNum3(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toFixed(3);
}

export function fmtNum4(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toFixed(4);
}

export function formatRefreshTime(iso: string | undefined, locale: string): string {
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

export function cellValue(row: LeaderboardRow, key: ColumnKey): number | null {
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
    case "iv_rank":
      return row.iv_rank;
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

export function formatCell(key: ColumnKey, value: number | null): string {
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
    case "iv_rank":
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
