/**
 * SelectionController - Handles node selection
 */
export class SelectionController {
  constructor(container, viewport, nodeRenderer, state, eventBus) {
    this.container = container;
    this.viewport = viewport;
    this.nodeRenderer = nodeRenderer;
    this.state = state;
    this.eventBus = eventBus;

    this.enabled = true;
  }

  /**
   * Enable the controller
   */
  enable() {
    this.enabled = true;
    this.container.addEventListener('mousedown', this.handleMouseDown);
  }

  /**
   * Disable the controller
   */
  disable() {
    this.enabled = false;
    this.container.removeEventListener('mousedown', this.handleMouseDown);
  }

  /**
   * Handle mouse down for selection
   */
  handleMouseDown = (e) => {
    if (!this.enabled) return;

    // Only handle left click
    if (e.button !== 0) return;

    // Skip if spacebar is pressed (pan mode)
    if (e.code === 'Space') return;

    // Get click position in world coordinates
    const rect = this.container.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = this.viewport.screenToWorld(screenX, screenY);

    // Find node at position
    const node = this.nodeRenderer.findNodeAt(worldPos.x, worldPos.y);

    if (node) {
      this.selectNode(node.id, e.shiftKey);
    } else {
      // Clicked empty area - deselect all
      if (!e.shiftKey) {
        this.clearSelection();
      }
    }
  };

  /**
   * Select a node
   */
  selectNode(nodeId, addToSelection = false) {
    const currentSelection = this.state.getState().selection;

    if (addToSelection) {
      // Toggle selection
      if (currentSelection.has(nodeId)) {
        this.state.removeFromSelection(nodeId);
      } else {
        this.state.addToSelection(nodeId);
      }
    } else {
      // Replace selection
      this.state.setSelection([nodeId]);
    }

    this.eventBus.emit('selection:changed', {
      selection: this.state.getState().selection,
      nodeId: nodeId
    });
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.state.clearSelection();
    this.eventBus.emit('selection:changed', {
      selection: new Set()
    });
  }

  /**
   * Select multiple nodes
   */
  selectNodes(nodeIds, addToSelection = false) {
    if (addToSelection) {
      nodeIds.forEach(id => this.state.addToSelection(id));
    } else {
      this.state.setSelection(nodeIds);
    }

    this.eventBus.emit('selection:changed', {
      selection: this.state.getState().selection
    });
  }

  /**
   * Select all nodes
   */
  selectAll() {
    const allNodeIds = Array.from(this.state.getState().nodes.keys());
    this.selectNodes(allNodeIds);
  }

  /**
   * Get selected nodes
   */
  getSelectedNodes() {
    const selection = this.state.getState().selection;
    const nodes = this.state.getState().nodes;

    return Array.from(selection)
      .map(id => nodes.get(id))
      .filter(node => node !== undefined);
  }

  /**
   * Check if node is selected
   */
  isSelected(nodeId) {
    return this.state.getState().selection.has(nodeId);
  }

  /**
   * Get selection count
   */
  getSelectionCount() {
    return this.state.getState().selection.size;
  }
}
