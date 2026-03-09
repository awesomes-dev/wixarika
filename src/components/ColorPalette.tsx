import { usePaletteStore } from '../store/palette';

const SWATCH_SIZE = 84;

export function ColorPalette() {
  const { colors, selectedId, selectColor } = usePaletteStore();

  return (
    <div class="flex flex-col items-center gap-3 p-3">	
      {colors.map((c) => {
        const isSelected = c.id === selectedId;
        return (
          <button
            key={c.id}
            type="button"
            class="flex cursor-pointer rounded-full bg-white p-0.75 shadow-md transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              width: SWATCH_SIZE,
              height: SWATCH_SIZE,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              border: isSelected ? '2px solid #999' : 'none',
            }}
            onClick={() => selectColor(c.id)}
            aria-label={`Select color ${c.hex}`}
            aria-pressed={isSelected}
          >
            <span
              class="block w-full h-full min-w-0 min-h-0 rounded-full shrink-0 pointer-events-none"
              style={{ backgroundColor: c.hex }}
            />
          </button>
        );
      })}
    </div>
  );
}
