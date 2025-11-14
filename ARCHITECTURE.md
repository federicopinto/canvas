# Architecture Document

## Overview

This is a **high-performance interactive diagram canvas** built for visualizing Python class diagrams. The architecture prioritizes GPU acceleration, smooth interactions, and extensibility.

## Technology Choices

### Core Stack
- **Svelte 4**: Chosen for its compiler-based approach with minimal runtime overhead
- **TypeScript**: Full type safety throughout the codebase
- **Pixi.js 7**: WebGL-powered rendering engine (originally designed for games)
- **Vite**: Modern build tool with fast HMR and optimized production builds

### Why Pixi.js?
1. **GPU Acceleration**: Native WebGL rendering (60+ FPS even with 100+ nodes)
2. **Game Engine Optimizations**: Sprite batching, object pooling, efficient transforms
3. **Scene Graph**: Built-in container hierarchy perfect for canvas layers
4. **Mature Ecosystem**: Well-tested, actively maintained, extensive documentation

### Why Svelte?
1. **Minimal Overhead**: Compiles to vanilla JS (no virtual DOM)
2. **Reactive by Default**: Store-based state management built-in
3. **Small Bundle Size**: Only ships code that's actually used
4. **Developer Experience**: Simple syntax, fast compile times

## System Architecture

### High-Level Structure

```
┌─────────────────────────────────────────────────┐
│              Svelte UI Layer                    │
│  (Components, Stores, Reactive State)           │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│           Pixi.js Rendering Engine              │
│  ┌──────────────────────────────────────────┐   │
│  │  Viewport (Camera Transform)             │   │
│  │  ┌────────────────────────────────────┐  │   │
│  │  │  Layer 1: Grid                     │  │   │
│  │  │  Layer 2: Arrows (Future)          │  │   │
│  │  │  Layer 3: Nodes (Future)           │  │   │
│  │  │  Layer 4: UI Overlay (Future)      │  │   │
│  │  └────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│                 WebGL / GPU                     │
└─────────────────────────────────────────────────┘
```

### Data Flow

```
User Input (Mouse/Keyboard)
    ↓
Viewport (Event Handlers)
    ↓
Svelte Stores (State Updates)
    ↓
Reactive Components
    ↓
Pixi.js Scene Graph Update
    ↓
WebGL Rendering (60 FPS)
```

## Module Breakdown

### 1. Core Rendering (`/pixi/`)

#### `PixiCanvas.ts`
**Responsibility**: Application lifecycle and orchestration

- Initializes Pixi.js Application
- Creates and manages viewport
- Coordinates all layers
- Runs main render loop
- Handles window resize

**Key Methods**:
- `constructor(container: HTMLElement)` - Setup
- `update()` - Called every frame (60 FPS)
- `destroy()` - Cleanup
- `getViewportState()` - Export camera position

#### `Viewport.ts`
**Responsibility**: Camera transformations and user controls

- Pan: spacebar + drag, middle mouse button
- Zoom: mousewheel (toward cursor)
- Coordinate conversion (screen ↔ world)
- Event handling with proper cursor feedback

**Key Properties**:
- `x, y` - Camera position
- `scale` - Zoom level (0.1 to 4.0)
- `container` - Pixi.js Container for all canvas content

**Key Methods**:
- `setupEvents()` - Attach mouse/keyboard listeners
- `updateTransform()` - Apply camera matrix
- `screenToWorld()` - Convert coordinates
- `worldToScreen()` - Convert coordinates
- `reset()` - Return to origin

#### `GridLayer.ts`
**Responsibility**: Infinite dot grid rendering

- Draws dots at 20px intervals
- Culls invisible dots (performance optimization)
- Scales with zoom level
- Creates illusion of infinite canvas

**Algorithm**:
```typescript
// Only render visible dots
startX = floor(-viewportX / spacing) * spacing
endX = startX + screenWidth + padding

for (x from startX to endX by spacing)
  for (y from startY to endY by spacing)
    drawDot(x, y)
```

### 2. State Management (`/state/`)

#### `diagramStore.ts`
**Purpose**: Central state for diagram data

Stores:
- `nodes` - Array of NodeData (class boxes)
- `arrows` - Array of ArrowData (connections)
- `selectedNodeIds` - Currently selected nodes

Functions:
- `addNode()`, `removeNode()`, `updateNode()`
- `addArrow()`, `removeArrow()`
- `clearDiagram()`

#### `viewportStore.ts`
**Purpose**: Camera state synchronization

Store:
- `viewportState` - { x, y, scale }

Functions:
- `setViewportPosition()`
- `setViewportScale()`
- `resetViewport()`

**Note**: Currently not connected to Viewport class (will be integrated in Phase 2)

### 3. Type System (`/types/`)

#### `index.ts`
**Purpose**: Type definitions for the entire application

