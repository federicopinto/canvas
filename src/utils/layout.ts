import dagre from 'dagre';
import type { Node, Arrow } from '../types';
import { LAYOUT } from './constants';

/**
 * Calculate auto-layout using Dagre
 */
export const calculateLayout = (nodes: Node[], arrows: Arrow[]): Node[] => {
  const g = new dagre.graphlib.Graph();

  // Set graph options
  g.setGraph({
    rankdir: LAYOUT.rankDir,
    nodesep: LAYOUT.nodeSep,
    ranksep: LAYOUT.rankSep,
    edgesep: LAYOUT.edgeSep,
    marginx: LAYOUT.marginX,
    marginy: LAYOUT.marginY,
  });

  // Default edge config
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to graph
  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: node.size.width,
      height: node.size.height,
    });
  });

  // Add edges to graph
  arrows.forEach((arrow) => {
    g.setEdge(arrow.source, arrow.target);
  });

  // Calculate layout
  dagre.layout(g);

  // Update node positions
  const layoutedNodes: Node[] = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        // Dagre uses center position, we need top-left
        x: nodeWithPosition.x - node.size.width / 2,
        y: nodeWithPosition.y - node.size.height / 2,
      },
    };
  });

  return layoutedNodes;
};

/**
 * Calculate bounding box of all nodes
 */
export const calculateBounds = (
  nodes: Node[]
): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } => {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + node.size.width);
    maxY = Math.max(maxY, node.position.y + node.size.height);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * Calculate viewport transform to fit all nodes
 */
export const calculateFitToScreen = (
  nodes: Node[],
  viewportWidth: number,
  viewportHeight: number,
  padding: number = 40
): { scale: number; translateX: number; translateY: number } => {
  const bounds = calculateBounds(nodes);

  if (bounds.width === 0 || bounds.height === 0) {
    return { scale: 1, translateX: 0, translateY: 0 };
  }

  const scaleX = (viewportWidth - padding * 2) / bounds.width;
  const scaleY = (viewportHeight - padding * 2) / bounds.height;
  const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  const translateX = viewportWidth / 2 - centerX * scale;
  const translateY = viewportHeight / 2 - centerY * scale;

  return { scale, translateX, translateY };
};
