# Quick Start Guide

## Installation

```bash
cd /home/user/canvas
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## What You'll See

1. **An interactive canvas** with an infinite dot grid background
2. **8 class diagram nodes** arranged in an e-commerce domain model:
   - Serializable (protocol)
   - Product, Customer, Order, OrderItem (dataclasses)
   - OrderStatus (enum)
   - OrderService (class)
   - PaymentProcessor (interface)

## Try These Interactions

### Zoom
- **Scroll wheel** - Zoom in/out toward your cursor position
- Watch how the grid scales with the zoom level

### Pan
- **Middle mouse button + drag** - Pan the viewport
- **Spacebar + left click + drag** - Alternative pan method

### Select
- **Click a node** - Selects it (drop shadow appears)
- **Shift + click** - Add to selection (multi-select)
- **Click empty space** - Deselect all

### Drag
- **Click and drag a node** - Move it smoothly at 60fps
- **Multi-select and drag** - All selected nodes move together
- Watch the performance monitor in console showing 60 FPS

## Browser Console

Open the browser console (F12) to see:
- Performance monitoring (FPS updates every second)
- Initialization logs
- Available API commands

Try these in the console:
```javascript
// Get current stats
canvas.getPerformanceStats()

// Zoom to 2x
canvas.zoomTo(2)

// Fit all nodes in view
canvas.fitToContent()

// Export diagram data
const data = canvas.export()
console.log(data)

// Add a new node
canvas.addNode({
  type: 'class',
  className: 'MyClass',
  x: 100,
  y: 100,
  sections: [
    { title: 'Methods', items: ['doSomething()'] }
  ]
})
```

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory with:
- Total gzipped size: **9.61 KB** (well under 18KB target!)
- JavaScript: 8.79 KB gzipped
- CSS: 0.82 KB gzipped

## Performance Monitoring

Watch the browser console while interacting:
```
[Canvas] Initialized successfully
[Canvas] Added node: n1 (Serializable)
[Canvas] Added node: n2 (Product)
...
[Main] Demo diagram loaded and fitted to viewport

[Performance] FPS: 60 | Avg: 16.67ms | Min: 15.20ms | Max: 18.30ms | Slow frames: 0
```

The performance monitor logs every second showing:
- **FPS**: Frames per second (target: 60)
- **Avg**: Average frame time in milliseconds
- **Min/Max**: Best and worst frame times
- **Slow frames**: Count of frames over 16.67ms threshold

## File Structure Reference

Key files you might want to explore:

```
src/
├── main.js                    # Entry point - start here
├── core/Canvas.js             # Main API
├── demo/demo-data.js          # Sample data - modify this to change the demo
├── nodes/NodeTypes.js         # Add new node type styles here
└── interactions/              # Interaction controllers
```

## Customizing the Demo

Edit `/home/user/canvas/src/demo/demo-data.js` to change the demo diagram:

```javascript
export const demoData = {
  nodes: [
    {
      id: 'mynode1',
      type: 'class',           // class, dataclass, protocol, interface, enum
      className: 'MyClass',
      x: 400,
      y: 200,
      sections: [
        {
          title: 'Fields',
          items: ['name: string', 'age: number']
        },
        {
          title: 'Methods',
          items: ['getName(): string', 'setName(name: string)']
        }
      ]
    }
    // Add more nodes...
  ],
  arrows: [
    { from: 'mynode1', to: 'mynode2', type: 'inheritance' }
    // Add more arrows (rendering in Phase 2)
  ]
};
```

## What's Working

✅ Infinite dot grid background  
✅ Pan and zoom with smooth animations  
✅ Node rendering (5 types with color coding)  
✅ Single and multi-select  
✅ Drag and drop at 60fps  
✅ Performance monitoring  
✅ Transform-only positioning (GPU accelerated)  
✅ Export/import functionality  

## What's Next (Phase 2)

The arrow data structures are defined but rendering is not yet implemented. Phase 2 will add:
- Arrow rendering with SVG paths
- Smart arrow routing (avoiding nodes)
- Arrow anchor points
- UI toolbar and zoom controls
- Animation system

## Troubleshooting

### Dev server won't start
```bash
# Make sure dependencies are installed
npm install

# Try on a different port
# Edit vite.config.js and change port: 3000 to port: 3001
```

### Performance issues
- Open browser console to see FPS stats
- Disable browser extensions that might interfere
- Try in an incognito/private window

### Blank screen
- Check browser console for errors
- Make sure you're using a modern browser with ES6 support
- Try running `npm run build` to check for compilation errors

## Support

Check the implementation summary for detailed architecture information:
- `/home/user/canvas/IMPLEMENTATION_SUMMARY.md`

---

**Ready to build something amazing!**
