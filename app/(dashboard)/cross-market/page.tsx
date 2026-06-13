import Link from "next/link";

import type { HotEvent } from "@/lib/crossMarket";
import { getServerOrigin } from "@/lib/serverOrigin";

function formatVolume(v: number | null | undefined): string {
  if (v == null || v <= 0) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(Math.round(v));
}

export default async function CrossMarketPolymarketPage() {
  const origin = await getServerOrigin();
  const res = await fetch(`${origin}/api/cross-market/polymarket/hot?limit=20`, { cache: "no-store" });
  const data = (res.ok ? await res.json() : { events: [] }) as { events: HotEvent[] };
  const events = data.events ?? [];
  const withTicker = events.filter((e) => e.related_ticker).length;
  const totalVolume = events.reduce((sum, e) => sum + (e.volume_24h ?? 0), 0);

  const cards = [
    { title: "热点数量", value: `${events.length}`, hint: "美股主题过滤" },
    { title: "含标的", value: `${withTicker}`, hint: "$SYMBOL / (NVDA)" },
    { title: "合计成交", value: formatVolume(totalVolume), hint: "24h 成交量加总" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <header className="space-y-2 border-b border-border pb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Polymarket</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">预测市场</h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          与美股相关的 Polymarket 预测市场：宏观（Fed）、财报、单股主题等，按成交量排序。与社交热度页独立。
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <article key={card.title} className="rounded-xl border border-border bg-card/80 p-5">
            <h3 className="text-xs font-medium text-primary mb-1">{card.title}</h3>
            <p className="text-2xl font-mono font-semibold tabular-nums">{card.value}</p>
            <p className="text-[11px] text-muted-foreground/80 mt-2">{card.hint}</p>
          </article>
        ))}
      </div>

      <article className="rounded-xl border border-border bg-card/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">热门市场</h2>
          <span className="text-[10px] text-muted-foreground uppercase">{events.length} 条</span>
        </div>
        <div className="p-5 space-y-1">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">暂无数据，请确认 Polymarket API 可访问。</p>
          ) : (
            events.map((event) => (
              <div key={event.event_id} className="rounded-lg hover:bg-background/50 px-3 py-3 transition-colors">
                <Link href={`/event/${encodeURIComponent(event.event_id)}`} className="font-medium text-primary hover:underline">
                  {event.title_zh}
                </Link>
                <div className="text-xs text-muted-foreground mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                  <span>Yes {(event.polymarket_probability * 100).toFixed(1)}%</span>
                  <span>·</span>
                  <span>24h {formatVolume(event.volume_24h)}</span>
                  {event.related_ticker ? (
                    <>
                      <span>·</span>
                      <Link href={`/stock/${event.related_ticker}/overview`} className="text-primary hover:underline">
                        {event.related_ticker}
                      </Link>
                    </>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </article>

      <Link href="/cross-market/xpoz" className="inline-flex text-sm text-primary hover:underline">
        社交热度（Xpoz）→
      </Link>
    </div>
  );
}
