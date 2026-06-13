import Link from "next/link";

import type { HotEvent } from "@/lib/crossMarket";
import { getServerOrigin } from "@/lib/serverOrigin";

function formatVolume(v: number | null | undefined): string {
  if (v == null || v <= 0) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(Math.round(v));
}

export default async function CrossMarketHomePage() {
  const origin = await getServerOrigin();
  const res = await fetch(`${origin}/api/cross-market/events/hot`, { cache: "no-store" });
  const data = (res.ok ? await res.json() : { events: [] }) as { events: HotEvent[] };
  const events = data.events ?? [];
  const withTicker = events.filter((e) => e.related_ticker).length;
  const totalVolume = events.reduce((sum, e) => sum + (e.volume_24h ?? 0), 0);
  const topPm = events[0]?.polymarket_probability ?? 0;

  const cards = [
    {
      title: "热点数量",
      subtitle: "美股相关 Polymarket 市场",
      value: `${events.length}`,
      hint: "经关键词与 $TICKER 过滤",
    },
    {
      title: "含标的",
      subtitle: "可映射到美股代码",
      value: `${withTicker}`,
      hint: "仅识别 $SYMBOL 或 (NVDA) 形式",
    },
    {
      title: "合计成交",
      subtitle: "列表 24h 成交量加总",
      value: formatVolume(totalVolume),
      hint: "无成交量字段时显示 —",
    },
    {
      title: "榜首概率",
      subtitle: "排序首条 Yes 隐含概率",
      value: `${(topPm * 100).toFixed(1)}%`,
      hint: "来自 Polymarket outcomePrices",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <header className="space-y-2 border-b border-border pb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Cross-market</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">跨市场总览</h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          聚合与美股相关的 Polymarket 预测市场热点（宏观、财报、单股主题）。数据经 Next.js 代理至后端 Gamma API。
        </p>
        <p className="text-xs text-muted-foreground/80 max-w-3xl leading-relaxed">
          仅供教育与研究用途，不构成投资建议、交易建议、荐股、投顾服务或收益承诺；不提供经纪、订单执行、资金托管或资产管理服务。
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <article
            key={card.title}
            className="group relative rounded-xl border border-border bg-card/80 p-5 shadow-sm hover:border-primary/30 transition-colors"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-xs font-medium text-primary mb-1">{card.title}</h3>
            <p className="text-[11px] text-muted-foreground mb-3">{card.subtitle}</p>
            <p className="text-2xl font-mono font-semibold text-foreground tabular-nums">{card.value}</p>
            <p className="text-[11px] text-muted-foreground/80 mt-3 leading-snug">{card.hint}</p>
          </article>
        ))}
      </div>

      <article className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">美股相关预测市场</h2>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{events.length} 条</span>
        </div>
        <div className="p-5 space-y-1">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              暂无匹配市场。请确认后端可访问 Polymarket Gamma API。
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.event_id}
                className="rounded-lg border border-transparent hover:border-border hover:bg-background/50 px-3 py-3 transition-colors"
              >
                <div className="font-medium text-foreground">
                  <Link href={`/event/${encodeURIComponent(event.event_id)}`} className="text-primary hover:underline">
                    {event.title_zh}
                  </Link>
                </div>
                <div className="text-xs text-muted-foreground mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                  <span>Yes {(event.polymarket_probability * 100).toFixed(1)}%</span>
                  <span>·</span>
                  <span>24h 量 {formatVolume(event.volume_24h)}</span>
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

      <div className="flex flex-wrap gap-3">
        <Link
          href="/cross-market/scanner"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          市场列表
        </Link>
        <Link
          href="/cross-market/feed"
          className="inline-flex items-center px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-glass"
        >
          跨市场信息流
        </Link>
      </div>
    </div>
  );
}
