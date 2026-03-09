import { useCallback, useEffect, useState } from 'preact/hooks';
import type { PaletteColor } from '../store/palette';
import { usePaletteStore } from '../store/palette';
import { useCellsStore } from '../store/cells';

const DEFAULT_NEW_HEX = '#e0e0e0';

export function usePaletteEditor(open: boolean, onClose: () => void) {
  const setColors = usePaletteStore((s) => s.setColors);
  const [draft, setDraft] = useState<PaletteColor[]>([]);

  useEffect(() => {
    if (open) {
      const current = usePaletteStore.getState().colors;
      setDraft(current.map((c) => ({ ...c })));
    }
  }, [open]);

  const updateColor = useCallback((index: number, hex: string) => {
    setDraft((prev) =>
      prev.map((c, i) => (i === index ? { ...c, hex } : c))
    );
  }, []);

  const addToPalette = useCallback(() => {
    setDraft((prev) => [
      ...prev,
      { id: crypto.randomUUID(), hex: DEFAULT_NEW_HEX },
    ]);
  }, []);

  const removeAt = useCallback((index: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setDraft((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setDraft((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    const validIds = new Set(draft.map((c) => c.id));
    useCellsStore.getState().retainOnlyColorIds(validIds);
    setColors(draft);
    onClose();
  }, [draft, setColors, onClose]);

  return {
    draft,
    updateColor,
    addToPalette,
    removeAt,
    moveUp,
    moveDown,
    handleSave,
    handleCancel: onClose,
  };
}
