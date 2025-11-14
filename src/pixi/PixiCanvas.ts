import * as PIXI from 'pixi.js';
import { Viewport } from './Viewport';
import { GridLayer } from './layers/GridLayer';
import { NodeLayer } from './layers/NodeLayer';
import { ArrowLayer } from './layers/ArrowLayer';
import { InteractionManager } from '../engine/InteractionManager';
import { CANVAS_BACKGROUND } from '../utils/colors';
import type { NodeData, ArrowData } from '../types';

/**
 * PixiCanvas is the main manager for the Pixi.js rendering system
 * Orchestrates viewport, layers, and the render loop
 */
export class PixiCanvas {
  app: PIXI.Application;
  viewport: Viewport;
  gridLayer: GridLayer;
  arrowLayer: ArrowLayer;
  nodeLayer: NodeLayer;
  interactionManager: InteractionManager;

  constructor(container: HTMLElement) {
    // Initialize Pixi app with WebGL renderer
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: CANVAS_BACKGROUND,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    container.appendChild(this.app.view as HTMLCanvasElement);

    // Create viewport for pan/zoom
    this.viewport = new Viewport(this.app);
    this.app.stage.addChild(this.viewport.container);

    // Add grid layer
    this.gridLayer = new GridLayer();
    this.viewport.container.addChild(this.gridLayer.graphics);

    // Add arrow layer (BEFORE nodes so arrows render behind)
    this.arrowLayer = new ArrowLayer();
    this.viewport.container.addChild(this.arrowLayer);

    // Add node layer
    this.nodeLayer = new NodeLayer();
    this.viewport.container.addChild(this.nodeLayer);

    // Initialize interaction manager
    this.interactionManager = new InteractionManager(this.app, this.nodeLayer);
    this.interactionManager.setArrowLayer(this.arrowLayer);

    // Handle window resize
    this.setupResize();

    // Start render loop
    this.app.ticker.add(() => this.update());
  }

  /**
   * Main update loop called every frame
   */
  private update() {
    // Update grid based on viewport transform
    this.gridLayer.render(this.viewport.x, this.viewport.y, this.viewport.scale);
  }

  /**
   * Handle window resize events
   */
  private setupResize() {
    const handleResize = () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
  }

  /**
   * Get the current viewport state
   */
  getViewportState() {
    return {
      x: this.viewport.x,
      y: this.viewport.y,
      scale: this.viewport.scale,
    };
  }

  /**
   * Add a node to the canvas
   */
  addNode(data: NodeData) {
    const node = this.nodeLayer.addNode(data);
    this.interactionManager.registerNode(data.id, node);
    return node;
  }

  /**
   * Add an arrow to the canvas
   */
  addArrow(data: ArrowData) {
    return this.arrowLayer.addArrow(data);
  }

  /**
   * Update node position for arrow routing
   */
  updateNodePosition(nodeId: string, x: number, y: number, width: number, height: number) {
    this.arrowLayer.updateNodePosition(nodeId, { x, y, width, height });
  }
}
