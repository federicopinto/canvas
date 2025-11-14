/**
 * Demo data - Sample class diagram
 */
export const demoData = {
  nodes: [
    {
      id: 'n1',
      type: 'protocol',
      className: 'Serializable',
      x: 500,
      y: 50,
      width: 220,
      sections: [
        {
          title: 'Methods',
          items: [
            'to_dict() -> dict',
            'from_dict(data: dict) -> Self'
          ]
        }
      ]
    },
    {
      id: 'n2',
      type: 'dataclass',
      className: 'Product',
      x: 200,
      y: 250,
      width: 220,
      sections: [
        {
          title: 'Fields',
          items: [
            'id: str',
            'name: str',
            'price: float',
            'category: str',
            'in_stock: bool'
          ]
        },
        {
          title: 'Methods',
          items: [
            'calculate_tax() -> float',
            'apply_discount(rate: float)'
          ]
        }
      ]
    },
    {
      id: 'n3',
      type: 'dataclass',
      className: 'Customer',
      x: 500,
      y: 250,
      width: 220,
      sections: [
        {
          title: 'Fields',
          items: [
            'id: str',
            'name: str',
            'email: str',
            'orders: List[Order]'
          ]
        },
        {
          title: 'Methods',
          items: [
            'add_order(order: Order)',
            'get_total_spent() -> float'
          ]
        }
      ]
    },
    {
      id: 'n4',
      type: 'dataclass',
      className: 'Order',
      x: 800,
      y: 250,
      width: 220,
      sections: [
        {
          title: 'Fields',
          items: [
            'id: str',
            'customer_id: str',
            'items: List[OrderItem]',
            'status: OrderStatus',
            'created_at: datetime'
          ]
        },
        {
          title: 'Methods',
          items: [
            'calculate_total() -> float',
            'add_item(item: OrderItem)',
            'cancel()'
          ]
        }
      ]
    },
    {
      id: 'n5',
      type: 'dataclass',
      className: 'OrderItem',
      x: 800,
      y: 550,
      width: 220,
      sections: [
        {
          title: 'Fields',
          items: [
            'product_id: str',
            'quantity: int',
            'unit_price: float'
          ]
        },
        {
          title: 'Methods',
          items: [
            'get_subtotal() -> float'
          ]
        }
      ]
    },
    {
      id: 'n6',
      type: 'enum',
      className: 'OrderStatus',
      x: 1100,
      y: 300,
      width: 180,
      sections: [
        {
          title: 'Values',
          items: [
            'PENDING',
            'PROCESSING',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED'
          ]
        }
      ]
    },
    {
      id: 'n7',
      type: 'class',
      className: 'OrderService',
      x: 500,
      y: 550,
      width: 240,
      sections: [
        {
          title: 'Methods',
          items: [
            'create_order(customer, items)',
            'get_order(order_id) -> Order',
            'update_status(order_id, status)',
            'cancel_order(order_id)',
            'get_orders_by_customer(id)'
          ]
        }
      ]
    },
    {
      id: 'n8',
      type: 'interface',
      className: 'PaymentProcessor',
      x: 200,
      y: 550,
      width: 240,
      sections: [
        {
          title: 'Methods',
          items: [
            'process_payment(amount, method)',
            'refund_payment(transaction_id)',
            'validate_payment(details) -> bool'
          ]
        }
      ]
    }
  ],
  arrows: [
    { id: 'a1', from: 'n2', to: 'n1', type: 'inheritance' },
    { id: 'a2', from: 'n3', to: 'n1', type: 'inheritance' },
    { id: 'a3', from: 'n4', to: 'n1', type: 'inheritance' },
    { id: 'a4', from: 'n3', to: 'n4', type: 'association' },
    { id: 'a5', from: 'n4', to: 'n5', type: 'composition' },
    { id: 'a6', from: 'n4', to: 'n6', type: 'association' },
    { id: 'a7', from: 'n5', to: 'n2', type: 'association' },
    { id: 'a8', from: 'n7', to: 'n4', type: 'dependency' }
  ]
};
