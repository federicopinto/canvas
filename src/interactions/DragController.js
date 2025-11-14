/**
 * DragController - Handles node dragging with smooth animations
 */
export class DragController {
  constructor(container, viewport, nodeRenderer, state, eventBus) {
    this.container = container;
    this.viewport = viewport;
    this.nodeRenderer = nodeRenderer;
    this.state = state;
    this.eventBus = eventBus;

    this.isDragging = false;
    this.draggedNodes = new Set();
    this.dragStartPos = { x: 0, y: 0 };
    this.lastWorldPos = { x: 0, y: 0 };
    this.rafId = null;

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
    this.stopDrag();
  }

  /**
   * Handle mouse down to start drag
   */
  handleMouseDown = (e) => {
    if (!this.enabled) return;

    // Only handle left click
    if (e.button !== 0) return;

    // Skip if spacebar is pressed (pan mode)
    if (e.code === 'Space') return;

    // Skip if panning
    if (this.state.getState().ui.isPanning) return;

    // Get click position in world coordinates
    const rect = this.container.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = this.viewport.screenToWorld(screenX, screenY);

    // Find node at position
    const node = this.nodeRenderer.findNodeAt(worldPos.x, worldPos.y);

    if (node) {
      // If node is not selected, select it first
      const selection = this.state.getState().selection;
      if (!selection.has(node.id)) {
        if (!e.shiftKey) {
          this.state.setSelection([node.id]);
        } else {
          this.state.addToSelection(node.id);
        }
      }

      // Start dragging all selected nodes
      this.startDrag(worldPos.x, worldPos.y, e);
    }
  };

  /**
   * Start dragging
   */
  startDrag(worldX, worldY, event) {
    this.isDragging = true;
    this.dragStartPos = { x: worldX, y: worldY };
    this.lastWorldPos = { x: worldX, y: worldY };

    // Get all selected nodes
    const selection = this.state.getState().selection;
    this.draggedNodes = new Set(selection);

    // Store initial positions
    this.initialPositions = new Map();
    this.draggedNodes.forEach(nodeId => {
      const node = this.state.getState().nodes.get(nodeId);
      if (node) {
        this.initialPositions.set(nodeId, { x: node.x, y: node.y });
      }
    });

    // Add dragging class to nodes
    this.draggedNodes.forEach(nodeId => {
      const element = this.nodeRenderer.getNodeElement(nodeId);
      if (element) {
        element.classList.add('dragging');
      }
    });

    // Update UI state
    this.state.setUI({
      isDragging: true,
      draggedNodes: this.draggedNodes
    });

    // Add event listeners
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);

    // Emit event
    this.eventBus.emit('drag:start', {
      nodeIds: Array.from(this.draggedNodes)
    });

    event.preventDefault();
  }

  /**
   * Handle mouse move during drag
   */
  handleMouseMove = (e) => {
    if (!this.isDragging) return;

    // Throttle to RAF
    if (this.rafId) return;

    this.rafId = requestAnimationFrame(() => {
      this.updateDrag(e);
      this.rafId = null;
    });
  };

  /**
   * Update drag position
   */
  updateDrag(e) {
    // Get current position in world coordinates
    const rect = this.container.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = this.viewport.screenToWorld(screenX, screenY);

    // Calculate delta from initial position
    const dx = worldPos.x - this.dragStartPos.x;
    const dy = worldPos.y - this.dragStartPos.y;

    // Update all dragged nodes
    this.draggedNodes.forEach(nodeId => {
      const node = this.state.getState().nodes.get(nodeId);
      const initialPos = this.initialPositions.get(nodeId);

      if (node && initialPos) {
        // Update node position
        this.state.updateNode(nodeId, {
          x: initialPos.x + dx,
          y: initialPos.y + dy
        });

        // Update transform directly for smooth animation
        const element = this.nodeRenderer.getNodeElement(nodeId);
        if (element) {
          element.setAttribute(
            'transform',
            `translate(${initialPos.x + dx}, ${initialPos.y + dy})`
          );
        }
      }
    });

    this.lastWorldPos = worldPos;

    // Emit event
    this.eventBus.emit('drag:move', {
      nodeIds: Array.from(this.draggedNodes),
      delta: { dx, dy }
    });
  }

  /**
   * Handle mouse up to stop drag
   */
  handleMouseUp = (e) => {
    if (!this.isDragging) return;
    this.stopDrag();
  };

  /**
   * Stop dragging
   */
  stopDrag() {
    if (!this.isDragging) return;

    this.isDragging = false;

    // Remove dragging class from nodes
    this.draggedNodes.forEach(nodeId => {
      const element = this.nodeRenderer.getNodeElement(nodeId);
      if (element) {
        element.classList.remove('dragging');
      }
    });

    // Update UI state
    this.state.setUI({
      isDragging: false,
      draggedNodes: new Set()
    });

    // Remove event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);

    // Cancel RAF
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Emit event
    this.eventBus.emit('drag:end', {
      nodeIds: Array.from(this.draggedNodes)
    });

    // Clear dragged nodes
    this.draggedNodes.clear();
    this.initialPositions = null;
  }

  /**
   * Check if currently dragging
   */
  isDraggingNodes() {
    return this.isDragging;
  }
}
