/**
 * Typed API client for OptionsAji backend.
 * Browser: same-origin /api proxy by default; set NEXT_PUBLIC_API_BASE to call FastAPI directly.
 */
import { apiFetch } from "@/lib/apiBase";
import type {
  AgentBriefContract,
  AnalystPriceTargetContract,
  AlertCreateEnvelopeContract,
  AlertsListEnvelopeContract,
  AuthRegisterContract,
  AuthResendVerificationContract,
  AuthTokenContract,
  FeedEnvelopeContract,
  KolDirectoryContract,
  MarketOverviewContract,
  MacroCalendarInsightsContract,
  MvpMarketInsightsContract,
  StockOptionsInsightsContract,
  PushSettingsContract,
  ResonanceStreamContract,
  ScannerRunContract,
  ScannerRunPayload,
  ScannerTemplateConfigContract,
  ScannerTemplateContract,
  SignalsFeedEnvelopeContract,
  SmartVsRetailContract,
  SocialRadarContract,
  StockOverviewContract,
  WatchlistAddContract,
  WatchlistGetContract,
  WatchlistRemoveContract,
} from "@/lib/contracts";
import { buildMvpRequestHeaders } from "@/lib/access-key";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";
import { unwrapMvpEnvelope } from "@/lib/mvp-tier";

export function getClientLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored === "en" ? "en" : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function withLocale(params: URLSearchParams, locale?: Locale): URLSearchParams {
  const next = new URLSearchParams(params);
  next.set("locale", locale ?? getClientLocale());
  return next;
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

function asJsonObject(value: JsonValue | null | undefined): JsonObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as JsonObject;
}

function parseApiError(payload: JsonObject | null): string | null {
  if (!payload) return null;
  const detail = asJsonObject(payload.detail ?? null) ?? payload.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (
    detail &&
    typeof detail === "object" &&
    !Array.isArray(detail) &&
    typeof asJsonObject(detail)?.message === "string" &&
    String(asJsonObject(detail)?.message).trim()
  ) {
    return String(asJsonObject(detail)?.message);
  }
  const error = asJsonObject(payload.error ?? null);
  if (
    error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }
  return null;
}

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers({ "Content-Type": "application/json" });
  new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
  const apiKey = process.env.NEXT_PUBLIC_API_KEY?.trim();
  if (apiKey && !headers.has("X-API-Key")) {
    headers.set("X-API-Key", apiKey);
  }
  const res = await apiFetch(path, {
    ...init,
    headers,
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as JsonObject | null;
    const msg = parseApiError(payload);
    throw new Error(msg || `API ${path} failed: ${res.status}`);
  }
  return res.json();
}

