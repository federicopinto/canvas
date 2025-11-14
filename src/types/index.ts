export interface Point {
  x: number;
  y: number;
}

export type NodeType = 'class' | 'dataclass' | 'protocol';

export interface NodeData {
  id: string;
  type: NodeType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sections: SectionData[];
  collapsed?: boolean;  // For testing collapse later
}

export interface NodeStyle {
  headerBg: number;      // Hex color
  headerBorder: number;  // Hex color
  bodyBg: number;
  bodyBorder: number;
  borderDashed: boolean;
  typeLabel: string;
  typeLabelColor: number;
}

export interface SectionData {
  id: string;
  title: string;
  items: string[];
  collapsed: boolean;
  children?: SectionData[];
}

export interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

export type ArrowType = 'inheritance' | 'composition' | 'aggregation' | 'dependency';

export interface ArrowData {
  id: string;
  type: ArrowType;
  fromNodeId: string;
  toNodeId: string;
  fromAnchor?: AnchorPoint;  // Auto-calculated if not specified
  toAnchor?: AnchorPoint;
  label?: string;
}

export type AnchorPoint = 'top' | 'right' | 'bottom' | 'left' |
                          'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ArrowStyle {
  color: number;
  lineWidth: number;
  dashPattern?: number[];  // [dash, gap] for dashed lines
  headType: 'triangle' | 'arrow' | 'none';
  tailType: 'filled-diamond' | 'hollow-diamond' | 'none';
}
