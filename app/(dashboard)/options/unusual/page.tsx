"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { TrendingUp } from "lucide-react";

type UnusualV2Row = {
  score?: number;
  reasons?: string[];
  underlying?: string;
  contract_type?: string;
  strike_price?: number;
  expiration_date?: string;
  volume?: number;
  open_interest?: number;
  volOiRatio?: number;
  estimatedFlowUsd?: number;
  oiChangePct?: number | null;
};

function formatFlow(v: number | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(Math.round(v));
}

export default function UnusualOptionsPage() {
  const [rows, setRows] = useState<UnusualV2Row[]>([]);
  const [total, setTotal] = useState(0);
  const [minScore, setMinScore] = useState(40);
  const [volumeMin, setVolumeMin] = useState(40);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api.options
      .unusualV2({ minScore, volumeMin, pageSize: 50, sortBy: "score", order: "desc" })
      .then((d) => {
        setRows((d.items || []) as UnusualV2Row[]);
        setTotal(d.total ?? 0);
      })
      .catch((e: unknown) => {
        setRows([]);
        setTotal(0);
        setError(e instanceof Error ? e.message : "加载失败");
      })
      .finally(() => setLoading(false));
  }, [minScore, volumeMin]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <TrendingUp className="w-5 h-5 text-gold" />
        <h1 className="text-xl font-bold text-text">异常期权活动</h1>
        <p className="text-[11px] text-muted w-full">
          全市场期权快照 · 多因子 v2 评分（与个股深度异动同源）
        </p>
        <div className="flex gap-3 ml-4 items-center flex-wrap">
          <label className="text-[12px] text-muted">
            最低评分:
            <input
              type="number"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="ml-1.5 w-14 px-2 py-1 bg-panel2 border border-border2 rounded text-text text-[12px] focus:outline-none"
            />
          </label>
          <label className="text-[12px] text-muted">
            最小量:
            <input
              type="number"
              value={volumeMin}
              onChange={(e) => setVolumeMin(Number(e.target.value))}
              className="ml-1.5 w-20 px-2 py-1 bg-panel2 border border-border2 rounded text-text text-[12px] focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={load}
            className="px-4 py-1.5 bg-gold-dim border border-border text-gold text-[12px] font-semibold rounded-lg"
          >
            刷新
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red/30 bg-red/5 px-3 py-2 text-xs text-red">{error}</div>
      ) : null}

      <div className="bg-panel2 border border-border2 rounded-xl overflow-x-auto">
        <table className="w-full text-[11.5px] min-w-[960px]">
          <thead>
            <tr className="border-b border-border2 text-muted">
              <th className="text-left px-4 py-2.5">标的</th>
              <th className="text-right px-4 py-2.5">评分</th>
              <th className="text-left px-4 py-2.5">类型</th>
              <th className="text-right px-4 py-2.5">行权价</th>
              <th className="text-left px-4 py-2.5">到期日</th>
              <th className="text-right px-4 py-2.5">成交量</th>
              <th className="text-right px-4 py-2.5">OI</th>
              <th className="text-right px-4 py-2.5">Vol/OI</th>
              <th className="text-right px-4 py-2.5">资金流$</th>
              <th className="text-left px-4 py-2.5">原因</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border2">
            {loading ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-muted">
                  加载中...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-muted">
                  暂无达到评分阈值的异常合约 — 可降低最低评分或等待数据同步
                </td>
              </tr>
            ) : (
              rows.map((c, i) => (
                <tr key={`${c.underlying}-${c.strike_price}-${c.expiration_date}-${i}`} className="hover:bg-foreground/[0.02] transition-colors">
                  <td className="px-4 py-2">
                    {c.underlying ? (
                      <Link href={`/stock/${c.underlying}/unusual`} className="text-gold font-semibold hover:underline">
                        {c.underlying}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-gold">{c.score ?? "—"}</td>
                  <td className={`px-4 py-2 font-medium uppercase ${c.contract_type === "call" ? "text-green-400" : "text-red-400"}`}>
                    {c.contract_type ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right text-text">${c.strike_price ?? "—"}</td>
                  <td className="px-4 py-2 text-muted">{c.expiration_date ?? "—"}</td>
                  <td className="px-4 py-2 text-right text-text">{c.volume?.toLocaleString() ?? "—"}</td>
                  <td className="px-4 py-2 text-right text-muted">{c.open_interest?.toLocaleString() ?? "—"}</td>
                  <td className="px-4 py-2 text-right font-bold text-yellow-400">
                    {c.volOiRatio != null ? `${c.volOiRatio.toFixed(2)}x` : "—"}
                  </td>
                  <td className="px-4 py-2 text-right text-muted">{formatFlow(c.estimatedFlowUsd)}</td>
                  <td className="px-4 py-2 text-[10px] text-muted leading-snug max-w-[240px]">
                    {(c.reasons || []).join(" · ") || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && total > 0 ? (
        <p className="text-[11px] text-muted">共 {total} 条符合评分阈值（显示前 50 条）</p>
      ) : null}
    </div>
  );
}
