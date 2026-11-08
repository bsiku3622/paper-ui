// Where things are in a photo. The kit's <Art kind="document"> draws a page on a desk inside a 100 x 100 drawing: the page
// is 72 x 84, ruled in 12 x 12 cells of 6 x 7, and the whole drawing is turned by a few seeded degrees. A mock photo is a
// window onto that drawing, so a corner, a grid line or a flattened page can be put exactly on the picture.

import { random } from "../../../kit";
import type { Photo, Pt, Quad, Win } from "./types";

export const SHEET = { x0: 14, y0: 8, cellW: 6, cellH: 7, cols: 12, rows: 12 } as const;

// The kit draws its first random number as the tilt.
export const tiltOf = (seed: string) => (random(seed)() - 0.5) * 6;

// The window that "slice" fitting leaves of the 100 x 100 drawing in a frame of this shape.
export const sliceWin = (ratio: number): Win => (ratio >= 1 ? [0, 50 - 50 / ratio, 100, 50 + 50 / ratio] : [50 - 50 * ratio, 0, 50 + 50 * ratio, 100]);

const turn = (x: number, y: number, degrees: number): [number, number] => {
  const t = (degrees * Math.PI) / 180;
  const dx = x - 50;
  const dy = y - 50;
  return [50 + dx * Math.cos(t) - dy * Math.sin(t), 50 + dx * Math.sin(t) + dy * Math.cos(t)];
};

// A point on the printed page, counted in cells from its top-left corner, as a fraction of the photo.
export const onPhoto = (photo: Photo, u: number, v: number): Pt => {
  const [x, y] = turn(SHEET.x0 + SHEET.cellW * u, SHEET.y0 + SHEET.cellH * v, tiltOf(photo.seed));
  const [x0, y0, x1, y1] = photo.win;
  return { x: (x - x0) / (x1 - x0), y: (y - y0) / (y1 - y0) };
};

// The page's four corners, or any whole-cell rectangle of it.
export const cellsQuad = (photo: Photo, u0: number, v0: number, u1: number, v1: number): Quad => [onPhoto(photo, u0, v0), onPhoto(photo, u1, v0), onPhoto(photo, u1, v1), onPhoto(photo, u0, v1)];

export const wholePhoto = (): Quad => [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];

// A fraction of the photo to a place in the 100 x 100 drawing.
export const inDrawing = (win: Win, pt: Pt): [number, number] => [win[0] + pt.x * (win[2] - win[0]), win[1] + pt.y * (win[3] - win[1])];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const clampPt = (pt: Pt): Pt => ({ x: clamp(pt.x), y: clamp(pt.y) });
export const clampQuad = (quad: Quad): Quad => quad.map(clampPt) as Quad;

// A homography needs a convex outline in the same turning order as the lattice (top-left, then clockwise).
export const quadIsValid = (quad: Quad): boolean => {
  for (let i = 0; i < 4; i++) {
    const a = quad[i]!;
    const b = quad[(i + 1) % 4]!;
    const c = quad[(i + 2) % 4]!;
    if ((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x) <= 1e-6) return false;
  }
  return true;
};

// The point s of the way along the top edge and t of the way down, in a quad.
export const inQuad = (quad: Quad, s: number, t: number): Pt => {
  const [a, b, c, d] = quad;
  const top = { x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s };
  const bottom = { x: d.x + (c.x - d.x) * s, y: d.y + (c.y - d.y) * s };
  return { x: top.x + (bottom.x - top.x) * t, y: top.y + (bottom.y - top.y) * t };
};

const fixed = (value: number) => value.toFixed(4);

// An outline, or the lines of a lattice drawn over a quad, as an SVG path in fractions of the photo.
export const outlinePath = (quad: Quad): string => `M${quad.map((p) => `${fixed(p.x)} ${fixed(p.y)}`).join("L")}Z`;

// `rowsOnly` is a lined page: its lines run one way, and the quad's sides are only its edges.
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

// Pixels of the file the quad covers.
export const quadPixels = (quad: Quad, width: number, height: number): number => {
  let sum = 0;
  for (let i = 0; i < 4; i++) {
    const a = quad[i]!;
    const b = quad[(i + 1) % 4]!;
    sum += a.x * width * (b.y * height) - b.x * width * (a.y * height);
  }
  return Math.abs(sum) / 2;
};

// Side lengths of a quad in pixels of the file: across (top and bottom) and down (left and right).
export const quadSides = (quad: Quad, width: number, height: number) => {
  const side = (a: Pt, b: Pt) => Math.hypot((a.x - b.x) * width, (a.y - b.y) * height);
  return { across: (side(quad[0], quad[1]) + side(quad[3], quad[2])) / 2, down: (side(quad[0], quad[3]) + side(quad[1], quad[2])) / 2 };
};

// Fraction of a quad that lies outside the photo.
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

// The 3 x 3 matrix (row by row, last entry 1) that carries four points onto four others.
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

// The same matrix as a CSS transform (the browser reads the 4 x 4 column by column).
export const matrix3d = (h: number[]): string => {
  const [a, b, c, d, e, f, g, i] = h as [number, number, number, number, number, number, number, number];
  return `matrix3d(${[a, d, 0, g, b, e, 0, i, 0, 0, 1, 0, c, f, 0, 1].map((n) => n.toFixed(8)).join(",")})`;
};
