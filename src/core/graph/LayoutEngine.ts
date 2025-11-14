import { nodes } from '../../stores/nodes';
import { arrows } from '../../stores/arrows';
import { get } from 'svelte/store';
import type { Node } from '../../stores/nodes';
import type { Arrow } from '../../stores/arrows';

export class LayoutEngine {
  private readonly HORIZONTAL_GAP = 120;
  private readonly VERTICAL_GAP = 100;
  private readonly MARGIN = 40;

  async arrange(nodeList: Node[]): Promise<void> {
    if (nodeList.length === 0) return;

    const arrowList = get(arrows);

    // Build dependency graph
    const graph = this.buildGraph(nodeList, arrowList);

    // Find root nodes (no incoming edges)
    const roots = this.findRoots(nodeList, arrowList);

    // Assign levels (topological sort)
    const levels = this.assignLevels(nodeList, arrowList, roots);

    // Calculate positions
    const positions = this.calculatePositions(levels);

    // Animate to new positions
    await this.animateToPositions(positions);
  }

  private buildGraph(nodeList: Node[], arrowList: Arrow[]): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    nodeList.forEach(node => {
      graph.set(node.id, new Set());
    });

    arrowList.forEach(arrow => {
      if (graph.has(arrow.from)) {
        graph.get(arrow.from)!.add(arrow.to);
      }
    });

    return graph;
  }

  private findRoots(nodeList: Node[], arrowList: Arrow[]): Set<string> {
    const hasIncoming = new Set<string>();

    arrowList.forEach(arrow => {
      hasIncoming.add(arrow.to);
    });

    const roots = new Set<string>();
    nodeList.forEach(node => {
      if (!hasIncoming.has(node.id)) {
        roots.add(node.id);
      }
    });

    return roots.size > 0 ? roots : new Set([nodeList[0].id]);
  }

  private assignLevels(nodeList: Node[], arrowList: Arrow[], roots: Set<string>): Map<number, Set<string>> {
    const levels = new Map<number, Set<string>>();
    const nodeLevel = new Map<string, number>();

    // BFS to assign levels
    const queue: Array<{ id: string; level: number }> = [];

    roots.forEach(id => {
      queue.push({ id, level: 0 });
      nodeLevel.set(id, 0);
    });

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;

      if (!levels.has(level)) {
        levels.set(level, new Set());
      }
      levels.get(level)!.add(id);

      // Find children
      arrowList.forEach(arrow => {
        if (arrow.from === id) {
          const childLevel = level + 1;
          const currentLevel = nodeLevel.get(arrow.to);

          if (currentLevel === undefined || currentLevel < childLevel) {
            nodeLevel.set(arrow.to, childLevel);
            queue.push({ id: arrow.to, level: childLevel });
          }
        }
      });
    }

    // Handle nodes not in any level (disconnected)
    nodeList.forEach(node => {
      if (!nodeLevel.has(node.id)) {
        const maxLevel = Math.max(...levels.keys(), -1) + 1;
        if (!levels.has(maxLevel)) {
          levels.set(maxLevel, new Set());
        }
        levels.get(maxLevel)!.add(node.id);
      }
    });

    return levels;
  }

  private calculatePositions(levels: Map<number, Set<string>>): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();

    let y = this.MARGIN;

    levels.forEach((nodeIds, level) => {
      const nodesInLevel = Array.from(nodeIds);
      const levelWidth = nodesInLevel.length * 280 + (nodesInLevel.length - 1) * this.HORIZONTAL_GAP;

      let x = (window.innerWidth - levelWidth) / 2;

      nodesInLevel.forEach(nodeId => {
        positions.set(nodeId, { x, y });
        x += 280 + this.HORIZONTAL_GAP;
      });

      y += 250 + this.VERTICAL_GAP; // Approximate node height
    });

    return positions;
  }

  private async animateToPositions(positions: Map<string, { x: number; y: number }>): Promise<void> {
    const currentNodes = get(nodes);
    const duration = 600;
    const startTime = performance.now();

    // Store start positions
    const startPositions = new Map<string, { x: number; y: number }>();
    currentNodes.forEach(node => {
      startPositions.set(node.id, { x: node.x, y: node.y });
    });

    return new Promise<void>(resolve => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-in-out
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        currentNodes.forEach(node => {
          const start = startPositions.get(node.id);
          const end = positions.get(node.id);

          if (start && end) {
            const x = start.x + (end.x - start.x) * eased;
            const y = start.y + (end.y - start.y) * eased;
            nodes.updatePosition(node.id, x, y);
          }
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }
}
