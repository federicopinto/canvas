/**
 * KeyboardController - Handle keyboard shortcuts
 */
export class KeyboardController {
  constructor(canvas) {
    this.canvas = canvas;
    this.enabled = false;
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Enable keyboard shortcuts
   */
  enable() {
    if (this.enabled) return;

    document.addEventListener('keydown', this.boundHandleKeyDown);
    this.enabled = true;

    console.log('[KeyboardController] Enabled');
  }

  /**
   * Disable keyboard shortcuts
   */
  disable() {
    if (!this.enabled) return;

    document.removeEventListener('keydown', this.boundHandleKeyDown);
    this.enabled = false;

    console.log('[KeyboardController] Disabled');
  }

  /**
   * Handle keydown events
   */
  handleKeyDown(e) {
    // Ignore if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const isMod = e.ctrlKey || e.metaKey; // Ctrl on Windows/Linux, Cmd on Mac

    // Ctrl/Cmd + 0: Reset zoom to 100%
    if (isMod && e.key === '0') {
      e.preventDefault();
      this.canvas.zoomTo(1.0);
      console.log('[Keyboard] Reset zoom to 100%');
      return;
    }

    // Ctrl/Cmd + 1: Fit to screen
    if (isMod && e.key === '1') {
      e.preventDefault();
      this.canvas.fitToContent(100);
      console.log('[Keyboard] Fit to screen');
      return;
    }

    // Ctrl/Cmd + A: Select all nodes
    if (isMod && e.key === 'a') {
      e.preventDefault();
      this.selectAll();
      console.log('[Keyboard] Select all');
      return;
    }

    // Ctrl/Cmd + D: Deselect all
    if (isMod && e.key === 'd') {
      e.preventDefault();
      this.deselectAll();
      console.log('[Keyboard] Deselect all');
      return;
    }

    // Escape: Deselect all
    if (e.key === 'Escape') {
      this.deselectAll();
      console.log('[Keyboard] Deselect all (Escape)');
      return;
    }

    // Delete/Backspace: Delete selected nodes
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Only if not in text input
      if (!e.target.isContentEditable) {
        e.preventDefault();
        this.deleteSelected();
        console.log('[Keyboard] Delete selected');
        return;
      }
    }

    // +/=: Zoom in
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      const currentZoom = this.canvas.state.getState().viewport.zoom;
      this.canvas.zoomTo(currentZoom * 1.2);
      console.log('[Keyboard] Zoom in');
      return;
    }

    // -: Zoom out
    if (e.key === '-') {
      e.preventDefault();
      const currentZoom = this.canvas.state.getState().viewport.zoom;
      this.canvas.zoomTo(currentZoom / 1.2);
      console.log('[Keyboard] Zoom out');
      return;
    }

    // Arrow keys: Pan viewport (when no nodes selected)
    const selection = this.canvas.state.getState().selection;
    if (selection.size === 0) {
      const panDistance = 50;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.panViewport(0, panDistance);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.panViewport(0, -panDistance);
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.panViewport(panDistance, 0);
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.panViewport(-panDistance, 0);
        return;
      }
    }
  }

  /**
   * Select all nodes
   */
  selectAll() {
    const nodes = this.canvas.state.getState().nodes;
    const nodeIds = Array.from(nodes.keys());
    this.canvas.state.setSelection(nodeIds);
  }

  /**
   * Deselect all nodes
   */
  deselectAll() {
    this.canvas.state.clearSelection();
  }

  /**
   * Delete selected nodes
   */
  deleteSelected() {
    const selection = this.canvas.state.getState().selection;

    if (selection.size === 0) return;

    const confirmed = confirm(`Delete ${selection.size} selected node(s)?`);

    if (confirmed) {
      selection.forEach(nodeId => {
        this.canvas.removeNode(nodeId);
      });

      // Also remove arrows connected to deleted nodes
      const arrows = this.canvas.state.getState().arrows;
      arrows.forEach((arrow, arrowId) => {
        if (selection.has(arrow.fromNodeId) || selection.has(arrow.toNodeId)) {
          this.canvas.removeArrow(arrowId);
        }
      });
    }
  }

  /**
   * Pan viewport
   */
  panViewport(dx, dy) {
    const viewport = this.canvas.state.getState().viewport;
    this.canvas.state.setViewport({
      x: viewport.x + dx,
      y: viewport.y + dy
    });
    this.canvas.viewport.updateTransform();
  }
}
