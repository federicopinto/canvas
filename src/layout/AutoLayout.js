import { HierarchyLayout } from './HierarchyLayout.js';
import { Easing } from '../animations/Tween.js';

/**
 * AutoLayout - Coordinate automatic layout with animation
 */
export class AutoLayout {
  constructor(canvas) {
    this.canvas = canvas;
    this.layoutEngine = new HierarchyLayout();
  }

  /**
   * Trigger auto-layout
   */
  trigger() {
    console.log('[AutoLayout] Starting auto-layout...');

    const nodes = this.canvas.state.getState().nodes;
    const arrows = this.canvas.state.getState().arrows;

    if (nodes.size === 0) {
      console.warn('[AutoLayout] No nodes to layout');
      return;
    }

    // Calculate new positions
    const newPositions = this.layoutEngine.layout(nodes, arrows);

    console.log(`[AutoLayout] Calculated positions for ${newPositions.length} nodes`);

    // Animate nodes to new positions
    this.animateToPositions(newPositions);
  }

  /**
   * Animate nodes to new positions
   */
  animateToPositions(positions) {
    if (!this.canvas.animator) {
      console.warn('[AutoLayout] Animator not available, moving nodes instantly');
      this.moveToPositionsInstant(positions);
      return;
    }

    const nodes = this.canvas.state.getState().nodes;

    positions.forEach(({ id, x, y }) => {
      const node = nodes.get(id);
      if (!node) return;

      // Animate both x and y
      this.canvas.animator.animate(node, 'x', x, 600, Easing.easeInOutQuart, () => {
        // Update node renderer after animation
        this.canvas.nodeRenderer.updateNode(node);
      });

      this.canvas.animator.animate(node, 'y', y, 600, Easing.easeInOutQuart, () => {
        this.canvas.nodeRenderer.updateNode(node);
      });
    });

    // Fit to content after animation completes
    setTimeout(() => {
      this.canvas.fitToContent(100);
      console.log('[AutoLayout] Layout complete');
    }, 650);
  }

  /**
   * Move nodes to positions instantly (fallback)
   */
  moveToPositionsInstant(positions) {
    const nodes = this.canvas.state.getState().nodes;

    positions.forEach(({ id, x, y }) => {
      const node = nodes.get(id);
      if (!node) return;

      node.x = x;
      node.y = y;
      this.canvas.nodeRenderer.updateNode(node);
    });

    this.canvas.fitToContent(100);
    console.log('[AutoLayout] Layout complete (instant)');
  }

  /**
   * Set layout spacing
   */
  setSpacing(horizontal, vertical) {
    this.layoutEngine.setSpacing(horizontal, vertical);
  }
}
