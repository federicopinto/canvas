/**
 * Camera - Pure functions for coordinate conversion
 */
export class Camera {
  /**
   * Convert screen coordinates to world coordinates
   */
  static screenToWorld(screenX, screenY, viewport) {
    const { x, y, zoom } = viewport;
    return {
      x: (screenX - x) / zoom,
      y: (screenY - y) / zoom
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  static worldToScreen(worldX, worldY, viewport) {
    const { x, y, zoom } = viewport;
    return {
      x: worldX * zoom + x,
      y: worldY * zoom + y
    };
  }

  /**
   * Get transform matrix for viewport
   */
  static getTransformMatrix(viewport) {
    const { x, y, zoom } = viewport;
    return {
      a: zoom,  // scaleX
      b: 0,
      c: 0,
      d: zoom,  // scaleY
      e: x,     // translateX
      f: y      // translateY
    };
  }

  /**
   * Get transform string for SVG
   */
  static getTransformString(viewport) {
    const { x, y, zoom } = viewport;
    return `translate(${x}, ${y}) scale(${zoom})`;
  }

  /**
   * Get inverse transform for converting screen to world
   */
  static getInverseMatrix(viewport) {
    const { x, y, zoom } = viewport;
    const invZoom = 1 / zoom;
    return {
      a: invZoom,
      b: 0,
      c: 0,
      d: invZoom,
      e: -x * invZoom,
      f: -y * invZoom
    };
  }

  /**
   * Calculate zoom origin point for zooming toward cursor
   */
  static calculateZoomOrigin(cursorX, cursorY, oldZoom, newZoom, viewport) {
    const { x: oldX, y: oldY } = viewport;

    // World position of cursor before zoom
    const worldX = (cursorX - oldX) / oldZoom;
    const worldY = (cursorY - oldY) / oldZoom;

    // New viewport offset to keep cursor at same world position
    const newX = cursorX - worldX * newZoom;
    const newY = cursorY - worldY * newZoom;

    return { x: newX, y: newY };
  }

  /**
   * Get visible bounds in world coordinates
   */
  static getVisibleBounds(viewportWidth, viewportHeight, viewport) {
    const topLeft = this.screenToWorld(0, 0, viewport);
    const bottomRight = this.screenToWorld(viewportWidth, viewportHeight, viewport);

    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    };
  }

  /**
   * Check if a rectangle is visible in viewport
   */
  static isRectVisible(rect, viewportWidth, viewportHeight, viewport) {
    const bounds = this.getVisibleBounds(viewportWidth, viewportHeight, viewport);

    return !(
      rect.x + rect.width < bounds.x ||
      rect.x > bounds.x + bounds.width ||
      rect.y + rect.height < bounds.y ||
      rect.y > bounds.y + bounds.height
    );
  }
}
