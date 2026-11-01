// variables.ts — every CSS variable the package emits, as data. tokens/variables.css.ts writes them
// into the stylesheet and nothing else decides a variable's name or its scope.
//
// The trees are walked whole rather than listed, so a system that gains a value gains its variable. A
// name is the path through its tree (helpers.pathToCssVar), the same rule that builds `tokens`.

import { COLOR_MODES, type ColorMode } from "./color-modes";
import { COLOR_CONTRAST_MORE, COLOR_VALUES_BY_MODE, OPACITY_VALUES, isGroundRole } from "./colors";
import { keys, pathToCssVar, walkValues } from "./helpers";
import { LAYOUT_MODE_VALUES, LAYOUT_VALUES } from "./layout";
import { SHAPE_VALUES } from "./shape";
import { TYPOGRAPHY_VALUES } from "./typography";

type Declarations = Record<string, string>;
type Tree = Parameters<typeof walkValues>[0];

const declare = (into: Declarations, values: Tree, prefix: readonly string[]) =>
  walkValues(values, prefix, (path, value) => {
    into[pathToCssVar(path)] = value;
  });

export const themeVariables = () => {
  // Shape, Layout and Typography source: the same in every mode.
  const source: Declarations = {};
  declare(source, SHAPE_VALUES, ["shape"]);
  declare(source, LAYOUT_VALUES, ["layout"]);
  declare(source, TYPOGRAPHY_VALUES, ["typography"]);

  // Opacity is a state's strength; no mode changes it.
  const invariant: Declarations = {};
  declare(invariant, OPACITY_VALUES, ["color", "opacity"]);

  // A mode is its Color roles plus the Layout shadow geometry. Own roles are painted on the scope's
  // own element; ground roles are painted on the ground it stands on, so they start at its children.
  const modes = Object.fromEntries(COLOR_MODES.map((mode) => {
    const own: Declarations = {};
    const ground: Declarations = {};
    walkValues(COLOR_VALUES_BY_MODE[mode], [], (path, value) => {
      (isGroundRole(path) ? ground : own)[pathToCssVar(["color", ...path])] = value;
    });
    declare(ground, LAYOUT_MODE_VALUES[mode], ["layout"]);
    return [mode, { own, ground }];
  })) as Record<ColorMode, { own: Declarations; ground: Declarations }>;

  // What prefers-contrast: more replaces in each mode's own roles.
  const contrastMore = Object.fromEntries(COLOR_MODES.map((mode) => {
    const lifted: Declarations = {};
    declare(lifted, COLOR_CONTRAST_MORE[mode], ["color"]);
    return [mode, lifted];
  })) as Record<ColorMode, Declarations>;

  return { source, invariant, modes, contrastMore };
};

// The variables an element can carry that no mode changes. A portal copies the ones that differ from
// its container, and an override names only these.
export const SOURCE_VARIABLES = keys(themeVariables().source);

// The Layout variables a mode sets: the shadow geometry. Emitted, but not a source an element carries across modes.
export const LAYOUT_MODE_VARIABLES = keys(themeVariables().modes.light.ground).filter((name) => name.startsWith(`${pathToCssVar(["layout"])}-`));
