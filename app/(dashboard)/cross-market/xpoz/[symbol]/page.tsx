"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { XpozTickerDetail } from "@/lib/crossMarketApi";

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

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return iso;
  }
}

export default function XpozTickerDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState<XpozTickerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "twitter" | "reddit">("all");

  useEffect(() => {
    let cancelled = false;
    void params.then((p) => {
      const sym = p.symbol.toUpperCase();
      setSymbol(sym);
      setLoading(true);
      fetch(`/api/cross-market/xpoz/ticker/${encodeURIComponent(sym)}`, { cache: "no-store" })
        .then((res) => res.json() as Promise<XpozTickerDetail>)
        .then((json) => {
          if (!cancelled) setData(json);
        })
        .catch(() => {
          if (!cancelled) setData(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  const filteredPosts = useMemo(() => {
    const posts = data?.posts ?? [];
    if (tab === "all") return posts;
    return posts.filter((p) => p.source === tab);
  }, [data?.posts, tab]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Link href="/cross-market/xpoz" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" />
        返回社交热度
      </Link>

      <header className="space-y-2 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold font-mono text-foreground">{symbol}</h1>
          {data ? (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              {DIR_ZH[data.direction] ?? data.direction} · {data.sentiment_score}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">近 24h 社交提及与帖文时间线</p>
      </header>

      {loading ? (
        <p className="text-sm text-muted-foreground py-12 text-center">加载中…</p>
      ) : !data || !data.configured ? (
        <p className="text-sm text-muted-foreground py-12 text-center rounded-xl border border-dashed border-border">
          暂无社交数据
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["24h 提及", formatMentions(data.mentions_24h)],
              ["环比", `${data.mention_growth_pct > 0 ? "+" : ""}${data.mention_growth_pct.toFixed(1)}%`],
              ["X", formatMentions(data.twitter_mentions)],
              ["Reddit", formatMentions(data.reddit_mentions)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-card/60 p-4">
                <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
                <div className="text-lg font-mono font-semibold mt-1">{value}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-glass border border-glass-border w-fit">
            {([
              ["all", "全部"],
              ["twitter", "X"],
              ["reddit", "Reddit"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  tab === id ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">该分类下暂无帖文</p>
          ) : (
            <ul className="space-y-3">
              {filteredPosts.map((post, idx) => {
                const body = [post.title, post.content].filter(Boolean).join(" — ");
                return (
                  <li key={`${post.source}-${post.created_at}-${idx}`} className="rounded-xl border border-border bg-card/50 p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span className="uppercase font-semibold text-primary">{post.source}</span>
                      <span>{formatTime(post.created_at)}</span>
                    </div>
                    {post.author ? <div className="text-xs font-medium text-foreground">@{post.author}</div> : null}
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{body || "（无正文）"}</p>
                    <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                      {post.score != null ? <span>↑ {post.score}</span> : null}
                      {post.comments_count != null ? <span>💬 {post.comments_count}</span> : null}
                      {post.url ? (
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                          原文 <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex gap-3">
            <Link href={`/stock/${symbol}/overview`} className="text-sm text-primary hover:underline">
              查看 {symbol} 个股深度 →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
