import { linkStyle, stateStyle, tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

export const linkRoot = style([stateStyle.focusVisible, {
  textUnderlineOffset: linkStyle.textUnderlineOffset,
  borderRadius: tokens.shape.radius.text,
  cursor: "pointer",
}]);

// A link inside a sentence is not 3:1 against the text by colour alone, so it is always underlined.
export const linkUnderline = styleVariants({
  always: { textDecorationLine: "underline" },
  hover: stateStyle.hoverUnderline,
});
