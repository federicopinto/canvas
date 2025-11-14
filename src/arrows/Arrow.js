/**
 * Arrow - Model for connections between nodes
 */
export class Arrow {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.type = data.type || 'association'; // inheritance, composition, aggregation, dependency, association
    this.fromNodeId = data.from || data.fromNodeId;
    this.toNodeId = data.to || data.toNodeId;
    this.label = data.label || '';

    // Computed properties (set by router)
    this.path = null; // SVG path data
    this.fromAnchor = null;
    this.toAnchor = null;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `arrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set path data from router
   */
  setPath(pathData, fromAnchor, toAnchor) {
    this.path = pathData;
    this.fromAnchor = fromAnchor;
    this.toAnchor = toAnchor;
  }

  /**
   * Serialize to plain object
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      from: this.fromNodeId,
      to: this.toNodeId,
      label: this.label
    };
  }

  /**
   * Create from plain object
   */
  static fromJSON(data) {
    return new Arrow(data);
  }
}
