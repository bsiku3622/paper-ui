// Space resolver — 간격 축(padding · paddingX · paddingY · gap · rowGap · columnGap)과 단계를 class 로 고른다.

import { spaceClass } from "../styles/space.css";
import type { Space } from "../tokens";

export const resolveSpace = (axis: keyof typeof spaceClass, step: Space | undefined): string =>
  step ? spaceClass[axis][step] : "";
