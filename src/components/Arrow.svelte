<script lang="ts">
  import type { Arrow } from '../stores/arrows';
  import type { Node } from '../stores/nodes';
  import { nodes } from '../stores/nodes';
  import { ArrowRouter } from '../core/graph/ArrowRouter';

  export let arrow: Arrow;

  const router = new ArrowRouter();

  $: fromNode = $nodes.find(n => n.id === arrow.from);
  $: toNode = $nodes.find(n => n.id === arrow.to);
  $: path = fromNode && toNode ? router.route(fromNode, toNode) : null;

  // SVG path for cubic Bezier curve
  $: pathD = path
    ? `M ${path.start.x} ${path.start.y} C ${path.controlPoint1.x} ${path.controlPoint1.y}, ${path.controlPoint2.x} ${path.controlPoint2.y}, ${path.end.x} ${path.end.y}`
    : '';

  // Arrowhead path (triangle)
  $: arrowheadD = path
    ? `M ${path.end.x} ${path.end.y}
       L ${path.end.x - 8 * Math.cos((path.angle - 150) * Math.PI / 180)} ${path.end.y - 8 * Math.sin((path.angle - 150) * Math.PI / 180)}
       L ${path.end.x - 8 * Math.cos((path.angle + 150) * Math.PI / 180)} ${path.end.y - 8 * Math.sin((path.angle + 150) * Math.PI / 180)}
       Z`
    : '';

  // Diamond path for composition/aggregation (at the start point)
  $: diamondD = path
    ? (() => {
        // Calculate the angle from start to first control point
        const startAngle = Math.atan2(
          path.controlPoint1.y - path.start.y,
          path.controlPoint1.x - path.start.x
        );

        // Diamond dimensions
        const length = 16;
        const width = 10;

        // Calculate diamond points relative to start
        const halfLength = length / 2;
        const halfWidth = width / 2;

        // Rotate diamond to align with path direction
        const cos = Math.cos(startAngle);
        const sin = Math.sin(startAngle);

        const p1 = {
          x: path.start.x,
          y: path.start.y
        };
        const p2 = {
          x: path.start.x + halfLength * cos - halfWidth * sin,
          y: path.start.y + halfLength * sin + halfWidth * cos
        };
        const p3 = {
          x: path.start.x + length * cos,
          y: path.start.y + length * sin
        };
        const p4 = {
          x: path.start.x + halfLength * cos + halfWidth * sin,
          y: path.start.y + halfLength * sin - halfWidth * cos
        };

        return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;
      })()
    : '';

  // Styles based on arrow type
  const typeStyles = {
    inheritance: {
      stroke: '#2C3E50',
      strokeWidth: 2,
      strokeDasharray: 'none',
      fill: 'none'
    },
    composition: {
      stroke: '#34495E',
      strokeWidth: 2,
      strokeDasharray: 'none',
      fill: '#34495E'
    },
    aggregation: {
      stroke: '#7F8C8D',
      strokeWidth: 2,
      strokeDasharray: 'none',
      fill: 'none'
    },
    dependency: {
      stroke: '#95A5A6',
      strokeWidth: 2,
      strokeDasharray: '4 3',
      fill: 'none'
    }
  };

  $: style = typeStyles[arrow.type];
</script>

{#if path}
  <g class="arrow arrow-{arrow.type}">
    <!-- Main path -->
    <path
      d={pathD}
      stroke={style.stroke}
      stroke-width={style.strokeWidth}
      stroke-dasharray={style.strokeDasharray}
      fill="none"
      class="arrow-path"
    />

    <!-- Diamond (for composition/aggregation) -->
    {#if arrow.type === 'composition' || arrow.type === 'aggregation'}
      <path
        d={diamondD}
        stroke={style.stroke}
        stroke-width={style.strokeWidth}
        fill={arrow.type === 'composition' ? style.fill : 'white'}
      />
    {/if}

    <!-- Arrowhead -->
    <path
      d={arrowheadD}
      stroke={style.stroke}
      stroke-width={style.strokeWidth}
      fill={arrow.type === 'inheritance' ? 'white' : style.stroke}
    />
  </g>
{/if}

<style>
  .arrow-path {
    transition: stroke-width 150ms ease;
  }

  .arrow:hover .arrow-path {
    stroke-width: 3;
  }
</style>
