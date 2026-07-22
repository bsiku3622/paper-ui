import { styleVariants } from "@vanilla-extract/css";

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

export const boxShadow = styleVariants({
  raised: { boxShadow: tokens.shape.shadow.raised },
  overlay: { boxShadow: tokens.shape.shadow.overlay },
});
