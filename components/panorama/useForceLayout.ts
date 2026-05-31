"use client";

import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";

// Card footprint (see NodeCard.tsx ~210x130). Collision radius keeps cards
// from overlapping so the field reads as discrete "stars" rather than a pile.
const NODE_RADIUS = 132;

type Kind = "focus" | "segment" | "supplier";

interface SimNode extends SimulationNodeDatum {
  id: string;
  kind: Kind;
  anchorX: number;
  anchorY: number;
}

type SimLink = SimulationLinkDatum<SimNode>;

function kindOf(node: Node, focusId: string | undefined): Kind {
  if (node.id === focusId) return "focus";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = (node.data as any)?.node?.type;
  return t === "segment" ? "segment" : "supplier";
}

/**
 * Drives a React Flow graph with a live d3-force simulation: strong charge
 * spreads nodes into a star-field, collision prevents overlap, weak positional
 * anchors keep each segment's suppliers clustered ("dispersed but orderly"),
 * and dragging re-heats the sim so neighbours glide out of the way.
 *
 * When `enabled` is false (layered / radial layouts) the precomputed static
 * positions from `seedNodes` are used as-is.
 */
export function useForceLayout(
  seedNodes: Node[],
  seedEdges: Edge[],
  enabled: boolean,
) {
  const [nodes, setNodes, onNodesChange] = useNodesState(seedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(seedEdges);
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const simNodesRef = useRef<Map<string, SimNode>>(new Map());

  // A stable signature so we only rebuild the simulation when the actual graph
  // topology (not object identity) changes.
  const signature = useMemo(
    () =>
      `${enabled}|${seedNodes.map((n) => n.id).join(",")}|${seedEdges
        .map((e) => e.id)
        .join(",")}`,
    [enabled, seedEdges, seedNodes],
  );

  useEffect(() => {
    setEdges(seedEdges);

    // Static layouts: stop any running sim and use seed positions directly.
    if (!enabled) {
      simRef.current?.stop();
      simRef.current = null;
      simNodesRef.current = new Map();
      setNodes(seedNodes);
      return;
    }

    const focusId = seedNodes[0]?.id;
    const simNodes: SimNode[] = seedNodes.map((n) => ({
      id: n.id,
      kind: kindOf(n, focusId),
      x: n.position.x,
      y: n.position.y,
      anchorX: n.position.x,
      anchorY: n.position.y,
    }));
    const byId = new Map(simNodes.map((n) => [n.id, n]));
    simNodesRef.current = byId;

    // Pin the focus node at the field's centre so the layout stays anchored.
    const focus = focusId ? byId.get(focusId) : undefined;
    if (focus) {
      focus.fx = focus.anchorX;
      focus.fy = focus.anchorY;
    }

    const simLinks: SimLink[] = seedEdges
      .filter((e) => byId.has(e.source) && byId.has(e.target))
      .map((e) => ({ source: e.source, target: e.target }));

    const sim = forceSimulation<SimNode, SimLink>(simNodes)
      .force(
        "charge",
        forceManyBody<SimNode>().strength(-1650).distanceMax(1100),
      )
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance((l) => {
            const s = l.source as SimNode;
            const t = l.target as SimNode;
            // focus→segment trunks short & tight; segment→supplier spokes long.
            if (s.kind === "focus" || t.kind === "focus") return 230;
            return 200;
          })
          .strength(0.14),
      )
      .force(
        "collide",
        forceCollide<SimNode>(NODE_RADIUS).strength(0.95).iterations(2),
      )
      .force(
        "x",
        forceX<SimNode>((d) => d.anchorX).strength((d) =>
          d.kind === "segment" ? 0.07 : 0.025,
        ),
      )
      .force(
        "y",
        forceY<SimNode>((d) => d.anchorY).strength((d) =>
          d.kind === "segment" ? 0.07 : 0.025,
        ),
      )
      .alpha(1)
      .alphaDecay(0.022)
      .velocityDecay(0.32);

    sim.on("tick", () => {
      setNodes((prev) =>
        prev.map((n) => {
          const s = byId.get(n.id);
          if (!s) return n;
          return { ...n, position: { x: s.x ?? 0, y: s.y ?? 0 } };
        }),
      );
    });

    simRef.current = sim;
    return () => {
      sim.on("tick", null);
      sim.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  // --- drag wiring: tug the dragged node, neighbours flow via the sim ---
  const onNodeDragStart = useCallback((_: unknown, node: Node) => {
    const sim = simRef.current;
    const s = simNodesRef.current.get(node.id);
    if (!sim || !s) return;
    sim.alphaTarget(0.3).restart();
    s.fx = node.position.x;
    s.fy = node.position.y;
  }, []);

  const onNodeDrag = useCallback((_: unknown, node: Node) => {
    const s = simNodesRef.current.get(node.id);
    if (!s) return;
    s.fx = node.position.x;
    s.fy = node.position.y;
  }, []);

  const onNodeDragStop = useCallback((_: unknown, node: Node) => {
    const sim = simRef.current;
    const s = simNodesRef.current.get(node.id);
    if (!sim || !s) return;
    sim.alphaTarget(0);
    // Pin where dropped (Neo4j-style); double-click releases it again.
    s.fx = node.position.x;
    s.fy = node.position.y;
  }, []);

  // Double-click a node to unpin it and let the field re-balance smoothly.
  const onNodeDoubleClick = useCallback((_: unknown, node: Node) => {
    const sim = simRef.current;
    const s = simNodesRef.current.get(node.id);
    if (!sim || !s || s.kind === "focus") return;
    s.fx = null;
    s.fy = null;
    sim.alphaTarget(0.25).restart();
    window.setTimeout(() => sim.alphaTarget(0), 600);
  }, []);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    onNodeDoubleClick,
  };
}
