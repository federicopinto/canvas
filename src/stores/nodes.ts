import { writable } from 'svelte/store';

interface Node {
  id: string;
  type: 'class' | 'dataclass' | 'protocol';
  name: string;
  x: number;
  y: number;
  width: number;
  sections: Section[];
}

interface Section {
  id: string;
  title: string;
  items: string[];
  expanded: boolean;
  children: Section[];
}

function createNodeStore() {
  const { subscribe, set, update } = writable<Node[]>([]);

  return {
    subscribe,
    add: (node: Node) => update(nodes => [...nodes, node]),
    remove: (id: string) => update(nodes => nodes.filter(n => n.id !== id)),
    updatePosition: (id: string, x: number, y: number) => {
      update(nodes => nodes.map(n => n.id === id ? { ...n, x, y } : n));
    },
    updateWidth: (id: string, width: number) => {
      update(nodes => nodes.map(n => n.id === id ? { ...n, width } : n));
    },
    toggleSection: (nodeId: string, sectionId: string) => {
      update(nodes => nodes.map(n => {
        if (n.id !== nodeId) return n;
        return {
          ...n,
          sections: toggleSectionRecursive(n.sections, sectionId)
        };
      }));
    },
    set
  };
}

function toggleSectionRecursive(sections: Section[], targetId: string): Section[] {
  return sections.map(section => {
    if (section.id === targetId) {
      return { ...section, expanded: !section.expanded };
    }
    if (section.children.length > 0) {
      return {
        ...section,
        children: toggleSectionRecursive(section.children, targetId)
      };
    }
    return section;
  });
}

export const nodes = createNodeStore();
export type { Node, Section };

// Drag state tracking
interface DragState {
  isDragging: boolean;
  nodeId: string | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export const dragState = writable<DragState>({
  isDragging: false,
  nodeId: null,
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0
});
