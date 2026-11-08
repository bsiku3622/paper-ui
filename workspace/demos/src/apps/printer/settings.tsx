// What the user sets in the settings dialog (Mainsail keeps it in Moonraker's database; here it is kept in the browser
// under printer:settings, printer:presets and printer:webcams), and the hook the pages read it with.

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { useStored } from "../../kit";
import { HIDDEN_MACROS } from "./catalog";
import type { DateFormat, Stamp } from "./format";

export type PanelId = "status" | "webcam" | "toolhead" | "extruder" | "macros" | "limits" | "misc" | "temperatures" | "console";
export type Side = "left" | "right" | "hidden";

export const PANELS: readonly { id: PanelId; label: string }[] = [
  { id: "status", label: "출력 상태" },
  { id: "webcam", label: "웹캠" },
  { id: "toolhead", label: "툴헤드" },
  { id: "extruder", label: "압출기" },
  { id: "macros", label: "매크로" },
  { id: "limits", label: "장비 한계" },
  { id: "misc", label: "기타" },
  { id: "temperatures", label: "온도" },
  { id: "console", label: "콘솔" },
];

export const NAV: readonly { id: string; label: string }[] = [
  { id: "dashboard", label: "대시보드" },
  { id: "cam", label: "웹캠" },
  { id: "console", label: "콘솔" },
  { id: "heightmap", label: "높이 지도" },
  { id: "files", label: "G-code 파일" },
  { id: "viewer", label: "G-code 뷰어" },
  { id: "history", label: "기록" },
  { id: "machine", label: "장비" },
];

export type EstimateMethod = "file" | "filament" | "slicer" | "average";

export type ConsoleFilter = { id: string; name: string; pattern: string; enabled: boolean };

export type Settings = {
  general: { name: string; hour12: boolean; dateFormat: DateFormat; titleProgress: boolean; confirmEstop: boolean; confirmPower: boolean; estimate: EstimateMethod; simSpeed: 1 | 10 | 60 };
  ui: { compact: boolean };
  control: {
    reverseX: boolean;
    reverseY: boolean;
    reverseZ: boolean;
    feedXY: number;
    feedZ: number;
    stepsXY: number[];
    stepsZ: number[];
    lengths: number[];
    rates: number[];
    zOffsetSteps: number[];
    axisHome: boolean;
  };
  console: { newestFirst: boolean; timestamps: boolean; hideTemperature: boolean; hideOk: boolean; filters: ConsoleFilter[]; historySize: number; suggest: boolean; dashboardHeight: "md" | "lg" | "xl" };
  dashboard: { layout: Record<PanelId, Side>; chartMinutes: number; showTargets: boolean; showPower: boolean };
  viewer: { colorMode: "feature" | "speed" | "layer"; travel: boolean; previous: boolean; nozzle: boolean; grid: boolean; fit: boolean; lineScale: number; quality: "low" | "medium" | "high"; follow: boolean };
  editor: { fontSize: "label" | "caption" | "body"; tab: 2 | 4; wrap: boolean; confirmLeave: boolean; confirmRestart: boolean };
  nav: { order: string[]; hidden: string[] };
  macros: { hidden: string[]; groups: string[]; assign: Record<string, string> };
  collapsed: Record<string, boolean>;
};

export const DEFAULT_SETTINGS: Settings = {
  general: { name: "workshop-printer", hour12: true, dateFormat: "ko", titleProgress: false, confirmEstop: true, confirmPower: true, estimate: "file", simSpeed: 1 },
  ui: { compact: false },
  control: {
    reverseX: false,
    reverseY: false,
    reverseZ: false,
    feedXY: 100,
    feedZ: 25,
    stepsXY: [1, 10, 100],
    stepsZ: [0.1, 1, 25],
    lengths: [1, 5, 10, 25, 50],
    rates: [1, 2, 5, 10],
    zOffsetSteps: [0.005, 0.01, 0.025, 0.05],
    axisHome: false,
  },
  console: {
    newestFirst: true,
    timestamps: true,
    hideTemperature: true,
    hideOk: false,
    filters: [
      { id: "tmc", name: "TMC 드라이버 줄 숨기기", pattern: "^(?:\\/\\/ )?tmc", enabled: false },
      { id: "probe", name: "프로브 측정 줄 숨기기", pattern: "^\\/\\/ probe at", enabled: false },
    ],
    historySize: 50,
    suggest: true,
    dashboardHeight: "xl",
  },
  dashboard: {
    layout: { status: "left", webcam: "left", toolhead: "left", extruder: "left", macros: "left", limits: "left", misc: "left", temperatures: "right", console: "right" },
    chartMinutes: 20,
    showTargets: true,
    showPower: false,
  },
  viewer: { colorMode: "feature", travel: false, previous: true, nozzle: true, grid: true, fit: true, lineScale: 1.6, quality: "high", follow: false },
  editor: { fontSize: "caption", tab: 4, wrap: false, confirmLeave: true, confirmRestart: true },
  nav: { order: NAV.map((item) => item.id), hidden: [] },
  macros: { hidden: [...HIDDEN_MACROS], groups: [], assign: {} },
  collapsed: {},
};

