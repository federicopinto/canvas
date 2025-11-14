# Demo Data Guide

## Overview

The demo data file (`public/demo-data.json`) defines the initial diagram that loads when you start the application. This guide explains the JSON schema, provides examples, and shows you how to create your own custom diagrams.

## Quick Start

**Default demo:** E-commerce system with 10 nodes and 11 relationships

**Location:** `/home/user/canvas/public/demo-data.json`

**To customize:** Edit this file and reload the page (Vite will auto-refresh)

---

## JSON Schema

### Top-Level Structure

```json
{
  "nodes": [/* Array of Node objects */],
  "arrows": [/* Array of Arrow objects */]
}
```

---

## Node Schema

### Basic Node Structure

```json
{
  "id": "unique-identifier",
  "type": "class" | "dataclass" | "protocol",
  "label": "ClassName",
  "position": { "x": 100, "y": 200 },
  "size": { "width": 280, "height": 300 },
  "sections": [/* Array of Section objects */],
  "vscodeLink": "vscode://file/path/to/file.py:42" (optional)
}
```

### Node Types

#### 1. Class (Regular Python Class)

```json
{
  "id": "inventory",
  "type": "class",
  "label": "InventoryManager",
  "position": { "x": 100, "y": 800 },
  "size": { "width": 300, "height": 340 },
  "sections": [/* ... */]
}
```

