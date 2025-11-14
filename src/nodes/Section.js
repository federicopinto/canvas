/**
 * Section - Represents a section within a node (fields, methods, etc.)
 */
export class Section {
  constructor(data) {
    this.title = data.title || '';
    this.items = data.items || [];
    this.collapsed = data.collapsed || false;
  }

  /**
   * Get section height in pixels
   */
  getHeight(lineHeight = 20, padding = 8) {
    if (this.collapsed) {
      return lineHeight + padding * 2; // Just title
    }

    const titleHeight = this.title ? lineHeight + padding : 0;
    const itemsHeight = this.items.length * lineHeight + padding;

    return titleHeight + itemsHeight;
  }

  /**
   * Toggle collapsed state
   */
  toggle() {
    this.collapsed = !this.collapsed;
  }

  /**
   * Add item to section
   */
  addItem(item) {
    this.items.push(item);
  }

  /**
   * Remove item from section
   */
  removeItem(index) {
    this.items.splice(index, 1);
  }

  /**
   * Clone section
   */
  clone() {
    return new Section({
      title: this.title,
      items: [...this.items],
      collapsed: this.collapsed
    });
  }

  /**
   * Serialize to plain object
   */
  toJSON() {
    return {
      title: this.title,
      items: this.items,
      collapsed: this.collapsed
    };
  }

  /**
   * Create from plain object
   */
  static fromJSON(data) {
    return new Section(data);
  }
}
