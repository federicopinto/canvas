/**
 * SVGBuilder - Utility for creating SVG elements with clean API
 */
export class SVGBuilder {
  static create(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        el.setAttribute(key, value);
      }
    });
    return el;
  }

  static g(attrs = {}) {
    return this.create('g', attrs);
  }

  static rect(attrs = {}) {
    return this.create('rect', attrs);
  }

  static text(attrs = {}, content = '') {
    const el = this.create('text', attrs);
    el.textContent = content;
    return el;
  }

  static line(attrs = {}) {
    return this.create('line', attrs);
  }

  static path(attrs = {}) {
    return this.create('path', attrs);
  }

  static circle(attrs = {}) {
    return this.create('circle', attrs);
  }

  static pattern(attrs = {}) {
    return this.create('pattern', attrs);
  }

  static defs(attrs = {}) {
    return this.create('defs', attrs);
  }

  static marker(attrs = {}) {
    return this.create('marker', attrs);
  }

  static polygon(attrs = {}) {
    return this.create('polygon', attrs);
  }

  static svg(attrs = {}) {
    return this.create('svg', attrs);
  }

  /**
   * Set multiple attributes on an element
   */
  static setAttrs(el, attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        el.setAttribute(key, value);
      }
    });
    return el;
  }

  /**
   * Set transform attribute
   */
  static setTransform(el, { x = 0, y = 0, scale = 1 } = {}) {
    el.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);
    return el;
  }

  /**
   * Append multiple children to an element
   */
  static append(parent, ...children) {
    children.forEach(child => {
      if (child) parent.appendChild(child);
    });
    return parent;
  }
}
