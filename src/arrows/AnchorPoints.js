/**
 * AnchorPoints - Calculate anchor points and directions for arrows
 */
export class AnchorPoints {
  /**
   * Get all 8 anchor points for a node (4 corners + 4 edge midpoints)
   */
  static getAnchors(node) {
    const { x, y, width, height } = node;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    return {
      // Edge midpoints
      top: {
        x: centerX,
        y: y,
        direction: { x: 0, y: -1 }, // Up
        side: 'top'
      },
      right: {
        x: x + width,
        y: centerY,
        direction: { x: 1, y: 0 }, // Right
        side: 'right'
      },
      bottom: {
        x: centerX,
        y: y + height,
        direction: { x: 0, y: 1 }, // Down
        side: 'bottom'
      },
      left: {
        x: x,
        y: centerY,
        direction: { x: -1, y: 0 }, // Left
        side: 'left'
      },
      // Corners
      topLeft: {
        x: x,
        y: y,
        direction: { x: -0.707, y: -0.707 }, // Up-left (normalized)
        side: 'topLeft'
      },
      topRight: {
        x: x + width,
        y: y,
        direction: { x: 0.707, y: -0.707 }, // Up-right
        side: 'topRight'
      },
      bottomLeft: {
        x: x,
        y: y + height,
        direction: { x: -0.707, y: 0.707 }, // Down-left
        side: 'bottomLeft'
      },
      bottomRight: {
        x: x + width,
        y: y + height,
        direction: { x: 0.707, y: 0.707 }, // Down-right
        side: 'bottomRight'
      }
    };
  }

  /**
   * Get array of all anchor points
   */
  static getAnchorArray(node) {
    const anchors = this.getAnchors(node);
    return Object.values(anchors);
  }

  /**
   * Find best anchor pair between two nodes
   * Minimizes distance and considers obstacle overlap
   */
  static findBestAnchorPair(fromNode, toNode) {
    const fromAnchors = this.getAnchorArray(fromNode);
    const toAnchors = this.getAnchorArray(toNode);

    let bestFrom = null;
    let bestTo = null;
    let minScore = Infinity;

    // Try all combinations
    fromAnchors.forEach(fromAnchor => {
      toAnchors.forEach(toAnchor => {
        // Calculate distance
        const dx = toAnchor.x - fromAnchor.x;
        const dy = toAnchor.y - fromAnchor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate angle alignment score
        // Prefer anchors that point toward each other
        const angle = Math.atan2(dy, dx);
        const fromAngle = Math.atan2(fromAnchor.direction.y, fromAnchor.direction.x);
        const toAngle = Math.atan2(-toAnchor.direction.y, -toAnchor.direction.x);

        const fromAngleDiff = Math.abs(this.normalizeAngle(angle - fromAngle));
        const toAngleDiff = Math.abs(this.normalizeAngle(angle - toAngle));

        // Score: distance + angle penalty
        const anglePenalty = (fromAngleDiff + toAngleDiff) * 50;
        const score = distance + anglePenalty;

        if (score < minScore) {
          minScore = score;
          bestFrom = fromAnchor;
          bestTo = toAnchor;
        }
      });
    });

    return { from: bestFrom, to: bestTo };
  }

  /**
   * Normalize angle to [-PI, PI]
   */
  static normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  /**
   * Get offset point from anchor in direction
   */
  static getOffsetPoint(anchor, distance) {
    return {
      x: anchor.x + anchor.direction.x * distance,
      y: anchor.y + anchor.direction.y * distance
    };
  }
}
