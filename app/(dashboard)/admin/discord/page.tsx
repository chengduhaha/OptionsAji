"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type AuthorStat = {
  author: string;
  message_count: number;
  last_seen_utc: string;
};

type SettingsPayload = {
  settings: Record<string, string[]>;
  known_slots?: string[];
  slot_labels?: Record<string, string>;
};

const SLOT_ORDER = [
  "aji_insights",
  "feed",
  "twitter_kol",
  "ai",
  "messages",
] as const;

const SLOT_LABELS_FALLBACK: Record<string, string> = {
  aji_insights: "市场洞察",
  feed: "统一信息流",
  twitter_kol: "Twitter美股大牛追踪",
  ai: "AI 分析师",
  messages: "Discord 存档 / Messages API",
};

function parseError(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "请求失败";
  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "object" && detail && "message" in detail) {
    return String((detail as { message: unknown }).message);
  }
  return "请求失败";
}

function formatTime(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return iso;
  }
}

export default function AdminDiscordPage() {
  const { token, user, ready, isAdmin } = useAuth();
  const router = useRouter();
  const [authors, setAuthors] = useState<AuthorStat[]>([]);
  const [settings, setSettings] = useState<Record<string, string[]>>({});
  const [slotLabels, setSlotLabels] = useState<Record<string, string>>(SLOT_LABELS_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [refreshingAuthors, setRefreshingAuthors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const loadAuthors = useCallback(async () => {
    if (!token) return;
    setRefreshingAuthors(true);
    try {
      const res = await fetch("/api/admin/discord/authors", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const raw = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(parseError(raw));
      const list = Array.isArray((raw as { authors?: unknown }).authors)
        ? ((raw as { authors: AuthorStat[] }).authors)
        : [];
      setAuthors(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "加载 Author 失败");
    } finally {
      setRefreshingAuthors(false);
    }
  }, [token]);

  const loadSettings = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/site/discord-menu-authors", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const raw = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(parseError(raw));
    const data = raw as SettingsPayload;
    const next: Record<string, string[]> = {};
    for (const slot of SLOT_ORDER) {
      const picked = data.settings?.[slot];
      next[slot] = Array.isArray(picked) ? [...picked] : [];
    }
    setSettings(next);
    if (data.slot_labels) setSlotLabels({ ...SLOT_LABELS_FALLBACK, ...data.slot_labels });
  }, [token]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadAuthors(), loadSettings()]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [token, loadAuthors, loadSettings]);

  useEffect(() => {
    if (!ready) return;
    if (!user) return;
    if (!isAdmin) {
      router.replace("/");
      return;
    }
    void load();
  }, [ready, user, isAdmin, router, load]);

  function toggleAuthor(slot: string, author: string) {
    setSettings((prev) => {
      const current = prev[slot] ?? [];
      const has = current.includes(author);
      const nextList = has ? current.filter((a) => a !== author) : [...current, author];
      return { ...prev, [slot]: nextList };
    });
    setSaved(false);
  }

  function clearSlot(slot: string) {
    setSettings((prev) => ({ ...prev, [slot]: [] }));
    setSaved(false);
  }

  async function save() {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/discord-menu-authors", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      });
      const raw = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(parseError(raw));
      const data = raw as SettingsPayload;
      const next: Record<string, string[]> = {};
      for (const slot of SLOT_ORDER) {
        const picked = data.settings?.[slot];
        next[slot] = Array.isArray(picked) ? [...picked] : [];
      }
      setSettings(next);
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (!ready || loading) {
    return <div className="p-6 text-[13px] text-muted-foreground">加载 Discord 来源配置…</div>;
  }

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Discord 来源管理</h1>
        <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
          按菜单配置 Discord 推文来源（author 白名单）。未勾选任何 author 时，该菜单显示全部来源。
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[12px] text-red">
          {error}
        </div>
      ) : null}
      {saved ? (
        <div className="rounded-lg border border-green/30 bg-green/10 px-3 py-2 text-[12px] text-green">
          已保存。各菜单将在下次刷新数据时应用新白名单。
        </div>
      ) : null}

      <section className="rounded-xl border border-border2 bg-panel2 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wide">
            当前可用 Author（来自 Discord 存档）
          </h2>
          <button
            type="button"
            onClick={() => void loadAuthors()}
            disabled={refreshingAuthors}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border2 px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshingAuthors ? "animate-spin" : ""}`} />
            刷新
          </button>
        </div>
        {authors.length === 0 ? (
          <p className="text-[12px] text-muted">暂无 Discord 消息。请确认 ingest 已运行。</p>
        ) : (
          <div className="space-y-2">
            {authors.map((row) => (
              <div
                key={row.author}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2"
              >
                <span className="text-[13px] text-foreground">{row.author}</span>
                <span className="text-[11px] text-muted font-mono">
                  {row.message_count} 条 · 最近 {formatTime(row.last_seen_utc)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {SLOT_ORDER.map((slot) => {
        const picked = settings[slot] ?? [];
        const label = slotLabels[slot] ?? slot;
        return (
          <section key={slot} className="rounded-xl border border-border2 bg-panel2 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-[13px] font-medium text-foreground">{label}</h2>
                <p className="text-[11px] text-muted font-mono">{slot}</p>
              </div>
              <button
                type="button"
                onClick={() => clearSlot(slot)}
                className="text-[11px] text-muted hover:text-gold"
              >
                清空（显示全部）
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              已选 {picked.length} 个 author
              {picked.length === 0 ? " — 当前不过滤，显示全部来源" : ""}
            </p>
            {authors.length === 0 ? (
              <p className="text-[12px] text-muted">无可用 author</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {authors.map((row) => (
                  <label
                    key={`${slot}-${row.author}`}
                    className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-foreground/[0.03] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={picked.includes(row.author)}
                      onChange={() => toggleAuthor(slot, row.author)}
                      className="mt-0.5 h-4 w-4 accent-gold"
                    />
                    <span className="text-[12px] text-foreground leading-5">{row.author}</span>
                  </label>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="px-4 py-2 rounded-lg bg-gold/20 border border-gold text-gold text-[13px] font-medium hover:bg-gold/30 disabled:opacity-50"
        >
          {saving ? "保存中…" : "保存配置"}
        </button>
        <Link
          href="/admin/menu"
          className="px-4 py-2 rounded-lg border border-border2 text-[13px] text-muted-foreground hover:text-foreground"
        >
          菜单管理
        </Link>
      </div>
    </div>
  );
}
