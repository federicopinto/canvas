import type { ArrowData } from '../types';

export const ECOMMERCE_DEMO_ARROWS: ArrowData[] = [
  // Inheritance arrows (Protocol implementations)
  {
    id: 'arr-prod-ser',
    type: 'inheritance',
    fromNodeId: 'product',
    toNodeId: 'serializable',
  },
  {
    id: 'arr-order-ser',
    type: 'inheritance',
    fromNodeId: 'order',
    toNodeId: 'serializable',
  },

  // Composition arrows (strong ownership)
  {
    id: 'arr-sc-cartitem',
    type: 'composition',
    fromNodeId: 'shopping-cart',
    toNodeId: 'cart-item',
  },
  {
    id: 'arr-order-cartitem',
    type: 'composition',
    fromNodeId: 'order',
    toNodeId: 'cart-item',
  },

  // Aggregation arrows (weak ownership)
  {
    id: 'arr-cartitem-prod',
    type: 'aggregation',
    fromNodeId: 'cart-item',
    toNodeId: 'product',
  },
  {
    id: 'arr-inv-prod',
    type: 'aggregation',
    fromNodeId: 'inventory',
    toNodeId: 'product',
  },
  {
    id: 'arr-op-inv',
    type: 'aggregation',
    fromNodeId: 'order-processor',
    toNodeId: 'inventory',
  },
  {
    id: 'arr-op-pay',
    type: 'aggregation',
    fromNodeId: 'order-processor',
    toNodeId: 'payment',
  },

  // Dependency arrows (uses)
  {
    id: 'arr-op-ship',
    type: 'dependency',
    fromNodeId: 'order-processor',
    toNodeId: 'shipping',
  },
  {
    id: 'arr-op-notif',
    type: 'dependency',
    fromNodeId: 'order-processor',
    toNodeId: 'notification',
  },
  {
    id: 'arr-op-order',
    type: 'dependency',
    fromNodeId: 'order-processor',
    toNodeId: 'order',
  },
];

// Keep old export for backward compatibility
export const SAMPLE_ARROWS = ECOMMERCE_DEMO_ARROWS;
