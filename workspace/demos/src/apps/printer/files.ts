import { random } from "../../kit";
import { GCODE_LIST } from "./data/gcodes";
import { HISTORY, type HistoryJob } from "./data/history";
import type { FileEntry, FileMeta } from "./model";

const FOLDERS: readonly { name: string; test: RegExp }[] = [
  { name: "Latch", test: /^(RING|SEAL|CAP|LEVER), LATCH/ },
  { name: "Calibration", test: /^(Calibration Cube|Benchy Boat)/ },
];

export const folderOf = (name: string) => FOLDERS.find((folder) => folder.test.test(name))?.name ?? "";

const TIME_IN_NAME = /_(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?\.gcode$/;

export const secondsInName = (name: string) => {
  const match = TIME_IN_NAME.exec(name);
  if (!match) return 1800;
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
};

export const materialInName = (name: string) => /_(PLA|TPU|PETG|ABS)_/.exec(name)?.[1] ?? "PLA";

const slicerOf = (modified: number) => (modified < 1_779_000_000 ? "2.3.1" : modified < 1_789_000_000 ? "2.3.2" : "2.4.2");

const jobMeta = new Map<string, HistoryJob["meta"]>();
for (const job of HISTORY) if (job.meta && !jobMeta.has(job.filename)) jobMeta.set(job.filename, job.meta);

const metaOf = (name: string, modified: number): FileMeta => {
  const known = jobMeta.get(name);
  if (known) {
    return {
      slicer: known.slicer,
      slicerVersion: known.slicerVersion,
      layerCount: known.layerCount,
      objectHeight: known.objectHeight,
      estimatedTime: known.estimatedTime,
      nozzle: known.nozzle,
      layerHeight: known.layerHeight,
      extruderTemp: known.extruderTemp,
      bedTemp: known.bedTemp,
      chamberTemp: 0,
      filamentType: known.filamentType,
      filamentTotal: known.filamentTotal,
      filamentWeight: known.filamentWeight,
    };
  }
  const r = random(name);
  const material = materialInName(name);
  const estimated = secondsInName(name) + Math.round(r() * 40 - 15);
  const height = Math.min(98, Math.max(4, Math.round((6 + (estimated / 3600) * 14 + r() * 10) * 2) / 2));
  const gramsPerSecond = (material === "TPU" ? 0.0058 : 0.0062) * (0.85 + r() * 0.3);
  const weight = Math.round(estimated * gramsPerSecond * 100) / 100;
  const density = material === "TPU" ? 1.21 : 1.24;
  const length = Math.round(((weight / density) / 0.02405) * 10 * 10) / 10;
  return {
    slicer: "OrcaSlicer",
    slicerVersion: slicerOf(modified),
    layerCount: Math.round(height / 0.2),
    objectHeight: height,
    estimatedTime: estimated,
    nozzle: 0.4,
    layerHeight: 0.2,
    extruderTemp: material === "TPU" ? 230 : modified < 1_790_000_000 ? 200 : 210,
    bedTemp: material === "TPU" ? 50 : 60,
    chamberTemp: 0,
    filamentType: material,
    filamentTotal: length,
    filamentWeight: weight,
  };
};

export const makeFile = (name: string, size: number, modified: number, folder: string): FileEntry => ({
  path: folder ? `${folder}/${name}` : name,
  name,
  folder,
  modified,
  size,
  meta: metaOf(name, modified),
});

export const buildFiles = (): FileEntry[] =>
  GCODE_LIST.map(([name, modified, size]) => {
    const folder = folderOf(name);
    return { path: folder ? `${folder}/${name}` : name, name, folder, modified, size, meta: metaOf(name, modified) };
  });

export const FOLDER_NAMES: readonly string[] = FOLDERS.map((folder) => folder.name);

export type FileHistory = { count: number; completed: number; last: HistoryJob | null; lastDone: HistoryJob | null };

export const historyOf = (history: readonly HistoryJob[], name: string): FileHistory => {
  let count = 0;
  let completed = 0;
  let last: HistoryJob | null = null;
  let lastDone: HistoryJob | null = null;
  for (const job of history) {
    if (job.filename !== name) continue;
    count++;
    if (job.status === "completed") completed++;
    if (!last) last = job;
    if (!lastDone && job.status !== "in_progress") lastDone = job;
  }
  return { count, completed, last, lastDone };
};

export const baseName = (path: string) => path.slice(path.lastIndexOf("/") + 1);
