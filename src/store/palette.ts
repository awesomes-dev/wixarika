import { create } from 'zustand';

export interface PaletteColor {
  id: string;
  hex: string;
}

const FALLBACK_HEX = '#e0e0e0';
const DEFAULT_COLORS: PaletteColor[] = [
  { id: crypto.randomUUID(), hex: FALLBACK_HEX },
];

interface PaletteState {
  colors: PaletteColor[];
  selectedId: string | null;
  addColor: (hex?: string) => void;
  selectColor: (id: string | null) => void;
  removeColor: (id: string) => void;
  /** Replace entire palette (e.g. after editing in modal). Keeps selectedId if still present. */
  setColors: (colors: PaletteColor[]) => void;
}

export const usePaletteStore = create<PaletteState>((set) => ({
  colors: DEFAULT_COLORS,
  selectedId: DEFAULT_COLORS[0]?.id ?? null,
  addColor: (hex = FALLBACK_HEX) =>
    set((s) => {
      const newColor: PaletteColor = { id: crypto.randomUUID(), hex };
      return {
        colors: [...s.colors, newColor],
        selectedId: newColor.id,
      };
    }),
  selectColor: (id) => set((s) => ({ selectedId: id })),
  removeColor: (id) =>
    set((s) => {
      const next = s.colors.filter((c) => c.id !== id);
      const nextSelected =
        s.selectedId === id
          ? next[0]?.id ?? null
          : s.selectedId;
      return { colors: next, selectedId: nextSelected };
    }),
  setColors: (colors) =>
    set((s) => {
      const ids = new Set(colors.map((c) => c.id));
      const selectedId = s.selectedId && ids.has(s.selectedId) ? s.selectedId : colors[0]?.id ?? null;
      return { colors: [...colors], selectedId };
    }),
}));
