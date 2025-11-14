import { writable } from 'svelte/store';
import type { NodeData, ArrowData } from '../types';

/**
 * Store for diagram nodes (class boxes)
 */
export const nodes = writable<NodeData[]>([]);

/**
 * Store for arrows (connections between nodes)
 */
export const arrows = writable<ArrowData[]>([]);

/**
 * Store for selected node IDs
 */
export const selectedNodeIds = writable<string[]>([]);

/**
 * Add a node to the diagram
 */
export function addNode(node: NodeData) {
  nodes.update((n) => [...n, node]);
}

/**
 * Remove a node from the diagram
 */
export function removeNode(nodeId: string) {
  nodes.update((n) => n.filter((node) => node.id !== nodeId));
  // Also remove any arrows connected to this node
  arrows.update((a) =>
    a.filter((arrow) => arrow.fromNodeId !== nodeId && arrow.toNodeId !== nodeId)
  );
}

/**
 * Update a node in the diagram
 */
export function updateNode(nodeId: string, updates: Partial<NodeData>) {
  nodes.update((n) =>
    n.map((node) => (node.id === nodeId ? { ...node, ...updates } : node))
  );
}

/**
 * Add an arrow to the diagram
 */
export function addArrow(arrow: ArrowData) {
  arrows.update((a) => [...a, arrow]);
}

/**
 * Remove an arrow from the diagram
 */
export function removeArrow(arrowId: string) {
  arrows.update((a) => a.filter((arrow) => arrow.id !== arrowId));
}

/**
 * Clear all nodes and arrows
 */
export function clearDiagram() {
  nodes.set([]);
  arrows.set([]);
  selectedNodeIds.set([]);
}
