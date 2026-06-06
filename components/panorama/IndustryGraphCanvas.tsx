"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { GraphNode, SupplyGraphResponse } from "@/lib/supplyGraph";
import { NodeDetailDrawer } from "./NodeDetailDrawer";
import { RELATION_META, nodeMoatTier } from "./graph-utils";

type G6NodeData = {
  id: string;
  label: string;
  kind: "sector" | "company" | "segment";
  node?: GraphNode;
  count?: number;
  moatTier?: string | null;
};

type G6GraphInstance = {
  destroy: () => void;
  resize?: (width: number, height: number) => void;
  render: () => Promise<void>;
  zoomTo?: (level: number, animation?: { duration?: number }) => void;
  on: (event: string, handler: (event: unknown) => void) => void;
  getNodeData: (id: string) => { data?: G6NodeData };
};

export function buildIndustryData(graph: SupplyGraphResponse | null) {
  const graphNodes = graph?.nodes ?? [];
  const graphEdges = graph?.edges ?? [];
  const sectorCounts = new Map<string, number>();

  for (const node of graphNodes) {
    const sector = node.sector || "未分类";
    sectorCounts.set(sector, (sectorCounts.get(sector) ?? 0) + 1);
  }

  const g6Nodes: Array<{ id: string; data: G6NodeData }> = [];
  for (const [sector, count] of sectorCounts) {
    g6Nodes.push({
      id: `sector:${sector}`,
      data: { id: `sector:${sector}`, label: sector, kind: "sector", count },
    });
  }

  for (const node of graphNodes) {
    const kind: G6NodeData["kind"] =
      node.type === "segment" ? "segment" : node.type === "company" ? "company" : "company";
    g6Nodes.push({
      id: node.id,
      data: {
        id: node.id,
        label: node.ticker || node.label,
        kind,
        node,
        moatTier: nodeMoatTier(node.id, graphEdges),
      },
    });
  }

  const nodeIds = new Set(g6Nodes.map((node) => node.id));
  const g6Edges = [
    ...graphNodes.map((node) => ({
      id: `sector-link:${node.id}`,
      source: `sector:${node.sector || "未分类"}`,
      target: node.id,
      data: { relType: "thematic_link", label: "归属行业" },
    })),
    ...graphEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: { relType: edge.relType, label: edge.label, edge },
    })),
  ].filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));

  return { nodes: g6Nodes, edges: g6Edges };
}

export function IndustryGraphCanvas({
  graph,
  loading,
}: {
  graph: SupplyGraphResponse | null;
  loading: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<G6GraphInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const data = useMemo(() => buildIndustryData(graph), [graph]);
  const ready = !loading && data.nodes.length > 0;

  const mountGraph = useCallback(async () => {
    const container = containerRef.current;
    if (!container || !ready) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 400);
    if (width < 40 || height < 40) return;

    graphRef.current?.destroy();
    graphRef.current = null;
    setRenderError(null);

    try {
      const { Graph, NodeEvent } = await import("@antv/g6");
      const g6 = new Graph({
        container,
        width,
        height,
        autoFit: "view",
        data,
        layout: {
          type: "d3-force",
          link: { distance: 100, strength: 0.45 },
          manyBody: { strength: -220 },
          collide: { radius: 52 },
          center: { x: width / 2, y: height / 2 },
          iterations: 260,
        },
        node: {
          type: "circle",
          style: (datum) => {
            const item = datum.data as G6NodeData;
            const isSector = item.kind === "sector";
            const isSegment = item.kind === "segment";
            const isMoat = item.moatTier === "exclusive" || item.moatTier === "dominant";
            return {
              size: isSector ? 78 : isSegment ? 48 : isMoat ? 52 : 42,
              fill: isSector
                ? "rgba(168,85,247,0.18)"
                : isSegment
                  ? "rgba(129,140,248,0.2)"
                  : "rgba(34,211,238,0.16)",
              stroke: isSector ? "#a855f7" : isSegment ? "#818cf8" : isMoat ? "#f0b429" : "#22d3ee",
              lineWidth: isMoat ? 3 : 1.5,
              halo: isMoat,
              haloStroke: "#f0b429",
              haloStrokeOpacity: 0.35,
              labelText: item.label,
              labelFill: "#f0f4f8",
              labelFontSize: isSector ? 12 : 10,
              labelFontWeight: isSector ? 700 : 600,
              labelPlacement: "center",
            };
          },
        },
        edge: {
          type: "line",
          style: (datum) => {
            const relType = String((datum.data as { relType?: string })?.relType || "thematic_link");
            return {
              stroke: RELATION_META[relType]?.color || "#64748b",
              strokeOpacity: relType === "thematic_link" ? 0.28 : 0.62,
              lineWidth: relType === "thematic_link" ? 1 : 1.6,
            };
          },
        },
        behaviors: ["drag-canvas", "zoom-canvas", "drag-element", "hover-activate"],
      }) as unknown as G6GraphInstance;

      g6.on(NodeEvent.CLICK, (event: unknown) => {
        const target = (event as { target?: { id?: string } }).target;
        const id = target?.id;
        if (!id) return;
        const item = g6.getNodeData(id)?.data;
        if (item?.node) setSelectedNode(item.node);
      });
      await g6.render();
      g6.zoomTo?.(1.2, { duration: 200 });
      graphRef.current = g6;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "行业图谱渲染失败";
      setRenderError(message);
      console.error("[IndustryGraphCanvas] G6 render failed", err);
    }
  }, [data, ready]);

  useEffect(() => {
    if (!ready) {
      graphRef.current?.destroy();
      graphRef.current = null;
      return;
    }

    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    const run = () => {
      if (cancelled) return;
      void mountGraph();
    };

    run();
    const observer = new ResizeObserver(() => {
      if (!graphRef.current) {
        run();
        return;
      }
      const width = Math.max(container.clientWidth, 320);
      const height = Math.max(container.clientHeight, 400);
      if (width < 40 || height < 40) return;
      graphRef.current.resize?.(width, height);
    });
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
      graphRef.current?.destroy();
      graphRef.current = null;
    };
  }, [mountGraph, ready]);

  return (
    <section className="relative h-full min-h-[480px] overflow-hidden rounded-xl border border-foreground/10 bg-background/60">
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="rounded-lg border border-foreground/10 bg-panel px-4 py-3 text-[13px] text-muted-foreground">
            正在加载行业力导向图…
          </div>
        </div>
      ) : null}
      {renderError ? (
        <div className="absolute inset-x-4 top-4 z-10 rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[12px] text-red">
          {renderError}
        </div>
      ) : null}
      {!loading && data.nodes.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-[13px] text-muted-foreground">
          暂无行业图谱数据
        </div>
      ) : null}
      <div ref={containerRef} className="h-full min-h-[480px] w-full" />
      <NodeDetailDrawer node={selectedNode} edge={null} onClose={() => setSelectedNode(null)} />
    </section>
  );
}
