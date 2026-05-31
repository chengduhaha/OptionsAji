import { MarkerType, type Edge, type Node } from "@xyflow/react";

import type { GraphEdge, GraphNode } from "@/lib/supplyGraph";

export const RELATION_META: Record<string, { label: string; color: string; className: string }> = {
  supplies_to: { label: "供应", color: "#22d3ee", className: "text-cyan border-cyan/30 bg-cyan/10" },
  manufactures_for: { label: "代工", color: "#38bdf8", className: "text-blue border-blue/30 bg-blue/10" },
  invests_in: { label: "投资", color: "#f0b429", className: "text-gold border-gold/30 bg-gold/10" },
  parent_of: { label: "控股", color: "#f0b429", className: "text-gold border-gold/30 bg-gold/10" },
  competitor: { label: "竞争", color: "#ef4444", className: "text-red border-red/30 bg-red/10" },
  has_segment: { label: "分部", color: "#a855f7", className: "text-purple border-purple/30 bg-purple/10" },
  joint_development: { label: "共研", color: "#10b981", className: "text-green border-green/30 bg-green/10" },
  partnership: { label: "合作", color: "#10b981", className: "text-green border-green/30 bg-green/10" },
  licenses_to: { label: "授权", color: "#3b82f6", className: "text-blue border-blue/30 bg-blue/10" },
  thematic_link: { label: "主题", color: "#94a3b8", className: "text-muted-foreground border-white/20 bg-white/5" },
};

export function marketFlag(market?: string | null): string {
  const key = (market || "").toUpperCase();
  if (key === "US") return "🇺🇸";
  if (key === "UK") return "🇬🇧";
  if (key === "EU") return "🇪🇺";
  if (key === "TW") return "🇹🇼";
  if (key === "KR") return "🇰🇷";
  if (key === "HK") return "🇭🇰";
  if (key === "CN") return "🇨🇳";
  if (key === "JP") return "🇯🇵";
  return "◇";
}

export function nodeMoatTier(nodeId: string, edges: GraphEdge[]): string | null {
  const tiers = edges
    .filter((edge) => edge.source === nodeId || edge.target === nodeId)
    .map((edge) => edge.moatTier)
    .filter(Boolean);
  if (tiers.includes("exclusive")) return "exclusive";
  if (tiers.includes("dominant")) return "dominant";
  if (tiers.includes("primary")) return "primary";
  if (tiers.includes("scarce")) return "scarce";
  return tiers[0] ?? null;
}

export function sparklineForNode(node: GraphNode): Array<{ x: number; value: number }> {
  const seed = Array.from(node.id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: 9 }, (_, index) => ({
    x: index,
    value: 42 + ((seed + index * 17) % 34) + Math.sin(index / 1.7) * 8,
  }));
}

export function segmentOptions(graphNodes: GraphNode[]): Array<{ id: string; label: string }> {
  return graphNodes.filter((node) => node.type === "segment").map((node) => ({ id: node.id, label: node.label }));
}

export function filterGraphByBusinessSegment(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
  segmentId: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (!segmentId) return { nodes: graphNodes, edges: graphEdges };
  const segment = graphNodes.find((node) => node.id === segmentId);
  if (!segment) return { nodes: graphNodes, edges: graphEdges };
  const focus = graphNodes[0];
  const keptNodeIds = new Set<string>([segment.id]);
  if (focus) keptNodeIds.add(focus.id);
  const keptEdges = graphEdges.filter((edge) => {
    const touchesSegment = edge.source === segment.id || edge.target === segment.id;
    if (!touchesSegment) return false;
    keptNodeIds.add(edge.source);
    keptNodeIds.add(edge.target);
    return true;
  });
  return {
    nodes: graphNodes.filter((node) => keptNodeIds.has(node.id)),
    edges: keptEdges,
  };
}

