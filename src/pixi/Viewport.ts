import * as PIXI from 'pixi.js';

/**
 * Viewport handles pan and zoom transformations for the canvas
 * Implements smooth camera controls with keyboard and mouse
 */
export class Viewport {
  container: PIXI.Container;
  x: number = 0;
  y: number = 0;
  scale: number = 1;

  private isPanning: boolean = false;
  private panStart: { x: number; y: number } = { x: 0, y: 0 };
  private spacePressed: boolean = false;

  constructor(private app: PIXI.Application) {
    this.container = new PIXI.Container();
    this.setupEvents();
  }

  /**
   * Set up all event listeners for pan, zoom, and keyboard controls
   */
  private setupEvents() {
    const canvas = this.app.view as HTMLCanvasElement;

    // Pan: spacebar + drag or middle mouse button
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1 || (e.button === 0 && this.spacePressed)) {
        this.isPanning = true;
        this.panStart = { x: e.clientX - this.x, y: e.clientY - this.y };
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        this.x = e.clientX - this.panStart.x;
        this.y = e.clientY - this.panStart.y;
        this.updateTransform();
      }
    });

    canvas.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        canvas.style.cursor = this.spacePressed ? 'grab' : 'default';
      }
    });

    // Prevent context menu on middle mouse button
    canvas.addEventListener('contextmenu', (e) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    });

    // Zoom: mousewheel
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(4, this.scale * delta));

      // Zoom toward cursor position
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const worldX = (mouseX - this.x) / this.scale;
      const worldY = (mouseY - this.y) / this.scale;

      this.scale = newScale;
      this.x = mouseX - worldX * this.scale;
      this.y = mouseY - worldY * this.scale;

      this.updateTransform();
    }, { passive: false });

    // Spacebar for pan cursor
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.isPanning) {
        this.spacePressed = true;
        canvas.style.cursor = 'grab';
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.spacePressed = false;
        if (!this.isPanning) {
          canvas.style.cursor = 'default';
        }
      }
    });
  }

  /**
   * Apply the current pan and zoom transform to the container
   */
  updateTransform() {
    this.container.position.set(this.x, this.y);
    this.container.scale.set(this.scale);
  }

  /**
   * Reset viewport to default position and zoom
   */
  reset() {
    this.x = 0;
    this.y = 0;
    this.scale = 1;
    this.updateTransform();
  }

  /**
   * Set zoom level programmatically
   */
  setZoom(newScale: number) {
    // Zoom toward center of screen
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const worldX = (centerX - this.x) / this.scale;
    const worldY = (centerY - this.y) / this.scale;

    this.scale = Math.max(0.1, Math.min(4, newScale));

    this.x = centerX - worldX * this.scale;
    this.y = centerY - worldY * this.scale;

    this.updateTransform();
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.x) / this.scale,
      y: (screenY - this.y) / this.scale,
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX * this.scale + this.x,
      y: worldY * this.scale + this.y,
    };
  }
}
