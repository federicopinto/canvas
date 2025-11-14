import { Canvas } from './core/Canvas.js';
import { demoData } from './demo/demo-data.js';

// Initialize canvas
const canvas = new Canvas('#app', {
  debugPerformance: true,
  viewport: {
    minZoom: 0.1,
    maxZoom: 4.0,
    grid: {
      dotSize: 2,
      spacing: 20,
      color: '#E5E5E5'
    }
  }
});

// Load demo diagram
console.log('[Main] Loading demo diagram...');
demoData.nodes.forEach(node => canvas.addNode(node));
demoData.arrows.forEach(arrow => canvas.addArrow(arrow));

// Fit to content after a short delay to ensure rendering is complete
setTimeout(() => {
  canvas.fitToContent(100);
  console.log('[Main] Demo diagram loaded and fitted to viewport');
}, 100);

// Expose for testing in browser console
if (typeof window !== 'undefined') {
  window.canvas = canvas;
  window.perfMonitor = canvas.performanceMonitor;

  console.log('[Main] Canvas exposed to window.canvas for debugging');
  console.log('[Main] Performance monitor exposed to window.perfMonitor');
  console.log('');
  console.log('Available commands:');
  console.log('  canvas.zoomTo(1.5) - Set zoom level');
  console.log('  canvas.fitToContent() - Fit all nodes in view');
  console.log('  canvas.export() - Export diagram data');
  console.log('  canvas.getPerformanceStats() - Get FPS stats');
  console.log('');
}

// Log instructions
console.log('='.repeat(60));
console.log('CANVAS CLASS DIAGRAM - Phase 2 Demo');
console.log('='.repeat(60));
console.log('');
console.log('Mouse Controls:');
console.log('  • Mouse Wheel - Zoom in/out (toward cursor)');
console.log('  • Middle Mouse + Drag - Pan viewport');
console.log('  • Spacebar + Left Click + Drag - Pan viewport');
console.log('  • Left Click - Select node');
console.log('  • Shift + Left Click - Multi-select nodes');
console.log('  • Left Click + Drag - Move selected nodes');
console.log('');
console.log('Keyboard Shortcuts:');
console.log('  • Ctrl/Cmd + 0 - Reset zoom to 100%');
console.log('  • Ctrl/Cmd + 1 - Fit to screen');
console.log('  • Ctrl/Cmd + A - Select all nodes');
console.log('  • Escape / Ctrl+D - Deselect all');
console.log('  • Delete/Backspace - Delete selected nodes');
console.log('  • +/- - Zoom in/out');
console.log('  • Arrow Keys - Pan viewport');
console.log('');
console.log('Phase 1 Features:');
console.log('  ✓ Infinite dot grid background');
console.log('  ✓ Smooth pan and zoom');
console.log('  ✓ Node selection (single and multi)');
console.log('  ✓ Drag nodes with 60fps performance');
console.log('  ✓ Transform-only positioning (GPU accelerated)');
console.log('');
console.log('Phase 2 Features:');
console.log('  ✓ Arrow rendering (4 types: inheritance, composition, aggregation, dependency)');
console.log('  ✓ Smart arrow routing with obstacle avoidance');
console.log('  ✓ Real-time arrow updates during node drag');
console.log('  ✓ Animation system with easing functions');
console.log('  ✓ Auto-layout algorithm (click ⚡ in toolbar)');
console.log('  ✓ Floating toolbar with zoom controls');
console.log('  ✓ Zoom percentage display');
console.log('  ✓ Keyboard shortcuts');
console.log('  ✓ PNG export (click 📥 in toolbar)');
console.log('');
console.log('Bundle Size: 14.50 KB gzipped');
console.log('');
console.log('='.repeat(60));
