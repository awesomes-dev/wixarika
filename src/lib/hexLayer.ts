import Konva from 'konva';
import type { FlatHex } from './hexGrid';
import { getHexAt, getViewBounds, getVisibleHexes } from './hexGrid';

const HEX_Q_KEY = 'hexQ';
const HEX_R_KEY = 'hexR';

const EMPTY_STROKE = '#ececeb';
const OCCUPIED_RADIUS_RATIO = 0.7;
const FALLBACK_FILL = '#94a3b8';

// Flat-top corner order: 0=top-right, 1=right, 2=bottom-right, 3=bottom-left, 4=left, 5=top-left.
// Draw only the 3 "top" edges per hex so shared edges are not duplicated.
const TOP_EDGES = [
  [5, 0],
  [4, 5],
  [0, 1],
] as const;

/** Redraw only the grid lines (no circles). Call when viewport changes. */
export function updateHexGrid(hexGridGroup: Konva.Group, visibleHexes: FlatHex[]): void {
  hexGridGroup.destroyChildren();
  for (const hex of visibleHexes) {
    const corners = hex.corners;
    for (const [i, j] of TOP_EDGES) {
      const a = corners[i];
      const b = corners[j];
      hexGridGroup.add(
        new Konva.Line({
          points: [a.x, a.y, b.x, b.y],
          stroke: EMPTY_STROKE,
          strokeWidth: 1,
          listening: false,
        })
      );
    }
  }
  hexGridGroup.getLayer()?.batchDraw();
}

/** Redraw only the occupied circles. Call when viewport changes (pan/zoom/resize). */
export function updateOccupiedLayer(
  occupiedGroup: Konva.Group,
  visibleHexes: FlatHex[],
  getOccupied: (q: number, r: number) => boolean,
  getFill: (q: number, r: number) => string
): void {
  occupiedGroup.destroyChildren();
  for (const hex of visibleHexes) {
    if (!getOccupied(hex.q, hex.r)) continue;
    const fill = getFill(hex.q, hex.r) ?? FALLBACK_FILL;
    const circle = new Konva.Circle({
      x: hex.x,
      y: hex.y,
      radius: (hex.width / 2) * OCCUPIED_RADIUS_RATIO,
      fill,
      listening: false,
    });
    (circle as Konva.Node & { setAttr(key: string, val: number): void }).setAttr(HEX_Q_KEY, hex.q);
    (circle as Konva.Node & { setAttr(key: string, val: number): void }).setAttr(HEX_R_KEY, hex.r);
    occupiedGroup.add(circle);
  }
  occupiedGroup.getLayer()?.batchDraw();
}

/** Add a single circle for hex (q, r). Call when a cell becomes occupied (e.g. after toggle). */
export function addOccupiedCircle(
  occupiedGroup: Konva.Group,
  q: number,
  r: number,
  fill: string = FALLBACK_FILL
): void {
  const hex = getHexAt(q, r);
  const circle = new Konva.Circle({
    x: hex.x,
    y: hex.y,
    radius: (hex.width / 2) * OCCUPIED_RADIUS_RATIO,
    fill,
    listening: false,
  });
  (circle as Konva.Node & { setAttr(key: string, val: number): void }).setAttr(HEX_Q_KEY, q);
  (circle as Konva.Node & { setAttr(key: string, val: number): void }).setAttr(HEX_R_KEY, r);
  occupiedGroup.add(circle);
  occupiedGroup.getLayer()?.batchDraw();
}

/** Remove the circle for hex (q, r). Call when a cell becomes unoccupied (e.g. after toggle). */
export function removeOccupiedCircle(occupiedGroup: Konva.Group, q: number, r: number): void {
  for (const node of occupiedGroup.getChildren()) {
    const n = node as Konva.Node & { getAttr(key: string): number };
    if (n.getAttr(HEX_Q_KEY) === q && n.getAttr(HEX_R_KEY) === r) {
      node.destroy();
      occupiedGroup.getLayer()?.batchDraw();
      return;
    }
  }
}

/** Redraw both grid and occupied layers. Call on viewport change (pan/zoom/resize). */
export function updateHexLayer(
  hexGridGroup: Konva.Group,
  occupiedGroup: Konva.Group,
  opts: {
    stageX: number;
    stageY: number;
    scale: number;
    stageWidth: number;
    stageHeight: number;
    getOccupied: (q: number, r: number) => boolean;
    getFill: (q: number, r: number) => string;
  }
): void {
  const bounds = getViewBounds(opts.stageX, opts.stageY, opts.scale, opts.stageWidth, opts.stageHeight);
  const visibleHexes = getVisibleHexes(bounds);
  updateHexGrid(hexGridGroup, visibleHexes);
  updateOccupiedLayer(occupiedGroup, visibleHexes, opts.getOccupied, opts.getFill);
}
