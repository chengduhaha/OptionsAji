"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Clock3,
  Gauge,
  GitBranch,
  Info,
  LineChart as LineChartIcon,
  Loader2,
  Maximize2,
  Newspaper,
  RefreshCw,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import GexChart from "@/components/gex/GexChart";
import GexTrendChart, { type HistRow } from "@/components/gex/GexTrendChart";
import { interpretPCR, interpretVix } from "@/components/shared/DataLabel";
import { api } from "@/lib/api";
import {
  localizedBullets,
  localizedRiskNote,
} from "@/lib/contracts";
import { formatMessage, resolveDictionaryValue } from "@/lib/i18n/dictionary";
import { LOCALE_CHANGE_EVENT, useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";
import { CHART, tooltipStyle } from "@/lib/chart-theme";
import { buildMvpRequestHeaders } from "@/lib/access-key";
import { AccessKeyModal } from "@/components/access-key/AccessKeyModal";
import { LockedContent } from "@/components/gate/LockedContent";
import { UnlockPromptModal } from "@/components/gate/UnlockPromptModal";
import { useMvpTier } from "@/hooks/useMvpTier";
import { tierMeetsRequired, unwrapMvpEnvelope, type UnlockReason } from "@/lib/mvp-tier";
import ExpectedMoveDetailModal, {
  type ExpectedMoveRow,
} from "@/components/mvp/ExpectedMoveDetailModal";
import {
  expectedMoveBucketHint,
  expectedMoveBucketLabel,
  getOptionFrameworkIntro,
  getOptionTableLegend,
  getPlaybookScreenerFootnote,
} from "@/lib/option-framework";
import {
  formatWarRoomImpactLabel,
  impactIsBearishOrRisk,
  impactIsBullish,
  localizedImpactScopeFallback,
  mergeRelatedAssets,
  normalizeWarRoomImpact,
  normalizeWarRoomImpactScope,
  warRoomImpactScopeLabel,
  type WarRoomImpact,
  type WarRoomImpactScope,
} from "@/lib/war-room-impact";
import {
  type MvpMarketRegimeCode,
  classifyRegimeFromMetrics,
  normalizeRegimeCode,
  regimeMeta,
} from "@/lib/market-regime";
import {
  buildGammaStructureRead,
  isMeanReversion,
  isVolatilityExpansion,
  selectGammaStructureSpot,
} from "@/lib/gex-decision";
import type {
  AnalystPriceTargetContract,
  FeedEnvelopeContract,
  FeedItemContract,
  MarketOverviewContract,
  MvpMarketInsightsContract,
  SignalCardContract,
  SignalsFeedEnvelopeContract,
  SmartVsRetailContract,
  StockOptionsInsightsContract,
  StockOverviewContract,
} from "@/lib/contracts";

type Direction = "bull" | "bear" | "neutral";
type JsonRecord = Record<string, unknown>;

type AsyncSlot<T> = {
  data: T | null;
  error: string | null;
};

type WarRoomData = {
  mvp: AsyncSlot<JsonRecord>;
  overview: AsyncSlot<MarketOverviewContract>;
  marketInsights: AsyncSlot<MvpMarketInsightsContract>;
  brief: AsyncSlot<{ brief?: string }>;
  macro: AsyncSlot<JsonRecord>;
  news: AsyncSlot<JsonRecord>;
  feed: AsyncSlot<FeedEnvelopeContract>;
  signals: AsyncSlot<SignalsFeedEnvelopeContract>;
};

type StockReport = {
  quote: AsyncSlot<JsonRecord>;
  overview: AsyncSlot<StockOverviewContract>;
  priceTarget: AsyncSlot<AnalystPriceTargetContract>;
  smart: AsyncSlot<SmartVsRetailContract>;
  chain: AsyncSlot<JsonRecord>;
  gex: AsyncSlot<JsonRecord>;
  gexHistory: AsyncSlot<JsonRecord>;
  unusual: AsyncSlot<JsonRecord>;
  optionsInsights: AsyncSlot<StockOptionsInsightsContract>;
};

type EventDetail = {
  source: string;
  timeLabel: string;
  title: string;
  summary?: string;
  bullets: string[];
  riskNote?: string;
  rawOriginal?: string;
  tickers: string[];
  relatedAssets: string[];
  watchZh?: string;
  impactNote?: string;
  deepDive?: string;
  tradeImplications?: string;
  scenario?: string;
  riskWatch?: string;
  impactScopeLabel: string;
};

type EventItem = {
  id: string;
  title: string;
  body: string;
  tag: string;
  impact: WarRoomImpact;
  impactScope: WarRoomImpactScope;
  impactLabel: string;
  impactNote?: string;
  relatedAssets: string[];
  watchZh?: string;
  time: string;
  detail: EventDetail;
};

function eventDetailFromFeed(item: FeedItemContract, locale: Locale): EventDetail {
  const bullets = localizedBullets(item, locale);
  const tickers = item.tickers ?? [];
  return {
    source: "",
    timeLabel: zhTime(item.created_at_utc, locale),
    title: item.title,
    summary: item.body.trim() || undefined,
    bullets,
    riskNote: localizedRiskNote(item, locale),
    rawOriginal: item.raw_body?.trim() || undefined,
    tickers,
    relatedAssets: tickers,
    impactScopeLabel: localizedImpactScopeFallback(locale),
  };
}

function eventPreviewBody(detail: EventDetail, maxLen = 160): string {
  if (detail.bullets.length > 0) return detail.bullets.join(" · ").slice(0, maxLen);
  if (detail.summary) return detail.summary.slice(0, maxLen);
  if (detail.rawOriginal) return detail.rawOriginal.slice(0, maxLen);
  return "";
}

function EventDetailModal({
  detail,
  impact,
  impactLabel,
  onClose,
}: {
  detail: EventDetail;
  impact: WarRoomImpact;
  impactLabel: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="glass relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-glass-border p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
          aria-label={t("mvp.close")}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-wrap items-center gap-2 pr-8">
          <Pill tone={impactIsBullish(impact) ? "green" : impactIsBearishOrRisk(impact) ? "red" : "muted"}>
            {impactLabel}
          </Pill>
          <span className="text-[10px] text-muted-foreground">
            {formatMessage(t("mvp.eventDetail.scopeLabel"), { scope: detail.impactScopeLabel })}
          </span>
          <span className="ml-auto font-mono text-xs text-gold">{detail.timeLabel}</span>
        </div>

        <h2 id="event-detail-title" className="mt-4 text-lg font-semibold leading-snug text-foreground">
          {detail.title}
        </h2>

        {detail.relatedAssets.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {detail.relatedAssets.map((t) => (
              <Pill key={t} tone="blue">
                {t}
              </Pill>
            ))}
          </div>
        ) : null}

        {detail.impactNote ? (
          <p className="mt-2 text-xs leading-5 text-gold/90">{detail.impactNote}</p>
        ) : null}

        {detail.watchZh ? (
          <section className="mt-3 rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2">
            <h3 className="text-[11px] uppercase tracking-wider text-muted">{t("mvp.eventDetail.watchPoints")}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail.watchZh}</p>
          </section>
        ) : null}

        {detail.deepDive || detail.tradeImplications || detail.scenario || detail.riskWatch ? (
          <section className="mt-4 grid grid-cols-1 gap-2">
            {detail.deepDive ? (
              <div className="rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2">
                <h3 className="text-[11px] uppercase tracking-wider text-muted">{t("mvp.eventDetail.deepDive")}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground whitespace-pre-wrap">{detail.deepDive}</p>
              </div>
            ) : null}
            {detail.tradeImplications ? (
              <div className="rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2">
                <h3 className="text-[11px] uppercase tracking-wider text-muted">{t("mvp.eventDetail.tradeImpact")}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground whitespace-pre-wrap">{detail.tradeImplications}</p>
              </div>
            ) : null}
            {detail.scenario ? (
              <div className="rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2">
                <h3 className="text-[11px] uppercase tracking-wider text-muted">{t("mvp.eventDetail.scenario")}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground whitespace-pre-wrap">{detail.scenario}</p>
              </div>
            ) : null}
            {detail.riskWatch ? (
              <div className="rounded-lg border border-red/20 bg-red/10 px-3 py-2">
                <h3 className="text-[11px] uppercase tracking-wider text-red">{t("mvp.eventDetail.invalidation")}</h3>
                <p className="mt-1 text-sm leading-6 text-red/90 whitespace-pre-wrap">{detail.riskWatch}</p>
              </div>
            ) : null}
          </section>
        ) : null}

        {detail.summary ? (
          <section className="mt-4">
            <h3 className="text-[11px] uppercase tracking-wider text-muted">{t("mvp.eventDetail.summary")}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground whitespace-pre-wrap">{detail.summary}</p>
          </section>
        ) : null}

        {detail.bullets.length > 0 ? (
          <section className="mt-4">
            <h3 className="text-[11px] uppercase tracking-wider text-muted">{t("mvp.eventDetail.bullets")}</h3>
            <ul className="mt-2 space-y-2">
              {detail.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2 text-sm leading-6 text-foreground">
                  <span className="text-gold">·</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {detail.riskNote ? (
          <section className="mt-4 rounded-lg border border-red/20 bg-red/10 px-3 py-2">
            <h3 className="text-[11px] uppercase tracking-wider text-red">{t("mvp.eventDetail.riskNote")}</h3>
            <p className="mt-1 text-sm leading-6 text-red/90 whitespace-pre-wrap">{detail.riskNote}</p>
          </section>
        ) : null}

        {detail.rawOriginal ? (
          <section className="mt-4">
            <h3 className="text-[11px] uppercase tracking-wider text-muted">{t("mvp.eventDetail.original")}</h3>
            <p className="mt-2 rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2 text-xs leading-6 text-muted-foreground whitespace-pre-wrap">
              {detail.rawOriginal}
            </p>
          </section>
        ) : null}

        {!detail.summary && detail.bullets.length === 0 && !detail.rawOriginal ? (
          <p className="mt-4 text-sm text-muted">{t("mvp.eventDetail.noAiContent")}</p>
        ) : null}
      </div>
    </div>
  );
}

type OptionCandidate = {
  side: "call" | "put";
  strike: number;
  expiration: string;
  dte: number | null;
  bid: number | null;
  ask: number | null;
  mid: number | null;
  ivPct: number | null;
  delta: number | null;
  volume: number | null;
  openInterest: number | null;
};

type GexStrikeRow = {
  strike: number;
  callGex: number;
  putGex: number;
  net: number;
  gamma: number;
  oi: number;
  iv: number;
};

const QUICK_SYMBOLS = ["SPY", "QQQ", "NVDA", "TSLA", "AAPL", "AMD"];
/** Rolling Discord window for market overview (matches backend war-room). */
const DISCORD_EVENT_HOURS = 6;
/** Auto-refresh market overview + Discord-backed events. */
const WAR_ROOM_REFRESH_MS = 5 * 60 * 1000;
const PAGE_CACHE_TTL_MS = 3 * 60 * 1000;
const ACTIVE_EVENT_KINDS = new Set(["discord", "macro", "news"]);

const EMPTY_WAR_ROOM: WarRoomData = {
  mvp: { data: null, error: null },
  overview: { data: null, error: null },
  marketInsights: { data: null, error: null },
  brief: { data: null, error: null },
  macro: { data: null, error: null },
  news: { data: null, error: null },
  feed: { data: null, error: null },
  signals: { data: null, error: null },
};

const cachedWarRoom = new Map<
  Locale,
  {
    data: WarRoomData;
    updatedAt: string | null;
    cachedAt: number;
  }
>();

const cachedStockReports = new Map<
  string,
  {
    data: StockReport;
    cachedAt: number;
  }
>();

function isFresh(cachedAt: number): boolean {
  return Date.now() - cachedAt < PAGE_CACHE_TTL_MS;
}

function getFreshWarRoomCache(locale: Locale) {
  const cached = cachedWarRoom.get(locale);
  return cached && isFresh(cached.cachedAt) ? cached : null;
}

function reportCacheKey(symbol: string, direction: Direction, regimeCode?: string | null): string {
  return `${symbol.toUpperCase()}:${direction}:${regimeCode || "no-regime"}`;
}

function getFreshReportCache(symbol: string, direction: Direction, regimeCode?: string | null) {
  const cached = cachedStockReports.get(reportCacheKey(symbol, direction, regimeCode));
  return cached && isFresh(cached.cachedAt) ? cached : null;
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace("%", ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function pct(value: unknown, digits = 2): string {
  const n = num(value);
  if (n === null) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

function money(value: unknown, digits = 2): string {
  const n = num(value);
  if (n === null) return "—";
  return `$${n.toFixed(digits)}`;
}

function zhTime(value: unknown, locale: Locale = "zh"): string {
  const raw = text(value);
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString(locale === "en" ? "en-US" : "zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error || "加载失败");
}

/** Beijing calendar day as YYYY-MM-DD for macro calendar window. */
function beijingDateString(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
}

const MACRO_EVENT_ZH: Array<[string, string]> = [
  ["nonfarm", "非农就业"],
  ["payrolls", "非农就业"],
  ["cpi", "CPI 通胀"],
  ["ppi", "PPI 生产者物价"],
  ["fomc", "FOMC 利率决议"],
  ["fed", "美联储"],
  ["gdp", "GDP"],
  ["pmi", "PMI"],
  ["retail sales", "零售销售"],
  ["jobless", "初请失业金"],
  ["unemployment", "失业率"],
  ["consumer confidence", "消费者信心"],
  ["ism", "ISM 制造业"],
  ["housing", "房地产数据"],
  ["trade balance", "贸易帐"],
  ["jolts", "JOLTS 职位空缺"],
];

function macroEventTitleZh(eventName: string): string {
  const lower = eventName.toLowerCase();
  for (const [key, zh] of MACRO_EVENT_ZH) {
    if (lower.includes(key)) return zh;
  }
  if (/[\u4e00-\u9fff]/.test(eventName)) return eventName;
  return `宏观：${eventName}`;
}

function friendlyApiError(error: string | null, slot: string): string | null {
  if (!error) return null;
  const lower = error.toLowerCase();
  if (lower.includes("internal server error") || lower.includes("500")) {
    if (slot === "overview") return "个股行情源暂不可用，请稍后刷新";
    if (slot === "chain") return "期权链快照暂不可用";
    return "服务暂时不可用，请稍后重试";
  }
  if (lower.includes("not found") || lower.includes("404")) {
    if (slot === "news") return "新闻数据暂不可用";
    if (slot === "priceTarget") return "分析师目标价暂不可用";
    return "部分数据接口未启用";
  }
  if (lower.includes("chain_meta_failed") || lower.includes("openrouter")) {
    return "数据源暂不可用";
  }
  return error.length > 80 ? `${error.slice(0, 80)}…` : error;
}

async function settle<T>(fn: () => Promise<T>): Promise<AsyncSlot<T>> {
  try {
    return { data: await fn(), error: null };
  } catch (error) {
    return { data: null, error: errorMessage(error) };
  }
}

async function fetchJson(
  path: string,
  authToken?: string | null,
  locale: Locale = "zh",
): Promise<JsonRecord> {
  const url = new URL(path, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  url.searchParams.set("locale", locale);
  const res = await fetch(`${url.pathname}${url.search}`, {
    cache: "no-store",
    headers: path.startsWith("/api/mvp") ? buildMvpRequestHeaders(undefined, authToken) : undefined,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  const raw = (await res.json()) as JsonRecord;
  if (path.startsWith("/api/mvp")) {
    return unwrapMvpEnvelope(raw).data as JsonRecord;
  }
  return raw;
}

function getArticles(payload: JsonRecord | null): JsonRecord[] {
  if (!payload) return [];
  return asArray(payload.articles).map(asRecord);
}

function getEvents(payload: JsonRecord | null): JsonRecord[] {
  if (!payload) return [];
  return asArray(payload.events).map(asRecord);
}

type MarketStateView = {
  code: MvpMarketRegimeCode;
  label: string;
  tone: string;
  icon: typeof TrendingUp;
  summary: string;
  basis: string[];
  engineNote: string;
};

function classifyMarket(
  overview: MarketOverviewContract | null,
  signals: SignalCardContract[],
  locale: Locale,
): MarketStateView {
  const spy = overview?.pulse.find((p) => p.symbol === "SPY")?.changePct ?? null;
  const qqq = overview?.pulse.find((p) => p.symbol === "QQQ")?.changePct ?? null;
  const vix = overview?.volatility.vix ?? null;
  const vixChange = overview?.volatility.vixChangePct ?? null;
  const vixBand = overview?.volatility.band ?? "—";
  const avgIndex =
    spy !== null && qqq !== null ? (spy + qqq) / 2 : spy !== null ? spy : qqq !== null ? qqq : 0;
  const signalScore = signals.reduce((sum, sig) => {
    if (sig.direction === "bull") return sum + sig.strength;
    if (sig.direction === "bear") return sum - sig.strength;
    return sum;
  }, 0);

  const localizedBand = localizeVolatilityBand(vixBand, locale);
  const basis: string[] =
    locale === "en"
      ? [
          `SPY ${spy !== null ? pct(spy) : "—"}, QQQ ${qqq !== null ? pct(qqq) : "—"}, index avg ~${pct(avgIndex)}`,
          `VIX ${vix !== null ? vix.toFixed(2) : "—"} (${localizedBand}), day change ${vixChange !== null ? pct(vixChange) : "—"}`,
          `Signal score ${signalScore} (bull adds, bear subtracts — from /api/signals/feed)`,
        ]
      : [
          `SPY 涨跌 ${spy !== null ? pct(spy) : "—"}，QQQ 涨跌 ${qqq !== null ? pct(qqq) : "—"}，指数均值约 ${pct(avgIndex)}`,
          `VIX 现价 ${vix !== null ? vix.toFixed(2) : "—"}（${localizedBand}），日变化 ${vixChange !== null ? pct(vixChange) : "—"}`,
          `信号综合得分 ${signalScore}（上涨情景加分、下跌情景减分，来自 /api/signals/feed）`,
        ];

  const engineNote =
    resolveDictionaryValue(locale, "mvp.engineNoteUnavailable") ??
    "阿吉深度洞察暂不可用，以下为盘面依据供对照。";
  const classified = classifyRegimeFromMetrics(
    {
      avgIndex,
      vix,
      vixChange,
      vixBand,
      signalScore,
    },
    locale,
  );
  const meta = regimeMeta(classified.code, locale);
  return {
    code: classified.code,
    label: classified.label,
    tone: meta.tone,
    icon: regimeIcon(classified.code),
    summary: classified.summary,
    basis: [...basis, classified.reasoning],
    engineNote,
  };
}

function regimeIcon(code: MvpMarketRegimeCode): typeof TrendingUp {
  if (code === "risk_off") return TrendingDown;
  if (code === "risk_on") return TrendingUp;
  if (code === "elevated_vol") return Gauge;
  if (code === "range_bound") return BarChart3;
  return Clock3;
}

function regimeAccentBorder(code: MvpMarketRegimeCode): string {
  if (code === "risk_off") return "border-red/35";
  if (code === "risk_on") return "border-green/35";
  if (code === "elevated_vol") return "border-gold/35";
  if (code === "range_bound") return "border-blue/35";
  return "border-gold/25";
}

function regimeAccentBar(code: MvpMarketRegimeCode): string {
  if (code === "risk_off") return "bg-red";
  if (code === "risk_on") return "bg-green";
  if (code === "elevated_vol") return "bg-gold";
  if (code === "range_bound") return "bg-blue";
  return "bg-gold/70";
}

function localizeMarketSessionLabel(label: string | null, locale: Locale): string | null {
  if (!label) return null;
  if (locale === "zh") return label;
  const map: Record<string, string> = {
    盘前交易: resolveDictionaryValue("en", "mvp.session.preMarketFull") ?? "Pre-market",
    盘前: resolveDictionaryValue("en", "mvp.session.preMarket") ?? "Pre-market",
    盘中交易: resolveDictionaryValue("en", "mvp.session.marketOpen") ?? "Market open",
    盘中: resolveDictionaryValue("en", "mvp.session.marketOpen") ?? "Market open",
    盘后交易: resolveDictionaryValue("en", "mvp.session.afterHours") ?? "After hours",
    盘后: resolveDictionaryValue("en", "mvp.session.afterHours") ?? "After hours",
    休市: resolveDictionaryValue("en", "mvp.session.closed") ?? "Closed",
  };
  return map[label] ?? label;
}

function localizeVolatilityBand(band: string, locale: Locale): string {
  if (locale === "zh") return band;
  const map: Record<string, string> = {
    低波动: "Low vol",
    正常: "Normal",
    "正常(15-20)": "Normal (15–20)",
    偏高: "Elevated",
    高波动: "High vol",
  };
  return map[band] ?? band;
}

function indexDirectionRead(avgIndex: number, locale: Locale): { label: string; tone: string; hint: string } {
  if (avgIndex >= 0.35) {
    return {
      label: resolveDictionaryValue(locale, "mvp.index.strong") ?? "偏强",
      tone: "text-green",
      hint:
        locale === "en"
          ? `SPY/QQQ avg up ${pct(avgIndex)} — broad indices trending higher`
          : `SPY/QQQ 平均涨 ${pct(avgIndex)}，宽基指数方向向上`,
    };
  }
  if (avgIndex <= -0.35) {
    return {
      label: resolveDictionaryValue(locale, "mvp.index.weak") ?? "偏弱",
      tone: "text-red",
      hint:
        locale === "en"
          ? `SPY/QQQ avg down ${Math.abs(avgIndex).toFixed(2)}% — broad indices under pressure`
          : `SPY/QQQ 平均跌 ${Math.abs(avgIndex).toFixed(2)}%，宽基指数承压`,
    };
  }
  return {
    label: resolveDictionaryValue(locale, "mvp.index.range") ?? "震荡",
    tone: "text-blue",
    hint:
      locale === "en"
        ? `Limited index move (avg ${pct(avgIndex)}) — direction unconfirmed`
        : `指数涨跌有限（均值 ${pct(avgIndex)}），方向待确认`,
  };
}

function pcrMoodRead(pcr: number | null, locale: Locale): { label: string; tone: string; barPct: number } {
  if (pcr === null) return { label: "—", tone: "text-muted", barPct: 50 };
  if (pcr > 1.2) {
    return { label: resolveDictionaryValue(locale, "mvp.pcr.extremeBear") ?? "极度看跌", tone: "text-red", barPct: 85 };
  }
  if (pcr > 1) {
    return { label: resolveDictionaryValue(locale, "mvp.pcr.cautious") ?? "偏谨慎", tone: "text-gold", barPct: 65 };
  }
  if (pcr < 0.5) {
    return { label: resolveDictionaryValue(locale, "mvp.pcr.extremeBull") ?? "极度看涨", tone: "text-green", barPct: 15 };
  }
  if (pcr < 0.7) {
    return { label: resolveDictionaryValue(locale, "mvp.pcr.optimistic") ?? "偏乐观", tone: "text-green", barPct: 35 };
  }
  return { label: resolveDictionaryValue(locale, "mvp.pcr.balanced") ?? "均衡", tone: "text-blue", barPct: 50 };
}

function buildPlainLanguageBasis(args: {
  avgIndex: number;
  vix: number | null;
  vixChange: number | null;
  vixBand: string;
  pcr: number | null;
  regimeLabel: string;
  locale: Locale;
}): string[] {
  const lines: string[] = [];
  const indexRead = indexDirectionRead(args.avgIndex, args.locale);
  lines.push(indexRead.hint);

  if (args.vix !== null) {
    const band = localizeVolatilityBand(args.vixBand, args.locale);
    if (args.locale === "en") {
      if (args.vixChange !== null && args.vixChange > 5) {
        lines.push(`VIX spiked to ${args.vix.toFixed(1)} (${band}) — fear/vol heating up fast`);
      } else if (args.vix >= 22) {
        lines.push(`VIX ${args.vix.toFixed(1)} elevated — options premium and hedge cost rising`);
      } else if (args.vix < 15) {
        lines.push(`VIX ${args.vix.toFixed(1)} low — muted market volatility`);
      } else {
        lines.push(`VIX ${args.vix.toFixed(1)} (${band}) — volatility in a normal range`);
      }
    } else if (args.vixChange !== null && args.vixChange > 5) {
      lines.push(`VIX 急升至 ${args.vix.toFixed(1)}（${band}），波动/恐慌快速升温`);
    } else if (args.vix >= 22) {
      lines.push(`VIX ${args.vix.toFixed(1)} 处于偏高区间，期权溢价与对冲成本上升`);
    } else if (args.vix < 15) {
      lines.push(`VIX ${args.vix.toFixed(1)} 处于低位，市场波动较小`);
    } else {
      lines.push(`VIX ${args.vix.toFixed(1)}（${band}），波动率处于常规区间`);
    }
  }

  if (args.pcr !== null) {
    const mood = pcrMoodRead(args.pcr, args.locale);
    const balanced = resolveDictionaryValue(args.locale, "mvp.pcr.balanced") ?? "均衡";
    if (args.locale === "en") {
      lines.push(
        mood.label === balanced
          ? `P/C ${args.pcr.toFixed(2)} — Put/Call volume balanced, no extreme sentiment`
          : `P/C ${args.pcr.toFixed(2)} — options flow tone: ${mood.label}`,
      );
    } else {
      lines.push(
        mood.label === balanced
          ? `P/C ${args.pcr.toFixed(2)}，Put/Call 成交均衡，无极端情绪`
          : `P/C ${args.pcr.toFixed(2)}，期权成交情绪${mood.label}`,
      );
    }
  }

  lines.push(
    args.locale === "en" ? `Overall read: ${args.regimeLabel}` : `综合判断：${args.regimeLabel}`,
  );
  return lines;
}

function buildHeadlineSummary(args: {
  hasAiSummary: boolean;
  fallbackSummary: string;
  code: MvpMarketRegimeCode;
  avgIndex: number;
  vix: number | null;
  vixChange: number | null;
  locale: Locale;
}): string {
  if (args.hasAiSummary) return args.fallbackSummary;

  const indexUp = args.avgIndex >= 0.35;
  const indexDown = args.avgIndex <= -0.35;
  const vixSpike = args.vixChange !== null && args.vixChange > 5;
  const vixHigh = args.vix !== null && args.vix >= 22;
  const vixLow = args.vix !== null && args.vix < 15;
  const regimeEnglish = regimeMeta(args.code, args.locale).english;

  if (args.locale === "en") {
    if (indexUp && (vixSpike || vixHigh)) {
      const vixPart =
        args.vix !== null
          ? `VIX ${vixSpike ? "spiked to" : "elevated at"} ${args.vix.toFixed(1)}`
          : "volatility rising";
      return `Indices firm (avg ${pct(args.avgIndex)}) but ${vixPart} — strength with hidden vol risk; ${regimeEnglish} read.`;
    }
    if (indexDown && vixHigh) {
      return "Indices weak and VIX elevated — risk-off tone; prioritize hedges and sizing over dip-buying.";
    }
    if (indexUp && vixLow) {
      return "Indices up, VIX low — risk appetite OK; watch gamma and IV crush in a quiet vol tape.";
    }
    if (args.code === "range_bound") {
      return "Limited index and vol moves — range-bound tape; wait for volume and VIX to confirm a break.";
    }
    if (args.code === "transitional") {
      return "Index, VIX, and options sentiment diverge — no single regime; keep assumptions small.";
    }
    return args.fallbackSummary;
  }

  if (indexUp && (vixSpike || vixHigh)) {
    const vixPart = args.vix !== null ? `VIX ${vixSpike ? "急升至" : "偏高至"} ${args.vix.toFixed(1)}` : "波动率抬升";
    return `指数走强（均值 ${pct(args.avgIndex)}），但 ${vixPart}——表面强势下隐藏波动风险，属「涨中有险」的 ${regimeEnglish} 模式。`;
  }
  if (indexDown && vixHigh) {
    return `指数走弱且 VIX 偏高，避险情绪占主导；期权侧优先关注对冲与仓位，而非抄底假设。`;
  }
  if (indexUp && vixLow) {
    return `指数偏强、VIX 处于低位，风险偏好尚可；注意低波动环境下的 Gamma 与 IV Crush 风险。`;
  }
  if (args.code === "range_bound") {
    return `指数与波动率变动均有限，盘面呈区间震荡；突破需等待量价与 VIX 同向确认。`;
  }
  if (args.code === "transitional") {
    return `指数、VIX 与期权情绪存在分歧，暂无单一主导环境；宜缩小假设、等待交叉验证。`;
  }
  return args.fallbackSummary;
}

function hasDivergentSignals(avgIndex: number, vixChange: number | null): boolean {
  return avgIndex >= 0.35 && vixChange !== null && vixChange > 5;
}

function pcrMarkerPct(pcr: number | null): number {
  if (pcr === null) return 50;
  const clamped = Math.min(1.5, Math.max(0.5, pcr));
  return ((clamped - 0.5) / 1) * 100;
}

function MetaHint({ label, hint }: { label: string; hint: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex items-center gap-1">
      <span>{label}</span>
      <button
        type="button"
        aria-label={hint}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-muted hover:text-gold transition-colors"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open ? (
        <span className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-border2 bg-panel px-2.5 py-2 text-xs leading-5 text-muted-foreground shadow-lg">
          {hint}
        </span>
      ) : null}
    </span>
  );
}

function PulseSkeleton() {
  return (
    <div className="mt-4 flex gap-2 overflow-hidden rounded-xl border border-gold/20 market-surface market-pulse-scroll p-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 min-w-[120px] flex-1 animate-pulse rounded-lg bg-foreground/[0.06]" />
      ))}
    </div>
  );
}

function PcrSentimentBar({ pcr, locale }: { pcr: number | null; locale: Locale }) {
  const marker = pcrMarkerPct(pcr);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted">
        <span>{resolveDictionaryValue(locale, "mvp.pcr.putActive") ?? "Put 活跃"}</span>
        <span>{resolveDictionaryValue(locale, "mvp.pcr.callActive") ?? "Call 活跃"}</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-gradient-to-r from-red/40 via-gold/30 to-green/40">
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow"
          style={{ left: `${marker}%` }}
        />
      </div>
      <p className="text-xs text-muted">
        {resolveDictionaryValue(locale, "mvp.pcr.volumeRatio") ?? "P/C 成交量比 · 全市场 Put/Call 近似"}
      </p>
    </div>
  );
}

function EvidenceCard({
  title,
  icon: Icon,
  accentBar,
  borderClass,
  value,
  valueTone,
  sub,
  children,
  collapsible = false,
  open = true,
  onToggle,
}: {
  title: string;
  icon: typeof TrendingUp;
  accentBar: string;
  borderClass: string;
  value: React.ReactNode;
  valueTone?: string;
  sub?: React.ReactNode;
  children?: React.ReactNode;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
}) {
  const header = (
    <>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4 text-gold" />
        {title}
      </div>
      <div className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${valueTone ?? "text-foreground"}`}>
        {value}
      </div>
      {sub ? <div className="mt-1 text-sm">{sub}</div> : null}
    </>
  );

  return (
    <div className={`relative overflow-hidden rounded-xl border market-surface p-4 ${borderClass}`}>
      <div className={`absolute inset-x-0 top-0 h-0.5 ${accentBar}`} />
      {collapsible && onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-2 text-left md:pointer-events-none md:cursor-default"
          aria-expanded={open}
        >
          <div className="min-w-0 flex-1">{header}</div>
          <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-muted md:hidden ${open ? "rotate-180" : ""} transition-transform`} />
        </button>
      ) : (
        header
      )}
      {(!collapsible || open) ? (
        children ? <div className={`${collapsible ? "mt-3" : "mt-3"} max-md:pt-0`}>{children}</div> : null
      ) : null}
    </div>
  );
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function engineNoteFromInsights(insights: MvpMarketInsightsContract | null, locale: Locale): string {
  if (!insights) {
    return resolveDictionaryValue(locale, "mvp.engineNoteMissing") ?? "阿吉深度洞察暂不可用";
  }
  return resolveDictionaryValue(locale, "mvp.engineNoteActive") ?? "阿吉深度洞察 · 每 5 分钟更新";
}

function marketStateFromInsights(
  insights: MvpMarketInsightsContract,
  fallback: MarketStateView,
  locale: Locale,
): MarketStateView {
  const code =
    normalizeRegimeCode(insights.regime.code, insights.regime.label) ?? fallback.code;
  const meta = regimeMeta(code, locale);
  return {
    code,
    label: insights.regime.label || meta.label,
    tone: meta.tone,
    icon: regimeIcon(code),
    summary: insights.regime.summary || fallback.summary,
    basis: insights.regime.basis?.length ? insights.regime.basis : fallback.basis,
    engineNote: engineNoteFromInsights(insights, locale),
  };
}

function feedItemImpact(item: FeedItemContract): WarRoomImpact {
  const s = (item.sentiment ?? "").toLowerCase();
  if (s.includes("bull")) return "利好";
  if (s.includes("bear")) return "利空";
  if (item.kind === "macro") return "风险";
  return "中性";
}

function makeWarRoomEventItem(
  params: {
    id: string;
    title: string;
    body: string;
    tag: string;
    timeLabel: string;
    impact: WarRoomImpact;
    impactScope: WarRoomImpactScope;
    relatedAssets: string[];
    impactNote?: string;
    watchZh?: string;
    detailExtras?: Partial<EventDetail>;
  },
  locale: Locale,
): EventItem {
  const {
    id,
    title,
    body,
    tag,
    timeLabel,
    impact,
    impactScope,
    relatedAssets,
    impactNote,
    watchZh,
    detailExtras,
  } = params;
  const impactScopeLabel = warRoomImpactScopeLabel(impactScope, locale);
  const detail: EventDetail = {
    source: tag,
    timeLabel,
    title,
    summary: body || undefined,
    bullets: [],
    tickers: relatedAssets,
    relatedAssets,
    watchZh,
    impactNote,
    impactScopeLabel,
    ...detailExtras,
  };
  return {
    id,
    title,
    body: body.slice(0, 160),
    tag,
    impact,
    impactScope,
    impactLabel: formatWarRoomImpactLabel(impact, impactScope, locale),
    impactNote,
    relatedAssets,
    watchZh,
    time: timeLabel,
    detail,
  };
}

/** Prefer backend war-room events (LLM impact labels); fallback to unified feed + macro + news. */
function eventsFromMvpWarRoom(mvp: JsonRecord | null, locale: Locale): EventItem[] {
  const rows = getEvents(mvp);
  if (rows.length === 0) return [];

  return rows.map((ev) => {
    const title = text(ev.title, resolveDictionaryValue(locale, "mvp.event.market") ?? "市场事件");
    const body = text(ev.body);
    const timeRaw = text(ev.time) || text(ev.created_at_utc);
    const timeLabel = timeRaw ? zhTime(timeRaw, locale) : "—";
    const impact = normalizeWarRoomImpact(text(ev.impact, "中性"));
    const impactScope = normalizeWarRoomImpactScope(text(ev.impact_scope, "equity_broad"));
    const relatedAssets = mergeRelatedAssets(ev.related_assets, ev.tickers);
    const impactNote =
      (locale === "en" ? text(ev.impact_note_en) : text(ev.impact_note_zh)) ||
      text(ev.impact_note_zh) ||
      undefined;
    const watchZh =
      (locale === "en" ? text(ev.watch_en) : text(ev.watch_zh)) || text(ev.watch_zh) || undefined;
    const deepDive =
      (locale === "en" ? text(ev.deep_dive_en) : text(ev.deep_dive_zh)) ||
      text(ev.deep_dive_zh) ||
      undefined;
    const tradeImplications =
      (locale === "en" ? text(ev.trade_implications_en) : text(ev.trade_implications_zh)) ||
      text(ev.trade_implications_zh) ||
      undefined;
    const scenario =
      (locale === "en" ? text(ev.scenario_en) : text(ev.scenario_zh)) ||
      text(ev.scenario_zh) ||
      undefined;
    const riskWatch =
      (locale === "en" ? text(ev.risk_watch_en) : text(ev.risk_watch_zh)) ||
      text(ev.risk_watch_zh) ||
      undefined;
    return makeWarRoomEventItem(
      {
        id: text(ev.id, `${timeLabel}-${title}`),
        title,
        body,
        tag: text(ev.tag, "Discord"),
        timeLabel,
        impact,
        impactScope,
        relatedAssets,
        impactNote,
        watchZh,
        detailExtras: {
          deepDive,
          tradeImplications,
          scenario,
          riskWatch,
        },
      },
      locale,
    );
  });
}

function buildWarRoomEvents(data: WarRoomData, locale: Locale): EventItem[] {
  const fromMvp = eventsFromMvpWarRoom(data.mvp.data, locale);
  if (fromMvp.length > 0) return fromMvp.slice(0, 8);

  const events: EventItem[] = [];
  const now = Date.now();

  const feedItems = [...(data.feed.data?.items ?? [])]
    .filter((item) => ACTIVE_EVENT_KINDS.has(item.kind))
    .sort((a, b) => new Date(b.created_at_utc).getTime() - new Date(a.created_at_utc).getTime());

  for (const item of feedItems) {
    const detail = eventDetailFromFeed(item, locale);
    const preview = eventPreviewBody(detail);
    const impact = feedItemImpact(item);
    const scope: WarRoomImpactScope = item.kind === "macro" ? "macro_geo" : "equity_broad";
    const tagKey =
      item.kind === "discord" ? "mvp.tag.discord" : item.kind === "macro" ? "mvp.tag.macro" : "mvp.tag.news";
    events.push(
      makeWarRoomEventItem(
        {
          id: item.id,
          title: item.title,
          body: preview,
          tag: resolveDictionaryValue(locale, tagKey) ?? item.kind,
          timeLabel: detail.timeLabel,
          impact,
          impactScope: scope,
          relatedAssets: detail.relatedAssets,
          detailExtras: detail,
        },
        locale,
      ),
    );
  }

  const macroEvents = getEvents(data.macro.data)
    .filter((ev) => ["High", "Medium"].includes(text(ev.impact)))
    .map((ev) => ({ ev, ts: new Date(text(ev.date)).getTime() }))
    .filter((row) => !Number.isNaN(row.ts))
    .sort((a, b) => Math.abs(a.ts - now) - Math.abs(b.ts - now))
    .slice(0, 3);

  for (const { ev } of macroEvents) {
    const impact = text(ev.impact) === "High" ? "风险" : "中性";
    const eventName = text(ev.event, locale === "en" ? "Macro event" : "宏观事件");
    const title = locale === "en" ? eventName : macroEventTitleZh(eventName);
    const countryLabel =
      text(ev.country) === "US" ? (locale === "en" ? "US" : "美国") : text(ev.country);
    const summary = [
      countryLabel,
      ev.estimate != null
        ? locale === "en"
          ? `Est. ${String(ev.estimate)}`
          : `预期 ${String(ev.estimate)}`
        : "",
      ev.previous != null
        ? locale === "en"
          ? `Prev. ${String(ev.previous)}`
          : `前值 ${String(ev.previous)}`
        : "",
      eventName !== title
        ? locale === "en"
          ? `Original: ${eventName}`
          : `原文：${eventName}`
        : "",
    ]
      .filter(Boolean)
      .join(" · ");
    const timeLabel = zhTime(ev.date, locale);
    events.push(
      makeWarRoomEventItem(
        {
          id: `macro-${timeLabel}-${title}`,
          title,
          body: summary.slice(0, 160),
          tag:
            text(ev.impact) === "High"
              ? resolveDictionaryValue(locale, "mvp.tag.highImpact") ?? "高影响"
              : resolveDictionaryValue(locale, "mvp.tag.mediumImpact") ?? "中影响",
          timeLabel,
          impact: impact as WarRoomImpact,
          impactScope: "macro_geo",
          relatedAssets: [],
          detailExtras: {
            source: "",
            summary,
            bullets: [],
            rawOriginal: eventName,
          },
        },
        locale,
      ),
    );
  }

  for (const article of getArticles(data.news.data).slice(0, 3)) {
    const title =
      locale === "en"
        ? text(article.title_en) || text(article.title) || text(article.title_zh, "Market news")
        : text(article.title_zh) || text(article.title, "市场新闻");
    const summary =
      locale === "en"
        ? text(article.summary_en) || text(article.content) || text(article.summary_zh)
        : text(article.summary_zh) || text(article.content);
    const timeLabel = zhTime(article.published_at ?? article.publishedDate ?? article.date, locale);
    const symbols = asArray(article.symbols).map((s) => String(s)).filter(Boolean);
    events.push(
      makeWarRoomEventItem(
        {
          id: `news-${timeLabel}-${title}`,
          title,
          body: summary.slice(0, 160),
          tag: resolveDictionaryValue(locale, "mvp.tag.news") ?? "新闻",
          timeLabel,
          impact: "中性",
          impactScope: symbols.length === 1 ? "single_stock" : "equity_broad",
          relatedAssets: symbols,
          detailExtras: {
            source: "",
            summary: summary || undefined,
            rawOriginal: text(article.content) || undefined,
          },
        },
        locale,
      ),
    );
  }

  const seen = new Set<string>();
  return events
    .filter((ev) => {
      if (seen.has(ev.id)) return false;
      seen.add(ev.id);
      return true;
    })
    .slice(0, 8);
}

function normalizeOptionCandidates(payload: JsonRecord | null, direction: Direction): OptionCandidate[] {
  if (!payload) return [];
  const desiredSide = direction === "bear" ? "put" : "call";
  const contracts = asArray(payload.contracts);
  const calls = asArray(payload.calls);
  const puts = asArray(payload.puts);
  const rows = contracts.length > 0 ? contracts : desiredSide === "put" ? puts : calls;
  const today = new Date();

  return rows
    .map(asRecord)
    .map((row): OptionCandidate | null => {
      const details = asRecord(row.details);
      const day = asRecord(row.day);
      const greeks = asRecord(row.greeks);
      const lastQuote = asRecord(row.last_quote ?? row.lastQuote ?? row.quote);
      const sideRaw = text(row.contract_type) || text(row.type) || text(details.contract_type) || desiredSide;
      const side = sideRaw.toLowerCase().startsWith("p") ? "put" : "call";
      if (side !== desiredSide) return null;
      const expiration =
        text(row.expiration_date) ||
        text(row.expiration) ||
        text(details.expiration_date) ||
        text(payload.expiration);
      const strike = num(row.strike_price ?? row.strike ?? details.strike_price);
      if (!expiration || strike === null) return null;
      const expiryDate = new Date(expiration);
      const dte = Number.isNaN(expiryDate.getTime())
        ? null
        : Math.ceil((expiryDate.getTime() - today.getTime()) / 86_400_000);
      const bid = num(row.bid ?? lastQuote.bid);
      const ask = num(row.ask ?? lastQuote.ask);
      const last = num(row.last_price ?? row.lastPrice ?? day.close);
      const mid = num(row.midpoint) ?? (bid !== null && ask !== null ? (bid + ask) / 2 : last);
      const ivRaw = num(row.implied_volatility ?? row.impliedVolatility ?? row.implied_volatility_pct);
      const volume = num(row.day_volume ?? row.volume ?? day.volume);
      const openInterest = num(row.open_interest ?? row.openInterest);
      return {
        side,
        strike,
        expiration,
        dte,
        bid,
        ask,
        mid,
        ivPct: ivRaw !== null && ivRaw <= 3 ? ivRaw * 100 : ivRaw,
        delta: num(row.delta ?? greeks.delta),
        volume,
        openInterest,
      };
    })
    .filter((row): row is OptionCandidate => row !== null)
    .filter((row) => row.dte === null || (row.dte >= 0 && row.dte <= 60))
    .sort((a, b) => {
      const ad = a.dte ?? 999;
      const bd = b.dte ?? 999;
      if (ad !== bd) return ad - bd;
      return (b.volume ?? 0) - (a.volume ?? 0);
    })
    .slice(0, 8);
}

function contractsForInsights(rows: OptionCandidate[]): JsonRecord[] {
  return rows.map((row) => ({
    side: row.side,
    strike: row.strike,
    expiration: row.expiration,
    dte: row.dte,
    volume: row.volume,
    open_interest: row.openInterest,
    iv_pct: row.ivPct,
    delta: row.delta,
    bid: row.bid,
    ask: row.ask,
  }));
}

function normalizeOptionActivity(payload: JsonRecord | null): JsonRecord[] {
  if (!payload) return [];
  const contracts = asArray(payload.contracts);
  const calls = asArray(payload.calls);
  const puts = asArray(payload.puts);
  const rows = contracts.length > 0 ? contracts : [...calls, ...puts];
  const today = new Date();

  return rows
    .map(asRecord)
    .map((row): JsonRecord | null => {
      const details = asRecord(row.details);
      const day = asRecord(row.day);
      const greeks = asRecord(row.greeks);
      const lastQuote = asRecord(row.last_quote ?? row.lastQuote ?? row.quote);
      const typeRaw = text(row.contract_type) || text(row.type) || text(details.contract_type);
      const type = typeRaw.toLowerCase().startsWith("p") ? "put" : "call";
      const expiration = text(row.expiration_date) || text(row.expiration) || text(details.expiration_date);
      const strike = num(row.strike_price ?? row.strike ?? details.strike_price);
      if (!expiration || strike === null) return null;
      const expiryDate = new Date(expiration);
      const dte = Number.isNaN(expiryDate.getTime())
        ? null
        : Math.ceil((expiryDate.getTime() - today.getTime()) / 86_400_000);
      if (dte !== null && (dte < 0 || dte > 60)) return null;
      const volume = num(row.day_volume ?? row.volume ?? day.volume) ?? 0;
      const openInterest = num(row.open_interest ?? row.openInterest) ?? 0;
      if (volume <= 0 && openInterest <= 0) return null;
      const bid = num(row.bid ?? lastQuote.bid);
      const ask = num(row.ask ?? lastQuote.ask);
      const last = num(row.last_price ?? row.lastPrice ?? day.close);
      const mid = num(row.midpoint) ?? (bid !== null && ask !== null ? (bid + ask) / 2 : last);
      const estimatedFlowUsd = mid !== null ? mid * volume * 100 : null;
      return {
        type,
        strike,
        expiration_date: expiration,
        dte,
        volume,
        open_interest: openInterest,
        implied_volatility: num(row.implied_volatility ?? row.impliedVolatility),
        delta: num(row.delta ?? greeks.delta),
        estimatedFlowUsd,
        volOiRatio: openInterest > 0 ? volume / openInterest : null,
        source: "hot_chain",
      };
    })
    .filter((row): row is JsonRecord => row !== null)
    .sort((a, b) => {
      const av = num(a.volume) ?? 0;
      const bv = num(b.volume) ?? 0;
      if (av !== bv) return bv - av;
      return (num(b.open_interest) ?? 0) - (num(a.open_interest) ?? 0);
    })
    .slice(0, 8);
}

function normalizeGexStrikes(payload: JsonRecord | null): GexStrikeRow[] {
  if (!payload) return [];
  return asArray(payload.strikes)
    .map(asRecord)
    .map((row): GexStrikeRow | null => {
      const strike = num(row.strike);
      const callGex = num(row.callGex);
      const putGex = num(row.putGex);
      if (strike === null || callGex === null || putGex === null) return null;
      return {
        strike,
        callGex,
        putGex,
        net: num(row.net) ?? callGex - putGex,
        gamma: num(row.gamma) ?? 0,
        oi: num(row.oi) ?? 0,
        iv: num(row.iv) ?? 0,
      };
    })
    .filter((row): row is GexStrikeRow => row !== null)
    .sort((a, b) => a.strike - b.strike);
}

function mergeGexHistory(payload: JsonRecord | null, profile: JsonRecord | null): HistRow[] {
  const byDay: Record<string, HistRow> = {};
  for (const row of asArray(payload?.gexSeries).map(asRecord)) {
    const date = text(row.date).slice(0, 10);
    if (!date) continue;
    byDay[date] = {
      date,
      net: num(row.netGex) ?? undefined,
      flip: num(row.gammaFlip) ?? undefined,
      close: byDay[date]?.close,
    };
  }
  for (const row of asArray(payload?.priceCloses).map(asRecord)) {
    const date = text(row.date).slice(0, 10);
    if (!date) continue;
    const prev = byDay[date];
    byDay[date] = {
      date,
      net: prev?.net,
      flip: prev?.flip,
      close: num(row.close) ?? undefined,
    };
  }
  const currentNet = num(profile?.netGex);
  if (currentNet !== null) {
    const date = text(profile?.timestamp).slice(0, 10) || new Date().toISOString().slice(0, 10);
    const prev = byDay[date];
    byDay[date] = {
      date,
      net: currentNet,
      flip: num(profile?.gammaFlip) ?? prev?.flip,
      close: num(profile?.underlyingPrice) ?? prev?.close,
    };
  }
  return Object.keys(byDay)
    .sort()
    .map((key) => byDay[key]!)
    .slice(-90);
}

function inferStockDirection(report: Pick<StockReport, "overview" | "smart">): Direction {
  const change = num(report.overview.data?.bar?.changePct);
  const smart = report.smart.data;
  const institutional = smart?.institutional_direction?.toLowerCase() ?? "";
  const consensus = smart?.consensus_type?.toLowerCase() ?? "";

  const isBear =
    (change !== null && change < -1.5) ||
    institutional.includes("bear") ||
    consensus === "aligned_bearish";
  const isBull =
    (change !== null && change > 1.5) ||
    institutional.includes("bull") ||
    consensus === "aligned_bullish";

  if (isBear) return "bear";
  if (isBull) return "bull";
  return "neutral";
}

function pickActionBias(direction: Direction, report: StockReport | null, locale: Locale) {
  const overview = report?.overview.data ?? null;
  const bar = overview?.bar;
  const price = num(bar?.price);
  const change = num(bar?.changePct);
  const keyStats = overview?.keyStats ?? {};
  const ivRank = num(keyStats.ivRank);
  const smart = report?.smart.data;
  const institutional = smart?.institutional_direction?.toLowerCase() ?? "";
  const retail = smart?.retail_direction?.toLowerCase() ?? "";

  if (!overview) {
    return {
      label: locale === "en" ? "Awaiting data" : "等待数据",
      tone: "text-muted-foreground",
      thesis:
        locale === "en"
          ? "Stock data still loading — don't trade off price alone."
          : "个股数据未完全载入，先不要基于单一价格做判断。",
    };
  }

  if (direction === "bull") {
    if ((change ?? 0) > 2.5 && (ivRank ?? 0) > 65) {
      return {
        label: locale === "en" ? "Chase cost high" : "追高成本偏高",
        tone: "text-red",
        thesis:
          locale === "en"
            ? "Price and IV both hot — wait for pullback or use spreads to cut premium risk."
            : "价格和隐含波动率同时偏热，优先等回踩或用价差降低权利金暴露。",
      };
    }
    if (institutional.includes("bull") || smart?.consensus_type === "aligned_bullish") {
      return {
        label: locale === "en" ? "Bull watchlist" : "可列入多头观察",
        tone: "text-green",
        thesis:
          locale === "en"
            ? "Institutional/sentiment skew bullish — wait for support or breakout confirm."
            : "机构/情绪与多头方向更接近，等待价格靠近支撑或突破确认。",
      };
    }
    return {
      label: locale === "en" ? "Bull needs confirm" : "多头需等待确认",
      tone: "text-gold",
      thesis:
        locale === "en"
          ? `Spot ${price !== null ? `$${price.toFixed(2)}` : "—"} — wait for post-open volume at key levels.`
          : `当前价格 ${price !== null ? `$${price.toFixed(2)}` : "—"}，先观察开盘后是否放量站稳关键区间。`,
    };
  }

  if (direction === "bear") {
    if ((change ?? 0) < -2.5 && (ivRank ?? 0) > 65) {
      return {
        label: locale === "en" ? "Crowded short" : "空头拥挤",
        tone: "text-red",
        thesis:
          locale === "en"
            ? "Sharp drop with high IV — naked puts have limited margin for error."
            : "价格已快速下跌且 IV 偏高，直接买 put 的容错较低。",
      };
    }
    if (institutional.includes("bear") || retail.includes("bull")) {
      return {
        label: locale === "en" ? "Watch downside confirm" : "可观察下行验证",
        tone: "text-gold",
        thesis:
          locale === "en"
            ? "Bear case needs support break or failed rally at resistance."
            : "下跌情景需要跌破支撑或反弹不过压力位后再确认。",
      };
    }
  }

  return {
    label: locale === "en" ? "Neutral watch" : "中性观察",
    tone: "text-gold",
    thesis:
      locale === "en"
        ? "Map vol and range first, then decide stock wait vs defined-risk options."
        : "先判断波动率和区间边界，再决定正股等待还是期权用有限风险结构表达。",
  };
}

function reportErrors(
  slots: Array<{ slot: AsyncSlot<unknown>; key: string }>,
): string[] {
  return slots
    .map(({ slot, key }) => friendlyApiError(slot.error, key))
    .filter((e): e is string => Boolean(e));
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`glass rounded-xl border border-glass-border ${className}`}>{children}</section>;
}

