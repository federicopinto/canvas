/**
 * NodeTypes - Style configurations for different node types
 */
export const NODE_TYPES = {
  class: {
    headerBg: '#DAE8FC',
    headerBorder: '#6C8EBF',
    bodyBg: '#FFFFFF',
    bodyBorder: '#6C8EBF',
    borderStyle: 'solid',
    borderWidth: 1,
    badge: 'class',
    textColor: '#000000'
  },
  dataclass: {
    headerBg: '#E1D5E7',
    headerBorder: '#9673A6',
    bodyBg: '#FFFFFF',
    bodyBorder: '#9673A6',
    borderStyle: 'solid',
    borderWidth: 1,
    badge: '@dataclass',
    textColor: '#000000'
  },
  protocol: {
    headerBg: '#FFF2CC',
    headerBorder: '#D6B656',
    bodyBg: '#FFFFFF',
    bodyBorder: '#D6B656',
    borderStyle: 'dashed',
    borderWidth: 1,
    badge: '«protocol»',
    textColor: '#000000'
  },
  interface: {
    headerBg: '#D5E8D4',
    headerBorder: '#82B366',
    bodyBg: '#FFFFFF',
    bodyBorder: '#82B366',
    borderStyle: 'dashed',
    borderWidth: 1,
    badge: '«interface»',
    textColor: '#000000'
  },
  enum: {
    headerBg: '#FFE6CC',
    headerBorder: '#D79B00',
    bodyBg: '#FFFFFF',
    bodyBorder: '#D79B00',
    borderStyle: 'solid',
    borderWidth: 1,
    badge: '«enum»',
    textColor: '#000000'
  }
};

/**
 * Get node type configuration
 */
export function getNodeType(type) {
  return NODE_TYPES[type] || NODE_TYPES.class;
}

/**
 * Get all available node types
 */
export function getAvailableTypes() {
  return Object.keys(NODE_TYPES);
}
