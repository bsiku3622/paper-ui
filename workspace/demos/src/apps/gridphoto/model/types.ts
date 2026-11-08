export type Filter = "original" | "scan" | "bw";
export type RatioChoice = "auto" | "a" | "letter" | "square";

export type Pt = { x: number; y: number };
export type Quad = [Pt, Pt, Pt, Pt];
export type Win = [number, number, number, number];

export type StepId = "open" | "sheet" | "lines" | "lattice" | "refine";
export type PageStatus = "queued" | "working" | "ready" | "failed";

export type Scenario = "graph" | "sheet" | "lined" | "object" | "unsure" | "lost" | "broken";

export type Photo = {
  seed: string;
  art: "document" | "photo";
  grid: boolean;
  ratio: number;
  win: Win;
  width: number;
  height: number;
  bytes: number;
};

export type Fit = {
  kind: "sheet" | "grid";
  origin: "auto" | "manual" | "none";
  lines?: "grid" | "ruled";
  quad: Quad;
  cols?: number;
  rows?: number;
  ratio?: number;
  rect?: boolean;
  pxPerCell: number;
  residual?: number;
  confidence: number;
};

export type Settings = {
  filter: Filter;
  rotation: number;
  ratio: RatioChoice;
  crop: boolean;
  align: boolean;
};

export type Page = {
  id: string;
  name: string;
  photo: Photo;
  scenario: Scenario;
  status: PageStatus;
  stepIndex: number;
  problem?: string;
  fit: Fit | null;
  aligned: Fit | null;
  gridSearched: boolean;
  reduced: boolean;
  filled: number;
  settings: Settings;
};

export type Doc = {
  pages: Page[];
  currentId: string | null;
  imported: number;
  format: "png" | "jpeg";
  showGrid: boolean;
};

export type EditTarget = "sheet" | "grid";
