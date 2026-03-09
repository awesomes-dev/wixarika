import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-preact';
import type { PaletteColor } from '../store/palette';

export type PaletteEditorViewProps = {
  open: boolean;
  draft: PaletteColor[];
  onUpdateColor: (index: number, hex: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function PaletteEditorView({
  open,
  draft,
  onUpdateColor,
  onAdd,
  onRemove,
  onMoveUp,
  onMoveDown,
  onSave,
  onCancel,
}: PaletteEditorViewProps) {
  if (!open) return null;

  return (
    <dialog open class="modal" onCancel={onCancel} onClose={onCancel}>
      <div class="modal-box max-w-sm">
        <button
          type="button"
          class="btn btn-ghost btn-sm w-full bg-base-300 justify-center gap-1 rounded-xl mb-3"
          onClick={onAdd}
          aria-label="Add new color"
        >
          <Plus size={16} />
          Add New Color
        </button>
        <div class="flex flex-col gap-2 overflow-auto max-h-80">
          {draft.map((c, i) => (
            <div
              key={c.id}
              class="flex items-center gap-2 rounded-lg p-1.5 bg-base-200/50"
            >
              <input
                type="color"
                value={c.hex}
                onInput={(e) =>
                  onUpdateColor(i, (e.target as HTMLInputElement).value)
                }
                class="h-14 w-14 cursor-pointer border-2 border-white rounded-full shadow editor-color-picker"
                style={{ minWidth: 56, padding: 0 }}
                aria-label={`Color ${i + 1}`}
              />
              <div class="flex gap-1 ml-auto">
                <button
                  type="button"
                  class="btn btn-ghost btn-xs btn-square"
                  onClick={() => onMoveUp(i)}
                  disabled={i === 0}
                  aria-label="Move up"
                >
                  <ArrowUp size={18} />
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs btn-square"
                  onClick={() => onMoveDown(i)}
                  disabled={i === draft.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDown size={18} />
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs btn-square text-error"
                  onClick={() => onRemove(i)}
                  aria-label="Remove color"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div class="modal-action mt-4">
          <button type="button" class="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" class="btn btn-primary" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
      <div class="modal-backdrop" onClick={onCancel} aria-hidden />
    </dialog>
  );
}
