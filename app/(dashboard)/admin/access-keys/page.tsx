"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  type AccessKeyAdminRow,
  adminCreateAccessKey,
  adminDeleteAccessKey,
  adminExtendAccessKey,
  adminListAccessKeys,
  adminPatchAccessKey,
  adminRevokeAccessKey,
  adminUnbindAccessKeyDevice,
} from "@/lib/access-key-client";

function parseError(err: unknown): string {
  return err instanceof Error ? err.message : "操作失败";
}

export default function AdminAccessKeysPage() {
  const { token, user, ready, isAdmin } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<AccessKeyAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyPrefix, setBusyPrefix] = useState<string | null>(null);

  const [createType, setCreateType] = useState("trial");
  const [createDays, setCreateDays] = useState(7);
  const [createNote, setCreateNote] = useState("");
  const [creating, setCreating] = useState(false);
  const [issuedRawKey, setIssuedRawKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await adminListAccessKeys(token, { limit: 100 });
      setRows(list);
    } catch (e: unknown) {
      setError(parseError(e));
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

  async function handleCreate() {
    if (!token) return;
    setCreating(true);
    setError(null);
    setIssuedRawKey(null);
    try {
      const result = await adminCreateAccessKey(token, {
        key_type: createType,
        duration_days: createDays,
        note: createNote,
      });
      setIssuedRawKey(result.raw_key);
      await load();
    } catch (e: unknown) {
      setError(parseError(e));
    } finally {
      setCreating(false);
    }
  }

  async function withRowAction(prefix: string, action: () => Promise<unknown>) {
    setBusyPrefix(prefix);
    setError(null);
    try {
      await action();
      await load();
    } catch (e: unknown) {
      setError(parseError(e));
    } finally {
      setBusyPrefix(null);
    }
  }

  if (!ready || !user || !isAdmin) {
    return <div className="p-6 text-muted text-[13px]">{!ready ? "加载…" : "无权限访问"}</div>;
  }

  return (
    <div className="h-full overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[17px] font-semibold text-foreground">Access Key 管理</h1>
          <p className="text-[12px] text-muted mt-1">创建、延期、撤销与设备解绑。完整 Key 仅在创建时显示一次。</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-glass-border text-[12px] hover:border-primary/30 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            刷新
          </button>
          <Link href="/admin/users" className="text-[12px] text-primary hover:underline">
            用户管理
          </Link>
        </div>
      </header>

      {error ? <p className="text-[12px] text-red">{error}</p> : null}

      <section className="rounded-xl border border-glass-border bg-glass/40 p-4 space-y-3">
        <h2 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
          <Plus className="w-4 h-4" />
          创建 Key
        </h2>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="text-[11px] text-muted">
            类型
            <select
              value={createType}
              onChange={(e) => setCreateType(e.target.value)}
              className="mt-1 block rounded-lg border border-glass-border bg-background/80 px-2 py-1.5 text-[12px]"
            >
              <option value="trial">trial</option>
              <option value="paid">paid</option>
              <option value="internal">internal</option>
            </select>
          </label>
          <label className="text-[11px] text-muted">
            有效天数
            <input
              type="number"
              min={1}
              max={366}
              value={createDays}
              onChange={(e) => setCreateDays(Number(e.target.value))}
              className="mt-1 block w-24 rounded-lg border border-glass-border bg-background/80 px-2 py-1.5 text-[12px] font-mono"
            />
          </label>
          <label className="text-[11px] text-muted flex-1 min-w-[200px]">
            备注
            <input
              value={createNote}
              onChange={(e) => setCreateNote(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-glass-border bg-background/80 px-2 py-1.5 text-[12px]"
            />
          </label>
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={creating}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium disabled:opacity-50"
          >
            {creating ? "创建中…" : "生成"}
          </button>
        </div>
        {issuedRawKey ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
            <p className="text-[11px] text-amber-200/90">请立即复制保存，此 Key 不会再次显示：</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] font-mono break-all text-foreground">{issuedRawKey}</code>
              <button
                type="button"
                onClick={() => void navigator.clipboard.writeText(issuedRawKey)}
                className="shrink-0 p-1.5 rounded border border-glass-border hover:border-primary/30"
                title="复制"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-glass-border overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center text-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-panel2 text-muted uppercase tracking-wide">
                <tr>
                  <th className="text-left px-3 py-2">Prefix</th>
                  <th className="text-left px-3 py-2">类型</th>
                  <th className="text-left px-3 py-2">状态</th>
                  <th className="text-left px-3 py-2">激活</th>
                  <th className="text-left px-3 py-2">剩余天</th>
                  <th className="text-left px-3 py-2">绑定</th>
                  <th className="text-left px-3 py-2">用量</th>
                  <th className="text-left px-3 py-2">备注</th>
                  <th className="text-left px-3 py-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key_prefix} className="border-t border-glass-border/60">
                    <td className="px-3 py-2 font-mono">{row.key_prefix}</td>
                    <td className="px-3 py-2">{row.key_type}</td>
                    <td className="px-3 py-2">{row.status}</td>
                    <td className="px-3 py-2">{row.is_activated ? "是" : "否"}</td>
                    <td className="px-3 py-2 font-mono">{row.days_remaining ?? "—"}</td>
                    <td className="px-3 py-2 max-w-[140px] truncate" title={row.bound_email ?? row.bound_device_id ?? ""}>
                      {row.bound_email ?? row.bound_device_id ?? "—"}
                    </td>
                    <td className="px-3 py-2 font-mono">{row.usage_count}</td>
                    <td className="px-3 py-2 max-w-[120px] truncate" title={row.note}>
                      {row.note || "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          disabled={busyPrefix === row.key_prefix}
                          onClick={() =>
                            void withRowAction(row.key_prefix, () =>
                              adminExtendAccessKey(token!, row.key_prefix, 30),
                            )
                          }
                          className="px-2 py-0.5 rounded border border-glass-border hover:border-primary/30 disabled:opacity-50"
                        >
                          +30天
                        </button>
                        <button
                          type="button"
                          disabled={busyPrefix === row.key_prefix}
                          onClick={() =>
                            void withRowAction(row.key_prefix, () =>
                              adminUnbindAccessKeyDevice(token!, row.key_prefix),
                            )
                          }
                          className="px-2 py-0.5 rounded border border-glass-border hover:border-primary/30 disabled:opacity-50"
                        >
                          解绑设备
                        </button>
                        <button
                          type="button"
                          disabled={busyPrefix === row.key_prefix || row.status === "revoked"}
                          onClick={() =>
                            void withRowAction(row.key_prefix, () =>
                              adminRevokeAccessKey(token!, row.key_prefix),
                            )
                          }
                          className="px-2 py-0.5 rounded border border-red/30 text-red hover:bg-red/10 disabled:opacity-50"
                        >
                          撤销
                        </button>
                        {!row.is_activated ? (
                          <button
                            type="button"
                            disabled={busyPrefix === row.key_prefix}
                            onClick={() => {
                              if (!window.confirm(`删除未激活 Key ${row.key_prefix}？`)) return;
                              void withRowAction(row.key_prefix, () =>
                                adminDeleteAccessKey(token!, row.key_prefix),
                              );
                            }}
                            className="px-2 py-0.5 rounded border border-red/30 text-red hover:bg-red/10 disabled:opacity-50"
                          >
                            删除
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={busyPrefix === row.key_prefix}
                            onClick={() => {
                              const note = window.prompt("更新备注", row.note);
                              if (note === null) return;
                              void withRowAction(row.key_prefix, () =>
                                adminPatchAccessKey(token!, row.key_prefix, { note }),
                              );
                            }}
                            className="px-2 py-0.5 rounded border border-glass-border hover:border-primary/30 disabled:opacity-50"
                          >
                            备注
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 ? (
              <p className="p-6 text-center text-[12px] text-muted">暂无 Access Key</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
