/**
 * PNGExporter - Export canvas to PNG image
 */
export class PNGExporter {
  constructor(canvas) {
    this.canvas = canvas;
  }

  /**
   * Export canvas to PNG
   */
  export() {
    console.log('[PNGExporter] Starting export...');

    try {
      // Clone SVG element
      const svg = this.canvas.svg.cloneNode(true);

      // Calculate bounds of all content
      const bounds = this.calculateBounds();

      if (!bounds) {
        console.warn('[PNGExporter] No content to export');
        return;
      }

      // Set viewBox to content bounds
      svg.setAttribute('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
      svg.setAttribute('width', bounds.width);
      svg.setAttribute('height', bounds.height);

      // Remove transform from main group (we're using viewBox instead)
      const mainGroup = svg.querySelector('.viewport-main');
      if (mainGroup) {
        mainGroup.removeAttribute('transform');
      }

      // Serialize SVG to string
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);

      // Add XML declaration and styling
      const svgBlob = new Blob(
        [
          '<?xml version="1.0" encoding="UTF-8"?>',
          svgString
        ],
        { type: 'image/svg+xml;charset=utf-8' }
      );

      // Create object URL
      const url = URL.createObjectURL(svgBlob);

      // Load SVG into image
      const img = new Image();
      img.onload = () => {
        // Create canvas for rasterization
        const canvas = document.createElement('canvas');
        const scale = 2; // 2x for high DPI
        canvas.width = bounds.width * scale;
        canvas.height = bounds.height * scale;

        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);

        // Fill white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, bounds.width, bounds.height);

        // Draw SVG
        ctx.drawImage(img, 0, 0);

        // Convert to blob and download
        canvas.toBlob(blob => {
          this.downloadBlob(blob, 'class-diagram.png');
          URL.revokeObjectURL(url);
          console.log('[PNGExporter] Export complete');
        }, 'image/png', 0.95);
      };

      img.onerror = (error) => {
        console.error('[PNGExporter] Error loading SVG:', error);
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error('[PNGExporter] Export failed:', error);
    }
  }

  /**
   * Calculate bounds of all nodes and arrows
   */
  calculateBounds() {
    const nodes = this.canvas.state.getState().nodes;

    if (nodes.size === 0) {
      return null;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Calculate bounds from nodes
    nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });

    // Add padding
    const padding = 40;

    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2
    };
  }

  /**
   * Download blob as file
   */
  downloadBlob(blob, filename) {
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Export as SVG (alternative export method)
   */
  exportSVG() {
    console.log('[PNGExporter] Starting SVG export...');

    try {
      const svg = this.canvas.svg.cloneNode(true);
      const bounds = this.calculateBounds();

      if (!bounds) {
        console.warn('[PNGExporter] No content to export');
        return;
      }

      svg.setAttribute('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
      svg.setAttribute('width', bounds.width);
      svg.setAttribute('height', bounds.height);

      const mainGroup = svg.querySelector('.viewport-main');
      if (mainGroup) {
        mainGroup.removeAttribute('transform');
      }

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);

      const blob = new Blob(
        [
          '<?xml version="1.0" encoding="UTF-8"?>',
          svgString
        ],
        { type: 'image/svg+xml;charset=utf-8' }
      );

      this.downloadBlob(blob, 'class-diagram.svg');
      console.log('[PNGExporter] SVG export complete');
    } catch (error) {
      console.error('[PNGExporter] SVG export failed:', error);
    }
  }
}
