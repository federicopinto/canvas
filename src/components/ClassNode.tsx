import { memo, useState } from 'react';
import type { Node } from '../types';
import { NODE, NODE_COLORS, TYPOGRAPHY, COLORS, SPACING, ANIMATION, SELECTION } from '../utils/constants';
import { CollapsibleSection } from './CollapsibleSection';
import { useCanvasStore } from '../store/canvasStore';

interface ClassNodeProps {
  node: Node;
  isSelected: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
}

const getNodeColors = (type: Node['type']) => {
  return NODE_COLORS[type];
};

const getTypeBadge = (type: Node['type']) => {
  switch (type) {
    case 'class':
      return { label: 'class', color: COLORS.textSecondary, italic: true };
    case 'dataclass':
      return { label: '@dataclass', color: NODE_COLORS.dataclass.headerBorder, italic: false };
    case 'protocol':
      return { label: '«protocol»', color: '#D97706', italic: true };
  }
};

export const ClassNode = memo(({ node, isSelected, isDragging, onMouseDown }: ClassNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const toggleSection = useCanvasStore((state) => state.toggleSection);

  const colors = getNodeColors(node.type);
  const badge = getTypeBadge(node.type);
  const isDashed = node.type === 'protocol';

  // Calculate scale based on state
  let scale = 1;
  if (isDragging) {
    scale = NODE.dragScale;
  } else if (isHovered) {
    scale = NODE.hoverScale;
  }

  return (
    <g
      transform={`translate(${node.position.x}, ${node.position.y}) scale(${scale})`}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : `transform ${ANIMATION.normal}ms ${ANIMATION.easing}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drop Shadow */}
      <defs>
        <filter id={`shadow-${node.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.12" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main Container */}
      <g filter={`url(#shadow-${node.id})`}>
        {/* Header */}
        <rect
          x="0"
          y="0"
          width={node.size.width}
          height={NODE.headerHeight}
          fill={colors.headerBg}
          stroke={colors.headerBorder}
          strokeWidth={NODE.borderWidth}
          strokeDasharray={isDashed ? '4 4' : '0'}
          rx={NODE.borderRadius}
          ry={NODE.borderRadius}
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />

        {/* Body */}
        <rect
          x="0"
          y={NODE.headerHeight}
          width={node.size.width}
          height={node.size.height - NODE.headerHeight}
          fill={colors.bodyBg}
          stroke={colors.bodyBorder}
          strokeWidth={NODE.borderWidth}
          strokeDasharray={isDashed ? '4 4' : '0'}
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />

        {/* Selection Border */}
        {isSelected && (
          <rect
            x={-SELECTION.borderWidth}
            y={-SELECTION.borderWidth}
            width={node.size.width + SELECTION.borderWidth * 2}
            height={node.size.height + SELECTION.borderWidth * 2}
            fill="none"
            stroke={SELECTION.borderColor}
            strokeWidth={SELECTION.borderWidth}
            rx={NODE.borderRadius}
            ry={NODE.borderRadius}
            style={{ vectorEffect: 'non-scaling-stroke' }}
          />
        )}

        {/* Make corners rounded properly */}
        <rect
          x="0"
          y="0"
          width={node.size.width}
          height={NODE.headerHeight}
          fill={colors.headerBg}
          stroke="none"
          rx={NODE.borderRadius}
          ry={NODE.borderRadius}
        />
        <rect
          x="0"
          y={NODE.headerHeight - NODE.borderRadius}
          width={node.size.width}
          height={NODE.borderRadius}
          fill={colors.headerBg}
          stroke="none"
        />

        {/* Header Content */}
        <foreignObject
          x={SPACING.md}
          y={0}
          width={node.size.width - SPACING.md * 2}
          height={NODE.headerHeight}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: TYPOGRAPHY.headerFont,
              fontSize: `${TYPOGRAPHY.headerSize}px`,
              fontWeight: 'bold',
              color: COLORS.textPrimary,
            }}
          >
            <span>{node.label}</span>
            <span
              style={{
                fontSize: `${TYPOGRAPHY.badgeSize}px`,
                color: badge.color,
                fontStyle: badge.italic ? 'italic' : 'normal',
                fontWeight: 'normal',
              }}
            >
              {badge.label}
            </span>
          </div>
        </foreignObject>

        {/* Body Content - Sections */}
        <foreignObject
          x={0}
          y={NODE.headerHeight}
          width={node.size.width}
          height={node.size.height - NODE.headerHeight}
          style={{ overflow: 'hidden' }}
        >
          <div style={{ width: '100%', height: '100%' }}>
            {node.sections.map((section) => (
              <CollapsibleSection
                key={section.id}
                section={section}
                nodeId={node.id}
                onToggle={toggleSection}
              />
            ))}
          </div>
        </foreignObject>

        {/* Draggable overlay (to capture mouse events) */}
        <rect
          x="0"
          y="0"
          width={node.size.width}
          height={NODE.headerHeight}
          fill="transparent"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={(e) => onMouseDown(e, node.id)}
        />
      </g>
    </g>
  );
});

ClassNode.displayName = 'ClassNode';
