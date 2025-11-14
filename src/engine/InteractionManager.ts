import * as PIXI from 'pixi.js';
import type { ClassNodeRenderer } from '../pixi/renderers/ClassNodeRenderer';
import type { ArrowLayer } from '../pixi/layers/ArrowLayer';
import Flatbush from 'flatbush';

export class InteractionManager {
  private app: PIXI.Application;
  private nodeLayer: PIXI.Container;
  private arrowLayer: ArrowLayer | null = null;
  private spatialIndex: Flatbush | null = null;
  private nodes: Map<string, ClassNodeRenderer> = new Map();

  // Drag state
  private isDragging: boolean = false;
  private dragTarget: ClassNodeRenderer | null = null;
  private dragStart: { x: number; y: number } = { x: 0, y: 0 };
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };

  // Selection state
  private selectedNodes: Set<string> = new Set();

  constructor(app: PIXI.Application, nodeLayer: PIXI.Container) {
    this.app = app;
    this.nodeLayer = nodeLayer;

    this.setupEvents();
  }

  setArrowLayer(arrowLayer: ArrowLayer) {
    this.arrowLayer = arrowLayer;
  }

  private setupEvents() {
    const canvas = this.app.view as HTMLCanvasElement;

    // Mouse down - start drag or select
    this.nodeLayer.eventMode = 'static';
    this.nodeLayer.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      const globalPos = event.global;
      const localPos = this.nodeLayer.toLocal(globalPos);

      const node = this.findNodeAt(localPos.x, localPos.y);

      if (node) {
        this.startDrag(node, localPos);
      } else {
        // Clicked empty space - deselect all
        this.clearSelection();
      }
    });

    // Mouse move - continue drag
    this.nodeLayer.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
      if (this.isDragging && this.dragTarget) {
        const globalPos = event.global;
        const localPos = this.nodeLayer.toLocal(globalPos);

        this.updateDrag(localPos);
      }
    });

    // Mouse up - end drag
    this.nodeLayer.on('pointerup', () => {
      if (this.isDragging) {
        this.endDrag();
      }
    });

    this.nodeLayer.on('pointerupoutside', () => {
      if (this.isDragging) {
        this.endDrag();
      }
    });
  }

  registerNode(id: string, node: ClassNodeRenderer) {
    this.nodes.set(id, node);
    this.rebuildSpatialIndex();

    // Make node interactive
    node.eventMode = 'static';
    node.cursor = 'move';
  }

  unregisterNode(id: string) {
    this.nodes.delete(id);
    this.selectedNodes.delete(id);
    this.rebuildSpatialIndex();
  }

  private rebuildSpatialIndex() {
    if (this.nodes.size === 0) return;

    this.spatialIndex = new Flatbush(this.nodes.size);

    this.nodes.forEach(node => {
      const bounds = node.getBounds();
      this.spatialIndex!.add(
        bounds.x,
        bounds.y,
        bounds.x + bounds.width,
        bounds.y + bounds.height
      );
    });

    this.spatialIndex.finish();
  }

  private findNodeAt(x: number, y: number): ClassNodeRenderer | null {
    if (!this.spatialIndex) return null;

    const indices = this.spatialIndex.search(x, y, x, y);

    // Return the topmost node (last in array)
    if (indices.length > 0) {
      const nodesArray = Array.from(this.nodes.values());
      return nodesArray[indices[indices.length - 1]];
    }

    return null;
  }

  private startDrag(node: ClassNodeRenderer, pos: { x: number; y: number }) {
    this.isDragging = true;
    this.dragTarget = node;
    this.dragStart = { x: pos.x, y: pos.y };
    this.dragOffset = {
      x: pos.x - node.position.x,
      y: pos.y - node.position.y,
    };

    // Visual feedback
    node.setDragging(true);

    // Select node
    this.selectNode(node);
  }

  private updateDrag(pos: { x: number; y: number }) {
    if (!this.dragTarget) return;

    const newX = pos.x - this.dragOffset.x;
    const newY = pos.y - this.dragOffset.y;

    this.dragTarget.position.set(newX, newY);
    this.dragTarget.updateData({ x: newX, y: newY });

    // Update arrows in real-time
    if (this.arrowLayer) {
      const nodeData = this.dragTarget.nodeData;
      this.arrowLayer.updateNodePosition(
        nodeData.id,
        { x: newX, y: newY, width: nodeData.width, height: nodeData.height }
      );
    }
  }

  private endDrag() {
    if (this.dragTarget) {
      this.dragTarget.setDragging(false);
      this.dragTarget = null;
    }

    this.isDragging = false;
    this.rebuildSpatialIndex();
  }

  private selectNode(node: ClassNodeRenderer) {
    // Clear previous selection
    this.clearSelection();

    // Add to selection
    const nodeId = this.getNodeId(node);
    if (nodeId) {
      this.selectedNodes.add(nodeId);
      node.setSelected(true);
    }
  }

  private clearSelection() {
    this.selectedNodes.forEach(id => {
      const node = this.nodes.get(id);
      if (node) {
        node.setSelected(false);
      }
    });
    this.selectedNodes.clear();
  }

  private getNodeId(node: ClassNodeRenderer): string | null {
    for (const [id, n] of this.nodes.entries()) {
      if (n === node) return id;
    }
    return null;
  }
}
