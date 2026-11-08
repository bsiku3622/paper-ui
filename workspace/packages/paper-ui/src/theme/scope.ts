import { createElement, useInsertionEffect, useRef, type ReactNode } from "react";

import { THEME_ATTRIBUTE, type SurfaceTheme, type ColorMode } from "../tokens";
import { ScopeModeContext, useResolvedTheme } from "./context";
import { holdTransitions, resolveSurfaceTheme } from "./engine";

export type ModeScope = {
  mode: ColorMode | undefined;
  attributes: { [THEME_ATTRIBUTE]?: ColorMode };
  provide: (node: ReactNode) => ReactNode;
};

const useThemeSwapGuard = (mode: ColorMode | undefined): void => {
  const previous = useRef(mode);
  useInsertionEffect(() => {
    if (previous.current !== mode) holdTransitions()();
    previous.current = mode;
  }, [mode]);
};

export const useThemeScope = (theme?: SurfaceTheme): ModeScope => {
  const ambient = useResolvedTheme();
  const mode = theme === undefined ? undefined : resolveSurfaceTheme(theme, ambient);
  useThemeSwapGuard(mode);
  return {
    mode,
    attributes: { [THEME_ATTRIBUTE]: mode },
    provide: (node) => (mode === undefined ? node : createElement(ScopeModeContext.Provider, { value: mode }, node)),
  };
};

export const usePortalScope = (): { [THEME_ATTRIBUTE]: ColorMode } => {
  const mode = useResolvedTheme();
  useThemeSwapGuard(mode);
  return { [THEME_ATTRIBUTE]: mode };
};
