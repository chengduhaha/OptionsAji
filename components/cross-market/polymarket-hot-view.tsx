"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { clsx } from "clsx";
import { ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import type { HotEvent } from "@/lib/crossMarketApi";

const EVENT_TYPE_ZH: Record<string, string> = {
  earnings: "财报",
  macro_release: "宏观",
  geopolitical: "地缘",
  equity: "个股",
};

function formatVolume(v: number | null | undefined): string {
  if (v == null || v <= 0) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(Math.round(v));
}

function tickersForEvent(event: HotEvent): string[] {
  if (event.related_tickers?.length) return event.related_tickers;
  if (event.related_ticker) return [event.related_ticker];
  return [];
}

interface PolymarketHotViewProps {
  events: HotEvent[];
}

export function PolymarketHotView({ events }: PolymarketHotViewProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [showTickers, setShowTickers] = useState(false);

  const withTicker = events.filter((e) => tickersForEvent(e).length > 0);
  const totalVolume = events.reduce((sum, e) => sum + (e.volume_24h ?? 0), 0);
  const maxVolume = Math.max(...events.map((e) => e.volume_24h ?? 0), 1);

  const tickerRows = withTicker.flatMap((event) =>
    tickersForEvent(event).map((ticker) => ({
      ticker,
      title: event.title_zh,
      eventId: event.event_id,
    })),
  );

  const scrollToList = () => {
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <header className="space-y-2 border-b border-border pb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Polymarket</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">Polymarket 热点</h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          与美股相关的 Polymarket 预测市场：宏观（Fed）、财报、单股主题等，按 24h 成交量排序。
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={scrollToList}
          className="rounded-xl border border-border bg-card/80 p-5 text-left hover:border-primary/30 hover:bg-card transition-colors"
        >
          <h3 className="text-xs font-medium text-primary mb-1">热点数量</h3>
          <p className="text-2xl font-mono font-semibold tabular-nums">{events.length}</p>
          <p className="text-[11px] text-muted-foreground/80 mt-2">点击查看完整列表 ↓</p>
        </button>

        <button
          type="button"
          onClick={() => setShowTickers((v) => !v)}
          className={clsx(
            "rounded-xl border bg-card/80 p-5 text-left transition-colors",
            showTickers ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/30",
          )}
        >
          <h3 className="text-xs font-medium text-primary mb-1">含标的</h3>
          <p className="text-2xl font-mono font-semibold tabular-nums">{withTicker.length}</p>
          <p className="text-[11px] text-muted-foreground/80 mt-2 flex items-center gap-1">
            {showTickers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showTickers ? "收起标的列表" : "展开查看所有标的"}
          </p>
        </button>

        <article className="rounded-xl border border-border bg-card/80 p-5">
          <h3 className="text-xs font-medium text-primary mb-1">合计成交</h3>
          <p className="text-2xl font-mono font-semibold tabular-nums">{formatVolume(totalVolume)}</p>
          <p className="text-[11px] text-muted-foreground/80 mt-2">24h 成交量加总</p>
        </article>
      </div>

      {showTickers && (
        <div className="rounded-xl border border-primary/20 bg-card/60 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">关联标的明细</h2>
          {tickerRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">当前热点中未识别到 $SYMBOL 或 (TICKER) 格式标的。</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {tickerRows.map((row) => (
                <li
                  key={`${row.eventId}-${row.ticker}`}
                  className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-xs"
                >
                  <Link href={`/stock/${row.ticker}/overview`} className="font-mono font-bold text-primary hover:underline shrink-0">
                    {row.ticker}
                  </Link>
                  <Link href={`/event/${encodeURIComponent(row.eventId)}`} className="text-muted-foreground truncate hover:text-foreground">
                    {row.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div ref={listRef} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            热门市场
          </h2>
          <span className="text-[10px] text-muted-foreground uppercase">{events.length} 条</span>
        </div>

        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center rounded-xl border border-dashed border-border">
            暂无数据，请确认 Polymarket API 可访问。
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {events.map((event) => {
              const prob = event.polymarket_probability * 100;
              const vol = event.volume_24h ?? 0;
              const volPct = maxVolume > 0 ? (vol / maxVolume) * 100 : 0;
              const tickers = tickersForEvent(event);
              return (
                <article
                  key={event.event_id}
                  className="rounded-xl border border-border bg-card/60 p-5 hover:border-primary/25 hover:bg-card/80 transition-all"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                          {EVENT_TYPE_ZH[event.event_type] ?? event.event_type}
                        </span>
                        {tickers.map((t) => (
                          <Link
                            key={t}
                            href={`/stock/${t}/overview`}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-green/10 text-green border border-green/20 hover:underline"
                          >
                            {t}
                          </Link>
                        ))}
                      </div>
                      <Link
                        href={`/event/${encodeURIComponent(event.event_id)}`}
                        className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        {event.title_zh}
                      </Link>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-mono font-bold text-primary tabular-nums">{prob.toFixed(1)}%</div>
                      <div className="text-[10px] text-muted-foreground">Yes 概率</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>24h 成交 {formatVolume(vol)}</span>
                      <span>{volPct.toFixed(0)}% of top</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-background overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all"
                        style={{ width: `${Math.max(volPct, 2)}%` }}
                      />
                    </div>
                    <div className="h-2 rounded-full bg-background overflow-hidden flex">
                      <div className="bg-green/70" style={{ width: `${prob}%` }} />
                      <div className="flex-1 bg-red/40" />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Yes</span>
                      <span>No</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Link href="/cross-market/xpoz" className="inline-flex text-sm text-primary hover:underline">
        社交热度 →
      </Link>
    </div>
  );
}
