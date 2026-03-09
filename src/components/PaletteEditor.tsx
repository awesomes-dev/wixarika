import { usePaletteEditor } from '../hooks/usePaletteEditor';
import { PaletteEditorView } from './PaletteEditorView';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PaletteEditor({ open, onClose }: Props) {
  const {
    draft,
    updateColor,
    addToPalette,
    removeAt,
    moveUp,
    moveDown,
    handleSave,
    handleCancel,
  } = usePaletteEditor(open, onClose);

  return (
    <PaletteEditorView
      open={open}
      draft={draft}
      onUpdateColor={updateColor}
      onAdd={addToPalette}
      onRemove={removeAt}
      onMoveUp={moveUp}
      onMoveDown={moveDown}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
