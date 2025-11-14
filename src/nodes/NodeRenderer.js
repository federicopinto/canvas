import { SVGBuilder } from '../utils/SVGBuilder.js';
import { getNodeType } from './NodeTypes.js';

/**
 * NodeRenderer - Renders nodes as SVG elements
 */
export class NodeRenderer {
  constructor(state, eventBus) {
    this.state = state;
    this.eventBus = eventBus;
    this.container = null;
    this.nodeElements = new Map(); // nodeId -> SVG group element
  }

  /**
   * Initialize renderer with container
   */
  init(container) {
    this.container = container;

    // Subscribe to state changes
    this.state.subscribe((newState, oldState) => {
      this.handleStateChange(newState, oldState);
    });
  }

  /**
   * Handle state changes
   */
  handleStateChange(newState, oldState) {
    // Check for node changes
    if (newState.nodes !== oldState.nodes) {
      this.updateNodes();
    }

    // Check for selection changes
    if (newState.selection !== oldState.selection) {
      this.updateSelection();
    }
  }

  /**
   * Update all nodes
   */
  updateNodes() {
    const nodes = this.state.getState().nodes;

    // Remove nodes that no longer exist
    this.nodeElements.forEach((element, nodeId) => {
      if (!nodes.has(nodeId)) {
        element.remove();
        this.nodeElements.delete(nodeId);
      }
    });

    // Add or update nodes
    nodes.forEach((node, nodeId) => {
      if (this.nodeElements.has(nodeId)) {
        this.updateNode(node);
      } else {
        this.renderNode(node);
      }
    });
  }

  /**
   * Render a node
   */
  renderNode(node) {
    const nodeGroup = SVGBuilder.g({
      class: 'node',
      'data-node-id': node.id
    });

    // Apply transform for positioning
    SVGBuilder.setTransform(nodeGroup, { x: node.x, y: node.y });

    // Get node type configuration
    const config = getNodeType(node.type);

    // Create node structure
    const headerHeight = 40;
    let currentY = 0;

    // Header
    const header = this.renderHeader(node, config, headerHeight);
    nodeGroup.appendChild(header);
    currentY += headerHeight;

    // Sections
    node.sections.forEach(section => {
      const sectionEl = this.renderSection(section, config, node.width);
      SVGBuilder.setTransform(sectionEl, { x: 0, y: currentY });
      nodeGroup.appendChild(sectionEl);
      currentY += section.getHeight();
    });

    // Outer border (drawn last to be on top)
    const border = SVGBuilder.rect({
      x: 0,
      y: 0,
      width: node.width,
      height: node.height,
      fill: 'none',
      stroke: config.headerBorder,
      'stroke-width': config.borderWidth,
      'stroke-dasharray': config.borderStyle === 'dashed' ? '5,5' : 'none',
      'pointer-events': 'none'
    });
    nodeGroup.appendChild(border);

    // Store element reference
    this.nodeElements.set(node.id, nodeGroup);
    this.container.appendChild(nodeGroup);

    return nodeGroup;
  }

  /**
   * Render node header
   */
  renderHeader(node, config, height) {
    const headerGroup = SVGBuilder.g({ class: 'node-header' });

    // Background
    const bg = SVGBuilder.rect({
      x: 0,
      y: 0,
      width: node.width,
      height: height,
      fill: config.headerBg,
      stroke: 'none'
    });
    headerGroup.appendChild(bg);

    // Badge (if exists)
    if (config.badge) {
      const badge = SVGBuilder.text(
        {
          x: node.width / 2,
          y: 14,
          'text-anchor': 'middle',
          'font-size': 10,
          'font-style': 'italic',
          fill: '#666666',
          class: 'node-badge'
        },
        config.badge
      );
      headerGroup.appendChild(badge);
    }

    // Class name
    const className = SVGBuilder.text(
      {
        x: node.width / 2,
        y: config.badge ? 30 : 25,
        'text-anchor': 'middle',
        'font-size': 14,
        'font-weight': 'bold',
        fill: config.textColor,
        class: 'node-class-name'
      },
      node.className
    );
    headerGroup.appendChild(className);

    return headerGroup;
  }

  /**
   * Render a section
   */
  renderSection(section, config, width) {
    const sectionGroup = SVGBuilder.g({ class: 'node-section' });

    // Background
    const bg = SVGBuilder.rect({
      x: 0,
      y: 0,
      width: width,
      height: section.getHeight(),
      fill: config.bodyBg,
      stroke: 'none'
    });
    sectionGroup.appendChild(bg);

    let currentY = 8;

    // Title (if exists)
    if (section.title) {
      const title = SVGBuilder.text(
        {
          x: 8,
          y: currentY + 12,
          'font-size': 11,
          'font-weight': 'bold',
          fill: config.textColor,
          class: 'section-title'
        },
        section.title
      );
      sectionGroup.appendChild(title);
      currentY += 20;

      // Divider line
      const divider = SVGBuilder.line({
        x1: 4,
        y1: currentY,
        x2: width - 4,
        y2: currentY,
        stroke: config.headerBorder,
        'stroke-width': 0.5
      });
      sectionGroup.appendChild(divider);
      currentY += 4;
    }

    // Items
    if (!section.collapsed) {
      section.items.forEach(item => {
        const itemText = SVGBuilder.text(
          {
            x: 12,
            y: currentY + 12,
            'font-size': 11,
            'font-family': 'Monaco, Consolas, monospace',
            fill: config.textColor,
            class: 'section-item'
          },
          item
        );
        sectionGroup.appendChild(itemText);
        currentY += 20;
      });
    }

    return sectionGroup;
  }

  /**
   * Update existing node
   */
  updateNode(node) {
    const element = this.nodeElements.get(node.id);
    if (!element) return;

    // Update transform
    SVGBuilder.setTransform(element, { x: node.x, y: node.y });

    // For now, just update position
    // Full re-render would be needed for content changes
  }

  /**
   * Update selection styling
   */
  updateSelection() {
    const selection = this.state.getState().selection;

    this.nodeElements.forEach((element, nodeId) => {
      if (selection.has(nodeId)) {
        element.classList.add('selected');
      } else {
        element.classList.remove('selected');
      }
    });
  }

  /**
   * Remove a node
   */
  removeNode(nodeId) {
    const element = this.nodeElements.get(nodeId);
    if (element) {
      element.remove();
      this.nodeElements.delete(nodeId);
    }
  }

  /**
   * Clear all nodes
   */
  clear() {
    this.nodeElements.forEach(element => element.remove());
    this.nodeElements.clear();
  }

  /**
   * Get node element by ID
   */
  getNodeElement(nodeId) {
    return this.nodeElements.get(nodeId);
  }

  /**
   * Find node at position
   */
  findNodeAt(x, y) {
    const nodes = Array.from(this.state.getState().nodes.values());

    // Check in reverse order (top nodes first)
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].contains(x, y)) {
        return nodes[i];
      }
    }

    return null;
  }
}
