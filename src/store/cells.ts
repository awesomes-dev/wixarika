import { create } from 'zustand';

/** Key for (q, r). */
export function cellKey(q: number, r: number): string {
  return `${q},${r}`;
}

/** Cell at (q, r) with a palette color id. */
export interface Cell {
  q: number;
  r: number;
  colorId: string;
}

interface CellsState {
  /** "q,r" -> colorId */
  cells: Record<string, string>;
  has: (q: number, r: number) => boolean;
  getColorId: (q: number, r: number) => string | null;
  setCell: (q: number, r: number, colorId: string) => void;
  removeCell: (q: number, r: number) => void;
  /** Toggle: remove if present, otherwise set with colorIdWhenAdding. */
  toggle: (q: number, r: number, colorIdWhenAdding: string) => void;
  /** Remove all cells whose colorId is not in validIds (e.g. after removing a color from the palette). */
  retainOnlyColorIds: (validIds: Set<string>) => void;
}

export const useCellsStore = create<CellsState>((set, get) => ({
  cells: {},
  has: (q, r) => cellKey(q, r) in get().cells,
  getColorId: (q, r) => get().cells[cellKey(q, r)] ?? null,
  setCell: (q, r, colorId) =>
    set((s) => ({
      cells: { ...s.cells, [cellKey(q, r)]: colorId },
    })),
  removeCell: (q, r) =>
    set((s) => {
      const k = cellKey(q, r);
      if (!(k in s.cells)) return s;
      const next = { ...s.cells };
      delete next[k];
      return { cells: next };
    }),
  toggle: (q, r, colorIdWhenAdding) =>
    set((s) => {
      const k = cellKey(q, r);
      const next = { ...s.cells };
      if (k in next) {
        delete next[k];
      } else {
        next[k] = colorIdWhenAdding;
      }
      return { cells: next };
    }),
  retainOnlyColorIds: (validIds) =>
    set((s) => {
      let changed = false;
      const next = { ...s.cells };
      for (const k of Object.keys(next)) {
        if (!validIds.has(next[k])) {
          delete next[k];
          changed = true;
        }
      }
      return changed ? { cells: next } : s;
    }),
}));
