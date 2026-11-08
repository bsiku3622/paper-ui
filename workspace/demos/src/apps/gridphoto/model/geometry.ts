import { random } from "../../../kit";
import type { Photo, Pt, Quad, Win } from "./types";

export const SHEET = { x0: 14, y0: 8, cellW: 6, cellH: 7, cols: 12, rows: 12 } as const;

export const tiltOf = (seed: string) => (random(seed)() - 0.5) * 6;

export const sliceWin = (ratio: number): Win => (ratio >= 1 ? [0, 50 - 50 / ratio, 100, 50 + 50 / ratio] : [50 - 50 * ratio, 0, 50 + 50 * ratio, 100]);

const turn = (x: number, y: number, degrees: number): [number, number] => {
  const t = (degrees * Math.PI) / 180;
  const dx = x - 50;
  const dy = y - 50;
  return [50 + dx * Math.cos(t) - dy * Math.sin(t), 50 + dx * Math.sin(t) + dy * Math.cos(t)];
};

export const onPhoto = (photo: Photo, u: number, v: number): Pt => {
  const [x, y] = turn(SHEET.x0 + SHEET.cellW * u, SHEET.y0 + SHEET.cellH * v, tiltOf(photo.seed));
  const [x0, y0, x1, y1] = photo.win;
  return { x: (x - x0) / (x1 - x0), y: (y - y0) / (y1 - y0) };
};

export const cellsQuad = (photo: Photo, u0: number, v0: number, u1: number, v1: number): Quad => [onPhoto(photo, u0, v0), onPhoto(photo, u1, v0), onPhoto(photo, u1, v1), onPhoto(photo, u0, v1)];

export const wholePhoto = (): Quad => [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];

export const inDrawing = (win: Win, pt: Pt): [number, number] => [win[0] + pt.x * (win[2] - win[0]), win[1] + pt.y * (win[3] - win[1])];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const clampPt = (pt: Pt): Pt => ({ x: clamp(pt.x), y: clamp(pt.y) });
export const clampQuad = (quad: Quad): Quad => quad.map(clampPt) as Quad;

export const quadIsValid = (quad: Quad): boolean => {
  for (let i = 0; i < 4; i++) {
    const a = quad[i]!;
    const b = quad[(i + 1) % 4]!;
    const c = quad[(i + 2) % 4]!;
    if ((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x) <= 1e-6) return false;
  }
  return true;
};

export const inQuad = (quad: Quad, s: number, t: number): Pt => {
  const [a, b, c, d] = quad;
  const top = { x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s };
  const bottom = { x: d.x + (c.x - d.x) * s, y: d.y + (c.y - d.y) * s };
  return { x: top.x + (bottom.x - top.x) * t, y: top.y + (bottom.y - top.y) * t };
};

const fixed = (value: number) => value.toFixed(4);

export const outlinePath = (quad: Quad): string => `M${quad.map((p) => `${fixed(p.x)} ${fixed(p.y)}`).join("L")}Z`;

export const latticePath = (quad: Quad, cols: number, rows: number, rowsOnly = false): string => {
  const parts: string[] = [];
  const at = (s: number, t: number) => {
    const p = inQuad(quad, s, t);
    return `${fixed(p.x)} ${fixed(p.y)}`;
  };
  if (rowsOnly) {
    parts.push(`M${at(0, 0)}L${at(0, 1)}M${at(1, 0)}L${at(1, 1)}`);
  } else {
    for (let i = 0; i <= cols; i++) parts.push(`M${at(i / cols, 0)}L${at(i / cols, 1)}`);
  }
  for (let j = 0; j <= rows; j++) parts.push(`M${at(0, j / rows)}L${at(1, j / rows)}`);
  return parts.join("");
};

export const quadPixels = (quad: Quad, width: number, height: number): number => {
  let sum = 0;
  for (let i = 0; i < 4; i++) {
    const a = quad[i]!;
    const b = quad[(i + 1) % 4]!;
    sum += a.x * width * (b.y * height) - b.x * width * (a.y * height);
  }
  return Math.abs(sum) / 2;
};

export const quadSides = (quad: Quad, width: number, height: number) => {
  const side = (a: Pt, b: Pt) => Math.hypot((a.x - b.x) * width, (a.y - b.y) * height);
  return { across: (side(quad[0], quad[1]) + side(quad[3], quad[2])) / 2, down: (side(quad[0], quad[3]) + side(quad[1], quad[2])) / 2 };
};

export const outsideFraction = (quad: Quad): number => {
  const n = 24;
  let outside = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const p = inQuad(quad, (i + 0.5) / n, (j + 0.5) / n);
      if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) outside++;
    }
  }
  return outside / (n * n);
};

export const homography = (from: [number, number][], to: [number, number][]): number[] => {
  const rows: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = from[i]!;
    const [X, Y] = to[i]!;
    rows.push([x, y, 1, 0, 0, 0, -X * x, -X * y, X]);
    rows.push([0, 0, 0, x, y, 1, -Y * x, -Y * y, Y]);
  }
  for (let col = 0; col < 8; col++) {
    let best = col;
    for (let r = col + 1; r < 8; r++) if (Math.abs(rows[r]![col]!) > Math.abs(rows[best]![col]!)) best = r;
    [rows[col], rows[best]] = [rows[best]!, rows[col]!];
    const pivot = rows[col]![col]!;
    if (Math.abs(pivot) < 1e-12) return [1, 0, 0, 0, 1, 0, 0, 0, 1];
    for (let k = col; k < 9; k++) rows[col]![k] = rows[col]![k]! / pivot;
    for (let r = 0; r < 8; r++) {
      if (r === col) continue;
      const factor = rows[r]![col]!;
      if (factor === 0) continue;
      for (let k = col; k < 9; k++) rows[r]![k] = rows[r]![k]! - factor * rows[col]![k]!;
    }
  }
  return [...rows.map((row) => row[8]!), 1];
};

export const matrix3d = (h: number[]): string => {
  const [a, b, c, d, e, f, g, i] = h as [number, number, number, number, number, number, number, number];
  return `matrix3d(${[a, d, 0, g, b, e, 0, i, 0, 0, 1, 0, c, f, 0, 1].map((n) => n.toFixed(8)).join(",")})`;
};
