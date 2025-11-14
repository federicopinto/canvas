<script lang="ts">
  import { slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import type { Section } from '../stores/nodes';
  import { nodes } from '../stores/nodes';

  export let section: Section;
  export let nodeId: string;
  export let depth: number = 0;

  function toggleExpanded() {
    nodes.toggleSection(nodeId, section.id);
  }

  $: itemCount = section.items.length + section.children.length;
</script>

<div class="section" style="padding-left: {depth * 16}px;">
  <!-- Section Header -->
  <div
    class="section-header"
    on:click={toggleExpanded}
    on:keydown={(e) => e.key === 'Enter' && toggleExpanded()}
    role="button"
    tabindex="0"
  >
    <span class="collapse-indicator">
      {section.expanded ? '▼' : '▶'}
    </span>
    <span class="section-title">{section.title}</span>
    <span class="item-count">({itemCount})</span>
  </div>

  <!-- Content (visible when expanded) -->
  {#if section.expanded}
    <div class="section-content" transition:slide={{ duration: 250, easing: cubicOut }}>
      <!-- Items -->
      {#each section.items as item}
        <div class="item">
          • {item}
        </div>
      {/each}

      <!-- Nested sections -->
      {#each section.children as child}
        <svelte:self section={child} {nodeId} depth={depth + 1} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .section {
    width: 100%;
  }

  .section-header {
    height: 32px;
    padding: 8px 12px;
    background: #F8F9FA;
    border-bottom: 1px solid #DEE2E6;
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: -apple-system, 'Segoe UI', sans-serif;
    font-size: 11pt;
    font-weight: 600;
    color: #24292E;
    transition: background 150ms ease;
  }

  .section-header:hover {
    background: #E9ECEF;
  }

  .section-header:focus {
    outline: 2px solid #667EEA;
    outline-offset: -2px;
  }

  .collapse-indicator {
    font-size: 10px;
    color: #6A737D;
    width: 12px;
    flex-shrink: 0;
  }

  .section-title {
    flex: 1;
  }

  .item-count {
    font-size: 10px;
    font-weight: 400;
    color: #6A737D;
    flex-shrink: 0;
  }

  .section-content {
    overflow: hidden;
  }

  .item {
    height: 24px;
    padding: 4px 12px;
    font-family: 'SF Mono', 'Consolas', monospace;
    font-size: 10pt;
    color: #24292E;
    display: flex;
    align-items: center;
    transition: background 150ms ease;
  }

  .item:hover {
    background: #F1F3F5;
    cursor: pointer;
  }
</style>
