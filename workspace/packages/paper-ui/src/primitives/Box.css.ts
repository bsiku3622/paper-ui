import { style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// theme + utility 를 여기서 한 번 끌어온다 — Box 를 import 하면 캔버스와
// resolver 가 가리키는 클래스가 함께 따라온다.
import "../styles/theme.css";
import "../styles/utility.css";

export const boxRadius = styleVariants({
  sm: { borderRadius: tokens.shape.radius.interaction },
  md: { borderRadius: tokens.shape.radius.layout.md },
  lg: { borderRadius: tokens.shape.radius.layout.lg },
  pill: { borderRadius: tokens.shape.constants.pillRadius },
});

// Box `shadow` prop → overlay(자유롭게 뜸) · overlayMinimal(살짝). 붙은 면은 prop 생략.
export const boxShadow = styleVariants({
  overlay: { boxShadow: tokens.shape.shadow.overlay },
  overlayMinimal: { boxShadow: tokens.shape.shadow.overlayMinimal },
});

// Box `border` prop → 카드 헤어라인. 면(surface) 위에 얇은 뉴트럴 선(옛 variant="outline").
// 불리언이라 CSS 값 주입과 헷갈리지 않는다 — 선이 필요하면 켜고, 색은 border.base 로 고정.
export const boxBorder = style({
  borderWidth: tokens.shape.constants.borderWidth,
  borderStyle: "solid",
  borderColor: tokens.color.border.base,
});
