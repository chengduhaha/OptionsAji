"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, AtSign } from "lucide-react";
import KolAvatarStrip from "@/components/twitter-kol/KolAvatarStrip";
import KolDetailDrawer from "@/components/twitter-kol/KolDetailDrawer";
import KolTimelineCard from "@/components/twitter-kol/KolTimelineCard";
import { api } from "@/lib/api";
import type {
  DiscordKolHubItemContract,
  DiscordTimelineItemContract,
} from "@/lib/contracts";
import { LOCALE_CHANGE_EVENT } from "@/lib/i18n/context";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";

const KOL_CACHE_TTL_MS = 3 * 60 * 1000;
const hubCache = new Map<string, { data: DiscordKolHubItemContract[]; cachedAt: number }>();
const timelineCache = new Map<
  string,
  {
    items: DiscordTimelineItemContract[];
    updatedAt: string | null;
    nextBefore: string | null;
    hasMore: boolean;
    cachedAt: number;
  }
>();

function cacheFresh(cachedAt: number): boolean {
  return Date.now() - cachedAt < KOL_CACHE_TTL_MS;
}

function formatTime(iso: string, locale: Locale): string {
  try {
    return new Date(iso).toLocaleString(locale === "en" ? "en-US" : "zh-CN", { hour12: false });
  } catch {
    return iso;
  }
}

export default function TwitterKolPage() {
  const { locale, t } = useI18n();
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

  const loadHub = useCallback(async (opts?: { silent?: boolean }) => {
    const cacheKey = `hub:${locale}`;
    const cached = hubCache.get(cacheKey);
    if (cached && cacheFresh(cached.cachedAt)) {
      setHubEntries(cached.data);
      if (!opts?.silent) setLoadingHub(false);
    } else if (!opts?.silent) {
      setLoadingHub(true);
    }
    try {
      const data = await api.discord.kolHub({ menu_slot: "twitter_kol", hours: 168, locale });
      const list = data.items ?? [];
      hubCache.set(cacheKey, { data: list, cachedAt: Date.now() });
      setHubEntries(list);
    } catch (e: unknown) {
      if (!cached) {
        setError(e instanceof Error ? e.message : t("twitterKol.loadHubFailed"));
        setHubEntries([]);
      }
    } finally {
      setLoadingHub(false);
    }
  }, [locale, t]);

  const fetchTimeline = useCallback(
    async (opts?: { append?: boolean; before?: string | null; silent?: boolean }) => {
      const append = opts?.append ?? false;
      const authorsKey = Array.from(selectedAuthors).sort().join(",");
      const cacheKey = `timeline:${locale}:${authorsKey}:${opts?.before ?? "head"}`;
      const cached = !append ? timelineCache.get(cacheKey) : undefined;
      if (cached && cacheFresh(cached.cachedAt)) {
        setItems(cached.items);
        setUpdatedAt(cached.updatedAt);
        setNextBefore(cached.nextBefore);
        setHasMore(cached.hasMore);
        if (!opts?.silent) setLoadingTimeline(false);
      } else if (append) {
        setLoadingMore(true);
      } else if (!opts?.silent) {
        setLoadingTimeline(true);
      }

      try {
        const data = await api.discord.timeline({
          menu_slot: "twitter_kol",
          hours: 168,
          limit: 30,
          authors: Array.from(selectedAuthors),
          before_timestamp: opts?.before ?? undefined,
          locale,
        });
        const page = Array.isArray(data.items) ? data.items : [];
        if (append) {
          setItems((prev) => [...prev, ...page]);
        } else {
          setItems(page);
          timelineCache.set(cacheKey, {
            items: page,
            updatedAt: data.generated_at_utc ?? null,
            nextBefore: data.next_before ?? null,
            hasMore: Boolean(data.has_more),
            cachedAt: Date.now(),
          });
        }
        setUpdatedAt(data.generated_at_utc ?? null);
        setNextBefore(data.next_before ?? null);
        setHasMore(Boolean(data.has_more));
        setError(null);
      } catch (e: unknown) {
        if (!cached) {
          setError(e instanceof Error ? e.message : t("twitterKol.loadTimelineFailed"));
          if (!append) setItems([]);
        }
      } finally {
        if (append) setLoadingMore(false);
        else setLoadingTimeline(false);
      }
    },
    [locale, selectedAuthors, t],
  );

  const refreshAll = useCallback(async () => {
    hubCache.delete(`hub:${locale}`);
    timelineCache.clear();
    await Promise.all([loadHub(), fetchTimeline()]);
  }, [fetchTimeline, loadHub, locale]);

  useEffect(() => {
    void loadHub();
  }, [loadHub]);

  useEffect(() => {
    void fetchTimeline();
  }, [fetchTimeline]);

  useEffect(() => {
    const onLocaleChange = () => {
      void refreshAll();
    };
    window.addEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
  }, [refreshAll]);

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
              {t("twitterKol.eyebrow")}
            </div>
            <h1 className="mt-2 text-xl font-semibold text-foreground">{t("twitterKol.title")}</h1>
            {updatedAt ? (
              <p className="mt-1 text-[10px] text-muted">
                {formatMessage(t("twitterKol.updatedAt"), { time: formatTime(updatedAt, locale) })}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void refreshAll()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold hover:bg-gold/15 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("twitterKol.refresh")}
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
        <p className="text-[13px] text-muted-foreground">{t("twitterKol.loading")}</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-glass-border bg-panel/60 px-4 py-8 text-center">
          <p className="text-[14px] text-muted-foreground">{t("twitterKol.empty")}</p>
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
                {loadingMore ? t("twitterKol.loading") : t("twitterKol.loadMore")}
              </button>
            </div>
          ) : null}
        </div>
      )}

      <KolDetailDrawer entry={detailEntry} onClose={() => setDetailEntry(null)} />
    </div>
  );
}
