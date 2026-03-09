import { create } from 'zustand';

export const MIN_SCALE = 0.25;
export const MAX_SCALE = 4;
const SCALE_STEP = 1.25;

interface CanvasState {
  stagePosition: { x: number; y: number };
  scale: number;
  setStagePosition: (pos: { x: number; y: number }) => void;
  setScale: (scale: number) => void;
  goToCenter: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  stagePosition: { x: 0, y: 0 },
  scale: 1,
  setStagePosition: (pos) => set({ stagePosition: pos }),
  setScale: (s) => set({ scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, s)) }),
  goToCenter: () => set({ stagePosition: { x: 0, y: 0 } }),
  zoomIn: () =>
    set((s) => ({ scale: Math.min(MAX_SCALE, s.scale * SCALE_STEP) })),
  zoomOut: () =>
    set((s) => ({ scale: Math.max(MIN_SCALE, s.scale / SCALE_STEP) })),
  resetZoom: () => set({ scale: 1 }),
}));
