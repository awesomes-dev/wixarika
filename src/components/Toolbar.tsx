import { Crosshair, FlipHorizontal, FlipVertical, Palette, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-preact';
import { ColorPalette } from './ColorPalette';
import { useCanvasStore } from '../store/canvas';
import { useLayoutStore } from '../store/layout';

export function Toolbar(props: { drawerId: string }) {
  const toggleToolbar = useLayoutStore((s) => s.toggleToolbar);
  const openPaletteEditor = useLayoutStore((s) => s.openPaletteEditor);
  const mirrorX = useLayoutStore((s) => s.mirrorX);
  const mirrorY = useLayoutStore((s) => s.mirrorY);
  const toggleMirrorX = useLayoutStore((s) => s.toggleMirrorX);
  const toggleMirrorY = useLayoutStore((s) => s.toggleMirrorY);
  const { goToCenter, zoomIn, zoomOut, resetZoom } = useCanvasStore();

  return (
    <div class="drawer-side lg:!relative lg:!translate-x-0 lg:!w-80 shrink-0">
      <label
        htmlFor={props.drawerId}
        class="drawer-overlay lg:!hidden"
        aria-label="Close sidebar"
      />
      <div class="flex flex-col min-h-full w-80 bg-base-600 border-l border-base-300">
        <div class="flex justify-end p-2 lg:hidden shrink-0">
          <button
            type="button"
            class="btn btn-ghost btn-sm btn-square"
            onClick={toggleToolbar}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        <div class="flex flex-col justify-center items-center p-2 shrink-0">
          <div class="join">
            <div class="tooltip tooltip-bottom join-item" data-tip="Center">
              <button type="button" class="btn btn-sm" onClick={goToCenter} aria-label="Center">
                <Crosshair size={18} aria-hidden />
              </button>
            </div>
            <div class="tooltip tooltip-bottom join-item" data-tip="Zoom out">
              <button type="button" class="btn btn-sm" onClick={zoomOut} aria-label="Zoom out">
                <ZoomOut size={18} aria-hidden />
              </button>
            </div>
            <div class="tooltip tooltip-bottom join-item" data-tip="Zoom in">
              <button type="button" class="btn btn-sm" onClick={zoomIn} aria-label="Zoom in">
                <ZoomIn size={18} aria-hidden />
              </button>
            </div>
            <div class="tooltip tooltip-bottom join-item" data-tip="Reset zoom">
              <button type="button" class="btn btn-sm" onClick={resetZoom} aria-label="Reset zoom">
                <RotateCcw size={18} aria-hidden />
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col justify-center items-center p-2 shrink-0">
          <div class="tooltip tooltip-bottom join-item" data-tip="Edit palette">
            <button type="button" class="btn btn-sm" onClick={openPaletteEditor} aria-label="Edit palette">
              <Palette size={18} aria-hidden />
            </button>
          </div>
        </div>
        <div class="flex flex-col justify-center items-center p-2 shrink-0">
          <div class="join">
            <div class="tooltip tooltip-bottom join-item" data-tip="Mirror X">
              <button
                type="button"
                class={`btn btn-sm ${mirrorX ? 'btn-success' : ''}`}
                onClick={toggleMirrorX}
                aria-label="Mirror X"
                aria-pressed={mirrorX}
              >
                <FlipHorizontal size={18} aria-hidden />
              </button>
            </div>
            <div class="tooltip tooltip-bottom join-item" data-tip="Mirror Y">
              <button
                type="button"
                class={`btn btn-sm ${mirrorY ? 'btn-success' : ''}`}
                onClick={toggleMirrorY}
                aria-label="Mirror Y"
                aria-pressed={mirrorY}
              >
                <FlipVertical size={18} aria-hidden />
              </button>
            </div>
          </div>
        </div>
        {/* <div class="border-t border-base-300 mt-auto pt-1">
          <ColorPalette />
        </div> */}
      </div>
    </div>
  );
}