export function mergeGraphResponses(
  base: { nodes: GraphNode[]; edges: GraphEdge[]; meta: Record<string, unknown> },
  patch: { nodes: GraphNode[]; edges: GraphEdge[]; meta?: Record<string, unknown> },
): { nodes: GraphNode[]; edges: GraphEdge[]; meta: Record<string, unknown> } {
  const nodes = new Map(base.nodes.map((node) => [node.id, node]));
  const edges = new Map(base.edges.map((edge) => [edge.id, edge]));
  for (const node of patch.nodes) nodes.set(node.id, node);
  for (const edge of patch.edges) edges.set(edge.id, edge);
  return {
    nodes: Array.from(nodes.values()),
    edges: Array.from(edges.values()),
    meta: { ...base.meta, ...(patch.meta ?? {}) },
  };
}

export function graphVisibleByExpansion(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
  expandedNodeIds: string[],
): { nodes: GraphNode[]; edges: GraphEdge[]; hiddenCount: number } {
  const focus = graphNodes[0];
  if (!focus) return { nodes: [], edges: [], hiddenCount: 0 };
  const expanded = new Set<string>([focus.id, ...expandedNodeIds]);
  const keptNodeIds = new Set<string>([focus.id]);
  const keptEdges: GraphEdge[] = [];
  for (const edge of graphEdges) {
    if (!expanded.has(edge.source) && !expanded.has(edge.target)) continue;
    keptEdges.push(edge);
    keptNodeIds.add(edge.source);
    keptNodeIds.add(edge.target);
  }
  const nodes = graphNodes.filter((node) => keptNodeIds.has(node.id));
  return {
    nodes,
    edges: keptEdges.filter((edge) => keptNodeIds.has(edge.source) && keptNodeIds.has(edge.target)),
    hiddenCount: Math.max(0, graphNodes.length - nodes.length),
  };
}

export function toProductGraph(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodeById = new Map(graphNodes.map((node) => [node.id, node]));
  const productNodes: GraphNode[] = [];
  const productEdges: GraphEdge[] = [];
  for (const edge of graphEdges) {
    if (edge.relType === "has_segment") continue;
    const productId = `product:${edge.id}`;
    productNodes.push({
      id: productId,
      type: "product",
      label: edge.label || RELATION_META[edge.relType]?.label || "产业链产品",
      nameZh: edge.label || undefined,
      sector: edge.relType,
      metrics: {
        semantic: edge.semantic,
        moatTier: edge.moatTier,
        evidence: edge.evidence,
      },
    });
    if (nodeById.has(edge.source)) {
      productEdges.push({
        ...edge,
        id: `${edge.id}:source-product`,
        source: edge.source,
        target: productId,
        label: edge.relType === "supplies_to" ? "提供" : RELATION_META[edge.relType]?.label || edge.relType,
      });
    }
    if (nodeById.has(edge.target)) {
      productEdges.push({
        ...edge,
        id: `${edge.id}:product-target`,
        source: productId,
        target: edge.target,
        label: "作用于",
      });
    }
  }
  const usedIds = new Set(productEdges.flatMap((edge) => [edge.source, edge.target]));
  return {
    nodes: [...graphNodes.filter((node) => usedIds.has(node.id)), ...productNodes],
    edges: productEdges,
  };
}

