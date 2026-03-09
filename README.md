# Wixarika

## UI frameworks (for developers and AI agents)

Use the project’s chosen UI stack so layouts and components stay consistent and maintainable:

- **Styling & components:** [Tailwind CSS](https://tailwindcss.com/) v4 + [daisyUI](https://v5.daisyui.com/) v5. Prefer daisyUI component classes (e.g. `navbar`, `navbar-start` / `navbar-end`, `drawer`, `drawer-content`, `drawer-side`, `menu`, `btn`, `card`, `input`) instead of hand-rolled layout or custom component code. Docs: <https://v5.daisyui.com/components/>.
- **Icons:** [lucide-preact](https://lucide.dev/guide/packages/lucide-preact) — tree-shakable, Preact-native. Use it for all icons; import only the icons you need (e.g. `import { ChevronLeft } from 'lucide-preact'`).

Avoid introducing other UI or component frameworks (e.g. MUI, Chakra, custom design systems) unless the team explicitly decides to change stack.

## Infinite canvas (for developers and AI agents)

The main content area is an **infinite, pannable and zoomable canvas** implemented with [Konva](https://konvajs.org/) (imperative API only; **react-konva is not used** — it depends on React’s scheduler and is incompatible with Preact).

### Coordinate system

- **Origin (0, 0)** is at the **viewport center**. A Konva `Group` is placed at `(width/2, height/2)`; all “world” content (e.g. the red center dot) lives in that group at (0, 0) relative to it.
- **Pan:** The Konva `Stage` is draggable. Its `x`/`y` are stored in the canvas store and updated on `dragend`. “Go to center” resets stage position to (0, 0).
- **Zoom:** Scale is applied to the origin group (`scaleX`/`scaleY`), so zoom is centered on the origin. Scale is in the canvas store (default 1, step 1.25×, clamped 0.25×–4×).

### State and key files

- **`src/store/canvas.ts`** — Zustand store: `stagePosition`, `scale`, `setStagePosition`, `goToCenter`, `zoomIn`, `zoomOut`.
- **`src/components/MainContent.tsx`** — Builds the Konva stage in `useEffect` (container from ref, size from `ResizeObserver`). Creates `Stage` → `Layer` → origin `Group` (at center) → shapes. Syncs store position/scale to stage and origin group in separate effects; `dragend` writes back position.
- **`src/components/Toolbar.tsx`** — Canvas actions: “Go to center” (Crosshair), zoom out/in/reset (Join). On large screens the toolbar is always visible; on small screens it’s a drawer (see layout below).

### Hex grid

- **Flat-top hexagons** via [honeycomb-grid](https://abbekeultjes.nl/honeycomb/). World ↔ screen uses the same origin-centered transform; **wheel zoom** (scale clamped 0.25×–4×) and **stage draggable** pan are supported.
- **`src/store/cells.ts`** — Zustand store for **occupied** hexes (`Set<string>` keys `"q,r"`). `toggle(q, r)`, `has(q, r)`. All other hexes are unoccupied.
- **`src/lib/hexGrid.ts`** — `HexDefinition` (flat-top, center origin), `getHexAt(q, r)`, `getVisibleHexes(bounds)` (use **all four viewport corners** for correct q/r range; viewport bounds in world coords → visible hex array), `worldToHex(x, y)` → `{ q, r }`, `getViewBounds(stageX, stageY, scale, width, height)`.
- **`src/hooks/useCanvasStage.ts`** — Builds the stage and two hex groups (see below). **onDragMove** and **onWheel** schedule a single **requestAnimationFrame** to recalc visible hexes and redraw grid + occupied (60fps). **Stage click** → `worldToHex` → **toggles** that cell and updates only that hex’s circle (no full redraw).

### Hex layers and performance (for developers and AI agents)

The hex content is split into **two Konva groups** under the origin group so each can be updated independently:

| Group | Contents | Redrawn when |
|-------|----------|--------------|
| **hexGridGroup** | Grid lines only (3 “top” edges per visible hex to avoid duplicate shared edges). | Viewport changes (pan, zoom, resize). |
| **occupiedGroup** | Placeholder circles for occupied cells only. | Viewport change: full redraw. Cell toggle: **only the affected circle** is added or removed. |

- **`src/lib/hexLayer.ts`**:
  - **`updateHexGrid(hexGridGroup, visibleHexes)`** — Clears and redraws only grid lines (no circles). Call on viewport change.
  - **`updateOccupiedLayer(occupiedGroup, visibleHexes, getOccupied)`** — Clears and redraws all circles for visible hexes. Call on viewport change.
  - **`updateHexLayer(hexGridGroup, occupiedGroup, opts)`** — Gets visible hexes from viewport, then calls both `updateHexGrid` and `updateOccupiedLayer`. Use for pan/zoom/resize.
  - **`addOccupiedCircle(occupiedGroup, q, r)`** — Adds a single circle for hex (q, r). Used when a cell becomes occupied (e.g. after click/toggle).
  - **`removeOccupiedCircle(occupiedGroup, q, r)`** — Finds and destroys the circle for (q, r) (nodes store `hexQ`/`hexR` attrs for lookup). Used when a cell becomes unoccupied.

**Performance rules:** Do not redraw the grid when only cells change. Do not redraw all circles when a single cell is toggled — use `addOccupiedCircle` / `removeOccupiedCircle` in the click handler after `toggle(q, r)`.

### Layout (drawer vs sidebar)

- **Small screens:** Right toolbar is a daisyUI **drawer** (toggle via checkbox; overlay when open).
- **Large (`lg:`):** Toolbar is always visible as a fixed-width column: `drawer-side` gets `lg:!relative lg:!translate-x-0`, overlay is `lg:!hidden`, root uses `lg:flex lg:flex-row` so main content and sidebar sit side by side.

## Getting Started

-   `npm run dev` - Starts a dev server at http://localhost:5173/

-   `npm run build` - Builds for production, emitting to `dist/`

-   `npm run preview` - Starts a server at http://localhost:4173/ to test production build locally
