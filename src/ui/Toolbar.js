/**
 * Toolbar - Floating toolbar with canvas controls
 */
export class Toolbar {
  constructor(canvas) {
    this.canvas = canvas;
    this.element = null;
    this.buttons = [];
  }

  /**
   * Initialize toolbar
   */
  init() {
    this.element = this.create();
    document.body.appendChild(this.element);
    return this.element;
  }

  /**
   * Create toolbar element
   */
  create() {
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';

    const buttons = [
      {
        icon: '⚡',
        text: null,
        tooltip: 'Auto Arrange (Coming Soon)',
        action: () => this.handleAutoLayout(),
        className: 'toolbar-button'
      },
      {
        type: 'separator'
      },
      {
        icon: '−',
        text: null,
        tooltip: 'Zoom Out',
        action: () => this.handleZoomOut(),
        className: 'toolbar-button'
      },
      {
        icon: null,
        text: '100%',
        tooltip: 'Reset Zoom',
        action: () => this.handleResetZoom(),
        className: 'toolbar-button zoom-display',
        id: 'zoom-display-btn'
      },
      {
        icon: '+',
        text: null,
        tooltip: 'Zoom In',
        action: () => this.handleZoomIn(),
        className: 'toolbar-button'
      },
      {
        icon: '⛶',
        text: null,
        tooltip: 'Fit to Screen',
        action: () => this.handleFitToScreen(),
        className: 'toolbar-button'
      },
      {
        type: 'separator'
      },
      {
        icon: '📥',
        text: null,
        tooltip: 'Export PNG (Coming Soon)',
        action: () => this.handleExportPNG(),
        className: 'toolbar-button'
      },
      {
        icon: '🗑',
        text: null,
        tooltip: 'Clear Canvas',
        action: () => this.handleClear(),
        className: 'toolbar-button toolbar-button-danger'
      }
    ];

    buttons.forEach(btn => {
      if (btn.type === 'separator') {
        const separator = document.createElement('div');
        separator.className = 'toolbar-separator';
        toolbar.appendChild(separator);
      } else {
        const button = document.createElement('button');
        button.className = btn.className;
        button.textContent = btn.icon || btn.text;
        button.title = btn.tooltip;

        if (btn.id) {
          button.id = btn.id;
        }

        button.addEventListener('click', btn.action);
        toolbar.appendChild(button);

        this.buttons.push({ element: button, config: btn });
      }
    });

    // Subscribe to viewport changes to update zoom display
    this.canvas.eventBus.on('viewport:changed', () => {
      this.updateZoomDisplay();
    });

    return toolbar;
  }

  /**
   * Handle auto layout
   */
  handleAutoLayout() {
    if (this.canvas.autoLayout) {
      this.canvas.autoLayout.trigger();
    } else {
      console.log('[Toolbar] Auto-layout coming soon!');
    }
  }

  /**
   * Handle zoom in
   */
  handleZoomIn() {
    const currentZoom = this.canvas.state.getState().viewport.zoom;
    this.canvas.zoomTo(currentZoom * 1.2);
  }

  /**
   * Handle zoom out
   */
  handleZoomOut() {
    const currentZoom = this.canvas.state.getState().viewport.zoom;
    this.canvas.zoomTo(currentZoom / 1.2);
  }

  /**
   * Handle reset zoom
   */
  handleResetZoom() {
    this.canvas.zoomTo(1.0);
  }

  /**
   * Handle fit to screen
   */
  handleFitToScreen() {
    this.canvas.fitToContent(100);
  }

  /**
   * Handle export PNG
   */
  handleExportPNG() {
    if (this.canvas.pngExporter) {
      this.canvas.pngExporter.export();
    } else {
      console.log('[Toolbar] PNG export coming soon!');
    }
  }

  /**
   * Handle clear canvas
   */
  handleClear() {
    if (confirm('Are you sure you want to clear the entire canvas?')) {
      this.canvas.clear();
    }
  }

  /**
   * Update zoom display
   */
  updateZoomDisplay() {
    const zoom = this.canvas.state.getState().viewport.zoom;
    const displayBtn = document.getElementById('zoom-display-btn');
    if (displayBtn) {
      displayBtn.textContent = `${Math.round(zoom * 100)}%`;
    }
  }

  /**
   * Show toolbar
   */
  show() {
    if (this.element) {
      this.element.style.display = 'flex';
    }
  }

  /**
   * Hide toolbar
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  /**
   * Destroy toolbar
   */
  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    this.buttons = [];
  }
}