export type Preset = { id: string; name: string; extruder: number; bed: number };

export const DEFAULT_PRESETS: Preset[] = [
  { id: "pla", name: "PLA", extruder: 210, bed: 60 },
  { id: "petg", name: "PETG", extruder: 240, bed: 80 },
  { id: "tpu", name: "TPU", extruder: 230, bed: 50 },
  { id: "abs", name: "ABS", extruder: 250, bed: 100 },
  { id: "off", name: "끄기", extruder: 0, bed: 0 },
];

export type Webcam = {
  id: string;
  name: string;
  service: "mjpeg" | "webrtc" | "hls" | "ipcamera";
  stream: string;
  snapshot: string;
  fps: number;
  flipX: boolean;
  flipY: boolean;
  rotate: 0 | 90 | 180 | 270;
  ratio: "4 / 3" | "16 / 9" | "1 / 1";
  enabled: boolean;
};

export const DEFAULT_WEBCAMS: Webcam[] = [
  { id: "cam1", name: "Webcam", service: "mjpeg", stream: "/webcam/?action=stream", snapshot: "/webcam/?action=snapshot", fps: 5, flipX: false, flipY: false, rotate: 0, ratio: "4 / 3", enabled: true },
];

type Sections = keyof Settings;

const merge = (stored: Partial<Settings>): Settings => {
  const out = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
  for (const key of Object.keys(DEFAULT_SETTINGS) as Sections[]) {
    const base = DEFAULT_SETTINGS[key];
    const value = stored[key];
    out[key] = value && typeof value === "object" && !Array.isArray(value) ? { ...base, ...value } : base;
  }
  return out as Settings;
};

type Store = {
  settings: Settings;
  patch: <K extends Sections>(section: K, values: Partial<Settings[K]>) => void;
  reset: () => void;
  stamp: Stamp;
  presets: Preset[];
  setPresets: (next: Preset[]) => void;
  webcams: Webcam[];
  setWebcams: (next: Webcam[]) => void;
};

const Ctx = createContext<Store | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [stored, setStored] = useStored<Partial<Settings>>("printer:settings", {});
  const [presets, setPresets] = useStored<Preset[]>("printer:presets", DEFAULT_PRESETS);
  const [webcams, setWebcams] = useStored<Webcam[]>("printer:webcams", DEFAULT_WEBCAMS);
  const settings = useMemo(() => merge(stored), [stored]);
  const patch = useCallback<Store["patch"]>(
    (section, values) =>
      setStored((now) => ({ ...now, [section]: { ...(DEFAULT_SETTINGS[section] as object), ...((now[section] ?? {}) as object), ...(values as object) } }) as Partial<Settings>),
    [setStored],
  );
  const reset = useCallback(() => {
    setStored({});
    setPresets(DEFAULT_PRESETS);
    setWebcams(DEFAULT_WEBCAMS);
  }, [setStored, setPresets, setWebcams]);
  const stamp = useMemo<Stamp>(() => ({ hour12: settings.general.hour12, dateFormat: settings.general.dateFormat }), [settings.general.hour12, settings.general.dateFormat]);
  const value = useMemo<Store>(() => ({ settings, patch, reset, stamp, presets, setPresets, webcams, setWebcams }), [settings, patch, reset, stamp, presets, setPresets, webcams, setWebcams]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useSettings = () => {
  const value = useContext(Ctx);
  if (!value) throw new Error("useSettings needs SettingsProvider");
  return value;
};
