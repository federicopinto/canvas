import { SVGBuilder } from '../utils/SVGBuilder.js';
import { MathUtils } from '../utils/MathUtils.js';
import { Camera } from './Camera.js';
import { Grid } from './Grid.js';

/**
 * Viewport - Manages pan/zoom state and transformations
 */
export class Viewport {
  constructor(state, eventBus, options = {}) {
    this.state = state;
    this.eventBus = eventBus;

    this.minZoom = options.minZoom || 0.1;
    this.maxZoom = options.maxZoom || 4.0;
    this.zoomSpeed = options.zoomSpeed || 0.001;

    this.container = null;
    this.mainGroup = null;
    this.grid = new Grid(options.grid);
  }

  /**
   * Initialize viewport with SVG container
   */
  init(container) {
    this.container = container;

    // Create main transform group
    this.mainGroup = SVGBuilder.g({ class: 'viewport-main' });

    // Create grid
    const { defs, rect } = this.grid.create();
    container.appendChild(defs);
    this.mainGroup.appendChild(rect);

    container.appendChild(this.mainGroup);

    // Apply initial transform
    this.updateTransform();

    return this.mainGroup;
  }

  /**
   * Get main group for adding content
   */
  getMainGroup() {
    return this.mainGroup;
  }

  /**
   * Pan viewport by delta
   */
  pan(dx, dy) {
    const viewport = this.state.getState().viewport;
    this.state.setViewport({
      x: viewport.x + dx,
      y: viewport.y + dy
    });

    this.updateTransform();
    this.eventBus.emit('viewport:changed', this.state.getState().viewport);
  }

  /**
   * Set absolute pan position
   */
  setPan(x, y) {
    this.state.setViewport({ x, y });
    this.updateTransform();
    this.eventBus.emit('viewport:changed', this.state.getState().viewport);
  }

  /**
   * Zoom viewport
   */
  zoom(delta, cursorX, cursorY) {
    const viewport = this.state.getState().viewport;
    const oldZoom = viewport.zoom;

    // Calculate new zoom level
    let newZoom = oldZoom * (1 + delta * this.zoomSpeed);
    newZoom = MathUtils.clamp(newZoom, this.minZoom, this.maxZoom);

    if (newZoom === oldZoom) return; // No change

    // Calculate new pan offset to zoom toward cursor
    const { x: newX, y: newY } = Camera.calculateZoomOrigin(
      cursorX,
      cursorY,
      oldZoom,
      newZoom,
      viewport
    );

    this.state.setViewport({
      x: newX,
      y: newY,
      zoom: newZoom
    });

    this.updateTransform();
    this.grid.updateScale(newZoom);
    this.eventBus.emit('viewport:changed', this.state.getState().viewport);
  }

  /**
   * Set absolute zoom level
   */
  setZoom(zoom, centerX, centerY) {
    const viewport = this.state.getState().viewport;
    const newZoom = MathUtils.clamp(zoom, this.minZoom, this.maxZoom);

    if (centerX !== undefined && centerY !== undefined) {
      const { x: newX, y: newY } = Camera.calculateZoomOrigin(
        centerX,
        centerY,
        viewport.zoom,
        newZoom,
        viewport
      );

      this.state.setViewport({
        x: newX,
        y: newY,
        zoom: newZoom
      });
    } else {
      this.state.setViewport({ zoom: newZoom });
    }

    this.updateTransform();
    this.grid.updateScale(newZoom);
    this.eventBus.emit('viewport:changed', this.state.getState().viewport);
  }

  /**
   * Fit all nodes in viewport
   */
  fitToNodes(padding = 50) {
    const nodes = Array.from(this.state.getState().nodes.values());
    if (nodes.length === 0) return;

    // Get bounding box of all nodes
    const rects = nodes.map(node => ({
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height
    }));

    const bbox = MathUtils.getBoundingBox(rects);
    if (!bbox) return;

    // Get container dimensions
    const containerRect = this.container.getBoundingClientRect();
    const viewportWidth = containerRect.width;
    const viewportHeight = containerRect.height;

    // Calculate zoom to fit
    const zoom = MathUtils.calculateFitZoom(
      bbox.width,
      bbox.height,
      viewportWidth,
      viewportHeight,
      padding
    );

    // Calculate center position
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;

    // Center the content
    const x = viewportWidth / 2 - centerX * zoom;
    const y = viewportHeight / 2 - centerY * zoom;

    this.state.setViewport({ x, y, zoom });
    this.updateTransform();
    this.grid.updateScale(zoom);
    this.eventBus.emit('viewport:changed', this.state.getState().viewport);
  }

  /**
   * Update SVG transform
   */
  updateTransform() {
    if (!this.mainGroup) return;

    const viewport = this.state.getState().viewport;
    const transform = Camera.getTransformString(viewport);
    this.mainGroup.setAttribute('transform', transform);
  }

  /**
   * Convert screen to world coordinates
   */
  screenToWorld(screenX, screenY) {
    const viewport = this.state.getState().viewport;
    return Camera.screenToWorld(screenX, screenY, viewport);
  }

  /**
   * Convert world to screen coordinates
   */
  worldToScreen(worldX, worldY) {
    const viewport = this.state.getState().viewport;
    return Camera.worldToScreen(worldX, worldY, viewport);
  }

  /**
   * Get current viewport state
   */
  getViewport() {
    return this.state.getState().viewport;
  }

  /**
   * Reset viewport to default
   */
  reset() {
    this.state.setViewport({ x: 0, y: 0, zoom: 1 });
    this.updateTransform();
    this.grid.updateScale(1);
    this.eventBus.emit('viewport:changed', this.state.getState().viewport);
  }
}
