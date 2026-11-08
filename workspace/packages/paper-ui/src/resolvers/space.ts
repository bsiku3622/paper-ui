import { joinClass } from "../internal/joinClass";
import { spaceClass } from "../styles/space.css";
import type { Space } from "../tokens";

export const resolveSpace = (axis: keyof typeof spaceClass, step: Space | undefined): string =>
  step ? spaceClass[axis][step] : "";

export type GapProps = { gap?: Space; rowGap?: Space; columnGap?: Space };

export const resolveGap = ({ gap, rowGap, columnGap }: GapProps): string =>
  joinClass(resolveSpace("gap", gap), resolveSpace("rowGap", rowGap), resolveSpace("columnGap", columnGap));
