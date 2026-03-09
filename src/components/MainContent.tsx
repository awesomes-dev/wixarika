import { useCanvasStage } from '../hooks/useCanvasStage';
import { FlowerColorPalette } from './FlowerColorPalette';
import { MainContentView } from './MainContentView';
import { PaletteEditor } from './PaletteEditor';
import { useLayoutStore } from '../store/layout';

export function MainContent() {
  const { containerRef } = useCanvasStage();
  const paletteEditorOpen = useLayoutStore((s) => s.paletteEditorOpen);
  const closePaletteEditor = useLayoutStore((s) => s.closePaletteEditor);
  return (
    <>
      <MainContentView containerRef={containerRef} />
      <FlowerColorPalette />
      <PaletteEditor open={paletteEditorOpen} onClose={closePaletteEditor} />
    </>
  );
}
