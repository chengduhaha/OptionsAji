"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/apiBase";

type UsageBucket = {
  calls: number;
  success_calls: number;
  failed_calls: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
};

type UsageRow = {
  id: string;
  provider: string;
  model: string;
  source: string;
  success: boolean;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number | null;
  latency_ms: number | null;
  error_code: string | null;
  created_at: string | null;
};

type UsagePayload = {
  window: string;
  total: UsageBucket;
  by_provider: Record<string, UsageBucket>;
  by_source: Record<string, UsageBucket>;
  recent: UsageRow[];
};

function parseError(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "请求失败";
  const obj = payload as Record<string, unknown>;
  const detail = obj.detail;
  if (typeof detail === "string") return detail;
  const error = obj.error;
  if (error && typeof error === "object") {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === "string") return message;
  }
  return "请求失败";
}

function fmtInt(value: number): string {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function fmtCost(value: number | null | undefined): string {
  if (!value) return "$0.000000";
  return `$${value.toFixed(6)}`;
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-glass-border bg-glass/40 p-4">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold text-foreground">{value}</div>
      {sub ? <div className="mt-1 text-[11px] text-muted">{sub}</div> : null}
    </div>
  );
}

export default function AdminLlmUsagePage() {
  const { token, user, ready, isAdmin } = useAuth();
  const router = useRouter();
  const [windowKey, setWindowKey] = useState("30d");
  const [data, setData] = useState<UsagePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/admin/llm-usage?window=${encodeURIComponent(windowKey)}&limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      if (!res.ok) throw new Error(parseError(raw));
      setData(raw?.data as UsagePayload);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [token, windowKey]);

  useEffect(() => {
    if (!ready) return;
    if (!user) return;
    if (!isAdmin) {
      router.replace("/");
      return;
    }
    void load();
  }, [ready, user, isAdmin, router, load]);

  if (!ready || !user || !isAdmin) {
    return <div className="p-6 text-muted text-[13px]">{!ready ? "加载…" : "无权限访问"}</div>;
  }

  const total = data?.total;

  return (
    <div className="h-full overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[17px] font-semibold text-foreground">Token 监控</h1>
          <p className="text-[12px] text-muted mt-1">统计后端 LLM 调用的 input/output token、失败次数和已知成本。</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={windowKey}
            onChange={(e) => setWindowKey(e.target.value)}
            className="rounded-lg border border-glass-border bg-background px-2 py-1.5 text-[12px]"
          >
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
            <option value="all">全部</option>
          </select>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-glass-border text-[12px] hover:border-primary/30 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            刷新
          </button>
          <Link href="/admin/access-keys" className="text-[12px] text-primary hover:underline">
            Access Key
          </Link>
        </div>
      </header>

      {error ? <p className="text-[12px] text-red">{error}</p> : null}
      {loading ? (
        <div className="p-8 flex justify-center text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : null}

      {total ? (
        <>
          <section className="grid gap-3 md:grid-cols-4">
            <Metric label="调用次数" value={fmtInt(total.calls)} sub={`失败 ${fmtInt(total.failed_calls)} 次`} />
            <Metric label="Input Tokens" value={fmtInt(total.input_tokens)} />
            <Metric label="Output Tokens" value={fmtInt(total.output_tokens)} />
            <Metric label="已知成本" value={fmtCost(total.cost_usd)} sub="provider 返回 usage.cost 时累计" />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-glass-border overflow-hidden">
              <div className="px-4 py-3 text-[13px] font-semibold">按 Provider</div>
              <table className="w-full text-[11px]">
                <thead className="bg-panel2 text-muted uppercase">
                  <tr>
                    <th className="text-left px-3 py-2">Provider</th>
                    <th className="text-right px-3 py-2">Calls</th>
                    <th className="text-right px-3 py-2">Tokens</th>
                    <th className="text-right px-3 py-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data?.by_provider ?? {}).map(([provider, row]) => (
                    <tr key={provider} className="border-t border-glass-border/60">
                      <td className="px-3 py-2">{provider}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmtInt(row.calls)}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmtInt(row.total_tokens)}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmtCost(row.cost_usd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-glass-border overflow-hidden">
              <div className="px-4 py-3 text-[13px] font-semibold">按功能来源</div>
              <table className="w-full text-[11px]">
                <thead className="bg-panel2 text-muted uppercase">
                  <tr>
                    <th className="text-left px-3 py-2">Source</th>
                    <th className="text-right px-3 py-2">Calls</th>
                    <th className="text-right px-3 py-2">Tokens</th>
                    <th className="text-right px-3 py-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data?.by_source ?? {}).map(([source, row]) => (
                    <tr key={source} className="border-t border-glass-border/60">
                      <td className="px-3 py-2">{source}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmtInt(row.calls)}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmtInt(row.total_tokens)}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmtCost(row.cost_usd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-glass-border overflow-hidden">
            <div className="px-4 py-3 text-[13px] font-semibold">最近调用</div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-panel2 text-muted uppercase">
                  <tr>
                    <th className="text-left px-3 py-2">Time</th>
                    <th className="text-left px-3 py-2">Provider</th>
                    <th className="text-left px-3 py-2">Model</th>
                    <th className="text-left px-3 py-2">Source</th>
                    <th className="text-right px-3 py-2">In</th>
                    <th className="text-right px-3 py-2">Out</th>
                    <th className="text-right px-3 py-2">ms</th>
                    <th className="text-left px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recent ?? []).map((row) => (
                    <tr key={row.id} className="border-t border-glass-border/60">
                      <td className="px-3 py-2 font-mono text-muted">
                        {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
                      </td>
                      <td className="px-3 py-2">{row.provider}</td>
                      <td className="px-3 py-2 font-mono">{row.model}</td>
                      <td className="px-3 py-2">{row.source}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmtInt(row.input_tokens)}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmtInt(row.output_tokens)}</td>
                      <td className="px-3 py-2 text-right font-mono">{row.latency_ms ?? "—"}</td>
                      <td className={row.success ? "px-3 py-2 text-green" : "px-3 py-2 text-red"}>
                        {row.success ? "ok" : row.error_code ?? "failed"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
