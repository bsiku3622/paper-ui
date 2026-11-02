// overrides.ts — the typed path to overriding a source variable. An app names a source value by its path
// in the authoring tree, `{ shape: { control: { height: { md: "40px" } } } }`, and sourceVars() answers
// with the variable that value is emitted under. A role is never overridden: it is an alias of a source
// variable or a formula over one, so it follows the source on its own (docs/foundations/shape.md).

import { withAlpha, type PaletteToken } from "./color-ladder";
import { COLOR_MODES, THEME_ATTRIBUTE, type ColorMode } from "./color-modes";
import { COLOR_SELECTION, COLOR_VALUES, OPACITY_VALUES, isGroundRole } from "./colors";
import { pathToCssVar, walkValues, type VarTree } from "./helpers";
import { LAYOUT_MODE_VALUES, LAYOUT_VALUES } from "./layout";
import { ACCENT_PALETTES, ACCENT_STEPS, ALPHA_OPACITY, PALETTE_STEPS, type AccentPalette, type AccentStep, type AlphaStep, type PaletteStep } from "./palette";
import { SHAPE_VALUES } from "./shape";
import { TYPOGRAPHY_VALUES } from "./typography";
import { LAYOUT_MODE_VARIABLES, SOURCE_VARIABLES } from "./variables";

type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> };

// The source trees an element can carry a different value of: the ones themeVariables() emits in every mode.
export type SourceOverrides = DeepPartial<{
  shape: VarTree<typeof SHAPE_VALUES>;
  layout: VarTree<typeof LAYOUT_VALUES>;
  typography: VarTree<typeof TYPOGRAPHY_VALUES>;
}>;

type Declaration = `--pui-${string}`;

const known = new Set<string>(SOURCE_VARIABLES);

export const sourceVars = (overrides: SourceOverrides): Record<Declaration, string> => {
  const vars: Record<Declaration, string> = {};
  const walk = (tree: object, path: readonly string[]) => {
    for (const [key, value] of Object.entries(tree)) {
      const next = [...path, key];
      if (typeof value === "object" && value !== null) walk(value, next);
      else {
        const name = pathToCssVar(next);
        if (typeof value !== "string" || !known.has(name)) throw new Error(`[paper-ui] ${next.join(".")} is not a source path; override a shape, layout or typography source value.`);
        vars[name as Declaration] = value;
      }
    }
  };
  walk(overrides, []);
  return vars;
};

// ───── A whole document ──────────────────────────────────────────────────────
// What a Provider takes: the sources, the colour roles of each mode, the palette steps they pick from, the shadow geometry
// of each mode and the opacity roles. Motion and a single Typography role are not here, because no variable holds them.
type PerMode<T> = Partial<Record<ColorMode, T>>;

export type PaletteOverrides = { neutral?: Partial<Record<PaletteStep, string>>; marker?: string } & Partial<Record<AccentPalette, Partial<Record<AccentStep, string>>>>;

export type ThemeOverrides = SourceOverrides & {
  color?: PerMode<DeepPartial<VarTree<typeof COLOR_VALUES>>>;
  palette?: PaletteOverrides;
  shadow?: PerMode<DeepPartial<VarTree<(typeof LAYOUT_MODE_VALUES)[ColorMode]["shadow"]>>>;
  opacity?: DeepPartial<VarTree<typeof OPACITY_VALUES>>;
};

const COLOR_ROLES = new Set<string>();
walkValues(COLOR_VALUES, ["color"], (path) => COLOR_ROLES.add(pathToCssVar(path)));
const OPACITY_ROLES = new Set<string>(Object.keys(OPACITY_VALUES).map((name) => pathToCssVar(["color", "opacity", name])));
const SHADOW_LAYERS = new Set<string>(LAYOUT_MODE_VARIABLES);
const paletteName = (...path: string[]) => pathToCssVar(["palette", ...path]);
const PALETTE_NAMES = new Set<string>([
  paletteName("marker"),
  ...PALETTE_STEPS.map((step) => paletteName("neutral", step)),
  ...ACCENT_PALETTES.flatMap((ramp) => ACCENT_STEPS.map((step) => paletteName(ramp, step))),
]);
const HEX = /^#[\da-f]{6}$/i;

