import { THEME_ATTRIBUTE, THEME_SWAP_ATTRIBUTE, tokens, typographyRule } from "../tokens";
import { layered } from "../tokens/layers.css";

const reset = layered("reset");
const base = layered("base");

reset.globalStyle("body", { margin: 0 });
base.globalStyle("body", {
  background: tokens.color.bg.canvas,
  color: tokens.color.ink.primary,
  ...typographyRule("body"),
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
});

reset.globalStyle("*", { boxSizing: "border-box" });

// The inherited text colour is declared again per scope, so text in a Surface theme or a Portal takes that scope's mode.
base.globalStyle(`:where([${THEME_ATTRIBUTE}])`, { color: tokens.color.ink.primary });

// !important puts the swap ahead of a component's own transition, so no control trails the page when the mode changes.
const swapping = `:root[${THEME_SWAP_ATTRIBUTE}]`;
base.globalStyle(`${swapping} *, ${swapping} *::before, ${swapping} *::after`, {
  transitionDuration: `${tokens.motion.role.theme.duration} !important`,
  transitionDelay: `${tokens.motion.role.theme.duration} !important`,
});
