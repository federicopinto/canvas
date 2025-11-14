/**
 * Application-wide constants matching exact spec requirements
 */

// Canvas colors
export const CANVAS = {
  background: '#FAFBFC',
  gridDots: '#E1E4E8',
  gridDotSize: 2,
  gridSpacing: 20,
} as const;

// Node type colors (exact hex values from spec)
export const NODE_COLORS = {
  class: {
    headerBg: '#DAE8FC',
    headerBorder: '#6C8EBF',
    bodyBg: '#FFFFFF',
    bodyBorder: '#6C8EBF',
  },
  dataclass: {
    headerBg: '#E1D5E7',
    headerBorder: '#9673A6',
    bodyBg: '#FFFFFF',
    bodyBorder: '#9673A6',
  },
  protocol: {
    headerBg: '#FFF2CC',
    headerBorder: '#D6B656',
    bodyBg: '#FFFFFF',
    bodyBorder: '#D6B656',
  },
} as const;

// Node sizing
export const NODE = {
  defaultWidth: 280,
  minWidth: 200,
  maxWidth: 600,
  minHeight: 60,
  headerHeight: 44,
  borderRadius: 8,
  borderWidth: 2,
  shadow: '0px 2px 8px rgba(0,0,0,0.12)',
  selectedShadow: '0px 4px 16px rgba(0,0,0,0.24)',
  dragShadow: '0px 4px 16px rgba(0,0,0,0.16)',
  dragScale: 1.02,
  hoverScale: 1.01,
} as const;

// Section styling
export const SECTION = {
  headerHeight: 32,
  headerBg: '#F8F9FA',
  headerHoverBg: '#E9ECEF',
  headerBorder: '#DEE2E6',
  itemHeight: 24,
  nestIndent: 16,
  maxNestLevel: 4,
} as const;

// Arrow types and colors (exact from spec)
export const ARROW_STYLES = {
  inheritance: {
    color: '#2C3E50',
    strokeWidth: 2,
    dashArray: '',
    headType: 'hollowTriangle',
    tailType: null,
  },
  composition: {
    color: '#34495E',
    strokeWidth: 2,
    dashArray: '',
    headType: 'arrow',
    tailType: 'filledDiamond',
  },
  aggregation: {
    color: '#7F8C8D',
    strokeWidth: 2,
    dashArray: '',
    headType: 'arrow',
    tailType: 'hollowDiamond',
  },
  dependency: {
    color: '#95A5A6',
    strokeWidth: 2,
    dashArray: '4 3',
    headType: 'arrow',
    tailType: null,
  },
} as const;

// Arrow sizing
export const ARROW = {
  strokeWidth: 2,
  hoverStrokeWidth: 3,
  triangleBase: 12,
  triangleHeight: 10,
  arrowSize: 8,
  diamondWidth: 10,
  diamondHeight: 6,
} as const;

// Viewport/Zoom
export const VIEWPORT = {
  minScale: 0.1,
  maxScale: 4.0,
  scaleStep: 0.1,
  defaultScale: 1,
  zoomDuration: 150,
  panDuration: 200,
} as const;

// Layout (Dagre)
export const LAYOUT = {
  rankDir: 'TB',
  nodeSep: 120,
  rankSep: 100,
  edgeSep: 10,
  marginX: 40,
  marginY: 40,
} as const;

// Animation timings (exact from spec)
export const ANIMATION = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 400,
  choreographed: 600,
  easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  deceleration: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  acceleration: 'cubic-bezier(0.4, 0.0, 1, 1)',
} as const;

// Spacing (8px grid system)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// Typography
export const TYPOGRAPHY = {
  headerFont: '-apple-system, "Segoe UI", sans-serif',
  codeFont: '"SF Mono", "Consolas", monospace',
  bodySize: 14,
  codeSize: 12,
  headerSize: 14,
  badgeSize: 9,
  sectionHeaderSize: 11,
  lineHeight: 1.5,
  codeLineHeight: 1.4,
} as const;

// Colors (general)
export const COLORS = {
  textPrimary: '#24292E',
  textSecondary: '#6A737D',
  accent: '#667EEA',
  sectionBg: '#F8F9FA',
  sectionHoverBg: '#E9ECEF',
  contentHoverBg: '#F1F3F5',
} as const;

// Selection
export const SELECTION = {
  borderColor: '#667EEA',
  borderWidth: 2,
  rectFill: 'rgba(102, 126, 234, 0.1)',
  rectStroke: '#667EEA',
  rectStrokeWidth: 1,
  rectDashArray: '4 4',
} as const;

// Resize handles
export const RESIZE_HANDLE = {
  size: 8,
  fill: '#FFFFFF',
  borderWidth: 2,
} as const;

// Toolbar
export const TOOLBAR = {
  buttonSize: 36,
  iconSize: 18,
  bg: 'rgba(255, 255, 255, 0.9)',
  hoverBg: '#F1F3F5',
  activeBg: '#E9ECEF',
  borderRadius: 12,
  buttonRadius: 6,
  padding: '8px 12px',
  shadow: '0px 4px 12px rgba(0,0,0,0.1)',
  backdropBlur: 8,
} as const;
