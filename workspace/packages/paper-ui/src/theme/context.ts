import { createContext, useContext, useSyncExternalStore } from "react";

import { paperError } from "../internal/errors";
import type { ColorMode, ThemePreference } from "../tokens";
import { getThemeStore } from "./store";

export type ThemeControl = {
  theme: ThemePreference;
  resolved: ColorMode;
  setTheme: (theme: ThemePreference) => void;
};

export const ScopeModeContext = createContext<ColorMode | null>(null);
export const ThemeControlContext = createContext<ThemeControl | null>(null);

const serverMode = (): ColorMode => "light";
const ignore = (): (() => void) => () => {};

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
  if (!control) throw paperError("useTheme must be used inside <PaperProvider>.");
  return control;
};
