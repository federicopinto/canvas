/**
 * State - Immutable state management with observers
 */
export class State {
  constructor(initialState = {}) {
    this.state = {
      nodes: new Map(),
      arrows: new Map(),
      selection: new Set(),
      viewport: {
        x: 0,
        y: 0,
        zoom: 1
      },
      ui: {
        isDragging: false,
        isPanning: false,
        draggedNodes: new Set()
      },
      ...initialState
    };
    this.subscribers = new Set();
  }

  /**
   * Get current state (immutable)
   */
  getState() {
    return this.state;
  }

  /**
   * Update state and notify subscribers
   */
  setState(updates) {
    const oldState = this.state;

    // Merge updates into new state object
    this.state = {
      ...oldState,
      ...updates
    };

    // Notify all subscribers
    this.subscribers.forEach(callback => {
      try {
        callback(this.state, oldState);
      } catch (error) {
        console.error('Error in state subscriber:', error);
      }
    });
  }

  /**
   * Update nested viewport state
   */
  setViewport(updates) {
    this.setState({
      viewport: {
        ...this.state.viewport,
        ...updates
      }
    });
  }

  /**
   * Update nested UI state
   */
  setUI(updates) {
    this.setState({
      ui: {
        ...this.state.ui,
        ...updates
      }
    });
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback) {
    this.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Add a node to state
   */
  addNode(node) {
    const newNodes = new Map(this.state.nodes);
    newNodes.set(node.id, node);
    this.setState({ nodes: newNodes });
  }

  /**
   * Remove a node from state
   */
  removeNode(nodeId) {
    const newNodes = new Map(this.state.nodes);
    newNodes.delete(nodeId);

    // Also remove from selection if selected
    const newSelection = new Set(this.state.selection);
    newSelection.delete(nodeId);

    this.setState({
      nodes: newNodes,
      selection: newSelection
    });
  }

  /**
   * Update a node in state
   */
  updateNode(nodeId, updates) {
    const node = this.state.nodes.get(nodeId);
    if (!node) return;

    const newNodes = new Map(this.state.nodes);
    newNodes.set(nodeId, { ...node, ...updates });
    this.setState({ nodes: newNodes });
  }

  /**
   * Add an arrow to state
   */
  addArrow(arrow) {
    const newArrows = new Map(this.state.arrows);
    newArrows.set(arrow.id, arrow);
    this.setState({ arrows: newArrows });
  }

  /**
   * Remove an arrow from state
   */
  removeArrow(arrowId) {
    const newArrows = new Map(this.state.arrows);
    newArrows.delete(arrowId);
    this.setState({ arrows: newArrows });
  }

  /**
   * Set selection
   */
  setSelection(nodeIds) {
    const newSelection = new Set(Array.isArray(nodeIds) ? nodeIds : [nodeIds]);
    this.setState({ selection: newSelection });
  }

  /**
   * Add to selection
   */
  addToSelection(nodeId) {
    const newSelection = new Set(this.state.selection);
    newSelection.add(nodeId);
    this.setState({ selection: newSelection });
  }

  /**
   * Remove from selection
   */
  removeFromSelection(nodeId) {
    const newSelection = new Set(this.state.selection);
    newSelection.delete(nodeId);
    this.setState({ selection: newSelection });
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.setState({ selection: new Set() });
  }

  /**
   * Toggle node selection
   */
  toggleSelection(nodeId) {
    const newSelection = new Set(this.state.selection);
    if (newSelection.has(nodeId)) {
      newSelection.delete(nodeId);
    } else {
      newSelection.add(nodeId);
    }
    this.setState({ selection: newSelection });
  }
}
