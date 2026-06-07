"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, AtSign } from "lucide-react";
import KolAvatarStrip from "@/components/twitter-kol/KolAvatarStrip";
import KolDetailDrawer from "@/components/twitter-kol/KolDetailDrawer";
import KolTimelineCard from "@/components/twitter-kol/KolTimelineCard";
import type {
  DiscordKolHubItemContract,
  DiscordTimelineItemContract,
} from "@/lib/contracts";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return iso;
  }
}

function parseError(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "加载失败";
  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "object" && detail && "message" in detail) {
    return String((detail as { message: unknown }).message);
  }
  if ("error" in (payload as object)) {
    const err = (payload as { error?: { message?: string } }).error;
    if (err?.message) return err.message;
  }
  return "加载失败";
}

export default function TwitterKolPage() {
  const [hubEntries, setHubEntries] = useState<DiscordKolHubItemContract[]>([]);
  const [items, setItems] = useState<DiscordTimelineItemContract[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<Set<string>>(new Set());
  const [singleSelectMode, setSingleSelectMode] = useState(false);
  const [detailEntry, setDetailEntry] = useState<DiscordKolHubItemContract | null>(null);
  const [loadingHub, setLoadingHub] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [nextBefore, setNextBefore] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const hubByAuthor = useMemo(() => {
    const map = new Map<string, DiscordKolHubItemContract>();
    for (const entry of hubEntries) map.set(entry.author, entry);
    return map;
  }, [hubEntries]);

  const loadHub = useCallback(async () => {
    setLoadingHub(true);
    try {
      const params = new URLSearchParams({ menu_slot: "twitter_kol", hours: "168" });
      const res = await fetch(`/api/discord/kol-hub?${params}`, { cache: "no-store" });
      const raw = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(parseError(raw));
      const list = Array.isArray((raw as { items?: unknown }).items)
        ? ((raw as { items: DiscordKolHubItemContract[] }).items)
        : [];
      setHubEntries(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "加载博主列表失败");
      setHubEntries([]);
    } finally {
      setLoadingHub(false);
    }
  }, []);

  const fetchTimeline = useCallback(
    async (opts?: { append?: boolean; before?: string | null }) => {
      const append = opts?.append ?? false;
      if (append) setLoadingMore(true);
      else setLoadingTimeline(true);

      try {
        const params = new URLSearchParams({
          menu_slot: "twitter_kol",
          hours: "168",
          limit: "30",
        });
        const authors = Array.from(selectedAuthors);
        if (authors.length > 0) params.set("authors", authors.join(","));
        if (opts?.before) params.set("before_timestamp", opts.before);

        const res = await fetch(`/api/discord/timeline?${params}`, { cache: "no-store" });
        const raw = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(parseError(raw));

        const data = raw as {
          items?: DiscordTimelineItemContract[];
          generated_at_utc?: string;
          next_before?: string | null;
          has_more?: boolean;
        };
        const page = Array.isArray(data.items) ? data.items : [];
        setItems((prev) => (append ? [...prev, ...page] : page));
        setUpdatedAt(data.generated_at_utc ?? null);
        setNextBefore(data.next_before ?? null);
        setHasMore(Boolean(data.has_more));
        setError(null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "加载动态失败");
        if (!append) setItems([]);
      } finally {
        if (append) setLoadingMore(false);
        else setLoadingTimeline(false);
      }
    },
    [selectedAuthors],
  );

  const refreshAll = useCallback(async () => {
    await loadHub();
    await fetchTimeline();
  }, [loadHub, fetchTimeline]);

  useEffect(() => {
    void loadHub();
  }, [loadHub]);

  useEffect(() => {
    void fetchTimeline();
  }, [fetchTimeline]);

  function toggleAuthor(author: string) {
    setSelectedAuthors((prev) => {
      const next = new Set(prev);
      if (singleSelectMode) {
        if (next.has(author)) {
          next.clear();
        } else {
          next.clear();
          next.add(author);
        }
      } else if (next.has(author)) {
        next.delete(author);
      } else {
        next.add(author);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedAuthors(new Set());
  }

  function openDetailByAuthor(author: string) {
    const entry = hubByAuthor.get(author);
    if (entry) setDetailEntry(entry);
  }

  const loading = loadingHub || loadingTimeline;

  return (
    <div className="mx-auto max-w-[900px] space-y-5 p-4 md:p-6">
      <header className="border-b border-gold/20 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AtSign className="h-4 w-4 text-gold" />
              美股大牛追踪
            </div>
            <h1 className="mt-2 text-xl font-semibold text-foreground">精选市场观点</h1>
            {updatedAt ? (
              <p className="mt-1 text-[10px] text-muted">更新于 {formatTime(updatedAt)}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void refreshAll()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold hover:bg-gold/15 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[12px] text-red">
          {error}
        </div>
      ) : null}

      {!loadingHub && hubEntries.length > 0 ? (
        <KolAvatarStrip
          entries={hubEntries}
          selectedAuthors={selectedAuthors}
          singleSelectMode={singleSelectMode}
          onToggleAuthor={toggleAuthor}
          onSelectAll={selectAll}
          onToggleMode={() => setSingleSelectMode((v) => !v)}
          onOpenDetail={setDetailEntry}
        />
      ) : null}

      {loadingTimeline && items.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">加载中…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-glass-border bg-panel/60 px-4 py-8 text-center">
          <p className="text-[14px] text-muted-foreground">暂无动态，请稍后再来。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <KolTimelineCard
              key={item.id}
              item={item}
              onAuthorClick={openDetailByAuthor}
            />
          ))}
          {hasMore ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => void fetchTimeline({ append: true, before: nextBefore })}
                className="rounded-lg border border-glass-border px-4 py-2 text-[13px] text-muted-foreground hover:border-gold/40 hover:text-gold disabled:opacity-50"
              >
                {loadingMore ? "加载中…" : "加载更多"}
              </button>
            </div>
          ) : null}
        </div>
      )}

      <KolDetailDrawer entry={detailEntry} onClose={() => setDetailEntry(null)} />
    </div>
  );
}
