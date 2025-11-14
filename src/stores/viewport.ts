import { writable } from 'svelte/store';

interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

function createViewport() {
  const { subscribe, set, update } = writable<ViewportState>({
    x: 0,
    y: 0,
    scale: 1
  });

  return {
    subscribe,
    set,
    pan: (deltaX: number, deltaY: number) => {
      update(state => ({
        ...state,
        x: state.x + deltaX,
        y: state.y + deltaY
      }));
    },
    zoom: (delta: number, centerX: number, centerY: number) => {
      update(state => {
        const newScale = Math.max(0.1, Math.min(4, state.scale * (1 + delta)));
        const scaleFactor = newScale / state.scale;

        return {
          x: state.x - (centerX - state.x) * (scaleFactor - 1),
          y: state.y - (centerY - state.y) * (scaleFactor - 1),
          scale: newScale
        };
      });
    },
    reset: () => set({ x: 0, y: 0, scale: 1 }),

    // Helper functions for screen-to-canvas coordinate conversion
    screenToCanvas: (screenX: number, screenY: number, state: ViewportState) => {
      return {
        x: (screenX - state.x) / state.scale,
        y: (screenY - state.y) / state.scale
      };
    },

    canvasToScreen: (canvasX: number, canvasY: number, state: ViewportState) => {
      return {
        x: canvasX * state.scale + state.x,
        y: canvasY * state.scale + state.y
      };
    }
  };
}

export const viewport = createViewport();
