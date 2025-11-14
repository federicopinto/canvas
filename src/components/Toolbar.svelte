<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function handleZoomIn() {
    dispatch('zoom-in');
  }

  function handleZoomOut() {
    dispatch('zoom-out');
  }

  function handleZoomReset() {
    dispatch('zoom-reset');
  }

  function handleFitToScreen() {
    dispatch('fit-to-screen');
  }

  function handleClearCanvas() {
    if (confirm('Are you sure you want to clear all nodes?')) {
      dispatch('clear-canvas');
    }
  }
</script>

<div class="toolbar">
  <button class="toolbar-btn" on:click={handleZoomOut} title="Zoom out (Ctrl+-)">
    <span class="icon">−</span>
  </button>

  <button class="toolbar-btn" on:click={handleZoomReset} title="Reset zoom (Ctrl+0)">
    <span class="text">100%</span>
  </button>

  <button class="toolbar-btn" on:click={handleZoomIn} title="Zoom in (Ctrl++)">
    <span class="icon">+</span>
  </button>

  <div class="separator"></div>

  <button class="toolbar-btn" on:click={handleFitToScreen} title="Fit all nodes">
    <span class="icon">⛶</span>
  </button>

  <div class="separator"></div>

  <button class="toolbar-btn danger" on:click={handleClearCanvas} title="Clear canvas">
    <span class="icon">🗑</span>
  </button>
</div>

<style>
  .toolbar {
    position: fixed;
    top: 20px;
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

  .toolbar-btn {
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .toolbar-btn:hover {
    background: #F1F3F5;
  }

  .toolbar-btn:active {
    background: #E9ECEF;
  }

  .toolbar-btn.danger:hover {
    background: #FFE5E5;
    color: #C92A2A;
  }

  .icon {
    font-size: 18px;
    line-height: 1;
  }

  .text {
    font-size: 12px;
    font-weight: 600;
  }

  .separator {
    width: 1px;
    height: 24px;
    background: #DEE2E6;
    margin: 0 4px;
  }
</style>
