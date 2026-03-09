import { usePaletteStore } from '../store/palette';

const FALLBACK_HEX = '#e0e0e0';
const BUTTON_SIZE = '5rem';

export function FlowerColorPalette() {
  const colors = usePaletteStore((s) => s.colors);
  const selectedId = usePaletteStore((s) => s.selectedId);
  const selectColor = usePaletteStore((s) => s.selectColor);

  const selectedColor = colors.find((c) => c.id === selectedId);
  const activeHex = selectedColor?.hex ?? colors[0]?.hex ?? FALLBACK_HEX;

  return (
    <div class="fab fab-flower">
      <div
        tabIndex={0}
        role="button"
        class="btn btn-circle btn-lg border-2 border-base-300 shadow-md"
        style={{
          backgroundColor: activeHex,
          minWidth: BUTTON_SIZE,
          minHeight: BUTTON_SIZE,
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
        }}
        aria-label={`Current color ${activeHex}`}
      ></div>

      <div class="fab-close btn btn-circle btn-lg border-2 border-base-300 border-white shadow-md"
        style={{
          backgroundColor: activeHex,
          minWidth: BUTTON_SIZE,
          minHeight: BUTTON_SIZE,
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
        }}
        aria-label={`Current color ${activeHex}`}
      >✕</div>

      {colors.map((c) => (
        <button
          key={c.id}
          type="button"
          class="btn btn-circle btn-lg border-2 border-white shadow"
          style={{
            backgroundColor: c.hex,
            minWidth: BUTTON_SIZE,
            minHeight: BUTTON_SIZE,
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
          }}
          onClick={() => selectColor(c.id)}
          aria-label={`Select color ${c.hex}`}
          aria-pressed={c.id === selectedId}
        />
      ))}
    </div>
  );
}
