<script lang="ts">
  import { viewport } from '../stores/viewport';
  import { nodes } from '../stores/nodes';
  import { arrows } from '../stores/arrows';
  import { selection } from '../stores/selection';
  import Grid from './Grid.svelte';
  import ClassNode from './ClassNode.svelte';
  import Arrow from './Arrow.svelte';
  import Toolbar from './Toolbar.svelte';
  import { onMount } from 'svelte';

  let isPanning = false;
  let panStart = { x: 0, y: 0 };
  let viewportStart = { x: 0, y: 0 };
  let isSpacePressed = false;
  let canvasElement: SVGSVGElement;
  let animationFrame: number | null = null;
  let velocity = { x: 0, y: 0 };
  let lastPanPosition = { x: 0, y: 0 };
  let lastPanTime = 0;

  // Smooth easing animation
  function smoothPan() {
    const friction = 0.85;
    const threshold = 0.1;

    if (Math.abs(velocity.x) > threshold || Math.abs(velocity.y) > threshold) {
      viewport.pan(velocity.x, velocity.y);
      velocity.x *= friction;
      velocity.y *= friction;
      animationFrame = requestAnimationFrame(smoothPan);
    } else {
      velocity = { x: 0, y: 0 };
      animationFrame = null;
    }
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();

    const rect = canvasElement.getBoundingClientRect();
    const centerX = e.clientX - rect.left;
    const centerY = e.clientY - rect.top;

    // Normalize wheel delta across browsers
    const delta = -e.deltaY / 1000;

    viewport.zoom(delta, centerX, centerY);
  }

  function handleMouseDown(e: MouseEvent) {
    // Middle mouse button (button 1) or spacebar + left mouse (button 0)
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      e.preventDefault();
      isPanning = true;
      panStart = { x: e.clientX, y: e.clientY };
      lastPanPosition = { x: e.clientX, y: e.clientY };
      lastPanTime = Date.now();
      viewportStart = { x: $viewport.x, y: $viewport.y };

      // Cancel any ongoing smooth pan animation
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      velocity = { x: 0, y: 0 };

      if (e.button === 1) {
        canvasElement.style.cursor = 'grabbing';
      }
    } else if (e.button === 0 && !isSpacePressed) {
      // Left click on canvas background - clear selection
      selection.clear();
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (isPanning) {
      const currentTime = Date.now();
      const deltaTime = Math.max(currentTime - lastPanTime, 1);

      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;

      viewport.pan(
        viewportStart.x + deltaX - $viewport.x,
        viewportStart.y + deltaY - $viewport.y
      );

      // Calculate velocity for smooth easing
      velocity.x = (e.clientX - lastPanPosition.x) / deltaTime * 16;
      velocity.y = (e.clientY - lastPanPosition.y) / deltaTime * 16;

      lastPanPosition = { x: e.clientX, y: e.clientY };
      lastPanTime = currentTime;
    } else if (isSpacePressed) {
      canvasElement.style.cursor = 'grab';
    }
  }

  function handleMouseUp(e: MouseEvent) {
    if (isPanning) {
      isPanning = false;

      // Start smooth easing animation on release
      if (Math.abs(velocity.x) > 0.5 || Math.abs(velocity.y) > 0.5) {
        animationFrame = requestAnimationFrame(smoothPan);
      }

      if (!isSpacePressed) {
        canvasElement.style.cursor = 'default';
      } else {
        canvasElement.style.cursor = 'grab';
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.code === 'Space' && !isSpacePressed) {
      e.preventDefault();
      isSpacePressed = true;
      if (!isPanning) {
        canvasElement.style.cursor = 'grab';
      }
    }

    // Ctrl/Cmd + 0: Reset zoom
    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
      e.preventDefault();
      viewport.reset();
    }

    // Ctrl/Cmd + =: Zoom in
    if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
      e.preventDefault();
      viewport.zoom(0.1, window.innerWidth / 2, window.innerHeight / 2);
    }

    // Ctrl/Cmd + -: Zoom out
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault();
      viewport.zoom(-0.1, window.innerWidth / 2, window.innerHeight / 2);
    }

    // Delete: Delete selected nodes
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if ($selection.size > 0) {
        e.preventDefault();
        $selection.forEach(id => nodes.remove(id));
        selection.clear();
      }
    }

    // Escape: Clear selection
    if (e.key === 'Escape') {
      selection.clear();
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    if (e.code === 'Space') {
      isSpacePressed = false;
      if (!isPanning) {
        canvasElement.style.cursor = 'default';
      }
    }
  }

  onMount(() => {
    // Prevent context menu on middle click
    canvasElement.addEventListener('contextmenu', (e) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    });

    // Add global mouse up listener to handle mouse release outside canvas
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });
</script>

<Toolbar />

<div class="canvas-container">
  <svg
    bind:this={canvasElement}
    class="canvas"
    class:panning={isPanning}
    on:wheel={handleWheel}
    on:mousedown={handleMouseDown}
  >
    <defs>
      <Grid />
    </defs>

    <g
      style="transform: translate3d({$viewport.x}px, {$viewport.y}px, 0) scale({$viewport.scale}); transform-origin: 0 0;"
    >
      <rect
        x={-100000}
        y={-100000}
        width={200000}
        height={200000}
        fill="url(#grid-pattern)"
        pointer-events="none"
      />

      <!-- Render arrows (below nodes) -->
      {#each $arrows as arrow (arrow.id)}
        <Arrow {arrow} />
      {/each}

      <!-- Render nodes -->
      {#each $nodes as node (node.id)}
        <ClassNode {node} />
      {/each}
    </g>
  </svg>

  <div class="zoom-indicator">
    {Math.round($viewport.scale * 100)}%
  </div>
</div>

<style>
  .canvas-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #FAFBFC;
    position: relative;
  }

  .canvas {
    width: 100%;
    height: 100%;
    cursor: default;
    display: block;
  }

  .canvas.panning {
    cursor: grabbing !important;
  }

  .zoom-indicator {
    position: fixed;
    bottom: 16px;
    right: 16px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 6px;
    font-size: 12px;
    color: #6A737D;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    pointer-events: none;
    user-select: none;
  }
</style>
