import { styleVariants } from "@vanilla-extract/css";

import { tokens } from "../tokens";

// theme + utility 를 여기서 한 번 끌어온다 — Box 를 import 하면 지면과
// resolver 가 가리키는 클래스가 함께 따라온다.
import "../styles/theme.css";
import "../styles/utility.css";

// 괘선지는 theme.css.ts 의 `.paper-rules` 한 곳에만 정의돼 있다.
// 여기서 다시 그리면 line 을 바꿀 때 두 곳이 갈린다.
export const RULED_CLASS = "paper-rules";

export const boxRadius = styleVariants({
  base: { borderRadius: tokens.shape.radius.base },
  lg: { borderRadius: tokens.shape.radius.lg },
  pill: { borderRadius: tokens.shape.radius.pill },
});

export const boxShadow = styleVariants({
  raised: { boxShadow: tokens.shape.shadow.raised },
  overlay: { boxShadow: tokens.shape.shadow.overlay },
});
