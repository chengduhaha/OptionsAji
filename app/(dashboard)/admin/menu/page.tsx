"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useNavVisibility } from "@/lib/nav-visibility-context";
import {
  KNOWN_NAV_IDS,
  NAV_GROUP_LABELS,
  NAV_ITEM_LABELS,
  type NavMenuId,
} from "@/lib/nav-visibility";

type Payload = {
  visibility: Record<string, boolean>;
  groups?: Record<string, string[]>;
};

function parseError(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "请求失败";
  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "object" && detail && "message" in detail) {
    return String((detail as { message: unknown }).message);
  }
  return "请求失败";
}

export default function AdminMenuPage() {
  const { token, user, ready, isAdmin } = useAuth();
  const { refresh: refreshNavVisibility } = useNavVisibility();
  const router = useRouter();
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/site/nav-visibility", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const raw = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(parseError(raw));
      const data = raw as Payload;
      const vis: Record<string, boolean> = {};
      for (const id of KNOWN_NAV_IDS) {
        vis[id] = data.visibility?.[id] !== false;
      }
      setVisibility(vis);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!ready) return;
    if (!user) return;
    if (!isAdmin) {
      router.replace("/");
      return;
    }
    void load();
  }, [ready, user, isAdmin, router, load]);

  function setItem(id: NavMenuId, on: boolean) {
    setVisibility((v) => ({ ...v, [id]: on }));
    setSaved(false);
  }

  function setGroup(groupKey: string, on: boolean) {
    const children = NAV_GROUP_LABELS[groupKey]?.childIds ?? [];
    setVisibility((v) => {
      const next = { ...v };
      for (const id of children) next[id] = on;
      return next;
    });
    setSaved(false);
  }

  function groupAllOn(groupKey: string): boolean {
    const children = NAV_GROUP_LABELS[groupKey]?.childIds ?? [];
    return children.every((id) => visibility[id] !== false);
  }

  async function save() {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/nav-visibility", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visibility }),
      });
      const raw = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(parseError(raw));
      const data = raw as Payload;
      const vis: Record<string, boolean> = {};
      for (const id of KNOWN_NAV_IDS) {
        vis[id] = data.visibility?.[id] !== false;
      }
      setVisibility(vis);
      setSaved(true);
      await refreshNavVisibility();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  const rootIds = KNOWN_NAV_IDS.filter(
    (id) => !Object.values(NAV_GROUP_LABELS).some((g) => g.childIds.includes(id)),
  );

  if (!ready || loading) {
    return (
      <div className="h-full overflow-y-auto p-6 text-muted-foreground text-[13px]">
        加载菜单配置…
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">菜单管理</h1>
        <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
          关闭后，普通用户将无法在侧栏看到对应入口，也无法直接访问该路径。管理员始终可见全部菜单。
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[12px] text-red">
          {error}
        </div>
      ) : null}
      {saved ? (
        <div className="rounded-lg border border-green/30 bg-green/10 px-3 py-2 text-[12px] text-green">
          已保存。普通用户刷新页面后生效。
        </div>
      ) : null}

      <section className="rounded-xl border border-border2 bg-panel2 p-4 space-y-3">
        <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wide">主菜单</h2>
        {rootIds.map((id) => (
          <label key={id} className="flex items-center justify-between gap-3 py-1.5">
            <span className="text-[13px] text-foreground">{NAV_ITEM_LABELS[id]}</span>
            <input
              type="checkbox"
              checked={visibility[id] !== false}
              onChange={(e) => setItem(id, e.target.checked)}
              className="h-4 w-4 accent-gold"
            />
          </label>
        ))}
      </section>

      {Object.entries(NAV_GROUP_LABELS).map(([groupKey, meta]) => (
        <section key={groupKey} className="rounded-xl border border-border2 bg-panel2 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wide">
              {meta.label}（整组）
            </h2>
            <input
              type="checkbox"
              checked={groupAllOn(groupKey)}
              onChange={(e) => setGroup(groupKey, e.target.checked)}
              className="h-4 w-4 accent-gold"
              aria-label={`${meta.label} 全部显示`}
            />
          </div>
          {meta.childIds.map((id) => (
            <label key={id} className="flex items-center justify-between gap-3 py-1.5 pl-2">
              <span className="text-[13px] text-foreground">{NAV_ITEM_LABELS[id]}</span>
              <input
                type="checkbox"
                checked={visibility[id] !== false}
                onChange={(e) => setItem(id, e.target.checked)}
                className="h-4 w-4 accent-gold"
              />
            </label>
          ))}
        </section>
      ))}

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
          href="/admin/users"
          className="px-4 py-2 rounded-lg border border-border2 text-[13px] text-muted-foreground hover:text-foreground"
        >
          用户管理
        </Link>
      </div>
    </div>
  );
}
