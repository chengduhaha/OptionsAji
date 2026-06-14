/**
 * Cross-market HTTP client. All paths hit Next.js route handlers
 * that proxy to OPTIONS_AJI_BACKEND_URL (see app/api/cross-market/*).
 */

export interface HotEvent {
  event_id: string;
  title_en: string;
  title_zh: string;
  event_type: string;
  event_time: string;
  polymarket_probability: number;
  related_ticker?: string | null;
  related_tickers?: string[];
  volume_24h?: number | null;
  liquidity?: number | null;
  slug?: string | null;
}

export interface XpozHotItem {
  rank: number;
  ticker: string;
  mentions_24h: number;
  mention_growth_pct: number;
  sentiment_score: number;
  direction: string;
  twitter_mentions: number;
  reddit_mentions: number;
  sample_posts: string[];
}

export interface XpozHotResponse {
  generated_at_utc: string;
  source: string;
  configured: boolean;
  items: XpozHotItem[];
}

export interface SocialPostItem {
  source: string;
  author?: string | null;
  title?: string | null;
  content?: string | null;
  url?: string | null;
  score?: number | null;
  comments_count?: number | null;
  created_at: string;
}

export interface XpozTickerDetail {
  symbol: string;
  generated_at_utc: string;
  configured: boolean;
  mentions_24h: number;
  mention_growth_pct: number;
  sentiment_score: number;
  direction: string;
  twitter_mentions: number;
  reddit_mentions: number;
  posts: SocialPostItem[];
}

export interface StockOverviewCrossMarket {
  symbol: string;
  price: number;
  change_pct: number;
  iv_rank: number;
  volume: number;
  market_cap: number;
  bid?: number | null;
  ask?: number | null;
  high?: number | null;
  low?: number | null;
  data_source?: string;
}

async function parseJson<T>(res: Response, path: string): Promise<T> {
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${path} ${res.status}: ${t.slice(0, 240)}`);
  }
  return res.json() as Promise<T>;
}

const noStore: RequestInit = { cache: "no-store" };

export async function getHotEvents(limit = 30): Promise<{ events: HotEvent[] }> {
  const res = await fetch(`/api/cross-market/polymarket/hot?limit=${limit}`, noStore);
  return parseJson(res, "/api/cross-market/polymarket/hot");
}

export function hotEventTitle(event: HotEvent, locale: "zh" | "en"): string {
  if (locale === "zh") return event.title_zh || event.title_en;
  return event.title_en || event.title_zh;
}

export async function getXpozHot(limit = 15): Promise<XpozHotResponse> {
  const res = await fetch(`/api/cross-market/xpoz/hot?limit=${limit}`, noStore);
  return parseJson(res, "/api/cross-market/xpoz/hot");
}

export async function getCrossMarketQuote(symbol: string): Promise<StockOverviewCrossMarket> {
  const clean = encodeURIComponent(symbol.toUpperCase());
  const res = await fetch(`/api/cross-market/quote/${clean}`, noStore);
  return parseJson(res, `/api/cross-market/quote/${clean}`);
}

export async function getCrossMarketDiagnostics(): Promise<unknown> {
  const res = await fetch("/api/cross-market/diagnostics/data-sources", noStore);
  return parseJson(res, "/api/cross-market/diagnostics/data-sources");
}
