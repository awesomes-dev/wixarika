import Konva from 'konva';
import { useEffect, useRef, useState } from 'preact/hooks';
import { addOccupiedCircle, removeOccupiedCircle, updateHexLayer } from '../lib/hexLayer';
import { getHexAt, worldToHex } from '../lib/hexGrid';
import { useCanvasStore, MIN_SCALE, MAX_SCALE } from '../store/canvas';
import { useCellsStore } from '../store/cells';
import { useLayoutStore } from '../store/layout';
import { usePaletteStore } from '../store/palette';

const WHEEL_ZOOM_SENSITIVITY = 0.002;
const FALLBACK_FILL = '#94a3b8';

function getCellFill(q: number, r: number): string {
  const colorId = useCellsStore.getState().getColorId(q, r);
  if (!colorId) return FALLBACK_FILL;
  const c = usePaletteStore.getState().colors.find((x) => x.id === colorId);
  return c?.hex ?? FALLBACK_FILL;
}

export function useCanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const originGroupRef = useRef<Konva.Group | null>(null);
  const hexGridGroupRef = useRef<Konva.Group | null>(null);
  const occupiedGroupRef = useRef<Konva.Group | null>(null);
  const rafScheduledRef = useRef(false);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const { stagePosition, setStagePosition, scale, setScale } = useCanvasStore();
  const paletteColors = usePaletteStore((s) => s.colors);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? {};
      if (width != null && height != null) {
        setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || size.width <= 0 || size.height <= 0) return;

    const pos = useCanvasStore.getState().stagePosition;
    const stage = new Konva.Stage({
      container,
      width: size.width,
      height: size.height,
      draggable: true,
      x: pos.x,
      y: pos.y,
    });

    const originX = size.width / 2;
    const originY = size.height / 2;
    const scaleState = useCanvasStore.getState().scale;
    const originGroup = new Konva.Group({
      x: originX,
      y: originY,
      scaleX: scaleState,
      scaleY: scaleState,
    });
    originGroupRef.current = originGroup;

    const hexGridGroup = new Konva.Group({ listening: false });
    hexGridGroupRef.current = hexGridGroup;
    originGroup.add(hexGridGroup);

    const axisLength = 100000;
    const axisStyle = { stroke: '#bbb', strokeWidth: 1, listening: false, dash: [4, 4] };
    const verticalAxis = new Konva.Line({
      points: [0, -axisLength, 0, axisLength],
      ...axisStyle,
    });
    const horizontalAxis = new Konva.Line({
      points: [-axisLength, 0, axisLength, 0],
      ...axisStyle,
    });
    originGroup.add(verticalAxis);
    originGroup.add(horizontalAxis);

    const occupiedGroup = new Konva.Group({ listening: false });
    occupiedGroupRef.current = occupiedGroup;
    originGroup.add(occupiedGroup);

    const layer = new Konva.Layer();
    layer.add(originGroup);
    stage.add(layer);
    stageRef.current = stage;

    function runHexUpdate(): void {
      rafScheduledRef.current = false;
      const st = stageRef.current;
      const hexGroup = hexGridGroupRef.current;
      const occGroup = occupiedGroupRef.current;
      if (!st || !hexGroup || !occGroup) return;
      const pos = st.position();
      const s = originGroup.scaleX();
      updateHexLayer(hexGroup, occGroup, {
        stageX: pos.x,
        stageY: pos.y,
        scale: s,
        stageWidth: size.width,
        stageHeight: size.height,
        getOccupied: (q, r) => useCellsStore.getState().has(q, r),
        getFill: getCellFill,
      });
    }

    function scheduleHexUpdate(): void {
      if (rafScheduledRef.current) return;
      rafScheduledRef.current = true;
      requestAnimationFrame(runHexUpdate);
    }

    stage.on('dragend', () => {
      const p = stage.position();
      setStagePosition({ x: p.x, y: p.y });
    });

    stage.on('dragmove', () => scheduleHexUpdate());

    stage.on('wheel', (e) => {
      e.evt.preventDefault();
      const current = useCanvasStore.getState().scale;
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, current * (1 - e.evt.deltaY * WHEEL_ZOOM_SENSITIVITY)));
      setScale(next);
      originGroup.scaleX(next);
      originGroup.scaleY(next);
      scheduleHexUpdate();
    });

    stage.on('click', (e) => {
      const st = e.target.getStage();
      if (!st) return;
      const pointer = st.getPointerPosition();
      if (!pointer) return;
      const sx = st.x();
      const sy = st.y();
      const sc = originGroup.scaleX();
      const w = size.width;
      const h = size.height;
      const worldX = (pointer.x - w / 2 - sx) / sc;
      const worldY = (pointer.y - h / 2 - sy) / sc;
      const { q, r } = worldToHex(worldX, worldY);
      const hex = getHexAt(q, r);
      const wx = hex.x;
      const wy = hex.y;
      const mirrorX = useLayoutStore.getState().mirrorX;
      const mirrorY = useLayoutStore.getState().mirrorY;
      const cellsToToggle: { q: number; r: number }[] = [{ q, r }];
      if (mirrorX) {
        const m = worldToHex(-wx, wy);
        if (m.q !== q || m.r !== r) cellsToToggle.push(m);
      }
      if (mirrorY) {
        const m = worldToHex(wx, -wy);
        if (m.q !== q || m.r !== r) cellsToToggle.push(m);
      }
      if (mirrorX && mirrorY) {
        const m = worldToHex(-wx, -wy);
        if ((m.q !== q || m.r !== r) && !cellsToToggle.some((c) => c.q === m.q && c.r === m.r)) cellsToToggle.push(m);
      }
      const selectedId = usePaletteStore.getState().selectedId;
      const colorIdWhenAdding = selectedId ?? usePaletteStore.getState().colors[0]?.id ?? '';
      const occGroup = occupiedGroupRef.current;
      const cellsStore = useCellsStore.getState();
      for (const { q: qq, r: rr } of cellsToToggle) {
        cellsStore.toggle(qq, rr, colorIdWhenAdding);
        if (occGroup) {
          if (cellsStore.has(qq, rr)) {
            addOccupiedCircle(occGroup, qq, rr, getCellFill(qq, rr));
          } else {
            removeOccupiedCircle(occGroup, qq, rr);
          }
        }
      }
    });

    runHexUpdate();

    return () => {
      stage.destroy();
      stageRef.current = null;
      originGroupRef.current = null;
      hexGridGroupRef.current = null;
      occupiedGroupRef.current = null;
    };
  }, [size.width, size.height, setStagePosition]);

  useEffect(() => {
    const stage = stageRef.current;
    const hexGroup = hexGridGroupRef.current;
    const occGroup = occupiedGroupRef.current;
    const group = originGroupRef.current;
    if (!stage) return;
    stage.position({ x: stagePosition.x, y: stagePosition.y });
    if (hexGroup && occGroup && group) {
      updateHexLayer(hexGroup, occGroup, {
        stageX: stagePosition.x,
        stageY: stagePosition.y,
        scale: group.scaleX(),
        stageWidth: size.width,
        stageHeight: size.height,
        getOccupied: (q, r) => useCellsStore.getState().has(q, r),
        getFill: getCellFill,
      });
    }
    stage.batchDraw();
  }, [stagePosition, size.width, size.height]);

  useEffect(() => {
    const group = originGroupRef.current;
    const stage = stageRef.current;
    const hexGroup = hexGridGroupRef.current;
    const occGroup = occupiedGroupRef.current;
    if (!group) return;
    group.scaleX(scale);
    group.scaleY(scale);
    if (stage && hexGroup && occGroup) {
      const pos = stage.position();
      updateHexLayer(hexGroup, occGroup, {
        stageX: pos.x,
        stageY: pos.y,
        scale,
        stageWidth: size.width,
        stageHeight: size.height,
        getOccupied: (q, r) => useCellsStore.getState().has(q, r),
        getFill: getCellFill,
      });
    }
    group.getLayer()?.batchDraw();
  }, [scale, size.width, size.height]);

  // Redraw occupied circles when palette colors change (e.g. after Save in PaletteEditor)
  useEffect(() => {
    const stage = stageRef.current;
    const hexGroup = hexGridGroupRef.current;
    const occGroup = occupiedGroupRef.current;
    const group = originGroupRef.current;
    if (!stage || !hexGroup || !occGroup || !group) return;
    const pos = stage.position();
    updateHexLayer(hexGroup, occGroup, {
      stageX: pos.x,
      stageY: pos.y,
      scale: group.scaleX(),
      stageWidth: size.width,
      stageHeight: size.height,
      getOccupied: (q, r) => useCellsStore.getState().has(q, r),
      getFill: getCellFill,
    });
    stage.batchDraw();
  }, [paletteColors, size.width, size.height]);

  return { containerRef };
}
