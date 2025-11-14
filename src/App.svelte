<script lang="ts">
  import { onMount } from 'svelte';
  import Canvas from './components/Canvas.svelte';
  import PerformanceMonitor from './components/PerformanceMonitor.svelte';
  import { nodes } from './stores/nodes';
  import { arrows } from './stores/arrows';
  import { demoNodes, demoArrows } from './demo/demo-data';

  onMount(() => {
    // Load demo data
    nodes.set(demoNodes);
    arrows.set(demoArrows);
  });
</script>

<main>
  <Canvas />
  <PerformanceMonitor />
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
</style>
