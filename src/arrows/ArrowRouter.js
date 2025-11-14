import { AnchorPoints } from './AnchorPoints.js';

/**
 * ArrowRouter - Calculate optimal paths for arrows between nodes
 * Uses hybrid orthogonal + Bezier approach
 */
export class ArrowRouter {
  constructor(state) {
    this.state = state;
    this.cornerRadius = 12;
    this.exitDistance = 30; // Distance to travel perpendicular before curving
  }

  /**
   * Route an arrow between two nodes
   */
  route(arrow) {
    const nodes = this.state.getState().nodes;
    const fromNode = nodes.get(arrow.fromNodeId);
    const toNode = nodes.get(arrow.toNodeId);

    if (!fromNode || !toNode) {
      return null;
    }

    // Find best anchor pair
    const { from, to } = AnchorPoints.findBestAnchorPair(fromNode, toNode);

    // Calculate path
    const path = this.calculatePath(from, to, fromNode, toNode);

    return {
      path,
      fromAnchor: from,
      toAnchor: to
    };
  }

  /**
   * Calculate SVG path between two anchors
   */
  calculatePath(fromAnchor, toAnchor, fromNode, toNode) {
    // Start point (on node boundary)
    const start = { x: fromAnchor.x, y: fromAnchor.y };

    // End point (on node boundary)
    const end = { x: toAnchor.x, y: toAnchor.y };

    // Exit point (perpendicular from start)
    const exitPoint = AnchorPoints.getOffsetPoint(fromAnchor, this.exitDistance);

    // Entry point (perpendicular to end)
    const entryPoint = AnchorPoints.getOffsetPoint(toAnchor, this.exitDistance);

    // Check if we need waypoints (simple obstacle avoidance)
    const needsWaypoint = this.pathIntersectsNodes(exitPoint, entryPoint, fromNode, toNode);

    if (needsWaypoint) {
      // Add a waypoint to avoid direct intersection
      const waypoint = this.calculateWaypoint(exitPoint, entryPoint, fromNode, toNode);
      return this.buildPathWithWaypoint(start, exitPoint, waypoint, entryPoint, end);
    } else {
      // Direct path with Bezier curve
      return this.buildDirectPath(start, exitPoint, entryPoint, end);
    }
  }

  /**
   * Build direct path with cubic Bezier
   */
  buildDirectPath(start, exitPoint, entryPoint, end) {
    const midX = (exitPoint.x + entryPoint.x) / 2;
    const midY = (exitPoint.y + entryPoint.y) / 2;

    // Build path
    const commands = [];

    // Move to start
    commands.push(`M ${start.x} ${start.y}`);

    // Line to exit point
    commands.push(`L ${exitPoint.x} ${exitPoint.y}`);

    // Cubic Bezier curve to entry point
    // Control points are positioned to create smooth curve
    const cp1x = exitPoint.x + (midX - exitPoint.x) * 0.6;
    const cp1y = exitPoint.y + (midY - exitPoint.y) * 0.6;
    const cp2x = entryPoint.x + (midX - entryPoint.x) * 0.6;
    const cp2y = entryPoint.y + (midY - entryPoint.y) * 0.6;

    commands.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${entryPoint.x} ${entryPoint.y}`);

    // Line to end
    commands.push(`L ${end.x} ${end.y}`);

    return commands.join(' ');
  }

  /**
   * Build path with waypoint for obstacle avoidance
   */
  buildPathWithWaypoint(start, exitPoint, waypoint, entryPoint, end) {
    const commands = [];

    // Move to start
    commands.push(`M ${start.x} ${start.y}`);

    // Line to exit point
    commands.push(`L ${exitPoint.x} ${exitPoint.y}`);

    // Curve to waypoint
    const mid1X = (exitPoint.x + waypoint.x) / 2;
    const mid1Y = (exitPoint.y + waypoint.y) / 2;
    commands.push(`Q ${mid1X} ${mid1Y}, ${waypoint.x} ${waypoint.y}`);

    // Curve to entry point
    const mid2X = (waypoint.x + entryPoint.x) / 2;
    const mid2Y = (waypoint.y + entryPoint.y) / 2;
    commands.push(`Q ${mid2X} ${mid2Y}, ${entryPoint.x} ${entryPoint.y}`);

    // Line to end
    commands.push(`L ${end.x} ${end.y}`);

    return commands.join(' ');
  }

  /**
   * Check if straight line intersects any nodes
   */
  pathIntersectsNodes(p1, p2, excludeNode1, excludeNode2) {
    const nodes = this.state.getState().nodes;

    for (const [nodeId, node] of nodes) {
      // Skip the endpoints
      if (node === excludeNode1 || node === excludeNode2) {
        continue;
      }

      // Check if line intersects this node's bounding box
      if (this.lineIntersectsRect(p1, p2, node)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if line segment intersects rectangle
   */
  lineIntersectsRect(p1, p2, rect) {
    const { x, y, width, height } = rect;

    // Check if line is completely outside bounding box
    if (Math.max(p1.x, p2.x) < x) return false;
    if (Math.min(p1.x, p2.x) > x + width) return false;
    if (Math.max(p1.y, p2.y) < y) return false;
    if (Math.min(p1.y, p2.y) > y + height) return false;

    // Check if either endpoint is inside
    if (this.pointInRect(p1, rect) || this.pointInRect(p2, rect)) {
      return true;
    }

    // Check if line intersects any edge
    const edges = [
      { x1: x, y1: y, x2: x + width, y2: y }, // Top
      { x1: x + width, y1: y, x2: x + width, y2: y + height }, // Right
      { x1: x, y1: y + height, x2: x + width, y2: y + height }, // Bottom
      { x1: x, y1: y, x2: x, y2: y + height } // Left
    ];

    for (const edge of edges) {
      if (this.linesIntersect(p1.x, p1.y, p2.x, p2.y, edge.x1, edge.y1, edge.x2, edge.y2)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if point is inside rectangle
   */
  pointInRect(point, rect) {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  /**
   * Check if two line segments intersect
   */
  linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (denominator === 0) {
      return false; // Parallel
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  /**
   * Calculate waypoint to avoid obstacles
   */
  calculateWaypoint(p1, p2, fromNode, toNode) {
    // Simple strategy: offset perpendicular to line
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular vector
    const perpX = -dy / length;
    const perpY = dx / length;

    // Midpoint
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    // Offset by 80 pixels
    const offset = 80;

    return {
      x: midX + perpX * offset,
      y: midY + perpY * offset
    };
  }

  /**
   * Route all arrows
   */
  routeAll() {
    const arrows = this.state.getState().arrows;
    const routes = new Map();

    arrows.forEach((arrow, id) => {
      const route = this.route(arrow);
      if (route) {
        routes.set(id, route);
      }
    });

    return routes;
  }
}
