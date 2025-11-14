import { memo } from 'react';
import { CANVAS } from '../utils/constants';

interface GridProps {
  scale: number;
}

/**
 * Grid component - renders infinite dot pattern
 * Dots: 2px, spacing: 20px
 */
export const Grid = memo(({ scale }: GridProps) => {
  const { gridDotSize, gridSpacing, gridDots } = CANVAS;
  const scaledSpacing = gridSpacing * scale;

  return (
    <defs>
      <pattern
        id="grid-pattern"
        width={scaledSpacing}
        height={scaledSpacing}
        patternUnits="userSpaceOnUse"
      >
        <circle
          cx={scaledSpacing / 2}
          cy={scaledSpacing / 2}
          r={gridDotSize}
          fill={gridDots}
        />
      </pattern>
    </defs>
  );
});

Grid.displayName = 'Grid';
