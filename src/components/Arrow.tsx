import { memo, useMemo, useState } from 'react';
import type { Arrow as ArrowType, Node } from '../types';
import { ARROW_STYLES, ARROW, ANIMATION } from '../utils/constants';
import * as d3 from 'd3';

interface ArrowProps {
  arrow: ArrowType;
  sourceNode: Node | undefined;
  targetNode: Node | undefined;
  isSelected: boolean;
}

/**
 * Calculate anchor points on node edges (8 points: 4 edges + 4 corners)
 */
const getAnchorPoints = (node: Node) => {
  const { x, y } = node.position;
  const { width, height } = node.size;

  return {
    top: { x: x + width / 2, y },
    bottom: { x: x + width / 2, y: y + height },
    left: { x, y: y + height / 2 },
    right: { x: x + width, y: y + height / 2 },
    topLeft: { x, y },
    topRight: { x: x + width, y },
    bottomLeft: { x, y: y + height },
    bottomRight: { x: x + width, y: y + height },
  };
};

/**
 * Find the best two anchor points to minimize distance
 */
const getBestAnchorPoints = (
  sourceNode: Node,
  targetNode: Node
): { source: { x: number; y: number }; target: { x: number; y: number } } => {
  const sourceAnchors = getAnchorPoints(sourceNode);
  const targetAnchors = getAnchorPoints(targetNode);

  let bestDistance = Infinity;
  let bestPair = {
    source: sourceAnchors.right,
    target: targetAnchors.left,
  };

  Object.values(sourceAnchors).forEach((sourceAnchor) => {
    Object.values(targetAnchors).forEach((targetAnchor) => {
      const distance = Math.sqrt(
        Math.pow(targetAnchor.x - sourceAnchor.x, 2) +
          Math.pow(targetAnchor.y - sourceAnchor.y, 2)
      );
      if (distance < bestDistance) {
        bestDistance = distance;
        bestPair = { source: sourceAnchor, target: targetAnchor };
      }
    });
  });

  return bestPair;
};

/**
 * Generate smooth Bezier curve path
 */
const generatePath = (
  source: { x: number; y: number },
  target: { x: number; y: number }
): string => {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Control point offset (creates S-curve)
  const offset = Math.min(distance * 0.5, 100);

  const line = d3.line().curve(d3.curveBasis);

  const points: [number, number][] = [
    [source.x, source.y],
    [source.x + offset * Math.sign(dx), source.y],
    [target.x - offset * Math.sign(dx), target.y],
    [target.x, target.y],
  ];

  return line(points) || '';
};

