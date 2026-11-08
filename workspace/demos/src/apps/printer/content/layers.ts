import { random } from "../../../kit";

type Point = readonly [number, number];
type Poly = readonly Point[];

export type Part = {
  name: string;
  outline: { kind: "rrect"; w: number; h: number; r: number } | { kind: "ellipse"; rx: number; ry: number };
  holes: readonly { x: number; y: number; r: number }[];
  taper: number;
  step: { at: number; k: number } | null;
  centre: Point;
};

export const BED = 230;

export const partFor = (name: string): Part => {
  const r = random(`part:${name}`);
  const has = (word: string) => name.includes(word);
  const centre: Point = [115 + (r() - 0.5) * 8, 115 + (r() - 0.5) * 6];
  const ring = (outer: number, inner: number, taper = 0): Part => ({ name, outline: { kind: "ellipse", rx: outer, ry: outer }, holes: [{ x: 0, y: 0, r: inner }], taper, step: null, centre: [115, 115] });
  if (has("RING,")) return ring(22, 16.5);
  if (has("SEAL,")) return ring(19, 16);
  if (has("CAP,")) return { name, outline: { kind: "ellipse", rx: 26, ry: 26 }, holes: [0, 1, 2].map((i) => ({ x: 14 * Math.cos((i * 2 * Math.PI) / 3), y: 14 * Math.sin((i * 2 * Math.PI) / 3), r: 2 })), taper: 0, step: { at: 0.8, k: 0.88 }, centre: [115, 115] };
  if (has("LEVER,")) return { name, outline: { kind: "rrect", w: 62, h: 14, r: 7 }, holes: [{ x: -22, y: 0, r: 2 }], taper: 0.1, step: null, centre: [115, 115] };
  if (has("Calibration Cube")) return { name, outline: { kind: "rrect", w: 20, h: 20, r: 0.6 }, holes: [], taper: 0, step: null, centre: [115, 115] };
  if (has("Benchy")) return { name, outline: { kind: "ellipse", rx: 30, ry: 11 }, holes: [], taper: 0.55, step: { at: 0.45, k: 0.8 }, centre: [115, 115] };
  if (has("벽 고리")) return { name, outline: { kind: "rrect", w: 110, h: 34, r: 8 }, holes: [{ x: -36, y: 0, r: 3.5 }, { x: 36, y: 0, r: 3.5 }], taper: 0.04, step: { at: 0.7, k: 0.92 }, centre: [115, 115] };
  if (has("받침")) return { name, outline: { kind: "rrect", w: 78, h: 58, r: 6 }, holes: [{ x: -12, y: 6, r: 14 }], taper: 0.12, step: { at: 0.6, k: 0.85 }, centre };
  const w = 84 + Math.round(r() * 14);
  const h = 66 + Math.round(r() * 12);
  const inset = 8;
  return {
    name,
    outline: { kind: "rrect", w, h, r: 9 },
    holes: [
      { x: -(w / 2 - inset), y: -(h / 2 - inset), r: 2.4 },
      { x: w / 2 - inset, y: -(h / 2 - inset), r: 2.4 },
      { x: -(w / 2 - inset), y: h / 2 - inset, r: 2.4 },
      { x: w / 2 - inset, y: h / 2 - inset, r: 2.4 },
      { x: 0, y: 0, r: 6 },
    ],
    taper: 0.1,
    step: { at: 0.75, k: 0.9 },
    centre: [115, 115],
  };
};

const arc = (cx: number, cy: number, rx: number, ry: number, from: number, to: number, steps: number): Point[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / steps;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as const;
  });

const polyRRect = (cx: number, cy: number, w: number, h: number, r: number, steps: number): Poly => {
  const rr = Math.max(0.05, Math.min(r, w / 2 - 0.01, h / 2 - 0.01));
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const y0 = cy - h / 2;
  const y1 = cy + h / 2;
  return [
    ...arc(x1 - rr, y0 + rr, rr, rr, -Math.PI / 2, 0, steps),
    ...arc(x1 - rr, y1 - rr, rr, rr, 0, Math.PI / 2, steps),
    ...arc(x0 + rr, y1 - rr, rr, rr, Math.PI / 2, Math.PI, steps),
    ...arc(x0 + rr, y0 + rr, rr, rr, Math.PI, (3 * Math.PI) / 2, steps),
  ];
};

const polyEllipse = (cx: number, cy: number, rx: number, ry: number, steps: number): Poly => arc(cx, cy, rx, ry, 0, Math.PI * 2, steps * 4).slice(0, -1);

export type Quality = "low" | "medium" | "high";
const STEPS: Record<Quality, number> = { low: 2, medium: 4, high: 8 };

const outlineAt = (part: Part, scale: number, inset: number, steps: number): Poly => {
  const [cx, cy] = part.centre;
  const o = part.outline;
  if (o.kind === "rrect") return polyRRect(cx, cy, Math.max(0.5, o.w * scale - 2 * inset), Math.max(0.5, o.h * scale - 2 * inset), o.r - inset, steps);
  return polyEllipse(cx, cy, Math.max(0.3, o.rx * scale - inset), Math.max(0.3, o.ry * scale - inset), steps);
};

const holeAt = (part: Part, hole: Part["holes"][number], grow: number, steps: number): Poly => {
  const [cx, cy] = part.centre;
  return polyEllipse(cx + hole.x, cy + hole.y, hole.r + grow, hole.r + grow, steps);
};