// ── Market Overview ────────────────────────────────────────────────────────────
export const api = {
  auth: {
    register: (payload: {
      email: string;
      password: string;
      display_name?: string | null;
      turnstile_token?: string | null;
    }) =>
      fetchJSON<AuthRegisterContract>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    verifyRegister: (payload: { email: string; code: string }) =>
      fetchJSON<AuthTokenContract>("/api/auth/register/verify", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    resendVerification: (email: string, turnstileToken?: string | null) =>
      fetchJSON<AuthResendVerificationContract>("/api/auth/register/resend", {
        method: "POST",
        body: JSON.stringify({ email, turnstile_token: turnstileToken ?? null }),
      }),
    login: (payload: { email: string; password: string; turnstile_token?: string | null }) =>
      fetchJSON<AuthTokenContract>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    me: (token: string) =>
      fetchJSON<AuthTokenContract["user"]>("/api/auth/me", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      }),
    logout: (token: string) =>
      fetchJSON<{ success: boolean }>("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      }),
    redeem: (token: string, code: string) =>
      fetchJSON<import("@/lib/contracts").RedeemCodeContract>("/api/auth/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      }),
  },

  market: {
    sectors: () => fetchJSON("/api/market/sectors"),
    gainers: () => fetchJSON("/api/market/gainers"),
    losers: () => fetchJSON("/api/market/losers"),
    actives: () => fetchJSON("/api/market/actives"),
    hours: () => fetchJSON("/api/market/hours"),
    indices: () => fetchJSON("/api/market/indices"),
    overview: (refresh = false) =>
      fetchJSON<MarketOverviewContract>(
        refresh ? "/api/market/overview?refresh=true" : "/api/market/overview",
      ),
    aiSummary: () => fetchJSON("/api/market/ai-summary"),
    brief: (locale?: Locale) =>
      fetchJSON<AgentBriefContract>(`/api/agent/brief?${withLocale(new URLSearchParams(), locale)}`),
    signalsFeed: (locale?: Locale) =>
      fetchJSON<SignalsFeedEnvelopeContract>(`/api/signals/feed?${withLocale(new URLSearchParams(), locale)}`),
    mvpMarketInsights: async (authToken?: string | null, locale?: Locale) => {
      const raw = await fetchJSON<Record<string, unknown>>(
        `/api/mvp/market-insights?${withLocale(new URLSearchParams(), locale)}`,
        { headers: buildMvpRequestHeaders(undefined, authToken) },
      );
      return unwrapMvpEnvelope(raw).data as unknown as MvpMarketInsightsContract;
    },
    mvpMacroCalendarInsights: async (
      from: string,
      to: string,
      country = "US",
      authToken?: string | null,
      locale?: Locale,
    ) => {
      const params = withLocale(
        new URLSearchParams({ from_date: from, to_date: to, country }),
        locale,
      );
      const raw = await fetchJSON<Record<string, unknown>>(
        `/api/mvp/macro-calendar-insights?${params}`,
        { headers: buildMvpRequestHeaders(undefined, authToken) },
      );
      return unwrapMvpEnvelope(raw).data as unknown as MacroCalendarInsightsContract;
    },
    stockOptionsInsights: (payload: {
      symbol: string;
      direction: "bull" | "bear";
      spot?: number | null;
      iv_rank?: number | null;
      expected_moves: Array<{ bucket: string; pct: number; straddleUsd: number; expiration: string }>;
      contracts: Array<Record<string, unknown>>;
      unusual_items?: Array<Record<string, unknown>>;
      market_regime_code?: string | null;
      market_regime_label?: string | null;
    }, authToken?: string | null, locale?: Locale) =>
      (async () => {
        const raw = await fetchJSON<Record<string, unknown>>(
          `/api/mvp/stock-options-insights?${withLocale(new URLSearchParams(), locale)}`,
          {
            method: "POST",
            headers: buildMvpRequestHeaders(undefined, authToken),
            body: JSON.stringify(payload),
          },
        );
        return unwrapMvpEnvelope(raw).data as unknown as StockOptionsInsightsContract;
      })(),
  },

  options: {
    chain: (
      symbol: string,
      expiry?: string,
      type?: string,
      opts?: { realtime?: boolean; limit?: number; strikeWindowPct?: number },
    ) => {
      const params = new URLSearchParams();
      if (expiry) params.set("expiration_date", expiry);
      if (type) params.set("contract_type", type);
      if (opts?.realtime) params.set("realtime", "true");
      if (opts?.limit) params.set("limit", String(opts.limit));
      if (opts?.strikeWindowPct) params.set("strike_window_pct", String(opts.strikeWindowPct));
      return fetchJSON(`/api/options/chain/${symbol}?${params}`);
    },
    expirations: (symbol: string) => fetchJSON(`/api/options/expirations/${symbol}`),
    gex: (symbol: string, opts?: { realtime?: boolean; limit?: number; strikeWindowPct?: number }) => {
      const params = new URLSearchParams();
      if (opts?.realtime) params.set("realtime", "true");
      if (opts?.limit) params.set("limit", String(opts.limit));
      if (opts?.strikeWindowPct) params.set("strike_window_pct", String(opts.strikeWindowPct));
      return fetchJSON(`/api/options/gex/${symbol}?${params}`);
    },
    unusual: (volOiMin?: number, volumeMin?: number) => {
      const params = new URLSearchParams();
      if (volOiMin) params.set("vol_oi_min", String(volOiMin));
      if (volumeMin) params.set("volume_min", String(volumeMin));
      return fetchJSON(`/api/options/unusual?${params}`);
    },
    unusualV2: (opts?: {
      minScore?: number;
      page?: number;
      pageSize?: number;
      sortBy?: string;
      order?: string;
      volumeMin?: number;
    }) => {
      const params = new URLSearchParams();
      if (opts?.minScore != null) params.set("min_score", String(opts.minScore));
      if (opts?.page != null) params.set("page", String(opts.page));
      if (opts?.pageSize != null) params.set("page_size", String(opts.pageSize));
      if (opts?.sortBy) params.set("sort_by", opts.sortBy);
      if (opts?.order) params.set("order", opts.order);
      if (opts?.volumeMin != null) params.set("volume_min", String(opts.volumeMin));
      return fetchJSON<{
        items: Array<Record<string, unknown>>;
        total: number;
        page: number;
        page_size: number;
      }>(`/api/options/unusual-v2?${params}`);
    },
    atmHistory: (symbol: string, expiration: string, contractType = "call", daysBack = 60) =>
      fetchJSON(`/api/options/atm-history/${symbol}?expiration=${expiration}&contract_type=${contractType}&days_back=${daysBack}`),
    bars: (ticker: string, from: string, to: string) =>
      fetchJSON(`/api/options/bars/${ticker}?from_date=${from}&to_date=${to}`),
  },

  stock: {
    search: (q: string) => fetchJSON(`/api/stock/search?q=${encodeURIComponent(q)}`),
    quote: (symbol: string) => fetchJSON(`/api/stock/${symbol}/quote`),
    overview: (symbol: string) => fetchJSON<StockOverviewContract>(`/api/stock/${symbol}/overview`),
    profile: (symbol: string) => fetchJSON(`/api/stock/${symbol}/profile`),
    volatility: (symbol: string) => fetchJSON(`/api/stock/${symbol}/volatility`),
    earningsCalendar: (symbol: string) =>
      fetchJSON(`/api/stock/${symbol}/earnings-calendar`),
    financials: (symbol: string, stmt: string, period = "quarter") =>
      fetchJSON(`/api/stock/${symbol}/financials?statement=${stmt}&period=${period}`),
    metrics: (symbol: string) => fetchJSON(`/api/stock/${symbol}/metrics`),
    dcf: (symbol: string) => fetchJSON(`/api/stock/${symbol}/dcf`),
    history: (symbol: string, interval = "daily", from = "", to = "") => {
      const params = new URLSearchParams({ interval });
      if (from) params.set("from_date", from);
      if (to) params.set("to_date", to);
      return fetchJSON(`/api/stock/${symbol}/history?${params}`);
    },
    unusual: (symbol: string) => fetchJSON(`/api/stock/${symbol}/unusual`),
  },

  macro: {
    calendar: (from?: string, to?: string, country?: string, impact?: string) => {
      const params = new URLSearchParams();
      if (from) params.set("from_date", from);
      if (to) params.set("to_date", to);
      if (country) params.set("country", country);
      if (impact) params.set("impact", impact);
      return fetchJSON(`/api/macro/calendar?${params}`);
    },
    treasury: (days?: number) =>
      fetchJSON(`/api/macro/treasury${days ? `?days=${days}` : ""}`),
    indicator: (name: string) =>
      fetchJSON(`/api/macro/indicator?name=${encodeURIComponent(name)}`),
  },

  etf: {
    list: () => fetchJSON("/api/etf/list"),
    holdings: (symbol: string) => fetchJSON(`/api/etf/${symbol}/holdings`),
    sectors: (symbol: string) => fetchJSON(`/api/etf/${symbol}/sectors`),
    info: (symbol: string) => fetchJSON(`/api/etf/${symbol}/info`),
  },

  news: {
    latest: (page?: number) => fetchJSON(`/api/news/latest${page ? `?page=${page}` : ""}`),
    stock: (tickers: string) => fetchJSON(`/api/news/stock?tickers=${tickers}`),
    search: (q: string) => fetchJSON(`/api/news/search?q=${encodeURIComponent(q)}`),
  },

  analyst: {
    ratings: (symbol: string) => fetchJSON(`/api/analyst/${symbol}`),
    priceTarget: (symbol: string) =>
      fetchJSON<AnalystPriceTargetContract>(`/api/analyst/${symbol}/price-target`),
  },

  feed: {
    unified: (
      limit = 100,
      ticker?: string,
      filters?: {
        kind?: string;
        sentiment?: string;
        priority?: string;
        kol_only?: boolean;
        /** Rolling window for Discord/macro rows (default 72 on backend). */
        hours?: number;
        /** Discord author whitelist menu slot (default feed). */
        menu_slot?: string;
      },
    ) => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (ticker) params.set("ticker", ticker);
      if (filters?.kind) params.set("kind", filters.kind);
      if (filters?.sentiment) params.set("sentiment", filters.sentiment);
      if (filters?.priority) params.set("priority", filters.priority);
      if (filters?.kol_only) params.set("kol_only", "true");
      if (filters?.hours != null && filters.hours > 0) {
        params.set("hours", String(filters.hours));
      }
      if (filters?.menu_slot) params.set("menu_slot", filters.menu_slot);
      return fetchJSON<FeedEnvelopeContract>(`/api/feed/unified?${withLocale(params)}`);
    },
  },

  discord: {
    kolHub: (opts?: { menu_slot?: string; hours?: number; locale?: Locale }) => {
      const params = new URLSearchParams();
      params.set("menu_slot", opts?.menu_slot ?? "twitter_kol");
      params.set("hours", String(opts?.hours ?? 168));
      return fetchJSON<import("@/lib/contracts").DiscordKolHubContract>(
        `/api/discord/kol-hub?${withLocale(params, opts?.locale)}`,
      );
    },
    timeline: (opts?: {
      menu_slot?: string;
      hours?: number;
      limit?: number;
      ticker?: string;
      authors?: string[];
      before_timestamp?: string;
      locale?: Locale;
    }) => {
      const params = new URLSearchParams();
      params.set("menu_slot", opts?.menu_slot ?? "twitter_kol");
      params.set("hours", String(opts?.hours ?? 72));
      params.set("limit", String(opts?.limit ?? 50));
      if (opts?.ticker) params.set("ticker", opts.ticker);
      if (opts?.authors && opts.authors.length > 0) {
        params.set("authors", opts.authors.join(","));
      }
      if (opts?.before_timestamp) params.set("before_timestamp", opts.before_timestamp);
      return fetchJSON<import("@/lib/contracts").DiscordTimelineContract>(
        `/api/discord/timeline?${withLocale(params, opts?.locale)}`,
      );
    },
  },

  scanner: {
    run: (payload: ScannerRunPayload) =>
      fetchJSON<ScannerRunContract>("/api/scanner/run", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  social: {
    radar: (limit = 10, locale?: Locale) =>
      fetchJSON<SocialRadarContract>(`/api/social/radar?${withLocale(new URLSearchParams({ limit: String(limit) }), locale)}`),
    smartVsRetail: (symbol: string) =>
      fetchJSON<SmartVsRetailContract>(`/api/social/smart-vs-retail/${symbol}`),
    kolDirectory: () => fetchJSON<KolDirectoryContract>("/api/social/kol"),
    resonanceStream: (limit = 30, symbol?: string, locale?: Locale) => {
      const qs = new URLSearchParams({ limit: String(limit) });
      if (symbol?.trim()) qs.set("symbol", symbol.trim().toUpperCase());
      return fetchJSON<ResonanceStreamContract>(`/api/social/resonance?${withLocale(qs, locale)}`);
    },
  },

  alerts: {
    list: (apiKey: string) =>
      fetchJSON<AlertsListEnvelopeContract>(`/api/alerts?api_key=${encodeURIComponent(apiKey)}`),
    create: (payload: {
      api_key: string;
      alert_type: string;
      symbol: string;
      threshold?: number | null;
    }) =>
      fetchJSON<AlertCreateEnvelopeContract>("/api/alerts", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  profile: {
    getPushSettings: (apiKey: string) =>
      fetchJSON<{ success: boolean; data: PushSettingsContract }>(
        `/api/profile/push-settings?api_key=${encodeURIComponent(apiKey)}`,
      ),
    savePushSettings: (payload: {
      api_key: string;
      push_discord: boolean;
      push_telegram: boolean;
      push_email: boolean;
      keywords: string;
    }) =>
      fetchJSON<{ success: boolean; data: PushSettingsContract }>(
        "/api/profile/push-settings",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      ),
    listScannerTemplates: (apiKey: string) =>
      fetchJSON<{ success: boolean; data: ScannerTemplateContract[] }>(
        `/api/profile/scanner-templates?api_key=${encodeURIComponent(apiKey)}`,
      ),
    upsertScannerTemplate: (payload: {
      api_key: string;
      template_id?: number;
      name: string;
      config: ScannerTemplateConfigContract;
    }) =>
      fetchJSON<{ success: boolean; data: ScannerTemplateContract }>(
        "/api/profile/scanner-templates",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      ),
    deleteScannerTemplate: (apiKey: string, templateId: number) =>
      fetchJSON<{ success: boolean; deleted: number }>(
        `/api/profile/scanner-templates/${templateId}?api_key=${encodeURIComponent(apiKey)}`,
        { method: "DELETE" },
      ),
  },

  watchlist: {
    get: (apiKey = "default") => fetchJSON<WatchlistGetContract>(`/api/watchlist?api_key=${apiKey}`),
    add: (symbol: string, apiKey = "default") =>
      fetchJSON<WatchlistAddContract>("/api/watchlist", {
        method: "POST",
        body: JSON.stringify({ symbol, api_key: apiKey }),
      }),
    remove: (symbol: string, apiKey = "default") =>
      fetchJSON<WatchlistRemoveContract>(`/api/watchlist/${symbol}?api_key=${apiKey}`, {
        method: "DELETE",
      }),
  },
};
