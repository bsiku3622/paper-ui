// color.css — resolver 가 가리키는 색 클래스의 실체. color × variant 를 걸어 emit 한다.
//
// resolveColor 가 만들 수 있는 모든 이름(pui-c-{color}-{variant})에 정확히 대응하는
// 규칙을 여기서 굳힌다. 둘 다 같은 COLORS·VARIANTS 배열을 도니 조합이 어긋날 수 없다.
//
// hover 는 .pui-interactive 가 함께 있을 때만 문다 — 눌리는 것(Button)만 gate 를 붙이고,
// 표시용(Badge)·정적 면(Card)은 안 붙여 hover 색이 뜨지 않는다.

import { globalStyle } from "@vanilla-extract/css";

import { COLORS, VARIANTS, INTERACTIVE } from "../resolvers/color";
import { colorProfile, type ColorSpec } from "./color-profile";

const emit = (cls: string, spec: ColorSpec): void => {
  globalStyle(cls, {
    background: spec.background,
    color: spec.color,
    borderColor: spec.borderColor,
  });
  globalStyle(`.${INTERACTIVE}${cls}:hover:not(:disabled)`, {
    // 중립: base 색은 두고 오버레이 레이어(backgroundImage)만 얹는다 — 어느 면 위든
    // 합성돼 어두워진다. 색·검정 solid: 배경을 교체(hoverBackground).
    ...(spec.hoverOverlay
      ? { backgroundImage: `linear-gradient(0deg, ${spec.hoverOverlay}, ${spec.hoverOverlay})` }
      : spec.hoverBackground
        ? { background: spec.hoverBackground }
        : {}),
    ...(spec.hoverColor ? { color: spec.hoverColor } : {}),
  });
};

for (const color of COLORS) {
  for (const v of VARIANTS) {
    emit(`.pui-c-${color}-${v}`, colorProfile(color, v));
  }
}
