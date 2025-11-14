<script lang="ts">
  import CanvasView from './components/CanvasView.svelte';
</script>

<main>
  <CanvasView />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
    background: #FAFBFC;
  }

  :global(*) {
    box-sizing: border-box;
  }

  main {
    width: 100vw;
    height: 100vh;
    position: relative;
  }
</style>
