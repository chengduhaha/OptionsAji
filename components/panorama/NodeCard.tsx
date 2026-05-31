"use client";

import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

import { cn } from "@/lib/utils";
import type { GraphNode } from "@/lib/supplyGraph";
import { marketFlag } from "./graph-utils";

type CardData = {
  node: GraphNode;
  moatTier?: string | null;
  sparkline: Array<{ x: number; value: number }>;
  compact?: boolean;
  dimmed?: boolean;
  highlighted?: boolean;
  onSelectNode?: (node: GraphNode) => void;
};

const SEGMENT_COLORS: Record<string, string> = {
  "AI 分部": "border-purple/40 bg-purple/10",
  "Connectivity 分部": "border-cyan/40 bg-cyan/10",
  "Space 分部": "border-blue/40 bg-blue/10",
};

function SparklineSvg({
  data,
  color,
}: {
  data: Array<{ x: number; value: number }>;
  color: string;
}) {
  if (data.length < 2) return null;
  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const width = 172;
  const height = 32;
  const points = data
    .map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.value - min) / range) * (height - 5) - 2.5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-8 w-full overflow-visible" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function NodeCardComponent({ data, selected }: NodeProps) {
  const { node, moatTier, sparkline, compact, dimmed, highlighted, onSelectNode } = data as CardData;
  const isMoat = moatTier === "exclusive" || moatTier === "dominant";
  const isSegment = node.type === "segment";
  const title = node.ticker || node.label;
  const accent = isMoat ? "#f0b429" : isSegment ? "#a855f7" : "#22d3ee";

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onSelectNode?.(node)}
        title={node.label}
        className={cn(
          "group relative flex h-[52px] min-w-[72px] items-center justify-center rounded-full border bg-background/80 px-3 shadow-xl backdrop-blur-md transition",
          selected ? "border-primary/80" : "border-white/10",
          isSegment && "border-purple/35 bg-purple/15",
          highlighted && "border-primary/70",
          dimmed && "opacity-25 grayscale",
          isMoat && "shadow-[0_0_34px_rgba(240,180,41,0.36)] ring-1 ring-gold/45",
        )}
        style={{ boxShadow: isMoat ? undefined : `0 0 22px ${accent}30` }}
      >
        <Handle type="target" position={Position.Left} className="!h-1.5 !w-1.5 !border-cyan !bg-background" />
        <Handle type="source" position={Position.Right} className="!h-1.5 !w-1.5 !border-gold !bg-background" />
        <span
          className="absolute inset-1 rounded-full opacity-45 blur-md transition group-hover:opacity-70"
          style={{ backgroundColor: accent }}
        />
        <span className="relative max-w-[88px] truncate font-mono text-[11px] font-semibold text-foreground">
          {node.ticker || title.slice(0, 8)}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelectNode?.(node)}
      className={cn(
        "relative w-[210px] rounded-xl border bg-panel/90 px-3 py-3 text-left shadow-xl backdrop-blur-xl transition",
        "hover:border-primary/50 hover:shadow-primary/10",
        selected && "border-primary/70",
        highlighted && "border-primary/60 shadow-primary/10",
        dimmed && "opacity-25 grayscale",
        isSegment ? SEGMENT_COLORS[node.label] ?? "border-purple/30 bg-purple/10" : "border-white/10",
        isMoat && "shadow-[0_0_28px_rgba(240,180,41,0.28)] ring-1 ring-gold/40",
      )}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-cyan !bg-background" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-gold !bg-background" />
      <div className="flex items-start gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-glass text-[12px] font-semibold text-primary">
          {node.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={node.logo} alt="" className="h-7 w-7 rounded-md object-cover" />
          ) : (
            title.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold text-foreground">{node.label}</span>
            <span className="shrink-0 text-[12px]">{marketFlag(node.market)}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            {node.ticker ? (
              <span className="rounded border border-primary/25 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                {node.ticker}
              </span>
            ) : null}
            <span className="truncate text-[10px] text-muted-foreground">{node.sector || node.type}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 h-8">
        <SparklineSvg data={sparkline} color={accent} />
      </div>
      {moatTier ? (
        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">护城河</span>
          <span className={cn("font-semibold", isMoat ? "text-gold" : "text-cyan")}>{moatTier}</span>
        </div>
      ) : null}
    </button>
  );
}

export const NodeCard = memo(NodeCardComponent);