const path = (poly: Poly) => `M${poly.map(([x, y]) => `${x.toFixed(2)} ${(BED - y).toFixed(2)}`).join("L")}Z`;

const crossings = (poly: Poly, origin: Point, dir: Point): number[] => {
  const out: number[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    const ex = b[0] - a[0];
    const ey = b[1] - a[1];
    const denominator = dir[0] * ey - dir[1] * ex;
    if (Math.abs(denominator) < 1e-9) continue;
    const t = ((a[0] - origin[0]) * ey - (a[1] - origin[1]) * ex) / denominator;
    const u = ((a[0] - origin[0]) * dir[1] - (a[1] - origin[1]) * dir[0]) / denominator;
    if (u >= 0 && u < 1) out.push(t);
  }
  return out.sort((x, y) => x - y);
};

const intervals = (poly: Poly, origin: Point, dir: Point): [number, number][] => {
  const ts = crossings(poly, origin, dir);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < ts.length; i += 2) out.push([ts[i]!, ts[i + 1]!]);
  return out;
};

const subtract = (base: [number, number][], cut: [number, number][]) => {
  let result = base;
  for (const [c0, c1] of cut) {
    const next: [number, number][] = [];
    for (const [a, b] of result) {
      if (c1 <= a || c0 >= b) next.push([a, b]);
      else {
        if (c0 > a) next.push([a, c0]);
        if (c1 < b) next.push([c1, b]);
      }
    }
    result = next;
  }
  return result;
};

export type Layer = {
  outer: string;
  inner: string;
  infill: string;
  solid: string;
  travel: string;
  length: number;
  layer: number;
  z: number;
};

const WIDTH = 0.45;
const BOTTOM = 4;
const TOP = 5;

export const buildLayer = (part: Part, layer: number, total: number, layerHeight: number, quality: Quality): Layer => {
  const steps = STEPS[quality];
  const f = total <= 1 ? 0 : (layer - 1) / (total - 1);
  let scale = 1 - part.taper * f;
  if (part.step && f > part.step.at) scale *= part.step.k;
  const holes = part.holes;
  const loops: Poly[] = [];
  const outerLoops: Poly[] = [outlineAt(part, scale, 0, steps), ...holes.map((hole) => holeAt(part, hole, 0, steps))];
  const innerLoops: Poly[] = [];
  for (const d of [WIDTH, WIDTH * 2]) {
    innerLoops.push(outlineAt(part, scale, d, steps));
    for (const hole of holes) innerLoops.push(holeAt(part, hole, d, steps));
  }
  loops.push(...outerLoops, ...innerLoops);

  const solid = layer <= BOTTOM || layer > total - TOP;
  const spacing = solid ? 0.9 : 3.4;
  const angle = layer % 2 === 0 ? Math.PI / 4 : -Math.PI / 4;
  const dir: Point = [Math.cos(angle), Math.sin(angle)];
  const normal: Point = [-dir[1], dir[0]];
  const region = outlineAt(part, scale, WIDTH * 3.4, steps);
  const keepOut = holes.map((hole) => holeAt(part, hole, WIDTH * 3.4, steps));
  const [cx, cy] = part.centre;
  const reach = 130;
  const lines: string[] = [];
  const travel: string[] = [];
  let length = loops.reduce((sum, loop) => sum + loop.length * 0.6, 0);
  let flip = false;
  let last: Point | null = null;
  for (let t = -reach; t <= reach; t += spacing) {
    const origin: Point = [cx + normal[0] * t, cy + normal[1] * t];
    const base = intervals(region, origin, dir);
    if (base.length === 0) continue;
    const cut = keepOut.flatMap((hole) => intervals(hole, origin, dir)).sort((a, b) => a[0] - b[0]);
    for (const [a, b] of subtract(base, cut)) {
      if (b - a < 0.6) continue;
      const from: Point = [origin[0] + dir[0] * (flip ? b : a), origin[1] + dir[1] * (flip ? b : a)];
      const to: Point = [origin[0] + dir[0] * (flip ? a : b), origin[1] + dir[1] * (flip ? a : b)];
      lines.push(`M${from[0].toFixed(2)} ${(BED - from[1]).toFixed(2)}L${to[0].toFixed(2)} ${(BED - to[1]).toFixed(2)}`);
      length += b - a;
      if (last && Math.hypot(last[0] - from[0], last[1] - from[1]) > 6) travel.push(`M${last[0].toFixed(2)} ${(BED - last[1]).toFixed(2)}L${from[0].toFixed(2)} ${(BED - from[1]).toFixed(2)}`);
      last = to;
    }
    flip = !flip;
  }
  let at: Point | null = null;
  for (const loop of [...outerLoops, ...innerLoops.slice(0, 1)]) {
    const start = loop[0];
    if (!start) continue;
    if (at) travel.push(`M${at[0].toFixed(2)} ${(BED - at[1]).toFixed(2)}L${start[0].toFixed(2)} ${(BED - start[1]).toFixed(2)}`);
    at = start;
  }
  return {
    outer: outerLoops.map(path).join(""),
    inner: innerLoops.map(path).join(""),
    infill: solid ? "" : lines.join(""),
    solid: solid ? lines.join("") : "",
    travel: travel.join(""),
    length,
    layer,
    z: Math.round((0.2 + (layer - 1) * layerHeight) * 100) / 100,
  };
};
