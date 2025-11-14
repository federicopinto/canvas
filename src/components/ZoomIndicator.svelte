<script lang="ts">
  export let zoom: number = 1.0;

  $: zoomPercent = Math.round(zoom * 100);
</script>

<div class="zoom-indicator">
  {zoomPercent}%
</div>

<style>
  .zoom-indicator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;

    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    border-radius: 8px;
    padding: 8px 16px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);

    font-family: 'SF Mono', 'Consolas', monospace;
    font-size: 12px;
    font-weight: 600;
    color: #495057;
  }
</style>
