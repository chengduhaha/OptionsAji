"use client";

import type { Node } from "@xyflow/react";

type Hull = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

const SEGMENT_COLORS: Record<string, string> = {
  "AI 分部": "rgba(168, 85, 247, 0.24)",
  "Connectivity 分部": "rgba(34, 211, 238, 0.22)",
  "Space 分部": "rgba(59, 130, 246, 0.22)",
};

function nodeLabel(node: Node): string {
  const data = node.data as { node?: { label?: string; type?: string } };
  return data.node?.label ?? "";
}

function nodeType(node: Node): string {
  const data = node.data as { node?: { type?: string } };
  return data.node?.type ?? "";
}

function nodeBox(node: Node) {
  return {
    x: node.position.x,
    y: node.position.y,
    width: node.measured?.width ?? (nodeType(node) === "segment" ? 210 : 210),
    height: node.measured?.height ?? 125,
  };
}

export function SegmentConstellationLayer({ nodes, edges }: { nodes: Node[]; edges: Array<{ source: string; target: string }> }) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const hulls: Hull[] = nodes
    .filter((node) => nodeType(node) === "segment")
    .map((segment) => {
      const relatedIds = new Set<string>([segment.id]);
      for (const edge of edges) {
        if (edge.source === segment.id) relatedIds.add(edge.target);
        if (edge.target === segment.id) relatedIds.add(edge.source);
      }
      const boxes = Array.from(relatedIds)
        .map((id) => nodeById.get(id))
        .filter(Boolean)
        .map((node) => nodeBox(node as Node));
      const minX = Math.min(...boxes.map((box) => box.x));
      const minY = Math.min(...boxes.map((box) => box.y));
      const maxX = Math.max(...boxes.map((box) => box.x + box.width));
      const maxY = Math.max(...boxes.map((box) => box.y + box.height));
      const label = nodeLabel(segment);
      const pad = 82;
      return {
        id: segment.id,
        label,
        x: minX - pad,
        y: minY - pad,
        width: maxX - minX + pad * 2,
        height: maxY - minY + pad * 2,
        color: SEGMENT_COLORS[label] ?? "rgba(148, 163, 184, 0.16)",
      };
    });

  return (
    <>
      {hulls.map((hull) => (
        <div
          key={hull.id}
          className="pointer-events-none absolute rounded-[44px] border border-white/10 opacity-80 blur-[0.2px]"
          style={{
            transform: `translate(${hull.x}px, ${hull.y}px)`,
            width: hull.width,
            height: hull.height,
            background: `radial-gradient(circle at 50% 50%, ${hull.color}, transparent 68%)`,
            boxShadow: `0 0 80px ${hull.color}`,
          }}
        >
          <div className="absolute left-8 top-6 rounded-full border border-white/10 bg-background/55 px-3 py-1 text-[11px] font-semibold text-foreground/70 backdrop-blur-md">
            {hull.label}
          </div>
        </div>
      ))}
    </>
  );
}
