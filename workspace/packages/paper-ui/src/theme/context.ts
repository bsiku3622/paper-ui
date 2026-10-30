// context.ts — what React reads of the theme.
//
// The mode is read from the nearest Surface theme scope, else from the Provider, else from <html> itself (its
// attribute, or the OS when it has none), so reading the theme is truthful with or without a Provider.
// Controlling it needs the Provider: it owns the document's store.

import { createContext, useContext, useSyncExternalStore } from "react";

import type { ColorMode, ThemePreference } from "../tokens";
import { getThemeStore } from "./store";

export type ThemeControl = {
  // The user's choice, system included.
  theme: ThemePreference;
  // The mode <html> shows.
  resolved: ColorMode;
  setTheme: (theme: ThemePreference) => void;
};

// The mode of the nearest Surface or portal theme scope; null outside one.
export const ScopeModeContext = createContext<ColorMode | null>(null);
export const ThemeControlContext = createContext<ThemeControl | null>(null);

const serverMode = (): ColorMode => "light";
const ignore = (): (() => void) => () => {};

// Subscribed only when no scope and no Provider answers, so a page of Surfaces holds no listener per Surface.
const useRootMode = (needed: boolean): ColorMode => {
  const store = getThemeStore();
  return useSyncExternalStore(needed ? store.subscribe : ignore, needed ? store.getMode : serverMode, serverMode);
};

export const useResolvedTheme = (): ColorMode => {
  const scope = useContext(ScopeModeContext);
  const control = useContext(ThemeControlContext);
  const root = useRootMode(scope === null && control === null);
  return scope ?? control?.resolved ?? root;
};

export const useTheme = (): ThemeControl => {
  const control = useContext(ThemeControlContext);
  if (!control) throw new Error("useTheme must be used inside <PaperProvider>.");
  return control;
};
