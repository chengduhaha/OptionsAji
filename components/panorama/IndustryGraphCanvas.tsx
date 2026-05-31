"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { GraphNode, SupplyGraphResponse } from "@/lib/supplyGraph";
import { NodeDetailDrawer } from "./NodeDetailDrawer";
import { RELATION_META, nodeMoatTier } from "./graph-utils";

type G6NodeData = {
  id: string;
  label: string;
  kind: "sector" | "company";
  node?: GraphNode;
  count?: number;
  moatTier?: string | null;
};

function buildIndustryData(graph: SupplyGraphResponse | null) {
  const nodes = graph?.nodes ?? [];
  const edges = graph?.edges ?? [];
  const sectors = new Map<string, { count: number; companies: GraphNode[] }>();
  for (const node of nodes) {
    const sector = node.sector || "未分类";
    const current = sectors.get(sector) ?? { count: 0, companies: [] };
    current.count += 1;
    if (node.type !== "segment") current.companies.push(node);
    sectors.set(sector, current);
  }

  const g6Nodes: Array<{ id: string; data: G6NodeData }> = [];
  for (const [sector, info] of sectors) {
    g6Nodes.push({
      id: `sector:${sector}`,
      data: { id: `sector:${sector}`, label: sector, kind: "sector", count: info.count },
    });
    for (const node of info.companies) {
      g6Nodes.push({
        id: node.id,
        data: {
          id: node.id,
          label: node.ticker || node.label,
          kind: "company",
          node,
          moatTier: nodeMoatTier(node.id, edges),
        },
      });
    }
  }

  const g6Edges = [
    ...Array.from(sectors.entries()).flatMap(([sector, info]) =>
      info.companies.map((node) => ({
        source: `sector:${sector}`,
        target: node.id,
        data: { relType: "thematic_link", label: "归属行业" },
      })),
    ),
    ...edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      data: { relType: edge.relType, label: edge.label, edge },
    })),
  ];

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
  const graphRef = useRef<{ destroy: () => void } | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const data = useMemo(() => buildIndustryData(graph), [graph]);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;
    graphRef.current?.destroy();
    graphRef.current = null;
    const width = Math.max(container.clientWidth, 900);
    const height = Math.max(container.clientHeight, 600);
    void import("@antv/g6").then(({ Graph, NodeEvent }) => {
      if (cancelled) return;
      const g6 = new Graph({
        container,
        width,
        height,
        autoFit: "view",
        data,
        layout: {
          type: "d3-force",
          link: { distance: 130, strength: 0.45 },
          manyBody: { strength: -280 },
          collide: { radius: 58 },
          center: { x: width / 2, y: height / 2 },
          iterations: 260,
        },
        node: {
          type: "circle",
          style: (datum) => {
            const item = datum.data as G6NodeData;
            const isSector = item.kind === "sector";
            const isMoat = item.moatTier === "exclusive" || item.moatTier === "dominant";
            return {
              size: isSector ? 78 : isMoat ? 52 : 42,
              fill: isSector ? "rgba(168,85,247,0.18)" : "rgba(34,211,238,0.16)",
              stroke: isSector ? "#a855f7" : isMoat ? "#f0b429" : "#22d3ee",
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
      });
      g6.on(NodeEvent.CLICK, (event: unknown) => {
        const target = (event as { target?: { id?: string } }).target;
        const id = target?.id;
        if (!id) return;
        const datum = g6.getNodeData(id);
        const item = datum?.data as G6NodeData | undefined;
        if (item?.node) setSelectedNode(item.node);
      });
      void g6.render();
      graphRef.current = g6;
    });
    return () => {
      cancelled = true;
      graphRef.current?.destroy();
      graphRef.current = null;
    };
  }, [data]);

  return (
    <section className="relative h-full overflow-hidden rounded-xl border border-white/10 bg-background/60">
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="rounded-lg border border-white/10 bg-panel px-4 py-3 text-[13px] text-muted-foreground">
            正在加载行业力导向图…
          </div>
        </div>
      ) : null}
      <div ref={containerRef} className="h-full w-full" />
      <NodeDetailDrawer node={selectedNode} edge={null} onClose={() => setSelectedNode(null)} />
    </section>
  );
}
