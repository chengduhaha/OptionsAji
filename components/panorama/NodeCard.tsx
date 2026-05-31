"use client";

import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";
import type { GraphNode } from "@/lib/supplyGraph";
import { marketFlag } from "./graph-utils";

type CardData = {
  node: GraphNode;
  moatTier?: string | null;
  sparkline: Array<{ x: number; value: number }>;
  onSelectNode?: (node: GraphNode) => void;
};

const SEGMENT_COLORS: Record<string, string> = {
  "AI 分部": "border-purple/40 bg-purple/10",
  "Connectivity 分部": "border-cyan/40 bg-cyan/10",
  "Space 分部": "border-blue/40 bg-blue/10",
};

export function NodeCard({ data, selected }: NodeProps) {
  const { node, moatTier, sparkline, onSelectNode } = data as CardData;
  const isMoat = moatTier === "exclusive" || moatTier === "dominant";
  const isSegment = node.type === "segment";
  const title = node.ticker || node.label;

  return (
    <button
      type="button"
      onClick={() => onSelectNode?.(node)}
      className={cn(
        "relative w-[210px] rounded-xl border bg-panel/90 px-3 py-3 text-left shadow-xl backdrop-blur-xl transition",
        "hover:border-primary/50 hover:shadow-primary/10",
        selected && "border-primary/70",
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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkline}>
            <Line type="monotone" dataKey="value" stroke={isMoat ? "#f0b429" : "#22d3ee"} strokeWidth={1.8} dot={false} />
          </LineChart>
        </ResponsiveContainer>
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

