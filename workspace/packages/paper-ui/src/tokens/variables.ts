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
  const source: Declarations = {};
  declare(source, SHAPE_VALUES, ["shape"]);
  declare(source, LAYOUT_VALUES, ["layout"]);
  declare(source, TYPOGRAPHY_VALUES, ["typography"]);

  const invariant: Declarations = {};
  declare(invariant, OPACITY_VALUES, ["color", "opacity"]);

  const modes = Object.fromEntries(COLOR_MODES.map((mode) => {
    const own: Declarations = {};
    const ground: Declarations = {};
    walkValues(COLOR_VALUES_BY_MODE[mode], [], (path, value) => {
      (isGroundRole(path) ? ground : own)[pathToCssVar(["color", ...path])] = value;
    });
    declare(ground, LAYOUT_MODE_VALUES[mode], ["layout"]);
    return [mode, { own, ground }];
  })) as Record<ColorMode, { own: Declarations; ground: Declarations }>;

  const contrastMore = Object.fromEntries(COLOR_MODES.map((mode) => {
    const lifted: Declarations = {};
    declare(lifted, COLOR_CONTRAST_MORE[mode], ["color"]);
    return [mode, lifted];
  })) as Record<ColorMode, Declarations>;

  return { source, invariant, modes, contrastMore };
};

export const SOURCE_VARIABLES = keys(themeVariables().source);

export const LAYOUT_MODE_VARIABLES = keys(themeVariables().modes.light.ground).filter((name) => name.startsWith(`${pathToCssVar(["layout"])}-`));
