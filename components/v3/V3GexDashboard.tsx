"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { Search } from "lucide-react";

import { apiFetch } from "@/lib/apiBase";
import StrikeGammaChart from "@/components/v3/StrikeGammaChart";
import NetGexTrendChart, { type HistRow } from "@/components/v3/NetGexTrendChart";
import GammaFlipChart from "@/components/v3/GammaFlipChart";
import { NeoPanel } from "@/components/v3/NeoPanel";

const DEFAULT_SYMBOL = "SPY";

type StrikeData = {
  strike: number;
  callGex: number;
  putGex: number;
  net: number;
  gamma: number;
  oi: number;
  iv: number;
};

type GexProfile = {
  symbol: string;
  expiration: string;
  netGex: number;
  gammaFlip: number;
  regime: string;
  strikes: StrikeData[];
  timestamp: string;
  underlyingPrice?: number;
};

type GexHistApi = {
  gexSeries: Array<{ date?: string; netGex?: number; gammaFlip?: number | null }>;
  priceCloses: Array<{ date: string; close: number }>;
};

function mergeHistory(profile: GexProfile | null, hist: GexHistApi | null): HistRow[] {
  const byDay: Record<string, HistRow> = {};
  for (const g of hist?.gexSeries ?? []) {
    const d = (g.date ?? "").slice(0, 10);
    if (!d) continue;
    byDay[d] = {
      date: d,
      net: typeof g.netGex === "number" ? g.netGex : undefined,
      flip: typeof g.gammaFlip === "number" ? g.gammaFlip : undefined,
      close: byDay[d]?.close,
    };
  }
  for (const c of hist?.priceCloses ?? []) {
    const d = c.date.slice(0, 10);
    const prev = byDay[d];
    byDay[d] = {
      date: d,
      net: prev?.net,
      flip: prev?.flip,
      close: c.close,
    };
  }
  if (profile && typeof profile.netGex === "number") {
    const d = (profile.timestamp || new Date().toISOString()).slice(0, 10);
    const prev = byDay[d];
    byDay[d] = {
      date: d,
      net: profile.netGex,
      flip: typeof profile.gammaFlip === "number" ? profile.gammaFlip : prev?.flip,
      close:
        typeof profile.underlyingPrice === "number" ? profile.underlyingPrice : prev?.close,
    };
  }
  return Object.keys(byDay)
    .sort()
    .map((k) => byDay[k]!);
}

export default function V3GexDashboard() {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [input, setInput] = useState(DEFAULT_SYMBOL);
  const [profile, setProfile] = useState<GexProfile | null>(null);
  const [hist, setHist] = useState<GexHistApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (sym: string) => {
    setLoading(true);
    setError(null);
    const upper = sym.trim().toUpperCase();
    if (!upper) {
      setLoading(false);
      return;
    }
    try {
      const [gexRes, histRes] = await Promise.all([
        apiFetch(`/api/stock/${encodeURIComponent(upper)}/gex`, { cache: "no-store" }),
        apiFetch(`/api/stock/${encodeURIComponent(upper)}/gex/history`, { cache: "no-store" }),
      ]);
      if (!gexRes.ok) throw new Error(`GEX ${gexRes.status}`);
      setProfile((await gexRes.json()) as GexProfile);
      if (histRes.ok) {
        setHist((await histRes.json()) as GexHistApi);
      } else {
        setHist(null);
      }
    } catch {
      setProfile(null);
      setHist(null);
      setError(`无法加载 ${upper} 的 GEX 数据，请稍后重试。`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(symbol);
  }, [symbol, fetchData]);

  const merged = useMemo(() => mergeHistory(profile, hist), [profile, hist]);

  const spot =
    profile?.underlyingPrice && profile.underlyingPrice > 0
      ? profile.underlyingPrice
      : profile?.strikes?.length
        ? profile.strikes[Math.floor(profile.strikes.length / 2)]!.strike
        : 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = input.trim().toUpperCase();
    if (next) setSymbol(next);
  };

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b-[3px] border-ink bg-peach px-4 py-5 md:px-8 shadow-neo-sm">
        <div className="mx-auto max-w-6xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink/70">
              OptionsAji v3.0
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
              Gamma Exposure
            </h1>
          </div>
          <form onSubmit={onSubmit} className="flex w-full md:w-auto gap-2">
            <label htmlFor="symbol-input" className="sr-only">
              Stock symbol
            </label>
            <input
              id="symbol-input"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="SPY"
              className="neo-input flex-1 md:w-44 font-mono text-sm uppercase"
              maxLength={12}
            />
            <button type="submit" className="neo-button flex items-center gap-1.5 shrink-0">
              <Search className="w-4 h-4" />
              查询
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3 font-mono text-sm">
          <span className="neo-badge">{symbol}</span>
          {profile ? (
            <>
              <span className="neo-stat">
                Net GEX: {profile.netGex >= 0 ? "+" : ""}
                {profile.netGex.toFixed(2)}B
              </span>
              <span className="neo-stat">Regime: {profile.regime}</span>
              <span className="text-xs text-ink/60 ml-auto">
                更新 {new Date(profile.timestamp).toLocaleString()}
              </span>
            </>
          ) : loading ? (
            <span className="text-ink/60">加载中…</span>
          ) : null}
        </div>

        {error ? (
          <div className="border-[3px] border-ink bg-red-100 px-4 py-3 shadow-neo-sm font-sans text-sm">
            {error}
          </div>
        ) : null}

        <div className={clsx("space-y-6", loading && "opacity-60 pointer-events-none")}>
          <NeoPanel
            title="Strike Gamma 分布"
            subtitle="各行权价 Call / Put Gamma Exposure 柱状分布"
            accent="peach"
          >
            {profile?.strikes?.length ? (
              <StrikeGammaChart
                ticker={symbol}
                strikes={profile.strikes}
                price={spot}
                gammaFlip={profile.gammaFlip}
              />
            ) : (
              <p className="text-sm text-ink/60 py-10 text-center">暂无数据</p>
            )}
          </NeoPanel>

          <NeoPanel
            title="Net GEX vs 收盘价"
            subtitle="Net Gamma Exposure 与标的收盘价历史趋势"
            accent="lavender"
          >
            <NetGexTrendChart data={merged} />
          </NeoPanel>

          <NeoPanel
            title="Gamma Flip 估算"
            subtitle="做市商 Gamma 翻转点位历史估算"
            accent="lavender"
          >
            <GammaFlipChart data={merged} />
          </NeoPanel>
        </div>

        <footer className="pt-4 pb-8 text-[11px] text-ink/50 font-sans leading-relaxed border-t-[3px] border-ink/20">
          本平台仅提供数据分析和教育内容，不构成投资建议。数据延迟约 15 分钟。
        </footer>
      </main>
    </div>
  );
}
