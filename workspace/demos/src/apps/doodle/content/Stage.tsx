import {
  createContext, forwardRef, memo, useContext, useEffect, useImperativeHandle, useRef, useState,
  type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode,
} from "react";

import { elevation, VisuallyHidden } from "@studio-baeks/paper-ui";
import { tokens } from "@studio-baeks/paper-ui/tokens";

import type { Camera, Point, Stroke, Tool } from "../data/types";
import * as css from "./stage.css";

const ZOOM = { min: 0.45, max: 1.65 } as const;
export const SHEET = { width: 610, height: 740, step: 720 } as const;
const PEN_WIDTH = 2.2;

const clamp = (zoom: number) => Math.min(ZOOM.max, Math.max(ZOOM.min, zoom));
const INTERACTIVE = "button, input, textarea, select, a, iframe, label, [role='button'], [role='menuitem'], [data-stage-nodrag]";

const thin = (points: Point[], epsilon: number): Point[] => {
  if (points.length < 3) return points;
  const first = points[0]!;
  const last = points[points.length - 1]!;
  const length = Math.hypot(last.x - first.x, last.y - first.y) || 1;
  let far = 0;
  let at = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i]!;
    const distance = Math.abs((last.y - first.y) * p.x - (last.x - first.x) * p.y + last.x * first.y - last.y * first.x) / length;
    if (distance > far) { far = distance; at = i; }
  }
  if (far <= epsilon) return [first, last];
  return [...thin(points.slice(0, at + 1), epsilon).slice(0, -1), ...thin(points.slice(at), epsilon)];
};

type Gesture =
  | { kind: "pan"; x: number; y: number; camera: Camera }
  | { kind: "pen"; points: Point[] }
  | { kind: "pinch"; distance: number; zoom: number; anchor: Point };

type StageContextValue = { tool: Tool; zoom: number };
const StageContext = createContext<StageContextValue>({ tool: "select", zoom: 1 });

export type StageHandle = {
  size: () => { width: number; height: number };
  zoomTo: (zoom: number, around?: Point) => void;
};

export type StageProps = {
  label: string;
  camera: Camera;
  onCamera: (camera: Camera) => void;
  tool: Tool;
  strokes: readonly Stroke[];
  onStroke: (points: Point[]) => void;
  onPlace: (x: number, y: number) => void;
  onBackground: () => void;
  rail?: ReactNode;
  hint?: ReactNode;
  menu?: ReactNode;
  zoom?: ReactNode;
  panel?: ReactNode;
  children: ReactNode;
};