Core Types:
```typescript
interface NodeData {
  id: string
  type: 'class' | 'dataclass' | 'protocol'
  name: string
  x, y, width, height: number
  sections: SectionData[]
}

interface SectionData {
  id: string
  title: string
  items: string[]
  collapsed: boolean
  children?: SectionData[]  // Nested sections
}

interface ArrowData {
  id: string
  type: 'inheritance' | 'composition' | 'aggregation' | 'dependency'
  fromNodeId: string
  toNodeId: string
  label?: string
}
```

### 4. Utilities (`/utils/`)

#### `colors.ts`
**Purpose**: Design system color constants

- Canvas colors (background, grid)
- Node type colors (class, dataclass, protocol)
- UI colors (accent, text, shadows)
- Arrow colors (by relationship type)

All colors exported as:
- Hex number (for Pixi.js): `0xFAFBFC`
- Hex string (for CSS): `'#FAFBFC'`

#### `geometry.ts`
**Purpose**: Math utilities

Functions:
- `distance()` - Between two points
- `angle()` - Between two points
- `lerp()` - Linear interpolation
- `clamp()` - Constrain value
- `snapToGrid()` - For snapping
- `pointInRect()` - Hit testing

### 5. UI Components (`/components/`)

#### `CanvasView.svelte`
**Purpose**: Bridge between Svelte and Pixi.js

- Creates DOM container
- Initializes PixiCanvas on mount
- Cleans up on unmount
- (Future: Will render HTML UI overlays)

#### `App.svelte`
**Purpose**: Root application component

- Mounts CanvasView
- Sets global styles
- (Future: Will include toolbar, modals, etc.)

### 6. Future Systems (Stubs)

#### `SpringAnimator.ts` (Phase 2)
**Purpose**: Physics-based animations

