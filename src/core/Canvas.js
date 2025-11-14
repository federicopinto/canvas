import { SVGBuilder } from '../utils/SVGBuilder.js';
import { EventBus } from './EventBus.js';
import { State } from './State.js';
import { PerformanceMonitor } from './PerformanceMonitor.js';
import { Viewport } from '../viewport/Viewport.js';
import { NodeRenderer } from '../nodes/NodeRenderer.js';
import { ArrowRenderer } from '../arrows/ArrowRenderer.js';
import { Node } from '../nodes/Node.js';
import { Arrow } from '../arrows/Arrow.js';
import { PanZoomController } from '../interactions/PanZoomController.js';
import { SelectionController } from '../interactions/SelectionController.js';
import { DragController } from '../interactions/DragController.js';
import { KeyboardController } from '../interactions/KeyboardController.js';
import { Animator } from '../animations/Animator.js';
import { Toolbar } from '../ui/Toolbar.js';
import { ZoomControl } from '../ui/ZoomControl.js';
import { PNGExporter } from '../export/PNGExporter.js';
import { AutoLayout } from '../layout/AutoLayout.js';

/**
 * Canvas - Main orchestrator for the canvas application
 */
export class Canvas {
  constructor(selector, options = {}) {
    // Get container element
    this.container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!this.container) {
      throw new Error(`Container not found: ${selector}`);
    }

    // Initialize core systems
    this.eventBus = new EventBus();
    this.state = new State();
    this.performanceMonitor = new PerformanceMonitor({
      enabled: options.debugPerformance !== false
    });
    this.animator = new Animator(this.eventBus);

    // Create SVG root
    this.svg = this.createSVG();
    this.container.appendChild(this.svg);

    // Initialize viewport
    this.viewport = new Viewport(this.state, this.eventBus, options.viewport);
    this.mainGroup = this.viewport.init(this.svg);

    // Initialize renderers
    this.nodeRenderer = new NodeRenderer(this.state, this.eventBus);
    this.nodeRenderer.init(this.mainGroup);

    this.arrowRenderer = new ArrowRenderer(this.state, this.eventBus);
    this.arrowRenderer.init(this.mainGroup, this.svg);

    // Initialize controllers
    this.panZoomController = new PanZoomController(
      this.viewport,
      this.svg,
      this.state,
      this.eventBus
    );
    this.panZoomController.enable();

    this.selectionController = new SelectionController(
      this.svg,
      this.viewport,
      this.nodeRenderer,
      this.state,
      this.eventBus
    );
    this.selectionController.enable();

    this.dragController = new DragController(
      this.svg,
      this.viewport,
      this.nodeRenderer,
      this.state,
      this.eventBus
    );
    this.dragController.enable();

    this.keyboardController = new KeyboardController(this);
    this.keyboardController.enable();

    // Initialize features
    this.pngExporter = new PNGExporter(this);
    this.autoLayout = new AutoLayout(this);

    // Initialize UI components (unless disabled)
    if (options.showUI !== false) {
      this.toolbar = new Toolbar(this);
      this.toolbar.init();

      this.zoomControl = new ZoomControl(this);
      this.zoomControl.init();
    }

    // Start animation loop
    this.startAnimationLoop();

