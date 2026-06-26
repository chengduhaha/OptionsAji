"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { Search } from "lucide-react";

import LanguageToggle from "@/components/LanguageToggle";
import StrikeGammaChart from "@/components/v3/StrikeGammaChart";
import NetGexTrendChart, { type HistRow } from "@/components/v3/NetGexTrendChart";
import GammaFlipChart from "@/components/v3/GammaFlipChart";
import { NeoPanel } from "@/components/v3/NeoPanel";
import { apiFetch } from "@/lib/apiBase";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";

const DEFAULT_SYMBOL = "SPY";

function translateRegime(regime: string, t: (key: string) => string): string {
  const lower = regime.toLowerCase();
  if (lower.includes("positive")) return t("mvp.gamma.regime.positive");
  if (lower.includes("negative")) return t("mvp.gamma.regime.negative");
  return t("mvp.gamma.regime.unknown");
}

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

export default function V3GexDashboard({ embedded = false }: { embedded?: boolean }) {
  const { t } = useI18n();
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [input, setInput] = useState(DEFAULT_SYMBOL);
  const [profile, setProfile] = useState<GexProfile | null>(null);
  const [hist, setHist] = useState<GexHistApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (sym: string) => {
    setLoading(true);
    setHistLoading(true);
    setError(null);
    setProfile(null);
    setHist(null);
    const upper = sym.trim().toUpperCase();
    if (!upper) {
      setLoading(false);
      setHistLoading(false);
      return;
    }
    try {
      const gexRes = await apiFetch(`/api/stock/${encodeURIComponent(upper)}/gex`, {
        cache: "no-store",
      });
      if (!gexRes.ok) throw new Error(`GEX ${gexRes.status}`);
      setProfile((await gexRes.json()) as GexProfile);
    } catch {
      setProfile(null);
      setError(formatMessage(t("v3.loadError"), { symbol: upper }));
    } finally {
      setLoading(false);
    }

    void (async () => {
      try {
        const histRes = await apiFetch(
          `/api/stock/${encodeURIComponent(upper)}/gex/history`,
          { cache: "no-store" },
        );
        if (histRes.ok) {
          setHist((await histRes.json()) as GexHistApi);
        } else {
          setHist(null);
        }
      } catch {
        setHist(null);
      } finally {
        setHistLoading(false);
      }
    })();
  }, [t]);

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
    <div className={embedded ? "" : "min-h-screen bg-cream text-ink"}>
      {!embedded ? (
        <header className="border-b-[3px] border-ink bg-peach px-4 py-5 md:px-8 shadow-neo-sm">
          <div className="mx-auto max-w-6xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink/70">
                {t("v3.version")}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                {t("v3.title")}
              </h1>
            </div>
            <div className="flex w-full md:w-auto items-center gap-3">
              <form onSubmit={onSubmit} className="flex flex-1 md:flex-initial gap-2">
                <label htmlFor="symbol-input" className="sr-only">
                  {t("v3.symbolLabel")}
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
                  {t("v3.search")}
                </button>
              </form>
              <LanguageToggle variant="neo" />
            </div>
          </div>
        </header>
      ) : null}

      <main className={embedded ? "space-y-6" : "mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8 space-y-6"}>
        {embedded ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b-[3px] border-ink pb-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink/70">
                {t("v3.version")}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                {t("v3.title")}
              </h1>
            </div>
            <form onSubmit={onSubmit} className="flex w-full md:w-auto gap-2">
              <label htmlFor="symbol-input-embedded" className="sr-only">
                {t("v3.symbolLabel")}
              </label>
              <input
                id="symbol-input-embedded"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                placeholder="SPY"
                className="neo-input flex-1 md:w-44 font-mono text-sm uppercase"
                maxLength={12}
              />
              <button type="submit" className="neo-button flex items-center gap-1.5 shrink-0">
                <Search className="w-4 h-4" />
                {t("v3.search")}
              </button>
            </form>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 font-mono text-sm">
          <span className="neo-badge">{symbol}</span>
          {profile ? (
            <>
              <span className="neo-stat">
                {t("v3.netGex")}: {profile.netGex >= 0 ? "+" : ""}
                {profile.netGex.toFixed(2)}B
              </span>
              <span className="neo-stat">
                {t("v3.regime")}: {translateRegime(profile.regime, t)}
              </span>
              <span className="text-xs text-ink/60 ml-auto">
                {formatMessage(t("v3.updated"), {
                  time: new Date(profile.timestamp).toLocaleString(),
                })}
              </span>
            </>
          ) : loading ? (
            <span className="text-ink/60">{t("v3.loading")}</span>
          ) : null}
        </div>

        {error ? (
          <div className="border-[3px] border-ink bg-red-100 px-4 py-3 shadow-neo-sm font-sans text-sm">
            {error}
          </div>
        ) : null}

        <div className={clsx("space-y-6", loading && "opacity-60 pointer-events-none")}>
          <NeoPanel
            title={t("v3.strikeGammaTitle")}
            subtitle={t("v3.strikeGammaSubtitle")}
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
              <p className="text-sm text-ink/60 py-10 text-center">{t("v3.noData")}</p>
            )}
          </NeoPanel>

          <NeoPanel
            title={t("v3.netGexTitle")}
            subtitle={t("v3.netGexSubtitle")}
            accent="lavender"
          >
            {histLoading ? (
              <p className="text-sm text-ink/60 py-10 text-center font-mono">
                {t("v3.histLoading")}
              </p>
            ) : (
              <NetGexTrendChart data={merged} />
            )}
          </NeoPanel>

          <NeoPanel
            title={t("v3.gammaFlipTitle")}
            subtitle={t("v3.gammaFlipSubtitle")}
            accent="lavender"
          >
            {histLoading ? (
              <p className="text-sm text-ink/60 py-10 text-center font-mono">
                {t("v3.flipHistLoading")}
              </p>
            ) : (
              <GammaFlipChart data={merged} />
            )}
          </NeoPanel>
        </div>

        <footer className="pt-4 pb-8 text-[11px] text-ink/50 font-sans leading-relaxed border-t-[3px] border-ink/20">
          {t("v3.disclaimer")}
        </footer>
      </main>
    </div>
  );
}
