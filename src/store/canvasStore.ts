import { create } from 'zustand';
import type { CanvasState, Node, Arrow, ViewportState, Position, Size, Section } from '../types';

interface CanvasStore extends CanvasState {
  // Node actions
  setNodes: (nodes: Node[]) => void;
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
  updateNodePosition: (nodeId: string, position: Position) => void;
  updateNodeSize: (nodeId: string, size: Size) => void;
  toggleSection: (nodeId: string, sectionId: string) => void;

  // Arrow actions
  setArrows: (arrows: Arrow[]) => void;

  // Viewport actions
  setViewport: (viewport: Partial<ViewportState>) => void;

  // Selection actions
  setSelectedNodeIds: (ids: string[]) => void;
  addSelectedNodeId: (id: string) => void;
  removeSelectedNodeId: (id: string) => void;
  toggleSelectedNodeId: (id: string) => void;
  clearSelection: () => void;
  setSelectedArrowId: (id: string | null) => void;

  // Drag actions
  startDrag: (nodeId: string, position: Position, offset: Position) => void;
  updateDrag: (position: Position) => void;
  endDrag: () => void;

  // Resize actions
  startResize: (nodeId: string, handle: string, size: Size, position: Position) => void;
  updateResize: (size: Size, position: Position) => void;
  endResize: () => void;

  // Pan actions
  setIsPanning: (isPanning: boolean) => void;

  // Utility actions
  reset: () => void;
  loadData: (data: { nodes: Node[]; arrows: Arrow[] }) => void;
}

const initialState: CanvasState = {
  nodes: [],
  arrows: [],
  viewport: {
    scale: 1,
    translateX: 0,
    translateY: 0,
  },
  selectedNodeIds: [],
  selectedArrowId: null,
  dragState: {
    isDragging: false,
    nodeId: null,
    startPosition: null,
    offset: null,
  },
  resizeState: {
    isResizing: false,
    nodeId: null,
    handle: null,
    startSize: null,
    startPosition: null,
  },
  isPanning: false,
};

// Helper function to toggle section collapse state recursively
const toggleSectionRecursive = (sections: Section[], sectionId: string): Section[] => {
  return sections.map((section) => {
    if (section.id === sectionId) {
      return { ...section, isCollapsed: !section.isCollapsed };
    }
    if (section.children) {
      return {
        ...section,
        children: toggleSectionRecursive(section.children, sectionId),
      };
    }
    return section;
  });
};

export const useCanvasStore = create<CanvasStore>((set) => ({
  ...initialState,

  // Node actions
  setNodes: (nodes) => set({ nodes }),

  updateNode: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
    })),

  updateNodePosition: (nodeId, position) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, position } : node
      ),
    })),

  updateNodeSize: (nodeId, size) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, size } : node
      ),
    })),

  toggleSection: (nodeId, sectionId) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, sections: toggleSectionRecursive(node.sections, sectionId) }
          : node
      ),
    })),

  // Arrow actions
  setArrows: (arrows) => set({ arrows }),

  // Viewport actions
  setViewport: (viewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...viewport },
    })),

  // Selection actions
  setSelectedNodeIds: (selectedNodeIds) => set({ selectedNodeIds }),

  addSelectedNodeId: (id) =>
    set((state) => ({
      selectedNodeIds: [...state.selectedNodeIds, id],
    })),

  removeSelectedNodeId: (id) =>
    set((state) => ({
      selectedNodeIds: state.selectedNodeIds.filter((nodeId) => nodeId !== id),
    })),

  toggleSelectedNodeId: (id) =>
    set((state) => ({
      selectedNodeIds: state.selectedNodeIds.includes(id)
        ? state.selectedNodeIds.filter((nodeId) => nodeId !== id)
        : [...state.selectedNodeIds, id],
    })),

  clearSelection: () => set({ selectedNodeIds: [], selectedArrowId: null }),

  setSelectedArrowId: (selectedArrowId) => set({ selectedArrowId }),

  // Drag actions
  startDrag: (nodeId, startPosition, offset) =>
    set({
      dragState: {
        isDragging: true,
        nodeId,
        startPosition,
        offset,
      },
    }),

  updateDrag: (position) =>
    set((state) => {
      if (!state.dragState.isDragging || !state.dragState.nodeId) return state;

      const offset = state.dragState.offset || { x: 0, y: 0 };
      const newPosition = {
        x: position.x - offset.x,
        y: position.y - offset.y,
      };

      // Update position for all selected nodes
      const selectedIds = state.selectedNodeIds.includes(state.dragState.nodeId)
        ? state.selectedNodeIds
        : [state.dragState.nodeId];

      const draggedNode = state.nodes.find((n) => n.id === state.dragState.nodeId);
      if (!draggedNode) return state;

      const deltaX = newPosition.x - draggedNode.position.x;
      const deltaY = newPosition.y - draggedNode.position.y;

      return {
        nodes: state.nodes.map((node) =>
          selectedIds.includes(node.id)
            ? {
                ...node,
                position: {
                  x: node.id === state.dragState.nodeId
                    ? newPosition.x
                    : node.position.x + deltaX,
                  y: node.id === state.dragState.nodeId
                    ? newPosition.y
                    : node.position.y + deltaY,
                },
              }
            : node
        ),
      };
    }),

  endDrag: () =>
    set({
      dragState: {
        isDragging: false,
        nodeId: null,
        startPosition: null,
        offset: null,
      },
    }),

  // Resize actions
  startResize: (nodeId, handle, startSize, startPosition) =>
    set({
      resizeState: {
        isResizing: true,
        nodeId,
        handle,
        startSize,
        startPosition,
      },
    }),

  updateResize: (size, position) =>
    set((state) => {
      if (!state.resizeState.isResizing || !state.resizeState.nodeId) return state;

      return {
        nodes: state.nodes.map((node) =>
          node.id === state.resizeState.nodeId
            ? { ...node, size, position }
            : node
        ),
      };
    }),

  endResize: () =>
    set({
      resizeState: {
        isResizing: false,
        nodeId: null,
        handle: null,
        startSize: null,
        startPosition: null,
      },
    }),

  // Pan actions
  setIsPanning: (isPanning) => set({ isPanning }),

  // Utility actions
  reset: () => set(initialState),

  loadData: (data) => set({ nodes: data.nodes, arrows: data.arrows }),
}));
