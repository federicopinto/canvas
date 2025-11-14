/**
 * Core type definitions for the canvas application
 */

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type NodeType = 'class' | 'dataclass' | 'protocol';

export type ArrowType = 'inheritance' | 'composition' | 'aggregation' | 'dependency';

export interface SectionItem {
  id: string;
  label: string;
  type?: string;
  vscodeLink?: string;
}

export interface Section {
  id: string;
  label: string;
  items: SectionItem[];
  isCollapsed: boolean;
  children?: Section[];
}

export interface Node {
  id: string;
  type: NodeType;
  label: string;
  position: Position;
  size: Size;
  sections: Section[];
  vscodeLink?: string;
}

export interface Arrow {
  id: string;
  type: ArrowType;
  source: string;
  target: string;
  label?: string;
}

export interface ViewportState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface DragState {
  isDragging: boolean;
  nodeId: string | null;
  startPosition: Position | null;
  offset: Position | null;
}

export interface ResizeState {
  isResizing: boolean;
  nodeId: string | null;
  handle: string | null;
  startSize: Size | null;
  startPosition: Position | null;
}

export interface CanvasState {
  nodes: Node[];
  arrows: Arrow[];
  viewport: ViewportState;
  selectedNodeIds: string[];
  selectedArrowId: string | null;
  dragState: DragState;
  resizeState: ResizeState;
  isPanning: boolean;
}
