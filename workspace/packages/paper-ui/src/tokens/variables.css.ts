// variables.css.ts — the stylesheet's variables, in pui.theme.
//
// :root is light. While nothing has set a mode on <html>, the OS decides. A scope — <html> or any
// element carrying the theme attribute — sets its mode's own roles, and its children set the ground
// roles: a scope draws its focus ring and its shadow on the ground it stands on, in the ground's
// mode, while everything inside it uses its own. Contrast blocks come after the base blocks, with
// the same scopes, so precedence is the one the base blocks have.

import { COLOR_MODES, COLOR_MODE_QUERY, THEME_ATTRIBUTE, type ColorMode } from "./color-modes";
import { layered } from "./layers.css";
import { themeVariables } from "./variables";

const { globalStyle } = layered("theme");
const { source, invariant, modes, contrastMore } = themeVariables();

const MORE_CONTRAST_QUERY = "(prefers-contrast: more)";
const unset = `:root:not([${THEME_ATTRIBUTE}])`;
const scope = (mode: ColorMode) => `[${THEME_ATTRIBUTE}="${mode}"]`;

globalStyle(":root", { colorScheme: "light", vars: { ...source, ...invariant, ...modes.light.own, ...modes.light.ground } });
globalStyle(unset, { "@media": { [COLOR_MODE_QUERY]: { colorScheme: "dark", vars: { ...modes.dark.own, ...modes.dark.ground } } } });

for (const mode of COLOR_MODES) {
  globalStyle(`:root${scope(mode)}, ${scope(mode)}`, { colorScheme: mode, vars: modes[mode].own });
  globalStyle(`:root${scope(mode)}, ${scope(mode)} > *`, { vars: modes[mode].ground });
}

globalStyle(":root", { "@media": { [MORE_CONTRAST_QUERY]: { vars: contrastMore.light } } });
globalStyle(unset, { "@media": { [`${COLOR_MODE_QUERY} and ${MORE_CONTRAST_QUERY}`]: { vars: contrastMore.dark } } });
for (const mode of COLOR_MODES) {
  globalStyle(`:root${scope(mode)}, ${scope(mode)}`, { "@media": { [MORE_CONTRAST_QUERY]: { vars: contrastMore[mode] } } });
}
