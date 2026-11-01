// store.ts — the document's one theme store. PaperProvider binds React to it; nothing else writes the root.
//
// The store keeps the user's preference (light · dark · system) and writes the mode it resolves to onto
// <html>. <html>'s attribute stays the truth: the store reads the mode back from it, so a write by the boot
// script or by another theme manager is seen at once and is never reverted. Every write the store makes
// holds transitions, and so does the subscription for a write it did not make, so the mode changes in one frame.

import { THEME_ATTRIBUTE, type ColorMode, type ThemePreference } from "../tokens";
import { THEME_STORAGE_KEY, holdTransitions, isThemePreference, osModeQuery, readRootMode, resolvePreference, subscribeRootMode } from "./engine";

export type ThemeStoreOptions = {
  storageKey: string | null;
  defaultTheme: ThemePreference;
};

export type ThemeStore = {
  // The first configuration wins; a different one later is reported in development.
  configure: (options: ThemeStoreOptions) => void;
  // Applies the preference to <html>; ref-counted. The returned function detaches, and the last one restores <html>.
  attach: () => () => void;
  getPreference: () => ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  getMode: () => ColorMode;
  subscribe: (listener: () => void) => () => void;
};

const createThemeStore = (doc: Document | undefined): ThemeStore => {
  const view = doc?.defaultView ?? null;
  const listeners = new Set<() => void>();
  let config: ThemeStoreOptions = { storageKey: THEME_STORAGE_KEY, defaultTheme: "system" };
  let configured = false;
  let reported = false;
  let preference: ThemePreference | null = null;
  let attached = 0;
  // Set when the last attach is released, so the next configuration replaces the old one.
  let released = false;
  let before: string | null = null;
  let stopRoot: (() => void) | null = null;
  let stopFollowing: (() => void) | null = null;

  const prefersDark = (): boolean => (doc ? osModeQuery(doc)?.matches : false) ?? false;

  const readStored = (): ThemePreference | null => {
    if (config.storageKey === null || !view) return null;
    try {
      const stored = view.localStorage.getItem(config.storageKey);
      return isThemePreference(stored) ? stored : null;
    } catch {
      return null;
    }
  };

  const persist = (next: ThemePreference): void => {
    if (config.storageKey === null || !view) return;
    try {
      view.localStorage.setItem(config.storageKey, next);
    } catch {
      // Storage can be blocked; the choice then lasts until the page closes.
    }
  };

  const notify = (): void => [...listeners].forEach((listener) => listener());

  // Sets or removes the root attribute, holding transitions for the change.
  const writeRoot = (value: string | null): void => {
    if (!doc) return;
    const root = doc.documentElement;
    if (root.getAttribute(THEME_ATTRIBUTE) === value) return;
    const release = holdTransitions(doc);
    if (value === null) root.removeAttribute(THEME_ATTRIBUTE);
    else root.setAttribute(THEME_ATTRIBUTE, value);
    release();
  };

  const getPreference = (): ThemePreference => (preference ??= readStored() ?? config.defaultTheme);

  const follow = (): void => {
    if (getPreference() !== "system") return;
    writeRoot(resolvePreference("system", prefersDark()));
    notify();
  };

  return {
    configure: (next) => {
      if (!configured || released) {
        config = next;
        configured = true;
        released = false;
        reported = false;
        preference = null;
        return;
      }
      if (next.storageKey === config.storageKey && next.defaultTheme === config.defaultTheme) return;
      if (process.env.NODE_ENV === "production" || reported) return;
      reported = true;
      console.error("[paper-ui] More than one <PaperProvider> is configured differently. They share one theme store, so the first storageKey and defaultTheme win.");
    },

    attach: () => {
      if (attached++ === 0) {
        released = false;
        if (doc) {
          before = doc.documentElement.getAttribute(THEME_ATTRIBUTE);
          writeRoot(resolvePreference(getPreference(), prefersDark()));
          const query = osModeQuery(doc);
          query?.addEventListener("change", follow);
          stopFollowing = () => query?.removeEventListener("change", follow);
        }
      }
      let detached = false;
      return () => {
        if (detached) return;
        detached = true;
        if (--attached > 0) return;
        stopFollowing?.();
        stopFollowing = null;
        writeRoot(before);
        preference = null;
        released = true;
      };
    },

    getPreference,

    setPreference: (next) => {
      preference = next;
      persist(next);
      writeRoot(resolvePreference(next, prefersDark()));
      notify();
    },

    getMode: () => (doc ? readRootMode(doc) : "light"),

    subscribe: (listener) => {
      listeners.add(listener);
      if (doc && !stopRoot) stopRoot = subscribeRootMode(doc, notify);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          stopRoot?.();
          stopRoot = null;
        }
      };
    },
  };
};

const stores = new WeakMap<Document, ThemeStore>();

// The store of a document. Without one (a server render) a store is made per call and kept nowhere.
export const getThemeStore = (doc: Document | undefined = typeof document === "undefined" ? undefined : document): ThemeStore => {
  if (!doc) return createThemeStore(undefined);
  let store = stores.get(doc);
  if (!store) {
    store = createThemeStore(doc);
    stores.set(doc, store);
  }
  return store;
};
