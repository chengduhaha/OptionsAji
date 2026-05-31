"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
} from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";

import type { GraphEdge, GraphNode, SupplyGraphResponse } from "@/lib/supplyGraph";
import { graphToFlow } from "./graph-utils";
import { Minimap } from "./Minimap";
import { NodeCard } from "./NodeCard";
import { NodeDetailDrawer } from "./NodeDetailDrawer";

const NODE_TYPES = { companyCard: NodeCard };

export function GraphCanvas({
  graph,
  perspective = "company",
  layout,
  loading,
}: {
  graph: SupplyGraphResponse | null;
  perspective?: string;
  layout: "layered" | "radial" | "force";
  loading: boolean;
}) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const flow = useMemo(
    () => graphToFlow(graph?.nodes ?? [], graph?.edges ?? [], layout, (node) => {
      setSelectedNode(node);
      setSelectedEdge(null);
    }),
    [graph, layout],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);

  useEffect(() => {
    setNodes(flow.nodes);
    setEdges(flow.edges);
  }, [flow.edges, flow.nodes, setEdges, setNodes]);

  function handleEdgeClick(_: React.MouseEvent, edge: Edge) {
    setSelectedEdge((edge.data?.edge as GraphEdge) ?? null);
    setSelectedNode(null);
  }

  return (
    <section className="relative h-full overflow-hidden rounded-xl border border-white/10 bg-background/60">
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="rounded-lg border border-white/10 bg-panel px-4 py-3 text-[13px] text-muted-foreground">
            正在加载{perspective === "product" ? "产品链" : "产业链"}图谱…
          </div>
        </div>
      ) : null}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={handleEdgeClick}
        fitView
        minZoom={0.25}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="panorama-flow"
      >
        <Background color="rgba(240,180,41,0.16)" gap={28} />
        <Controls className="!bottom-4 !right-4 !top-auto !rounded-lg !border !border-white/10 !bg-background/80 !shadow-xl" />
        <Minimap />
      </ReactFlow>
      <NodeDetailDrawer
        node={selectedNode}
        edge={selectedEdge}
        onClose={() => {
          setSelectedNode(null);
          setSelectedEdge(null);
        }}
      />
    </section>
  );
}
