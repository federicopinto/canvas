import { memo } from 'react';
import { SPACING, COLORS } from '../utils/constants';

interface ZoomIndicatorProps {
  percentage: number;
}

export const ZoomIndicator = memo(({ percentage }: ZoomIndicatorProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: `${SPACING.sm}px ${SPACING.md}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '6px',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
        fontSize: '12px',
        fontWeight: 600,
        color: COLORS.textSecondary,
        zIndex: 1000,
        userSelect: 'none',
        backdropFilter: 'blur(8px)',
      }}
    >
      {percentage}%
    </div>
  );
});

ZoomIndicator.displayName = 'ZoomIndicator';
