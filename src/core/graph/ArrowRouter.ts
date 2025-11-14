import type { Node } from '../../stores/nodes';

export interface Point {
  x: number;
  y: number;
}

export interface AnchorPoint extends Point {
  position: 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface RoutedPath {
  start: Point;
  end: Point;
  controlPoint1: Point;
  controlPoint2: Point;
  angle: number;
}

export class ArrowRouter {

  // Get 8 anchor points for a node (4 edges + 4 corners)
  getAnchorPoints(node: Node): AnchorPoint[] {
    const halfWidth = node.width / 2;
    const height = this.calculateNodeHeight(node);
    const halfHeight = height / 2;

    return [
      { x: node.x + halfWidth, y: node.y, position: 'top' },
      { x: node.x + node.width, y: node.y + halfHeight, position: 'right' },
      { x: node.x + halfWidth, y: node.y + height, position: 'bottom' },
      { x: node.x, y: node.y + halfHeight, position: 'left' },
      { x: node.x, y: node.y, position: 'top-left' },
      { x: node.x + node.width, y: node.y, position: 'top-right' },
      { x: node.x + node.width, y: node.y + height, position: 'bottom-right' },
      { x: node.x, y: node.y + height, position: 'bottom-left' }
    ];
  }

  calculateNodeHeight(node: Node): number {
    // Calculate section height recursively
    const calculateSectionHeight = (section: any): number => {
      let height = 32; // Section header

      if (section.expanded) {
        height += section.items.length * 24; // Each item
        for (const child of section.children) {
          height += calculateSectionHeight(child);
        }
      }

      return height;
    };

    let contentHeight = 0;
    for (const section of node.sections) {
      contentHeight += calculateSectionHeight(section);
    }

    // Header (44px) + content (minimum 60px)
    return 44 + Math.max(contentHeight, 60);
  }

  // Find best anchor points to minimize distance
  findBestAnchors(fromNode: Node, toNode: Node): { from: AnchorPoint; to: AnchorPoint } {
    const fromAnchors = this.getAnchorPoints(fromNode);
    const toAnchors = this.getAnchorPoints(toNode);

    let minDistance = Infinity;
    let bestFrom = fromAnchors[0];
    let bestTo = toAnchors[0];

    for (const from of fromAnchors) {
      for (const to of toAnchors) {
        const distance = this.distance(from, to);
        if (distance < minDistance) {
          minDistance = distance;
          bestFrom = from;
          bestTo = to;
        }
      }
    }

    return { from: bestFrom, to: bestTo };
  }

  distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Route arrow with cubic Bezier curve
  route(fromNode: Node, toNode: Node): RoutedPath {
    const { from, to } = this.findBestAnchors(fromNode, toNode);

    // Calculate control points for smooth curve
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const tension = Math.min(distance * 0.3, 100); // Control point distance

    let cp1: Point, cp2: Point;

    // Control points based on anchor positions
    if (from.position === 'right' || from.position === 'left') {
      cp1 = {
        x: from.x + (from.position === 'right' ? tension : -tension),
        y: from.y
      };
    } else {
      cp1 = {
        x: from.x,
        y: from.y + (from.position === 'bottom' ? tension : -tension)
      };
    }

    if (to.position === 'right' || to.position === 'left') {
      cp2 = {
        x: to.x + (to.position === 'right' ? tension : -tension),
        y: to.y
      };
    } else {
      cp2 = {
        x: to.x,
        y: to.y + (to.position === 'bottom' ? tension : -tension)
      };
    }

    // Calculate angle for arrowhead
    const angle = Math.atan2(to.y - cp2.y, to.x - cp2.x) * 180 / Math.PI;

    return {
      start: from,
      end: to,
      controlPoint1: cp1,
      controlPoint2: cp2,
      angle
    };
  }
}
