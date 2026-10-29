// Space resolver — 간격 축(padding · paddingX · paddingY · gap · rowGap · columnGap)과 단계를 class 로 고른다.

import { joinClass } from "../internal/joinClass";
import { spaceClass } from "../styles/space.css";
import type { Space } from "../tokens";

export const resolveSpace = (axis: keyof typeof spaceClass, step: Space | undefined): string =>
  step ? spaceClass[axis][step] : "";

// The gap family of a container. `gap` comes first in space.css, so a longhand given beside it wins.
export type GapProps = { gap?: Space; rowGap?: Space; columnGap?: Space };

export const resolveGap = ({ gap, rowGap, columnGap }: GapProps): string =>
  joinClass(resolveSpace("gap", gap), resolveSpace("rowGap", rowGap), resolveSpace("columnGap", columnGap));
