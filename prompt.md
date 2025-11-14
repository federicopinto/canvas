# Build a Modern Python Class Diagram Canvas UI

## Context

You are running in **Claude Code on the web** - a cloud-based development environment with isolated infrastructure. You have access to this repository and can install any tools, libraries, or dependencies you need. Your goal is to build a production-quality, interactive canvas UI from scratch.

---

## Product Vision

Build a beautiful, polished class diagram canvas that feels like a modern design tool (think Figma, draw.io, or Excalidraw) but purpose-built for Python code visualization.

This is an infinite canvas where developers explore code structure visually. Every interaction should feel smooth, responsive, and delightful. The UI should disappear and let the diagrams shine.

---

## Core Requirements

### 1. INFINITE CANVAS

**Visual Appearance:**
- Background: subtle dot grid (2px dots, 20px spacing, #E5E5E5 on white / #333 on dark)
- Canvas extends infinitely in all directions
- Grid scrolls with pan (creates illusion of infinite space)
- Origin indicator (small compass/crosshair) stays fixed at 0,0

**Pan Behavior:**
- Method 1: Hold middle mouse button + drag
- Method 2: Hold spacebar + left mouse drag
- Cursor changes to "grab" hand icon while panning
- Smooth deceleration when releasing (easing over 200ms)
- No pan boundaries - can pan forever

**Zoom Behavior:**
- Mousewheel up = zoom in, down = zoom out
- Zoom levels: 10% to 400% in smooth increments
- Zoom origin: cursor position (zoom toward where mouse is pointing)
- Show zoom percentage in bottom-right corner (e.g., "100%")
- Zoom affects node sizes AND grid spacing proportionally
- Smooth zoom animation (150ms ease-out)
- Ctrl/Cmd + 0 to reset to 100%
- Ctrl/Cmd + mousewheel for faster zoom

---

### 2. CLASS NODES

**Visual Design (exact specifications):**

Node dimensions:
- Default width: 280px
- Min width: 200px, max width: 600px
- Height: auto-calculated based on content
- Min height: 60px (just header)
- Border radius: 8px
- Drop shadow: 0px 2px 8px rgba(0,0,0,0.12)
- Selected shadow: 0px 4px 16px rgba(0,0,0,0.24)

Header section (all node types):
- Height: 44px
- Padding: 12px 16px
- Display: Class name (bold, 14pt) + type badge (small, 9pt)

Three visual types:

**Type 1: Regular Class**
- Header background: #DAE8FC (light blue)
- Header border: 2px solid #6C8EBF (medium blue)
- Body background: #FFFFFF
- Body border: 2px solid #6C8EBF (left, right, bottom)
- Type badge: "class" in gray italic text

**Type 2: Dataclass**
- Header background: #E1D5E7 (light purple)
- Header border: 2px solid #9673A6 (medium purple)
- Body background: #FFFFFF
- Body border: 2px solid #9673A6
- Type badge: "@dataclass" in purple

**Type 3: Protocol**
- Header background: #FFF2CC (light yellow)
- Header border: 2px dashed #D6B656 (yellow, dashed!)
- Body background: #FFFFFF
- Body border: 2px dashed #D6B656
- Type badge: "«protocol»" in orange italic

**Content Sections:**
Each node can contain multiple nested sections (see Section 3 for collapse behavior)

---

### 3. NESTED COLLAPSIBLE SECTIONS (Critical!)

**Visual Structure Example:**
```
┌─────────────────────────────┐
│ DataView          @dataclass│  ← Header (always visible)
├─────────────────────────────┤
│ [-] Fields (4)              │  ← Section header (clickable)
│   • x: int                  │  ← Content (visible when expanded)
│   • y: str                  │
│   [-] Metadata (2)          │  ← NESTED section header
│     • created_at: datetime  │  ← Nested content
│     • author: str           │
├─────────────────────────────┤
│ [+] Methods (3)             │  ← Collapsed section
└─────────────────────────────┘
```

**Section Header Styling:**
- Height: 32px
- Background: #F8F9FA (light gray)
- Hover background: #E9ECEF (slightly darker)
- Font: 11pt semi-bold
- Padding: 8px 12px
- Cursor: pointer
- Border-bottom: 1px solid #DEE2E6

**Collapse Indicators:**
- Collapsed state: [+] icon (or ▶ triangle)
- Expanded state: [-] icon (or ▼ triangle)
- Icon position: left side of header
- Item count badge: right side (e.g., "(4)" in gray)

**Collapse Animation:**
- Duration: 250ms
- Easing: cubic-bezier(0.4, 0.0, 0.2, 1) (Material Design standard)
- Animate height from current → 0px (collapse) or 0px → auto (expand)
- Fade content opacity simultaneously (1.0 → 0.0 or vice versa)
- Node shadow should remain stable during animation (no flickering)

**Nested Behavior:**
- Sections can nest up to 4 levels deep
- Collapsing parent section hides ALL children (preserve child state)
- Expanding parent reveals children in their previous state
- Each level indents by 16px
- Visual hierarchy: subtle left border (2px) for nested levels

**Content Line Items:**
- Height: 24px per line
- Font: 10pt monospace
- Padding: 4px 12px
- Hover: subtle background highlight (#F1F3F5)
- Clickable for VSCode linking (see section 8)

---

### 4. DRAGGING & MOVING

**Drag Initiation:**
- Click and hold on node (not on section headers or content items)
- Cursor changes to "grabbing" hand immediately
- Node lifts up visually (shadow increases from 8px → 16px blur)
- Z-index increases (appears above other nodes)
- Slight scale increase (1.0 → 1.02) for emphasis

**During Drag:**
- Node follows cursor exactly (no lag, no smoothing)
- Connected arrows update in real-time (see section 6)
- Other nodes don't move
- If snap-to-grid enabled: position snaps to 20px grid while dragging
- Grid snap provides subtle "magnetic" feedback

**Drag End:**
- Release mouse button
- Node settles into position (250ms ease-out animation)
- Shadow returns to normal
- Scale returns to 1.0
- Z-index returns to normal

**Multi-Select Drag:**
- Shift+click to add nodes to selection
- Drag any selected node → all selected nodes move together
- Relative positions preserved
- Visual feedback: all selected nodes have accent borders

**Edge Cases:**
- Dragging outside visible canvas: auto-pan in that direction
- Overlapping nodes allowed (no collision detection for now)
- Can't drag while a section is mid-animation

---

### 5. RESIZING

**Resize Handles:**
- Only visible when node is selected
- 8 handles: 4 corners + 4 edges
- Handle appearance: small squares (8px × 8px), white with 2px border
- Handle color matches node border color
- Handles sit exactly on border (half inside, half outside)

**Resize Behavior:**
- Corner handles: resize width AND height
- Edge handles: resize only that dimension
- Shift+drag corner: maintain aspect ratio
- Min/max constraints enforced (see section 2)
- Content reflows in real-time

**During Resize:**
- Cursor changes based on handle:
  - Corners: nwse-resize or nesw-resize
  - Edges: ew-resize or ns-resize
- Node border highlights
- Content inside reflows/wraps dynamically
- Section collapse states preserved

**Resize + Collapse Interaction:**
- Width resize: affects all content lines (wrapping if needed)
- Height resize: doesn't affect auto-height sections (height still based on content)
- Collapsed sections: maintain collapsed state during resize

---

### 6. CONNECTION ARROWS (Beautiful & Intelligent)

**Arrow Types & Visual Style:**

**Type 1: Inheritance**
- Line: 2px solid, color #2C3E50 (dark gray)
- Head: Hollow equilateral triangle (12px base, 10px height)
- Meaning: "extends" or "inherits from"

**Type 2: Composition**
- Line: 2px solid, color #34495E
- Tail: Filled diamond (10px × 6px)
- Head: Simple arrow (8px × 6px)
- Meaning: "contains" or "owns"

**Type 3: Aggregation**
- Line: 2px solid, color #7F8C8D
- Tail: Hollow diamond (10px × 6px)
- Head: Simple arrow
- Meaning: "has a" (weak ownership)

**Type 4: Dependency/Uses**
- Line: 2px dashed (4px dash, 3px gap), color #95A5A6
- Head: Simple arrow
- Meaning: "uses" or "depends on"

**Auto-Routing Algorithm Requirements:**
- Arrows connect from edge midpoints or corner anchor points (8 possible per node)
- Choose anchor points that minimize total path length
- Path should avoid overlapping nodes when possible
- Use one of these routing styles (pick what looks best):
  - **Orthogonal routing**: Only 90° angles, rounded corners (12px radius)
  - **Bezier curves**: Smooth S-curves between anchor points
  - **Straight + curved hybrid**: Straight line from node, curve at midpoint

**Example Routing Scenarios:**

Scenario A: Simple direct connection
```
[Node A] ──────────────→ [Node B]
(Straight line, no obstacles)
```

Scenario B: Obstacle avoidance
```
[Node A] ─┐
          │  [Node C]  (obstacle)
          └─────────→ [Node B]
(Routes around Node C with rounded corners)
```

Scenario C: Vertical relationship
```
    [Parent]
       │
       ↓
    [Child]
(Simple vertical line with arrow)
```

**Arrow Interactivity:**
- Hover: line thickens to 3px + subtle glow
- Click: arrow selected (highlighted, shows delete button)
- Selected arrows have accent color overlay
- Delete key removes selected arrows

**Real-Time Updates:**
- When node moves, arrows redraw immediately (no lag)
- Recalculate anchor points each frame during drag
- No flickering or path jitter
- Smooth transitions when routing changes (100ms)

**Arrow Labels (optional):**
- Small text labels on arrow midpoint
- Background: white rounded rectangle (4px radius)
- Text: 9pt gray, describes relationship type
- Example: "uses", "extends", "1..n"

---

### 7. SELECTION & HIGHLIGHTING

**Single Selection:**
- Click node → 2px accent border appears (#667EEA purple)
- Previous selection clears
- Selected node shows resize handles
- Cursor changes to "move" when hovering body

**Multi-Selection:**
- Shift+click to add/remove from selection
- All selected nodes show accent borders
- Drag-select: Click canvas + drag → dashed rectangle appears
  - Rectangle style: 1px dashed blue, semi-transparent fill
  - Any node touching rectangle gets selected on release

**Hover States:**
- Node hover: subtle shadow increase (8px → 10px blur)
- Section header hover: background darkens slightly
- Content line hover: background highlight (#F8F9FA)
- Arrow hover: thickness increases + glow effect

**Deselection:**
- Click empty canvas background
- Escape key
- Selection border fades out (150ms)

**Visual Feedback:**
- Selected: 2px accent border (#667EEA)
- Hover: shadow + scale (1.0 → 1.01)
- Active drag: shadow + scale (1.0 → 1.02)
- Disabled/locked: 50% opacity + no-drop cursor

---

### 8. VSCODE DEEP LINKING

**What's Clickable:**
- Class name in header
- Every field name
- Every method name
- NOT clickable: type annotations, section headers, badges

**Visual Affordance:**
- Default state: normal text
- Hover state:
  - Cursor changes to pointer
  - Text underline appears (1px, color matches node border)
  - Slight color shift (10% darker)
  - Optional: small "↗" icon appears to the right

**Click Behavior:**
- Single click opens VSCode at exact line
- No double-click required
- Visual feedback: brief highlight flash (100ms yellow background)
- If VSCode not running: show toast message "Opening in VSCode..."

**Link Format:**
Each clickable element needs this data attribute:
```
data-vscode-link="vscode://file/absolute/path/to/file.py:42"
```

**Accessibility:**
- Links should have title/tooltip showing: "Jump to definition (Line 42)"
- Tooltip appears after 500ms hover
- Keyboard accessible: Tab focuses next link, Enter activates

---

### 9. AUTO-LAYOUT INTELLIGENCE

**Layout Button:**
- Position: Top toolbar
- Label: "Auto Arrange" or layout icon (⚡)
- Tooltip: "Organize diagram automatically"

**Layout Algorithm Behavior:**
- Analyzes all nodes and arrows
- Creates hierarchical layout:
  - Root nodes (no incoming arrows) at top
  - Inheritance flows top → down
  - Peer nodes (same level) spread horizontally
  - Related clusters grouped together
- Spacing:
  - Horizontal gap between nodes: 120px
  - Vertical gap between levels: 100px
  - Margin from canvas edge: 40px

**Animation:**
- Nodes smoothly animate to new positions (600ms ease-in-out)
- All nodes move simultaneously (choreographed)
- Arrows update in real-time during animation
- No stuttering or jank
- User can cancel by pressing Escape mid-animation

**After Auto-Layout:**
- Nodes can still be manually adjusted
- "Reset Layout" button appears to undo manual changes

---

### 10. TOOLBAR (Minimal & Elegant)

**Position & Style:**
- Floating toolbar at top-center of viewport
- Always visible (doesn't pan with canvas)
- Background: semi-transparent white (#FFFFFF with 90% opacity, 8px blur)
- Border radius: 12px
- Padding: 8px 12px
- Shadow: 0px 4px 12px rgba(0,0,0,0.1)

**Buttons (left to right):**
1. **Auto Arrange** (⚡ icon)
2. **Zoom Out** (− icon) - tooltip: "Zoom out (Ctrl+-)"
3. **Zoom Reset** (100% text) - tooltip: "Reset zoom (Ctrl+0)"
4. **Zoom In** (+ icon) - tooltip: "Zoom in (Ctrl++)"
5. **Fit to Screen** (⛶ icon) - tooltip: "Fit all nodes"
6. **Export PNG** (📥 icon) - tooltip: "Download as image"
7. **Clear Canvas** (🗑 icon) - tooltip: "Delete all nodes"

**Button Style:**
- Size: 36px × 36px
- Background: transparent, hover: #F1F3F5
- Border radius: 6px
- Icon: 18px, color #495057
- Separator: 1px vertical line (#DEE2E6) between button groups

**Interactions:**
- Hover: background appears (150ms fade)
- Click: ripple effect (Material Design style)
- Active state: background #E9ECEF
- Disabled: 40% opacity + no-drop cursor

---

### 11. AESTHETIC DETAILS

**Typography:**
- Headers: -apple-system, "Segoe UI", sans-serif
- Code/content: "SF Mono", "Consolas", monospace
- Body text: 14px / 1.5 line height
- Code text: 12px / 1.4 line height

**Color Palette:**
- Canvas background: #FAFBFC
- Node backgrounds: #FFFFFF
- Borders: various (per node type, see section 2)
- Text primary: #24292E (almost black)
- Text secondary: #6A737D (gray)
- Accent: #667EEA (purple)
- Grid dots: #E1E4E8

**Spacing System (8px base):**
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px

**Shadows:**
- Subtle: 0px 2px 4px rgba(0,0,0,0.08)
- Default: 0px 2px 8px rgba(0,0,0,0.12)
- Elevated: 0px 4px 16px rgba(0,0,0,0.16)
- Dramatic: 0px 8px 24px rgba(0,0,0,0.24)

**Animation Timing:**
- Instant: 0ms (click feedback)
- Fast: 150ms (hover states)
- Normal: 250ms (collapse/expand)
- Slow: 400ms (zoom, pan)
- Choreographed: 600ms (auto-layout)

**Easing Functions:**
- Standard: cubic-bezier(0.4, 0.0, 0.2, 1)
- Deceleration: cubic-bezier(0.0, 0.0, 0.2, 1)
- Acceleration: cubic-bezier(0.4, 0.0, 1, 1)

---

### 12. KEYBOARD SHORTCUTS

**Navigation:**
- Spacebar + drag: Pan canvas
- Ctrl/Cmd + mousewheel: Zoom
- Ctrl/Cmd + 0: Reset zoom to 100%
- Ctrl/Cmd + 1: Fit all nodes in view

**Selection:**
- Click: Select node
- Shift + click: Add to selection
- Ctrl/Cmd + A: Select all nodes
- Escape: Deselect all

**Editing:**
- Delete/Backspace: Delete selected nodes
- Ctrl/Cmd + Z: Undo (nice to have, not required)

**Collapse:**
- Double-click section header: Toggle collapse
- Ctrl/Cmd + click section: Collapse all at that level

---

### 13. INTERACTION SCENARIOS (User Stories)

**Scenario 1: First Time User**
1. Opens blank canvas (shows subtle hint: "API ready - send commands to build diagram")
2. External tool sends `addClassNode()` commands
3. Nodes appear with smooth fade-in (300ms)
4. Auto-arranged by default on first load
5. User zooms out to see full picture
6. Clicks class name → VSCode opens → "aha!" moment

**Scenario 2: Exploring Large Codebase (50+ nodes)**
1. Diagram loads with all nodes
2. User overwhelmed at first
3. Clicks "Auto Arrange" → beautiful hierarchy appears
4. Zooms to 50% to see full structure
5. Identifies cluster of interest
6. Zooms to 150% on that cluster
7. Collapses irrelevant sections to reduce noise
8. Follows arrow chain to understand dependency flow
9. Clicks method → jumps to code

**Scenario 3: Creating Clean Layout**
1. Auto-layout creates decent starting point
2. User wants to group related classes manually
3. Shift-clicks 4 related nodes
4. Drags them together to corner
5. Resizes one node to emphasize importance
6. Collapse implementation details (methods section)
7. Arrows automatically re-route around new positions
8. Exports beautiful PNG for documentation

**Scenario 4: Understanding Inheritance**
1. Sees protocol node at top (dashed border catches eye)
2. Follows solid arrow down to implementing class
3. Clicks arrow → highlights both nodes briefly
4. Sees composition diamond → understands ownership
5. Visual hierarchy makes inheritance tree obvious

---

### 14. EDGE CASES & ERROR STATES

**Empty Canvas:**
- Show subtle centered text: "Canvas ready"
- Grid visible
- Toolbar active but export/clear disabled

**No Connections:**
- Nodes exist but no arrows
- Auto-layout uses simple grid
- Still looks clean and organized

**Circular Dependencies:**
- Arrows should still render (even if circular)
- Auto-routing might create loops (acceptable)
- Don't infinite loop during auto-layout

**Overlapping Nodes:**
- Allowed (no collision detection)
- Z-index based on selection state
- User can manually separate

**Extremely Long Content:**
- Node width expands up to max (600px)
- Content wraps to multiple lines
- Very long single words: ellipsis truncation with tooltip

**Broken VSCode Links:**
- Click still attempts to open
- If fails: toast message "Could not open VSCode"
- Link visual style unchanged (not error state)

**Performance (50+ nodes):**
- Should still be smooth
- If lag occurs: reduce shadow blur, simplify animations
- Consider virtualizing arrows (only render visible ones)

---

### 15. WHAT SUCCESS LOOKS LIKE

**Visual Quality:**
- Looks professional enough to screenshot for documentation
- Arrows are beautiful and don't create spaghetti
- Color scheme is pleasant, not garish
- Typography is crisp and readable
- Spacing feels generous, not cramped

**Interaction Quality:**
- Dragging feels smooth and responsive (60fps)
- Collapse animations are satisfying to watch
- Zoom feels natural (like Google Maps)
- Clicking elements has immediate visual feedback
- No lag, no jank, no stuttering

**Functional Quality:**
- VSCode links work reliably
- Auto-layout produces readable diagrams
- Arrows route intelligently around obstacles
- Multi-level collapse preserves state correctly
- Export PNG captures canvas accurately

**Emotional Quality:**
- Developers WANT to use this tool
- Feels delightful, not just functional
- "Wow" moment when arrows re-route smoothly
- Pride in sharing exported diagrams
- Reduces friction in understanding code

---

### WHAT THIS IS NOT:
- Not a full diagramming tool with 100 shape types
- Not collaborative/real-time
- Not a code editor
- Not mobile-responsive (desktop only, mouse required)
- Not a Visio replacement (purpose-built for code only)

---

## Implementation & Testing Workflow

### YOUR MISSION:

Plan, build, test, and refine this canvas UI using a multi-agent orchestration approach. You are running in a cloud environment with isolated infrastructure - you have unlimited compute resources. Use them strategically.

---

### PHASE 1: PLANNING & ARCHITECTURE

**What to do:**
1. Analyze the requirements above
2. **Choose your tech stack** (you have complete freedom):
   - Vanilla JS + SVG? React? Vue? Svelte? Lit?
   - Canvas API? D3.js? Fabric.js? Konva.js? Paper.js?
   - Routing library: Elkjs? Dagre? Custom algorithm?
   - Build tools: Vite? Webpack? Parcel? None (single file)?
   - **Be creative!** Explore different approaches each time
3. Create architecture document outlining:
   - File structure
   - Core modules/components
   - Data flow
   - Testing strategy
4. Justify your choices (explain trade-offs)

**IMPORTANT - Encourage Variation:**
If you're aware this prompt might be run multiple times in parallel, **deliberately choose different architectural approaches** to explore the solution space. For example:
- One instance could use vanilla JS + SVG with custom animation engine
- Another could use React + D3.js with spring physics
- Another could use Canvas API with WebGL acceleration
- Another could use Web Components with custom element definitions

**Prioritize originality and experimentation.** Novel approaches that work well will be rewarded.

**Recommended approach:** Launch a **Plan agent** to design the architecture before writing code.

---

### PHASE 2: TESTING STRATEGY

**Visual & Animation Testing (Modern Approach):**

You will use **Playwright for browser automation + Visual Analysis** for comprehensive UI validation.

**1. Playwright Setup:**

Check if Playwright MCP tools are available. If not, install Playwright:

```bash
# Option 1: Install Playwright MCP globally
claude mcp add playwright npx -- @playwright/mcp@latest

# Option 2: Install Playwright directly
npm install -D @playwright/test
npx playwright install
```

Or use Python Playwright if preferred:
```bash
pip install playwright
playwright install
```

**MCP Tools Available (once configured):**
- `mcp__playwright__browser_navigate(url)` - Open your local HTML file
- `mcp__playwright__browser_snapshot()` - Get accessibility tree snapshot
- `mcp__playwright__browser_take_screenshot()` - Capture visual state
- `mcp__playwright__browser_click()`, `browser_hover()`, `browser_drag()` - Simulate interactions
- `mcp__playwright__browser_evaluate()` - Run JavaScript to measure performance
- `mcp__playwright__browser_console_messages()` - Check for errors

**2. Visual Validation Loop:**
```
Build → Serve → Navigate → Screenshot → Analyze → Identify Issues → Fix → Repeat
```

**Specific tests to perform:**

**A) Static Visual Checks:**
- Take screenshot of initial canvas state
- Check: grid spacing, colors match spec, typography correct
- Screenshot each node type (class, dataclass, protocol)
- Verify: borders, shadows, colors, spacing match specifications exactly

**B) Interaction Tests:**
- Navigate to canvas
- Use `browser_click()` to collapse section
- Screenshot before/after
- Analyze: Did section collapse? No visual artifacts?
- Test drag: Click node, evaluate position change, screenshot
- Verify: Node moved, shadow elevated, arrows updated

**C) Animation Smoothness Measurement:**
Use `browser_evaluate()` to inject performance monitoring:

```javascript
// Inject this to measure FPS during animation
const fpsSampler = {
  frames: [],
  lastTime: performance.now(),

  measure() {
    const now = performance.now();
    const delta = now - this.lastTime;
    const fps = 1000 / delta;
    this.frames.push(fps);
    this.lastTime = now;
    if (this.frames.length < 120) {  // Sample for ~2 seconds at 60fps
      requestAnimationFrame(() => this.measure());
    }
  },

  getStats() {
    return {
      avgFPS: this.frames.reduce((a,b) => a+b) / this.frames.length,
      minFPS: Math.min(...this.frames),
      maxFPS: Math.max(...this.frames),
      droppedFrames: this.frames.filter(f => f < 55).length,
      percentile1: this.frames.sort((a,b)=>a-b)[Math.floor(this.frames.length * 0.01)]
    };
  }
};

// Start measurement, trigger animation, then get stats
fpsSampler.measure();
```

**D) Arrow Routing Quality:**
- Create scenario: 3 nodes in line (A → B → C)
- Move middle node to create obstacle
- Screenshot the rerouted arrows
- Analysis questions:
  - Are curves smooth?
  - Do arrows avoid overlapping nodes?
  - Are arrowheads crisp and correctly oriented?
  - Does routing look natural?

**E) Cross-State Testing:**
- Screenshot: Empty canvas
- Screenshot: 1 node
- Screenshot: 5 nodes with arrows
- Screenshot: 20 nodes (stress test)
- Screenshot: 50 nodes (performance test)
- Screenshot: Zoomed to 50%, 100%, 200%
- Analysis: Does layout remain crisp? Any visual glitches?

**3. Performance Benchmarking:**

Inject Chrome DevTools performance metrics:

```javascript
// Via browser_evaluate()
const perfObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
  }
});
perfObserver.observe({ entryTypes: ['measure', 'paint', 'layout-shift'] });

// Measure specific interactions
performance.mark('drag-start');
// ... perform drag ...
performance.mark('drag-end');
performance.measure('drag-duration', 'drag-start', 'drag-end');

// Get frame timing
const paintTimings = performance.getEntriesByType('paint');
```

**Performance Targets:**
- Drag response: < 16ms per frame (60fps)
- Collapse animation: smooth 250ms (no dropped frames)
- Arrow redraw: < 10ms
- Zoom: < 50ms to update all elements
- Layout recalculation: < 100ms for 50 nodes

**4. Error Detection:**

Use `browser_console_messages()` to check for:
- JavaScript errors
- Warning messages
- Failed network requests
- Performance warnings

---

### PHASE 3: IMPLEMENTATION & ITERATION

**Workflow:**

1. **Install & Setup:**
   - Create project structure in repository
   - Install dependencies (if any)
   - Set up local dev server (e.g., `python -m http.server` or `npx serve`)
   - Verify Playwright can access it

2. **Build Core Systems (Iteratively):**

   **Iteration 1: Canvas Foundation**
   - Build: Pan/zoom, grid, basic rendering
   - Serve: Start dev server
   - Test: Navigate with Playwright, take screenshot
   - Analyze: Grid correct? Zoom smooth? Pan responsive?
   - Measure: Inject FPS counter, verify 60fps
   - Fix: Any lag or visual issues

   **Iteration 2: Node Rendering**
   - Build: Class nodes with all three styles
   - Test: Screenshot each type
   - Analyze: Colors match hex values? Borders correct? Shadows right?
   - Measure: Rendering performance with 20 nodes
   - Fix: Any styling mismatches

   **Iteration 3: Collapse System**
   - Build: Nested collapsible sections
   - Test: Click to collapse → Screenshot before/after
   - Measure: Animation FPS (should be 60fps)
   - Analyze: Smooth height transition? No flickering?
   - Fix: Stuttering, state bugs

   **Iteration 4: Drag & Drop**
   - Build: Drag mechanics with snap-to-grid
   - Test: Simulate drag, screenshot, verify position
   - Measure: Drag responsiveness (< 16ms per frame)
   - Fix: Lag, shadow glitches, z-index issues

   **Iteration 5: Arrows**
   - Build: Arrow routing algorithm
   - Test: Create obstacle scenario → Screenshot
   - Analyze: Curves smooth? Routing intelligent? Arrowheads crisp?
   - Iterate: Refine algorithm based on visual feedback

   **Iteration 6: Auto-Layout**
   - Build: Hierarchical layout algorithm
   - Test: 10 nodes with inheritance → Auto-arrange → Screenshot
   - Analyze: Clean hierarchy? Good spacing? No overlaps?
   - Fix: Spacing issues, positioning bugs

   **Iteration 7: Polish**
   - Build: Toolbar, keyboard shortcuts, export
   - Test: End-to-end scenarios (see Section 13)
   - Final visual sweep with screenshots
   - Performance audit

3. **Bug Fixing Protocol:**
   - Screenshot reveals issue → Describe specifically
   - Fix in code
   - Re-test same scenario
   - Screenshot comparison (before/after)
   - Verification: "Is this fixed?"
   - If not: iterate again

---

### PHASE 4: MULTI-AGENT ORCHESTRATION

**Use at least 3 specialized agents** to optimize context efficiency and work quality:

**Agent 1: Architect / Planner**
- Analyzes requirements
- Designs tech stack and architecture
- Creates file structure
- Plans testing approach
- Outputs: Architecture doc, tech decisions, rationale

**Agent 2: Implementation Engineer**
- Receives architecture plan
- Writes code iteratively
- Focuses on functionality first, then polish
- Sets up dev server
- Implements core systems one by one

**Agent 3: Visual QA Engineer**
- Takes screenshots at every iteration
- Analyzes screenshots against specifications
- Reports specific visual bugs (e.g., "Section header should be #F8F9FA but appears #F5F5F5")
- Validates animations frame-by-frame
- Uses Playwright tools for interaction testing

**Agent 4: Performance Engineer**
- Injects performance monitoring code
- Measures FPS, frame timing, responsiveness
- Identifies bottlenecks (e.g., "Arrow redraw taking 45ms, should be < 10ms")
- Suggests optimizations (e.g., "Use requestAnimationFrame", "Debounce resize handler")
- Validates performance targets

**Agent 5: Integration Lead / Orchestrator**
- Coordinates all other agents
- Ensures work flows smoothly between agents
- Makes final decisions on trade-offs
- Produces deliverable
- Writes documentation

**Optional Additional Agents:**
- **Accessibility Specialist**: Tests keyboard navigation, screen reader support
- **Documentation Writer**: Creates user guide and API docs
- **Demo Builder**: Creates pre-configured demo (see Phase 5)

**Why multiple agents?**
- Context efficiency: Each agent specializes, keeping context focused
- Parallelization: Testing happens while next feature builds
- Fresh perspective: QA agent catches what implementation agent misses
- Expertise: Performance engineer knows optimization patterns deeply
- No compute limits: Leverage unlimited resources for better results

**Agent Communication Pattern:**
- Architect produces spec → Implementation builds feature
- Implementation notifies QA → QA validates and reports issues
- QA reports bugs → Implementation fixes
- Performance Engineer monitors → Reports bottlenecks
- Integration Lead coordinates → Ensures everything fits together

---

### PHASE 5: DEMO & DELIVERABLES

**Critical Requirement:**

At the end of implementation, you MUST provide a **simple, easy way to run the canvas with a pre-configured diagram** so the work can be evaluated immediately.

**What to deliver:**

1. **One-Command Launch:**
   - Provide a single command or script to start the demo
   - Examples:
     - `npm run demo` or `npm start`
     - `python serve_demo.py`
     - `open demo.html` (if self-contained)
   - Should work on fresh clone of repository

2. **Pre-Loaded Demo Diagram:**
   - Canvas should open with an interesting example diagram already rendered
   - Include 8-12 nodes of mixed types (classes, dataclasses, protocols)
   - Show inheritance, composition, and dependency relationships
   - Demonstrate nested collapsible sections
   - Example theme: "Mini E-Commerce System" or "Data Processing Pipeline"

   **Example Pre-Loaded Diagram:**
   ```
   Protocol: Serializable (top)
      ↓ (inheritance)
   Dataclass: Product
      ↓ (composition)
   Class: Inventory
      ↓ (uses)
   Class: OrderProcessor
      ↓ (uses)
   Dataclass: Order
      ← (uses) ←
   Class: PaymentGateway
   ```

3. **Quick Start Guide (in README):**
   ```markdown
   # Quick Start

   1. Clone repository
   2. Run: [your-command-here]
   3. Browser opens with demo diagram
   4. Try:
      - Drag nodes around
      - Collapse/expand sections
      - Zoom with mousewheel
      - Click "Auto Arrange"
      - Multi-select with Shift+click
   ```

4. **Full Deliverable Checklist:**
   - [ ] Working canvas UI (all features from spec)
   - [ ] Dev server or self-contained HTML file
   - [ ] Pre-configured demo with interesting diagram
   - [ ] One-command launch script
   - [ ] README with quick start instructions
   - [ ] Screenshot gallery (optional but nice)
   - [ ] Performance report (FPS measurements)
   - [ ] Architecture documentation
   - [ ] API documentation (if applicable)
   - [ ] Known issues / limitations list

---

### TESTING CHECKLIST

Before considering this complete, verify:

**Visual Compliance:**
- [ ] All colors match exact hex codes from spec
- [ ] Shadows have correct blur radius and opacity
- [ ] Typography uses specified fonts and sizes
- [ ] Spacing follows 8px grid system
- [ ] Border radius matches spec (8px for nodes, 6px for buttons)

**Interaction Quality:**
- [ ] Drag feels smooth (60fps confirmed)
- [ ] Collapse animation is satisfying (250ms, no stutter)
- [ ] Zoom is smooth and centers on cursor
- [ ] Pan has deceleration easing
- [ ] Multi-select works correctly
- [ ] Keyboard shortcuts work

**Arrow Intelligence:**
- [ ] Arrows route around obstacles
- [ ] Curves are smooth (no jagged corners)
- [ ] Arrowheads are crisp and correctly oriented
- [ ] Real-time updates during drag have no lag
- [ ] All 4 arrow types render correctly

**Edge Cases:**
- [ ] 50+ nodes: still smooth
- [ ] Very long class names: handled gracefully
- [ ] Deeply nested sections: collapse state preserved
- [ ] Rapid interactions: no race conditions
- [ ] Empty canvas: shows hint text
- [ ] Zoom extremes (10%, 400%): still usable

**Performance (via browser_evaluate):**
- [ ] Drag response < 16ms per frame
- [ ] Collapse animation: 60fps (no dropped frames)
- [ ] Arrow redraw < 10ms
- [ ] Zoom update < 50ms
- [ ] Auto-layout < 2 seconds for 50 nodes

**Demo Quality:**
- [ ] One command launches demo
- [ ] Pre-loaded diagram is interesting and showcases features
- [ ] README has clear quick start instructions
- [ ] Demo works on fresh clone

---

## Important Notes

**Environment:**
- You're running in Claude Code cloud infrastructure
- You have access to npm, pip, and standard build tools
- You can install any dependencies you need
- Set up a local dev server (port 3000, 8000, or any available port)
- Playwright will connect to localhost

**Freedom & Creativity:**
- You choose the tech stack - be creative!
- Explore novel approaches and algorithms
- Prioritize what will make this feel delightful
- If running in parallel with other instances, **deliberately diverge** in your approach
- Original solutions are valued over safe/conventional ones

**Testing is Critical:**
- Use Playwright extensively for visual validation
- Measure performance, don't assume
- Screenshot every major iteration
- Fix issues immediately, don't defer
- Aim for professional visual quality

**Unlimited Compute:**
- Don't cut corners to save resources
- Use multiple agents if it improves quality
- Iterate as many times as needed
- Test thoroughly, measure everything

**Success Criteria:**
- Looks professional (could be in portfolio)
- Feels smooth and responsive
- All features work correctly
- Demo is impressive and easy to run
- Code is clean and well-organized

---

## Final Checklist Before Submission

- [ ] All 15 core requirements implemented
- [ ] Visual design matches specifications exactly
- [ ] Performance targets met (60fps, < 16ms response)
- [ ] Playwright tests written and passing
- [ ] Multi-agent approach used (3+ agents)
- [ ] Pre-configured demo works with one command
- [ ] README has clear quick start guide
- [ ] Screenshots show visual quality
- [ ] Performance report included
- [ ] No console errors
- [ ] Architecture documented
- [ ] Known issues listed

---

**Remember:**
- Vision analysis via screenshots is your superpower
- Measure performance, don't guess
- Iterate in small chunks with tight feedback loops
- Multiple agents = more brainpower
- Unlimited compute = do it right
- Make it delightful, not just functional

**Good luck! Build something beautiful.**