Will implement:
- Spring force calculations (Hooke's law)
- Damping and stiffness parameters
- Animation queue management
- Integration with render loop

Use cases:
- Node movement (drag end)
- Collapse/expand animations
- Auto-layout transitions

#### `InteractionManager.ts` (Phase 2)
**Purpose**: User interaction handling

Will implement:
- Node selection (single and multi)
- Drag and drop with snap-to-grid
- Resize handles (8-point)
- Hover states
- Keyboard shortcuts
- Drag-to-select rectangle

## Performance Considerations

### Current Optimizations

1. **Grid Culling**: Only renders visible dots
   - Formula: `dotsRendered = (screenWidth / spacing) * (screenHeight / spacing)`
   - Typical: ~1000 dots instead of infinite

2. **WebGL Acceleration**: All rendering on GPU
   - No CPU-based canvas drawing
   - Hardware-accelerated transforms

3. **Efficient Event Handling**: Single listeners, event delegation
   - No per-object event listeners (yet)

4. **Minimal React**: Svelte's compiled approach
   - No virtual DOM diffing overhead

### Future Optimizations (Phase 2+)

1. **Spatial Indexing**: Flatbush for fast lookups
   - O(log n) hit testing instead of O(n)
   - Required when 50+ nodes

2. **Object Pooling**: Reuse Pixi.js Graphics objects
   - Reduce GC pressure
   - Important for arrow rendering

3. **Sprite Batching**: Batch similar nodes
   - Single draw call per node type
   - Pixi.js does this automatically

4. **Viewport Culling**: Don't update off-screen nodes
   - Check node bounds vs viewport
   - Skip expensive calculations

## Rendering Pipeline

### Current (Phase 1)

```
Frame Start (60 FPS)
    ↓
Viewport.updateTransform()
    ↓
GridLayer.render(x, y, scale)
    ├── Calculate visible bounds
    ├── Clear graphics
    └── Draw visible dots
    ↓
Pixi.js renders to WebGL
    ↓
Frame End
```

### Future (Phase 2+)

```
Frame Start
    ↓
SpringAnimator.update(deltaTime)
    ├── Update all spring forces
    └── Apply to node positions
    ↓
Viewport.updateTransform()
    ↓
For each layer:
    ├── GridLayer.render()
    ├── ArrowLayer.render()
    │   ├── Calculate paths (A* if needed)
    │   └── Draw curves with Graphics
    ├── NodeLayer.render()
    │   ├── Cull off-screen nodes
    │   ├── Update node Graphics
    │   └── Handle collapse animations
    └── UILayer.render()
        └── Draw selection rectangles, handles
    ↓
Pixi.js batches and renders
    ↓
Frame End
```

## Coordinate Systems

### Screen Space
- Origin: top-left corner of browser window
- Units: pixels
- Example: (0, 0) is top-left, (1920, 1080) is bottom-right on FHD

### World Space
- Origin: center of canvas (0, 0)
- Units: logical pixels (independent of zoom)
- Example: Node at (100, 200) is always at that position regardless of zoom/pan

### Viewport Transform
```
screen = world * scale + offset
world = (screen - offset) / scale

Where:
  offset = (viewport.x, viewport.y)
  scale = viewport.scale
```

## Extension Points

### Adding a New Layer

1. Create class in `/pixi/layers/`
2. Extend Pixi.js Graphics or Container
3. Implement `render(viewportState)` method
4. Add to PixiCanvas layer stack
5. Call `render()` in update loop

Example:
```typescript
export class NodeLayer {
  graphics: PIXI.Container;

  constructor() {
    this.graphics = new PIXI.Container();
  }

  render(nodes: NodeData[], viewport: ViewportState) {
    // Update node positions and appearance
  }
}
```

### Adding a New Node Type

1. Add type to `NodeData.type` union in `types/index.ts`
2. Add colors to `utils/colors.ts`
3. Implement rendering logic in NodeLayer
4. Update diagramStore to handle new type

### Adding a New Interaction

1. Add handler in `InteractionManager`
2. Update state in appropriate store
3. Trigger re-render through reactive stores
4. Optionally animate with `SpringAnimator`

## Design Decisions

### Why Pixi.js Instead of Canvas API?
- **Performance**: WebGL is 10-100x faster for complex scenes
- **Scene Graph**: Built-in hierarchy (viewport → layers → objects)
- **Transforms**: Efficient matrix operations on GPU
- **Battle-Tested**: Used in production games with 1000+ objects

### Why Pixi.js Instead of D3.js?
- **Rendering Focus**: D3 is for data binding, Pixi is for rendering
- **Performance**: D3 uses SVG (slower for many elements)
- **WebGL**: Pixi leverages GPU, D3 doesn't
- **Use Case**: Canvas/games vs. charts/graphs

### Why Not Three.js?
- **Overkill**: Three.js is for 3D, we only need 2D
- **Bundle Size**: Three.js is much larger
- **Complexity**: 3D concepts (cameras, lights) not needed

### Why Svelte Over React/Vue?
- **Performance**: No virtual DOM overhead
- **Bundle Size**: Smaller production builds
- **Simplicity**: Less boilerplate, cleaner code
- **Stores**: Built-in reactive state management

## Testing Strategy

### Phase 1 (Current)
- Manual browser testing
- Visual verification of grid and controls
- Performance monitoring (FPS counter)

### Phase 2+ (Future)
- **Unit Tests**: Vitest for logic (geometry, pathfinding)
- **Integration Tests**: Playwright for interactions
- **Visual Tests**: Screenshot comparison
- **Performance Tests**: Frame timing benchmarks

## Build Output

### Development
- Vite dev server with HMR
- Source maps enabled
- Fast rebuild (< 100ms)

### Production
- Tree-shaken bundle
- Minified TypeScript → ES2020
- Code splitting (if needed)
- Typical size: ~400KB (Pixi.js is largest)

## Dependencies

```json
{
  "pixi.js": "^7.4.0",      // WebGL rendering
  "flatbush": "^4.3.0",     // Spatial indexing (unused yet)
  "svelte": "^4.0.0",       // UI framework
  "typescript": "^5.2.0",   // Type system
  "vite": "^5.0.0"          // Build tool
}
```

Total production bundle (estimated): **~400-500KB gzipped**

## Next Phase Planning

### Phase 2: Core Interactions
1. Implement SpringAnimator with configurable physics
2. Build InteractionManager for drag/select
3. Create NodeLayer with three visual types
4. Add basic arrow rendering (straight lines first)
5. Connect viewport store to Pixi viewport

### Phase 3: Advanced Features
1. Arrow pathfinding (A* algorithm)
2. Collapsible sections with animations
3. Resize handles
4. Auto-layout (hierarchical + force-directed)
5. Export to PNG/SVG

### Phase 4: Polish
1. Toolbar and keyboard shortcuts
2. VSCode deep linking
3. Undo/redo system
4. Performance profiling and optimization
5. Comprehensive test suite

## Success Metrics

### Performance Targets
- **FPS**: Maintain 60 FPS with 50+ nodes
- **Interaction Lag**: < 16ms response time
- **Memory**: < 200MB for typical diagrams
- **Load Time**: < 2s initial render

### Code Quality
- **TypeScript**: 100% coverage, no `any`
- **Modularity**: Single responsibility per module
- **Documentation**: TSDoc on all public APIs
- **Testing**: > 80% unit test coverage (Phase 2+)

---

## Conclusion

This architecture provides a solid foundation for a high-performance diagram canvas. The separation between Svelte (UI/state) and Pixi.js (rendering) allows for:

1. **Performance**: GPU acceleration for smooth 60 FPS
2. **Maintainability**: Clear module boundaries
3. **Extensibility**: Easy to add new features
4. **Type Safety**: Full TypeScript coverage

The foundation is ready for Phase 2 implementation of nodes, interactions, and animations.