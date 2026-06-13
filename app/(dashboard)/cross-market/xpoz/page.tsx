import Link from "next/link";

import type { XpozHotItem } from "@/lib/crossMarket";
import { fetchServerJson } from "@/lib/serverDataFetch";

const DIR_ZH: Record<string, string> = {
  bullish: "偏多",
  bearish: "偏空",
  neutral: "中性",
};

function formatMentions(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default async function CrossMarketXpozPage() {
  const data = await fetchServerJson<{
    items: XpozHotItem[];
    configured: boolean;
    generated_at_utc?: string;
  }>(
    "/api/cross-market/xpoz/hot?limit=15",
    "/api/cross-market/xpoz/hot?limit=15",
    { items: [], configured: false },
  );
  const items = data.items ?? [];
  const totalMentions = items.reduce((sum, row) => sum + row.mentions_24h, 0);
  const bullish = items.filter((row) => row.direction === "bullish").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <header className="space-y-2 border-b border-border pb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Xpoz · Twitter / Reddit</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">社交热度</h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          扫描主流美股代码在 X（Twitter）与 Reddit 上的近 24h 提及量，按热度排名。与预测市场页独立，不做跨源对比。
        </p>
        <p className="text-xs text-muted-foreground/80 max-w-3xl leading-relaxed">
          需后端配置 <span className="font-mono text-primary">XPOZ_API_KEY</span>。缓存约 15 分钟。
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <article className="rounded-xl border border-border bg-card/80 p-5">
          <h3 className="text-xs font-medium text-primary mb-1">上榜标的</h3>
          <p className="text-2xl font-mono font-semibold tabular-nums">{items.length}</p>
        </article>
        <article className="rounded-xl border border-border bg-card/80 p-5">
          <h3 className="text-xs font-medium text-primary mb-1">合计提及</h3>
          <p className="text-2xl font-mono font-semibold tabular-nums">{formatMentions(totalMentions)}</p>
        </article>
        <article className="rounded-xl border border-border bg-card/80 p-5">
          <h3 className="text-xs font-medium text-primary mb-1">偏多标的</h3>
          <p className="text-2xl font-mono font-semibold tabular-nums">{bullish}</p>
        </article>
      </div>

      {!data.configured ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          未配置 Xpoz API Key，无法拉取社交热度。
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          暂无提及数据（可能为冷门时段或 Xpoz 限流）。
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="hidden md:grid grid-cols-[48px_80px_1fr_100px_100px_100px] gap-3 px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-card/40">
            <span>#</span>
            <span>代码</span>
            <span>样本帖文</span>
            <span className="text-right">24h 提及</span>
            <span className="text-right">情绪</span>
            <span className="text-right">环比</span>
          </div>
          <ul className="divide-y divide-border">
            {items.map((row) => (
              <li
                key={row.ticker}
                className="grid grid-cols-1 md:grid-cols-[48px_80px_1fr_100px_100px_100px] gap-2 md:gap-3 px-5 py-4 hover:bg-background/40 transition-colors"
              >
                <span className="font-mono text-lg font-bold text-primary">#{row.rank}</span>
                <Link href={`/stock/${row.ticker}/overview`} className="font-mono font-semibold text-primary hover:underline">
                  {row.ticker}
                </Link>
                <div className="text-xs text-muted-foreground leading-relaxed min-w-0">
                  {row.sample_posts.length > 0 ? (
                    <p className="line-clamp-2">{row.sample_posts[0]}</p>
                  ) : (
                    <span className="italic">无样本帖文</span>
                  )}
                  <p className="text-[10px] mt-1 text-muted-foreground/70">
                    X {formatMentions(row.twitter_mentions)} · Reddit {formatMentions(row.reddit_mentions)}
                  </p>
                </div>
                <span className="md:text-right font-mono tabular-nums text-sm">{formatMentions(row.mentions_24h)}</span>
                <span className="md:text-right text-sm">
                  {DIR_ZH[row.direction] ?? row.direction}{" "}
                  <span className="font-mono text-muted-foreground">({row.sentiment_score})</span>
                </span>
                <span
                  className={`md:text-right font-mono text-sm tabular-nums ${
                    row.mention_growth_pct > 0 ? "text-signal-green" : row.mention_growth_pct < 0 ? "text-destructive" : ""
                  }`}
                >
                  {row.mention_growth_pct > 0 ? "+" : ""}
                  {row.mention_growth_pct.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link href="/cross-market" className="inline-flex text-sm text-primary hover:underline">
        ← 预测市场（Polymarket）
      </Link>
    </div>
  );
}
