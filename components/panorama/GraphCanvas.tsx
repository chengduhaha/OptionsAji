"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useOnViewportChange,
  type Edge,
} from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";

import type { GraphEdge, GraphNode, SupplyGraphResponse } from "@/lib/supplyGraph";
import { FloatingEdge } from "./FloatingEdge";
import { graphToFlow } from "./graph-utils";
import { Minimap } from "./Minimap";
import { NodeCard } from "./NodeCard";
import { NodeDetailDrawer } from "./NodeDetailDrawer";
import { useForceLayout } from "./useForceLayout";

const NODE_TYPES = { companyCard: NodeCard };
const EDGE_TYPES = { floating: FloatingEdge };

function GraphCanvasInner({
  graph,
  perspective = "company",
  layout,
  loading,
  expandedNodeIds = [],
  expandingNodeId,
  onExpandNode,
}: {
  graph: SupplyGraphResponse | null;
  perspective?: string;
  layout: "layered" | "radial" | "force";
  loading: boolean;
  expandedNodeIds?: string[];
  expandingNodeId?: string | null;
  onExpandNode?: (node: GraphNode) => void;
}) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [zoom, setZoom] = useState(1);
  const compact = zoom < 0.58;

  useOnViewportChange({
    onChange: ({ zoom: nextZoom }) => {
      setZoom(nextZoom);
    },
  });

  const flow = useMemo(
    () =>
      graphToFlow(graph?.nodes ?? [], graph?.edges ?? [], layout, (node) => {
        setSelectedNode(node);
        setSelectedEdge(null);
        onExpandNode?.(node);
      }, { compact }),
    [compact, graph, layout, onExpandNode],
  );

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    onNodeDoubleClick,
  } = useForceLayout(flow.nodes, flow.edges, layout === "force");

  // Remount React Flow so fitView re-centres when topology or layout changes.
  const [fitKey, setFitKey] = useState(0);
  useEffect(() => {
    setFitKey((k) => k + 1);
  }, [graph, layout]);

  function handleEdgeClick(_: React.MouseEvent, edge: Edge) {
    setSelectedEdge((edge.data?.edge as GraphEdge) ?? null);
    setSelectedNode(null);
  }

  return (
    <section className="relative h-full overflow-hidden rounded-xl border border-white/10 bg-[#05070d]">
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="rounded-lg border border-white/10 bg-panel px-4 py-3 text-[13px] text-muted-foreground">
            正在加载{perspective === "product" ? "产品链" : "产业链"}图谱…
          </div>
        </div>
      ) : null}
      <ReactFlow
        key={fitKey}
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={handleEdgeClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeDoubleClick={onNodeDoubleClick}
        fitView
        fitViewOptions={{ padding: 0.25, maxZoom: 1.1 }}
        minZoom={0.15}
        maxZoom={1.6}
        nodesDraggable
        elevateNodesOnSelect
        proOptions={{ hideAttribution: true }}
        className="panorama-flow"
      >
        <Background variant={BackgroundVariant.Dots} color="rgba(120,160,255,0.18)" gap={34} size={1.4} />
        <Controls className="!bottom-4 !right-4 !top-auto !rounded-lg !border !border-white/10 !bg-background/80 !shadow-xl" />
        <Minimap />
      </ReactFlow>
      <NodeDetailDrawer
        node={selectedNode}
        edge={selectedEdge}
        expanded={selectedNode ? expandedNodeIds.includes(selectedNode.id) : false}
        expanding={selectedNode ? expandingNodeId === selectedNode.id : false}
        onExpand={onExpandNode}
        onClose={() => {
          setSelectedNode(null);
          setSelectedEdge(null);
        }}
      />
    </section>
  );
}

export function GraphCanvas(props: {
  graph: SupplyGraphResponse | null;
  perspective?: string;
  layout: "layered" | "radial" | "force";
  loading: boolean;
  expandedNodeIds?: string[];
  expandingNodeId?: string | null;
  onExpandNode?: (node: GraphNode) => void;
}) {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
