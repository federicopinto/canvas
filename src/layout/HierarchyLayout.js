/**
 * HierarchyLayout - Automatic layout algorithm for hierarchical graphs
 * Uses a simplified Sugiyama-style layout
 */
export class HierarchyLayout {
  constructor() {
    this.horizontalGap = 120;
    this.verticalGap = 100;
  }

  /**
   * Layout nodes based on hierarchy
   */
  layout(nodes, arrows) {
    if (nodes.size === 0) {
      return [];
    }

    // Convert to arrays
    const nodeArray = Array.from(nodes.values());
    const arrowArray = Array.from(arrows.values());

    // Build graph structure
    const graph = this.buildGraph(nodeArray, arrowArray);

    // Assign layers (vertical positioning)
    const layers = this.assignLayers(nodeArray, graph);

    // Order nodes within layers (minimize crossings)
    this.orderLayers(layers, graph);

    // Calculate positions
    const positions = this.calculatePositions(layers);

    return positions;
  }

  /**
   * Build adjacency graph from arrows
   */
  buildGraph(nodes, arrows) {
    const graph = {
      outgoing: new Map(), // node -> [child nodes]
      incoming: new Map()  // node -> [parent nodes]
    };

    // Initialize
    nodes.forEach(node => {
      graph.outgoing.set(node.id, []);
      graph.incoming.set(node.id, []);
    });

    // Build edges
    arrows.forEach(arrow => {
      const from = arrow.fromNodeId;
      const to = arrow.toNodeId;

      if (graph.outgoing.has(from)) {
        graph.outgoing.get(from).push(to);
      }
      if (graph.incoming.has(to)) {
        graph.incoming.get(to).push(from);
      }
    });

    return graph;
  }

  /**
   * Assign nodes to layers using BFS
   */
  assignLayers(nodes, graph) {
    const layers = [];
    const layerMap = new Map(); // nodeId -> layer index
    const visited = new Set();

    // Find root nodes (no incoming edges or inheritance targets)
    const roots = nodes.filter(node => {
      const incoming = graph.incoming.get(node.id) || [];
      return incoming.length === 0;
    });

    // If no roots found, use all nodes as potential starting points
    const startNodes = roots.length > 0 ? roots : nodes;

    // BFS to assign layers
    const queue = startNodes.map(node => ({ node, layer: 0 }));

    while (queue.length > 0) {
      const { node, layer } = queue.shift();

      if (visited.has(node.id)) {
        // Update layer if this is a longer path
        const currentLayer = layerMap.get(node.id);
        if (layer > currentLayer) {
          // Move to deeper layer
          layers[currentLayer] = layers[currentLayer].filter(n => n.id !== node.id);
          layerMap.set(node.id, layer);

          if (!layers[layer]) {
            layers[layer] = [];
          }
          layers[layer].push(node);
        }
        continue;
      }

      visited.add(node.id);
      layerMap.set(node.id, layer);

      // Add to layer
      if (!layers[layer]) {
        layers[layer] = [];
      }
      layers[layer].push(node);

      // Add children to queue
      const children = graph.outgoing.get(node.id) || [];
      children.forEach(childId => {
        const childNode = nodes.find(n => n.id === childId);
        if (childNode) {
          queue.push({ node: childNode, layer: layer + 1 });
        }
      });
    }

    // Add any unvisited nodes to the first layer
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        if (!layers[0]) {
          layers[0] = [];
        }
        layers[0].push(node);
        layerMap.set(node.id, 0);
      }
    });

    return layers;
  }

  /**
   * Order nodes within layers to minimize crossings
   */
  orderLayers(layers, graph) {
    // Simple heuristic: sort by number of connections
    layers.forEach(layer => {
      layer.sort((a, b) => {
        const aConnections = (graph.incoming.get(a.id)?.length || 0) +
                            (graph.outgoing.get(a.id)?.length || 0);
        const bConnections = (graph.incoming.get(b.id)?.length || 0) +
                            (graph.outgoing.get(b.id)?.length || 0);
        return bConnections - aConnections;
      });
    });
  }

  /**
   * Calculate final positions for all nodes
   */
  calculatePositions(layers) {
    const positions = [];

    layers.forEach((layer, layerIndex) => {
      const y = layerIndex * this.verticalGap;

      // Calculate total width needed for this layer
      const totalWidth = layer.reduce((sum, node) => sum + node.width, 0);
      const totalGaps = (layer.length - 1) * this.horizontalGap;
      const layerWidth = totalWidth + totalGaps;

      // Center the layer
      let currentX = -layerWidth / 2;

      layer.forEach(node => {
        positions.push({
          id: node.id,
          x: currentX,
          y: y
        });

        currentX += node.width + this.horizontalGap;
      });
    });

    return positions;
  }

  /**
   * Set spacing parameters
   */
  setSpacing(horizontal, vertical) {
    this.horizontalGap = horizontal;
    this.verticalGap = vertical;
  }
}
