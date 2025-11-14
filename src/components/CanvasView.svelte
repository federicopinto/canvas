<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PixiCanvas } from '../pixi/PixiCanvas';
  import { ECOMMERCE_DEMO_NODES } from '../demo/sampleNodes';
  import { ECOMMERCE_DEMO_ARROWS } from '../demo/sampleArrows';
  import Toolbar from './Toolbar.svelte';
  import ZoomIndicator from './ZoomIndicator.svelte';

  let container: HTMLDivElement;
  let pixiCanvas: PixiCanvas | null = null;
  let currentZoom: number = 1.0;

  onMount(() => {
    if (container) {
      pixiCanvas = new PixiCanvas(container);

      // Load demo nodes
      ECOMMERCE_DEMO_NODES.forEach(nodeData => {
        const node = pixiCanvas?.addNode(nodeData);
        if (node && pixiCanvas) {
          pixiCanvas.updateNodePosition(
            nodeData.id,
            nodeData.x,
            nodeData.y,
            nodeData.width,
            nodeData.height
          );
        }
      });

      // Load demo arrows
      ECOMMERCE_DEMO_ARROWS.forEach(arrowData => {
        pixiCanvas?.addArrow(arrowData);
      });

      // Set up zoom tracking
      updateZoom();
      setInterval(updateZoom, 100);

      // Keyboard shortcuts
      window.addEventListener('keydown', handleKeyDown);
    }
  });

  onDestroy(() => {
    if (pixiCanvas) {
      pixiCanvas.destroy();
      pixiCanvas = null;
    }
    window.removeEventListener('keydown', handleKeyDown);
  });

  function updateZoom() {
    if (pixiCanvas) {
      currentZoom = pixiCanvas.viewport.scale;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    // Ctrl/Cmd + 0: Reset zoom
    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
      e.preventDefault();
      handleZoomReset();
    }
    // Ctrl/Cmd + +: Zoom in
    else if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
      e.preventDefault();
      handleZoomIn();
    }
    // Ctrl/Cmd + -: Zoom out
    else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault();
      handleZoomOut();
    }
  }

  function handleZoomIn() {
    if (pixiCanvas) {
      const newScale = Math.min(4, pixiCanvas.viewport.scale * 1.2);
      pixiCanvas.viewport.setZoom(newScale);
      updateZoom();
    }
  }

  function handleZoomOut() {
    if (pixiCanvas) {
      const newScale = Math.max(0.1, pixiCanvas.viewport.scale * 0.8);
      pixiCanvas.viewport.setZoom(newScale);
      updateZoom();
    }
  }

  function handleZoomReset() {
    if (pixiCanvas) {
      pixiCanvas.viewport.setZoom(1.0);
      pixiCanvas.viewport.x = 0;
      pixiCanvas.viewport.y = 0;
      pixiCanvas.viewport.updateTransform();
      updateZoom();
    }
  }

  function handleFitToScreen() {
    // TODO: Calculate bounds and fit all nodes
    handleZoomReset();
  }

  function handleClearCanvas() {
    if (pixiCanvas) {
      pixiCanvas.nodeLayer.clear();
      pixiCanvas.arrowLayer.clear();
    }
  }
</script>

<div bind:this={container} class="canvas-container"></div>

<Toolbar
  on:zoom-in={handleZoomIn}
  on:zoom-out={handleZoomOut}
  on:zoom-reset={handleZoomReset}
  on:fit-to-screen={handleFitToScreen}
  on:clear-canvas={handleClearCanvas}
/>

<ZoomIndicator zoom={currentZoom} />

<style>
  .canvas-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
</style>
