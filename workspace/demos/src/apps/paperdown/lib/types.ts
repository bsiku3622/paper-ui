// The shapes of a Paperdown document and what its settings mean. They follow the original's document.ts: a page is a
// paper size in millimetres (with a landscape switch and a margin), a face and a size in points, a leading, and a zoom.

export type Paper = "a4" | "a5" | "letter" | "custom";
export type FontFace = "sans" | "myeongjo";
export type PageMode = "continuous" | "pages";
export type Zoom = number | "fit";

export type Settings = {
  paper: Paper;
  // Millimetres, used when `paper` is "custom".
  width: number;
  height: number;
  landscape: boolean;
  mode: PageMode;
  margin: number;
  font: FontFace;
  sizePt: number;
  leading: number;
  zoom: Zoom;
};

export type DocumentData = {
  // "local" is the one document this browser keeps; a signed-in account's notes have ids of their own.
  id: string;
  title: string;
  // The document as the editor holds it: the HTML of the paper.
  html: string;
  settings: Settings;
  updatedAt: number;
};

export const DEFAULT_SETTINGS: Settings = {
  paper: "a4",
  width: 210,
  height: 297,
  landscape: false,
  mode: "continuous",
  margin: 20,
  font: "myeongjo",
  sizePt: 10,
  leading: 1.6,
  zoom: 125,
};

// What the toolbar offers, as the original lists it.
export const LEADINGS = [1, 1.15, 1.3, 1.5, 1.6, 1.9, 2, 2.5, 3] as const;
export const ZOOMS = [50, 75, 100, 125, 150, 175, 200] as const;
export const SIZES = [6, 8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72, 96] as const;

export const PAPERS: { id: Paper; label: string }[] = [
  { id: "a4", label: "A4 · 210 × 297 mm" },
  { id: "a5", label: "A5 · 148 × 210 mm" },
  { id: "letter", label: "Letter · 216 × 279 mm" },
  { id: "custom", label: "사용자 지정" },
];

export const PX_PER_MM = 96 / 25.4;

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

// The size of the paper in millimetres, turned over when it lies on its side.
export const dimensions = (settings: Settings) => {
  const sizes: Record<Paper, [number, number]> = { a4: [210, 297], a5: [148, 210], letter: [215.9, 279.4], custom: [settings.width, settings.height] };
  const [width, height] = sizes[settings.paper];
  return settings.landscape ? { width: height, height: width } : { width, height };
};

const bounded = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? clamp(value, min, max) : fallback;

// Anything that came from outside (a file, a stored value) becomes a document the editor can hold.
export const normalizeSettings = (value: unknown): Settings => {
  const given = (value ?? {}) as Partial<Settings>;
  return {
    ...DEFAULT_SETTINGS,
    paper: (["a4", "a5", "letter", "custom"] as const).includes(given.paper as Paper) ? (given.paper as Paper) : "a4",
    mode: given.mode === "pages" ? "pages" : "continuous",
    font: given.font === "sans" ? "sans" : "myeongjo",
    width: bounded(given.width, 80, 500, 210),
    height: bounded(given.height, 80, 2000, 297),
    margin: bounded(given.margin, 5, 50, 20),
    sizePt: bounded(given.sizePt, 6, 96, 10),
    leading: bounded(given.leading, 1, 3, 1.6),
    zoom: given.zoom === "fit" ? "fit" : bounded(given.zoom, 50, 200, 125),
    landscape: Boolean(given.landscape),
  };
};
