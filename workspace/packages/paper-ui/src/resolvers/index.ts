import { joinClass } from "../internal/joinClass";
import { spaceClass } from "../styles/space.css";
export { resolveControlFontSize, resolveControlStrong, resolvePreset, resolveText } from "./typography";
export { resolveFill, resolveInk } from "./color";
export { resolveGap, resolveSpace, type GapProps } from "./space";

export const BOX_STYLE = {
  padding: spaceClass.padding,
  paddingX: spaceClass.paddingX,
  paddingY: spaceClass.paddingY,
} as const;

export type BoxStyleProps = { [K in keyof typeof BOX_STYLE]?: keyof (typeof BOX_STYLE)[K] };

export const BOX_STYLE_KEYS = Object.keys(BOX_STYLE) as (keyof typeof BOX_STYLE)[];

export const resolveBoxClass = (props: BoxStyleProps): string =>
  joinClass(
    ...BOX_STYLE_KEYS.map((key) => {
      const name = props[key];
      return name ? (BOX_STYLE[key] as Record<string, string>)[name] : "";
    }),
  );
