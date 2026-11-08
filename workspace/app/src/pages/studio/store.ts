// Everything the studio holds: what the owner has turned (levers, token edits, part props), how the preview is set (app, width, theme,
// side by side) and what happens right now (picking, the part picked, the original held). What was turned is kept in localStorage; the
// rest lasts as long as the page.

import { useSyncExternalStore } from "react";

import { APPS, appById, belongsTo, visibleApps, type StudioApp } from "./apps";
import { getCatalog, overridesOf } from "./catalog";
import type { LabSpec, LeverValue, Mode, PartEdits, PartSite, PartSpec, PartValue, PickReport, StudioState, TokenOverrides } from "./protocol";

export type Tab = "levers" | "tokens" | "parts" | "changes";
export type Compare = "off" | "theme" | "width";
export const WIDTHS = [1440, 1024, 768, 390] as const;
// The widths side by side, narrowest last: a ruler of the page's breakpoints.
export const COMPARE_WIDTHS = [1024, 768, 390] as const;

export type View = { item: string; path: string; width: number; theme: Mode; compare: Compare; panel: boolean; tab: Tab };

// The frame that is not in the stage: the window of its own the toolbar opens (새 창).
export const WINDOW = "window";

// What a frame has told the studio about its page.
export type FrameInfo = {
  connected: boolean;
  app: string;
  path: string;
  title: string;
  marks: boolean;
  lab?: LabSpec;
  parts?: Record<string, PartSpec>;
};

export type Selection = { frame: string; pick: PickReport };

export type StudioStore = {
  levers: Record<string, LeverValue>;
  edits: Record<string, string>;
  parts: PartEdits;
  // Where each edited part sits in the code, kept so the changes can be listed and exported after a reload.
  sites: Record<string, PartSite>;
  view: View;
  pick: boolean;
  paused: boolean;
  selection: Selection | null;
  frames: Record<string, FrameInfo>;
  // Counted up whenever the bar picks an app, so the frames open it afresh.
  opened: number;
};

const KEY = "paper-studio:v1";

const DEFAULT_VIEW: View = { item: "arcfield", path: APPS[0]!.path, width: WIDTHS[0], theme: "light", compare: "off", panel: true, tab: "levers" };

type Saved = Pick<StudioStore, "levers" | "edits" | "parts" | "sites" | "view">;

const read = (): Partial<Saved> => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as { v?: number } & Partial<Saved> | null;
    return parsed && parsed.v === 1 ? parsed : {};
  } catch {
    return {};
  }
};

// A screen this build can show: a production build has the site's own only.
const available = (id: string) => visibleApps().some((app) => app.id === id);

// Arcfield was once a list of its screens (arcfield-projects, arcfield-login …) and is one app now: a screen saved or linked under
// the old name opens the app, at the path it was at.
const appIdOf = (id: string): string => (id.startsWith("arcfield-") ? "arcfield" : id);

const fromAddress = (view: View): View => {
  const query = new URLSearchParams(window.location.search);
  const item = appById(appIdOf(query.get("screen") ?? ""));
  if (!item || !available(item.id)) return view;
  return { ...view, item: item.id, path: query.get("path") ?? item.path };
};

// A saved path the app does not own (a preview that once wandered to the site's home or to the studio) opens the app's first page.
const ownPath = (view: View): View => {
  const app = appById(view.item);
  return app && !belongsTo(app, view.path) ? { ...view, path: app.path } : view;
};

const initial = (): StudioStore => {
  const saved = read();
  const restored = { ...DEFAULT_VIEW, ...saved.view };
  const view = ownPath(fromAddress({ ...restored, item: appIdOf(restored.item) }));
  return {
    levers: saved.levers ?? {},
    edits: saved.edits ?? {},
    parts: saved.parts ?? {},
    sites: saved.sites ?? {},
    view: available(view.item) ? view : DEFAULT_VIEW,
    pick: false,
    paused: false,
    selection: null,
    frames: {},
    opened: 0,
  };
};

let state: StudioStore | null = null;
const listeners = new Set<() => void>();
let saving = 0;

const current = (): StudioStore => (state ??= initial());
export const getStore = current;

const save = () => {
  window.clearTimeout(saving);
  saving = window.setTimeout(() => {
    const { levers, edits, parts, sites, view } = current();
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ v: 1, levers, edits, parts, sites, view }));
    } catch {
      // Storage can be blocked; what was turned then lasts until the page closes.
    }
  }, 150);
};

const SAVED_KEYS: readonly (keyof StudioStore)[] = ["levers", "edits", "parts", "sites", "view"];

