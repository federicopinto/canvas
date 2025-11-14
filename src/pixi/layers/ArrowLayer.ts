import * as PIXI from 'pixi.js';
import { ArrowRenderer } from '../renderers/ArrowRenderer';
import type { ArrowData } from '../../types';
import type { NodeBounds } from '../../engine/ArrowRouter';

export class ArrowLayer extends PIXI.Container {
  private arrows: Map<string, ArrowRenderer> = new Map();
  private nodePositions: Map<string, NodeBounds> = new Map();

  addArrow(data: ArrowData): ArrowRenderer {
    const arrow = new ArrowRenderer(data);
    this.arrows.set(data.id, arrow);
    this.addChild(arrow);

    // Render if both nodes exist
    this.updateArrow(data.id);

    return arrow;
  }

  removeArrow(id: string) {
    const arrow = this.arrows.get(id);
    if (arrow) {
      this.removeChild(arrow);
      this.arrows.delete(id);
      arrow.destroy();
    }
  }

  updateNodePosition(nodeId: string, bounds: NodeBounds) {
    this.nodePositions.set(nodeId, bounds);

    // Update all arrows connected to this node
    this.arrows.forEach((arrow, arrowId) => {
      const data = arrow.getArrowData();
      if (data.fromNodeId === nodeId || data.toNodeId === nodeId) {
        this.updateArrow(arrowId);
      }
    });
  }

  private updateArrow(arrowId: string) {
    const arrow = this.arrows.get(arrowId);
    if (!arrow) return;

    const data = arrow.getArrowData();
    const fromNode = this.nodePositions.get(data.fromNodeId);
    const toNode = this.nodePositions.get(data.toNodeId);

    if (fromNode && toNode) {
      arrow.render(fromNode, toNode);
    }
  }

  updateAllArrows() {
    this.arrows.forEach((_, arrowId) => {
      this.updateArrow(arrowId);
    });
  }

  getArrow(id: string): ArrowRenderer | undefined {
    return this.arrows.get(id);
  }

  clear() {
    this.arrows.forEach(arrow => arrow.destroy());
    this.arrows.clear();
    this.removeChildren();
  }
}
