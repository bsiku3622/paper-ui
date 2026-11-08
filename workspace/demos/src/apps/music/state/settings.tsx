import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { useStored } from "../../../kit";

export type Quality = "standard" | "high" | "lossless" | "hires";
export type Pane = "lyrics" | "queue" | "none";
export type Equalizer = "flat" | "bass" | "vocal" | "treble" | "late";

export type Settings = {
  pane: Pane;
  quality: Quality;
  downloadQuality: Quality;
  dolby: "auto" | "on" | "off";
  crossfade: boolean;
  crossfadeSeconds: number;
  soundCheck: boolean;
  equalizer: Equalizer;
  autoplay: boolean;
  cellular: boolean;
  downloadOverCellular: boolean;
  sync: boolean;
  optimizeStorage: boolean;
  storageLimit: "none" | "4" | "8" | "16";
  keepHistory: boolean;
  showListening: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  pane: "lyrics",
  quality: "high",
  downloadQuality: "high",
  dolby: "auto",
  crossfade: true,
  crossfadeSeconds: 6,
  soundCheck: true,
  equalizer: "flat",
  autoplay: true,
  cellular: true,
  downloadOverCellular: false,
  sync: true,
  optimizeStorage: false,
  storageLimit: "none",
  keepHistory: true,
  showListening: false,
};

type Value = { settings: Settings; set: (patch: Partial<Settings>) => void };

const Ctx = createContext<Value | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [stored, setStored] = useStored<Settings>("music:settings", DEFAULT_SETTINGS);
  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...stored }), [stored]);
  const set = useCallback((patch: Partial<Settings>) => setStored((now) => ({ ...DEFAULT_SETTINGS, ...now, ...patch })), [setStored]);
  const value = useMemo(() => ({ settings, set }), [settings, set]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useSettings = () => {
  const value = useContext(Ctx);
  if (!value) throw new Error("useSettings needs SettingsProvider");
  return value;
};
