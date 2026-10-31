import { ENABLED_SELECTOR, stateStyle, tokens } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// 링크의 형태. 색은 primitives/paint/recipes.css.ts 의 linkPaint 가 입힌다.
export const linkRoot = style([stateStyle.focusVisible, {
  textUnderlineOffset: tokens.typography.palette.decoration.underlineOffset,
  // The ring follows the link's own corners; the baseline ring leaves them alone.
  borderRadius: tokens.shape.radius.control,
  cursor: "pointer",
}]);

// 밑줄이 드러나는 때. 문장 안 링크는 색만으로 본문과 3:1 이 되지 않아 늘 밑줄을 긋고(always),
// 위치가 링크임을 말해 주는 단독 링크만 가리킬 때 긋는다(hover). 터치에는 hover 가 없다.
export const linkUnderline = styleVariants({
  always: { textDecorationLine: "underline" },
  hover: {
    textDecorationLine: "none",
    "@media": { "(hover: hover)": { selectors: { [`&:hover${ENABLED_SELECTOR}`]: { textDecorationLine: "underline" } } } },
  },
});
