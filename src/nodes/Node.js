import { Section } from './Section.js';
import { MathUtils } from '../utils/MathUtils.js';

/**
 * Node - Data model for a class diagram node
 */
export class Node {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.type = data.type || 'class';
    this.className = data.className || 'Untitled';
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.width = data.width || 200;
    this.height = data.height || 100;

    // Convert sections to Section instances
    this.sections = (data.sections || []).map(s =>
      s instanceof Section ? s : new Section(s)
    );

    // UI state
    this.selected = false;
    this.dragging = false;

    // Calculate initial height if not provided
    if (!data.height) {
      this.calculateHeight();
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate node height based on sections
   */
  calculateHeight() {
    const headerHeight = 40;
    const sectionsHeight = this.sections.reduce((sum, section) => {
      return sum + section.getHeight();
    }, 0);

    this.height = headerHeight + sectionsHeight + 16; // 16px padding
    return this.height;
  }

  /**
   * Get bounding box
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  /**
   * Check if point is inside node
   */
  contains(x, y) {
    return MathUtils.pointInRect(
      x,
      y,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  /**
   * Get anchor points for arrows (top, right, bottom, left)
   */
  getAnchorPoints() {
    const { x, y, width, height } = this;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    return {
      top: { x: centerX, y: y },
      right: { x: x + width, y: centerY },
      bottom: { x: centerX, y: y + height },
      left: { x: x, y: centerY },
      topLeft: { x: x, y: y },
      topRight: { x: x + width, y: y },
      bottomLeft: { x: x, y: y + height },
      bottomRight: { x: x + width, y: y + height }
    };
  }

  /**
   * Get closest anchor point to a position
   */
  getClosestAnchor(targetX, targetY) {
    const anchors = this.getAnchorPoints();
    let closest = null;
    let minDistance = Infinity;

    Object.entries(anchors).forEach(([name, point]) => {
      const distance = MathUtils.distance(point.x, point.y, targetX, targetY);
      if (distance < minDistance) {
        minDistance = distance;
        closest = { name, ...point };
      }
    });

    return closest;
  }

  /**
   * Move node by delta
   */
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  /**
   * Set position
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Resize node
   */
  resize(width, height) {
    this.width = Math.max(width, 100); // Minimum width
    this.height = Math.max(height, 50); // Minimum height
  }

  /**
   * Add section
   */
  addSection(section) {
    this.sections.push(section instanceof Section ? section : new Section(section));
    this.calculateHeight();
  }

  /**
   * Remove section
   */
  removeSection(index) {
    this.sections.splice(index, 1);
    this.calculateHeight();
  }

  /**
   * Clone node
   */
  clone() {
    return new Node({
      type: this.type,
      className: this.className,
      x: this.x + 20,
      y: this.y + 20,
      width: this.width,
      sections: this.sections.map(s => s.clone())
    });
  }

  /**
   * Serialize to plain object
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      className: this.className,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      sections: this.sections.map(s => s.toJSON())
    };
  }

  /**
   * Create from plain object
   */
  static fromJSON(data) {
    return new Node(data);
  }
}
