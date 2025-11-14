import { writable } from 'svelte/store';
import type { ViewportState } from '../types';

/**
 * Store for viewport state (pan and zoom)
 */
export const viewportState = writable<ViewportState>({
  x: 0,
  y: 0,
  scale: 1,
});

/**
 * Update viewport position
 */
export function setViewportPosition(x: number, y: number) {
  viewportState.update((state) => ({ ...state, x, y }));
}

/**
 * Update viewport scale (zoom)
 */
export function setViewportScale(scale: number) {
  viewportState.update((state) => ({ ...state, scale }));
}

/**
 * Reset viewport to default state
 */
export function resetViewport() {
  viewportState.set({ x: 0, y: 0, scale: 1 });
}
