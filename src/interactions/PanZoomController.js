/**
 * PanZoomController - Handles pan and zoom interactions
 */
export class PanZoomController {
  constructor(viewport, container, state, eventBus) {
    this.viewport = viewport;
    this.container = container;
    this.state = state;
    this.eventBus = eventBus;

    this.isPanning = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.spacePressed = false;

    this.enabled = true;
  }

  /**
   * Enable the controller
   */
  enable() {
    this.enabled = true;

    // Mouse wheel for zoom
    this.container.addEventListener('wheel', this.handleWheel);

    // Middle mouse button for pan
    this.container.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);

    // Spacebar for pan mode
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);

    // Prevent context menu on right click
    this.container.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * Disable the controller
   */
  disable() {
    this.enabled = false;

    this.container.removeEventListener('wheel', this.handleWheel);
    this.container.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  /**
   * Handle mouse wheel for zoom
   */
  handleWheel = (e) => {
    if (!this.enabled) return;

    e.preventDefault();

    // Get cursor position relative to container
    const rect = this.container.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    // Zoom toward cursor
    const delta = -e.deltaY;
    this.viewport.zoom(delta, cursorX, cursorY);
  };

  /**
   * Handle mouse down
   */
  handleMouseDown = (e) => {
    if (!this.enabled) return;

    // Middle mouse button or left mouse + spacebar
    if (e.button === 1 || (e.button === 0 && this.spacePressed)) {
      e.preventDefault();
      this.startPan(e.clientX, e.clientY);
    }
  };

  /**
   * Handle mouse move
   */
  handleMouseMove = (e) => {
    if (!this.enabled || !this.isPanning) return;

    const dx = e.clientX - this.lastMousePos.x;
    const dy = e.clientY - this.lastMousePos.y;

    this.viewport.pan(dx, dy);

    this.lastMousePos = { x: e.clientX, y: e.clientY };
  };

  /**
   * Handle mouse up
   */
  handleMouseUp = (e) => {
    if (!this.enabled) return;

    if (e.button === 1 || (e.button === 0 && this.isPanning)) {
      this.stopPan();
    }
  };

  /**
   * Handle key down
   */
  handleKeyDown = (e) => {
    if (!this.enabled) return;

    // Spacebar for pan mode
    if (e.code === 'Space' && !this.spacePressed) {
      this.spacePressed = true;
      this.container.style.cursor = 'grab';
      e.preventDefault();
    }
  };

  /**
   * Handle key up
   */
  handleKeyUp = (e) => {
    if (!this.enabled) return;

    if (e.code === 'Space') {
      this.spacePressed = false;
      if (!this.isPanning) {
        this.container.style.cursor = 'default';
      }
    }
  };

  /**
   * Start panning
   */
  startPan(x, y) {
    this.isPanning = true;
    this.lastMousePos = { x, y };
    this.container.style.cursor = 'grabbing';

    this.state.setUI({ isPanning: true });
    this.eventBus.emit('pan:start');
  }

  /**
   * Stop panning
   */
  stopPan() {
    this.isPanning = false;
    this.container.style.cursor = this.spacePressed ? 'grab' : 'default';

    this.state.setUI({ isPanning: false });
    this.eventBus.emit('pan:end');
  }

  /**
   * Zoom to level
   */
  zoomTo(level, centerX, centerY) {
    const rect = this.container.getBoundingClientRect();
    const cx = centerX !== undefined ? centerX : rect.width / 2;
    const cy = centerY !== undefined ? centerY : rect.height / 2;

    this.viewport.setZoom(level, cx, cy);
  }

  /**
   * Zoom in
   */
  zoomIn() {
    const viewport = this.viewport.getViewport();
    this.zoomTo(viewport.zoom * 1.2);
  }

  /**
   * Zoom out
   */
  zoomOut() {
    const viewport = this.viewport.getViewport();
    this.zoomTo(viewport.zoom * 0.8);
  }

  /**
   * Reset zoom
   */
  resetZoom() {
    this.zoomTo(1);
  }

  /**
   * Fit to content
   */
  fitToContent(padding = 50) {
    this.viewport.fitToNodes(padding);
  }
}
