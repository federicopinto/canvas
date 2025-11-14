/**
 * MathUtils - Common math operations for canvas
 */
export class MathUtils {
  /**
   * Clamp value between min and max
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation
   */
  static lerp(start, end, t) {
    return start + (end - start) * t;
  }

  /**
   * Ease out cubic function
   */
  static easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Ease in out cubic function
   */
  static easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Check if point is inside rectangle
   */
  static pointInRect(px, py, x, y, width, height) {
    return px >= x && px <= x + width && py >= y && py <= y + height;
  }

  /**
   * Distance between two points
   */
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Round to nearest grid value
   */
  static snapToGrid(value, gridSize) {
    return Math.round(value / gridSize) * gridSize;
  }

  /**
   * Get bounding box for multiple rectangles
   */
  static getBoundingBox(rects) {
    if (rects.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    rects.forEach(rect => {
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Calculate zoom level to fit content in viewport
   */
  static calculateFitZoom(contentWidth, contentHeight, viewportWidth, viewportHeight, padding = 50) {
    const scaleX = (viewportWidth - padding * 2) / contentWidth;
    const scaleY = (viewportHeight - padding * 2) / contentHeight;
    return Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 1x
  }
}
