import { create } from 'zustand';

interface LayoutState {
  toolbarOpen: boolean;
  toggleToolbar: () => void;
  paletteEditorOpen: boolean;
  openPaletteEditor: () => void;
  closePaletteEditor: () => void;
  mirrorX: boolean;
  mirrorY: boolean;
  toggleMirrorX: () => void;
  toggleMirrorY: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  toolbarOpen: true,
  toggleToolbar: () => set((s) => ({ toolbarOpen: !s.toolbarOpen })),
  paletteEditorOpen: false,
  openPaletteEditor: () => set({ paletteEditorOpen: true }),
  closePaletteEditor: () => set({ paletteEditorOpen: false }),
  mirrorX: false,
  mirrorY: false,
  toggleMirrorX: () => set((s) => ({ mirrorX: !s.mirrorX })),
  toggleMirrorY: () => set((s) => ({ mirrorY: !s.mirrorY })),
}));
