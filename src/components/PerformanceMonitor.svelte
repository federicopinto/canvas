<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PerformanceMonitor, type PerformanceStats } from '../utils/performance';

  let stats: PerformanceStats = {
    avgFPS: 0,
    minFPS: 0,
    maxFPS: 0,
    p1FPS: 0,
    p99FPS: 0,
    droppedFrames: 0
  };

  let monitor: PerformanceMonitor;
  let visible = true;

  onMount(() => {
    monitor = new PerformanceMonitor();
    monitor.start((newStats) => {
      stats = newStats;
    });
  });

  onDestroy(() => {
    if (monitor) {
      monitor.stop();
    }
  });

  function toggle() {
    visible = !visible;
  }

  $: fpsColor = stats.avgFPS >= 55 ? '#10b981' : stats.avgFPS >= 45 ? '#f59e0b' : '#ef4444';
</script>

<div class="performance-monitor" class:collapsed={!visible}>
  <div class="header" on:click={toggle} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && toggle()}>
    <span class="title">Performance</span>
    <span class="toggle">{visible ? '−' : '+'}</span>
  </div>

  {#if visible}
    <div class="stats">
      <div class="stat">
        <span class="label">FPS:</span>
        <span class="value" style="color: {fpsColor}">{stats.avgFPS}</span>
      </div>
      <div class="stat">
        <span class="label">Min:</span>
        <span class="value">{stats.minFPS}</span>
      </div>
      <div class="stat">
        <span class="label">Max:</span>
        <span class="value">{stats.maxFPS}</span>
      </div>
      <div class="stat">
        <span class="label">Dropped:</span>
        <span class="value" style="color: {stats.droppedFrames > 5 ? '#ef4444' : '#6A737D'}">
          {stats.droppedFrames}
        </span>
      </div>
    </div>
  {/if}
</div>

<style>
  .performance-monitor {
    position: fixed;
    bottom: 16px;
    left: 16px;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    border-radius: 8px;
    padding: 8px 12px;
    color: #fff;
    font-family: 'SF Mono', 'Consolas', monospace;
    font-size: 11px;
    min-width: 180px;
  }

  .performance-monitor.collapsed {
    min-width: auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  .title {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .toggle {
    opacity: 0.6;
  }

  .stats {
    margin-top: 8px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .stat {
    display: flex;
    justify-content: space-between;
  }

  .label {
    opacity: 0.7;
  }

  .value {
    font-weight: 600;
  }
</style>
