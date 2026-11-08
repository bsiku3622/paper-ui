// The stand-in for the engine. A photo here is a name, and its name decides what the "engine" finds in it, the same way every
// time: a sheet and the grid on it, a plain sheet, a lined page, an object on a grid, a sheet it is unsure of, nothing at
// all, or a file it cannot open. Nothing reads real pixels.

import { random } from "../../../kit";
import { clampQuad, cellsQuad, outsideFraction, quadSides, sliceWin, wholePhoto } from "./geometry";
import type { Doc, Fit, Page, Photo, Quad, Scenario, Settings, Win } from "./types";

export const DEFAULT_SETTINGS: Settings = { filter: "scan", rotation: 0, ratio: "auto", crop: true, align: false };

export const HEIC_PROBLEM = "이 파일은 사진으로 열 수 없습니다. JPEG, PNG, WebP를 올려 주세요. HEIC는 브라우저에 따라 열리지 않습니다.";
export const MEMORY_PROBLEM = "사진을 처리하지 못했습니다. 사진이 너무 크면 이 기기의 메모리가 모자랄 수 있습니다.";

// Where the mock camera stood for a photo of an object on the grid: close enough that no edge of the paper is in view, with
// whole cells 1 to 11 across and 1 to 8 down inside it.
const OBJECT_WIN: Win = [16, 11, 84, 62];

export type Shot = { scenario: Scenario; landscape?: boolean; big?: boolean; problem?: string };

export const photoFor = (name: string, shot: Shot): Photo => {
  const r = random(`${name}:file`);
  const { scenario } = shot;
  const big = Boolean(shot.big);
  const bytes = Math.round((big ? 13.8 : 2.2 + r() * 3.4) * 1024 * 1024);
  if (scenario === "lost") return { seed: name, art: "photo", grid: false, ratio: 4 / 3, win: sliceWin(4 / 3), width: 4032, height: 3024, bytes };
  if (scenario === "object") return { seed: name, art: "document", grid: true, ratio: 4 / 3, win: OBJECT_WIN, width: 4032, height: 3024, bytes };
  const grid = scenario === "graph";
  if (shot.landscape) return { seed: name, art: "document", grid, ratio: 4 / 3, win: sliceWin(4 / 3), width: 4032, height: 3024, bytes };
  const [width, height] = big ? [6000, 7500] : [3024, 3780];
  return { seed: name, art: "document", grid, ratio: 0.8, win: sliceWin(0.8), width, height, bytes };
};

export const newPage = (id: string, name: string, shot: Shot): Page => ({
  id,
  name,
  photo: photoFor(name, shot),
  scenario: shot.scenario,
  status: "queued",
  stepIndex: 0,
  ...(shot.problem ? { problem: shot.problem } : {}),
  fit: null,
  aligned: null,
  gridSearched: false,
  reduced: Boolean(shot.big),
  filled: 0,
  settings: { ...DEFAULT_SETTINGS },
});

// The common papers, measured a little off as perspective makes them.
const PAPERS = [Math.SQRT1_2, 8.5 / 11, 0.62, 0.857];
const paperOf = (name: string, scenario: Scenario) => {
  const r = random(`${name}:paper`);
  const base = scenario === "unsure" ? 0.62 : r() < 0.78 ? PAPERS[0]! : PAPERS[1]!;
  return base * (1 + (r() - 0.5) * 0.03);
};

const disturb = (quad: Quad, name: string, amount: number): Quad => {
  const r = random(`${name}:noise`);
  return quad.map((p) => ({ x: p.x + (r() - 0.5) * 2 * amount, y: p.y + (r() - 0.5) * 2 * amount })) as Quad;
};

const pitchOf = (photo: Photo, quad: Quad, cols: number, rows: number) => {
  const { across, down } = quadSides(quad, photo.width, photo.height);
  return Math.max(4, Math.round(Math.sqrt((across / cols) * (down / rows))));
};

