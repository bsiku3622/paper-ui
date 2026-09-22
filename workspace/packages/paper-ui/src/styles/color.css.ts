// color.css — resolver 가 가리키는 accent 클래스의 실체. accent × variant 를 걸어 emit 한다.
//
// resolveAccent 가 만들 수 있는 모든 이름(pui-a-{accent}-{variant})에 정확히 대응하는
// 규칙을 여기서 굳힌다. resolver와 같은 ACCENTS·VARIANTS 배열을 도니 조합이 어긋날 수 없다.
//
// hover 는 .pui-interactive 가 함께 있을 때만 문다 — 눌리는 것(Button)만 gate 를 붙이고,
// 표시용(Badge)에는 안 붙여 hover 색이 뜨지 않는다.

import { globalStyle } from "@vanilla-extract/css";

import { ACCENTS, VARIANTS, INTERACTIVE } from "../resolvers/color";
import { accentProfile, type ColorSpec } from "./color-profile";

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
    ...(spec.hoverBorderColor ? { borderColor: spec.hoverBorderColor } : {}),
  });
};

for (const accent of ACCENTS) {
  for (const v of VARIANTS) {
    emit(`.pui-a-${accent}-${v}`, accentProfile(accent, v));
  }
}
