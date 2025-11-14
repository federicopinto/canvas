import { SVGBuilder } from '../utils/SVGBuilder.js';

/**
 * Grid - Infinite dot grid pattern
 */
export class Grid {
  constructor(options = {}) {
    this.dotSize = options.dotSize || 2;
    this.spacing = options.spacing || 20;
    this.color = options.color || '#E5E5E5';
    this.patternId = 'grid-pattern';

    this.pattern = null;
    this.rect = null;
  }

  /**
   * Create grid pattern and background
   */
  create() {
    // Create defs and pattern
    const defs = SVGBuilder.defs();

    this.pattern = SVGBuilder.pattern({
      id: this.patternId,
      width: this.spacing,
      height: this.spacing,
      patternUnits: 'userSpaceOnUse'
    });

    // Create dot
    const dot = SVGBuilder.circle({
      cx: this.dotSize / 2,
      cy: this.dotSize / 2,
      r: this.dotSize / 2,
      fill: this.color
    });

    this.pattern.appendChild(dot);
    defs.appendChild(this.pattern);

    // Create background rectangle that uses the pattern
    this.rect = SVGBuilder.rect({
      x: -50000,
      y: -50000,
      width: 100000,
      height: 100000,
      fill: `url(#${this.patternId})`
    });

    return { defs, rect: this.rect };
  }

  /**
   * Update grid pattern scale based on zoom
   */
  updateScale(zoom) {
    if (this.pattern) {
      // Scale the pattern with zoom to keep dots consistent size
      const scaledSpacing = this.spacing * zoom;
      this.pattern.setAttribute('width', scaledSpacing);
      this.pattern.setAttribute('height', scaledSpacing);
    }
  }

  /**
   * Update grid color
   */
  updateColor(color) {
    this.color = color;
    if (this.pattern) {
      const dot = this.pattern.querySelector('circle');
      if (dot) {
        dot.setAttribute('fill', color);
      }
    }
  }

  /**
   * Show/hide grid
   */
  setVisible(visible) {
    if (this.rect) {
      this.rect.style.display = visible ? 'block' : 'none';
    }
  }
}
