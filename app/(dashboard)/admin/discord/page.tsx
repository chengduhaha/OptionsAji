"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { DiscordAuthorProfileContract } from "@/lib/contracts";

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
  const err = (payload as { error?: { message?: unknown } }).error;
  if (err && typeof err.message === "string" && err.message.trim()) {
    return err.message;
  }
  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

type ProfileDraft = {
  display_name: string;
  bio_zh: string;
  twitter_handle: string;
};

function AuthorProfileRow({
  profile,
  token,
  onUpdated,
}: {
  profile: DiscordAuthorProfileContract;
  token: string;
  onUpdated: (next: DiscordAuthorProfileContract) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<ProfileDraft>({
    display_name: profile.display_name,
    bio_zh: profile.bio_zh ?? "",
    twitter_handle: profile.twitter_handle ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  useEffect(() => {
    setDraft({
      display_name: profile.display_name,
      bio_zh: profile.bio_zh ?? "",
      twitter_handle: profile.twitter_handle ?? "",
    });
  }, [profile]);

  async function saveProfile() {
    setSaving(true);
    setRowError(null);
    try {
      const res = await fetch("/api/admin/discord/author-profiles", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author: profile.author,
          display_name: draft.display_name.trim() || undefined,
          bio_zh: draft.bio_zh.trim() || undefined,
          twitter_handle: draft.twitter_handle.trim().replace(/^@/, "") || undefined,
        }),
      });
      const raw = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(parseError(raw));
      onUpdated(raw as DiscordAuthorProfileContract);
    } catch (e: unknown) {
      setRowError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    setRowError(null);
    try {
      const form = new FormData();
      form.set("author", profile.author);
      form.set("file", file);
      const res = await fetch("/api/admin/discord/author-profiles/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const raw = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(parseError(raw));
      onUpdated(raw as DiscordAuthorProfileContract);
    } catch (e: unknown) {
      setRowError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  const label = draft.display_name || profile.display_name || profile.author;

  return (
    <div className="rounded-lg border border-border2 bg-foreground/[0.02] p-3 space-y-3">
      <div className="flex flex-wrap items-start gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-glass-border">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${profile.avatar_url}?t=${profile.last_seen_utc}`}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-panel2 text-[11px] font-semibold text-gold">
              {initials(label)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-foreground">{profile.author}</p>
          <p className="text-[11px] text-muted font-mono">
            {profile.message_count} 条 · 最近 {formatTime(profile.last_seen_utc)}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadAvatar(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-lg border border-border2 px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <Upload className={`h-3.5 w-3.5 ${uploading ? "animate-pulse" : ""}`} />
            {uploading ? "上传中…" : "上传头像"}
          </button>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <label className="block text-[11px] text-muted">
          展示名
          <input
            value={draft.display_name}
            onChange={(e) => setDraft((d) => ({ ...d, display_name: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-border2 bg-panel px-2.5 py-1.5 text-[12px] text-foreground"
          />
        </label>
        <label className="block text-[11px] text-muted">
          Twitter @handle
          <input
            value={draft.twitter_handle}
            onChange={(e) => setDraft((d) => ({ ...d, twitter_handle: e.target.value }))}
            placeholder="不含 @"
            className="mt-1 w-full rounded-lg border border-border2 bg-panel px-2.5 py-1.5 text-[12px] text-foreground"
          />
        </label>
      </div>
      <label className="block text-[11px] text-muted">
        简介（中文）
        <textarea
          value={draft.bio_zh}
          onChange={(e) => setDraft((d) => ({ ...d, bio_zh: e.target.value }))}
          rows={2}
          className="mt-1 w-full resize-y rounded-lg border border-border2 bg-panel px-2.5 py-1.5 text-[12px] text-foreground"
        />
      </label>

      {rowError ? <p className="text-[11px] text-red">{rowError}</p> : null}

      <button
        type="button"
        disabled={saving}
        onClick={() => void saveProfile()}
        className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-[11px] text-gold hover:bg-gold/15 disabled:opacity-50"
      >
        {saving ? "保存中…" : "保存资料"}
      </button>
    </div>
  );
}

export default function AdminDiscordPage() {
  const { token, user, ready, isAdmin } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<DiscordAuthorProfileContract[]>([]);
  const [settings, setSettings] = useState<Record<string, string[]>>({});
  const [slotLabels, setSlotLabels] = useState<Record<string, string>>(SLOT_LABELS_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [refreshingProfiles, setRefreshingProfiles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const loadProfiles = useCallback(async () => {
    if (!token) return;
    setRefreshingProfiles(true);
    try {
      const res = await fetch("/api/admin/discord/author-profiles", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const raw = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(parseError(raw));
      const list = Array.isArray((raw as { items?: unknown }).items)
        ? ((raw as { items: DiscordAuthorProfileContract[] }).items)
        : [];
      setProfiles(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "加载博主资料失败");
    } finally {
      setRefreshingProfiles(false);
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
      await Promise.all([loadProfiles(), loadSettings()]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [token, loadProfiles, loadSettings]);

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

  function updateProfile(next: DiscordAuthorProfileContract) {
    setProfiles((prev) => prev.map((p) => (p.author === next.author ? next : p)));
  }

  if (!ready || loading) {
    return <div className="p-6 text-[13px] text-muted-foreground">加载 Discord 来源配置…</div>;
  }

  return (
    <div className="h-full overflow-y-auto p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Discord 来源管理</h1>
        <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
          按菜单配置 Discord 推文来源（author 白名单），并为每位博主上传头像与资料。
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
            博主资料与头像
          </h2>
          <button
            type="button"
            onClick={() => void loadProfiles()}
            disabled={refreshingProfiles}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border2 px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshingProfiles ? "animate-spin" : ""}`} />
            刷新
          </button>
        </div>
        {profiles.length === 0 ? (
          <p className="text-[12px] text-muted">暂无 Discord 消息。请确认 ingest 已运行。</p>
        ) : (
          <div className="space-y-3">
            {profiles.map((profile) => (
              <AuthorProfileRow
                key={profile.author}
                profile={profile}
                token={token ?? ""}
                onUpdated={updateProfile}
              />
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
            {profiles.length === 0 ? (
              <p className="text-[12px] text-muted">无可用 author</p>
            ) : (
              <div className="space-y-1.5">
                {profiles.map((row) => (
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
                    <span className="text-[12px] text-foreground leading-5">
                      {row.display_name || row.author}
                    </span>
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
