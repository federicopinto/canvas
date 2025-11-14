import type { Point } from '../types';

export interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ArrowRouter {
  /**
   * Calculate anchor point position on a node
   */
  static getAnchorPoint(node: NodeBounds, anchor: string): Point {
    const { x, y, width, height } = node;
    const cx = x + width / 2;
    const cy = y + height / 2;

    switch (anchor) {
      case 'top':
        return { x: cx, y };
      case 'right':
        return { x: x + width, y: cy };
      case 'bottom':
        return { x: cx, y: y + height };
      case 'left':
        return { x, y: cy };
      case 'top-left':
        return { x, y };
      case 'top-right':
        return { x: x + width, y };
      case 'bottom-right':
        return { x: x + width, y: y + height };
      case 'bottom-left':
        return { x, y: y + height };
      default:
        return { x: cx, y: cy };
    }
  }

  /**
   * Find best anchor points for two nodes
   * Returns [fromAnchor, toAnchor]
   */
  static findBestAnchors(from: NodeBounds, to: NodeBounds): [string, string] {
    const fromCenter = {
      x: from.x + from.width / 2,
      y: from.y + from.height / 2,
    };
    const toCenter = {
      x: to.x + to.width / 2,
      y: to.y + to.height / 2,
    };

    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;

    // Determine primary direction
    let fromAnchor: string;
    let toAnchor: string;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal primary
      if (dx > 0) {
        fromAnchor = 'right';
        toAnchor = 'left';
      } else {
        fromAnchor = 'left';
        toAnchor = 'right';
      }
    } else {
      // Vertical primary
      if (dy > 0) {
        fromAnchor = 'bottom';
        toAnchor = 'top';
      } else {
        fromAnchor = 'top';
        toAnchor = 'bottom';
      }
    }

    return [fromAnchor, toAnchor];
  }

  /**
   * Generate orthogonal path with rounded corners
   */
  static routeOrthogonal(
    start: Point,
    end: Point,
    cornerRadius: number = 12
  ): Point[] {
    const path: Point[] = [];

    path.push(start);

    // Simple L-shape routing
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    if (Math.abs(dx) > cornerRadius * 2 && Math.abs(dy) > cornerRadius * 2) {
      // Two-segment path with rounded corner
      const midX = start.x + dx / 2;

      path.push({ x: midX, y: start.y });
      path.push({ x: midX, y: end.y });
    } else if (Math.abs(dx) > cornerRadius * 2) {
      // Horizontal then vertical
      path.push({ x: end.x, y: start.y });
    } else if (Math.abs(dy) > cornerRadius * 2) {
      // Vertical then horizontal
      path.push({ x: start.x, y: end.y });
    }

    path.push(end);

    return path;
  }

  /**
   * Convert waypoints to smooth curves
   */
  static smoothPath(waypoints: Point[], radius: number = 12): string {
    if (waypoints.length < 2) return '';

    let pathData = `M ${waypoints[0].x} ${waypoints[0].y}`;

    for (let i = 1; i < waypoints.length - 1; i++) {
      const prev = waypoints[i - 1];
      const curr = waypoints[i];
      const next = waypoints[i + 1];

      // Calculate distances
      const d1 = Math.hypot(curr.x - prev.x, curr.y - prev.y);
      const d2 = Math.hypot(next.x - curr.x, next.y - curr.y);

      const r = Math.min(radius, d1 / 2, d2 / 2);

      // Direction vectors
      const dx1 = (curr.x - prev.x) / d1;
      const dy1 = (curr.y - prev.y) / d1;
      const dx2 = (next.x - curr.x) / d2;
      const dy2 = (next.y - curr.y) / d2;

      // Points before and after corner
      const p1 = {
        x: curr.x - dx1 * r,
        y: curr.y - dy1 * r,
      };
      const p2 = {
        x: curr.x + dx2 * r,
        y: curr.y + dy2 * r,
      };

      // Line to corner start, arc around corner
      pathData += ` L ${p1.x} ${p1.y}`;
      pathData += ` Q ${curr.x} ${curr.y} ${p2.x} ${p2.y}`;
    }

    // Line to end
    const last = waypoints[waypoints.length - 1];
    pathData += ` L ${last.x} ${last.y}`;

    return pathData;
  }
}
