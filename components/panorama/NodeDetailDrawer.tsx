"use client";

import { X } from "lucide-react";
import Link from "next/link";

import type { GraphEdge, GraphNode } from "@/lib/supplyGraph";
import { RELATION_META, marketFlag } from "./graph-utils";

export function NodeDetailDrawer({
  node,
  edge,
  expanded,
  expanding,
  onExpand,
  onClose,
}: {
  node: GraphNode | null;
  edge: GraphEdge | null;
  expanded?: boolean;
  expanding?: boolean;
  onExpand?: (node: GraphNode) => void;
  onClose: () => void;
}) {
  if (!node && !edge) return null;
  const rel = edge ? RELATION_META[edge.relType] ?? RELATION_META.thematic_link : null;
  return (
    <aside className="absolute right-4 top-4 z-20 w-[360px] rounded-xl border border-white/10 bg-panel-elevated/95 p-4 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {edge ? "关系语义" : "节点详情"}
          </div>
          <h2 className="mt-1 text-[16px] font-semibold text-foreground">
            {edge ? edge.label || rel?.label : node?.label}
          </h2>
        </div>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      {node ? (
        <div className="mt-4 space-y-3 text-[12px]">
          <div className="flex items-center gap-2">
            {node.ticker ? <span className="rounded border border-primary/25 bg-primary/10 px-2 py-1 font-mono text-primary">{node.ticker}</span> : null}
            <span>{marketFlag(node.market)}</span>
            <span className="text-muted-foreground">{node.sector || node.type}</span>
          </div>
          {node.ticker ? (
            <Link
              href={`/stock/${encodeURIComponent(node.ticker)}`}
              className="inline-flex rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-[12px] font-medium text-primary hover:bg-primary/15"
            >
              跳转个股深度
            </Link>
          ) : null}
          <button
            type="button"
            disabled={expanded || expanding}
            onClick={() => onExpand?.(node)}
            className="ml-2 inline-flex rounded-lg border border-cyan/25 bg-cyan/10 px-3 py-1.5 text-[12px] font-medium text-cyan hover:bg-cyan/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {expanded ? "已展开邻居" : expanding ? "展开中" : "展开邻居"}
          </button>
          <p className="leading-relaxed text-muted-foreground">{node.nameEn || node.nameZh || node.label}</p>
          <pre className="max-h-48 overflow-auto rounded-lg border border-white/10 bg-background/60 p-3 text-[11px] text-muted-foreground">
            {JSON.stringify(node.metrics ?? {}, null, 2)}
          </pre>
        </div>
      ) : null}
      {edge ? (
        <div className="mt-4 space-y-3 text-[12px]">
          <div className="flex items-center gap-2">
            <span className={`rounded border px-2 py-1 ${rel?.className}`}>{rel?.label || edge.relType}</span>
            {edge.moatTier ? <span className="rounded border border-gold/25 bg-gold/10 px-2 py-1 text-gold">{edge.moatTier}</span> : null}
          </div>
          <p className="leading-relaxed text-muted-foreground">{edge.semantic || "暂无语义描述。"}</p>
          <div className="rounded-lg border border-white/10 bg-background/60 p-3 text-[11px] text-muted-foreground">
            <div>置信度：{edge.confidence || "unknown"}</div>
            <div>证据：{edge.evidence || "未提供"}</div>
            <div>日期：{edge.asOfDate || "未提供"}</div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
