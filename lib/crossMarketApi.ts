/**
 * Cross-market HTTP client. All paths hit Next.js route handlers
 * that proxy to OPTIONS_AJI_BACKEND_URL (see app/api/cross-market/*).
 */

export interface HotEvent {
  event_id: string;
  title_zh: string;
  event_type: string;
  event_time: string;
  polymarket_probability: number;
  related_ticker?: string | null;
  volume_24h?: number | null;
  liquidity?: number | null;
  slug?: string | null;
}

export interface BackendArbitrageOpportunity {
  event_id: string;
  question: string;
  polymarket_probability: number;
  related_ticker?: string | null;
  volume_24h?: number | null;
  liquidity?: number | null;
  slug?: string | null;
  event_type?: string;
}

export interface FeedItem {
  item_id: string;
  kind: string;
  source: string;
  timestamp: string;
  title: string;
  sentiment: string;
  urgency: string;
  affected_tickers: string[];
  ai_summary_zh: string;
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

export async function getHotEvents(): Promise<{ events: HotEvent[] }> {
  const res = await fetch("/api/cross-market/events/hot", noStore);
  return parseJson(res, "/api/cross-market/events/hot");
}

export async function scanArbitrage(): Promise<{ opportunities: BackendArbitrageOpportunity[] }> {
  const res = await fetch("/api/cross-market/scanner/arbitrage", noStore);
  return parseJson(res, "/api/cross-market/scanner/arbitrage");
}

export async function getCrossMarketFeed(): Promise<{ items: FeedItem[] }> {
  const res = await fetch("/api/cross-market/feed", noStore);
  return parseJson(res, "/api/cross-market/feed");
}

/** Same as getCrossMarketFeed — alias for ported pages. */
export async function getFeed(): Promise<{ items: FeedItem[] }> {
  return getCrossMarketFeed();
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