const sheetFit = (page: Page, confidence: number, amount: number): { fit: Fit; filled: number } => {
  const { photo, name } = page;
  const raw = disturb(cellsQuad(photo, 0, 0, 12, 12), name, amount);
  const quad = clampQuad(raw);
  return {
    fit: { kind: "sheet", origin: "auto", quad, ratio: paperOf(name, page.scenario), rect: true, pxPerCell: Math.round(quadSides(quad, photo.width, photo.height).across), confidence },
    filled: outsideFraction(raw),
  };
};

// The largest block of whole cells that lies inside the photo: a page running off the frame is aligned only where it is seen.
const cellsInside = (photo: Photo) => {
  const inside = (u: number, v: number) => {
    const p = cellsQuad(photo, u, v, u, v)[0];
    return p.x >= 0.002 && p.x <= 0.998 && p.y >= 0.002 && p.y <= 0.998;
  };
  let best = { u0: 0, v0: 0, u1: 12, v1: 12, area: 0 };
  for (let u0 = 0; u0 <= 4; u0++) {
    for (let u1 = 12; u1 >= 8; u1--) {
      for (let v0 = 0; v0 <= 4; v0++) {
        for (let v1 = 12; v1 >= 8; v1--) {
          const area = (u1 - u0) * (v1 - v0);
          if (area > best.area && inside(u0, v0) && inside(u1, v0) && inside(u1, v1) && inside(u0, v1)) best = { u0, v0, u1, v1, area };
        }
      }
    }
  }
  return best;
};

// The sheet again, pulled along what is printed on it. A graph's cells come out square; ruled lines come out straight.
// Corners someone placed by hand are taken as the sheet's outline, with the whole page's lines inside them.
export const alignedFit = (page: Page, lines: "grid" | "ruled", outline?: Quad): Fit => {
  const { photo } = page;
  const found = cellsInside(photo);
  const quad = outline ?? cellsQuad(photo, found.u0, found.v0, found.u1, found.v1);
  const rows = outline ? 12 : found.v1 - found.v0;
  const { across, down } = quadSides(quad, photo.width, photo.height);
  // A lined page counts lines down it, and the same distance across it.
  const cols = lines === "grid" ? (outline ? 12 : found.u1 - found.u0) : Math.max(1, Math.round((across * rows) / down));
  return { kind: "grid", origin: "auto", lines, quad, cols, rows, rect: true, pxPerCell: pitchOf(photo, quad, cols, rows), confidence: lines === "grid" ? 0.96 : 0.88 };
};

// ── Corners placed by hand. ──

export const manualSheet = (page: Page, quad: Quad): Fit => {
  const { across, down } = quadSides(quad, page.photo.width, page.photo.height);
  return { kind: "sheet", origin: "manual", quad, ratio: across / down, rect: true, pxPerCell: Math.round(across), confidence: 1 };
};

export const manualGrid = (page: Page, quad: Quad, cols: number, rows: number): Fit => ({
  kind: "grid",
  origin: "manual",
  quad,
  cols,
  rows,
  pxPerCell: pitchOf(page.photo, quad, cols, rows),
  confidence: 1,
});

// Whether a plain sheet turns out to have something printed on it when someone asks for a search.
export const printedOn = (page: Page): "grid" | "ruled" | null => (page.photo.grid ? "grid" : page.scenario === "lined" ? "ruled" : null);

