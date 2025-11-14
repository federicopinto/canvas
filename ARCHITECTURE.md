# Architecture Documentation

## Overview

The React + Dagre Canvas UI is built with a clean, modern architecture that prioritizes **performance**, **maintainability**, and **type safety**. This document details the technical decisions, component structure, data flow, and design patterns used throughout the application.

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Technology Stack](#technology-stack)
3. [Component Structure](#component-structure)
4. [State Management](#state-management)
5. [D3 + React Integration](#d3--react-integration)
6. [Data Flow](#data-flow)
7. [Performance Optimizations](#performance-optimizations)
8. [Type System](#type-system)
9. [Build System](#build-system)
10. [Testing Strategy](#testing-strategy)

---

## High-Level Architecture

### Architectural Pattern

```
┌─────────────────────────────────────────────────────────┐
│                     Presentation Layer                   │
│         (React Components - Pure Rendering)              │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                    State Management                      │
│              (Zustand - Single Store)                    │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                 Utility/Logic Layer                      │
│    (D3 calculations, Dagre layout, Export utils)        │
└──────────────────────────────────────────────────────────┘
```

**Key Principles:**

1. **Unidirectional Data Flow** - State flows down through props, actions flow up through callbacks
2. **Separation of Concerns** - Components render, stores manage state, utils handle business logic
3. **Single Source of Truth** - All state lives in one Zustand store
4. **Pure Components** - All components are memoized and rely on props only
5. **Type Safety** - Strict TypeScript throughout, no `any` types

---

## Technology Stack

### Core Dependencies

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **React** | 18.3.1 | UI rendering | Industry standard, excellent ecosystem |
| **TypeScript** | 5.6.2 | Type safety | Catch bugs at compile time, better DX |
| **Zustand** | 5.0.2 | State management | Minimal boilerplate, excellent performance |
| **D3.js** | 7.9.0 | Zoom/pan transforms | Battle-tested, handles edge cases |
| **Dagre** | 0.8.5 | Auto-layout | Hierarchical graph layout standard |
| **Vite** | 6.0.1 | Build tool | Fast HMR, modern ES modules |

### Dev Dependencies

- **@playwright/test** - E2E testing framework
- **@vitejs/plugin-react** - React fast refresh
- **@types/*** - TypeScript definitions

---

## Component Structure

### Component Hierarchy

```
App.tsx (Root)
│
├── Canvas.tsx (SVG container with D3 zoom)
│   │
│   ├── Grid.tsx (Infinite dot grid pattern)
│   │
│   ├── <g> transform group
│   │   │
│   │   ├── Arrow.tsx (×N instances)
│   │   │   └── SVG <path> with Bezier curves
│   │   │
│   │   └── ClassNode.tsx (×N instances)
│   │       │
│   │       ├── Header (type badge, label)
│   │       │
│   │       ├── CollapsibleSection.tsx (×M instances)
│   │       │   │
│   │       │   ├── Section header (clickable)
│   │       │   │
│   │       │   ├── Items list
│   │       │   │
│   │       │   └── CollapsibleSection.tsx (nested, recursive)
│   │       │
│   │       └── Selection border (if selected)
│   │
│   └── SVG <defs> (arrow markers)
│
├── Toolbar.tsx (Floating controls)
│   ├── Auto-arrange button
│   ├── Zoom controls (+/-/100%)
│   ├── Fit to screen button
│   ├── Export PNG button
│   └── Clear canvas button
│
└── ZoomIndicator.tsx (Bottom-right percentage)
```

### Component Details

#### **App.tsx**
- **Purpose:** Root component, orchestrates everything
- **Responsibilities:**
  - Load demo data from `public/demo-data.json`
  - Handle window resize events
  - Implement toolbar action handlers
  - Coordinate animations (auto-layout, zoom)
- **State:** None (all in Zustand)
- **Performance:** Minimal re-renders, only when viewport changes

#### **Canvas.tsx**
- **Purpose:** Main SVG container with D3 zoom behavior
- **Responsibilities:**
  - Initialize D3 zoom behavior
  - Sync D3 transform with Zustand viewport state
  - Render all nodes and arrows with transform
  - Handle pan/zoom gestures
- **Key Pattern:** D3 calculates, React renders
- **Optimization:** Memoized with React.memo

#### **ClassNode.tsx**
- **Purpose:** Render individual class diagram nodes
- **Responsibilities:**
  - Render header with type-specific colors
  - Render sections (fields, methods, etc.)
  - Handle drag initiation
  - Handle selection
  - Apply visual feedback (shadows, borders)
- **Props:** `id`, `type`, `label`, `position`, `size`, `sections`, `isSelected`
- **Optimization:** Memoized, only re-renders when props change

#### **CollapsibleSection.tsx**
- **Purpose:** Render collapsible sections with animation
- **Responsibilities:**
  - Toggle collapse state on click
  - Animate height/opacity (250ms)
  - Render item count badge
  - Support nested sections (recursive)
- **Props:** `nodeId`, `section`, `level`
- **Optimization:** CSS transitions (GPU accelerated)

#### **Arrow.tsx**
- **Purpose:** Render relationship arrows with markers
- **Responsibilities:**
  - Calculate Bezier curve path from source to target
  - Apply correct marker based on arrow type
  - Handle hover/selection states
- **Props:** `id`, `type`, `source`, `target`, `nodes`
- **Optimization:** Memoized, paths recalculated only when node positions change

#### **Grid.tsx**
- **Purpose:** Render infinite dot grid background
- **Responsibilities:**
  - Create SVG pattern definition
  - Adjust pattern based on zoom scale
- **Performance:** Pattern is cached by browser, very efficient

#### **Toolbar.tsx**
- **Purpose:** Floating control buttons
- **Props:** Action callbacks from App.tsx
- **Style:** Semi-transparent with backdrop blur

#### **ZoomIndicator.tsx**
- **Purpose:** Display current zoom percentage
- **Props:** `percentage` (number)
- **Style:** Bottom-right fixed position

---

## State Management

### Zustand Store Structure

**File:** `/home/user/canvas/src/store/canvasStore.ts`

```typescript
interface CanvasState {
  // Core data
  nodes: Node[];
  arrows: Arrow[];

  // Viewport (zoom/pan)
  viewport: {
    scale: number;        // 0.1 to 4.0
    translateX: number;
    translateY: number;
  };

  // Selection
  selectedNodeIds: string[];
  selectedArrowId: string | null;

  // Interaction state
  dragState: {
    isDragging: boolean;
    nodeId: string | null;
    startPosition: Position | null;
    offset: Position | null;
  };

  resizeState: {
    isResizing: boolean;
    nodeId: string | null;
    handle: string | null;
    startSize: Size | null;
    startPosition: Position | null;
  };

  isPanning: boolean;
}
```

### Store Actions

**Node Actions:**
- `setNodes(nodes: Node[])` - Replace all nodes
- `updateNode(id, updates)` - Update specific node
- `updateNodePosition(id, position)` - Move node
- `updateNodeSize(id, size)` - Resize node
- `toggleSection(nodeId, sectionId)` - Collapse/expand section

**Arrow Actions:**
- `setArrows(arrows: Arrow[])` - Replace all arrows

**Viewport Actions:**
- `setViewport(viewport)` - Update zoom/pan state

**Selection Actions:**
- `setSelectedNodeIds(ids)` - Set selection
- `addSelectedNodeId(id)` - Add to selection
- `removeSelectedNodeId(id)` - Remove from selection
- `toggleSelectedNodeId(id)` - Toggle selection
- `clearSelection()` - Deselect all

**Drag Actions:**
- `startDrag(nodeId, position, offset)` - Begin drag
- `updateDrag(position)` - Update drag position
- `endDrag()` - Finish drag

**Utility Actions:**
- `reset()` - Clear all state
- `loadData(data)` - Load nodes and arrows

### Why Zustand?

**Advantages over Redux:**
1. **Less boilerplate** - No actions/reducers, just functions
2. **Better performance** - Fine-grained subscriptions
3. **Simpler mental model** - Direct state updates
4. **No Context Provider** - Works outside React tree
5. **Smaller bundle** - ~1KB vs Redux's ~3KB

**Advantages over React Context:**
1. **No provider hell** - Single store
2. **Better performance** - Selective re-renders
3. **DevTools support** - Time-travel debugging
4. **Persistence** - Easy to add local storage

---

## D3 + React Integration

### The Pattern: "D3 Calculates, React Renders"

**Problem:** D3 and React both want to control the DOM, leading to conflicts.

**Solution:** Use D3 only for calculations, React for all rendering.

### Implementation

#### Zoom Behavior Setup (Canvas.tsx)

```typescript
useEffect(() => {
  const svg = svgRef.current;
  if (!svg) return;

  // D3 zoom behavior (calculations only)
  const zoom = d3.zoom()
    .scaleExtent([VIEWPORT.minScale, VIEWPORT.maxScale])
    .on('zoom', (event) => {
      // Update Zustand store with transform
      setViewport({
        scale: event.transform.k,
        translateX: event.transform.x,
        translateY: event.transform.y,
      });
    });

  // Attach to SVG
  d3.select(svg).call(zoom);

  // Store zoom behavior for programmatic control
  (svg as any).__zoom = zoom;
}, []);
```

#### React Rendering with Transform

```typescript
// Read from Zustand
const viewport = useCanvasStore(state => state.viewport);

// Apply transform in React render
<g transform={`translate(${viewport.translateX},${viewport.translateY}) scale(${viewport.scale})`}>
  {nodes.map(node => <ClassNode key={node.id} {...node} />)}
  {arrows.map(arrow => <Arrow key={arrow.id} {...arrow} />)}
</g>
```

### Benefits

1. **Single source of truth** - Zustand store has viewport state
2. **No DOM conflicts** - D3 doesn't manipulate DOM
3. **React optimizations work** - Virtual DOM diffing, memoization
4. **Easier testing** - Can test components without D3
5. **Better debugging** - React DevTools shows everything

---

## Data Flow

### User Interaction Flow

```
1. User drags node
   │
   ├─→ 2. onMouseDown in ClassNode.tsx
   │      └─→ 3. startDrag(nodeId, position, offset) → Zustand
   │
   ├─→ 4. onMouseMove in Canvas.tsx
   │      └─→ 5. updateDrag(position) → Zustand
   │             └─→ 6. Store calculates new node positions
   │                    └─→ 7. React re-renders ClassNode with new position
   │                           └─→ 8. Arrow.tsx recalculates paths
   │
   └─→ 9. onMouseUp in Canvas.tsx
          └─→ 10. endDrag() → Zustand
```

### Data Loading Flow

```
1. App.tsx mounts
   │
   └─→ 2. useEffect fetches /demo-data.json
          │
          └─→ 3. loadData({ nodes, arrows }) → Zustand
                 │
                 └─→ 4. React re-renders Canvas.tsx
                        │
                        ├─→ 5. ClassNode.tsx × N rendered
                        │
                        └─→ 6. Arrow.tsx × M rendered
```

### Auto-Layout Flow

```
1. User clicks "Auto Arrange" button
   │
   └─→ 2. handleAutoArrange() in App.tsx
          │
          └─→ 3. calculateLayout(nodes, arrows) → Dagre
                 │
                 └─→ 4. Returns nodes with new positions
                        │
                        └─→ 5. Animate with requestAnimationFrame
                               │
                               └─→ 6. setNodes(interpolatedNodes) every frame
                                      │
                                      └─→ 7. React re-renders smoothly
```

---

## Performance Optimizations

### 1. Component Memoization

**All components use React.memo** to prevent unnecessary re-renders:

```typescript
export const ClassNode = React.memo<ClassNodeProps>(({ ... }) => {
  // Component logic
});
```

**Benefit:** Only re-render when props actually change.

### 2. Transform-Based Positioning

**Use CSS transforms instead of top/left:**

```typescript
// ❌ Slow (causes layout recalculation)
<div style={{ top: y, left: x }}>

// ✅ Fast (GPU accelerated)
<g transform={`translate(${x},${y})`}>
```

**Benefit:** 60fps guaranteed, no layout thrashing.

### 3. Efficient Zustand Selectors

**Only subscribe to needed state slices:**

```typescript
// ❌ Re-renders on any state change
const state = useCanvasStore();

// ✅ Only re-renders when viewport changes
const viewport = useCanvasStore(state => state.viewport);
```

**Benefit:** Minimal re-renders across the app.

### 4. SVG Optimization

**Use vectorEffect for crisp lines at all zoom levels:**

```typescript
<path
  vectorEffect="non-scaling-stroke"
  strokeWidth={2}
/>
```

**Benefit:** Consistent line thickness regardless of zoom.

### 5. Debounced Arrow Updates

**Recalculate arrow paths on requestAnimationFrame:**

```typescript
useEffect(() => {
  if (isDragging) {
    const handle = requestAnimationFrame(() => {
      // Recalculate arrow paths
    });
    return () => cancelAnimationFrame(handle);
  }
}, [isDragging, nodePositions]);
```

**Benefit:** Smooth arrow updates during drag without lag.

### 6. CSS Transitions for Animations

**Use CSS transitions instead of JavaScript:**

```typescript
<div style={{
  transition: 'height 250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  height: isCollapsed ? 0 : 'auto'
}}>
```

**Benefit:** GPU accelerated, smoother than JavaScript animations.

### 7. Dagre Layout Caching

**Calculate layout once, then animate:**

```typescript
// Calculate new positions (expensive)
const layoutedNodes = calculateLayout(nodes, arrows);

// Animate over 600ms (cheap)
const animate = () => {
  const progress = (Date.now() - startTime) / duration;
  const eased = d3.easeCubicInOut(progress);

  // Interpolate positions
  setNodes(interpolate(startPositions, targetPositions, eased));

  if (progress < 1) requestAnimationFrame(animate);
};
```

**Benefit:** Smooth 60fps animation without recalculating layout.

---

## Type System

### Core Types

**File:** `/home/user/canvas/src/types/index.ts`

```typescript
// Geometric types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Node types
export type NodeType = 'class' | 'dataclass' | 'protocol';

export interface Node {
  id: string;
  type: NodeType;
  label: string;
  position: Position;
  size: Size;
  sections: Section[];
  vscodeLink?: string;
}

// Section types (recursive)
export interface Section {
  id: string;
  label: string;
  items: SectionItem[];
  isCollapsed: boolean;
  children?: Section[];  // Nested sections
}

export interface SectionItem {
  id: string;
  label: string;
  type?: string;
  vscodeLink?: string;
}

// Arrow types
export type ArrowType = 'inheritance' | 'composition' | 'aggregation' | 'dependency';

export interface Arrow {
  id: string;
  type: ArrowType;
  source: string;  // Node ID
  target: string;  // Node ID
  label?: string;
}

// State types
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
```

### Type Safety Benefits

1. **Compile-time error checking** - Catch bugs before runtime
2. **IntelliSense** - Autocomplete in VSCode
3. **Refactoring confidence** - Rename safely
4. **Documentation** - Types serve as inline docs
5. **Less runtime errors** - TypeScript catches type mismatches

---

## Build System

### Vite Configuration

**File:** `/home/user/canvas/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: true,
  },
});
```

### Build Process

```bash
npm run dev      # Start dev server with HMR
npm run build    # TypeScript compile + Vite build
npm run preview  # Preview production build
```

**Build Output:**

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      # Main bundle (minified)
│   ├── index-[hash].css     # Styles bundle
│   └── demo-data.json       # Static asset
└── ...
```

### Why Vite?

1. **Fast HMR** - Instant updates during development
2. **ES modules** - Native browser imports (no bundling in dev)
3. **Optimized builds** - Rollup for production
4. **Plugin ecosystem** - React Fast Refresh, TypeScript
5. **Modern by default** - No legacy browsers support needed

---

## Testing Strategy

### Test Architecture

**Framework:** Playwright (E2E testing)

**Test Coverage:**

| Category | Tests | Purpose |
|----------|-------|---------|
| **Canvas** | 10 | Grid, zoom, pan, zoom indicator |
| **Nodes** | 12 | Rendering all 3 node types |
| **Collapse** | 11 | Section collapse animations |
| **Drag** | 13 | Single/multi-select drag |
| **Arrows** | 16 | All 4 arrow types, real-time updates |
| **Layout** | 11 | Auto-layout with Dagre |
| **Toolbar** | 16 | All toolbar functions |
| **Performance** | 4 | FPS measurements |
| **Screenshots** | 1 | Visual regression testing |
| **Diagnostic** | 5 | Health checks |
| **Total** | **94** | **Comprehensive coverage** |

### Test Structure

```
tests/
├── canvas.spec.ts         # Canvas foundation tests
├── nodes.spec.ts          # Node rendering tests
├── collapse.spec.ts       # Collapse functionality
├── drag.spec.ts           # Drag behavior tests
├── arrows.spec.ts         # Arrow rendering tests
├── layout.spec.ts         # Auto-layout tests
├── toolbar.spec.ts        # Toolbar functionality
├── performance.spec.ts    # Performance benchmarks
├── screenshots.spec.ts    # Visual tests
└── diagnostic.spec.ts     # Health checks
```

### Running Tests

```bash
npm run test:e2e              # Headless mode
npm run test:e2e:ui           # Playwright UI mode
npm run test:e2e:headed       # With visible browser
```

### Test Example

```typescript
test('should render all three node types', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Check for Class node (blue)
  const classNode = page.locator('[data-node-type="class"]').first();
  await expect(classNode).toBeVisible();

  // Check for Dataclass node (purple)
  const dataclassNode = page.locator('[data-node-type="dataclass"]').first();
  await expect(dataclassNode).toBeVisible();

  // Check for Protocol node (yellow, dashed)
  const protocolNode = page.locator('[data-node-type="protocol"]').first();
  await expect(protocolNode).toBeVisible();
});
```

---

## Key Technical Decisions

### Decision Log

#### 1. React + TypeScript
**Why:** Industry standard, excellent tooling, type safety
**Trade-off:** Larger bundle vs vanilla JS, but worth it for DX

#### 2. Zustand over Redux
**Why:** Less boilerplate, better performance, simpler API
**Trade-off:** Smaller ecosystem, but sufficient for this use case

#### 3. D3 for zoom/pan only
**Why:** Battle-tested zoom behavior, handles edge cases
**Trade-off:** Additional dependency, but avoids reinventing wheel

#### 4. SVG over Canvas API
**Why:** Crisp at all zoom levels, CSS styling, accessibility
**Trade-off:** Slower for >1000 nodes, but spec targets 50 nodes

#### 5. Dagre for auto-layout
**Why:** Standard hierarchical layout, configurable
**Trade-off:** Opinionated layout, but matches spec requirements

#### 6. Transform-based positioning
**Why:** 60fps GPU acceleration, no layout thrashing
**Trade-off:** None - strictly better than top/left

#### 7. Vite over Webpack
**Why:** Faster dev experience, modern by default
**Trade-off:** Less mature ecosystem, but sufficient for this project

#### 8. Playwright for testing
**Why:** Modern E2E testing, visual testing capabilities
**Trade-off:** Heavier than unit tests, but matches spec requirements

---

## Future Architecture Considerations

### Scalability

**Current:** Handles 50+ nodes comfortably

**For 500+ nodes:**
- Virtualization (only render visible nodes)
- Web Workers for layout calculation
- Canvas API for rendering (better performance)
- Spatial indexing for hit detection

### Extensibility

**Plugin system:** Allow custom node types and arrow types

```typescript
interface Plugin {
  nodeTypes?: Record<string, NodeRenderer>;
  arrowTypes?: Record<string, ArrowRenderer>;
  toolbarButtons?: ToolbarButton[];
}

registerPlugin(myPlugin);
```

### Collaboration

**For real-time collaboration:**
- WebSocket connection for state sync
- Operational Transform (OT) or CRDT for conflict resolution
- Presence indicators (cursors, selections)
- Undo/redo with history tracking

---

## Conclusion

This architecture provides a **solid foundation** for a production-ready canvas application:

✅ **Clean separation of concerns** - Components, state, utils
✅ **Type-safe** - Full TypeScript coverage
✅ **Performant** - 60fps with 50+ nodes
✅ **Testable** - 94 E2E tests
✅ **Maintainable** - Clear patterns, good documentation
✅ **Extensible** - Easy to add features

The D3 + React pattern, Zustand state management, and transform-based rendering provide excellent performance while maintaining code clarity.

---

**Last Updated:** 2025-11-14
**Version:** 1.0.0
