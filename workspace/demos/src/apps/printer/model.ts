import type { HistoryJob } from "./data/history";

export type Axes = readonly [x: number, y: number, z: number, e: number];

export type HeaterId = "extruder" | "bed";

export type Heater = { temp: number; target: number; power: number };

export type PrintState = "standby" | "printing" | "paused" | "complete" | "cancelled" | "error";

export type LogKind = "command" | "response" | "info" | "error";

export type LogEntry = { id: number; time: number; kind: LogKind; text: string; auto?: boolean };

export type FileMeta = {
  slicer: string;
  slicerVersion: string;
  layerCount: number;
  objectHeight: number;
  estimatedTime: number;
  nozzle: number;
  layerHeight: number;
  extruderTemp: number;
  bedTemp: number;
  chamberTemp: number;
  filamentType: string;
  filamentTotal: number;
  filamentWeight: number;
};

export type FileEntry = {
  path: string;
  name: string;
  folder: string;
  modified: number;
  size: number;
  meta: FileMeta;
};

export type PrintInfo = {
  state: PrintState;
  file: string | null;
  jobId: string | null;
  progress: number;
  printDuration: number;
  totalDuration: number;
  filamentUsed: number;
  startedAt: number | null;
  remaining: number;
  rate: number;
  anchor: { progress: number; z: number };
  message: string;
  timeScale: number;
  pauseAtLayer: number | null;
  pauseNextLayer: boolean;
};

export type Mesh = { name: string; points: readonly (readonly number[])[]; interpolated: readonly (readonly number[])[] };

export type EndstopState = "open" | "TRIGGERED";

export type Series = { temp: readonly number[]; power: readonly number[]; target: readonly number[] };

export type SimState = {
  clock: number;
  tick: number;
  klippy: "ready" | "restarting";
  print: PrintInfo;
  extruder: Heater;
  bed: Heater;
  series: Record<HeaterId, Series>;
  gcode: Axes;
  live: Axes;
  homed: { x: boolean; y: boolean; z: boolean };
  absolute: boolean;
  absoluteExtrude: boolean;
  velocity: number;
  flow: number;
  speedFactor: number;
  extrudeFactor: number;
  zOffset: number;
  pressureAdvance: number;
  smoothTime: number;
  limits: { velocity: number; squareCornerVelocity: number; accel: number; minCruiseRatio: number };
  fan: number;
  hotendFan: number;
  beeper: boolean;
  meshProfile: string | null;
  meshes: Record<string, Mesh>;
  endstops: Record<"x" | "y" | "z", EndstopState> | null;
  log: readonly LogEntry[];
  logSeq: number;
  history: readonly HistoryJob[];
  files: readonly FileEntry[];
  folders: readonly string[];
  queue: readonly string[];
  restarted: Record<string, number>;
};

export type MacroParam = { name: string; label: string; value: string };

export type MacroDef = { name: string; description: string; params: readonly MacroParam[] };

export type CommandDef = { name: string; description: string; kind: "gcode" | "klipper" | "macro" };

export const printing = (state: PrintState) => state === "printing" || state === "paused";
