import type { GraphNode, SupplyGraphResponse } from "@/lib/supplyGraph";
import { RELATION_META } from "./graph-utils";

export type GraphDigestSegment = {
  segmentId: string;
  label: string;
  supplierCount: number;
};

export type GraphDigestLink = {
  id: string;
  relType: string;
  relLabel: string;
  label: string;
  sourceLabel: string;
  targetLabel: string;
  moatTier?: string | null;
};

export type GraphDigestNeighbor = {
  nodeId: string;
  label: string;
  relType: string;
  relLabel: string;
  direction: "in" | "out";
};

export type GraphDigest = {
  focusLabel: string;
  focusTicker: string;
  perspective: string;
  nodeCount: number;
  edgeCount: number;
  asOf: string;
  segments: GraphDigestSegment[];
  moatHighlights: GraphDigestLink[];
  keyLinks: GraphDigestLink[];
  selected: {
    node: GraphNode;
    neighbors: GraphDigestNeighbor[];
  } | null;
};

const MOAT_PRIORITY = ["exclusive", "dominant", "primary", "scarce"] as const;
const KEY_REL_TYPES = ["supplies_to", "invests_in", "manufactures_for", "joint_development"] as const;

function nodeLabel(nodeId: string, byId: Map<string, GraphNode>): string {
  const row = byId.get(nodeId);
  if (!row) return nodeId;
  return row.ticker || row.label || row.nameZh || row.id;
}

function relLabel(relType: string): string {
  return RELATION_META[relType]?.label ?? relType;
}

export function buildGraphDigest(
  graph: SupplyGraphResponse | null,
  focus: string,
  perspective: string,
  selectedNode: GraphNode | null,
): GraphDigest | null {
  if (!graph || graph.nodes.length === 0) return null;

  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const focusNode =
    graph.nodes.find(
      (node) =>
        node.ticker?.toUpperCase() === focus.toUpperCase() ||
        node.id === graph.meta?.focusNodeId ||
        node.label === focus,
    ) ?? graph.nodes[0];

  const segments: GraphDigestSegment[] = [];
  if (perspective === "company") {
    const segmentNodes = graph.nodes.filter((node) => node.type === "segment");
    for (const segment of segmentNodes) {
      const supplierIds = new Set<string>();
      for (const edge of graph.edges) {
        if (edge.relType === "has_segment" && edge.target === segment.id) {
          supplierIds.add(edge.source);
        }
        if (edge.relType === "has_segment" && edge.source === segment.id) {
          supplierIds.add(edge.target);
        }
      }
      for (const edge of graph.edges) {
        if (edge.source === segment.id && byId.get(edge.target)?.type !== "segment") {
          supplierIds.add(edge.target);
        }
        if (edge.target === segment.id && byId.get(edge.source)?.type !== "segment") {
          supplierIds.add(edge.source);
        }
      }
      segments.push({
        segmentId: segment.id,
        label: segment.label,
        supplierCount: supplierIds.size,
      });
    }
  }

  const moatHighlights: GraphDigestLink[] = graph.edges
    .filter((edge) => edge.moatTier === "exclusive" || edge.moatTier === "dominant")
    .map((edge) => ({
      id: edge.id,
      relType: edge.relType,
      relLabel: relLabel(edge.relType),
      label: edge.label || relLabel(edge.relType),
      sourceLabel: nodeLabel(edge.source, byId),
      targetLabel: nodeLabel(edge.target, byId),
      moatTier: edge.moatTier,
    }))
    .sort((a, b) => {
      const ai = MOAT_PRIORITY.indexOf((a.moatTier ?? "normal") as (typeof MOAT_PRIORITY)[number]);
      const bi = MOAT_PRIORITY.indexOf((b.moatTier ?? "normal") as (typeof MOAT_PRIORITY)[number]);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .slice(0, 6);

  const keyLinks: GraphDigestLink[] = graph.edges
    .filter((edge) => KEY_REL_TYPES.includes(edge.relType as (typeof KEY_REL_TYPES)[number]))
    .map((edge) => ({
      id: edge.id,
      relType: edge.relType,
      relLabel: relLabel(edge.relType),
      label: edge.label || relLabel(edge.relType),
      sourceLabel: nodeLabel(edge.source, byId),
      targetLabel: nodeLabel(edge.target, byId),
      moatTier: edge.moatTier,
    }))
    .slice(0, 8);

  let selected: GraphDigest["selected"] = null;
  if (selectedNode) {
    const neighbors: GraphDigestNeighbor[] = [];
    for (const edge of graph.edges) {
      if (edge.source === selectedNode.id) {
        const target = byId.get(edge.target);
        if (target) {
          neighbors.push({
            nodeId: target.id,
            label: nodeLabel(target.id, byId),
            relType: edge.relType,
            relLabel: relLabel(edge.relType),
            direction: "out",
          });
        }
      } else if (edge.target === selectedNode.id) {
        const source = byId.get(edge.source);
        if (source) {
          neighbors.push({
            nodeId: source.id,
            label: nodeLabel(source.id, byId),
            relType: edge.relType,
            relLabel: relLabel(edge.relType),
            direction: "in",
          });
        }
      }
    }
    selected = { node: selectedNode, neighbors: neighbors.slice(0, 12) };
  }

  return {
    focusLabel: focusNode?.label ?? focus,
    focusTicker: focusNode?.ticker ?? focus,
    perspective,
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    asOf: String(graph.meta?.asOf ?? "N/A"),
    segments,
    moatHighlights,
    keyLinks,
    selected,
  };
}

export function graphInsightPayload(
  graph: SupplyGraphResponse,
  focus: string,
  perspective: string,
  depth: number,
): Record<string, unknown> {
  const trim = (value: string | null | undefined, max: number) => {
    const text = value ?? "";
    return text.length > max ? `${text.slice(0, max)}…` : text;
  };

  return {
    focus,
    perspective,
    depth,
    asOf: graph.meta?.asOf,
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      ticker: node.ticker,
      label: node.label,
      sector: node.sector,
    })),
    edges: graph.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      relType: edge.relType,
      label: edge.label,
      moatTier: edge.moatTier,
      semantic: trim(edge.semantic, 120),
    })),
  };
}