// What a page becomes when its steps are over.
export const finish = (page: Page): Page => {
  const { photo, name, scenario } = page;
  const base: Page = { ...page, stepIndex: 0 };
  if (scenario === "broken") return { ...base, status: "failed", problem: page.problem ?? MEMORY_PROBLEM, fit: null, aligned: null, gridSearched: false, filled: 0 };
  if (scenario === "lost") {
    const fit: Fit = { kind: "sheet", origin: "none", quad: wholePhoto(), ratio: photo.ratio, rect: true, pxPerCell: photo.width, confidence: 0 };
    return { ...base, status: "ready", fit, aligned: null, gridSearched: true, filled: 0, settings: { ...page.settings, filter: "original", align: false } };
  }
  if (scenario === "object") {
    const quad = cellsQuad(photo, 1, 1, 11, 8);
    const r = random(`${name}:residual`);
    const fit: Fit = { kind: "grid", origin: "auto", lines: "grid", quad, cols: 10, rows: 7, pxPerCell: pitchOf(photo, quad, 10, 7), residual: 0.2 + r() * 0.4, confidence: 0.88 };
    return { ...base, status: "ready", fit, aligned: null, gridSearched: true, filled: 0, settings: { ...page.settings, filter: "original", align: false } };
  }
  const found = sheetFit(page, scenario === "unsure" ? 0.52 : 0.91, scenario === "unsure" ? 0.035 : 0.004);
  if (scenario === "graph" || scenario === "lined") {
    const aligned = alignedFit(page, scenario === "graph" ? "grid" : "ruled");
    return { ...base, status: "ready", fit: found.fit, aligned, gridSearched: true, filled: found.filled, settings: { ...page.settings, filter: "scan", align: true } };
  }
  return { ...base, status: "ready", fit: found.fit, aligned: null, gridSearched: false, filled: found.filled, settings: { ...page.settings, filter: "scan", align: false } };
};

// ── The document a first visit opens: a session of scanning a notebook. ──

const SEED_SHOTS: { name: string; shot: Shot; settings?: Partial<Settings> }[] = [
  { name: "IMG_4412", shot: { scenario: "graph" } },
  { name: "IMG_4413", shot: { scenario: "graph" }, settings: { filter: "bw" } },
  { name: "IMG_4414", shot: { scenario: "graph", landscape: true } },
  { name: "IMG_4415", shot: { scenario: "sheet" }, settings: { ratio: "letter" } },
  { name: "IMG_4416", shot: { scenario: "object" } },
  { name: "IMG_4417", shot: { scenario: "lined" } },
  { name: "IMG_4418", shot: { scenario: "unsure" } },
  { name: "IMG_4419", shot: { scenario: "lost" } },
  { name: "IMG_4420", shot: { scenario: "broken", problem: HEIC_PROBLEM } },
  { name: "IMG_4421", shot: { scenario: "graph", big: true }, settings: { rotation: 0 } },
];

// The seed counts as photos added already, so the names go on after it; the mock picker's order starts after it too.
export const SEED_COUNT = SEED_SHOTS.length;

export const seedDocument = (): Doc => {
  const pages = SEED_SHOTS.map(({ name, shot, settings }, index) => {
    const done = finish(newPage(`p${index + 1}`, name, shot));
    return settings ? { ...done, settings: { ...done.settings, ...settings } } : done;
  });
  return { pages, currentId: pages[0]!.id, imported: pages.length, format: "png", showGrid: true };
};

export const emptyDocument = (imported: number): Doc => ({ pages: [], currentId: null, imported, format: "png", showGrid: true });

// ── What a button press or a drop brings in. ──

// The mock picker hands out photos in this order, three at a time, so a few batches show every outcome.
const BATCH: Shot[] = [
  { scenario: "graph" },
  { scenario: "sheet" },
  { scenario: "object" },
  { scenario: "graph", landscape: true },
  { scenario: "unsure" },
  { scenario: "lined" },
  { scenario: "lost" },
  { scenario: "graph" },
  { scenario: "broken", problem: HEIC_PROBLEM },
  { scenario: "sheet" },
  { scenario: "graph", big: true },
  { scenario: "broken", problem: MEMORY_PROBLEM },
];

export const nameAfter = (count: number) => `IMG_${4412 + count}`;

export const mockShot = (index: number): Shot => BATCH[((index % BATCH.length) + BATCH.length) % BATCH.length]!;

// A dropped or pasted file keeps its own name; what is found in it follows from the name.
export const shotForFile = (fileName: string): Shot => {
  if (/\.(heic|heif)$/i.test(fileName)) return { scenario: "broken", problem: HEIC_PROBLEM };
  const r = random(fileName)();
  const scenario: Scenario = r < 0.4 ? "graph" : r < 0.6 ? "sheet" : r < 0.72 ? "object" : r < 0.82 ? "lined" : r < 0.9 ? "unsure" : "lost";
  return { scenario, landscape: r > 0.55 && r < 0.62 };
};

export const baseName = (fileName: string) => {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(0, dot) : fileName || "photo";
};
