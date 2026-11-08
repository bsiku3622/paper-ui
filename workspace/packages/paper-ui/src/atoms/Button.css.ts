import { STATE_TINT_PROPERTY, stateStyle, tokens, transition } from "../tokens";
import { layered } from "../tokens/layers.css";

const { style } = layered("components");

// 크기와 글자는 controlClass, 색과 선(background·color·border)은 paintClass 가 붙이는 accentVariantClass 가 정하고,
// 눌림·커서·비활성 모습은 Pressable 의 motion="press" 가 정한다 — Button 은 얼마나 큰지도, 어떤 색인지도, 어떻게 눌리는지도 모른다.
// 전이는 속성 묶음마다 역할을 고른다: 경계와 hover tint 는 hover, 면과 글자는 state, 눌림은 press.
export const buttonRoot = style([stateStyle.focusVisible, {
  // `as` 로 <a> 가 된 버튼이 밑줄을 달고 나오지 않게 한다.
  textDecoration: "none",
  userSelect: "none",
  transition: [transition("hover", STATE_TINT_PROPERTY, "border-color"), transition("state", "background-color", "color"), transition("press", "transform")].join(", "),
}]);

// 가로 꽉 — 폼·모바일. 나란한 형제와 같은 폭.
export const buttonFull = style({ width: "100%" });

// 모서리 표식 — 알림 숫자처럼 버튼에 딸린 작은 표시. 버튼의 크기를 바꾸지 않고 바깥 모서리에 걸치며, 누름은 버튼이 받는다.
// 논리 속성이라 RTL 에서는 왼쪽 모서리로 간다.
export const buttonAnchored = style({ position: "relative" });
export const buttonBadge = style({
  position: "absolute",
  insetBlockStart: `calc(${tokens.shape.inset.xs} * -1)`,
  insetInlineEnd: `calc(${tokens.shape.inset.xs} * -1)`,
  display: "inline-flex",
  pointerEvents: "none",
});
