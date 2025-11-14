import type { NodeType, NodeStyle } from '../types';
import {
  CLASS_HEADER_BG, CLASS_BORDER,
  DATACLASS_HEADER_BG, DATACLASS_BORDER,
  PROTOCOL_HEADER_BG, PROTOCOL_BORDER,
  NODE_BODY_BG
} from './colors';

export const NODE_STYLES: Record<NodeType, NodeStyle> = {
  class: {
    headerBg: CLASS_HEADER_BG,
    headerBorder: CLASS_BORDER,
    bodyBg: NODE_BODY_BG,
    bodyBorder: CLASS_BORDER,
    borderDashed: false,
    typeLabel: 'class',
    typeLabelColor: 0x6A737D, // Gray
  },
  dataclass: {
    headerBg: DATACLASS_HEADER_BG,
    headerBorder: DATACLASS_BORDER,
    bodyBg: NODE_BODY_BG,
    bodyBorder: DATACLASS_BORDER,
    borderDashed: false,
    typeLabel: '@dataclass',
    typeLabelColor: 0x9673A6, // Purple
  },
  protocol: {
    headerBg: PROTOCOL_HEADER_BG,
    headerBorder: PROTOCOL_BORDER,
    bodyBg: NODE_BODY_BG,
    bodyBorder: PROTOCOL_BORDER,
    borderDashed: true,
    typeLabel: '«protocol»',
    typeLabelColor: 0xD6B656, // Orange/yellow
  },
};