// Every string leaf, by its path. A name the stylesheet does not emit would do nothing, so it says so instead.
const leaves = (tree: object, path: readonly string[], known: ReadonlySet<string>, kind: string, visit: (path: readonly string[], value: string) => void) => {
  for (const [key, value] of Object.entries(tree)) {
    const next = [...path, key];
    if (value === undefined) continue;
    if (typeof value === "object" && value !== null) {
      leaves(value, next, known, kind, visit);
      continue;
    }
    if (typeof value !== "string" || !known.has(pathToCssVar(next))) throw new Error(`[paper-ui] ${next.join(".")} is not ${kind}.`);
    visit(next, value);
  }
};

// A role follows the palette step it picks, and an alpha role the neutral step it is made from, at its own strength.
const fromPalette = (path: string, palette: PaletteOverrides): string | undefined => {
  const [head, second, third] = path.split(".") as [string, string?, string?];
  if (head === "marker") return palette.marker;
  if (head.startsWith("alpha")) {
    const step = palette.neutral?.[third as PaletteStep];
    return step && withAlpha(step as PaletteToken, ALPHA_OPACITY[head.slice("alpha".length) as AlphaStep]);
  }
  const ramp = head === "neutral" ? palette.neutral : palette[head as AccentPalette];
  return (ramp as Record<string, string> | undefined)?.[second!];
};

const rule = (selector: string, declarations: Record<string, string>) => {
  const body = Object.entries(declarations).map(([name, value]) => `${name}:${value}`).join(";");
  return body ? `${selector}{${body}}` : "";
};

// The rule a Provider writes. Outside the layers, so it wins whatever the order of the stylesheets. The sources go on the
// root, so a Portal's content inherits them. A mode's roles go where the stylesheet declares them, own roles on the scope
// and ground roles from its children, so a themed Surface takes them too. A role named in `color` wins over the palette.
export const overridesRule = ({ color, palette, shadow, opacity, ...source }: ThemeOverrides): string => {
  const given = Object.fromEntries(Object.entries(source).filter(([, value]) => value !== undefined)) as SourceOverrides;
  const everywhere: Record<string, string> = { ...sourceVars(given) };
  if (opacity) leaves(opacity, ["color", "opacity"], OPACITY_ROLES, "an opacity role", (path, value) => { everywhere[pathToCssVar(path)] = value; });
  // A palette step is written as Paper writes its own, because a role made from it adds an alpha to that hex.
  if (palette) {
    leaves(palette, ["palette"], PALETTE_NAMES, "a palette step", (path, value) => {
      if (!HEX.test(value)) throw new Error(`[paper-ui] ${path.join(".")} must be a six-digit hex colour; received ${value}.`);
    });
  }
  const rules = [rule(":root", everywhere)];
  for (const mode of COLOR_MODES) {
    const own: Record<string, string> = {};
    const ground: Record<string, string> = {};
    const put = (path: readonly string[], value: string) => { (isGroundRole(path) ? ground : own)[pathToCssVar(["color", ...path])] = value; };
    if (palette) {
      walkValues(COLOR_SELECTION[mode], [], (path, step) => {
        const value = fromPalette(step, palette);
        if (value !== undefined) put(path, value);
      });
    }
    const roles = color?.[mode];
    if (roles) leaves(roles, ["color"], COLOR_ROLES, "a colour role", (path, value) => put(path.slice(1), value));
    const layers = shadow?.[mode];
    if (layers) leaves(layers, ["layout", "shadow"], SHADOW_LAYERS, "a shadow layer", (path, value) => { ground[pathToCssVar(path)] = value; });
    const scope = `[${THEME_ATTRIBUTE}="${mode}"]`;
    rules.push(rule(`:root${scope},${scope}`, own), rule(`:root${scope},${scope} > *`, ground));
  }
  return rules.join("");
};

const SOURCE_SYSTEM = /^--pui-(?:shape|layout|typography)-/;
const emitted = new Set<string>([...SOURCE_VARIABLES, ...LAYOUT_MODE_VARIABLES]);

// The names among these that read as a source of Shape, Layout or Typography and that the stylesheet does not emit:
// a typo or a role, and declaring one does nothing. For the check of the plain CSS form (theme/source-check.ts).
export const unknownSourceVariables = (names: Iterable<string>): string[] =>
  [...new Set(names)].filter((name) => SOURCE_SYSTEM.test(name) && !emitted.has(name)).sort();