    // Log initialization
    console.log('[Canvas] Initialized successfully');
    console.log('[Canvas] Phase 2 features enabled: Arrows, Animation, Auto-layout, Keyboard shortcuts, PNG export');
  }

  /**
   * Create SVG root element
   */
  createSVG() {
    const svg = SVGBuilder.svg({
      width: '100%',
      height: '100%',
      style: 'display: block; user-select: none;'
    });

    return svg;
  }

  /**
   * Start animation loop for performance monitoring
   */
  startAnimationLoop() {
    this.performanceMonitor.start();

    const loop = () => {
      this.performanceMonitor.tick();
      this.animationFrameId = requestAnimationFrame(loop);
    };

    loop();
  }

  /**
   * Stop animation loop
   */
  stopAnimationLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Add a node to the canvas
   */
  addNode(nodeData) {
    const node = nodeData instanceof Node ? nodeData : new Node(nodeData);
    this.state.addNode(node);

    this.eventBus.emit('node:added', node);

    console.log(`[Canvas] Added node: ${node.id} (${node.className})`);

    return node;
  }

  /**
   * Remove a node from the canvas
   */
  removeNode(nodeId) {
    const node = this.state.getState().nodes.get(nodeId);
    if (!node) return;

    this.state.removeNode(nodeId);
    this.eventBus.emit('node:removed', { nodeId });

    console.log(`[Canvas] Removed node: ${nodeId}`);
  }

  /**
   * Update a node
   */
  updateNode(nodeId, updates) {
    this.state.updateNode(nodeId, updates);
    this.eventBus.emit('node:updated', { nodeId, updates });
  }

  /**
   * Get a node by ID
   */
  getNode(nodeId) {
    return this.state.getState().nodes.get(nodeId);
  }

  /**
   * Get all nodes
   */
  getNodes() {
    return Array.from(this.state.getState().nodes.values());
  }

  /**
   * Add an arrow
   */
  addArrow(arrowData) {
    const arrow = arrowData instanceof Arrow ? arrowData : new Arrow(arrowData);

    this.state.addArrow(arrow);
    this.eventBus.emit('arrow:added', arrow);

    console.log(`[Canvas] Added arrow: ${arrow.id} (${arrow.fromNodeId} -> ${arrow.toNodeId})`);

    return arrow;
  }

  /**
   * Remove an arrow
   */
  removeArrow(arrowId) {
    this.state.removeArrow(arrowId);
    this.eventBus.emit('arrow:removed', { arrowId });

    console.log(`[Canvas] Removed arrow: ${arrowId}`);
  }

  /**
   * Clear all nodes and arrows
   */
  clear() {
    this.nodeRenderer.clear();
    this.arrowRenderer.clear();
    this.state.setState({
      nodes: new Map(),
      arrows: new Map(),
      selection: new Set()
    });

    this.eventBus.emit('canvas:cleared');

    console.log('[Canvas] Cleared all content');
  }

  /**
   * Fit viewport to all nodes
   */
  fitToContent(padding = 50) {
    this.viewport.fitToNodes(padding);
  }

  /**
   * Zoom to level
   */
  zoomTo(level) {
    this.panZoomController.zoomTo(level);
  }

  /**
   * Export canvas data
   */
  export() {
    const nodes = Array.from(this.state.getState().nodes.values()).map(node => node.toJSON());
    const arrows = Array.from(this.state.getState().arrows.values());

    return {
      nodes,
      arrows,
      viewport: this.state.getState().viewport
    };
  }

  /**
   * Import canvas data
   */
  import(data) {
    this.clear();

    if (data.nodes) {
      data.nodes.forEach(nodeData => this.addNode(nodeData));
    }

    if (data.arrows) {
      data.arrows.forEach(arrowData => this.addArrow(arrowData));
    }

    if (data.viewport) {
      this.state.setViewport(data.viewport);
      this.viewport.updateTransform();
    }

    console.log(`[Canvas] Imported ${data.nodes?.length || 0} nodes and ${data.arrows?.length || 0} arrows`);
  }

  /**
   * Subscribe to events
   */
  on(event, callback) {
    return this.eventBus.on(event, callback);
  }

  /**
   * Get performance stats
   */
  getPerformanceStats() {
    return this.performanceMonitor.getStats();
  }

  /**
   * Destroy canvas and cleanup
   */
  destroy() {
    this.stopAnimationLoop();

    // Disable controllers
    this.panZoomController.disable();
    this.selectionController.disable();
    this.dragController.disable();
    this.keyboardController.disable();

    // Stop animator
    if (this.animator) {
      this.animator.cancelAll();
    }

    // Destroy UI components
    if (this.toolbar) {
      this.toolbar.destroy();
    }
    if (this.zoomControl) {
      this.zoomControl.destroy();
    }

    // Clear event bus
    this.eventBus.clear();

    // Remove SVG
    this.svg.remove();

    console.log('[Canvas] Destroyed');
  }
}
