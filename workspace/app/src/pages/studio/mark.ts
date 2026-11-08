// What a marked part calls (see studioParts in vite/studio-parts.ts). The plugin writes, after the props of every use of a Paper
// part in the demo screens, `{...__studioPart(key, line, literals, dynamic)}`, and at the top of every component that holds such a
// use, `__studioUse()`. Inside the studio's frame the first says which place in the code this is and hands the part the props the
// studio has set for it; the second makes the component draw again when they change. Anywhere else both do nothing, so a page
// behaves the same outside. A build has no marks at all (the plugin serves the dev server only).

import { useSyncExternalStore } from "react";

import { detectEmbedded, EMPTY_STATE, initialMode, type Mode, type StudioState } from "./protocol";

export const embedded = detectEmbedded();
// The theme the frame was opened in (?theme=). It is the Provider's default, which cannot change; the state changes it after.
export const initialTheme: Mode = embedded ? initialMode() : "light";

type Site = { line: number; literals: Record<string, string | number | boolean>; dynamic: string[] };
const sites = new Map<string, Site>();

let state: StudioState = embedded ? { ...EMPTY_STATE, theme: initialTheme } : EMPTY_STATE;
let version = 0;
const listeners = new Set<() => void>();

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const getVersion = () => version;
export const getState = () => state;

export const setState = (next: StudioState) => {
  state = next;
  version += 1;
  for (const listener of [...listeners]) listener();
};

export const siteOf = (key: string): Site | undefined => sites.get(key);

export const __studioPart = (key: string, line: number, literals: Site["literals"], dynamic: string[]): Record<string, unknown> | undefined => {
  if (!embedded) return undefined;
  if (!sites.has(key)) sites.set(key, { line, literals, dynamic });
  const own = state.paused ? undefined : state.parts[key];
  const out: Record<string, unknown> = { "data-studio-part": key };
  if (own) for (const [prop, value] of Object.entries(own)) out[prop] = value === null ? undefined : value;
  return out;
};

const useVersion = () => {
  useSyncExternalStore(subscribe, getVersion, getVersion);
};
const idle = () => undefined;
export const __studioUse: () => void = embedded ? useVersion : idle;

// The studio's state as React reads it, for the provider that turns it into overrides.
export const useStudioState = (): StudioState => {
  useSyncExternalStore(subscribe, getVersion, getVersion);
  return state;
};
