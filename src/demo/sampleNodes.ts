import type { NodeData } from '../types';

export const ECOMMERCE_DEMO_NODES: NodeData[] = [
  // Top tier - Protocols
  {
    id: 'serializable',
    type: 'protocol',
    name: 'Serializable',
    x: 400,
    y: 50,
    width: 280,
    height: 120,
    sections: [
      {
        id: 'ser-methods',
        title: 'Methods (2)',
        items: [
          'to_dict() -> dict',
          'from_dict(data: dict) -> Self'
        ],
        collapsed: false,
      }
    ],
  },

  // Second tier - Core entities
  {
    id: 'product',
    type: 'dataclass',
    name: 'Product',
    x: 100,
    y: 220,
    width: 280,
    height: 200,
    sections: [
      {
        id: 'prod-fields',
        title: 'Fields (5)',
        items: [
          'id: str',
          'name: str',
          'price: Decimal',
          'stock: int',
          'category: str'
        ],
        collapsed: false,
      },
      {
        id: 'prod-meta',
        title: 'Metadata (2)',
        items: [
          'created_at: datetime',
          'updated_at: datetime'
        ],
        collapsed: false,
      }
    ],
  },

  {
    id: 'cart-item',
    type: 'dataclass',
    name: 'CartItem',
    x: 450,
    y: 220,
    width: 280,
    height: 150,
    sections: [
      {
        id: 'cart-fields',
        title: 'Fields (2)',
        items: [
          'product: Product',
          'quantity: int'
        ],
        collapsed: false,
      },
      {
        id: 'cart-methods',
        title: 'Methods (1)',
        items: [
          'total_price() -> Decimal'
        ],
        collapsed: false,
      }
    ],
  },

  {
    id: 'order',
    type: 'dataclass',
    name: 'Order',
    x: 800,
    y: 220,
    width: 280,
    height: 200,
    sections: [
      {
        id: 'order-fields',
        title: 'Fields (4)',
        items: [
          'id: str',
          'user_id: str',
          'items: List[CartItem]',
          'status: OrderStatus'
        ],
        collapsed: false,
      },
      {
        id: 'order-methods',
        title: 'Methods (2)',
        items: [
          'total() -> Decimal',
          'finalize() -> None'
        ],
        collapsed: false,
      }
    ],
  },

  // Third tier - Services
  {
    id: 'shopping-cart',
    type: 'class',
    name: 'ShoppingCart',
    x: 450,
    y: 450,
    width: 280,
    height: 180,
    sections: [
      {
        id: 'sc-fields',
        title: 'Fields (2)',
        items: [
          'items: List[CartItem]',
          'user_id: str'
        ],
        collapsed: false,
      },
      {
        id: 'sc-methods',
        title: 'Methods (4)',
        items: [
          'add_item(product, qty)',
          'remove_item(product_id)',
          'clear()',
          'total() -> Decimal'
        ],
        collapsed: false,
      }
    ],
  },

  {
    id: 'inventory',
    type: 'class',
    name: 'InventoryManager',
    x: 100,
    y: 480,
    width: 280,
    height: 180,
    sections: [
      {
        id: 'inv-fields',
        title: 'Fields (1)',
        items: [
          'products: Dict[str, Product]'
        ],
        collapsed: false,
      },
      {
        id: 'inv-methods',
        title: 'Methods (4)',
        items: [
          'check_stock(product_id)',
          'reserve(product_id, qty)',
          'release(product_id, qty)',
          'update_stock(product_id)'
        ],
        collapsed: false,
      }
    ],
  },

  {
    id: 'order-processor',
    type: 'class',
    name: 'OrderProcessor',
    x: 800,
    y: 480,
    width: 280,
    height: 200,
    sections: [
      {
        id: 'op-fields',
        title: 'Fields (2)',
        items: [
          'inventory: InventoryManager',
          'payment: PaymentGateway'
        ],
        collapsed: false,
      },
      {
        id: 'op-methods',
        title: 'Methods (4)',
        items: [
          'process_order(order)',
          'validate(order) -> bool',
          'reserve_stock(order)',
          'charge(order) -> bool'
        ],
        collapsed: false,
      }
    ],
  },

  // Bottom tier - External services
  {
    id: 'payment',
    type: 'class',
    name: 'PaymentGateway',
    x: 650,
    y: 730,
    width: 280,
    height: 150,
    sections: [
      {
        id: 'pay-methods',
        title: 'Methods (3)',
        items: [
          'charge(amount, card)',
          'refund(transaction_id)',
          'validate_card(card) -> bool'
        ],
        collapsed: false,
      }
    ],
  },

  {
    id: 'shipping',
    type: 'class',
    name: 'ShippingService',
    x: 1000,
    y: 730,
    width: 280,
    height: 130,
    sections: [
      {
        id: 'ship-methods',
        title: 'Methods (3)',
        items: [
          'calculate_cost(address)',
          'create_label(order)',
          'track(tracking_id)'
        ],
        collapsed: false,
      }
    ],
  },

  {
    id: 'notification',
    type: 'class',
    name: 'NotificationService',
    x: 1350,
    y: 730,
    width: 280,
    height: 130,
    sections: [
      {
        id: 'notif-methods',
        title: 'Methods (3)',
        items: [
          'send_confirmation(order)',
          'send_tracking(tracking)',
          'send_delivery(order)'
        ],
        collapsed: false,
      }
    ],
  },
];

// Keep old export for backward compatibility
export const SAMPLE_NODES = ECOMMERCE_DEMO_NODES;
