// Color resolver — interactive 색의 이름 규칙의 주인.
//
// studio-ui 의 resolveColorClassnames 패턴을 paper-ui 로 이식한 것. 컴포넌트는
// "내가 어떤 variant·status 인지" 만 말하고, 그게 무슨 클래스가 되는지는 모른다.
// 그 클래스의 실체(background·color·border)는 styles/color.css.ts 가 같은 축
// 배열을 걸어 굳힌다 — resolver 와 emitter 가 한 배열을 도니 조합이 어긋날 수 없다.
//
// paper-ui 는 색을 자유롭게 고르지 않는다(primaryColor 없음). 그래서 studio-ui 의
// (color × variant × status) 3 축에서 color 를 뺀 **variant × status 2 축** 이다:
//   variant  시각 무게 — solid(검정 채움) · soft(회색/옅은 색면) · outline · quiet
//   status   의미 색   — default(뉴트럴) · info · success · warning · danger
//
//   resolveColorClassnames("solid")            → "pui-c-solid"        (검정)
//   resolveColorClassnames("solid", "danger")  → "pui-c-solid-danger" (빨강)
//   resolveColorClassnames("soft", "success")  → "pui-c-soft-success" (옅은 초록)

import type { StatusName } from "../tokens";

export const VARIANTS = ["solid", "soft", "outline", "quiet"] as const;
export type Variant = (typeof VARIANTS)[number];

export type ColorStatus = "default" | StatusName;

export const resolveColorClassnames = (variant: Variant, status: ColorStatus = "default"): string =>
  status === "default" ? `pui-c-${variant}` : `pui-c-${variant}-${status}`;

// hover/active 를 켜는 opt-in gate. Button 처럼 눌리는 것만 붙인다 — Badge 같은
// 표시용은 안 붙여 hover 색이 뜨지 않게 한다 (studio-ui 의 is-interactive).
export const INTERACTIVE = "pui-interactive";
