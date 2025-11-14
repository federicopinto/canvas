<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { nodes, type Node } from '../stores/nodes';
  import { selection } from '../stores/selection';
  import { viewport } from '../stores/viewport';
  import { Spring2D } from '../core/animation/SpringPhysics';
  import Section from './Section.svelte';

  export let node: Node;

  $: selected = $selection.has(node.id);

  let isDragging = false;
  let spring: Spring2D;
  let animationFrameId: number;

  onMount(() => {
    spring = new Spring2D(node.x, node.y, { stiffness: 200, damping: 15 });
  });

  function screenToCanvas(screenX: number, screenY: number) {
    return {
      x: (screenX - $viewport.x) / $viewport.scale,
      y: (screenY - $viewport.y) / $viewport.scale
    };
  }

  function handleMouseDown(e: MouseEvent) {
    // Only drag on node headers/body, not on sections or content
    const target = e.target as HTMLElement;
    if (target.tagName !== 'rect' && !target.classList.contains('node-header') && !target.classList.contains('node-body')) {
      return;
    }

    e.stopPropagation();

    const canvasPos = screenToCanvas(e.clientX, e.clientY);

    isDragging = true;
    spring.setTarget(canvasPos.x, canvasPos.y);

    // Start animation loop
    const animate = () => {
      if (!isDragging) return;

      const pos = spring.tick();
      nodes.updatePosition(node.id, pos.x, pos.y);

      // Continue if spring hasn't settled
      if (!spring.isAtRest()) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    // Add global mouse listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;

    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    spring.setTarget(canvasPos.x, canvasPos.y);
  }

  function handleMouseUp() {
    isDragging = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    if (e.shiftKey) {
      selection.toggle(node.id);
    } else {
      selection.select(node.id);
    }
  }

  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  });

  // Color mappings based on node type
  const typeStyles = {
    class: {
      headerBg: '#DAE8FC',
      border: '#6C8EBF',
      badge: 'class',
      badgeColor: '#6A737D',
      borderStyle: 'solid'
    },
    dataclass: {
      headerBg: '#E1D5E7',
      border: '#9673A6',
      badge: '@dataclass',
      badgeColor: '#9673A6',
      borderStyle: 'solid'
    },
    protocol: {
      headerBg: '#FFF2CC',
      border: '#D6B656',
      badge: '«protocol»',
      badgeColor: '#E67E22',
      borderStyle: 'dashed'
    }
  };

  $: style = typeStyles[node.type];

  // Calculate total height based on sections (including nested)
  $: totalHeight = 44 + calculateContentHeight();

  function calculateSectionHeight(section: any): number {
    // Section header: 32px
    let height = 32;

    if (section.expanded) {
      // Each item: 24px
      height += section.items.length * 24;

      // Nested children (recursive)
      for (const child of section.children) {
        height += calculateSectionHeight(child);
      }
    }

    return height;
  }

  function calculateContentHeight(): number {
    let height = 0;
    for (const section of node.sections) {
      height += calculateSectionHeight(section);
    }
    return Math.max(height, 60); // Minimum 60px for body
  }
</script>

<g class="class-node" class:selected class:dragging={isDragging} on:mousedown={handleMouseDown} on:click={handleClick}>
  <!-- Node shadow -->
  <defs>
    <filter id="node-shadow-{node.id}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation={isDragging ? 4 : (selected ? 4 : 2)} />
      <feOffset dx="0" dy={isDragging ? 4 : (selected ? 4 : 2)} result="offsetblur" />
      <feComponentTransfer>
        <feFuncA type="linear" slope={isDragging ? 0.24 : (selected ? 0.24 : 0.12)} />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <g transform="translate({node.x}, {node.y})">
    <!-- Main container with shadow -->
    <g filter="url(#node-shadow-{node.id})">
      <!-- Header -->
      <rect
        class="node-header"
        width={node.width}
        height="44"
        rx="8"
        ry="8"
        fill={style.headerBg}
        stroke={style.border}
        stroke-width="2"
        stroke-dasharray={style.borderStyle === 'dashed' ? '4 3' : 'none'}
      />

      <!-- Body -->
      <rect
        class="node-body"
        y="44"
        width={node.width}
        height={totalHeight - 44}
        rx="0"
        ry="0"
        fill="#FFFFFF"
        stroke={style.border}
        stroke-width="2"
        stroke-dasharray={style.borderStyle === 'dashed' ? '4 3' : 'none'}
      />

      <!-- Bottom corners rounded -->
      <rect
        class="node-body-rounded"
        y={totalHeight - 8}
        width={node.width}
        height="8"
        rx="8"
        ry="8"
        fill="#FFFFFF"
        stroke={style.border}
        stroke-width="2"
        stroke-dasharray={style.borderStyle === 'dashed' ? '4 3' : 'none'}
      />
    </g>

    <!-- Class name -->
    <text
      class="node-name"
      x="16"
      y="29"
      font-family="-apple-system, 'Segoe UI', sans-serif"
      font-size="14"
      font-weight="700"
      fill="#24292E"
    >
      {node.name}
    </text>

    <!-- Type badge -->
    <text
      class="node-badge"
      x={node.width - 16}
      y="29"
      text-anchor="end"
      font-family="-apple-system, 'Segoe UI', sans-serif"
      font-size="9"
      font-style="italic"
      fill={style.badgeColor}
    >
      {style.badge}
    </text>

    <!-- Sections (using foreignObject for HTML animations) -->
    <foreignObject x="0" y="44" width={node.width} height={totalHeight - 44}>
      <div xmlns="http://www.w3.org/1999/xhtml" class="sections-container">
        {#each node.sections as section}
          <Section {section} nodeId={node.id} depth={0} />
        {/each}
      </div>
    </foreignObject>

    <!-- Selection border (if selected) -->
    {#if selected}
      <rect
        class="selection-border"
        x="-2"
        y="-2"
        width={node.width + 4}
        height={totalHeight + 4}
        rx="10"
        fill="none"
        stroke="#667EEA"
        stroke-width="2"
        opacity="0.8"
      />
    {/if}
  </g>
</g>

<style>
  .class-node {
    cursor: grab;
    transition: transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1);
  }

  .class-node.dragging {
    cursor: grabbing;
    transform: scale(1.02);
  }

  .class-node:hover .node-header,
  .class-node:hover .node-body {
    filter: brightness(0.98);
  }

  .node-name {
    pointer-events: none;
    user-select: none;
  }

  .node-badge {
    pointer-events: none;
    user-select: none;
  }

  .sections-container {
    background: #FFFFFF;
    overflow: hidden;
    height: 100%;
  }

  .selection-border {
    pointer-events: none;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 0.5; }
  }
</style>
