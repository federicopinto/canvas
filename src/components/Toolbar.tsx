import { memo, useState } from 'react';
import { TOOLBAR, SPACING, ANIMATION, COLORS } from '../utils/constants';

interface ToolbarProps {
  onAutoArrange: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitToScreen: () => void;
  onExportPNG: () => void;
  onClearCanvas: () => void;
  zoomPercentage: number;
}

interface ToolbarButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const ToolbarButton = memo(({ icon, label, onClick, disabled }: ToolbarButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  return (
    <button
      style={{
        width: `${TOOLBAR.buttonSize}px`,
        height: `${TOOLBAR.buttonSize}px`,
        borderRadius: `${TOOLBAR.buttonRadius}px`,
        backgroundColor: isActive
          ? TOOLBAR.activeBg
          : isHovered
          ? TOOLBAR.hoverBg
          : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${TOOLBAR.iconSize}px`,
        color: disabled ? COLORS.textSecondary : '#495057',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: `background-color ${ANIMATION.fast}ms ${ANIMATION.easing}`,
        border: 'none',
        outline: 'none',
      }}
      onClick={onClick}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => !disabled && setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      title={label}
      disabled={disabled}
    >
      {icon}
    </button>
  );
});

ToolbarButton.displayName = 'ToolbarButton';

const Separator = () => (
  <div
    style={{
      width: '1px',
      height: `${TOOLBAR.buttonSize * 0.6}px`,
      backgroundColor: '#DEE2E6',
    }}
  />
);

export const Toolbar = memo(
  ({
    onAutoArrange,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onFitToScreen,
    onExportPNG,
    onClearCanvas,
    zoomPercentage,
  }: ToolbarProps) => {
    return (
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: `${SPACING.sm}px`,
          padding: TOOLBAR.padding,
          backgroundColor: TOOLBAR.bg,
          borderRadius: `${TOOLBAR.borderRadius}px`,
          boxShadow: TOOLBAR.shadow,
          backdropFilter: `blur(${TOOLBAR.backdropBlur}px)`,
          zIndex: 1000,
          userSelect: 'none',
        }}
      >
        <ToolbarButton icon="⚡" label="Auto Arrange" onClick={onAutoArrange} />

        <Separator />

        <ToolbarButton icon="−" label="Zoom out (Ctrl+-)" onClick={onZoomOut} />
        <button
          style={{
            minWidth: `${TOOLBAR.buttonSize * 1.5}px`,
            height: `${TOOLBAR.buttonSize}px`,
            borderRadius: `${TOOLBAR.buttonRadius}px`,
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 600,
            color: '#495057',
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
          }}
          onClick={onZoomReset}
          title="Reset zoom (Ctrl+0)"
        >
          {zoomPercentage}%
        </button>
        <ToolbarButton icon="+" label="Zoom in (Ctrl++)" onClick={onZoomIn} />

        <Separator />

        <ToolbarButton icon="⛶" label="Fit all nodes" onClick={onFitToScreen} />
        <ToolbarButton icon="📥" label="Download as image" onClick={onExportPNG} />
        <ToolbarButton icon="🗑" label="Delete all nodes" onClick={onClearCanvas} />
      </div>
    );
  }
);

Toolbar.displayName = 'Toolbar';
