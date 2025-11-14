import { memo, useState, useRef, useEffect } from 'react';
import type { Section, SectionItem } from '../types';
import { SECTION, COLORS, TYPOGRAPHY, ANIMATION, SPACING } from '../utils/constants';

interface CollapsibleSectionProps {
  section: Section;
  nodeId: string;
  level?: number;
  onToggle: (nodeId: string, sectionId: string) => void;
}

const SectionItemComponent = memo(({ item }: { item: SectionItem }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        height: `${SECTION.itemHeight}px`,
        padding: `${SPACING.xs}px ${SPACING.sm + SPACING.xs}px`,
        fontFamily: TYPOGRAPHY.codeFont,
        fontSize: `${TYPOGRAPHY.codeSize}px`,
        lineHeight: TYPOGRAPHY.codeLineHeight,
        color: COLORS.textPrimary,
        backgroundColor: isHovered ? COLORS.contentHoverBg : 'transparent',
        cursor: item.vscodeLink ? 'pointer' : 'default',
        transition: `background-color ${ANIMATION.fast}ms ${ANIMATION.easing}`,
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-vscode-link={item.vscodeLink}
      title={item.vscodeLink ? 'Jump to definition' : undefined}
    >
      <span style={{ marginRight: SPACING.xs }}>•</span>
      <span>{item.label}</span>
      {item.type && (
        <span style={{ color: COLORS.textSecondary, marginLeft: SPACING.xs }}>
          : {item.type}
        </span>
      )}
    </div>
  );
});

SectionItemComponent.displayName = 'SectionItem';

export const CollapsibleSection = memo(
  ({ section, nodeId, level = 0, onToggle }: CollapsibleSectionProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<number | null>(null);

    // Calculate content height when collapsed state changes
    useEffect(() => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    }, [section.items, section.children, section.isCollapsed]);

    const indent = level * SECTION.nestIndent;
    const itemCount = section.items.length + (section.children?.length || 0);

    return (
      <div style={{ marginLeft: `${indent}px` }}>
        {/* Section Header */}
        <div
          style={{
            height: `${SECTION.headerHeight}px`,
            padding: `${SPACING.sm}px ${SPACING.sm + SPACING.xs}px`,
            backgroundColor: isHovered ? SECTION.headerHoverBg : SECTION.headerBg,
            borderBottom: `1px solid ${SECTION.headerBorder}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: TYPOGRAPHY.headerFont,
            fontSize: `${TYPOGRAPHY.sectionHeaderSize}px`,
            fontWeight: 600,
            color: COLORS.textPrimary,
            transition: `background-color ${ANIMATION.fast}ms ${ANIMATION.easing}`,
            userSelect: 'none',
          }}
          onClick={() => onToggle(nodeId, section.id)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: COLORS.textSecondary,
              }}
            >
              {section.isCollapsed ? '[+]' : '[-]'}
            </span>
            <span>{section.label}</span>
          </div>
          <span
            style={{
              fontSize: `${TYPOGRAPHY.badgeSize}px`,
              color: COLORS.textSecondary,
            }}
          >
            ({itemCount})
          </span>
        </div>

        {/* Content Area with Animation */}
        <div
          style={{
            maxHeight: section.isCollapsed ? '0px' : `${contentHeight || 'auto'}px`,
            overflow: 'hidden',
            opacity: section.isCollapsed ? 0 : 1,
            transition: `max-height ${ANIMATION.normal}ms ${ANIMATION.easing}, opacity ${ANIMATION.normal}ms ${ANIMATION.easing}`,
          }}
        >
          <div ref={contentRef}>
            {/* Section Items */}
            {section.items.map((item) => (
              <SectionItemComponent key={item.id} item={item} />
            ))}

            {/* Nested Sections */}
            {section.children?.map((child) => (
              <CollapsibleSection
                key={child.id}
                section={child}
                nodeId={nodeId}
                level={level + 1}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

CollapsibleSection.displayName = 'CollapsibleSection';
