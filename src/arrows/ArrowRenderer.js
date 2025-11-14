import { SVGBuilder } from '../utils/SVGBuilder.js';
import { ArrowRouter } from './ArrowRouter.js';

/**
 * ArrowRenderer - Renders arrows with SVG paths and markers
 */
export class ArrowRenderer {
  constructor(state, eventBus) {
    this.state = state;
    this.eventBus = eventBus;
    this.container = null;
    this.arrowElements = new Map(); // arrowId -> SVG path element
    this.router = new ArrowRouter(state);
    this.markersInitialized = false;
  }

  /**
   * Initialize renderer with container
   */
  init(container, svg) {
    this.container = container;
    this.svg = svg;

    // Initialize SVG markers
    this.initializeMarkers(svg);

    // Subscribe to state changes
    this.state.subscribe((newState, oldState) => {
      this.handleStateChange(newState, oldState);
    });

    // Subscribe to node events for real-time updates
    this.eventBus.on('node:moved', () => {
      this.updateAllArrows();
    });

    this.eventBus.on('node:updated', () => {
      this.updateAllArrows();
    });
  }

  /**
   * Initialize SVG marker definitions
   */
  initializeMarkers(svg) {
    if (this.markersInitialized) return;

    const defs = SVGBuilder.create('defs');

    // Inheritance: hollow triangle
    const inheritanceMarker = SVGBuilder.create('marker', {
      id: 'arrow-inheritance',
      markerWidth: 12,
      markerHeight: 10,
      refX: 11,
      refY: 5,
      orient: 'auto',
      markerUnits: 'strokeWidth'
    });
    const inheritancePath = SVGBuilder.path({
      d: 'M 0,0 L 12,5 L 0,10 Z',
      fill: 'none',
      stroke: '#2C3E50',
      'stroke-width': 2,
      'stroke-linejoin': 'miter'
    });
    inheritanceMarker.appendChild(inheritancePath);
    defs.appendChild(inheritanceMarker);

    // Composition: filled diamond (tail) + arrow (head)
    const compositionTail = SVGBuilder.create('marker', {
      id: 'arrow-composition-tail',
      markerWidth: 10,
      markerHeight: 10,
      refX: 5,
      refY: 5,
      orient: 'auto',
      markerUnits: 'strokeWidth'
    });
    const compositionTailPath = SVGBuilder.path({
      d: 'M 0,5 L 5,0 L 10,5 L 5,10 Z',
      fill: '#34495E',
      stroke: '#34495E',
      'stroke-width': 1
    });
    compositionTail.appendChild(compositionTailPath);
    defs.appendChild(compositionTail);

    const compositionHead = SVGBuilder.create('marker', {
      id: 'arrow-composition-head',
      markerWidth: 10,
      markerHeight: 10,
      refX: 10,
      refY: 5,
      orient: 'auto',
      markerUnits: 'strokeWidth'
    });
    const compositionHeadPath = SVGBuilder.path({
      d: 'M 0,0 L 10,5 L 0,10 Z',
      fill: '#34495E',
      stroke: '#34495E'
    });
    compositionHead.appendChild(compositionHeadPath);
    defs.appendChild(compositionHead);

    // Aggregation: hollow diamond (tail) + arrow (head)
    const aggregationTail = SVGBuilder.create('marker', {
      id: 'arrow-aggregation-tail',
      markerWidth: 10,
      markerHeight: 10,
      refX: 5,
      refY: 5,
      orient: 'auto',
      markerUnits: 'strokeWidth'
    });
    const aggregationTailPath = SVGBuilder.path({
      d: 'M 0,5 L 5,0 L 10,5 L 5,10 Z',
      fill: 'white',
      stroke: '#7F8C8D',
      'stroke-width': 2
    });
    aggregationTail.appendChild(aggregationTailPath);
    defs.appendChild(aggregationTail);

    const aggregationHead = SVGBuilder.create('marker', {
      id: 'arrow-aggregation-head',
      markerWidth: 10,
      markerHeight: 10,
      refX: 10,
      refY: 5,
      orient: 'auto',
      markerUnits: 'strokeWidth'
    });
    const aggregationHeadPath = SVGBuilder.path({
      d: 'M 0,0 L 10,5 L 0,10 Z',
      fill: '#7F8C8D',
      stroke: '#7F8C8D'
    });
    aggregationHead.appendChild(aggregationHeadPath);
    defs.appendChild(aggregationHead);

    // Dependency: dashed line with arrow
    const dependencyMarker = SVGBuilder.create('marker', {
      id: 'arrow-dependency',
      markerWidth: 10,
      markerHeight: 10,
      refX: 10,
      refY: 5,
      orient: 'auto',
      markerUnits: 'strokeWidth'
    });
    const dependencyPath = SVGBuilder.path({
      d: 'M 0,0 L 10,5 L 0,10 Z',
      fill: '#95A5A6',
      stroke: '#95A5A6'
    });
    dependencyMarker.appendChild(dependencyPath);
    defs.appendChild(dependencyMarker);

    // Association: simple arrow
    const associationMarker = SVGBuilder.create('marker', {
      id: 'arrow-association',
      markerWidth: 10,
      markerHeight: 10,
      refX: 10,
      refY: 5,
      orient: 'auto',
      markerUnits: 'strokeWidth'
    });
    const associationPath = SVGBuilder.path({
      d: 'M 0,0 L 10,5 L 0,10 Z',
      fill: '#2C3E50',
      stroke: '#2C3E50'
    });
    associationMarker.appendChild(associationPath);
    defs.appendChild(associationMarker);

    svg.insertBefore(defs, svg.firstChild);
    this.markersInitialized = true;
  }

