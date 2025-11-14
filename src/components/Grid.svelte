<script lang="ts">
  import { viewport } from '../stores/viewport';

  const DOT_SIZE = 2;
  const SPACING = 20;

  $: patternX = $viewport.x % (SPACING * $viewport.scale);
  $: patternY = $viewport.y % (SPACING * $viewport.scale);
  $: patternSize = SPACING * $viewport.scale;
  $: dotRadius = DOT_SIZE / 2;
</script>

<defs>
  <pattern
    id="grid-pattern"
    x={patternX}
    y={patternY}
    width={patternSize}
    height={patternSize}
    patternUnits="userSpaceOnUse">
    <circle
      cx={dotRadius}
      cy={dotRadius}
      r={dotRadius}
      fill="#E1E4E8" />
  </pattern>
</defs>

<rect
  x={-100000}
  y={-100000}
  width={200000}
  height={200000}
  fill="url(#grid-pattern)"
  pointer-events="none" />
