import * as PIXI from 'pixi.js';
import { ClassNodeRenderer } from '../renderers/ClassNodeRenderer';
import type { NodeData } from '../../types';

export class NodeLayer extends PIXI.Container {
  private nodes: Map<string, ClassNodeRenderer> = new Map();

  addNode(data: NodeData) {
    const node = new ClassNodeRenderer(data);
    this.nodes.set(data.id, node);
    this.addChild(node);
    return node;
  }

  removeNode(id: string) {
    const node = this.nodes.get(id);
    if (node) {
      this.removeChild(node);
      this.nodes.delete(id);
      node.destroy();
    }
  }

  getNode(id: string): ClassNodeRenderer | undefined {
    return this.nodes.get(id);
  }

  updateNode(id: string, data: Partial<NodeData>) {
    const node = this.nodes.get(id);
    if (node) {
      node.updateData(data);
    }
  }

  getAllNodes(): ClassNodeRenderer[] {
    return Array.from(this.nodes.values());
  }

  clear() {
    this.nodes.forEach(node => node.destroy());
    this.nodes.clear();
    this.removeChildren();
  }
}