export const Arrow = memo(({ arrow, sourceNode, targetNode, isSelected }: ArrowProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const pathData = useMemo(() => {
    if (!sourceNode || !targetNode) return null;

    const { source, target } = getBestAnchorPoints(sourceNode, targetNode);
    const path = generatePath(source, target);

    return { path, source, target };
  }, [sourceNode, targetNode]);

  if (!pathData) return null;

  const style = ARROW_STYLES[arrow.type];
  const strokeWidth = isHovered ? ARROW.hoverStrokeWidth : style.strokeWidth;

  const markerEndId = `arrow-${arrow.type}-end`;
  const markerStartId = `arrow-${arrow.type}-start`;

  return (
    <g>
      <path
        d={pathData.path}
        fill="none"
        stroke={isSelected ? '#667EEA' : style.color}
        strokeWidth={strokeWidth}
        strokeDasharray={style.dashArray}
        markerEnd={style.headType ? `url(#${markerEndId})` : undefined}
        markerStart={style.tailType ? `url(#${markerStartId})` : undefined}
        style={{
          cursor: 'pointer',
          transition: `stroke-width ${ANIMATION.fast}ms ${ANIMATION.easing}, stroke ${ANIMATION.fast}ms ${ANIMATION.easing}`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Hover/Click target (invisible wider path) */}
      <path
        d={pathData.path}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {arrow.label && (
        <text
          x={(pathData.source.x + pathData.target.x) / 2}
          y={(pathData.source.y + pathData.target.y) / 2}
          fill={style.color}
          fontSize="9px"
          textAnchor="middle"
          style={{ pointerEvents: 'none' }}
        >
          <tspan
            style={{
              fill: '#FFFFFF',
              stroke: '#FFFFFF',
              strokeWidth: 3,
              paintOrder: 'stroke',
            }}
          >
            {arrow.label}
          </tspan>
          <tspan>{arrow.label}</tspan>
        </text>
      )}
    </g>
  );
});

Arrow.displayName = 'Arrow';

/**
 * Arrow Markers (SVG defs)
 * Must be defined once in the SVG
 */
export const ArrowMarkers = memo(() => {
  return (
    <defs>
      {/* Inheritance - Hollow Triangle */}
      <marker
        id="arrow-inheritance-end"
        markerWidth={ARROW.triangleBase}
        markerHeight={ARROW.triangleHeight}
        refX={ARROW.triangleBase - 1}
        refY={ARROW.triangleHeight / 2}
        orient="auto"
      >
        <polygon
          points={`0,0 ${ARROW.triangleBase},${ARROW.triangleHeight / 2} 0,${ARROW.triangleHeight}`}
          fill="white"
          stroke={ARROW_STYLES.inheritance.color}
          strokeWidth="2"
        />
      </marker>

      {/* Composition - Filled Diamond (tail) */}
      <marker
        id="arrow-composition-start"
        markerWidth={ARROW.diamondWidth}
        markerHeight={ARROW.diamondHeight}
        refX={ARROW.diamondWidth / 2}
        refY={ARROW.diamondHeight / 2}
        orient="auto"
      >
        <polygon
          points={`0,${ARROW.diamondHeight / 2} ${ARROW.diamondWidth / 2},0 ${ARROW.diamondWidth},${ARROW.diamondHeight / 2} ${ARROW.diamondWidth / 2},${ARROW.diamondHeight}`}
          fill={ARROW_STYLES.composition.color}
          stroke={ARROW_STYLES.composition.color}
          strokeWidth="1"
        />
      </marker>

      {/* Composition - Arrow (head) */}
      <marker
        id="arrow-composition-end"
        markerWidth={ARROW.arrowSize}
        markerHeight={ARROW.arrowSize}
        refX={ARROW.arrowSize - 1}
        refY={ARROW.arrowSize / 2}
        orient="auto"
      >
        <polygon
          points={`0,0 ${ARROW.arrowSize},${ARROW.arrowSize / 2} 0,${ARROW.arrowSize}`}
          fill={ARROW_STYLES.composition.color}
        />
      </marker>

      {/* Aggregation - Hollow Diamond (tail) */}
      <marker
        id="arrow-aggregation-start"
        markerWidth={ARROW.diamondWidth}
        markerHeight={ARROW.diamondHeight}
        refX={ARROW.diamondWidth / 2}
        refY={ARROW.diamondHeight / 2}
        orient="auto"
      >
        <polygon
          points={`0,${ARROW.diamondHeight / 2} ${ARROW.diamondWidth / 2},0 ${ARROW.diamondWidth},${ARROW.diamondHeight / 2} ${ARROW.diamondWidth / 2},${ARROW.diamondHeight}`}
          fill="white"
          stroke={ARROW_STYLES.aggregation.color}
          strokeWidth="2"
        />
      </marker>

      {/* Aggregation - Arrow (head) */}
      <marker
        id="arrow-aggregation-end"
        markerWidth={ARROW.arrowSize}
        markerHeight={ARROW.arrowSize}
        refX={ARROW.arrowSize - 1}
        refY={ARROW.arrowSize / 2}
        orient="auto"
      >
        <polygon
          points={`0,0 ${ARROW.arrowSize},${ARROW.arrowSize / 2} 0,${ARROW.arrowSize}`}
          fill={ARROW_STYLES.aggregation.color}
        />
      </marker>

      {/* Dependency - Simple Arrow */}
      <marker
        id="arrow-dependency-end"
        markerWidth={ARROW.arrowSize}
        markerHeight={ARROW.arrowSize}
        refX={ARROW.arrowSize - 1}
        refY={ARROW.arrowSize / 2}
        orient="auto"
      >
        <polygon
          points={`0,0 ${ARROW.arrowSize},${ARROW.arrowSize / 2} 0,${ARROW.arrowSize}`}
          fill={ARROW_STYLES.dependency.color}
        />
      </marker>
    </defs>
  );
});

ArrowMarkers.displayName = 'ArrowMarkers';
