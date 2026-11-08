// What the console knows about the printer: the shapes of the mock state that the simulation moves and the pages read.

import type { HistoryJob } from "./data/history";

export type Axes = readonly [x: number, y: number, z: number, e: number];

export type HeaterId = "extruder" | "bed";

export type Heater = { temp: number; target: number; power: number };

export type PrintState = "standby" | "printing" | "paused" | "complete" | "cancelled" | "error";

export type LogKind = "command" | "response" | "info" | "error";

// `auto` marks a line the printer said on its own (a temperature report), as opposed to an answer to a command.
export type LogEntry = { id: number; time: number; kind: LogKind; text: string; auto?: boolean };

export type FileMeta = {
  slicer: string;
  slicerVersion: string;
  layerCount: number;
  objectHeight: number;
  // seconds
  estimatedTime: number;
  nozzle: number;
  layerHeight: number;
  extruderTemp: number;
  bedTemp: number;
  chamberTemp: number;
  filamentType: string;
  // mm
  filamentTotal: number;
  // g
  filamentWeight: number;
};

export type FileEntry = {
  // Relative to /gcodes, folder included: "Latch/CAP, LATCH MINI_PLA_47m25s.gcode".
  path: string;
  name: string;
  folder: string;
  // unix seconds
  modified: number;
  size: number;
  meta: FileMeta;
};

export type PrintInfo = {
  state: PrintState;
  file: string | null;
  jobId: string | null;
  // by file position, 0 to 1
  progress: number;
  // seconds
  printDuration: number;
  totalDuration: number;
  // mm
  filamentUsed: number;
  startedAt: number | null;
  // seconds left by file position
  remaining: number;
  // How much of the file one second of print covers.
  rate: number;
  // The height the nozzle was at when the print was at this progress, for the layers in between.
  anchor: { progress: number; z: number };
  message: string;
  // How many seconds of print pass in a second of the clock.
  timeScale: number;
  pauseAtLayer: number | null;
  pauseNextLayer: boolean;
};

export type Mesh = { name: string; points: readonly (readonly number[])[]; interpolated: readonly (readonly number[])[] };

export type EndstopState = "open" | "TRIGGERED";

export type Series = { temp: readonly number[]; power: readonly number[]; target: readonly number[] };

export type SimState = {
  // The mock clock, ms.
  clock: number;
  tick: number;
  klippy: "ready" | "restarting";
  print: PrintInfo;
  extruder: Heater;
  bed: Heater;
  series: Record<HeaterId, Series>;
  // Where the toolhead was told to go, and where it is.
  gcode: Axes;
  live: Axes;
  homed: { x: boolean; y: boolean; z: boolean };
  absolute: boolean;
  absoluteExtrude: boolean;
  // mm/s at this moment, and the volumetric flow in mm3/s.
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
  // The power devices and services the top bar's menu lists, and when each was last restarted (clock, ms).
  restarted: Record<string, number>;
};

export type MacroParam = { name: string; label: string; value: string };

export type MacroDef = { name: string; description: string; params: readonly MacroParam[] };

export type CommandDef = { name: string; description: string; kind: "gcode" | "klipper" | "macro" };

export const printing = (state: PrintState) => state === "printing" || state === "paused";