function Pill({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "green" | "red" | "gold" | "blue" | "muted";
}) {
  const color =
    tone === "green"
      ? "border-green/30 bg-green/10 text-green"
      : tone === "red"
        ? "border-red/30 bg-red/10 text-red"
        : tone === "gold"
          ? "border-gold/30 bg-gold/10 text-gold"
          : tone === "blue"
            ? "border-blue/30 bg-blue/10 text-blue"
            : "border-foreground/10 bg-foreground/[0.03] text-muted-foreground";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${color}`}>{children}</span>;
}

function Metric({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl surface-1 lift px-4 py-3.5">
      <div className="stat-label">{label}</div>
      <div className="stat-value mt-1.5 text-[26px]">{value}</div>
      {sub ? <div className="mt-1 text-[12px] font-medium tabular-nums">{sub}</div> : null}
    </div>
  );
}

type FlipExpectedMoveCompare = {
  flipPct: number | null;
  inside: boolean | null;
  label: string;
};

function compareFlipToExpectedMove(
  spot: number | null,
  gammaFlip: number | null,
  expectedMovePct: number,
  locale: Locale = "zh",
): FlipExpectedMoveCompare {
  if (spot === null || gammaFlip === null || spot <= 0) {
    return {
      flipPct: null,
      inside: null,
      label: locale === "en" ? "Flip data missing" : "Flip 数据缺失",
    };
  }
  const flipPct = ((gammaFlip - spot) / spot) * 100;
  const inside = Math.abs(flipPct) <= expectedMovePct;
  if (inside) {
    return {
      flipPct,
      inside: true,
      label:
        locale === "en"
          ? `Flip ${flipPct >= 0 ? "+" : ""}${flipPct.toFixed(1)}% within ±${expectedMovePct.toFixed(1)}%`
          : `Flip ${flipPct >= 0 ? "+" : ""}${flipPct.toFixed(1)}% 在 ±${expectedMovePct.toFixed(1)}% 内`,
    };
  }
  const beyond = flipPct > expectedMovePct ? (locale === "en" ? "upper" : "上界") : locale === "en" ? "lower" : "下界";
  return {
    flipPct,
    inside: false,
    label:
      locale === "en"
        ? `Flip ${flipPct >= 0 ? "+" : ""}${flipPct.toFixed(1)}% beyond EM ${beyond}`
        : `Flip ${flipPct >= 0 ? "+" : ""}${flipPct.toFixed(1)}% 超出 EM ${beyond}`,
  };
}

function entryGammaHint(biasCode: import("@/lib/gex-decision").GammaStructureBiasCode, locale: Locale): string {
  if (isVolatilityExpansion(biasCode)) {
    return (
      resolveDictionaryValue(locale, "mvp.gamma.entryHint.volatility_expansion") ??
      "负 Gamma 环境下价格波动易放大，入场宜缩小仓位并设好止损。"
    );
  }
  if (isMeanReversion(biasCode)) {
    return (
      resolveDictionaryValue(locale, "mvp.gamma.entryHint.mean_reversion") ??
      "正 Gamma 环境下价格倾向被结构吸附，适合区间思路或卖波动策略。"
    );
  }
  return resolveDictionaryValue(locale, "mvp.gamma.bias.pending") ?? "等待确认";
}

function GlanceStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "green" | "red" | "gold";
}) {
  const valueTone =
    tone === "green"
      ? "text-green"
      : tone === "red"
        ? "text-red"
        : tone === "gold"
          ? "text-gold"
          : "text-foreground";
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted">{label}</span>
      <span className={`truncate font-mono text-sm font-semibold tabular-nums ${valueTone}`}>{value}</span>
    </div>
  );
}

function FlipEmRangeAxis({
  spot,
  gammaFlip,
  expectedMovePct,
  inside,
}: {
  spot: number | null;
  gammaFlip: number | null;
  expectedMovePct: number;
  inside: boolean | null;
}) {
  if (spot === null || spot <= 0 || expectedMovePct <= 0) return null;

  const lower = spot * (1 - expectedMovePct / 100);
  const upper = spot * (1 + expectedMovePct / 100);
  const flipPct = gammaFlip !== null ? ((gammaFlip - spot) / spot) * 100 : null;
  const flipPos = flipPct !== null ? 50 + (flipPct / expectedMovePct) * 50 : null;
  const clampedFlipPos = flipPos !== null ? Math.max(4, Math.min(96, flipPos)) : null;
  const flipBeyond =
    flipPct !== null
      ? flipPct < -expectedMovePct
        ? "low"
        : flipPct > expectedMovePct
          ? "high"
          : null
      : null;

  return (
    <div className="mt-2.5" role="img" aria-label="Expected Move 与 Gamma Flip 位置对比">
      <div className="relative mx-0.5 h-3 overflow-visible">
        <div className="absolute inset-y-0.5 inset-x-0 rounded-full border border-blue/25 bg-blue/10" />
        <div
          className="absolute top-0 z-10 h-full w-0.5 -translate-x-1/2 bg-foreground/55"
          style={{ left: "50%" }}
          title="现价"
        />
        {clampedFlipPos !== null && gammaFlip !== null ? (
          <div
            className={`absolute top-1/2 z-20 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border ${
              inside ? "border-green bg-green shadow-[0_0_6px_rgba(0,212,170,0.5)]" : "border-gold bg-gold shadow-[0_0_6px_rgba(212,175,55,0.5)]"
            }`}
            style={{ left: `${clampedFlipPos}%` }}
            title={`Gamma Flip ${gammaFlip}`}
          />
        ) : null}
        {flipBeyond === "low" ? (
          <div className="absolute left-0 top-1/2 z-20 -translate-y-1/2 text-[8px] text-gold">◀</div>
        ) : null}
        {flipBeyond === "high" ? (
          <div className="absolute right-0 top-1/2 z-20 -translate-y-1/2 text-[8px] text-gold">▶</div>
        ) : null}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-1 text-[9px] font-mono leading-none text-muted">
        <span title="EM 下界">{money(lower)}</span>
        <span className="text-foreground/55">±{expectedMovePct.toFixed(1)}%</span>
        <span title="EM 上界">{money(upper)}</span>
      </div>
      <div className="mt-0.5 flex items-center justify-center gap-3 text-[8px] text-muted">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-foreground/50" />
          现价
        </span>
        {gammaFlip !== null ? (
          <span className={`inline-flex items-center gap-1 ${inside ? "text-green" : "text-gold"}`}>
            <span className="inline-block h-2 w-2 rotate-45 border border-current bg-current/80" />
            Flip {money(gammaFlip)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function EmptyLine({ text: value }: { text: string }) {
  return <div className="rounded-lg border border-border2 bg-foreground/[0.02] px-4 py-3 text-sm text-muted">{value}</div>;
}

export type MvpInsightsPageVariant = "dashboard" | "standalone";

export type MvpInsightsSection = "all" | "market" | "ticker";

export type MvpInsightsPageProps = {
  variant?: MvpInsightsPageVariant;
  section?: MvpInsightsSection;
};

export default function MvpInsightsPage({ variant = "standalone", section = "all" }: MvpInsightsPageProps) {
  const { locale, t } = useI18n();
  const isDashboard = variant === "dashboard";
  const showMarket = section !== "ticker";
  const showTicker = section !== "market";
  const { tier, ready, token, isPro, saveKey } = useMvpTier();
  const nextPath = variant === "standalone" ? "/mvp" : "/";
  const [accessKeyModalOpen, setAccessKeyModalOpen] = useState(false);
  const [unlockPrompt, setUnlockPrompt] = useState<{
    open: boolean;
    reason: UnlockReason;
    title?: string;
  }>({ open: false, reason: "login" });
  const RootTag = isDashboard ? "div" : "main";
  const rootClassName = isDashboard
    ? "h-full overflow-y-auto bg-background text-foreground"
    : "min-h-screen bg-background text-foreground";
  const initialWarRoomCache = isPro && section !== "ticker" ? getFreshWarRoomCache(locale) : null;
  const initialRegimeCode = initialWarRoomCache?.data.marketInsights.data?.regime?.code ?? null;
  const initialReportCache =
    isPro && section !== "ticker" ? getFreshReportCache("SPY", "bull", initialRegimeCode) : null;
  const [warRoom, setWarRoom] = useState<WarRoomData>(initialWarRoomCache?.data ?? EMPTY_WAR_ROOM);
  const [warLoading, setWarLoading] = useState(!initialWarRoomCache);
  const [warRoomUpdatedAt, setWarRoomUpdatedAt] = useState<string | null>(initialWarRoomCache?.updatedAt ?? null);
  const [symbol, setSymbol] = useState("SPY");
  const [direction, setDirection] = useState<Direction>("bull");
  const [report, setReport] = useState<StockReport | null>(initialReportCache?.data ?? null);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedExpectedMove, setSelectedExpectedMove] = useState<ExpectedMoveRow | null>(null);
  const [gammaChartOpen, setGammaChartOpen] = useState(true);
  const [gammaTrendOpen, setGammaTrendOpen] = useState(true);
  const [gammaModal, setGammaModal] = useState<"distribution" | "trend" | null>(null);
  const [showTechnicalBasis, setShowTechnicalBasis] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [summarySource, setSummarySource] = useState<"ai" | "rules">("ai");
  const [mobileEvidenceOpen, setMobileEvidenceOpen] = useState<string | null>("index");
  const isMobileEvidence = useMediaQuery("(max-width: 767px)");
  const initialReportLoadedRef = useRef(Boolean(initialReportCache));
  const gammaHeroRef = useRef<HTMLDivElement>(null);

  const scrollToGammaHero = useCallback(() => {
    gammaHeroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const openUnlock = useCallback((reason: UnlockReason, title?: string) => {
    setUnlockPrompt({ open: true, reason, title });
  }, []);

  const loadWarRoom = useCallback(async (opts?: { silent?: boolean; force?: boolean }) => {
    if (isPro && !opts?.force) {
      const cached = getFreshWarRoomCache(locale);
      if (cached) {
        setWarRoom(cached.data);
        setWarRoomUpdatedAt(cached.updatedAt);
        if (!opts?.silent) setWarLoading(false);
        return;
      }
    }
    if (!opts?.silent) setWarLoading(true);
    const today = beijingDateString(0);
    const tomorrow = beijingDateString(1);
    const authToken = tier === "guest" ? null : token;
    const overviewRefresh = Boolean(opts?.force) || !opts?.silent;
    const baseTasks = [
      [
        "overview",
        settle<MarketOverviewContract>(() => api.market.overview(overviewRefresh)),
      ],
      ["signals", settle<SignalsFeedEnvelopeContract>(() => api.market.signalsFeed(locale))],
      [
        "mvp",
        settle<JsonRecord>(() =>
          fetchJson(
            `/api/mvp/war-room?hours=${DISCORD_EVENT_HOURS}&menu_slot=aji_insights`,
            authToken,
            locale,
          ),
        ),
      ],
    ] as const;
    const trialTasks =
      tier === "guest"
        ? ([] as const)
        : ([
            [
              "marketInsights",
              settle<MvpMarketInsightsContract>(() => api.market.mvpMarketInsights(authToken, locale)),
            ],
            ["brief", settle<{ brief?: string }>(() => api.market.brief(locale) as Promise<{ brief?: string }>)],
            ["macro", settle<JsonRecord>(() => api.macro.calendar(today, tomorrow, "US") as Promise<JsonRecord>)],
            ["news", settle<JsonRecord>(() => api.news.latest() as Promise<JsonRecord>)],
            [
              "feed",
              settle<FeedEnvelopeContract>(() =>
                api.feed.unified(80, undefined, {
                  kind: "discord",
                  hours: DISCORD_EVENT_HOURS,
                  menu_slot: "aji_insights",
                }),
              ),
            ],
          ] as const);
    const tasks = [...baseTasks, ...trialTasks] as const;
    let latestWarRoom = cachedWarRoom.get(locale)?.data ?? EMPTY_WAR_ROOM;
    let loadingCleared = Boolean(opts?.silent);
    const applySlot = (key: keyof WarRoomData, slot: AsyncSlot<unknown>) => {
      latestWarRoom = { ...latestWarRoom, [key]: slot } as WarRoomData;
      const mvpGenerated = text(latestWarRoom.mvp.data?.generated_at_utc);
      const insightsGenerated = text(latestWarRoom.marketInsights.data?.generated_at_utc);
      const updatedAt = insightsGenerated || mvpGenerated || new Date().toISOString();
      cachedWarRoom.set(locale, { data: latestWarRoom, updatedAt, cachedAt: Date.now() });
      setWarRoom(latestWarRoom);
      setWarRoomUpdatedAt(updatedAt);
      if (!loadingCleared) {
        loadingCleared = true;
        setWarLoading(false);
      }
    };
    await Promise.all(
      tasks.map(async ([key, promise]) => {
        const slot = await promise;
        applySlot(key, slot);
      }),
    );
    if (!opts?.silent) setWarLoading(false);
  }, [isPro, locale, tier, token]);

  useEffect(() => {
    if (!ready) return;
    if (section === "ticker") return;
    void loadWarRoom({ force: true });
    const timer = window.setInterval(() => {
      void loadWarRoom({ silent: true });
    }, WAR_ROOM_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [loadWarRoom, ready, section]);

  useEffect(() => {
    const onLocaleChange = () => {
      if (section === "ticker") return;
      void loadWarRoom({ force: true });
    };
    window.addEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
  }, [loadWarRoom, section]);

  const currentMarketRegime = warRoom.marketInsights.data?.regime ?? null;

  const runStockReport = useCallback(async (nextSymbol?: string) => {
    if (tier === "guest") {
      openUnlock("login", "登录后生成标的深度分析");
      return;
    }
    if (tier !== "pro") {
      openUnlock("access_key", "Pro 会员可生成完整标的深度分析");
      return;
    }
    const sym = (nextSymbol || symbol).trim().toUpperCase();
    if (!sym) return;
    setSymbol(sym);
    const regimeCode = currentMarketRegime?.code ?? null;
    setReportLoading(true);
    setGammaChartOpen(true);
    setGammaTrendOpen(true);
    setGammaModal(null);
    const [quote, overview, priceTarget, smart, chain, gex, gexHistory, unusual] = await Promise.all([
      settle<JsonRecord>(() => fetchJson(`/api/cross-market/quote/${encodeURIComponent(sym)}`, token)),
      settle<StockOverviewContract>(() => api.stock.overview(sym)),
      settle<AnalystPriceTargetContract>(() => api.analyst.priceTarget(sym)),
      settle<SmartVsRetailContract>(() => api.social.smartVsRetail(sym)),
      settle<JsonRecord>(() =>
        api.options.chain(sym, undefined, undefined, {
          limit: 400,
          strikeWindowPct: 0.2,
        }) as Promise<JsonRecord>,
      ),
      settle<JsonRecord>(() => api.options.gex(sym, { limit: 500, strikeWindowPct: 0.2 }) as Promise<JsonRecord>),
      settle<JsonRecord>(() => fetchJson(`/api/stock/${encodeURIComponent(sym)}/gex/history`, token)),
      settle<JsonRecord>(() =>
        fetchJson(`/api/stock/${encodeURIComponent(sym)}/unusual-v2?page_size=20&min_score=20`, token),
      ),
    ]);
    const overviewData = overview.data;
    const realtimeSpot = num(quote.data?.price);
    const reportSpot = realtimeSpot ?? num(overviewData?.bar?.price);
    const chainData = chain.data;
    const inferredDirection = inferStockDirection({ overview, smart });
    setDirection(inferredDirection);
    const candidates = normalizeOptionCandidates(chainData, inferredDirection);
    const strictUnusual = asArray(unusual.data?.items).map(asRecord).slice(0, 5);
    const hotOpts = normalizeOptionActivity(chainData).slice(0, 5);
    const unusualForInsight = strictUnusual.length > 0 ? strictUnusual : hotOpts;
    const insightDirection: "bull" | "bear" = inferredDirection === "bear" ? "bear" : "bull";
    const optionsInsights = await settle<StockOptionsInsightsContract>(() =>
      api.market.stockOptionsInsights({
        symbol: sym,
        direction: insightDirection,
        spot: reportSpot,
        iv_rank: num(overviewData?.keyStats?.ivRank),
        expected_moves: overviewData?.expectedMoves ?? [],
        contracts: contractsForInsights(candidates),
        unusual_items: unusualForInsight,
        market_regime_code: currentMarketRegime?.code ?? null,
        market_regime_label: currentMarketRegime?.label ?? null,
      }, token),
    );
    const nextReport = { quote, overview, priceTarget, smart, chain, gex, gexHistory, unusual, optionsInsights };
    cachedStockReports.set(reportCacheKey(sym, inferredDirection, regimeCode), {
      data: nextReport,
      cachedAt: Date.now(),
    });
    setReport(nextReport);
    setReportLoading(false);
  }, [symbol, currentMarketRegime, tier, token, openUnlock]);

  useEffect(() => {
    if (section === "ticker") return;
    if (tier !== "pro") return;
    if (initialReportLoadedRef.current) return;
    initialReportLoadedRef.current = true;
    void runStockReport("SPY");
  }, [runStockReport, tier, section]);

  const signals = warRoom.signals.data?.signals ?? [];
  const ruleMarketState = classifyMarket(warRoom.overview.data, signals, locale);
  const aiInsights = warRoom.marketInsights.data;
  const marketState = aiInsights
    ? marketStateFromInsights(aiInsights, ruleMarketState, locale)
    : ruleMarketState;
  const MarketIcon = marketState.icon;
  const events = useMemo(() => buildWarRoomEvents(warRoom, locale), [warRoom, locale]);
  const overview = warRoom.overview.data;
  const pulseRows = overview?.pulse ?? [];
  const vixHistory = overview?.volatility.vixSeries ?? [];
  const vixSeries = vixHistory.map((value, index) => {
    const offset = vixHistory.length - 1 - index;
    const dayLabel = offset === 0 ? (locale === "en" ? "Now" : "今") : locale === "en" ? `-${offset}d` : `-${offset}日`;
    return { day: dayLabel, value };
  });
  const vixLevel = overview?.volatility.vix ?? null;
  const vixChangePct = overview?.volatility.vixChangePct ?? null;
  const vixReadFallback = vixLevel !== null ? interpretVix(vixLevel, locale) : null;
  const vixInterpretation = aiInsights?.vix?.interpretation || vixReadFallback?.interpretation;
  const pcr = overview?.liquidity.putCallRatioVolumeApprox ?? null;
  const pcrReadFallback = pcr !== null ? interpretPCR(pcr, locale) : null;
  const pcrInterpretation = aiInsights?.pcr?.interpretation || pcrReadFallback?.interpretation;
  const vixChartCaption = aiInsights?.vix_chart?.caption ?? "";
  const spyChange = pulseRows.find((p) => p.symbol === "SPY")?.changePct ?? null;
  const qqqChange = pulseRows.find((p) => p.symbol === "QQQ")?.changePct ?? null;
  const avgIndexChange =
    spyChange !== null && qqqChange !== null
      ? (spyChange + qqqChange) / 2
      : spyChange !== null
        ? spyChange
        : qqqChange !== null
          ? qqqChange
          : 0;
  const indexRead = indexDirectionRead(avgIndexChange, locale);
  const pcrMood = pcrMoodRead(pcr, locale);
  const plainBasis = useMemo(
    () =>
      buildPlainLanguageBasis({
        avgIndex: avgIndexChange,
        vix: vixLevel,
        vixChange: vixChangePct,
        vixBand: overview?.volatility.band ?? "—",
        pcr,
        regimeLabel: marketState.label,
        locale,
      }),
    [avgIndexChange, vixLevel, vixChangePct, overview?.volatility.band, pcr, marketState.label, locale],
  );
  const visibleEvents = showAllEvents ? events : events.slice(0, 3);
  const regimeBorder = regimeAccentBorder(marketState.code);
  const regimeBar = regimeAccentBar(marketState.code);
  const regimeEnglish = regimeMeta(marketState.code, locale).english;
  const marketSessionLabel = localizeMarketSessionLabel(overview?.marketSessionLabel ?? null, locale);
  const headlineSummary = useMemo(
    () =>
      buildHeadlineSummary({
        hasAiSummary: false,
        fallbackSummary: marketState.summary,
        code: marketState.code,
        avgIndex: avgIndexChange,
        vix: vixLevel,
        vixChange: vixChangePct,
        locale,
      }),
    [marketState.summary, marketState.code, avgIndexChange, vixLevel, vixChangePct, locale],
  );
  const hasAiSummary = Boolean(aiInsights?.regime.summary?.trim());
  const displayedSummary = hasAiSummary && summarySource === "ai" ? marketState.summary : headlineSummary;
  const showDivergenceAlert = hasDivergentSignals(avgIndexChange, vixChangePct);
  const allWarErrors = reportErrors([
    { slot: warRoom.overview, key: "overview" },
    { slot: warRoom.marketInsights, key: "marketInsights" },
    { slot: warRoom.brief, key: "brief" },
    { slot: warRoom.macro, key: "macro" },
    { slot: warRoom.news, key: "news" },
    { slot: warRoom.signals, key: "signals" },
  ]);

  const stockBias = pickActionBias(direction, report, locale);
  const inferredDirectionLabel =
    resolveDictionaryValue(locale, `mvp.inferredDirection.${direction}`) ??
    resolveDictionaryValue(locale, "mvp.inferredDirection.neutral") ??
    "中性";
  const stockOverview = report?.overview.data ?? null;
  const realtimeQuote = report?.quote.data ?? null;
  const priceSeries = (stockOverview?.priceSeries ?? [])
    .slice(-66)
    .map((row) => ({ date: row.date.slice(5), close: row.close ?? null }));
  const optionCandidates = normalizeOptionCandidates(report?.chain.data ?? null, direction);
  const gexProfile = report?.gex.data ?? null;
  const gexError = report?.gex.error ?? null;
  const gexStrikes = normalizeGexStrikes(gexProfile);
  const gexHistoryRows = mergeGexHistory(report?.gexHistory.data ?? null, report?.gex.data ?? null);
  const optionsInsights = report?.optionsInsights.data;
  const expectedMoveReads = new Map(
    (optionsInsights?.expected_moves ?? []).map((row) => [row.bucket, row]),
  );
  const priceTarget = report?.priceTarget.data;
  const ptAvg = priceTarget?.summary?.lastMonthAvgPriceTarget ?? priceTarget?.consensus?.priceTarget ?? null;
  const spot = num(realtimeQuote?.price) ?? num(stockOverview?.bar?.price);
  const gexSpot = selectGammaStructureSpot({ overviewSpot: spot, gexSpot: num(gexProfile?.underlyingPrice) });
  const gammaRead = buildGammaStructureRead(
    {
      symbol,
      spot: gexSpot,
      netGex: num(gexProfile?.netGex),
      gammaFlip: num(gexProfile?.gammaFlip),
      callWall: num(gexProfile?.callWall),
      putWall: num(gexProfile?.putWall),
      maxPain: num(gexProfile?.maxPain),
      regime: text(gexProfile?.regime),
    },
    locale,
  );
  const upside = spot !== null && ptAvg ? ((ptAvg - spot) / spot) * 100 : null;
  const gammaFlipLevel = num(gexProfile?.gammaFlip);
  const callWallLevel = num(gexProfile?.callWall);
  const putWallLevel = num(gexProfile?.putWall);
  const maxPainLevel = num(gexProfile?.maxPain);
  const priceChartYDomain = useMemo((): [number, number] | ["auto", "auto"] => {
    const closes = priceSeries
      .map((row) => row.close)
      .filter((value): value is number => value !== null && Number.isFinite(value));
    if (closes.length === 0) return ["auto", "auto"];
    const levels = [gammaFlipLevel, callWallLevel, putWallLevel, maxPainLevel].filter(
      (value): value is number => value !== null,
    );
    const all = [...closes, ...levels];
    const min = Math.min(...all);
    const max = Math.max(...all);
    const pad = Math.max((max - min) * 0.06, 0.5);
    return [min - pad, max + pad];
  }, [priceSeries, gammaFlipLevel, callWallLevel, putWallLevel, maxPainLevel]);
  const netGexValue = num(gexProfile?.netGex);
  const netGexDisplay =
    netGexValue !== null ? `${netGexValue >= 0 ? "+" : ""}${netGexValue.toFixed(2)}B` : "—";
  const netGexTone: "green" | "red" | "default" =
    netGexValue === null ? "default" : netGexValue >= 0 ? "green" : "red";
  return (
    <RootTag className={rootClassName}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-4 md:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-glass-border bg-panel/80 px-4 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
              {isDashboard ? (
                <Pill tone="gold">{t("mvp.brand")}</Pill>
              ) : (
                <>
                  <Pill tone="gold">{t("mvp.mvpPill")}</Pill>
                  <span className="hidden md:inline">/mvp</span>
                </>
              )}
              <span>{t("mvp.usMarketAnalysis")}</span>
            </div>
            <h1 className="display-1 mt-2 text-foreground">
              {section === "ticker" ? t("mvp.tickerDeepDive") : t("mvp.marketInsights")}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {showMarket && marketSessionLabel ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-green/25 bg-green/10 px-3 py-2 text-xs font-medium text-green">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
                {marketSessionLabel}
              </span>
            ) : null}
            {showMarket ? (
              <button
                type="button"
                onClick={() => void loadWarRoom({ force: true })}
                title={t("mvp.refreshMarketTitle")}
                className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold transition hover:bg-gold/15"
              >
                <RefreshCw className={`h-4 w-4 ${warLoading ? "animate-spin" : ""}`} />
                {t("mvp.refresh")}
              </button>
            ) : null}
          </div>
        </header>

        <UnlockPromptModal
          open={unlockPrompt.open}
          reason={unlockPrompt.reason}
          title={unlockPrompt.title}
          nextPath={nextPath}
          onClose={() => setUnlockPrompt((s) => ({ ...s, open: false }))}
        />
        <AccessKeyModal
          open={accessKeyModalOpen}
          onClose={() => setAccessKeyModalOpen(false)}
          onSaved={() => {
            setAccessKeyModalOpen(false);
            cachedWarRoom.delete(locale);
            void loadWarRoom({ force: true });
          }}
          saveKey={saveKey}
        />

        {showMarket ? (
        <section className="grid grid-cols-1 gap-4">
          <Card className="p-5">
            {/* Section header + meta */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CalendarClock className="h-4 w-4 text-gold" />
                  {t("mvp.marketOverview")}
                </div>
                {warRoomUpdatedAt ? (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <MetaHint label={t("mvp.autoRefreshLabel")} hint={t("mvp.autoRefreshHint")} />
                    <MetaHint
                      label={formatMessage(t("mvp.eventSourceLabel"), { hours: DISCORD_EVENT_HOURS })}
                      hint={t("mvp.eventSourceHint")}
                    />
                    <span>{formatMessage(t("mvp.lastUpdated"), { time: zhTime(warRoomUpdatedAt, locale) })}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Layer 1 · Market pulse strip */}
            {warRoom.overview.error ? (
              <div className="mt-4 rounded-lg border border-red/30 bg-red/5 px-3 py-2 text-xs text-red">
                {warRoom.overview.error}
              </div>
            ) : null}
            {warLoading && pulseRows.length === 0 ? (
              <PulseSkeleton />
            ) : (
              <div className="mt-4 flex gap-2 overflow-x-auto rounded-xl border border-gold/20 market-surface market-pulse-scroll p-2 snap-x snap-mandatory">
                {pulseRows.slice(0, 4).map((row) => (
                  <Link
                    key={row.symbol}
                    href={`/stock/${row.symbol}`}
                    className="flex min-w-[128px] flex-1 snap-start items-center justify-between gap-2 rounded-lg border border-border2 bg-panel/60 px-3 py-2.5 transition hover:border-gold/35 hover:bg-panel"
                  >
                    <span className="text-xs font-semibold text-muted-foreground">{row.symbol}</span>
                    <div className="text-right">
                      <div className="font-mono text-base font-semibold tabular-nums text-foreground">
                        {row.price !== null ? row.price.toFixed(2) : "—"}
                      </div>
                      <div className={`font-mono text-xs font-medium tabular-nums ${row.changePct !== null && row.changePct >= 0 ? "text-green" : "text-red"}`}>
                        {pct(row.changePct)}
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="flex min-w-[128px] flex-1 snap-start items-center justify-between gap-2 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2.5">
                  <span className="text-xs font-semibold text-gold">VIX</span>
                  <div className="text-right">
                    <div className="font-mono text-base font-semibold tabular-nums text-foreground">
                      {vixLevel !== null ? vixLevel.toFixed(2) : "—"}
                    </div>
                    <div className={`font-mono text-xs font-medium tabular-nums ${(vixChangePct ?? 0) >= 0 ? "text-red" : "text-green"}`}>
                      {pct(vixChangePct)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Layer 2 · One-sentence conclusion */}
            <div className={`mt-5 rounded-xl border ${regimeBorder} market-surface-strong p-4 md:p-5`}>
              <div className="flex items-start gap-3">
                <MarketIcon className={`mt-0.5 h-9 w-9 shrink-0 ${marketState.tone}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className={`text-2xl font-semibold ${marketState.tone}`}>{marketState.label}</div>
                    <Pill tone="muted">{regimeEnglish}</Pill>
                  </div>
                  {hasAiSummary ? (
                    <div className="mt-3 inline-flex rounded-lg border border-border2 bg-panel p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setSummarySource("ai")}
                        className={`rounded-md px-3 py-1.5 font-medium transition ${
                          summarySource === "ai"
                            ? "bg-gold/15 text-gold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t("mvp.aiInterpretation")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSummarySource("rules")}
                        className={`rounded-md px-3 py-1.5 font-medium transition ${
                          summarySource === "rules"
                            ? "bg-gold/15 text-gold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t("mvp.rulesEngine")}
                      </button>
                    </div>
                  ) : null}
                  <p className="mt-2 max-w-3xl text-base leading-relaxed text-foreground">{displayedSummary}</p>
                  {showDivergenceAlert ? (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2.5 text-sm leading-6 text-gold">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{t("mvp.divergenceAlert")}</span>
                    </div>
                  ) : null}
                  <ul className="mt-4 space-y-1.5 rounded-lg market-surface-strong px-3 py-3">
                    {plainBasis.map((line) => (
                      <li key={line} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                        <span className="text-gold">·</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-muted">{marketState.engineNote}</p>
                  <LockedContent
                    required="trial"
                    currentTier={tier}
                    title={t("mvp.loginForAi")}
                    onUnlock={(reason) => openUnlock(reason, t("mvp.loginForAiUnlock"))}
                  >
                    {aiInsights?.regime.reasoning ? (
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{aiInsights.regime.reasoning}</p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setShowTechnicalBasis((v) => !v)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-gold transition hover:text-gold/80"
                    >
                      {showTechnicalBasis ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      {showTechnicalBasis ? t("mvp.collapseTechnical") : t("mvp.expandTechnical")}
                    </button>
                    {showTechnicalBasis ? (
                      <ul className="mt-2 space-y-1 rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2">
                        {marketState.basis.map((line) => (
                          <li key={line} className="font-mono text-xs leading-5 text-muted">
                            {line}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </LockedContent>
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="mx-auto my-4 h-px w-3/4 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

            {/* Layer 3 · Three evidence cards */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t("mvp.evidenceTitle")}</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <EvidenceCard
                  title={t("mvp.indexDirection")}
                  icon={TrendingUp}
                  accentBar={regimeBar}
                  borderClass={regimeBorder}
                  value={indexRead.label}
                  valueTone={indexRead.tone}
                  collapsible={isMobileEvidence}
                  open={!isMobileEvidence || mobileEvidenceOpen === "index"}
                  onToggle={() =>
                    setMobileEvidenceOpen((id) => (id === "index" ? null : "index"))
                  }
                  sub={
                    <span className={`font-mono tabular-nums ${indexRead.tone}`}>
                      {t("mvp.indexAvg")} {pct(avgIndexChange)}
                    </span>
                  }
                >
                  <p className="text-sm leading-6 text-muted-foreground">{indexRead.hint}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-foreground/[0.03] px-2 py-1.5">
                      <span className="text-muted">SPY </span>
                      <span className={`font-mono font-medium ${(spyChange ?? 0) >= 0 ? "text-green" : "text-red"}`}>
                        {pct(spyChange)}
                      </span>
                    </div>
                    <div className="rounded-md bg-foreground/[0.03] px-2 py-1.5">
                      <span className="text-muted">QQQ </span>
                      <span className={`font-mono font-medium ${(qqqChange ?? 0) >= 0 ? "text-green" : "text-red"}`}>
                        {pct(qqqChange)}
                      </span>
                    </div>
                  </div>
                </EvidenceCard>

                <EvidenceCard
                  title={t("mvp.volatility")}
                  icon={Gauge}
                  accentBar={regimeBar}
                  borderClass={regimeBorder}
                  value={vixLevel !== null ? vixLevel.toFixed(2) : "—"}
                  valueTone={(vixChangePct ?? 0) >= 0 ? "text-red" : "text-green"}
                  collapsible={isMobileEvidence}
                  open={!isMobileEvidence || mobileEvidenceOpen === "vix"}
                  onToggle={() =>
                    setMobileEvidenceOpen((id) => (id === "vix" ? null : "vix"))
                  }
                  sub={
                    <span className={`font-mono text-sm tabular-nums ${(vixChangePct ?? 0) >= 0 ? "text-red" : "text-green"}`}>
                      {pct(vixChangePct)}
                      {overview?.volatility.band ? (
                        <span className="ml-2 text-muted-foreground">
                          {localizeVolatilityBand(overview.volatility.band, locale)}
                        </span>
                      ) : null}
                    </span>
                  }
                >
                  <div className="h-[72px]">
                    {vixSeries.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={vixSeries}>
                          <defs>
                            <linearGradient id="vixFillOverview" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#f0b429" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#f0b429" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" tick={CHART.axisTick} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                          <YAxis hide domain={["auto", "auto"]} />
                          <Tooltip
                            contentStyle={tooltipStyle()}
                            cursor={{ stroke: CHART.gridStroke }}
                            formatter={(value: number) => [`${value.toFixed(2)}`, "VIX"]}
                            labelFormatter={(label) =>
                              locale === "en" ? `Session ${label}` : `交易日 ${label}`
                            }
                          />
                          <Area type="monotone" dataKey="value" stroke="#f0b429" fill="url(#vixFillOverview)" strokeWidth={2} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted">{t("mvp.vixChartUnavailable")}</div>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {vixInterpretation || vixChartCaption || (warLoading ? t("mvp.insightsGenerating") : t("mvp.vixMissing"))}
                  </p>
                </EvidenceCard>

                <EvidenceCard
                  title={t("mvp.optionsSentiment")}
                  icon={BarChart3}
                  accentBar={regimeBar}
                  borderClass={regimeBorder}
                  value={pcr !== null ? pcr.toFixed(2) : "—"}
                  valueTone={pcrMood.tone}
                  collapsible={isMobileEvidence}
                  open={!isMobileEvidence || mobileEvidenceOpen === "pcr"}
                  onToggle={() =>
                    setMobileEvidenceOpen((id) => (id === "pcr" ? null : "pcr"))
                  }
                  sub={<span className={pcrMood.tone}>{pcrMood.label}</span>}
                >
                  <PcrSentimentBar pcr={pcr} locale={locale} />
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {pcrInterpretation || t("mvp.pcrMissing")}
                  </p>
                </EvidenceCard>
              </div>
            </div>

            {/* Layer 4 · Driving events */}
            <div className="mt-6 border-t border-border2 pt-5">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Newspaper className="h-4 w-4 text-blue" />
                    {t("mvp.drivingEvents")}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {formatMessage(t("mvp.drivingEventsHint"), { hours: DISCORD_EVENT_HOURS })}
                  </p>
                </div>
                {events.length > 3 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllEvents((v) => !v)}
                    className="text-xs text-gold transition hover:text-gold/80"
                  >
                    {showAllEvents ? t("mvp.collapse") : formatMessage(t("mvp.viewAllEvents"), { count: events.length })}
                  </button>
                ) : null}
              </div>
              <div className="relative mt-3 space-y-0 pl-4">
                <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border2" aria-hidden="true" />
                {warLoading && events.length === 0 ? (
                  <EmptyLine text={t("mvp.loadingEvents")} />
                ) : events.length === 0 ? (
                  <EmptyLine text={t("mvp.noEvents")} />
                ) : (
                  visibleEvents.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => {
                        if (!tierMeetsRequired(tier, "trial")) {
                          openUnlock("login", t("mvp.loginForEventDetail"));
                          return;
                        }
                        setSelectedEvent(event);
                      }}
                      className="relative mb-3 w-full rounded-lg border border-border2 bg-foreground/[0.02] px-4 py-3 text-left transition hover:border-gold/35 hover:bg-foreground/[0.04]"
                    >
                      <span
                        className={`absolute -left-4 top-4 h-2.5 w-2.5 rounded-full border-2 border-background ${
                          impactIsBullish(event.impact) ? "bg-green" : impactIsBearishOrRisk(event.impact) ? "bg-red" : "bg-muted"
                        }`}
                        aria-hidden="true"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={impactIsBullish(event.impact) ? "green" : impactIsBearishOrRisk(event.impact) ? "red" : "muted"}>
                          {event.impactLabel}
                        </Pill>
                        {event.relatedAssets.slice(0, 2).map((sym) => (
                          <Pill key={`${event.id}-${sym}`} tone="blue">
                            {sym}
                          </Pill>
                        ))}
                        <span className="ml-auto shrink-0 font-mono text-xs text-gold">{event.time}</span>
                      </div>
                      <div className="mt-2 text-base font-medium text-foreground">{event.title}</div>
                      {(event.impactNote || event.body) ? (
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {event.impactNote || event.body}
                        </p>
                      ) : null}
                      {!tierMeetsRequired(tier, "trial") ? (
                        <p className="mt-2 text-xs text-gold">{t("mvp.loginForEventDetailLink")}</p>
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            </div>

            {allWarErrors.length > 0 ? (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red/20 bg-red/10 px-3 py-2 text-sm text-red">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{allWarErrors.slice(0, 2).join(" · ")}</span>
              </div>
            ) : null}
          </Card>
        </section>
        ) : null}

        {showTicker ? (
        <>
        <LockedContent
          required="trial"
          currentTier={tier}
          title="登录后使用标的深度分析"
          onUnlock={(reason) => openUnlock(reason, "登录后使用标的深度分析")}
        >
          <Card className="p-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4 text-gold" />
                {t("mvp.tickerAnalysis")}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_SYMBOLS.map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => void runStockReport(sym)}
                    className="rounded-lg border border-border2 px-3 py-2 text-sm text-muted-foreground transition hover:border-gold/40 hover:text-gold"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
            <form
              className="flex flex-col gap-2 sm:flex-row lg:items-end"
              onSubmit={(event) => {
                event.preventDefault();
                void runStockReport();
              }}
            >
              <div className="flex min-w-[220px] flex-col gap-1">
                <label className="text-xs text-muted">Ticker</label>
                <input
                  value={symbol}
                  onChange={(event) => setSymbol(event.target.value.toUpperCase())}
                  className="h-10 rounded-lg border border-border2 bg-background px-3 font-mono text-sm text-foreground outline-none transition focus:border-gold/50"
                  placeholder="NVDA"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-medium text-background transition hover:bg-gold/90 disabled:opacity-60"
                disabled={reportLoading}
              >
                {reportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {t("mvp.generateSummary")}
              </button>
            </form>
          </div>
          </Card>
        </LockedContent>

        <LockedContent
          required="pro"
          currentTier={tier}
          title="Pro：完整标的深度、Gamma 与期权筛选"
          onUnlock={(reason) => openUnlock(reason, "Pro：完整标的深度分析")}
        >
        <section className="space-y-4">
          {/* Gamma 快览条 — 滚动时固定置顶 */}
          <div className="relative sticky top-0 z-30 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-gold/25 bg-background/92 px-4 py-3 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)] backdrop-blur-md supports-[backdrop-filter]:bg-background/78">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" aria-hidden />
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 shrink-0 text-gold" />
              <span className="font-mono text-sm font-semibold text-gold">{symbol}</span>
              <span className="text-[10px] text-muted">{t("mvp.gammaGlance")}</span>
            </div>
            <div className="hidden h-5 w-px bg-border2 sm:block" aria-hidden />
            <GlanceStat label="Net GEX" value={netGexDisplay} tone={netGexTone} />
            <GlanceStat label="Gamma Flip" value={money(gammaFlipLevel)} />
            <GlanceStat
              label="Regime"
              value={gammaRead.regimeLabel}
              tone={gammaRead.tone === "muted" ? "default" : gammaRead.tone}
            />
            <GlanceStat
              label={t("mvp.structureBias")}
              value={gammaRead.structureBias}
              tone={
                isVolatilityExpansion(gammaRead.structureBiasCode)
                  ? "red"
                  : isMeanReversion(gammaRead.structureBiasCode)
                    ? "green"
                    : "default"
              }
            />
            {gexSpot !== null ? (
              <>
                <div className="hidden h-5 w-px bg-border2 lg:block" aria-hidden />
                <GlanceStat label={t("mvp.spotPrice")} value={money(gexSpot)} />
              </>
            ) : null}
            {reportLoading ? (
              <Loader2 className="ml-auto h-4 w-4 animate-spin text-gold" />
            ) : (
              <button
                type="button"
                onClick={scrollToGammaHero}
                className="ml-auto inline-flex items-center gap-1 rounded-lg border border-gold/30 bg-gold/5 px-2.5 py-1.5 text-[10px] font-medium text-gold transition hover:border-gold/50 hover:bg-gold/10"
              >
                {t("mvp.viewGammaDetail")}
                <ChevronDown className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Gamma Hero — 平台核心特色，全宽置顶 */}
          <div ref={gammaHeroRef} id="gamma-hero-section" className="scroll-mt-3">
          <Card className="overflow-hidden border-gold/25">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/15 bg-gradient-to-r from-gold/[0.08] via-gold/[0.03] to-transparent px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-gold" />
                  <span className="text-base font-semibold text-foreground">{t("mvp.gammaStructure")}</span>
                </div>
                <Pill tone="gold">{t("mvp.platformCore")}</Pill>
                <Pill tone={gammaRead.tone}>{gammaRead.regimeLabel}</Pill>
                <Pill tone={isVolatilityExpansion(gammaRead.structureBiasCode) ? "red" : isMeanReversion(gammaRead.structureBiasCode) ? "green" : "muted"}>
                  {gammaRead.structureBias}
                </Pill>
                {gexSpot !== null ? (
                  <Pill tone="blue">
                    {t("mvp.spotPrice")} {money(gexSpot)}
                  </Pill>
                ) : null}
              </div>
              {reportLoading ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : null}
            </div>

            <div className="p-4">
              <p className="text-sm leading-6 text-muted-foreground">{gammaRead.summary}</p>

              {gexError ? (
                <div className="mt-3 rounded-lg border border-red/20 bg-red/10 px-3 py-2 text-xs text-red">
                  {t("mvp.gammaUnavailable")} {friendlyApiError(gexError, "gex")}
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                <Metric
                  label="Net GEX"
                  value={num(gexProfile?.netGex) !== null ? `${num(gexProfile?.netGex)! >= 0 ? "+" : ""}${num(gexProfile?.netGex)!.toFixed(2)}B` : "—"}
                  sub={t("mvp.hedgeEnv")}
                />
                <Metric label="Gamma Flip" value={money(gexProfile?.gammaFlip)} sub={t("mvp.volBoundary")} />
                <Metric label="Call Wall" value={money(gexProfile?.callWall)} sub={t("mvp.callPressure")} />
                <Metric label="Put Wall" value={money(gexProfile?.putWall)} sub={t("mvp.putSupport")} />
                <Metric label="Max Pain" value={money(gexProfile?.maxPain)} sub={t("mvp.maxPainExpiry")} />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-3">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted">{t("mvp.actionMeaning")}</div>
                  <div className="mt-2 space-y-2">
                    {gammaRead.actions.map((line) => (
                      <div key={line} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                        <span className="text-gold">·</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-3">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted">{t("mvp.riskBoundary")}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{gammaRead.risk}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-muted">
                    <span>
                      {t("mvp.distFlip")} {pct(gammaRead.distances.flipPct)}
                    </span>
                    <span>
                      {t("mvp.distCallWall")} {pct(gammaRead.distances.callWallPct)}
                    </span>
                    <span>
                      {t("mvp.distPutWall")} {pct(gammaRead.distances.putWallPct)}
                    </span>
                    <span>
                      {t("mvp.distMaxPain")} {pct(gammaRead.distances.maxPainPct)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setGammaChartOpen((open) => !open)}
                  className="rounded-lg border border-border2 px-3 py-2 text-xs text-muted-foreground transition hover:border-gold/40 hover:text-gold disabled:opacity-50"
                  disabled={gexStrikes.length === 0}
                >
                  {gammaChartOpen ? t("mvp.collapseDistribution") : t("mvp.expandDistribution")}
                </button>
                <button
                  type="button"
                  onClick={() => setGammaModal("distribution")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border2 px-3 py-2 text-xs text-muted-foreground transition hover:border-gold/40 hover:text-gold disabled:opacity-50"
                  disabled={gexStrikes.length === 0 || gexSpot === null}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  {t("mvp.enlargeDistribution")}
                </button>
                <button
                  type="button"
                  onClick={() => setGammaTrendOpen((open) => !open)}
                  className="rounded-lg border border-border2 px-3 py-2 text-xs text-muted-foreground transition hover:border-gold/40 hover:text-gold disabled:opacity-50"
                  disabled={gexHistoryRows.length === 0}
                >
                  {gammaTrendOpen ? t("mvp.collapseTrend") : t("mvp.expandTrend")}
                </button>
                <button
                  type="button"
                  onClick={() => setGammaModal("trend")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border2 px-3 py-2 text-xs text-muted-foreground transition hover:border-gold/40 hover:text-gold disabled:opacity-50"
                  disabled={gexHistoryRows.length === 0}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  {t("mvp.enlargeTrend")}
                </button>
              </div>

              {gammaChartOpen || gammaTrendOpen ? (
                <div className={`mt-4 grid gap-4 ${gammaChartOpen && gammaTrendOpen ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}>
                  {gammaChartOpen ? (
                    <div className="rounded-lg border border-gold/15 bg-foreground/[0.02] p-3">
                      <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gold">{t("mvp.strikeDistribution")}</div>
                      {gexStrikes.length > 0 && gexSpot !== null ? (
                        <GexChart
                          ticker={symbol}
                          strikes={gexStrikes}
                          price={gexSpot}
                          gammaFlip={num(gexProfile?.gammaFlip) ?? undefined}
                        />
                      ) : (
                        <EmptyLine text={t("mvp.noGammaData")} />
                      )}
                    </div>
                  ) : null}
                  {gammaTrendOpen ? (
                    <div className="rounded-lg border border-gold/15 bg-foreground/[0.02] p-3">
                      <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gold">{t("mvp.netGexTrend")}</div>
                      <GexTrendChart merged={gexHistoryRows} symbol={symbol} />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>
          </div>

          {/* 辅助分析 — 对称双栏 */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start">
            <Card className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LineChartIcon className="h-4 w-4 text-blue" />
                    {t("mvp.entryTiming")}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-gold/15 bg-gold/[0.04] px-3 py-2">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-gold">{t("mvp.basedOnGamma")}</span>
                    <Pill tone="muted">
                      {resolveDictionaryValue(locale, "mvp.inferredDirection.auto") ?? "自动推断"}: {inferredDirectionLabel}
                    </Pill>
                    <Pill tone={gammaRead.tone}>{gammaRead.regimeLabel}</Pill>
                    <Pill
                      tone={
                        isVolatilityExpansion(gammaRead.structureBiasCode)
                          ? "red"
                          : isMeanReversion(gammaRead.structureBiasCode)
                            ? "green"
                            : "muted"
                      }
                    >
                      {gammaRead.structureBias}
                    </Pill>
                    {gammaFlipLevel !== null && gexSpot !== null ? (
                      <span className="text-[11px] text-muted-foreground">
                        Flip {money(gammaFlipLevel)} · {pct(gammaRead.distances.flipPct)} {t("mvp.distFromSpot")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{entryGammaHint(gammaRead.structureBiasCode, locale)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className={`text-lg font-semibold ${stockBias.tone}`}>{stockBias.label}</div>
                    {spot !== null ? <Pill tone="blue">{money(spot)}</Pill> : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{stockBias.thesis}</p>
                </div>
                {reportLoading ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : null}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Metric label={t("mvp.spotPrice")} value={money(spot)} sub={pct(stockOverview?.bar?.changePct)} />
                <Metric
                  label="IV Rank"
                  value={num(stockOverview?.keyStats?.ivRank)?.toFixed(1) ?? "—"}
                  sub={t("mvp.ivRankHeat")}
                />
                <Metric
                  label={t("mvp.targetSpread")}
                  value={upside !== null ? pct(upside) : "—"}
                  sub={ptAvg ? money(ptAvg) : t("mvp.analyst")}
                />
                <Metric
                  label={t("mvp.sentiment")}
                  value={report?.smart.data?.retail_sentiment_score ?? "—"}
                  sub={report?.smart.data?.consensus_type ?? "smart vs retail"}
                />
              </div>

              <div className="mt-4 rounded-lg border border-border2 bg-foreground/[0.02] p-2">
                <div className="h-[200px]">
                  {priceSeries.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={priceSeries}>
                        <defs>
                          <linearGradient id="stockFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} minTickGap={24} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} domain={priceChartYDomain} width={48} />
                        <Tooltip contentStyle={{ background: "#0f1c30", border: "1px solid rgba(255,255,255,.1)" }} />
                        {gammaFlipLevel !== null ? (
                          <ReferenceLine
                            y={gammaFlipLevel}
                            stroke="#D4AF37"
                            strokeDasharray="6 4"
                            strokeWidth={1.5}
                            label={{ value: "Flip", position: "insideTopRight", fill: "#D4AF37", fontSize: 9 }}
                          />
                        ) : null}
                        {callWallLevel !== null ? (
                          <ReferenceLine
                            y={callWallLevel}
                            stroke="#FF6B6B"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                            label={{ value: "Call", position: "insideTopLeft", fill: "#FF6B6B", fontSize: 9 }}
                          />
                        ) : null}
                        {putWallLevel !== null ? (
                          <ReferenceLine
                            y={putWallLevel}
                            stroke="#00D4AA"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                            label={{ value: "Put", position: "insideBottomLeft", fill: "#00D4AA", fontSize: 9 }}
                          />
                        ) : null}
                        {maxPainLevel !== null ? (
                          <ReferenceLine
                            y={maxPainLevel}
                            stroke="#8B8D97"
                            strokeDasharray="2 4"
                            strokeWidth={1}
                            label={{ value: "MP", position: "insideBottomRight", fill: "#8B8D97", fontSize: 9 }}
                          />
                        ) : null}
                        <Area type="monotone" dataKey="close" stroke="#22d3ee" fill="url(#stockFill)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted">{t("mvp.klineLoading")}</div>
                  )}
                </div>
                {gammaFlipLevel !== null || callWallLevel !== null || putWallLevel !== null || maxPainLevel !== null ? (
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 border-t border-border2/60 pt-1.5 text-[9px] text-muted">
                    {gammaFlipLevel !== null ? (
                      <span className="text-gold">— Flip {money(gammaFlipLevel)}</span>
                    ) : null}
                    {callWallLevel !== null ? (
                      <span className="text-red">— Call Wall {money(callWallLevel)}</span>
                    ) : null}
                    {putWallLevel !== null ? (
                      <span className="text-green">— Put Wall {money(putWallLevel)}</span>
                    ) : null}
                    {maxPainLevel !== null ? (
                      <span>— Max Pain {money(maxPainLevel)}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <WalletCards className="h-4 w-4 text-gold" />
                  {t("mvp.optionsScreener")}
                </div>
                <p className="mt-1 max-w-3xl text-[11px] leading-5 text-muted">
                  {optionsInsights?.framework_summary ?? getOptionFrameworkIntro(locale)}
                </p>
              </div>
            </div>

            {optionsInsights?.combined_insight ? (
              <div className="mt-3 rounded-lg border border-gold/20 bg-gold/5 px-3 py-2">
                <div className="text-[10px] font-medium text-gold">{t("mvp.ajiDeepInsight")}</div>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{optionsInsights.combined_insight}</p>
              </div>
            ) : reportLoading ? (
              <p className="mt-2 text-[11px] text-muted">{t("mvp.insightsGenerating")}</p>
            ) : null}

            <p className="mt-2 text-[10px] leading-5 text-muted">
              {optionsInsights?.contracts_note ?? getOptionTableLegend(locale)}
            </p>
            <p className="mt-1 text-[10px] leading-5 text-muted">{getPlaybookScreenerFootnote(locale)}</p>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px]">
              <div className="overflow-hidden rounded-lg border border-border2">
                <div className="border-b border-border2 bg-foreground/[0.02] px-3 py-1.5 text-[10px] text-muted">
                  {formatMessage(t("mvp.liquidityContracts"), {
                    side:
                      direction === "bear"
                        ? t("mvp.putSide")
                        : direction === "bull"
                          ? t("mvp.callSide")
                          : t("mvp.callSide"),
                  })}
                </div>
                <div className="grid grid-cols-[0.9fr_0.9fr_0.8fr_0.8fr_1fr] bg-foreground/[0.03] px-3 py-2 text-[11px] text-muted">
                  <span>{t("mvp.contract")}</span>
                  <span>{t("mvp.expiry")}</span>
                  <span title={t("mvp.dte")}>{t("mvp.dte")}</span>
                  <span title={t("mvp.iv")}>{t("mvp.iv")}</span>
                  <span title={t("mvp.volOi")}>{t("mvp.volOi")}</span>
                </div>
                {optionCandidates.length > 0 ? (
                  optionCandidates.slice(0, 6).map((row) => (
                    <div key={`${row.side}-${row.expiration}-${row.strike}`} className="grid grid-cols-[0.9fr_0.9fr_0.8fr_0.8fr_1fr] border-t border-border2 px-3 py-2 text-xs">
                      <span className={row.side === "call" ? "text-green" : "text-red"}>
                        {row.side.toUpperCase()} {row.strike}
                      </span>
                      <span className="font-mono text-muted-foreground">{row.expiration.slice(5)}</span>
                      <span className="font-mono text-foreground">{row.dte ?? "—"}</span>
                      <span className="font-mono text-foreground">{row.ivPct !== null ? `${row.ivPct.toFixed(1)}%` : "—"}</span>
                      <span className="font-mono text-muted-foreground">
                        {row.volume ?? "—"}/{row.openInterest ?? "—"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="border-t border-border2 px-3 py-8 text-center text-sm text-muted">{t("mvp.chainUnavailable")}</div>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-[10px] font-medium text-muted-foreground">{t("mvp.structureVsEm")}</div>
                  {gammaFlipLevel !== null && gexSpot !== null ? (
                    <p className="mt-0.5 text-[10px] leading-4 text-muted">
                      {formatMessage(t("mvp.flipVsEm"), { flip: money(gammaFlipLevel) })}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[10px] text-muted">{t("mvp.flipUnavailable")}</p>
                  )}
                </div>
                {(stockOverview?.expectedMoves ?? []).slice(0, 3).map((move) => {
                  const aiMove = expectedMoveReads.get(move.bucket);
                  const flipCompare = compareFlipToExpectedMove(gexSpot, gammaFlipLevel, move.pct, locale);
                  const row: ExpectedMoveRow = {
                    ...move,
                    bucketZh: move.bucketZh ?? aiMove?.bucket_zh,
                  };
                  return (
                  <button
                    key={move.bucket}
                    type="button"
                    onClick={() => setSelectedExpectedMove(row)}
                    className="w-full rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2 text-left transition hover:border-gold/40 hover:bg-gold/5 cursor-pointer"
                  >
                    <div className="text-[11px] font-medium text-foreground">
                      {aiMove?.bucket_zh ?? expectedMoveBucketLabel(move.bucket, locale)}
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted">{expectedMoveBucketHint(move.bucket, locale)}</div>
                    <div className="mt-1 font-mono text-sm text-foreground">
                      ±{move.pct.toFixed(2)}% · {money(move.straddleUsd)}
                    </div>
                    <div
                      className={`mt-1.5 rounded-md border px-2 py-1 text-[10px] leading-4 ${
                        flipCompare.inside === true
                          ? "border-green/25 bg-green/10 text-green"
                          : flipCompare.inside === false
                            ? "border-gold/25 bg-gold/10 text-gold"
                            : "border-border2 bg-foreground/[0.02] text-muted"
                      }`}
                    >
                      {flipCompare.label}
                    </div>
                    <FlipEmRangeAxis
                      spot={gexSpot}
                      gammaFlip={gammaFlipLevel}
                      expectedMovePct={move.pct}
                      inside={flipCompare.inside}
                    />
                    <div className="mt-1 text-[10px] text-muted">到期 {move.expiration} · 点击查看详情</div>
                    {aiMove?.interpretation ? (
                      <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-muted-foreground">{aiMove.interpretation}</p>
                    ) : null}
                  </button>
                  );
                })}
              </div>
            </div>
          </Card>
          </div>

          {gammaModal ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              role="presentation"
              onClick={() => setGammaModal(null)}
            >
              <div
                className="w-full max-w-6xl rounded-xl border border-border2 bg-background p-4 shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-label={gammaModal === "distribution" ? "Gamma 分布放大图" : "Gamma 趋势放大图"}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {symbol} {gammaModal === "distribution" ? "Gamma 分布" : "Gamma 趋势"}
                    </div>
                    <div className="text-[11px] text-muted">点击背景或右上角关闭</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGammaModal(null)}
                    className="rounded-lg border border-border2 p-2 text-muted-foreground transition hover:border-gold/40 hover:text-gold"
                    aria-label="关闭"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-[78vh] overflow-auto rounded-lg border border-border2 bg-foreground/[0.02] p-3">
                  {gammaModal === "distribution" ? (
                    gexStrikes.length > 0 && gexSpot !== null ? (
                      <GexChart
                        ticker={symbol}
                        strikes={gexStrikes}
                        price={gexSpot}
                        gammaFlip={num(gexProfile?.gammaFlip) ?? undefined}
                      />
                    ) : (
                      <EmptyLine text="暂无 Gamma 分布数据" />
                    )
                  ) : (
                    <GexTrendChart merged={gexHistoryRows} symbol={symbol} />
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </section>
        </LockedContent>
        </>
        ) : null}

        {selectedEvent ? (
          <EventDetailModal
            detail={selectedEvent.detail}
            impact={selectedEvent.impact}
            impactLabel={selectedEvent.impactLabel}
            onClose={() => setSelectedEvent(null)}
          />
        ) : null}

        {selectedExpectedMove ? (
          <ExpectedMoveDetailModal
            move={selectedExpectedMove}
            interpretation={expectedMoveReads.get(selectedExpectedMove.bucket)?.interpretation}
            onClose={() => setSelectedExpectedMove(null)}
          />
        ) : null}

        <footer className="flex flex-wrap items-center justify-between gap-3 pb-6 text-xs text-muted">
          <span>{t("mvp.disclaimer")}</span>
          <div className="flex items-center gap-3">
            <Link href="/macro" className="hover:text-gold">{t("mvp.macroLink")}</Link>
            <Link href="/stock/SPY/overview" className="hover:text-gold">{t("mvp.stockLink")}</Link>
          </div>
        </footer>
      </div>
    </RootTag>
  );
}