**Visual appearance:**
- Header background: Blue (#DAE8FC)
- Border: Solid blue (#6C8EBF)
- Badge: "class" in gray italic

#### 2. Dataclass

```json
{
  "id": "product",
  "type": "dataclass",
  "label": "Product",
  "position": { "x": 150, "y": 400 },
  "size": { "width": 280, "height": 320 },
  "sections": [/* ... */]
}
```

**Visual appearance:**
- Header background: Purple (#E1D5E7)
- Border: Solid purple (#9673A6)
- Badge: "@dataclass" in purple

#### 3. Protocol

```json
{
  "id": "serializable",
  "type": "protocol",
  "label": "Serializable",
  "position": { "x": 400, "y": 100 },
  "size": { "width": 280, "height": 200 },
  "sections": [/* ... */]
}
```

**Visual appearance:**
- Header background: Yellow (#FFF2CC)
- Border: **Dashed** yellow (#D6B656)
- Badge: "«protocol»" in orange italic

### Node Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ Yes | Unique identifier (used for arrows) |
| `type` | enum | ✅ Yes | One of: "class", "dataclass", "protocol" |
| `label` | string | ✅ Yes | Class name displayed in header |
| `position` | object | ✅ Yes | `{ x: number, y: number }` in canvas coordinates |
| `size` | object | ✅ Yes | `{ width: number, height: number }` in pixels |
| `sections` | array | ✅ Yes | Array of Section objects (can be empty) |
| `vscodeLink` | string | ❌ No | VSCode deep link (future feature) |

### Position Guidelines

- **Origin:** Top-left corner is (0, 0)
- **Recommended spacing:** 120px horizontal, 100px vertical between nodes
- **Canvas is infinite:** Any position is valid
- **Auto-layout will recalculate:** Initial positions are starting points

### Size Guidelines

- **Default width:** 280px
- **Min width:** 200px
- **Max width:** 600px
- **Height:** Auto-calculated based on content, or set manually
- **Min height:** 60px (header only)

---

## Section Schema

### Basic Section Structure

```json
{
  "id": "fields-1",
  "label": "Fields",
  "isCollapsed": false,
  "items": [/* Array of SectionItem objects */],
  "children": [/* Array of nested Section objects */] (optional)
}
```

### Section Example

```json
{
  "id": "fields-1",
  "label": "Fields",
  "isCollapsed": false,
  "items": [
    { "id": "id", "label": "id", "type": "str" },
    { "id": "name", "label": "name", "type": "str" },
    { "id": "price", "label": "price", "type": "Decimal" }
  ]
}
```

### Nested Sections

Sections can contain **nested child sections** up to 4 levels deep:

```json
{
  "id": "fields-1",
  "label": "Fields",
  "isCollapsed": false,
  "items": [
    { "id": "x", "label": "x", "type": "int" },
    { "id": "y", "label": "y", "type": "str" }
  ],
  "children": [
    {
      "id": "metadata",
      "label": "Metadata",
      "isCollapsed": false,
      "items": [
        { "id": "created_at", "label": "created_at", "type": "datetime" },
        { "id": "author", "label": "author", "type": "str" }
      ]
    }
  ]
}
```

**Visual hierarchy:**
- Level 1: No indentation
- Level 2: 16px indent
- Level 3: 32px indent
- Level 4: 48px indent

### Section Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ Yes | Unique within node |
| `label` | string | ✅ Yes | Section header text (e.g., "Fields", "Methods") |
| `isCollapsed` | boolean | ✅ Yes | Initial state (true = collapsed, false = expanded) |
| `items` | array | ✅ Yes | Array of SectionItem objects (can be empty) |
| `children` | array | ❌ No | Nested sections (optional, for hierarchical data) |

### Common Section Labels

- **"Fields"** - Class attributes/properties
- **"Methods"** - Class methods/functions
- **"Events"** - Event handlers
- **"Metadata"** - Additional info (creation date, author, etc.)
- **"Properties"** - Python @property decorators
- **"Class Methods"** - @classmethod methods
- **"Static Methods"** - @staticmethod methods

---

## Section Item Schema

### Basic Item Structure

```json
{
  "id": "field_name",
  "label": "field_name: str",
  "type": "str",
  "vscodeLink": "vscode://file/path.py:42" (optional)
}
```

### Item Examples

#### Field

```json
{ "id": "name", "label": "name", "type": "str" }
```

Renders as: `name: str`

#### Method

```json
{ "id": "calculate", "label": "calculate(x: int) -> float", "type": "method" }
```

Renders as: `calculate(x: int) -> float`

#### Property with Complex Type

```json
{ "id": "items", "label": "items", "type": "List[OrderItem]" }
```

Renders as: `items: List[OrderItem]`

### Item Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ Yes | Unique within section |
| `label` | string | ✅ Yes | Display text (field/method signature) |
| `type` | string | ❌ No | Type annotation (displayed after label) |
| `vscodeLink` | string | ❌ No | VSCode deep link (future feature) |

### Label Formatting

**For fields:**
- Simple: `"label": "name"`
- With type inline: `"label": "name: str"`
- Recommend: Use `label` for name, `type` for annotation

**For methods:**
- Include full signature: `"label": "method_name(arg: type) -> ReturnType"`
- Can omit type hints: `"label": "method_name(arg)"`

---

## Arrow Schema

### Basic Arrow Structure

```json
{
  "id": "arrow-1",
  "type": "inheritance" | "composition" | "aggregation" | "dependency",
  "source": "source-node-id",
  "target": "target-node-id",
  "label": "optional label text" (optional)
}
```

### Arrow Types

#### 1. Inheritance (extends, inherits from)

```json
{
  "id": "arrow-1",
  "type": "inheritance",
  "source": "product",
  "target": "serializable"
}
```

**Visual:**
- Line: Solid, dark gray (#2C3E50)
- Head: Hollow triangle (pointing to parent)
- Meaning: "Product extends Serializable"

#### 2. Composition (strong ownership)

```json
{
  "id": "arrow-3",
  "type": "composition",
  "source": "inventory",
  "target": "product"
}
```

**Visual:**
- Line: Solid, slate (#34495E)
- Tail: **Filled diamond** (at source)
- Head: Arrow (at target)
- Meaning: "Inventory owns Product" (if Inventory is deleted, Products are too)

#### 3. Aggregation (weak ownership)

```json
{
  "id": "arrow-5",
  "type": "aggregation",
  "source": "order-processor",
  "target": "inventory"
}
```

**Visual:**
- Line: Solid, gray (#7F8C8D)
- Tail: **Hollow diamond** (at source)
- Head: Arrow (at target)
- Meaning: "OrderProcessor has-a Inventory" (shared ownership)

#### 4. Dependency (uses, depends on)

```json
{
  "id": "arrow-7",
  "type": "dependency",
  "source": "order",
  "target": "customer"
}
```

**Visual:**
- Line: **Dashed**, light gray (#95A5A6)
- Head: Arrow (at target)
- Meaning: "Order uses/depends on Customer"

### Arrow Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ Yes | Unique identifier |
| `type` | enum | ✅ Yes | One of: "inheritance", "composition", "aggregation", "dependency" |
| `source` | string | ✅ Yes | ID of source node (where arrow starts) |
| `target` | string | ✅ Yes | ID of target node (where arrow ends) |
| `label` | string | ❌ No | Text label on arrow (future feature) |

### Arrow Direction

**Important:** Arrow direction depends on type

- **Inheritance:** Arrow points from child → parent (child extends parent)
- **Composition:** Arrow points from container → contained (owner → owned)
- **Aggregation:** Arrow points from container → contained (has-a relationship)
- **Dependency:** Arrow points from dependent → dependency (uses relationship)

---

## Complete Example

### Simple Diagram (3 nodes, 2 arrows)

```json
{
  "nodes": [
    {
      "id": "animal",
      "type": "protocol",
      "label": "Animal",
      "position": { "x": 300, "y": 100 },
      "size": { "width": 280, "height": 150 },
      "sections": [
        {
          "id": "methods",
          "label": "Methods",
          "isCollapsed": false,
          "items": [
            { "id": "speak", "label": "speak() -> str", "type": "method" }
          ]
        }
      ]
    },
    {
      "id": "dog",
      "type": "class",
      "label": "Dog",
      "position": { "x": 150, "y": 350 },
      "size": { "width": 280, "height": 220 },
      "sections": [
        {
          "id": "fields",
          "label": "Fields",
          "isCollapsed": false,
          "items": [
            { "id": "name", "label": "name", "type": "str" },
            { "id": "breed", "label": "breed", "type": "str" }
          ]
        },
        {
          "id": "methods",
          "label": "Methods",
          "isCollapsed": false,
          "items": [
            { "id": "speak", "label": "speak() -> str", "type": "method" }
          ]
        }
      ]
    },
    {
      "id": "owner",
      "type": "dataclass",
      "label": "Owner",
      "position": { "x": 500, "y": 350 },
      "size": { "width": 280, "height": 180 },
      "sections": [
        {
          "id": "fields",
          "label": "Fields",
          "isCollapsed": false,
          "items": [
            { "id": "name", "label": "name", "type": "str" },
            { "id": "dog", "label": "dog", "type": "Dog" }
          ]
        }
      ]
    }
  ],
  "arrows": [
    {
      "id": "arrow-1",
      "type": "inheritance",
      "source": "dog",
      "target": "animal"
    },
    {
      "id": "arrow-2",
      "type": "aggregation",
      "source": "owner",
      "target": "dog"
    }
  ]
}
```

**This creates:**
- Protocol "Animal" at top (yellow, dashed border)
- Class "Dog" inheriting from Animal (blue, solid border)
- Dataclass "Owner" with aggregation to Dog (purple, solid border)

---

## E-Commerce Demo (Default)

The default demo (`public/demo-data.json`) contains:

### Nodes (10 total)

| ID | Type | Label | Purpose |
|----|------|-------|---------|
| `serializable` | protocol | Serializable | Top-level interface |
| `product` | dataclass | Product | Product data |
| `order` | dataclass | Order | Order data |
| `customer` | dataclass | Customer | Customer data |
| `inventory` | class | InventoryManager | Inventory logic |
| `order-processor` | class | OrderProcessor | Order processing logic |
| `payment` | class | PaymentGateway | Payment handling |
| `notification` | class | NotificationService | Notifications |
| `analytics` | class | AnalyticsEngine | Analytics tracking |
| `cache` | class | CacheManager | Caching layer |

### Arrows (11 total)

| Source | Target | Type | Meaning |
|--------|--------|------|---------|
| Product | Serializable | inheritance | Product implements Serializable |
| Order | Serializable | inheritance | Order implements Serializable |
| InventoryManager | Product | composition | Inventory owns Products |
| OrderProcessor | Order | composition | OrderProcessor owns Orders |
| OrderProcessor | InventoryManager | aggregation | OrderProcessor uses Inventory |
| OrderProcessor | PaymentGateway | aggregation | OrderProcessor uses Payment |
| Order | Customer | dependency | Order depends on Customer |
| OrderProcessor | NotificationService | dependency | OrderProcessor uses Notification |
| AnalyticsEngine | Order | dependency | Analytics tracks Orders |
| NotificationService | Customer | dependency | Notification sends to Customer |
| InventoryManager | CacheManager | dependency | Inventory uses Cache |

---

## Customization Tips

### 1. Creating Your Own Diagram

**Step-by-step:**

1. Copy `public/demo-data.json` to `public/demo-data.json.backup`
2. Edit `public/demo-data.json` with your nodes and arrows
3. Reload the page (Vite auto-refreshes)
4. Use "Auto Arrange" button to organize layout
5. Manually adjust positions as needed
6. Export PNG for documentation

### 2. Layout Strategies

**Vertical hierarchy (inheritance):**
- Place parent nodes at top (y=100)
- Children below (y=400)
- Grandchildren further down (y=700)

**Horizontal grouping (modules):**
- Group related classes horizontally
- Separate layers vertically (data, logic, services)

**Central node pattern:**
- Place main class in center
- Dependencies around edges

### 3. Naming Conventions

**IDs:**
- Use lowercase with hyphens: `"order-processor"`
- Or camelCase: `"orderProcessor"`
- Must be unique across all nodes

**Labels:**
- Use PascalCase: `"OrderProcessor"`
- Match actual class names from code

**Section IDs:**
- Use descriptive names: `"fields-1"`, `"methods-2"`
- Include number suffix for uniqueness

### 4. Collapse Strategy

**For large diagrams:**
- Start with important sections expanded: `"isCollapsed": false`
- Collapse implementation details: `"isCollapsed": true`
- Collapse nested sections by default

**Example:**
```json
{
  "id": "methods",
  "label": "Methods",
  "isCollapsed": false,  // Keep methods visible
  "items": [/* ... */]
},
{
  "id": "private-methods",
  "label": "Private Methods",
  "isCollapsed": true,  // Hide private methods by default
  "items": [/* ... */]
}
```

### 5. Section Organization

**Recommended order:**
1. Fields/Properties (most important)
2. Methods (public first, private last)
3. Events
4. Metadata (creation info, etc.)

**Example:**
```json
"sections": [
  { "id": "fields", "label": "Fields", /* ... */ },
  { "id": "properties", "label": "Properties", /* ... */ },
  { "id": "methods", "label": "Methods", /* ... */ },
  { "id": "events", "label": "Events", /* ... */ },
  { "id": "metadata", "label": "Metadata", "isCollapsed": true /* ... */ }
]
```

---

## Validation

### Common Errors

**1. Duplicate IDs**
```json
// ❌ Error: Two nodes with same ID
{ "id": "node1", ... }
{ "id": "node1", ... }  // Duplicate!

// ✅ Fixed
{ "id": "node1", ... }
{ "id": "node2", ... }
```

**2. Invalid Arrow References**
```json
// ❌ Error: Arrow refers to non-existent node
{
  "source": "node1",
  "target": "node99"  // Node "node99" doesn't exist!
}

// ✅ Fixed: Ensure target node exists
```

**3. Invalid Type**
```json
// ❌ Error: Invalid node type
{ "type": "interface" }  // Not a valid type!

// ✅ Fixed
{ "type": "protocol" }  // Valid: class, dataclass, or protocol
```

**4. Missing Required Fields**
```json
// ❌ Error: Missing position
{
  "id": "node1",
  "type": "class",
  "label": "MyClass"
  // Missing: position, size, sections
}

// ✅ Fixed
{
  "id": "node1",
  "type": "class",
  "label": "MyClass",
  "position": { "x": 100, "y": 100 },
  "size": { "width": 280, "height": 200 },
  "sections": []
}
```

---

## Advanced Patterns

### 1. Multi-Level Inheritance

```json
{
  "arrows": [
    { "id": "a1", "type": "inheritance", "source": "child", "target": "parent" },
    { "id": "a2", "type": "inheritance", "source": "parent", "target": "grandparent" },
    { "id": "a3", "type": "inheritance", "source": "grandparent", "target": "protocol" }
  ]
}
```

**Auto-layout will create vertical hierarchy automatically.**

### 2. Composition Chain

```json
{
  "arrows": [
    { "id": "a1", "type": "composition", "source": "service", "target": "manager" },
    { "id": "a2", "type": "composition", "source": "manager", "target": "repository" },
    { "id": "a3", "type": "composition", "source": "repository", "target": "database" }
  ]
}
```

**Creates layered architecture visualization.**

### 3. Circular Dependencies (Allowed)

```json
{
  "arrows": [
    { "id": "a1", "type": "dependency", "source": "node1", "target": "node2" },
    { "id": "a2", "type": "dependency", "source": "node2", "target": "node1" }
  ]
}
```

**The app handles circular arrows gracefully (arrows may overlap).**

### 4. Deeply Nested Sections

```json
{
  "sections": [
    {
      "id": "level1",
      "label": "Level 1",
      "isCollapsed": false,
      "items": [{ "id": "item1", "label": "item1" }],
      "children": [
        {
          "id": "level2",
          "label": "Level 2",
          "isCollapsed": false,
          "items": [{ "id": "item2", "label": "item2" }],
          "children": [
            {
              "id": "level3",
              "label": "Level 3",
              "isCollapsed": false,
              "items": [{ "id": "item3", "label": "item3" }],
              "children": [
                {
                  "id": "level4",
                  "label": "Level 4 (max depth)",
                  "isCollapsed": false,
                  "items": [{ "id": "item4", "label": "item4" }]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**Max nesting: 4 levels (as per spec).**

---

## Programmatic Generation

### From Python Code

You can generate this JSON from actual Python code:

```python
import json
import ast

def generate_demo_data(python_file):
    with open(python_file) as f:
        tree = ast.parse(f.read())

    nodes = []
    arrows = []

    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            # Generate node from class definition
            class_node = {
                "id": node.name.lower(),
                "type": "class",  # Detect dataclass/protocol
                "label": node.name,
                "position": {"x": 0, "y": 0},  # Auto-arrange will fix
                "size": {"width": 280, "height": 200},
                "sections": extract_sections(node)
            }
            nodes.append(class_node)

            # Generate arrows from base classes
            for base in node.bases:
                if isinstance(base, ast.Name):
                    arrows.append({
                        "id": f"arrow-{len(arrows)}",
                        "type": "inheritance",
                        "source": node.name.lower(),
                        "target": base.id.lower()
                    })

    return {"nodes": nodes, "arrows": arrows}

# Generate from your Python code
data = generate_demo_data("my_classes.py")
with open("public/demo-data.json", "w") as f:
    json.dump(data, f, indent=2)
```

---

## JSON Schema (TypeScript)

For reference, here's the TypeScript schema:

```typescript
interface DemoData {
  nodes: Node[];
  arrows: Arrow[];
}

interface Node {
  id: string;
  type: 'class' | 'dataclass' | 'protocol';
  label: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  sections: Section[];
  vscodeLink?: string;
}

interface Section {
  id: string;
  label: string;
  isCollapsed: boolean;
  items: SectionItem[];
  children?: Section[];
}

interface SectionItem {
  id: string;
  label: string;
  type?: string;
  vscodeLink?: string;
}

interface Arrow {
  id: string;
  type: 'inheritance' | 'composition' | 'aggregation' | 'dependency';
  source: string;
  target: string;
  label?: string;
}
```

---

## Troubleshooting

### Diagram Doesn't Load

**Check:**
1. JSON is valid (use JSONLint.com)
2. File is at `public/demo-data.json`
3. Browser console for errors (F12)

### Arrows Don't Appear

**Check:**
1. Source and target IDs match node IDs exactly
2. Both nodes exist in the nodes array
3. IDs are strings (in quotes)

### Layout Looks Wrong

**Solution:**
1. Click "Auto Arrange" button (⚡)
2. Manually adjust positions
3. Increase spacing between nodes

### Sections Don't Collapse

**Check:**
1. Section has valid `id`
2. `isCollapsed` is boolean (true/false, not string)
3. Section is clickable (not hovering over items)

---

## Resources

- **JSON Validator:** https://jsonlint.com/
- **Example Diagrams:** See `/home/user/canvas/public/demo-data.json`
- **Type Definitions:** See `/home/user/canvas/src/types/index.ts`
- **Programmatic API:** See `/home/user/canvas/src/store/canvasStore.ts`

---

**Happy diagramming!** 🎨

For more help, see:
- `README.md` - User guide
- `ARCHITECTURE.md` - Technical details
- `QUICK-REFERENCE.md` - Common tasks