export function graphToFlow(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
  layout: "layered" | "radial" | "force",
  onSelectNode?: (node: GraphNode) => void,
): { nodes: Node[]; edges: Edge[] } {
  const focus = graphNodes[0];
  const segments = graphNodes.filter((node) => node.type === "segment");
  const suppliers = graphNodes.filter((node) => node.type !== "segment" && node.id !== focus?.id);
  const segmentIds = new Set(segments.map((node) => node.id));
  const supplierGroups = new Map<string, GraphNode[]>();
  for (const edge of graphEdges) {
    const segmentId = segmentIds.has(edge.source) ? edge.source : segmentIds.has(edge.target) ? edge.target : "";
    if (!segmentId) continue;
    const nodeId = edge.source === segmentId ? edge.target : edge.source;
    const node = suppliers.find((item) => item.id === nodeId);
    if (!node) continue;
    supplierGroups.set(segmentId, [...(supplierGroups.get(segmentId) ?? []), node]);
  }

  const positioned = new Map<string, { x: number; y: number }>();
  if (focus) positioned.set(focus.id, { x: 40, y: 260 });

  if (layout === "force") {
    // Radial seed: focus at centre, segments evenly around it, each segment's
    // suppliers fanned out beyond their segment. The live d3-force sim
    // (useForceLayout) then relaxes this into a non-overlapping star-field,
    // and these positions double as soft anchors that keep it orderly.
    const center = { x: 0, y: 0 };
    if (focus) positioned.set(focus.id, center);
    const segCount = Math.max(1, segments.length);
    segments.forEach((segment, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / segCount;
      const sx = center.x + Math.cos(angle) * 360;
      const sy = center.y + Math.sin(angle) * 360;
      positioned.set(segment.id, { x: sx, y: sy });
      const group = supplierGroups.get(segment.id) ?? [];
      const spread = Math.min(Math.PI * 1.1, 0.5 + group.length * 0.16);
      group.forEach((node, inner) => {
        const frac = group.length > 1 ? inner / (group.length - 1) : 0.5;
        const a = angle - spread / 2 + spread * frac;
        const r = 660 + (inner % 2) * 90;
        positioned.set(node.id, {
          x: center.x + Math.cos(a) * r,
          y: center.y + Math.sin(a) * r,
        });
      });
    });
    let orphan = 0;
    suppliers
      .filter((node) => !positioned.has(node.id))
      .forEach((node) => {
        const a = (Math.PI * 2 * orphan++) / 8;
        positioned.set(node.id, { x: Math.cos(a) * 780, y: Math.sin(a) * 780 });
      });
  } else if (layout === "radial") {
    const center = { x: 520, y: 300 };
    if (focus) positioned.set(focus.id, center);
    const others = graphNodes.filter((node) => node.id !== focus?.id);
    others.forEach((node, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(1, others.length);
      const radius = node.type === "segment" ? 260 : 470;
      positioned.set(node.id, { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius });
    });
  } else {
    // Layered: segments stacked, suppliers in a roomy multi-column grid so
    // large groups no longer pile on top of each other.
    let cursorY = 80;
    segments.forEach((segment) => {
      const group = supplierGroups.get(segment.id) ?? [];
      const rows = Math.max(1, Math.ceil(group.length / 3));
      const blockH = rows * 150;
      const segY = cursorY + blockH / 2 - 75;
      positioned.set(segment.id, { x: 360, y: segY });
      group.forEach((node, inner) => {
        const col = inner % 3;
        const row = Math.floor(inner / 3);
        positioned.set(node.id, { x: 720 + col * 250, y: cursorY + row * 150 });
      });
      cursorY += blockH + 90;
    });
    suppliers
      .filter((node) => !positioned.has(node.id))
      .forEach((node, index) => positioned.set(node.id, { x: 720 + (index % 3) * 250, y: cursorY + Math.floor(index / 3) * 150 }));
  }

  return {
    nodes: graphNodes.map((node) => ({
      id: node.id,
      type: "companyCard",
      position: positioned.get(node.id) ?? { x: 0, y: 0 },
      data: {
        node,
        moatTier: nodeMoatTier(node.id, graphEdges),
        sparkline: sparklineForNode(node),
        onSelectNode,
      },
    })),
    edges: graphEdges.map((edge) => {
      const meta = RELATION_META[edge.relType] ?? RELATION_META.thematic_link;
      const highlight = edge.moatTier === "exclusive";
      // Force/radial fields use floating edges (border-to-border straight lines);
      // the layered tree keeps orthogonal smoothstep routing.
      const floating = layout === "force" || layout === "radial";
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label ?? meta.label,
        type: floating ? "floating" : "smoothstep",
        animated: !floating && highlight,
        markerEnd: { type: MarkerType.ArrowClosed, color: meta.color, width: 16, height: 16 },
        data: { edge, animated: highlight },
        labelStyle: { fill: "#e2e8f0", fontSize: 11, fontWeight: 600 },
        labelBgStyle: { fill: "rgba(5, 10, 20, 0.82)", fillOpacity: 0.9 },
        style: {
          stroke: meta.color,
          strokeWidth: Math.max(1.5, (edge.weight ?? 0.6) * 3),
          opacity: edge.relType === "thematic_link" ? 0.5 : 0.9,
        },
      };
    }),
  };
}
