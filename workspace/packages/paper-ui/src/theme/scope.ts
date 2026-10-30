// scope.ts — the only writers of the theme attribute below <html>.
//
// A Surface theme and a Portal root each carry their mode on their own element and in context in the
// same render, so the DOM and what React reads cannot diverge. When a scope's mode changes between commits,
// transitions are held for the frame, the way the store holds them for the root.

import { createElement, useInsertionEffect, useRef, type ReactNode } from "react";

import { THEME_ATTRIBUTE, type SurfaceTheme, type ColorMode } from "../tokens";
import { ScopeModeContext, useResolvedTheme } from "./context";
import { holdTransitions, resolveSurfaceTheme } from "./engine";

export type ModeScope = {
  mode: ColorMode | undefined;
  attributes: { [THEME_ATTRIBUTE]?: ColorMode };
  // Wraps the scope's subtree so context carries the mode its element carries.
  provide: (node: ReactNode) => ReactNode;
};

const useThemeSwapGuard = (mode: ColorMode | undefined): void => {
  const previous = useRef(mode);
  useInsertionEffect(() => {
    if (previous.current !== mode) holdTransitions()();
    previous.current = mode;
  }, [mode]);
};

// A Surface's scope: none without a theme.
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

// A portal root: context already crosses the portal, the attribute re-establishes the CSS scope.
export const usePortalScope = (): { [THEME_ATTRIBUTE]: ColorMode } => {
  const mode = useResolvedTheme();
  useThemeSwapGuard(mode);
  return { [THEME_ATTRIBUTE]: mode };
};
