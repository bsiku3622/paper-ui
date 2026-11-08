// The shapes of a document: pages, what was found on each of them, and how each is set. Everything here is plain data
// (it is kept in localStorage), so a page holds fractions and numbers, never pictures.

export type Filter = "original" | "scan" | "bw";
export type RatioChoice = "auto" | "a" | "letter" | "square";

export type Pt = { x: number; y: number };
// Top-left, top-right, bottom-right, bottom-left, as fractions of the photo's width and height.
export type Quad = [Pt, Pt, Pt, Pt];
// The part of the picture's 100 x 100 drawing that a photo shows: x0, y0, x1, y1.
export type Win = [number, number, number, number];

export type StepId = "open" | "sheet" | "lines" | "lattice" | "refine";
export type PageStatus = "queued" | "working" | "ready" | "failed";

// What the mock "finds" in a photo. It decides how the steps end; the screens never name it.
export type Scenario = "graph" | "sheet" | "lined" | "object" | "unsure" | "lost" | "broken";

export type Photo = {
  seed: string;
  art: "document" | "photo";
  // Graph lines printed on the paper.
  grid: boolean;
  // Width over height of the photo.
  ratio: number;
  win: Win;
  // The file as it came.
  width: number;
  height: number;
  bytes: number;
};

export type Fit = {
  // A sheet is pulled by its outline into a rectangle of its own shape; a grid is pulled so its cells come out square.
  kind: "sheet" | "grid";
  // "none": nothing was found, so the page is simply the whole photo.
  origin: "auto" | "manual" | "none";
  lines?: "grid" | "ruled";
  quad: Quad;
  // Grid: whole cells across and down. Ruled: the lines down the page.
  cols?: number;
  rows?: number;
  // Sheet: width over height of the paper as measured.
  ratio?: number;
  // The output is exactly this region, so there are no empty corners to trim.
  rect?: boolean;
  // Output pixels per cell (or per line on a lined page).
  pxPerCell: number;
  // Grid found by itself: the error left over, in pixels.
  residual?: number;
  // 0 to 1.
  confidence: number;
};

export type Settings = {
  filter: Filter;
  // Quarter turns clockwise.
  rotation: number;
  ratio: RatioChoice;
  crop: boolean;
  // Use the grid or the lines printed on the sheet, when there are some.
  align: boolean;
};

export type Page = {
  id: string;
  name: string;
  photo: Photo;
  scenario: Scenario;
  status: PageStatus;
  // Which of its steps a working page is on.
  stepIndex: number;
  problem?: string;
  fit: Fit | null;
  // The sheet again, shaped by the grid or the lines printed on it.
  aligned: Fit | null;
  // A search for printed lines has run, so an empty `aligned` means there really are none.
  gridSearched: boolean;
  // The photo was larger than this device can hold, so it was reduced.
  reduced: boolean;
  // Fraction of the sheet that lay outside the photo and was filled with paper colour.
  filled: number;
  settings: Settings;
};

export type Doc = {
  pages: Page[];
  currentId: string | null;
  // Photos added so far, so each batch brings new names.
  imported: number;
  format: "png" | "jpeg";
  // Lay a perfect grid over a flattened grid page.
  showGrid: boolean;
};

export type EditTarget = "sheet" | "grid";
