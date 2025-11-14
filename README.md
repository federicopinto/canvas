# Vanilla JS Canvas UI - High-Performance Class Diagram Editor

> **Portfolio-quality interactive canvas built with zero frameworks, proving vanilla JS can be blazing fast.**

[![Bundle Size](https://img.shields.io/badge/bundle-15.96%20KB%20gzipped-success)](.)
[![Performance](https://img.shields.io/badge/performance-60%20FPS-brightgreen)](.)
[![Dependencies](https://img.shields.io/badge/runtime%20deps-0-blue)](.)

---

## 🎯 Project Mission

**Prove that frameworks aren't necessary for building smooth, professional, high-performance interactive UIs.**

This canvas UI achieves **60 FPS** with **zero runtime dependencies** and a **16 KB bundle** - **5x smaller than React alternatives**.

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → Opens http://localhost:3000 with demo diagram

# Production build
npm run build
# → Output: dist/ (15.96 KB gzipped)
```

**One command, instant demo!**

---

## 🌟 Features

### Core Interactions
- ✅ **Infinite Canvas** - Pan (middle-mouse/spacebar+drag), Zoom (mousewheel)
- ✅ **Smooth Drag & Drop** - 60fps GPU-accelerated node movement
- ✅ **Multi-Selection** - Shift+click to select multiple, drag together
- ✅ **Smart Zoom** - Zooms toward cursor with smooth animations

### Visual Elements
- ✅ **5 Node Types** - Class, Dataclass, Protocol, Interface, Enum
- ✅ **5 Arrow Types** - Inheritance, Composition, Aggregation, Dependency, Association
- ✅ **Smart Arrow Routing** - Intelligently routes around obstacles with Bezier curves
- ✅ **Infinite Grid** - Subtle dot pattern that scales with zoom

### Advanced Features
- ✅ **Auto-Layout** - Custom Sugiyama hierarchical layout algorithm
- ✅ **Keyboard Shortcuts** - 10+ shortcuts for power users
- ✅ **PNG Export** - High-DPI (2x) export with proper bounds
- ✅ **Performance Monitor** - Built-in FPS tracking

### UI Components
- ✅ **Floating Toolbar** - Glassmorphism design with essential controls
- ✅ **Zoom Control** - Live zoom percentage (clickable to reset)

---

## 🎮 Controls

**Mouse:**
- Scroll Wheel → Zoom
- Middle Mouse + Drag → Pan
- Spacebar + Drag → Pan  
- Left Click → Select
- Shift + Click → Multi-select

**Keyboard:**
- `Ctrl/Cmd + 0` → Reset zoom
- `Ctrl/Cmd + 1` → Fit to screen
- `Ctrl/Cmd + A` → Select all
- `Escape` → Deselect
- `Delete` → Delete selected
- `+/-` → Zoom in/out

---

## 🚀 Performance

### Bundle Size (vs Frameworks)

| Framework | Bundle Size | vs Vanilla JS |
|-----------|-------------|---------------|
| **Vanilla JS (ours)** | **16 KB** | **Baseline** |
| React + D3 | ~80 KB | **5x larger** |
| Vue + Konva | ~75 KB | **4.7x larger** |
| Svelte | ~45 KB | **2.8x larger** |

### Performance Metrics

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| Frame Rate | 60 fps | 60 fps | ✅ |
| Arrow Routing | < 10 ms | 2.5 ms | ✅ |
| Initial Load | < 500 ms | ~250 ms | ✅ |
| Bundle Size | < 100 KB | 16 KB | ✅ **84% under** |

**All targets exceeded!** See [PERFORMANCE_REPORT.md](PERFORMANCE_REPORT.md)

---

## 🏗️ Architecture

### Zero-Framework Philosophy

**Why No Frameworks?**
1. **Performance** - Direct DOM = faster than virtual DOM
2. **Bundle Size** - 16 KB vs 80+ KB  
3. **Control** - Full optimization control
4. **Learning** - Deep browser API understanding

### Module Structure (29 files, 4,838 lines)

```
src/
├── core/          # Canvas, State, EventBus, PerformanceMonitor
├── viewport/      # Pan, Zoom, Grid, Camera
├── nodes/         # Node rendering, types, sections
├── arrows/        # Arrow routing, rendering, anchors
├── interactions/  # Drag, Selection, PanZoom, Keyboard
├── layout/        # Auto-layout (custom Sugiyama algorithm)
├── animation/     # Animator, Tween (10 easing functions)
├── ui/            # Toolbar, ZoomControl
├── export/        # PNG/SVG export
└── utils/         # SVGBuilder, MathUtils
```

**Key Optimizations:**
1. **Transform-Only Positioning** - GPU-accelerated `translate()`
2. **Single RAF Loop** - Prevents frame pacing issues
3. **Event Delegation** - One listener for all interactions
4. **Arrow Memoization** - Only recalc when nodes move
5. **SVG Marker Reuse** - Shared arrowhead definitions

---

## 🧪 Testing

```bash
npm test              # Run all Playwright tests
npm run test:ui       # Interactive test UI
npm run test:perf     # Generate performance report
```

**Test Coverage:**
- 9 Visual Tests (rendering, nodes, arrows)
- 10 Interaction Tests (pan, zoom, drag, select)
- 7 Performance Tests (FPS, timing, memory)

---

## 📊 Demo Diagram

**E-commerce data model** with:
- 8 nodes (Protocol, Dataclass, Class, Enum, Interface)
- 8 arrows (all relationship types)
- Inheritance, composition, association, dependency

**Try:**
1. Drag nodes - arrows update in real-time
2. Click ⚡ to auto-arrange  
3. Mousewheel to zoom
4. Press `Ctrl+1` to fit all
5. Click 📥 to export PNG

---

## 📖 API Reference

```javascript
const canvas = window.canvas;

// Add node
canvas.addNode({
  id: 'n1',
  type: 'class',
  className: 'MyClass',
  x: 100,
  y: 100,
  sections: [/* ... */]
});

// Add arrow
canvas.addArrow({
  from: 'n1',
  to: 'n2',
  type: 'inheritance'
});

// Controls
canvas.zoomTo(1.5);
canvas.fitToContent();
canvas.autoLayout();
canvas.exportPNG();
```

---

## 🎯 Key Takeaways

**What This Proves:**
1. ✅ Frameworks aren't always necessary
2. ✅ 60fps achievable with vanilla JS
3. ✅ Bundle size matters (16 KB vs 80 KB)
4. ✅ Direct control beats abstraction
5. ✅ Modern browsers are powerful enough

**When to Use Vanilla JS:**
- Performance is critical (60fps animations)
- Bundle size matters (mobile, slow connections)
- Need full rendering control
- Well-defined project scope

---

## 📁 Files

- **[README.md](README.md)** - This file
- **[PERFORMANCE_REPORT.md](PERFORMANCE_REPORT.md)** - Detailed benchmarks
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Architecture details
- **[QUICK_START.md](QUICK_START.md)** - Getting started guide

---

## 📄 License

MIT License

---

**Built with:** Vite, Playwright, SVG, Modern Browser APIs

**⭐ Star this repo if vanilla JS impressed you!**
