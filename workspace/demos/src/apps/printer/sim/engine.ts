import { HISTORY, type HistoryJob } from "../data/history";
import { MESH_INTERPOLATED, MESH_PROBED } from "../data/mesh";
import { BED_POWER, BED_TEMPERATURE, EXTRUDER_POWER, EXTRUDER_TEMPERATURE } from "../data/temperatures";
import { buildFiles, FOLDER_NAMES } from "../files";
import { CAPTURED_AT } from "../format";
import type { Axes, FileMeta, Heater, HeaterId, LogEntry, LogKind, PrintInfo, Series, SimState } from "../model";
import { printing } from "../model";

export const AMBIENT = 24;
export const FILAMENT_AREA = 2.405;
export const MIN_EXTRUDE_TEMP = 170;
export const MAX_TEMP: Record<HeaterId, number> = { extruder: 270, bed: 100 };
export const AXIS_MIN = [-6, -14, -3] as const;
export const AXIS_MAX = [230, 230, 250] as const;
export const CONFIG_LIMITS = { velocity: 250, squareCornerVelocity: 5, accel: 2000, minCruiseRatio: 0.5 } as const;
export const SERIES_LENGTH = 1200;
const FIRST_LAYER = 0.2;

export const noise = (t: number, k: number) => {
  const x = Math.sin(t * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const wave = (t: number, period: number, phase = 0) => Math.sin((t / period) * Math.PI * 2 + phase);

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const addLog = (s: SimState, kind: LogKind, text: string, time: number = s.clock): SimState => {
  const entry: LogEntry = { id: s.logSeq + 1, time, kind, text };
  const log = s.log.length >= 1500 ? [...s.log.slice(-1200), entry] : [...s.log, entry];
  return { ...s, log, logSeq: entry.id };
};

type Event = { t: number; kind: LogKind; text: string; auto?: boolean };

const seedLog = (history: readonly HistoryJob[]): { log: LogEntry[]; seq: number } => {
  const events: Event[] = [];
  const jobs = [...history].reverse();
  jobs.forEach((job, index) => {
    const t0 = job.start * 1000;
    const size = job.meta?.size ?? 0;
    events.push({ t: t0, kind: "command", text: `SDCARD_PRINT_FILE FILENAME="${job.filename}"` });
    events.push({ t: t0 + 300, kind: "response", text: `File opened:${job.filename} Size:${size}` });
    events.push({ t: t0 + 600, kind: "response", text: "File selected" });
    const recent = index >= jobs.length - 6;
    const until = job.end !== null ? job.end * 1000 : CAPTURED_AT;
    if (recent) {
      for (let t = t0 + 600_000, n = 0; t < until && n < 40; t += 600_000, n++) {
        const a = (210 + (noise(t / 1000, 1) - 0.5) * 1.6).toFixed(1);
        const b = (60 + (noise(t / 1000, 2) - 0.5) * 0.12).toFixed(1);
        events.push({ t, kind: "response", text: `ok T:${a} /210.0 B:${b} /60.0`, auto: true });
      }
    }
    if (job.status === "completed" && job.end !== null) events.push({ t: job.end * 1000, kind: "response", text: "Done printing file" });
    if (job.status === "klippy_shutdown" && job.end !== null) {
      events.push({ t: job.end * 1000, kind: "error", text: "!! Heater extruder not heating at expected rate" });
      events.push({ t: job.end * 1000 + 200, kind: "info", text: "// Klipper state: Shutdown" });
    }
  });
  events.sort((a, b) => a.t - b.t);
  const log = events.map<LogEntry>((event, index) => ({ id: index + 1, time: event.t, kind: event.kind, text: event.text, ...(event.auto ? { auto: true } : {}) }));
  return { log, seq: log.length };
};

const HEX = (value: number) => value.toString(16).toUpperCase().padStart(6, "0");
export const nextJobId = (history: readonly HistoryJob[]) => HEX(history.reduce((top, job) => Math.max(top, parseInt(job.id, 16)), 0) + 1);

export const fileByPath = (s: SimState, path: string | null) => (path ? s.files.find((file) => file.path === path || file.name === path) ?? null : null);

export const metaOf = (s: SimState, path: string | null): FileMeta | null => fileByPath(s, path)?.meta ?? null;

export const heightAt = (print: PrintInfo, objectHeight: number) => {
  const { anchor } = print;
  if (anchor.progress >= 1) return objectHeight;
  const ratio = clamp((print.progress - anchor.progress) / (1 - anchor.progress), 0, 1);
  return clamp(anchor.z + ratio * (objectHeight - anchor.z), anchor.z, Math.max(anchor.z, objectHeight));
};

export const layerAt = (z: number, layerHeight: number) => Math.max(1, Math.round((z - FIRST_LAYER) / layerHeight) + 1);

export const layersOf = (s: SimState): { current: number; total: number } => {
  const meta = metaOf(s, s.print.file);
  if (!meta) return { current: 0, total: 0 };
  const active = printing(s.print.state) || s.print.state === "complete";
  if (!active) return { current: 0, total: meta.layerCount };
  const z = s.print.state === "complete" ? meta.objectHeight : heightAt(s.print, meta.objectHeight);
  return { current: Math.min(meta.layerCount, layerAt(z, meta.layerHeight)), total: meta.layerCount };
};

export const estimates = (s: SimState) => {
  const { print } = s;
  const meta = metaOf(s, print.file);
  const filament = meta && print.filamentUsed > 0 ? Math.max(0, print.printDuration * (meta.filamentTotal / print.filamentUsed - 1)) : null;
  const slicer = meta ? Math.max(0, meta.estimatedTime - print.printDuration) : null;
  return { file: print.remaining, filament, slicer };
};

const emptyAnchor = { progress: 0, z: FIRST_LAYER };

export const startPrint = (s: SimState, path: string): SimState => {
  const file = fileByPath(s, path);
  if (!file) return s;
  const id = nextJobId(s.history);
  const job: HistoryJob = {
    id,
    filename: file.name,
    status: "in_progress",
    start: Math.round(s.clock / 100) / 10,
    end: null,
    printDuration: 0,
    totalDuration: 0,
    filament: 0,
    exists: true,
    meta: {
      size: file.size,
      slicer: file.meta.slicer,
      slicerVersion: file.meta.slicerVersion,
      layerCount: file.meta.layerCount,
      objectHeight: file.meta.objectHeight,
      estimatedTime: file.meta.estimatedTime,
      nozzle: file.meta.nozzle,
      layerHeight: file.meta.layerHeight,
      extruderTemp: file.meta.extruderTemp,
      bedTemp: file.meta.bedTemp,
      filamentType: file.meta.filamentType,
      filamentTotal: file.meta.filamentTotal,
      filamentWeight: file.meta.filamentWeight,
    },
  };
  const print: PrintInfo = {
    state: "printing",
    file: file.path,
    jobId: id,
    progress: 0,
    printDuration: 0,
    totalDuration: 0,
    filamentUsed: 0,
    startedAt: s.clock,
    remaining: file.meta.estimatedTime,
    rate: 1 / file.meta.estimatedTime,
    anchor: emptyAnchor,
    message: "",
    timeScale: 1,
    pauseAtLayer: null,
    pauseNextLayer: false,
  };
  return {
    ...s,
    print,
    history: [job, ...s.history],
    extruder: { ...s.extruder, target: file.meta.extruderTemp },
    bed: { ...s.bed, target: file.meta.bedTemp },
    fan: 0,
    queue: s.queue.filter((item) => item !== file.path),
  };
};

const updateJob = (s: SimState, patch: Partial<HistoryJob>): SimState => {
  const id = s.print.jobId;
  if (!id) return s;
  return { ...s, history: s.history.map((job) => (job.id === id ? { ...job, ...patch } : job)) };
};

export const finishPrint = (s: SimState, how: "completed" | "cancelled"): SimState => {
  const { print } = s;
  const end = Math.round(s.clock / 100) / 10;
  let next = updateJob(s, { status: how, end, printDuration: Math.round(print.printDuration * 10) / 10, totalDuration: Math.round(print.totalDuration * 10) / 10, filament: Math.round(print.filamentUsed * 10) / 10 });
  next = {
    ...next,
    print: { ...print, state: how === "completed" ? "complete" : "cancelled", progress: how === "completed" ? 1 : print.progress, remaining: how === "completed" ? 0 : print.remaining },
    extruder: { ...next.extruder, target: 0 },
    bed: { ...next.bed, target: 0 },
    fan: how === "completed" ? 0 : next.fan,
  };
  if (how === "completed") next = addLog(next, "response", "Done printing file");
  const queued = next.queue[0];
  if (how === "completed" && queued) {
    next = addLog(next, "command", `SDCARD_PRINT_FILE FILENAME="${queued.slice(queued.lastIndexOf("/") + 1)}"`);
    next = startPrint(next, queued);
  }
  return next;
};

const stepHeater = (heater: Heater, id: HeaterId, tick: number): Heater => {
  const k = id === "extruder" ? 1 : 2;
  const { target } = heater;
  let temp = heater.temp;
  let power = 0;
  if (target > 0) {
    const gap = target - temp;
    if (Math.abs(gap) > 3) {
      const top = id === "extruder" ? 4.2 : 0.3;
      temp += Math.sign(gap) * Math.min(Math.abs(gap) * (id === "extruder" ? 0.1 : 0.02) + 0.05, top);
      power = gap > 0 ? 1 : 0;
    } else {
      const amplitude = id === "extruder" ? 0.45 : 0.035;
      const ripple = wave(tick, id === "extruder" ? 23 : 61, k) * amplitude + (noise(tick, k) - 0.5) * amplitude * 0.8;
      temp = target + ripple;
      power = clamp((id === "extruder" ? 0.58 : 0.14) - ripple * (id === "extruder" ? 0.18 : 1.2) + (noise(tick, k + 5) - 0.5) * 0.08, 0.02, 0.95);
    }
  } else {
    temp += (AMBIENT - temp) * (id === "extruder" ? 0.0045 : 0.0016) + (noise(tick, k) - 0.5) * 0.01;
  }
  return { temp: Math.round(temp * 100) / 100, target, power: Math.round(power * 100) / 100 };
};

const push = (list: readonly number[], value: number) => (list.length >= SERIES_LENGTH ? [...list.slice(1), value] : [...list, value]);

const stepSeries = (series: Series, heater: Heater): Series => ({
  temp: push(series.temp, heater.temp),
  power: push(series.power, heater.power),
  target: push(series.target, heater.target),
});

const pathAt = (t: number): readonly [number, number] => [
  115 + 14 * wave(t, 71) + 38 * wave(t, 7.3),
  115 + 10 * wave(t, 53, 1) + 32 * wave(t, 5.1, 2),
];

export const step = (s: SimState, dt = 1): SimState => {
  const tick = s.tick + 1;
  const clock = s.clock + dt * 1000;
  const extruder = stepHeater(s.extruder, "extruder", tick);
  const bed = stepHeater(s.bed, "bed", tick);
  let next: SimState = {
    ...s,
    tick,
    clock,
    extruder,
    bed,
    series: { extruder: stepSeries(s.series.extruder, extruder), bed: stepSeries(s.series.bed, bed) },
  };
  const { print } = s;
  if (print.state === "printing") {
    const scaled = dt * print.timeScale;
    const progress = Math.min(1, print.progress + print.rate * scaled);
    const wavy = wave(tick, 17, Math.PI / 2);
    const velocity = 98 * s.speedFactor * (0.55 + 0.45 * wavy);
    const flow = 8 * s.speedFactor * s.extrudeFactor * Math.max(0, wavy);
    const meta = metaOf(s, print.file);
    const here = pathAt(tick);
    const there = pathAt(tick - 1.4);
    const z = meta ? heightAt({ ...print, progress }, meta.objectHeight) : s.gcode[2];
    const used = print.filamentUsed + (flow / FILAMENT_AREA) * scaled;
    next = {
      ...next,
      velocity,
      flow,
      gcode: [here[0], here[1], z, s.gcode[3] + (flow / FILAMENT_AREA) * dt],
      live: [there[0], there[1], z - 0.05, s.live[3] + (flow / FILAMENT_AREA) * dt],
      print: {
        ...print,
        progress,
        printDuration: print.printDuration + scaled,
        totalDuration: print.totalDuration + scaled,
        filamentUsed: meta ? Math.min(used, meta.filamentTotal) : used,
        remaining: Math.max(0, (1 - progress) / print.rate),
      },
    };
    if (progress >= 1) return finishPrint(next, "completed");
    const layer = meta ? layerAt(z, meta.layerHeight) : 0;
    if (print.pauseAtLayer !== null && layer >= print.pauseAtLayer) {
      next = addLog(next, "response", `// 층 ${print.pauseAtLayer}에서 멈춥니다`);
      next = { ...next, print: { ...next.print, state: "paused", pauseAtLayer: null } };
    }
  } else if (print.state === "paused") {
    next = { ...next, velocity: 0, flow: 0 };
  } else {
    next = { ...next, velocity: 0, flow: 0 };
  }
  return next;
};

const series = (temp: readonly number[], power: readonly number[], target: number): Series => ({ temp, power, target: temp.map(() => target) });

export const initialState = (): SimState => {
  const files = buildFiles();
  const { log, seq } = seedLog(HISTORY);
  const live = HISTORY[0]!;
  const progress = 0.9508193;
  const remaining = 745;
  const z = 95.2;
  const homePoint: Axes = [111.47, 132.35, z, 48.83];
  return {
    clock: CAPTURED_AT,
    tick: 0,
    klippy: "ready",
    print: {
      state: "printing",
      file: live.filename,
      jobId: live.id,
      progress,
      printDuration: 22216,
      totalDuration: 22427,
      filamentUsed: 46920,
      startedAt: live.start * 1000,
      remaining,
      rate: (1 - progress) / remaining,
      anchor: { progress, z },
      message: "",
      timeScale: 1,
      pauseAtLayer: null,
      pauseNextLayer: false,
    },
    extruder: { temp: 209.8, target: 210, power: 0.6 },
    bed: { temp: 60, target: 60, power: 0.13 },
    series: { extruder: series(EXTRUDER_TEMPERATURE, EXTRUDER_POWER, 210), bed: series(BED_TEMPERATURE, BED_POWER, 60) },
    gcode: homePoint,
    live: [96.44, 131.26, 95.146, 48.8],
    homed: { x: true, y: true, z: true },
    absolute: true,
    absoluteExtrude: false,
    velocity: 98,
    flow: 8,
    speedFactor: 1,
    extrudeFactor: 1,
    zOffset: 0,
    pressureAdvance: 0,
    smoothTime: 0.04,
    limits: { velocity: 250, squareCornerVelocity: 9, accel: 2500, minCruiseRatio: 0.5 },
    fan: 1,
    hotendFan: 1,
    beeper: false,
    meshProfile: "default",
    meshes: { default: { name: "default", points: MESH_PROBED, interpolated: MESH_INTERPOLATED } },
    endstops: null,
    log,
    logSeq: seq,
    history: HISTORY,
    files,
    folders: FOLDER_NAMES,
    queue: [],
    restarted: {},
  };
};
