import type { Node } from '../stores/nodes';
import type { Arrow } from '../stores/arrows';

export const demoNodes: Node[] = [
  // PROTOCOLS (Interfaces)
  {
    id: 'node-1',
    type: 'protocol',
    name: 'Serializable',
    x: 100,
    y: 50,
    width: 280,
    sections: [
      {
        id: 'section-1-1',
        title: 'Methods',
        expanded: true,
        items: [
          'to_dict() -> dict',
          'from_dict(data: dict) -> Self'
        ],
        children: [
          {
            id: 'section-1-1-1',
            title: 'Format Options',
            expanded: true,
            items: [
              'to_json() -> str',
              'to_xml() -> str'
            ],
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'node-2',
    type: 'protocol',
    name: 'Cacheable',
    x: 500,
    y: 50,
    width: 280,
    sections: [
      {
        id: 'section-2-1',
        title: 'Methods',
        expanded: true,
        items: [
          'get_cache_key() -> str',
          'get_cache_ttl() -> int'
        ],
        children: [
          {
            id: 'section-2-1-1',
            title: 'Cache Operations',
            expanded: false,
            items: [
              'invalidate() -> None',
              'refresh() -> None'
            ],
            children: []
          }
        ]
      }
    ]
  },

  // DATACLASSES (Data Models)
  {
    id: 'node-3',
    type: 'dataclass',
    name: 'Product',
    x: 100,
    y: 350,
    width: 280,
    sections: [
      {
        id: 'section-3-1',
        title: 'Fields',
        expanded: true,
        items: [
          'id: int',
          'name: str',
          'price: Decimal',
          'stock: int',
          'category: str'
        ],
        children: [
          {
            id: 'section-3-1-1',
            title: 'Metadata',
            expanded: true,
            items: [
              'created_at: datetime',
              'updated_at: datetime',
              'sku: str'
            ],
            children: [
              {
                id: 'section-3-1-1-1',
                title: 'Audit Info',
                expanded: false,
                items: [
                  'created_by: str',
                  'last_modified_by: str'
                ],
                children: []
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'node-4',
    type: 'dataclass',
    name: 'Order',
    x: 500,
    y: 350,
    width: 280,
    sections: [
      {
        id: 'section-4-1',
        title: 'Fields',
        expanded: true,
        items: [
          'id: int',
          'user_id: int',
          'total: Decimal',
          'status: OrderStatus'
        ],
        children: [
          {
            id: 'section-4-1-1',
            title: 'Items',
            expanded: true,
            items: [
              'items: List[CartItem]',
              'item_count: int'
            ],
            children: []
          },
          {
            id: 'section-4-1-2',
            title: 'Tracking',
            expanded: false,
            items: [
              'placed_at: datetime',
              'shipped_at: datetime?',
              'delivered_at: datetime?'
            ],
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'node-5',
    type: 'dataclass',
    name: 'User',
    x: 900,
    y: 350,
    width: 280,
    sections: [
      {
        id: 'section-5-1',
        title: 'Fields',
        expanded: true,
        items: [
          'id: int',
          'email: str',
          'name: str',
          'password_hash: str'
        ],
        children: [
          {
            id: 'section-5-1-1',
            title: 'Profile',
            expanded: true,
            items: [
              'address: Address',
              'phone: str?',
              'verified: bool'
            ],
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'node-6',
    type: 'dataclass',
    name: 'CartItem',
    x: 1300,
    y: 350,
    width: 280,
    sections: [
      {
        id: 'section-6-1',
        title: 'Fields',
        expanded: true,
        items: [
          'product_id: int',
          'quantity: int',
          'price: Decimal'
        ],
        children: [
          {
            id: 'section-6-1-1',
            title: 'Computed',
            expanded: false,
            items: [
              'subtotal: Decimal',
              'discount: Decimal'
            ],
            children: []
          }
        ]
      }
    ]
  },

  // CLASSES (Services)
  {
    id: 'node-7',
    type: 'class',
    name: 'ProductService',
    x: 100,
    y: 700,
    width: 280,
    sections: [
      {
        id: 'section-7-1',
        title: 'Fields',
        expanded: true,
        items: [
          'db: Database',
          'cache: CacheManager'
        ],
        children: []
      },
      {
        id: 'section-7-2',
        title: 'Methods',
        expanded: true,
        items: [
          'get_product(id: int) -> Product',
          'search(query: str) -> List[Product]',
          'update_stock(id: int, qty: int) -> bool'
        ],
        children: [
          {
            id: 'section-7-2-1',
            title: 'Private Methods',
            expanded: false,
            items: [
              '_validate_stock(qty: int) -> bool',
              '_notify_low_stock(product: Product) -> None'
            ],
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'node-8',
    type: 'class',
    name: 'OrderProcessor',
    x: 500,
    y: 700,
    width: 280,
    sections: [
      {
        id: 'section-8-1',
        title: 'Fields',
        expanded: true,
        items: [
          'db: Database',
          'payment: PaymentGateway',
          'email: EmailService'
        ],
        children: []
      },
      {
        id: 'section-8-2',
        title: 'Methods',
        expanded: true,
        items: [
          'create_order(user: User, items: List[CartItem]) -> Order',
          'process_payment(order: Order) -> bool',
          'cancel_order(order_id: int) -> bool'
        ],
        children: [
          {
            id: 'section-8-2-1',
            title: 'Workflow',
            expanded: false,
            items: [
              '_validate_items(items: List[CartItem]) -> bool',
              '_calculate_total(items: List[CartItem]) -> Decimal',
              '_send_confirmation(order: Order) -> None'
            ],
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'node-9',
    type: 'class',
    name: 'PaymentGateway',
    x: 900,
    y: 700,
    width: 280,
    sections: [
      {
        id: 'section-9-1',
        title: 'Fields',
        expanded: true,
        items: [
          'api_key: str',
          'endpoint: str',
          'retry_count: int = 3'
        ],
        children: []
      },
      {
        id: 'section-9-2',
        title: 'Methods',
        expanded: true,
        items: [
          'charge(amount: Decimal, token: str) -> PaymentResult',
          'refund(transaction_id: str) -> bool'
        ],
        children: [
          {
            id: 'section-9-2-1',
            title: 'Internal',
            expanded: false,
            items: [
              '_make_request(payload: dict) -> Response',
              '_handle_error(error: Exception) -> None'
            ],
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'node-10',
    type: 'class',
    name: 'InventoryManager',
    x: 1300,
    y: 700,
    width: 280,
    sections: [
      {
        id: 'section-10-1',
        title: 'Fields',
        expanded: true,
        items: [
          'db: Database',
          'products: Dict[int, Product]'
        ],
        children: []
      },
      {
        id: 'section-10-2',
        title: 'Methods',
        expanded: true,
        items: [
          'reserve_stock(product_id: int, qty: int) -> bool',
          'release_stock(product_id: int, qty: int) -> None',
          'check_availability(product_id: int) -> int'
        ],
        children: []
      }
    ]
  },
  {
    id: 'node-11',
    type: 'class',
    name: 'CacheManager',
    x: 100,
    y: 1050,
    width: 280,
    sections: [
      {
        id: 'section-11-1',
        title: 'Fields',
        expanded: true,
        items: [
          'redis_client: Redis',
          'default_ttl: int = 3600'
        ],
        children: [
          {
            id: 'section-11-1-1',
            title: 'Config',
            expanded: false,
            items: [
              'max_size: int = 10000',
              'eviction_policy: str = "LRU"'
            ],
            children: []
          }
        ]
      },
      {
        id: 'section-11-2',
        title: 'Methods',
        expanded: true,
        items: [
          'get(key: str) -> Any?',
          'set(key: str, value: Any, ttl: int?) -> None',
          'delete(key: str) -> None',
          'clear() -> None'
        ],
        children: []
      }
    ]
  },
  {
    id: 'node-12',
    type: 'class',
    name: 'EmailService',
    x: 500,
    y: 1050,
    width: 280,
    sections: [
      {
        id: 'section-12-1',
        title: 'Fields',
        expanded: true,
        items: [
          'smtp_host: str',
          'smtp_port: int',
          'from_address: str'
        ],
        children: []
      },
      {
        id: 'section-12-2',
        title: 'Methods',
        expanded: true,
        items: [
          'send_order_confirmation(order: Order, user: User) -> bool',
          'send_shipping_notification(order: Order) -> bool',
          'send_password_reset(user: User, token: str) -> bool'
        ],
        children: [
          {
            id: 'section-12-2-1',
            title: 'Templates',
            expanded: false,
            items: [
              '_render_template(name: str, context: dict) -> str',
              '_get_template(name: str) -> Template'
            ],
            children: []
          }
        ]
      }
    ]
  }
];

export const demoArrows: Arrow[] = [
  // Inheritance - Protocols to Data Models
  {
    id: 'arrow-1',
    from: 'node-1',  // Serializable
    to: 'node-3',    // Product
    type: 'inheritance'
  },
  {
    id: 'arrow-2',
    from: 'node-1',  // Serializable
    to: 'node-4',    // Order
    type: 'inheritance'
  },
  {
    id: 'arrow-3',
    from: 'node-1',  // Serializable
    to: 'node-5',    // User
    type: 'inheritance'
  },
  {
    id: 'arrow-4',
    from: 'node-2',  // Cacheable
    to: 'node-11',   // CacheManager
    type: 'inheritance'
  },

  // Composition - Services own/manage specific data models
  {
    id: 'arrow-5',
    from: 'node-7',  // ProductService
    to: 'node-3',    // Product
    type: 'composition'
  },
  {
    id: 'arrow-6',
    from: 'node-8',  // OrderProcessor
    to: 'node-4',    // Order
    type: 'composition'
  },

  // Aggregation - Weak ownership/collection
  {
    id: 'arrow-7',
    from: 'node-10', // InventoryManager
    to: 'node-3',    // Product
    type: 'aggregation'
  },
  {
    id: 'arrow-8',
    from: 'node-4',  // Order
    to: 'node-6',    // CartItem
    type: 'aggregation'
  },

  // Dependency - Uses but doesn't own
  {
    id: 'arrow-9',
    from: 'node-8',  // OrderProcessor
    to: 'node-9',    // PaymentGateway
    type: 'dependency'
  },
  {
    id: 'arrow-10',
    from: 'node-8',  // OrderProcessor
    to: 'node-12',   // EmailService
    type: 'dependency'
  },
  {
    id: 'arrow-11',
    from: 'node-7',  // ProductService
    to: 'node-11',   // CacheManager
    type: 'dependency'
  },
  {
    id: 'arrow-12',
    from: 'node-8',  // OrderProcessor
    to: 'node-10',   // InventoryManager
    type: 'dependency'
  },
  {
    id: 'arrow-13',
    from: 'node-6',  // CartItem
    to: 'node-3',    // Product
    type: 'dependency'
  },
  {
    id: 'arrow-14',
    from: 'node-12', // EmailService
    to: 'node-5',    // User
    type: 'dependency'
  }
];
