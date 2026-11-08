import { createElement, forwardRef } from "react";

import { Icon, type IconProps } from "@studio-baeks/paper-ui";

import { GLYPHS, type GlyphName } from "./glyphs";

export type { GlyphName };

export type GlyphProps = Omit<IconProps, "children" | "aria-label"> & {
  name: GlyphName;
  label?: string;
};

export const Glyph = forwardRef<SVGSVGElement, GlyphProps>(function Glyph({ name, label, ...rest }, ref) {
  const elements = GLYPHS[name] ?? GLYPHS["circle-help"];
  return (
    <Icon ref={ref} {...rest} {...(label ? { "aria-label": label } : {})}>
      {elements.map(([tag, attributes], index) => createElement(tag, { key: index, ...attributes }))}
    </Icon>
  );
});
