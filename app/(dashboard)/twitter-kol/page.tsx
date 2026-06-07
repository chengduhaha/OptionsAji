"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, AtSign } from "lucide-react";

type TimelineItem = {
  id: string;
  created_at_utc: string;
  title: string;
  body: string;
  tickers: string[];
  author?: string | null;
  raw_body?: string | null;
  bullets_zh?: string[] | null;
  risk_note_zh?: string | null;
};

type TimelineEnvelope = {
  items: TimelineItem[];
  generated_at_utc: string;
  menu_slot: string;
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return iso;
  }
}

export default function TwitterKolPage() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        menu_slot: "twitter_kol",
        hours: "168",
        limit: "80",
      });
      const res = await fetch(`/api/discord/timeline?${params}`, { cache: "no-store" });
      const raw = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof raw === "object" && raw && "detail" in raw
            ? String((raw as { detail?: { message?: string } }).detail?.message ?? "加载失败")
            : "加载失败";
        throw new Error(msg);
      }
      const data = raw as TimelineEnvelope;
      setItems(Array.isArray(data.items) ? data.items : []);
      setUpdatedAt(data.generated_at_utc ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "加载失败");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-[900px] space-y-5 p-4 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AtSign className="h-4 w-4 text-gold" />
            Twitter 美股大牛追踪
          </div>
          <h1 className="mt-2 text-xl font-semibold text-foreground">精选推特来源</h1>
          <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
            展示管理员在「Discord 来源管理」中为该菜单配置的 TweetShift 来源。未配置白名单时显示全部来源。
          </p>
          {updatedAt ? (
            <p className="mt-1 text-[10px] text-muted">更新于 {formatTime(updatedAt)}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold hover:bg-gold/15 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          刷新
        </button>
      </header>

      {error ? (
        <div className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[12px] text-red">
          {error}
        </div>
      ) : null}

      {loading && items.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">加载中…</p>
      ) : items.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          暂无推文。请在管理后台配置 author 白名单，或等待 Discord ingest 同步。
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-border2 bg-panel2 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
                <span className="text-gold">{item.author ?? "Discord"}</span>
                <time className="font-mono">{formatTime(item.created_at_utc)}</time>
              </div>
              <h2 className="mt-2 text-[15px] font-medium text-foreground">{item.title}</h2>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground whitespace-pre-wrap">
                {item.body}
              </p>
              {item.bullets_zh && item.bullets_zh.length > 0 ? (
                <ul className="mt-3 space-y-1 text-[12px] text-muted-foreground list-disc pl-4">
                  {item.bullets_zh.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
              {item.risk_note_zh ? (
                <p className="mt-2 text-[11px] text-muted">{item.risk_note_zh}</p>
              ) : null}
              {item.tickers.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tickers.slice(0, 8).map((sym) => (
                    <span
                      key={`${item.id}-${sym}`}
                      className="rounded border border-border2 px-2 py-0.5 font-mono text-[10px] text-muted"
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
