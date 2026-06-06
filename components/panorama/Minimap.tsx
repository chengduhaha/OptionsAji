"use client";

import { MiniMap } from "@xyflow/react";

export function Minimap() {
  return (
    <MiniMap
      pannable
      zoomable
      className="!bottom-4 !left-4 !right-auto !rounded-lg !border !border-foreground/10 !bg-background/80"
      nodeColor={(node) => {
        const data = node.data as { node?: { type?: string } } | undefined;
        return data?.node?.type === "segment" ? "#a855f7" : "#22d3ee";
      }}
      maskColor="rgba(5,10,20,0.72)"
    />
  );
}
