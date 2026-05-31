"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  useInternalNode,
  type EdgeProps,
  type InternalNode,
  type Node,
} from "@xyflow/react";

// Intersection of the centre-to-centre line with the target card's rectangle,
// so floating edges always touch the border facing the other node.
function getNodeIntersection(
  intersectionNode: InternalNode<Node>,
  targetNode: InternalNode<Node>,
) {
  const w = (intersectionNode.measured?.width ?? 210) / 2;
  const h = (intersectionNode.measured?.height ?? 130) / 2;
  const x2 = intersectionNode.internals.positionAbsolute.x + w;
  const y2 = intersectionNode.internals.positionAbsolute.y + h;
  const tw = (targetNode.measured?.width ?? 210) / 2;
  const th = (targetNode.measured?.height ?? 130) / 2;
  const x1 = targetNode.internals.positionAbsolute.x + tw;
  const y1 = targetNode.internals.positionAbsolute.y + th;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1);
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = 2 * w * (xx3 + yy3) * 0.5 + x2;
  const y = 2 * h * (-xx3 + yy3) * 0.5 + y2;
  return { x, y };
}

function getEdgeParams(source: InternalNode<Node>, target: InternalNode<Node>) {
  const sourceIntersection = getNodeIntersection(source, target);
  const targetIntersection = getNodeIntersection(target, source);
  return {
    sx: sourceIntersection.x,
    sy: sourceIntersection.y,
    tx: targetIntersection.x,
    ty: targetIntersection.y,
  };
}

export function FloatingEdge({
  id,
  source,
  target,
  markerEnd,
  style,
  data,
  label,
}: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  if (!sourceNode || !targetNode) return null;

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
  });

  const edgeData = data as {
    animated?: boolean;
    particleColor?: string;
    dimmed?: boolean;
    spotlighted?: boolean;
  } | undefined;
  const animated = edgeData?.animated;
  const dimmed = edgeData?.dimmed;
  const particleColor = edgeData?.particleColor ?? "#22d3ee";
  const showParticle = !dimmed;
  const particleRadius = animated ? 3.4 : 2.5;
  const mainStyle = style ?? {};
  const underlayStyle = {
    ...mainStyle,
    stroke: particleColor,
    strokeWidth: Math.max(Number(mainStyle.strokeWidth ?? 2) + 5, 7),
    opacity: dimmed ? 0.05 : 0.18,
  };

  return (
    <>
      <BaseEdge id={`${id}-glow`} path={edgePath} style={underlayStyle} />
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={mainStyle}
        className={animated ? "panorama-edge-flow" : undefined}
      />
      {showParticle ? (
        <circle r={particleRadius} fill={particleColor} className={animated ? "panorama-edge-particle-exclusive" : "panorama-edge-particle"}>
          <animateMotion dur={animated ? "1.15s" : "1.9s"} repeatCount="indefinite" path={edgePath} />
        </circle>
      ) : null}
      {label ? (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-lg backdrop-blur-md transition-opacity"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              borderColor: `${particleColor}66`,
              background: "rgba(9, 18, 34, 0.9)",
              boxShadow: `0 0 18px ${particleColor}22`,
              opacity: dimmed ? 0.25 : 1,
            }}
          >
            {label as string}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
