/**
 * ZoomControl - Display current zoom level
 */
export class ZoomControl {
  constructor(canvas) {
    this.canvas = canvas;
    this.element = null;
  }

  /**
   * Initialize zoom control
   */
  init() {
    this.element = this.create();
    document.body.appendChild(this.element);

    // Subscribe to viewport changes
    this.canvas.eventBus.on('viewport:changed', () => {
      this.update();
    });

    // Initial update
    this.update();

    return this.element;
  }

  /**
   * Create zoom control element
   */
  create() {
    const div = document.createElement('div');
    div.className = 'zoom-control';
    div.textContent = '100%';

    // Make it clickable to reset zoom
    div.title = 'Click to reset zoom';
    div.style.cursor = 'pointer';
    div.addEventListener('click', () => {
      this.canvas.zoomTo(1.0);
    });

    return div;
  }

  /**
   * Update zoom display
   */
  update() {
    if (!this.element) return;

    const zoom = this.canvas.state.getState().viewport.zoom;
    this.element.textContent = `${Math.round(zoom * 100)}%`;

    // Add visual feedback for non-100% zoom
    if (Math.abs(zoom - 1.0) < 0.01) {
      this.element.classList.remove('zoom-active');
    } else {
      this.element.classList.add('zoom-active');
    }
  }

  /**
   * Show zoom control
   */
  show() {
    if (this.element) {
      this.element.style.display = 'block';
    }
  }

  /**
   * Hide zoom control
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  /**
   * Destroy zoom control
   */
  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
