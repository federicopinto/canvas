import { writable } from 'svelte/store';

export type ArrowType = 'inheritance' | 'composition' | 'aggregation' | 'dependency';

export interface Arrow {
  id: string;
  from: string; // node ID
  to: string;   // node ID
  type: ArrowType;
}

function createArrowStore() {
  const { subscribe, set, update } = writable<Arrow[]>([]);

  return {
    subscribe,
    add: (arrow: Arrow) => update(arrows => [...arrows, arrow]),
    remove: (id: string) => update(arrows => arrows.filter(a => a.id !== id)),
    set
  };
}

export const arrows = createArrowStore();
