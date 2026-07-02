"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";

import V4GammaFlipChart from "@/components/v4/charts/V4GammaFlipChart";
import V4NetGexTrendChart, { type V4HistRow } from "@/components/v4/charts/V4NetGexTrendChart";
import V4StrikeGammaChart from "@/components/v4/charts/V4StrikeGammaChart";
import { V4MembershipPaywall } from "@/components/v4/V4MembershipPaywall";
import V4Panel from "@/components/v4/V4Panel";
import { useAuth } from "@/lib/auth-context";
import { authFetch } from "@/lib/apiBase";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

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

function ChartAnswer({ answerKey }: { answerKey: string }) {
  const { t } = useI18n();
  return (
    <p className="mb-5 flex items-start gap-1.5 text-pretty text-sm text-muted-foreground">
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      <span>
        <span className="font-medium text-foreground">{t("v3.leaderboard.answerPrefix")}</span>
        {t(answerKey)}
      </span>
    </p>
  );
}

function mergeHistory(profile: GexProfile | null, hist: GexHistApi | null): V4HistRow[] {
  const byDay: Record<string, V4HistRow> = {};
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

export default function V4GexDashboard() {
  const { t } = useI18n();
  const { isMember, ready: authReady } = useAuth();
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [input, setInput] = useState(DEFAULT_SYMBOL);
  const [profile, setProfile] = useState<GexProfile | null>(null);
  const [hist, setHist] = useState<GexHistApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [membershipBlocked, setMembershipBlocked] = useState(false);

  const fetchData = useCallback(
    async (sym: string) => {
      setLoading(true);
      setHistLoading(true);
      setError(null);
      setMembershipBlocked(false);
      setProfile(null);
      setHist(null);
      const upper = sym.trim().toUpperCase();
      if (!upper) {
        setLoading(false);
        setHistLoading(false);
        return;
      }
      if (!isMember && upper !== DEFAULT_SYMBOL) {
        setMembershipBlocked(true);
        setLoading(false);
        setHistLoading(false);
        return;
      }
      try {
        const gexRes = await authFetch(`/api/stock/${encodeURIComponent(upper)}/gex`, {
          cache: "no-store",
        });
        if (gexRes.status === 403) {
          setMembershipBlocked(true);
          setProfile(null);
          return;
        }
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
          const histRes = await authFetch(
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
    },
    [isMember, t],
  );

  useEffect(() => {
    if (!authReady) return;
    void fetchData(symbol);
  }, [symbol, fetchData, authReady]);

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
    if (!next) return;
    if (!isMember && next !== DEFAULT_SYMBOL) {
      setMembershipBlocked(true);
      return;
    }
    setSymbol(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t("v3.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("v3.strikeGammaSubtitle")}</p>
        </div>
        <form onSubmit={onSubmit} className="flex w-full gap-2 md:w-auto">
          <label htmlFor="gex-symbol-input" className="sr-only">
            {t("v3.symbolLabel")}
          </label>
          <input
            id="gex-symbol-input"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder={DEFAULT_SYMBOL}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-44"
            maxLength={12}
            disabled={!isMember}
          />
          <button
            type="submit"
            disabled={!isMember && input !== DEFAULT_SYMBOL}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:brightness-95 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            {t("v3.search")}
          </button>
        </form>
      </div>

      {!isMember ? (
        <p className="inline-block rounded-md border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
          {t("v3.membership.gexFreeHint")}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-md bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
          {symbol}
        </span>
        {profile ? (
          <>
            <span className="rounded-md bg-secondary px-2.5 py-1 font-mono text-xs tabular-nums">
              {t("v3.netGex")}: {profile.netGex >= 0 ? "+" : ""}
              {profile.netGex.toFixed(2)}B
            </span>
            <span className="rounded-md bg-secondary px-2.5 py-1 font-mono text-xs">
              {t("v3.regime")}: {translateRegime(profile.regime, t)}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              {formatMessage(t("v3.updated"), {
                time: new Date(profile.timestamp).toLocaleString(),
              })}
            </span>
          </>
        ) : loading ? (
          <span className="text-muted-foreground">{t("v3.loading")}</span>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {membershipBlocked ? (
        <V4Panel>
          <V4MembershipPaywall />
        </V4Panel>
      ) : (
        <div className={cn("space-y-6", loading && "pointer-events-none opacity-60")}>
          <V4Panel title={t("v3.strikeGammaTitle")} subtitle={t("v3.strikeGammaSubtitle")}>
            <ChartAnswer answerKey="v3.gex.strikeGamma.answer" />
            {profile?.strikes?.length ? (
              <V4StrikeGammaChart
                ticker={symbol}
                strikes={profile.strikes}
                price={spot}
                gammaFlip={profile.gammaFlip}
              />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">{t("v3.noData")}</p>
            )}
          </V4Panel>

          <V4Panel title={t("v3.netGexTitle")} subtitle={t("v3.netGexSubtitle")}>
            <ChartAnswer answerKey="v3.gex.netGex.answer" />
            {histLoading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">{t("v3.histLoading")}</p>
            ) : (
              <V4NetGexTrendChart data={merged} />
            )}
          </V4Panel>

          <V4Panel title={t("v3.gammaFlipTitle")} subtitle={t("v3.gammaFlipSubtitle")}>
            <ChartAnswer answerKey="v3.gex.gammaFlip.answer" />
            {histLoading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {t("v3.flipHistLoading")}
              </p>
            ) : (
              <V4GammaFlipChart data={merged} />
            )}
          </V4Panel>

          <V4Panel title={t("v3.gex.atmGamma.title")}>
            <ChartAnswer answerKey="v3.gex.atmGamma.answer" />
            <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-border bg-secondary/20 px-5 py-6">
              <p className="text-sm leading-relaxed text-muted-foreground">{t("v3.gex.atmGamma.teaser")}</p>
              <Link
                href="/options/near-atm-gamma"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-95"
              >
                {t("v3.gex.atmGamma.viewBoard")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </V4Panel>
        </div>
      )}
    </div>
  );
}
