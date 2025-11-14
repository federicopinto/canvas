<script lang="ts">
  import { viewport } from '../stores/viewport';
  import { nodes } from '../stores/nodes';
  import { LayoutEngine } from '../core/graph/LayoutEngine';

  const layoutEngine = new LayoutEngine();

  function handleZoomIn() {
    viewport.zoom(0.1, window.innerWidth / 2, window.innerHeight / 2);
  }

  function handleZoomOut() {
    viewport.zoom(-0.1, window.innerWidth / 2, window.innerHeight / 2);
  }

  function handleZoomReset() {
    viewport.reset();
  }

  function handleFitToScreen() {
    // Calculate bounding box of all nodes
    const allNodes = $nodes;
    if (allNodes.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    allNodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + 250); // Approximate height
    });

    const width = maxX - minX;
    const height = maxY - minY;
    const padding = 40;

    // Calculate scale to fit
    const scaleX = (window.innerWidth - padding * 2) / width;
    const scaleY = (window.innerHeight - padding * 2) / height;
    const scale = Math.min(scaleX, scaleY, 1);

    // Center the diagram
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const targetX = window.innerWidth / 2 - centerX * scale;
    const targetY = window.innerHeight / 2 - centerY * scale;

    viewport.set({ x: targetX, y: targetY, scale });
  }

  async function handleAutoArrange() {
    await layoutEngine.arrange($nodes);
  }

  async function handleExportPNG() {
    // Simple export: capture SVG as PNG
    const canvas = document.querySelector('.canvas') as SVGElement;
    if (!canvas) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(canvas);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = 'diagram.svg';
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  }

  function handleClearCanvas() {
    if (confirm('Delete all nodes? This cannot be undone.')) {
      nodes.set([]);
    }
  }

  $: zoomPercentage = Math.round($viewport.scale * 100);
</script>

<div class="toolbar">
  <div class="button-group">
    <button
      class="toolbar-button"
      title="Auto arrange layout"
      on:click={handleAutoArrange}
      disabled={$nodes.length === 0}
    >
      <span class="icon">⚡</span>
    </button>
  </div>

  <div class="separator"></div>

  <div class="button-group">
    <button
      class="toolbar-button"
      title="Zoom out (Ctrl+-)"
      on:click={handleZoomOut}
      disabled={$viewport.scale <= 0.1}
    >
      <span class="icon">−</span>
    </button>

    <button
      class="toolbar-button zoom-reset"
      title="Reset zoom (Ctrl+0)"
      on:click={handleZoomReset}
    >
      <span class="zoom-text">{zoomPercentage}%</span>
    </button>

    <button
      class="toolbar-button"
      title="Zoom in (Ctrl++)"
      on:click={handleZoomIn}
      disabled={$viewport.scale >= 4}
    >
      <span class="icon">+</span>
    </button>
  </div>

  <div class="separator"></div>

  <div class="button-group">
    <button
      class="toolbar-button"
      title="Fit all nodes in view"
      on:click={handleFitToScreen}
      disabled={$nodes.length === 0}
    >
      <span class="icon">⛶</span>
    </button>
  </div>

  <div class="separator"></div>

  <div class="button-group">
    <button
      class="toolbar-button"
      title="Export as SVG"
      on:click={handleExportPNG}
      disabled={$nodes.length === 0}
    >
      <span class="icon">📥</span>
    </button>

    <button
      class="toolbar-button"
      title="Clear canvas"
      on:click={handleClearCanvas}
      disabled={$nodes.length === 0}
    >
      <span class="icon">🗑</span>
    </button>
  </div>
</div>

<style>
  .toolbar {
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;

    display: flex;
    align-items: center;
    gap: 4px;

    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    padding: 8px 12px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  }

  .button-group {
    display: flex;
    gap: 4px;
  }

  .separator {
    width: 1px;
    height: 24px;
    background: #DEE2E6;
    margin: 0 4px;
  }

  .toolbar-button {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 150ms ease;
    color: #495057;
    font-size: 18px;
    position: relative;
    overflow: hidden;
  }

  .toolbar-button:hover:not(:disabled) {
    background: #F1F3F5;
  }

  .toolbar-button:active:not(:disabled) {
    background: #E9ECEF;
  }

  .toolbar-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .toolbar-button .icon {
    user-select: none;
    pointer-events: none;
  }

  .zoom-reset {
    min-width: 60px;
  }

  .zoom-text {
    font-size: 12px;
    font-weight: 600;
    font-family: -apple-system, 'Segoe UI', sans-serif;
    user-select: none;
    pointer-events: none;
  }

  /* Ripple effect */
  .toolbar-button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.1);
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s;
  }

  .toolbar-button:active:not(:disabled)::before {
    width: 36px;
    height: 36px;
  }
</style>
