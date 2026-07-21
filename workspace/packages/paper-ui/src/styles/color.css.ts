// color.css — resolver 가 가리키는 색 클래스의 실체. 축 배열을 걸어 조합을 emit 한다.
//
// resolveColorClassnames 가 만들 수 있는 모든 이름(pui-c-{variant} ·
// pui-c-{variant}-{status})에 정확히 대응하는 규칙을 여기서 굳힌다. 둘 다 같은
// VARIANTS·STATUS 배열을 돌기 때문에 조합이 빠지거나 어긋날 수 없다.
//
// hover 는 .pui-interactive 가 함께 있을 때만 문다 — 눌리는 것(Button)만 gate 를
// 붙이고, 표시용(Badge)은 안 붙여 hover 색이 뜨지 않는다.

import { globalStyle } from "@vanilla-extract/css";

import { tokens, STATUS, STATUS_ACCENT } from "../tokens";
import { VARIANTS, INTERACTIVE } from "../resolvers/color";
import { neutralProfile, statusProfile, type ColorSpec } from "./color-profile";

const emit = (cls: string, spec: ColorSpec): void => {
  globalStyle(cls, {
    background: spec.background,
    color: spec.color,
    borderColor: spec.borderColor,
  });
  globalStyle(`.${INTERACTIVE}${cls}:hover:not(:disabled)`, {
    background: spec.hoverBackground,
    ...(spec.hoverColor ? { color: spec.hoverColor } : {}),
  });
};

for (const v of VARIANTS) {
  // 뉴트럴 (status=default)
  emit(`.pui-c-${v}`, neutralProfile[v]);
  // status × variant
  for (const s of STATUS) {
    const c = tokens.color.accent[STATUS_ACCENT[s]];
    emit(`.pui-c-${v}-${s}`, statusProfile(c)[v]);
  }
}
