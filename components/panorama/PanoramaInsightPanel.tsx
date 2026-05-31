"use client";

import { Brain, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { GraphNode, SupplyGraphResponse } from "@/lib/supplyGraph";
import { fetchGraphInsight } from "@/lib/supplyGraph";
import type { GraphInsightResponse } from "@/lib/supplyGraph";
import { buildGraphDigest, graphInsightPayload } from "./graph-insight";

export function PanoramaInsightPanel({
  graph,
  focus,
  perspective,
  depth,
  loading,
  selectedNode,
  onFocusNode,
  graphRevision,
}: {
  graph: SupplyGraphResponse | null;
  focus: string;
  perspective: string;
  depth: number;
  loading: boolean;
  selectedNode: GraphNode | null;
  onFocusNode: (nodeId: string) => void;
  graphRevision: string;
}) {
  const digest = useMemo(
    () => buildGraphDigest(graph, focus, perspective, selectedNode),
    [graph, focus, perspective, selectedNode],
  );

  const [aiText, setAiText] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStale, setAiStale] = useState(false);
  const [aiRevision, setAiRevision] = useState<string | null>(null);

  useEffect(() => {
    if (aiRevision && aiRevision !== graphRevision) {
      setAiStale(true);
    }
  }, [aiRevision, graphRevision]);

  async function handleGenerateAi() {
    if (!graph || graph.nodes.length === 0) return;
    setAiLoading(true);
    setAiError(null);
    setAiStale(false);
    try {
      const payload = graphInsightPayload(graph, focus, perspective, depth);
      const result: GraphInsightResponse = await fetchGraphInsight(payload);
      setAiText(result.insight);
      setAiRevision(graphRevision);
    } catch (err: unknown) {
      setAiText(null);
      setAiError(err instanceof Error ? err.message : "AI 解读生成失败");
    } finally {
      setAiLoading(false);
    }
  }

  if (loading && !digest) {
    return (
      <aside className="flex h-full min-h-[320px] flex-col rounded-xl border border-white/10 bg-panel/70 p-4">
        <div className="flex flex-1 items-center justify-center text-[13px] text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          加载解读…
        </div>
      </aside>
    );
  }

  if (!digest) {
    return (
      <aside className="flex h-full min-h-[320px] flex-col rounded-xl border border-white/10 bg-panel/70 p-4 text-[13px] text-muted-foreground">
        暂无图谱数据
      </aside>
    );
  }

  return (
    <aside className="flex h-full min-h-[320px] max-h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-panel/70 backdrop-blur-xl">
      <div className="shrink-0 border-b border-white/10 px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.16em] text-primary">图谱解读</div>
        <h2 className="mt-1 text-[15px] font-semibold text-foreground">{digest.focusLabel}</h2>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          {digest.focusTicker} · {digest.nodeCount} 节点 · {digest.edgeCount} 关系 · {digest.asOf}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3 text-[12px]">
        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">格局概览</h3>
          <p className="leading-relaxed text-foreground/90">
            当前为<strong className="text-primary">{perspective === "company" ? "公司" : perspective === "industry" ? "行业" : "产品"}视角</strong>
            ，以 <span className="font-mono text-cyan">{digest.focusTicker}</span> 为中心展示可见子图。
            {digest.segments.length > 0
              ? ` 共 ${digest.segments.length} 个业务分部、${digest.moatHighlights.length} 条高护城河关系。`
              : null}
          </p>
          {perspective === "company" && layoutHint(perspective) ? (
            <p className="mt-2 text-[11px] text-muted-foreground">{layoutHint(perspective)}</p>
          ) : null}
        </section>

        {digest.segments.length > 0 ? (
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">业务分部</h3>
            <ul className="space-y-1.5">
              {digest.segments.map((segment) => (
                <li key={segment.segmentId}>
                  <button
                    type="button"
                    onClick={() => onFocusNode(segment.segmentId)}
                    className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-glass/60 px-2.5 py-1.5 text-left hover:border-primary/30"
                  >
                    <span className="text-foreground">{segment.label}</span>
                    <span className="text-[11px] text-muted-foreground">{segment.supplierCount} 关联方</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {digest.moatHighlights.length > 0 ? (
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gold">护城河亮点</h3>
            <ul className="space-y-2">
              {digest.moatHighlights.map((link) => (
                <li key={link.id} className="rounded-lg border border-gold/20 bg-gold/5 px-2.5 py-2">
                  <div className="text-[11px] text-gold">{link.moatTier}</div>
                  <div className="mt-0.5 font-medium text-foreground">{link.label}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {link.sourceLabel} → {link.targetLabel}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {digest.keyLinks.length > 0 ? (
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">关键链路</h3>
            <ul className="space-y-1.5">
              {digest.keyLinks.map((link) => (
                <li key={link.id} className="rounded-lg border border-white/10 bg-background/40 px-2.5 py-2">
                  <span className="rounded border border-cyan/25 bg-cyan/10 px-1.5 py-0.5 text-[10px] text-cyan">
                    {link.relLabel}
                  </span>
                  <div className="mt-1 text-foreground">{link.label}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {link.sourceLabel} → {link.targetLabel}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {digest.selected ? (
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">选中节点</h3>
            <p className="font-medium text-foreground">{digest.selected.node.label}</p>
            <ul className="mt-2 space-y-1">
              {digest.selected.neighbors.map((neighbor) => (
                <li key={`${neighbor.nodeId}-${neighbor.relType}-${neighbor.direction}`}>
                  <button
                    type="button"
                    onClick={() => onFocusNode(neighbor.nodeId)}
                    className="flex w-full items-center gap-1 text-left text-[11px] text-muted-foreground hover:text-cyan"
                  >
                    <ChevronRight className="h-3 w-3 shrink-0" />
                    <span>
                      {neighbor.direction === "out" ? "→" : "←"} {neighbor.relLabel} · {neighbor.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="text-[11px] text-muted-foreground">点击图谱中的节点可在此查看邻居关系。</p>
        )}

        <section className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
              <Brain className="h-3.5 w-3.5" />
              AI 解读
            </div>
            <button
              type="button"
              disabled={aiLoading || !graph}
              onClick={() => void handleGenerateAi()}
              className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] text-primary hover:bg-primary/15 disabled:opacity-50"
            >
              {aiLoading ? "生成中…" : "生成 AI 解读"}
            </button>
          </div>
          {aiStale ? (
            <p className="mb-2 text-[11px] text-amber-400">图谱已更新，可重新生成 AI 解读。</p>
          ) : null}
          {aiError ? <p className="text-[11px] text-red">{aiError}</p> : null}
          {aiLoading ? (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              正在分析当前可见子图…
            </div>
          ) : null}
          {aiText && !aiLoading ? (
            <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">{aiText}</div>
          ) : (
            !aiLoading &&
            !aiError && (
              <p className="text-[11px] text-muted-foreground">
                基于当前筛选后的节点与关系生成中文解读，不会自动刷新以节省成本。
              </p>
            )
          )}
        </section>
      </div>

      <p className="shrink-0 border-t border-white/10 px-4 py-2 text-[10px] leading-relaxed text-muted-foreground">
        本平台仅提供数据分析和教育内容，不构成投资建议。
      </p>
    </aside>
  );
}

function layoutHint(perspective: string): string | null {
  if (perspective === "company") {
    return "提示：切换为「层级」布局可一览全貌；星图布局适合看分部辐射。";
  }
  return null;
}
