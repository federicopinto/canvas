import * as PIXI from 'pixi.js';
import { GRID_DOT_COLOR } from '../../utils/colors';

/**
 * GridLayer renders an infinite dot grid that scrolls with viewport pan
 * Creates the illusion of an infinite canvas
 */
export class GridLayer {
  graphics: PIXI.Graphics;
  private gridSpacing: number = 20;
  private dotSize: number = 2;

  constructor() {
    this.graphics = new PIXI.Graphics();
  }

  /**
   * Render the grid based on current viewport position and scale
   * Only renders dots that are visible in the current viewport
   */
  render(viewportX: number, viewportY: number, scale: number) {
    this.graphics.clear();

    const scaledSpacing = this.gridSpacing * scale;
    const scaledDotSize = Math.max(1, this.dotSize * scale);

    // Calculate visible grid bounds with some padding
    const startX = Math.floor(-viewportX / scaledSpacing) * scaledSpacing;
    const startY = Math.floor(-viewportY / scaledSpacing) * scaledSpacing;
    const endX = startX + window.innerWidth + scaledSpacing * 2;
    const endY = startY + window.innerHeight + scaledSpacing * 2;

    // Draw dots in a grid pattern
    this.graphics.beginFill(GRID_DOT_COLOR);
    for (let x = startX; x < endX; x += scaledSpacing) {
      for (let y = startY; y < endY; y += scaledSpacing) {
        const screenX = x + viewportX;
        const screenY = y + viewportY;
        this.graphics.drawCircle(screenX / scale, screenY / scale, scaledDotSize / scale);
      }
    }
    this.graphics.endFill();
  }

  /**
   * Update grid spacing (for dynamic grid density based on zoom)
   */
  setSpacing(spacing: number) {
    this.gridSpacing = spacing;
  }

  /**
   * Update dot size
   */
  setDotSize(size: number) {
    this.dotSize = size;
  }
}