export const update = (patch: Partial<StudioStore> | ((now: StudioStore) => Partial<StudioStore>)): void => {
  const now = current();
  const next = typeof patch === "function" ? patch(now) : patch;
  state = { ...now, ...next };
  if (SAVED_KEYS.some((key) => key in next)) save();
  for (const listener of [...listeners]) listener();
};

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useStore = <T>(select: (store: StudioStore) => T): T => useSyncExternalStore(subscribe, () => select(current()), () => select(current()));

// ── Actions ──────────────────────────────────────────────────────────────────────────

export const setView = (patch: Partial<View>) => update((now) => ({ view: { ...now.view, ...patch } }));

export const setLever = (key: string, value: LeverValue) => update((now) => ({ levers: { ...now.levers, [key]: value } }));
export const applyLevers = (values: Record<string, LeverValue>) => update((now) => ({ levers: { ...now.levers, ...values } }));
export const resetLevers = () => update({ levers: {} });

const without = <T>(record: Readonly<Record<string, T>>, ...keys: readonly string[]): Record<string, T> => Object.fromEntries(Object.entries(record).filter(([name]) => !keys.includes(name)));

export const setEdit = (id: string, value: string | null) => update((now) => ({ edits: value === null ? without(now.edits, id) : { ...without(now.edits, id), [id]: value } }));
export const resetEdits = (ids?: readonly string[]) => update((now) => ({ edits: ids ? without(now.edits, ...ids) : {} }));

// value: undefined takes the studio's setting away (the code's own stands); null takes the prop out of the part.
export const setPartProp = (site: PartSite, prop: string, value: PartValue | undefined) =>
  update((now) => {
    const rest = without(now.parts[site.key] ?? {}, prop);
    const own = value === undefined ? rest : { ...rest, [prop]: value };
    const others = without(now.parts, site.key);
    const edited = Object.keys(own).length > 0;
    return { parts: edited ? { ...others, [site.key]: own } : others, sites: edited ? { ...now.sites, [site.key]: site } : now.sites };
  });
export const resetPart = (key: string) => update((now) => ({ parts: without(now.parts, key) }));
export const resetParts = () => update({ parts: {} });

export const resetAll = () => update({ levers: {}, edits: {}, parts: {}, sites: {}, selection: null });

// A part was picked: its props are what the panel shows next.
export const select = (frame: string, pick: PickReport) => update({ selection: { frame, pick }, view: { ...current().view, tab: "parts", panel: true } });
export const deselect = () => update({ selection: null });

// The stage's frames open the app afresh; the window, which is not in the stage, keeps what it said and stays where it is.
const windowOnly = (frames: Record<string, FrameInfo>): Record<string, FrameInfo> => {
  const kept = frames[WINDOW];
  return kept ? { [WINDOW]: kept } : {};
};

export const open = (item: StudioApp) =>
  update((now) => ({ view: { ...now.view, item: item.id, path: item.path }, opened: now.opened + 1, selection: null, frames: windowOnly(now.frames) }));

export const setFrame = (id: string, patch: Partial<FrameInfo>) =>
  update((now) => ({ frames: { ...now.frames, [id]: { connected: false, app: "", path: "", title: "", marks: false, ...now.frames[id], ...patch } } }));
export const dropFrame = (id: string) => update((now) => ({ frames: without(now.frames, id) }));

// ── Derived ──────────────────────────────────────────────────────────────────────────

let overridden: { edits: Record<string, string>; tokens: TokenOverrides } | null = null;

// The nested overrides PaperProvider takes, from the flat edits; the same object while the edits are the same.
export const tokensOf = (edits: Record<string, string>): TokenOverrides => {
  if (overridden?.edits === edits) return overridden.tokens;
  const tokens = overridesOf(edits, getCatalog());
  overridden = { edits, tokens };
  return tokens;
};

// What a frame is sent, in the theme it is shown in.
export const stateFor = (store: StudioStore, theme: Mode): StudioState => ({
  theme,
  paused: store.paused,
  pick: store.pick,
  selected: store.selection?.pick.key ?? null,
  levers: store.levers,
  tokens: tokensOf(store.edits),
  parts: store.parts,
});

// What the owner has turned: levers off the page's own setting, token edits, and the props set on parts.
export const changeCount = (store: StudioStore): number => {
  const lab = Object.values(store.frames).find((frame) => frame.lab)?.lab;
  const levers = Object.entries(store.levers).filter(([key, value]) => (lab ? lab.defaults[key] !== undefined && value !== lab.defaults[key] : true)).length;
  return levers + Object.keys(store.edits).length + Object.values(store.parts).reduce((sum, props) => sum + Object.keys(props).length, 0);
};