const Strokes = memo(function Strokes({ strokes }: { strokes: readonly Stroke[] }) {
  return (
    <>
      {strokes.map((stroke) => (
        <polyline
          key={stroke.id}
          points={stroke.points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={tokens.color.ink.primary}
          strokeWidth={PEN_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </>
  );
});

export const Stage = forwardRef<StageHandle, StageProps>(function Stage(props, ref) {
  const { label, camera, tool, strokes, rail, hint, menu, zoom, panel, children } = props;
  const node = useRef<HTMLElement>(null);
  const latest = useRef(props);
  latest.current = props;
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  const [draft, setDraft] = useState<Point[] | null>(null);
  const [panning, setPanning] = useState(false);

  const box = () => node.current!.getBoundingClientRect();
  const toWorld = (clientX: number, clientY: number): Point => {
    const r = box();
    const cam = latest.current.camera;
    return { x: (clientX - r.left - cam.x) / cam.zoom, y: (clientY - r.top - cam.y) / cam.zoom };
  };
  const zoomAround = (level: number, sx: number, sy: number) => {
    const cam = latest.current.camera;
    const next = clamp(level);
    latest.current.onCamera({ x: sx - ((sx - cam.x) / cam.zoom) * next, y: sy - ((sy - cam.y) / cam.zoom) * next, zoom: next });
  };

  useImperativeHandle(ref, () => ({
    size: () => { const r = box(); return { width: r.width, height: r.height }; },
    zoomTo: (level, around) => { const r = box(); zoomAround(level, around?.x ?? r.width / 2, around?.y ?? r.height / 2); },
  }), []);

  useEffect(() => {
    // A native listener, not React's: a wheel that zooms or pans has to cancel the page's own scroll and zoom.
    const el = node.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if ((event.target as HTMLElement).closest("textarea, input, select, [data-stage-chrome], [data-stage-scroll]")) return;
      event.preventDefault();
      const cam = latest.current.camera;
      if (event.ctrlKey || event.metaKey) {
        const r = el.getBoundingClientRect();
        zoomAround(cam.zoom * Math.exp(-event.deltaY * 0.0022), event.clientX - r.left, event.clientY - r.top);
      } else {
        latest.current.onCamera({ ...cam, x: cam.x - event.deltaX, y: cam.y - event.deltaY });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const beginPinch = () => {
    const [a, b] = [...pointers.current.values()] as [Point, Point];
    const r = box();
    const cam = latest.current.camera;
    const mx = (a.x + b.x) / 2 - r.left;
    const my = (a.y + b.y) / 2 - r.top;
    gesture.current = { kind: "pinch", distance: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: cam.zoom, anchor: { x: (mx - cam.x) / cam.zoom, y: (my - cam.y) / cam.zoom } };
    setDraft(null);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    // A popover opened from the chrome bubbles here through React although it lives elsewhere in the page.
    if (!event.currentTarget.contains(target) || target.closest("[data-stage-chrome]")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (target.closest(INTERACTIVE) || target.closest("[data-stage-item='block']")) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) { beginPinch(); return; }
    if (pointers.current.size > 2) return;

    const { tool: current } = latest.current;
    const insideItem = target.closest("[data-stage-item]") !== null;
    const capture = () => node.current?.setPointerCapture(event.pointerId);

    if (current === "hand" || (current === "select" && !insideItem)) {
      latest.current.onBackground();
      (document.activeElement as HTMLElement | null)?.blur?.();
      gesture.current = { kind: "pan", x: event.clientX, y: event.clientY, camera: latest.current.camera };
      setPanning(true);
      capture();
    } else if (current === "pen") {
      gesture.current = { kind: "pen", points: [toWorld(event.clientX, event.clientY)] };
      setDraft([...gesture.current.points]);
      capture();
    } else if (current === "text" || current === "image" || current === "video") {
      const at = toWorld(event.clientX, event.clientY);
      pointers.current.delete(event.pointerId);
      latest.current.onPlace(at.x, at.y);
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (pointers.current.has(event.pointerId)) pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const g = gesture.current;
    if (!g) return;
    const { onCamera } = latest.current;
    if (g.kind === "pinch") {
      if (pointers.current.size < 2) return;
      const [a, b] = [...pointers.current.values()] as [Point, Point];
      const r = box();
      const level = clamp((g.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / g.distance);
      onCamera({ x: (a.x + b.x) / 2 - r.left - g.anchor.x * level, y: (a.y + b.y) / 2 - r.top - g.anchor.y * level, zoom: level });
    } else if (g.kind === "pan") {
      onCamera({ ...g.camera, x: g.camera.x + event.clientX - g.x, y: g.camera.y + event.clientY - g.y });
    } else {
      const p = toWorld(event.clientX, event.clientY);
      const last = g.points[g.points.length - 1]!;
      if (Math.hypot(p.x - last.x, p.y - last.y) * latest.current.camera.zoom < 1.5) return;
      g.points.push(p);
      setDraft([...g.points]);
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    pointers.current.delete(event.pointerId);
    const g = gesture.current;
    if (!g) return;
    if (g.kind === "pinch") {
      if (pointers.current.size < 2) { gesture.current = null; pointers.current.clear(); }
      return;
    }
    gesture.current = null;
    setPanning(false);
    if (g.kind === "pen") {
      const { onStroke, camera: cam } = latest.current;
      const kept = thin(g.points, 0.7 / cam.zoom).map((p) => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 }));
      if (kept.length === 1) kept.push({ x: kept[0]!.x + 0.1, y: kept[0]!.y });
      onStroke(kept);
      setDraft(null);
    }
    if (node.current?.hasPointerCapture(event.pointerId)) node.current.releasePointerCapture(event.pointerId);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget || event.metaKey || event.ctrlKey || event.altKey) return;
    const cam = latest.current.camera;
    const step = event.shiftKey ? 240 : 64;
    const moves: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    latest.current.onCamera({ ...cam, x: cam.x + move[0], y: cam.y + move[1] });
  };

  const view = { "--stage-x": `${camera.x}px`, "--stage-y": `${camera.y}px`, "--stage-zoom": camera.zoom } as CSSProperties;

  const slot = (className: string, content: ReactNode) =>
    content ? (
      <div className={className}>
        <div className={css.chrome} data-stage-chrome>{content}</div>
      </div>
    ) : null;

  return (
    <StageContext.Provider value={{ tool, zoom: camera.zoom }}>
      <main
        ref={node}
        className={css.viewport}
        aria-label={label}
        data-tool={tool}
        data-panning={panning}
        style={view}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <VisuallyHidden as="button" onKeyDown={onKeyDown}>캔버스 이동: 방향키로 옮기고 Shift와 함께 누르면 크게 옮깁니다</VisuallyHidden>
        <div className={css.world} data-stage-world>
          {children}
          <svg className={css.strokes} aria-hidden="true">
            <Strokes strokes={strokes} />
            {draft ? <polyline points={draft.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={tokens.color.ink.primary} strokeWidth={PEN_WIDTH} strokeLinecap="round" strokeLinejoin="round" /> : null}
          </svg>
        </div>
        {slot(css.slotRail, rail)}
        {slot(css.slotHint, hint)}
        {slot(css.slotMenu, menu)}
        {slot(css.slotZoom, zoom)}
        {slot(css.slotPanel, panel)}
      </main>
    </StageContext.Provider>
  );
});

export type PlacedProps = {
  x: number;
  y: number;
  width: number;
  minHeight?: number;
  kind: "sheet" | "block" | "tool";
  selected?: boolean;
  movable?: boolean;
  onSelect?: () => void;
  onMoved?: (x: number, y: number) => void;
  children: ReactNode;
};

export const Placed = ({ x, y, width, minHeight, kind, selected = false, movable = false, onSelect, onMoved, children }: PlacedProps) => {
  const { tool, zoom } = useContext(StageContext);
  const [delta, setDelta] = useState<Point | null>(null);
  const start = useRef<Point | null>(null);
  const moved = useRef<Point | null>(null);
  const can = movable && tool === "select";

  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (tool !== "select" || kind === "tool") return;
    onSelect?.();
    if (!can || (event.target as HTMLElement).closest(INTERACTIVE)) return;
    start.current = { x: event.clientX, y: event.clientY };
    moved.current = null;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const next = { x: (event.clientX - start.current.x) / zoom, y: (event.clientY - start.current.y) / zoom };
    moved.current = next;
    setDelta(next);
  };
  const up = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const last = moved.current;
    start.current = null;
    moved.current = null;
    setDelta(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (last && Math.hypot(last.x, last.y) > 1) onMoved?.(x + last.x, y + last.y);
  };

  return (
    <div
      className={kind === "block" ? `${css.item} ${selected ? elevation.overlay : elevation.sticky}` : css.item}
      data-stage-item={kind}
      data-selected={selected}
      data-movable={can}
      data-dragging={delta !== null}
      style={{
        left: x,
        top: y,
        width,
        minHeight,
        transform: delta ? `translate(${delta.x}px, ${delta.y}px)` : undefined,
      }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      {children}
    </div>
  );
};