  /**
   * Get arrow style configuration
   */
  getArrowStyle(type) {
    const styles = {
      inheritance: {
        stroke: '#2C3E50',
        strokeWidth: 2,
        strokeDasharray: 'none',
        markerEnd: 'url(#arrow-inheritance)',
        markerStart: 'none'
      },
      composition: {
        stroke: '#34495E',
        strokeWidth: 2,
        strokeDasharray: 'none',
        markerEnd: 'url(#arrow-composition-head)',
        markerStart: 'url(#arrow-composition-tail)'
      },
      aggregation: {
        stroke: '#7F8C8D',
        strokeWidth: 2,
        strokeDasharray: 'none',
        markerEnd: 'url(#arrow-aggregation-head)',
        markerStart: 'url(#arrow-aggregation-tail)'
      },
      dependency: {
        stroke: '#95A5A6',
        strokeWidth: 2,
        strokeDasharray: '4,3',
        markerEnd: 'url(#arrow-dependency)',
        markerStart: 'none'
      },
      association: {
        stroke: '#2C3E50',
        strokeWidth: 2,
        strokeDasharray: 'none',
        markerEnd: 'url(#arrow-association)',
        markerStart: 'none'
      }
    };

    return styles[type] || styles.association;
  }

  /**
   * Handle state changes
   */
  handleStateChange(newState, oldState) {
    // Check for arrow changes
    if (newState.arrows !== oldState.arrows) {
      this.updateAllArrows();
    }
  }

  /**
   * Update all arrows
   */
  updateAllArrows() {
    const arrows = this.state.getState().arrows;

    // Remove arrows that no longer exist
    this.arrowElements.forEach((element, arrowId) => {
      if (!arrows.has(arrowId)) {
        element.remove();
        this.arrowElements.delete(arrowId);
      }
    });

    // Add or update arrows
    arrows.forEach((arrow, arrowId) => {
      if (this.arrowElements.has(arrowId)) {
        this.updateArrow(arrow);
      } else {
        this.renderArrow(arrow);
      }
    });
  }

  /**
   * Render a new arrow
   */
  renderArrow(arrow) {
    // Calculate route
    const route = this.router.route(arrow);
    if (!route) {
      console.warn(`[ArrowRenderer] Cannot route arrow ${arrow.id}: nodes not found`);
      return;
    }

    // Get style
    const style = this.getArrowStyle(arrow.type);

    // Create path element
    const path = SVGBuilder.path({
      d: route.path,
      class: 'arrow',
      'data-arrow-id': arrow.id,
      stroke: style.stroke,
      'stroke-width': style.strokeWidth,
      'stroke-dasharray': style.strokeDasharray,
      'marker-end': style.markerEnd,
      'marker-start': style.markerStart,
      fill: 'none'
    });

    // Store and append
    this.arrowElements.set(arrow.id, path);
    this.container.insertBefore(path, this.container.firstChild); // Add arrows below nodes

    return path;
  }

  /**
   * Update existing arrow
   */
  updateArrow(arrow) {
    const element = this.arrowElements.get(arrow.id);
    if (!element) return;

    // Recalculate route
    const route = this.router.route(arrow);
    if (!route) {
      console.warn(`[ArrowRenderer] Cannot route arrow ${arrow.id}: nodes not found`);
      return;
    }

    // Update path
    element.setAttribute('d', route.path);

    // Update style if type changed
    const style = this.getArrowStyle(arrow.type);
    element.setAttribute('stroke', style.stroke);
    element.setAttribute('stroke-width', style.strokeWidth);
    element.setAttribute('stroke-dasharray', style.strokeDasharray);
    element.setAttribute('marker-end', style.markerEnd);
    element.setAttribute('marker-start', style.markerStart);
  }

  /**
   * Remove an arrow
   */
  removeArrow(arrowId) {
    const element = this.arrowElements.get(arrowId);
    if (element) {
      element.remove();
      this.arrowElements.delete(arrowId);
    }
  }

  /**
   * Clear all arrows
   */
  clear() {
    this.arrowElements.forEach(element => element.remove());
    this.arrowElements.clear();
  }

  /**
   * Get arrow element by ID
   */
  getArrowElement(arrowId) {
    return this.arrowElements.get(arrowId);
  }
}
