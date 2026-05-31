"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  ViewportPortal,
  useOnViewportChange,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import { Crosshair } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { GraphEdge, GraphNode, SupplyGraphResponse } from "@/lib/supplyGraph";
import { FloatingEdge } from "./FloatingEdge";
import { graphToFlow } from "./graph-utils";
import { Minimap } from "./Minimap";
import { NodeCard } from "./NodeCard";
import { NodeDetailDrawer } from "./NodeDetailDrawer";
import { SegmentConstellationLayer } from "./SegmentConstellationLayer";
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
  onSelectedNodeChange,
  focusNodeRequest,
}: {
  graph: SupplyGraphResponse | null;
  perspective?: string;
  layout: "layered" | "radial" | "force";
  loading: boolean;
  expandedNodeIds?: string[];
  expandingNodeId?: string | null;
  onExpandNode?: (node: GraphNode) => void;
  onSelectedNodeChange?: (node: GraphNode | null) => void;
  focusNodeRequest?: { nodeId: string; key: number } | null;
}) {
  const { fitView, getViewport, setViewport } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [spotlightNodeId, setSpotlightNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const compact = zoom < 0.42;

  const focusNodeId = useMemo(() => {
    if (!graph?.nodes.length) return null;
    const metaFocus = graph.meta?.focusNodeId;
    if (typeof metaFocus === "string") return metaFocus;
    return graph.nodes[0]?.id ?? null;
  }, [graph]);

  useOnViewportChange({
    onChange: ({ zoom: nextZoom }) => {
      setZoom(nextZoom);
    },
  });

  const applyBoostedFit = useCallback(() => {
    fitView({ padding: 0.08, maxZoom: 1.75, duration: 280 });
    window.setTimeout(() => {
      const vp = getViewport();
      setViewport({ ...vp, zoom: Math.min(1.75, vp.zoom * 1.25) }, { duration: 200 });
    }, 300);
  }, [fitView, getViewport, setViewport]);

  const flow = useMemo(
    () =>
      graphToFlow(graph?.nodes ?? [], graph?.edges ?? [], layout, (node) => {
        setSelectedNode(node);
        setSelectedEdge(null);
        onSelectedNodeChange?.(node);
      }, { compact, spotlightNodeId }),
    [compact, graph, layout, onSelectedNodeChange, spotlightNodeId],
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

  const [fitKey, setFitKey] = useState(0);
  useEffect(() => {
    setFitKey((k) => k + 1);
  }, [graph, layout]);

  useEffect(() => {
    if (loading || !graph?.nodes.length) return;
    const timer = window.setTimeout(() => applyBoostedFit(), 120);
    return () => window.clearTimeout(timer);
  }, [applyBoostedFit, fitKey, graph, loading]);

  useEffect(() => {
    if (!focusNodeRequest?.nodeId) return;
    const nodeId = focusNodeRequest.nodeId;
    setSpotlightNodeId(nodeId);
    const neighborIds = new Set<string>([nodeId]);
    for (const edge of graph?.edges ?? []) {
      if (edge.source === nodeId) neighborIds.add(edge.target);
      if (edge.target === nodeId) neighborIds.add(edge.source);
    }
    fitView({
      nodes: Array.from(neighborIds).map((id) => ({ id })),
      padding: 0.15,
      maxZoom: 1.85,
      duration: 320,
    });
  }, [fitView, focusNodeRequest, graph?.edges]);

  const handleFocusEgo = useCallback(() => {
    if (!focusNodeId) return;
    const neighborIds = new Set<string>([focusNodeId]);
    for (const edge of graph?.edges ?? []) {
      if (edge.source === focusNodeId) neighborIds.add(edge.target);
      if (edge.target === focusNodeId) neighborIds.add(edge.source);
    }
    fitView({
      nodes: Array.from(neighborIds).map((id) => ({ id })),
      padding: 0.12,
      maxZoom: 1.9,
      duration: 320,
    });
  }, [fitView, focusNodeId, graph?.edges]);

  function handleEdgeClick(_: React.MouseEvent, edge: Edge) {
    setSelectedEdge((edge.data?.edge as GraphEdge) ?? null);
    setSelectedNode(null);
    onSelectedNodeChange?.(null);
  }

  function handleNodeMouseEnter(_: React.MouseEvent, node: Node) {
    setSpotlightNodeId(node.id);
  }

  function handleNodeMouseLeave() {
    setSpotlightNodeId(null);
  }

  return (
    <section className="relative h-full min-h-[480px] overflow-hidden rounded-xl border border-white/10 bg-[#07111f] shadow-[inset_0_0_120px_rgba(34,211,238,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(34,211,238,0.13),transparent_34%),radial-gradient(circle_at_70%_70%,rgba(240,180,41,0.1),transparent_32%)]" />
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
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        fitView
        fitViewOptions={{ padding: 0.08, maxZoom: 1.75 }}
        minZoom={0.15}
        maxZoom={1.85}
        nodesDraggable
        elevateNodesOnSelect
        proOptions={{ hideAttribution: true }}
        className="panorama-flow"
      >
        <Background variant={BackgroundVariant.Dots} color="rgba(170,205,255,0.25)" gap={34} size={1.4} />
        {perspective === "company" ? (
          <ViewportPortal>
            <SegmentConstellationLayer nodes={nodes} edges={edges} />
          </ViewportPortal>
        ) : null}
        <Panel position="top-left" className="!m-3">
          <button
            type="button"
            onClick={handleFocusEgo}
            className="flex items-center gap-1.5 rounded-lg border border-cyan/30 bg-background/90 px-2.5 py-1.5 text-[11px] font-medium text-cyan shadow-lg backdrop-blur-md hover:bg-cyan/10"
          >
            <Crosshair className="h-3.5 w-3.5" />
            聚焦视野
          </button>
        </Panel>
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
          onSelectedNodeChange?.(null);
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
  onSelectedNodeChange?: (node: GraphNode | null) => void;
  focusNodeRequest?: { nodeId: string; key: number } | null;
}) {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
