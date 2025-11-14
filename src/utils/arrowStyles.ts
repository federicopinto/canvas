import type { ArrowType, ArrowStyle } from '../types';

export const ARROW_STYLES: Record<ArrowType, ArrowStyle> = {
  inheritance: {
    color: 0x2C3E50,     // Dark gray
    lineWidth: 2,
    headType: 'triangle',
    tailType: 'none',
  },
  composition: {
    color: 0x34495E,     // Darker gray
    lineWidth: 2,
    headType: 'arrow',
    tailType: 'filled-diamond',
  },
  aggregation: {
    color: 0x7F8C8D,     // Medium gray
    lineWidth: 2,
    headType: 'arrow',
    tailType: 'hollow-diamond',
  },
  dependency: {
    color: 0x95A5A6,     // Light gray
    lineWidth: 2,
    dashPattern: [4, 3],  // 4px dash, 3px gap
    headType: 'arrow',
    tailType: 'none',
  },
};
