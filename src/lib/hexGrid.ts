import { defineHex, Grid, Orientation, rectangle } from 'honeycomb-grid';

export interface ViewBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Flat-top hex with origin at center. Radius ~20px at scale 1. */
const HEX_RADIUS = 20;
const HEX_X_RADIUS = HEX_RADIUS;
const HEX_Y_RADIUS = HEX_RADIUS;
/** One hex width/height for padding so edge hexes aren't clipped. */
const HEX_PADDING_X = HEX_X_RADIUS * 2;
const HEX_PADDING_Y = HEX_Y_RADIUS * 2;

export const HexDefinition = defineHex({
  dimensions: { xRadius: HEX_X_RADIUS, yRadius: HEX_Y_RADIUS },
  orientation: Orientation.FLAT,
  origin: { x: 0, y: 0 },
});

export type FlatHex = InstanceType<typeof HexDefinition>;

/** Grid used only for pointToHex and coordinate math (no traverser = empty). */
const mathGrid = new Grid(HexDefinition);

/** Return the hex at axial coordinates (q, r). */
export function getHexAt(q: number, r: number): FlatHex {
  return mathGrid.createHex({ q, r }) as FlatHex;
}

/**
 * Convert viewport pixel bounds (world coordinates, origin at center) to visible hex coordinates.
 * Bounds are expanded by one hex in each direction so partially visible hexes (e.g. top row) are drawn and not clipped.
 */
export function getVisibleHexes(bounds: ViewBounds): FlatHex[] {
  const padded = {
    left: bounds.left - HEX_PADDING_X,
    top: bounds.top - HEX_PADDING_Y,
    right: bounds.right + HEX_PADDING_X,
    bottom: bounds.bottom + HEX_PADDING_Y,
  };
  const topLeft = mathGrid.pointToHex({ x: padded.left, y: padded.top });
  const topRight = mathGrid.pointToHex({ x: padded.right, y: padded.top });
  const bottomLeft = mathGrid.pointToHex({ x: padded.left, y: padded.bottom });
  const bottomRight = mathGrid.pointToHex({ x: padded.right, y: padded.bottom });
  const minQ = Math.min(topLeft.q, topRight.q, bottomLeft.q, bottomRight.q);
  const maxQ = Math.max(topLeft.q, topRight.q, bottomLeft.q, bottomRight.q);
  const minR = Math.min(topLeft.r, topRight.r, bottomLeft.r, bottomRight.r);
  const maxR = Math.max(topLeft.r, topRight.r, bottomLeft.r, bottomRight.r);
  const width = maxQ - minQ + 1;
  const height = maxR - minR + 1;
  const visibleGrid = new Grid(HexDefinition, rectangle({ start: { q: minQ, r: minR }, width, height }));
  return visibleGrid.toArray();
}

/**
 * Convert world (x, y) to hex (q, r). Returns the hex coordinates.
 */
export function worldToHex(worldX: number, worldY: number): { q: number; r: number } {
  const hex = mathGrid.pointToHex({ x: worldX, y: worldY });
  return { q: hex.q, r: hex.r };
}

/**
 * Compute viewport bounds in world coordinates from stage state.
 * Origin is at viewport center when stage position is (0,0).
 */
export function getViewBounds(
  stageX: number,
  stageY: number,
  scale: number,
  stageWidth: number,
  stageHeight: number
): ViewBounds {
  const halfW = stageWidth / 2;
  const halfH = stageHeight / 2;
  return {
    left: (-halfW - stageX) / scale,
    right: (halfW - stageX) / scale,
    top: (-halfH - stageY) / scale,
    bottom: (halfH - stageY) / scale,
  };
}
