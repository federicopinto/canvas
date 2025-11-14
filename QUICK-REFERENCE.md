# Quick Reference Guide

## Quick Access

**Common Tasks**

- [How do I...?](#how-do-i)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Toolbar Reference](#toolbar-reference)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Tips & Tricks](#tips--tricks)

---

## How Do I...?

### Getting Started

#### Run the demo?
```bash
npm install
npm run dev
```
Open http://localhost:5173/ - Demo loads automatically!

#### Clear the canvas and start fresh?
1. Click the 🗑 trash icon in toolbar
2. Confirm the dialog
3. Canvas is now empty

#### Load my own diagram data?
Edit `/home/user/canvas/public/demo-data.json` and reload the page.
See [DEMO-DATA-GUIDE.md](DEMO-DATA-GUIDE.md) for schema details.

---

### Navigation

#### Pan the canvas?
**Method 1:** Hold **Spacebar** + drag with mouse
**Method 2:** Hold **middle mouse button** + drag
**Tip:** Cursor changes to "grab hand" while panning

#### Zoom in/out?
**Method 1:** **Mouse wheel** up (zoom in) / down (zoom out)
**Method 2:** Click **+** or **-** buttons in toolbar
**Method 3:** **Ctrl/Cmd + mouse wheel** for faster zoom
**Tip:** Zoom centers on cursor position!

#### Reset zoom to 100%?
**Method 1:** Press **Ctrl/Cmd + 0**
**Method 2:** Click **100%** button in toolbar

#### View all nodes at once?
**Method 1:** Press **Ctrl/Cmd + 1**
**Method 2:** Click **⛶** (fit to screen) button in toolbar
**Result:** Canvas centers and scales to show all nodes

---

### Working with Nodes

#### Select a node?
**Click** any node - purple border (#667EEA) appears

#### Select multiple nodes?
Hold **Shift** and click additional nodes

#### Deselect nodes?
**Method 1:** Press **Escape** key
**Method 2:** Click empty canvas area

#### Drag a node?
**Click and hold** on node header, then drag
**Tip:** Don't click on section headers or content items

#### Drag multiple nodes together?
1. **Shift+click** to select multiple nodes
2. **Drag** any selected node
3. All selected nodes move together, maintaining relative positions

#### See what's inside a node?
**Click** the section headers (Fields, Methods, etc.) to expand/collapse

---

### Sections & Content

#### Collapse a section?
**Click** the section header (e.g., "Fields (4)" or "Methods (2)")
**Visual feedback:** [-] changes to [+]

#### Expand a collapsed section?
**Click** the section header again
**Visual feedback:** [+] changes to [-]

#### What do the numbers mean?
The number in parentheses (e.g., "(4)") shows the **item count** in that section

#### Collapse all sections in a node?
**Not yet implemented** - Click each section individually for now
**Planned:** Ctrl+click on section to collapse all at that level

---

### Layout & Organization

#### Auto-arrange the diagram?
**Click** the **⚡** (lightning bolt) button in toolbar
**Result:** Nodes animate to hierarchical layout over 600ms

#### What layout algorithm is used?
**Dagre** - hierarchical graph layout
- Inheritance flows top → bottom
- Related nodes grouped horizontally
- 120px horizontal spacing, 100px vertical spacing

#### Can I manually adjust after auto-layout?
**Yes!** Drag nodes to fine-tune positions after auto-layout

#### Save my layout?
**Currently:** Positions are not persisted
**Workaround:** Export PNG for reference
**Planned:** Save layout to localStorage

---

### Arrows

#### What do the different arrow types mean?

| Visual | Type | Meaning | Example |
|--------|------|---------|---------|
| →◁ (hollow triangle) | **Inheritance** | "extends" or "implements" | Child → Parent |
| ◆→ (filled diamond) | **Composition** | "owns" (strong) | Container → Contained |
| ◇→ (hollow diamond) | **Aggregation** | "has-a" (weak) | Owner → Owned |
| --→ (dashed) | **Dependency** | "uses" or "depends on" | User → Dependency |

#### Hover over an arrow?
**Arrow thickens** from 2px to 3px
**Coming soon:** Click to select, delete key to remove

#### Arrows not updating when I drag nodes?
This should happen automatically. If not:
1. Check browser console (F12) for errors
2. Try refreshing the page
3. Report as a bug

---

### Export & Sharing

#### Export as PNG image?
1. **Click** 📥 (download) button in toolbar
2. **File saves** as `canvas-diagram.png` (2x resolution for crisp printing)

#### Export quality settings?
**Resolution:** 2x (double pixel density)
**Format:** PNG with transparency
**Size:** Captures entire visible canvas

#### Can I export as PDF or SVG?
**Not yet** - Only PNG currently supported
**Workaround:** Use browser "Print to PDF" feature
**Planned:** Direct SVG/PDF export

#### Share my diagram with others?
1. **Export PNG** using toolbar button
2. Share the image file
3. **Or** share the `demo-data.json` file for others to load

---

### Customization

#### Change node colors?
**Not in UI** - Colors are hardcoded per specification
**For developers:** Edit `/home/user/canvas/src/utils/constants.ts`

#### Add more nodes?
**Edit** `/home/user/canvas/public/demo-data.json`
See [DEMO-DATA-GUIDE.md](DEMO-DATA-GUIDE.md) for schema

#### Remove nodes from demo?
**Edit** `/home/user/canvas/public/demo-data.json`
**Or** use the "Clear Canvas" button to start fresh

---

## Keyboard Shortcuts

### Navigation

| Shortcut | Action |
|----------|--------|
| **Spacebar + drag** | Pan canvas |
| **Middle mouse + drag** | Pan canvas (alternative) |
| **Mouse wheel** | Zoom in/out |
| **Ctrl/Cmd + wheel** | Faster zoom |
| **Ctrl/Cmd + 0** | Reset zoom to 100% |
| **Ctrl/Cmd + 1** | Fit all nodes to screen |

### Selection

| Shortcut | Action |
|----------|--------|
| **Click** | Select node |
| **Shift + click** | Add to selection (multi-select) |
| **Escape** | Deselect all |
| **Click empty** | Deselect all (alternative) |

### Editing (Planned)

| Shortcut | Action | Status |
|----------|--------|--------|
| **Delete** | Delete selected nodes | ⏳ Planned |
| **Ctrl/Cmd + Z** | Undo | ⏳ Planned |
| **Ctrl/Cmd + Y** | Redo | ⏳ Planned |
| **Ctrl/Cmd + A** | Select all | ⏳ Planned |

---

## Toolbar Reference

### Button Guide

```
┌────────────────────────────────────────────────────────┐
│  ⚡  │  -  │ 100% │  +  │  ⛶  │  📥  │  🗑  │
└────────────────────────────────────────────────────────┘
   1     2     3      4     5      6      7
```

| # | Icon | Name | Action | Shortcut |
|---|------|------|--------|----------|
| 1 | ⚡ | Auto Arrange | Hierarchical layout with animation | - |
| 2 | - | Zoom Out | Decrease zoom by 10% | Ctrl+- |
| 3 | 100% | Zoom Reset | Reset to 100% zoom | Ctrl+0 |
| 4 | + | Zoom In | Increase zoom by 10% | Ctrl++ |
| 5 | ⛶ | Fit to Screen | Center and scale all nodes | Ctrl+1 |
| 6 | 📥 | Export PNG | Download 2x resolution image | - |
| 7 | 🗑 | Clear Canvas | Delete all nodes (with confirmation) | - |

### Toolbar Behavior

- **Floating:** Always visible, doesn't pan with canvas
- **Position:** Top-center of viewport
- **Style:** Semi-transparent white with backdrop blur
- **Hover:** Background appears on hover
- **Active:** Background darkens when clicked

---

## Troubleshooting

### Canvas is blank / nodes not showing

**Possible causes:**
1. Demo data failed to load
2. JSON syntax error in demo-data.json
3. JavaScript error in console

**Solutions:**
1. Open browser console (F12) - check for errors
2. Verify `/home/user/canvas/public/demo-data.json` exists
3. Validate JSON at https://jsonlint.com/
4. Refresh page (Ctrl+R)

---

### Zoom is too sensitive

**Cause:** Trackpad or mouse settings

**Solutions:**
- **Decrease zoom speed:** Use toolbar buttons instead of wheel
- **Adjust trackpad:** System settings → trackpad sensitivity
- **For developers:** Adjust `VIEWPORT.scaleStep` in constants.ts

---

### Can't click on nodes (clicks go through)

**Possible causes:**
1. Nodes are behind another element
2. Canvas is in pan mode
3. Z-index issue

**Solutions:**
1. Release **Spacebar** (exits pan mode)
2. Release **middle mouse button**
3. Refresh page
4. Check browser console for errors

---

### Arrows are not visible

**Possible causes:**
1. Source/target nodes don't exist
2. Arrow markers not loaded
3. SVG rendering issue

**Solutions:**
1. Check `demo-data.json` - verify arrow source/target IDs match node IDs
2. Open browser console - check for errors
3. Inspect SVG in DevTools - look for `<defs>` with marker definitions
4. Try refreshing page

---

### Performance is slow / laggy

**Possible causes:**
1. Too many nodes (>50)
2. Other browser tabs consuming resources
3. Outdated browser

**Solutions:**
1. **Close other tabs** - free up memory
2. **Reduce node count** - aim for <50 nodes
3. **Update browser** - Chrome/Edge/Firefox latest version
4. **Check console** - look for errors or warnings
5. **Restart browser** - clear memory leaks

---

### Auto-layout moves nodes to weird positions

**This is normal!** Dagre layout may produce unexpected results for complex graphs.

**Solutions:**
1. **Manually adjust** - drag nodes to desired positions
2. **Simplify arrows** - remove redundant relationships
3. **Adjust layout settings** - edit `LAYOUT` constants (for developers)
4. **Use manual layout** - don't use auto-arrange

---

### Export PNG is blurry

**Cause:** Browser zoom or display scaling

**Solutions:**
1. **Reset browser zoom** to 100% (Ctrl+0)
2. **Adjust canvas zoom** to 100% before exporting
3. **Check export resolution** - should be 2x by default

**Note:** Exported PNGs are 2x resolution for crisp printing.

---

### Section won't collapse

**Possible causes:**
1. Clicking on content item instead of header
2. Animation in progress
3. JavaScript error

**Solutions:**
1. **Click the header row** (with section label and count badge)
2. **Wait for animation** to finish (~250ms)
3. **Check console** for errors

---

## FAQ

### Q: Can I edit nodes in the UI?

**A:** Not yet. Node editing is planned for a future release.

**Workaround:** Edit `public/demo-data.json` directly and reload.

---

### Q: Can I add nodes by clicking on the canvas?

**A:** No, this is a **viewer** not an **editor**.

**Use case:** Display diagrams generated from code analysis tools.

**For editing:** Use external tools to generate demo-data.json.

---

### Q: Does it support VSCode integration?

**A:** Partial. Node data can include `vscodeLink` properties, but click-to-open is not yet implemented.

**Status:** Placeholder in place, integration planned.

---

### Q: Can multiple people edit the same diagram?

**A:** No, this is single-user, not collaborative.

**For collaboration:** Consider forking and adding WebSocket sync.

---

### Q: Does it work on mobile/tablet?

**A:** No, desktop-only (mouse required).

**Why:** Pan/zoom gestures and precision clicking need mouse input.

**Future:** Touch support is a low-priority enhancement.

---

### Q: Can I embed this in my app?

**A:** Yes! It's a standard React app.

**Integration:**
1. Import components from `src/`
2. Use `useCanvasStore` for state management
3. Load your own data with `loadData()`

See [ARCHITECTURE.md](ARCHITECTURE.md) for technical details.

---

### Q: What license is this under?

**A:** MIT License - free for commercial and personal use.

---

### Q: How do I report bugs?

**A:** Check the browser console (F12) for errors, then:
1. Note the error message
2. Document steps to reproduce
3. Check if it's already reported
4. Create an issue with details

---

### Q: Can I customize the colors?

**A:** For developers: Yes, edit `/home/user/canvas/src/utils/constants.ts`

**In UI:** No, colors are hardcoded per specification.

**Why:** Ensures consistent, professional appearance.

---

## Tips & Tricks

### Navigation Tips

**Tip 1: Smooth Panning**
Hold **Spacebar** for smooth, controlled panning. Middle mouse button is faster but less precise.

**Tip 2: Zoom to Point**
**Before zooming:** Position your cursor over the area you want to zoom into. The zoom centers on cursor position!

**Tip 3: Quick Overview**
Press **Ctrl+1** to instantly see all nodes. Great for getting oriented in large diagrams.

**Tip 4: Reset When Lost**
Lost in the canvas? Press **Ctrl+0** to reset zoom, then **Ctrl+1** to fit all nodes.

---

### Layout Tips

**Tip 5: Auto-Layout First**
When creating a new diagram, run **Auto-Arrange** first to get a good starting point. Then manually adjust.

**Tip 6: Group Related Nodes**
**Shift+click** to select related nodes, then drag them together to create visual groupings.

**Tip 7: Collapse to Reduce Clutter**
Collapse sections you don't need to see right now. This makes the diagram cleaner and easier to understand.

**Tip 8: Vertical Hierarchy**
For inheritance hierarchies, arrange parent classes at top, children below. Auto-layout does this automatically.

---

### Performance Tips

**Tip 9: Keep Node Count Reasonable**
Aim for 10-50 nodes. More than 50 and performance may degrade.

**Tip 10: Simplify Large Diagrams**
For codebases with 100+ classes, create multiple smaller diagrams (e.g., one per module).

**Tip 11: Close Section Details**
Collapsed sections use less memory and render faster.

---

### Export Tips

**Tip 12: Set Up Before Exporting**
1. **Zoom to 100%** (Ctrl+0)
2. **Center the diagram** (Ctrl+1)
3. **Collapse irrelevant sections**
4. **Then export** (📥 button)

**Tip 13: Use Descriptive Filenames**
Rename exported PNGs to match diagram purpose:
- `ecommerce-architecture.png`
- `user-authentication-flow.png`
- `payment-processing-classes.png`

**Tip 14: 2x Resolution for Print**
Exported PNGs are 2x resolution. Perfect for:
- Technical documentation
- Architecture Decision Records (ADRs)
- Slide decks
- Print materials

---

### Visual Tips

**Tip 15: Color Coding**
Use node types strategically:
- **Protocol** (yellow) - Interfaces/abstract base classes
- **Dataclass** (purple) - Data models/DTOs
- **Class** (blue) - Business logic/services

**Tip 16: Arrow Semantics**
Be intentional with arrow types:
- **Inheritance** - IS-A relationships
- **Composition** - Strong ownership (lifecycle dependency)
- **Aggregation** - Weak ownership (shared references)
- **Dependency** - Uses/depends on (no ownership)

**Tip 17: Minimize Arrow Crossings**
Manually adjust node positions to reduce arrow crossings. This makes relationships clearer.

---

### Development Tips

**Tip 18: Live Reload**
Vite auto-reloads when you edit `demo-data.json`. No need to manually refresh!

**Tip 19: JSON Comments**
JSON doesn't support comments. Use a separate `notes.md` file for documentation.

**Tip 20: Validate Before Testing**
Use https://jsonlint.com/ to validate your JSON before loading in the app.

**Tip 21: Incremental Development**
Build diagrams incrementally:
1. Start with 2-3 key nodes
2. Test the layout
3. Add more nodes gradually
4. Run Auto-Arrange periodically

---

## Common Workflows

### Workflow 1: Creating a New Diagram from Scratch

1. **Clear canvas** (🗑 button)
2. **Edit demo-data.json** with your nodes and arrows
3. **Reload page** (auto-reload if dev server is running)
4. **Run Auto-Arrange** (⚡ button)
5. **Manually adjust** positions as needed
6. **Collapse** non-essential sections
7. **Zoom to 100%** (Ctrl+0)
8. **Fit to screen** (Ctrl+1)
9. **Export PNG** (📥 button)

---

### Workflow 2: Exploring a Large Diagram

1. **Start at 50% zoom** to see overview
2. **Identify** area of interest
3. **Zoom to 100-150%** on that area
4. **Collapse** irrelevant sections
5. **Follow arrows** to understand relationships
6. **Multi-select** related nodes (Shift+click)
7. **Group them** by dragging together

---

### Workflow 3: Presenting to Team

1. **Prepare diagram**:
   - Auto-arrange
   - Collapse implementation details
   - Zoom to 100%
2. **Full screen browser** (F11)
3. **Walk through** by zooming into specific areas
4. **Pan** to show different parts
5. **Expand sections** to show details on demand
6. **Export PNG** for documentation after meeting

---

### Workflow 4: Documenting Architecture

1. **Create diagram** from code
2. **Auto-arrange** for hierarchy
3. **Add strategic groupings** (manual adjustment)
4. **Collapse low-level details**
5. **Export 2x PNG**
6. **Add to documentation** (README, ADR, wiki)
7. **Include demo-data.json** in repo for future edits

---

## Glossary

| Term | Definition |
|------|------------|
| **Node** | A rectangular box representing a class, dataclass, or protocol |
| **Arrow** | A line connecting two nodes, showing a relationship |
| **Section** | A collapsible group within a node (e.g., Fields, Methods) |
| **Canvas** | The infinite drawing area with dot grid background |
| **Viewport** | The visible portion of the canvas |
| **Transform** | The combination of zoom (scale) and pan (translate) |
| **Auto-layout** | The Dagre algorithm that arranges nodes hierarchically |
| **Marker** | The SVG shape at the end of an arrow (triangle, diamond, etc.) |

---

## Getting Help

### Resources

- **README.md** - Main documentation, feature overview
- **ARCHITECTURE.md** - Technical details, component structure
- **DEMO-DATA-GUIDE.md** - JSON schema, customization guide
- **PERFORMANCE-REPORT.md** - Performance analysis, optimization techniques
- **This file** - Quick answers to common questions

### Still Stuck?

1. **Check browser console** (F12) - look for errors
2. **Search this file** - Ctrl+F for keywords
3. **Check GitHub issues** - may already be reported
4. **Create new issue** - include error messages and steps to reproduce

---

**Last Updated:** 2025-11-14

**Quick reference version:** 1.0.0
