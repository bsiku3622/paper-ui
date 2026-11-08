// The G-code the mock printer understands. A button on the dashboard does not move anything; it sends the lines the real
// console would send, and this reads them against the mock state: it logs each line as a command, changes the state a
// real printer would change, and answers the way Klipper does ("ok T:209.8 /210.0 B:60.0 /60.0", "!! Unknown command").

import { COMMANDS } from "../catalog";
import { MESH_PROBED } from "../data/mesh";
import { printing, type Axes, type HeaterId, type Mesh, type SimState } from "../model";
import { addLog, AXIS_MAX, AXIS_MIN, clamp, fileByPath, finishPrint, MAX_TEMP, MIN_EXTRUDE_TEMP, noise, startPrint } from "./engine";

type Args = { words: Record<string, number>; keys: Record<string, string>; letters: ReadonlySet<string>; raw: string };

const PAIRS = /([A-Za-z_][A-Za-z0-9_]*)=("[^"]*"|'[^']*'|\S+)/g;

const parse = (rest: string): Args => {
  const keys: Record<string, string> = {};
  for (const match of rest.matchAll(PAIRS)) keys[match[1]!.toUpperCase()] = match[2]!.replace(/^["']|["']$/g, "");
  const bare = rest.replace(PAIRS, " ");
  const words: Record<string, number> = {};
  for (const match of bare.matchAll(/([A-Za-z])\s*(-?\d*\.?\d+)/g)) words[match[1]!.toUpperCase()] = Number(match[2]);
  const letters = new Set((bare.toUpperCase().match(/[A-Z]/g) ?? []) as string[]);
  return { words, keys, letters, raw: rest.trim() };
};

const say = (s: SimState, text: string) => addLog(s, "response", text);
const note = (s: SimState, text: string) => addLog(s, "info", `// ${text}`);
const fail = (s: SimState, text: string) => addLog(s, "error", `!! ${text}`);

const withHeater = (s: SimState, id: HeaterId, target: number): SimState => {
  if (target < 0 || target > MAX_TEMP[id]) return fail(s, `Requested temperature (${target.toFixed(1)}) out of range (0.0:${MAX_TEMP[id].toFixed(1)})`);
  return id === "extruder" ? { ...s, extruder: { ...s.extruder, target } } : { ...s, bed: { ...s.bed, target } };
};

const heaterId = (name: string | undefined): HeaterId | null => {
  const key = (name ?? "").toLowerCase();
  if (key === "extruder") return "extruder";
  if (key === "heater_bed" || key === "bed") return "bed";
  return null;
};

const busy = (s: SimState, what: string) => fail(s, `출력 중에는 ${what}을(를) 할 수 없습니다 (모의 콘솔이 막았습니다)`);

// ---- movement

const move = (s: SimState, a: Args): SimState => {
  const w = a.words;
  const relative = !s.absolute;
  const [x0, y0, z0, e0] = s.gcode;
  const lead = (value: number | undefined, from: number) => (value === undefined ? from : relative ? from + value : value);
  const x = lead(w.X, x0);
  const y = lead(w.Y, y0);
  const z = lead(w.Z, z0);
  const needsHome = (w.X !== undefined && !s.homed.x) || (w.Y !== undefined && !s.homed.y) || (w.Z !== undefined && !s.homed.z);
  if (needsHome) return fail(s, `Must home axis first: ${(w.X ?? x0).toFixed(3)} ${(w.Y ?? y0).toFixed(3)} ${(w.Z ?? z0).toFixed(3)} [${(w.E ?? 0).toFixed(3)}]`);
  if (x < AXIS_MIN[0] || x > AXIS_MAX[0] || y < AXIS_MIN[1] || y > AXIS_MAX[1] || z < AXIS_MIN[2] || z > AXIS_MAX[2]) {
    return fail(s, `Move out of range: ${x.toFixed(3)} ${y.toFixed(3)} ${z.toFixed(3)} [${(w.E ?? 0).toFixed(3)}]`);
  }
  let e = e0;
  if (w.E !== undefined) {
    const delta = s.absoluteExtrude ? w.E - e0 : w.E;
    if (delta !== 0 && s.extruder.temp < MIN_EXTRUDE_TEMP) return fail(s, "Extrude below minimum temp\nSee the 'min_extrude_temp' config option for details");
    e = e0 + delta;
  }
  const next: Axes = [x, y, z, e];
  return { ...s, gcode: next, live: printing(s.print.state) ? s.live : next };
};

const home = (s: SimState, a: Args): SimState => {
  if (printing(s.print.state)) return busy(s, "원점 복귀");
  const all = !["X", "Y", "Z"].some((axis) => a.letters.has(axis));
  const flags = { x: all || a.letters.has("X"), y: all || a.letters.has("Y"), z: all || a.letters.has("Z") };
  const [x, y, z, e] = s.gcode;
  const at: Axes = all ? [148, 117, 10, e] : [flags.x ? 0 : x, flags.y ? 0 : y, flags.z ? 10 : z, e];
  const homed = { x: s.homed.x || flags.x, y: s.homed.y || flags.y, z: s.homed.z || flags.z };
  return { ...s, homed, gcode: at, live: at };
};

// ---- the print

const pause = (s: SimState): SimState => {
  if (s.print.state !== "printing") return note(s, "Print is not active");
  return { ...s, print: { ...s.print, state: "paused" } };
};

const resume = (s: SimState): SimState => {
  if (s.print.state !== "paused") return note(s, "Print is not paused");
  return { ...s, print: { ...s.print, state: "printing" } };
};

const cancel = (s: SimState): SimState => {
  if (!printing(s.print.state)) return note(s, "Print is not active");
  return { ...finishPrint(s, "cancelled"), velocity: 0, flow: 0 };
};

const printFile = (s: SimState, a: Args): SimState => {
  const name = a.keys.FILENAME ?? a.raw.replace(/^["']|["']$/g, "");
  if (printing(s.print.state)) return fail(s, "SD busy");
  const file = fileByPath(s, name);
  if (!file) return fail(s, "Unable to open file");
  let next = say(s, `File opened:${file.name} Size:${file.size}`);
  next = say(next, "File selected");
  return startPrint(next, file.path);
};

const restart = (s: SimState, firmware: boolean): SimState => {
  if (printing(s.print.state)) return busy(s, "다시 시작");
  let next = note(s, firmware ? "Firmware restart" : "Klipper reset");
  next = {
    ...next,
    extruder: { ...next.extruder, target: 0 },
    bed: { ...next.bed, target: 0 },
    homed: { x: false, y: false, z: false },
    fan: 0,
    restarted: { ...next.restarted, klipper: next.clock },
  };
  return note(next, "Klipper state: Ready");
};

// ---- the bed mesh

const upsample = (points: readonly (readonly number[])[], size: number): number[][] => {
  const rows = points.length;
  const cols = points[0]?.length ?? 0;
  const out: number[][] = [];
  for (let i = 0; i < size; i++) {
    const fy = (i / (size - 1)) * (rows - 1);
    const y0 = Math.min(rows - 2, Math.floor(fy));
    const ty = fy - y0;
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      const fx = (j / (size - 1)) * (cols - 1);
      const x0 = Math.min(cols - 2, Math.floor(fx));
      const tx = fx - x0;
      const smooth = (t: number) => t * t * (3 - 2 * t);
      const a = points[y0]![x0]!;
      const b = points[y0]![x0 + 1]!;
      const c = points[y0 + 1]![x0]!;
      const d = points[y0 + 1]![x0 + 1]!;
      const top = a + (b - a) * smooth(tx);
      const bottom = c + (d - c) * smooth(tx);
      row.push(Math.round((top + (bottom - top) * smooth(ty)) * 10000) / 10000);
    }
    out.push(row);
  }
  return out;
};

const calibrateMesh = (s: SimState, a: Args): SimState => {
  if (printing(s.print.state)) return busy(s, "베드 메시 보정");
  const name = a.keys.PROFILE ?? "default";
  const points = MESH_PROBED.map((row, i) => row.map((value, j) => Math.round((value * 0.85 + (noise(s.tick + i * 8 + j, 9) - 0.5) * 0.14) * 10000) / 10000));
  const mesh: Mesh = { name, points, interpolated: upsample(points, 22) };
  let next = note(s, "Generating new mesh...");
  next = note(next, "Mesh Bed Leveling Complete");
  return { ...next, meshes: { ...next.meshes, [name]: mesh }, meshProfile: name };
};

const meshProfile = (s: SimState, a: Args): SimState => {
  const save = a.keys.SAVE;
  const load = a.keys.LOAD;
  const remove = a.keys.REMOVE;
  if (save) {
    const current = s.meshProfile ? s.meshes[s.meshProfile] : undefined;
    if (!current) return fail(s, "Unable to save: no bed mesh has been generated");
    const next = note(s, `Bed Mesh state has been saved to profile [${save}] for the current session.`);
    return { ...next, meshes: { ...next.meshes, [save]: { ...current, name: save } }, meshProfile: save };
  }
  if (load) {
    if (!s.meshes[load]) return fail(s, `bed_mesh: Unknown profile [${load}]`);
    return { ...s, meshProfile: load };
  }
  if (remove) {
    if (!s.meshes[remove]) return fail(s, `bed_mesh: No profile named [${remove}] to remove`);
    const rest = Object.fromEntries(Object.entries(s.meshes).filter(([profile]) => profile !== remove));
    return { ...s, meshes: rest, meshProfile: s.meshProfile === remove ? null : s.meshProfile };
  }
  return fail(s, "Invalid syntax: BED_MESH_PROFILE needs SAVE=, LOAD= or REMOVE=");
};

// ---- the handlers

type Handler = (s: SimState, a: Args) => SimState;

const number = (value: string | undefined) => (value === undefined || value.trim() === "" ? undefined : Number(value));

const HANDLERS: Record<string, Handler> = {
  G0: move,
  G1: move,
  G4: (s) => s,
  G28: home,
  G29: calibrateMesh,
  G90: (s) => ({ ...s, absolute: true }),
  G91: (s) => ({ ...s, absolute: false }),
  G92: (s, a) => {
    const [x, y, z, e] = s.gcode;
    const at: Axes = [a.words.X ?? x, a.words.Y ?? y, a.words.Z ?? z, a.words.E ?? e];
    return { ...s, gcode: at };
  },
  M82: (s) => ({ ...s, absoluteExtrude: true }),
  M83: (s) => ({ ...s, absoluteExtrude: false }),
  M84: (s) => (printing(s.print.state) ? busy(s, "모터 끄기") : { ...s, homed: { x: false, y: false, z: false } }),
  M18: (s) => (printing(s.print.state) ? busy(s, "모터 끄기") : { ...s, homed: { x: false, y: false, z: false } }),
  M104: (s, a) => withHeater(s, "extruder", a.words.S ?? 0),
  M109: (s, a) => withHeater(s, "extruder", a.words.S ?? 0),
  M140: (s, a) => withHeater(s, "bed", a.words.S ?? 0),
  M190: (s, a) => withHeater(s, "bed", a.words.S ?? 0),
  M105: (s) => say(s, `ok T:${s.extruder.temp.toFixed(1)} /${s.extruder.target.toFixed(1)} B:${s.bed.temp.toFixed(1)} /${s.bed.target.toFixed(1)}`),
  M106: (s, a) => ({ ...s, fan: clamp((a.words.S ?? 255) / 255, 0, 1) }),
  M107: (s) => ({ ...s, fan: 0 }),
  M112: (s) => note(s, "긴급 정지를 요청했습니다. 모의 콘솔이라 실제 프린터에는 아무것도 보내지 않습니다."),
  M114: (s) => say(s, `X:${s.gcode[0].toFixed(3)} Y:${s.gcode[1].toFixed(3)} Z:${s.gcode[2].toFixed(3)} E:${s.gcode[3].toFixed(3)}`),
  M115: (s) => say(s, "FIRMWARE_NAME:Klipper FIRMWARE_VERSION:v0.13.0-593-g2f05309d5 MACHINE_TYPE:Ender-3 V3 SE"),
  M117: (s) => s,
  M118: (s, a) => say(s, a.raw),
  M220: (s, a) => ({ ...s, speedFactor: clamp((a.words.S ?? 100) / 100, 0.1, 5) }),
  M221: (s, a) => ({ ...s, extrudeFactor: clamp((a.words.S ?? 100) / 100, 0.1, 2) }),
  M24: (s) => resume(s),
  M25: (s) => pause(s),
  PAUSE: pause,
  RESUME: resume,
  CANCEL_PRINT: cancel,
  SDCARD_PRINT_FILE: printFile,
  SDCARD_RESET_FILE: (s) => {
    if (printing(s.print.state)) return fail(s, "SD busy");
    return { ...s, print: { ...s.print, state: "standby", file: null, jobId: null, progress: 0, printDuration: 0, totalDuration: 0, filamentUsed: 0, startedAt: null, remaining: 0 } };
  },
  RESTART: (s) => restart(s, false),
  FIRMWARE_RESTART: (s) => restart(s, true),
  SAVE_CONFIG: (s) => (printing(s.print.state) ? busy(s, "설정 저장") : restart(note(s, "Config 변경을 printer.cfg에 저장합니다 (모의)"), false)),
  STATUS: (s) => note(s, "Klipper state: Ready"),
  HELP: (s) => {
    let next = note(s, "Available extended commands:");
    for (const command of COMMANDS) if (command.kind !== "gcode") next = note(next, `${command.name}: ${command.description}`);
    return next;
  },
  QUERY_ENDSTOPS: (s) => {
    const endstops = { x: "open", y: "open", z: "open" } as const;
    return { ...say(s, `x:${endstops.x} y:${endstops.y} z:${endstops.z}`), endstops };
  },
  TURN_OFF_HEATERS: (s) => ({ ...s, extruder: { ...s.extruder, target: 0 }, bed: { ...s.bed, target: 0 } }),
  SET_HEATER_TEMPERATURE: (s, a) => {
    const id = heaterId(a.keys.HEATER);
    if (!id) return fail(s, `Unknown heater '${a.keys.HEATER ?? ""}'`);
    return withHeater(s, id, number(a.keys.TARGET) ?? 0);
  },
  SET_VELOCITY_LIMIT: (s, a) => {
    const velocity = number(a.keys.VELOCITY) ?? s.limits.velocity;
    const accel = number(a.keys.ACCEL) ?? s.limits.accel;
    const square = number(a.keys.SQUARE_CORNER_VELOCITY) ?? s.limits.squareCornerVelocity;
    const ratio = number(a.keys.MINIMUM_CRUISE_RATIO) ?? s.limits.minCruiseRatio;
    return { ...s, limits: { velocity, accel, squareCornerVelocity: square, minCruiseRatio: ratio } };
  },
  SET_PRESSURE_ADVANCE: (s, a) => {
    const pressureAdvance = number(a.keys.ADVANCE) ?? s.pressureAdvance;
    const smoothTime = number(a.keys.SMOOTH_TIME) ?? s.smoothTime;
    return say({ ...s, pressureAdvance, smoothTime }, `pressure_advance: ${pressureAdvance.toFixed(6)} pressure_advance_smooth_time: ${smoothTime.toFixed(6)}`);
  },
  SET_GCODE_OFFSET: (s, a) => {
    const absolute = number(a.keys.Z);
    const adjust = number(a.keys.Z_ADJUST);
    const zOffset = absolute !== undefined ? absolute : s.zOffset + (adjust ?? 0);
    const shift = number(a.keys.MOVE) === 1 && !printing(s.print.state) ? zOffset - s.zOffset : 0;
    const [x, y, z, e] = s.gcode;
    return { ...s, zOffset: Math.round(zOffset * 1000) / 1000, gcode: [x, y, z + shift, e], live: printing(s.print.state) ? s.live : [x, y, z + shift, e] };
  },
  SET_PIN: (s, a) => {
    if ((a.keys.PIN ?? "").toLowerCase() !== "beeper") return fail(s, `Unknown pin '${a.keys.PIN ?? ""}'`);
    return { ...s, beeper: (number(a.keys.VALUE) ?? 0) > 0 };
  },
  BED_MESH_CALIBRATE: calibrateMesh,
  BED_MESH_CLEAR: (s) => ({ ...s, meshProfile: null }),
  BED_MESH_PROFILE: meshProfile,
  SCREWS_TILT_CALCULATE: (s) => {
    if (printing(s.print.state)) return busy(s, "나사 기울기 계산");
    const screws: readonly [string, string, string][] = [
      ["front left (base)", "64.0, 31.0", ""],
      ["front right", "224.0, 31.0", "adjust CW 00:03"],
      ["rear right", "224.0, 201.0", "adjust CCW 00:01"],
      ["rear left", "64.0, 201.0", "adjust CW 00:05"],
    ];
    let next = s;
    screws.forEach(([name, at, adjust], index) => {
      next = note(next, `${name} : x=${at.split(", ")[0]}, y=${at.split(", ")[1]}, z=${(2.575 + index * 0.0375).toFixed(5)}${adjust ? ` : ${adjust}` : ""}`);
    });
    return next;
  },
  PROBE_CALIBRATE: (s) => (printing(s.print.state) ? busy(s, "프로브 보정") : note(s, "Starting probe calibration (모의): 종이 시험은 실제 프린터에서 합니다")),
  SET_PAUSE_AT_LAYER: (s, a) => {
    const layer = number(a.keys.LAYER);
    if (layer === undefined) return fail(s, "SET_PAUSE_AT_LAYER needs LAYER=");
    return { ...s, print: { ...s.print, pauseAtLayer: layer } };
  },
  SET_PAUSE_NEXT_LAYER: (s) => ({ ...s, print: { ...s.print, pauseNextLayer: true } }),
  SET_PRINT_STATS_INFO: (s) => s,
  PREHEAT_PLA: (s, a) => withHeater(withHeater(s, "bed", number(a.keys.BED) ?? 60), "extruder", number(a.keys.EXTRUDER) ?? 210),
  PREHEAT_TPU: (s, a) => withHeater(withHeater(s, "bed", number(a.keys.BED) ?? 50), "extruder", number(a.keys.EXTRUDER) ?? 230),
  COOLING: (s) => ({ ...s, extruder: { ...s.extruder, target: 0 }, bed: { ...s.bed, target: 0 }, fan: 1 }),
  END_PRINT: (s) => (printing(s.print.state) ? busy(s, "출력 마무리") : { ...s, extruder: { ...s.extruder, target: 0 }, bed: { ...s.bed, target: 0 }, fan: 0, homed: { x: false, y: false, z: false } }),
  BEFORE_LOAD_FILAMENT: (s, a) => (printing(s.print.state) ? busy(s, "필라멘트 작업") : withHeater(s, "extruder", number(a.keys.TEMP) ?? 200)),
  LOAD_FILAMENT: (s, a) => {
    if (printing(s.print.state)) return busy(s, "필라멘트 작업");
    const heated = withHeater(s, "extruder", number(a.keys.TEMP) ?? 210);
    const [x, y, z, e] = heated.gcode;
    return { ...heated, gcode: [x, y, z, e + (number(a.keys.LENGTH) ?? 80)] };
  },
  UNLOAD_FILAMENT: (s, a) => {
    if (printing(s.print.state)) return busy(s, "필라멘트 작업");
    const heated = withHeater(s, "extruder", number(a.keys.TEMP) ?? 200);
    const [x, y, z, e] = heated.gcode;
    return { ...heated, gcode: [x, y, z, e - (number(a.keys.LENGTH) ?? 100)] };
  },
  M600: (s) => (s.print.state === "printing" ? { ...note(s, "필라멘트 교체를 위해 멈춥니다"), print: { ...s.print, state: "paused" } } : fail(s, "M600은 출력 중에만 쓸 수 있습니다")),
};

const run = (s: SimState, line: string): SimState => {
  const head = line.split(/\s+/)[0] ?? "";
  const name = head.toUpperCase();
  const handler = HANDLERS[name];
  if (!handler) return fail(s, `Unknown command:"${name}"`);
  return handler(s, parse(line.slice(head.length)));
};

// The lines are logged as commands in the order they were sent, each followed by what it answered.
export const execute = (state: SimState, text: string): SimState => {
  let s = state;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    s = addLog(s, "command", line);
    s = run(s, line);
  }
  return s;
};
