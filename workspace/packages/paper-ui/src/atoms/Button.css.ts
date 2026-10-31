import { STATE_TINT_PROPERTY, stateStyle, tokens, transition } from "../tokens";
import { controlGeometry } from "../internal/shape";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// geometry·typography 만. 색(background·color·border-color)은 paintClass 가 붙이는 accentVariantClass 가 정하고,
// 눌림·커서·비활성 모습은 Pressable 의 motion="press" 가 정한다 — Button 은 어떤 색인지도, 어떻게 눌리는지도 모른다.
// 크기(height·padding·fontSize·weight)는 size 축(buttonSize)이 정한다.
// 전이는 속성 묶음마다 역할을 고른다: 경계와 hover tint 는 hover, 면과 글자는 state, 눌림은 press.
export const buttonRoot = style([stateStyle.focusVisible, {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.shape.control.gap,
  borderRadius: tokens.shape.radius.control,
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
  // `as` 로 <a> 가 된 버튼이 밑줄을 달고 나오지 않게 한다.
  textDecoration: "none",
  userSelect: "none",
  transition: [transition("hover", STATE_TINT_PROPERTY, "border-color"), transition("state", "background-color", "color"), transition("press", "transform")].join(", "),
}]);

// 알약 — 모서리를 높이의 절반까지. 기본 곡선은 시스템이 정하지만(radius.control),
// "이 버튼은 가장 중요한 행동" 이라는 뜻은 색만으로 다 못 실을 때가 있다 — hero CTA 가
// 그 자리다. 고르는 건 shape 이지 곡선의 크기가 아니라, 앱이 자기 반경을 들일 틈은 없다.
// buttonRoot 뒤에 와서 같은 특정도를 순서로 이긴다.
export const buttonPill = style({ borderRadius: tokens.shape.radius.full });

// 가로 꽉 — 폼·모바일. 나란한 형제와 같은 폭.
export const buttonFull = style({ width: "100%" });

// size 3 단 — geometry만. Typography preset은 JSX에서 variant × size로 선택한다.
// 버튼은 라벨이 상자를 정의하는 자리라 좌우가 넉넉해야 형태가 산다 — 입력류는 반대로
// 상자가 먼저 있고 글자가 그 안에 놓여서, 가로를 더 좁게 가져간다(inputPaddingX).
// 같은 높이에 서는 것과 각 역할의 글자 스타일은 별개 축이다.
export const buttonSize = styleVariants(
  controlGeometry.button,
);

// 아이콘 전용 — 높이를 변으로 하는 정사각에 좌우 패딩이 없다. aria-label 은 필수(호출부 책임).
export const buttonIconSize = styleVariants(
  controlGeometry.iconButton,
);
