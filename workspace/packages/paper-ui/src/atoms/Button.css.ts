import { STATE_TINT_PROPERTY, stateStyle, tokens, transition, type Justify } from "../tokens";
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
  borderWidth: tokens.shape.stroke.border,
  borderStyle: "solid",
  // `as` 로 <a> 가 된 버튼이 밑줄을 달고 나오지 않게 한다.
  textDecoration: "none",
  userSelect: "none",
  transition: [transition("hover", STATE_TINT_PROPERTY, "border-color"), transition("state", "background-color", "color"), transition("press", "transform")].join(", "),
}]);

// 모서리는 크기를 따른다 — 같은 곡선이 작은 상자에서는 훨씬 둥글게 읽힌다.
export const buttonCorner = styleVariants(controlGeometry.corner);

// 알약 — 기본 곡선은 크기마다 시스템이 정하지만(radius.control),
// "이 버튼은 가장 중요한 행동" 이라는 뜻은 색만으로 다 못 실을 때가 있다 — hero CTA 가
// 그 자리다. 고르는 건 shape 이지 곡선의 크기가 아니라, 앱이 자기 반경을 들일 틈은 없다.
// buttonCorner 뒤에 와서 같은 특정도를 순서로 이긴다.
export const buttonPill = style({ borderRadius: tokens.shape.radius.pill });

// 가로 꽉 — 폼·모바일. 나란한 형제와 같은 폭.
export const buttonFull = style({ width: "100%" });

// 내용의 가로 배치 — 기본은 root 의 가운데다. 폭이 내용보다 넓을 때 뜻이 생긴다(사이드바의 항목, 끝에 숫자가 붙는 행).
// buttonRoot 뒤에 와서 같은 특정도를 순서로 이긴다.
const JUSTIFY_CONTENT = { start: "flex-start", center: "center", end: "flex-end", between: "space-between" } as const satisfies Record<Justify, string>;
export const buttonJustify = styleVariants(JUSTIFY_CONTENT, (justifyContent) => ({ justifyContent }));

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

// size 4 단 — geometry만. Typography preset은 JSX에서 variant × size로 선택한다.
// 버튼은 라벨이 상자를 정의하는 자리라 좌우가 넉넉해야 형태가 산다 — 입력류는 반대로
// 상자가 먼저 있고 글자가 그 안에 놓여서, 가로를 더 좁게 가져간다(control.inset.input).
// 같은 높이에 서는 것과 각 역할의 글자 스타일은 별개 축이다.
export const buttonSize = styleVariants(
  controlGeometry.button,
);

// 아이콘 전용 — 높이를 변으로 하는 정사각에 좌우 패딩이 없다. aria-label 은 필수(호출부 책임).
export const buttonIconSize = styleVariants(
  controlGeometry.iconButton,
);
