import { writable } from 'svelte/store';

function createSelectionStore() {
  const { subscribe, set, update } = writable<Set<string>>(new Set());

  return {
    subscribe,
    select: (id: string) => set(new Set([id])),
    toggle: (id: string) => {
      update(sel => {
        const newSet = new Set(sel);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    },
    clear: () => set(new Set()),
    isSelected: (id: string, $selection: Set<string>) => $selection.has(id)
  };
}

export const selection = createSelectionStore();
