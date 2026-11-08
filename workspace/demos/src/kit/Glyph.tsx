// Glyph — a Lucide icon drawn by Paper's Icon. Paper owns no icon set; it takes path data, and this is that data.
// <Glyph name="search" />, <Glyph name="play" size="subheading" ink="secondary" />, <Glyph name="bell" label="알림" />.
// Names are Lucide's (https://lucide.dev/icons), kebab-case. Inside a Button or IconButton the control sizes it.

import { createElement, forwardRef } from "react";

import { Icon, type IconProps } from "@studio-baeks/paper-ui";

import { GLYPHS, type GlyphName } from "./glyphs";

export type { GlyphName };

export type GlyphProps = Omit<IconProps, "children" | "aria-label"> & {
  name: GlyphName;
  // A name makes the glyph an image read aloud; without one it is decoration.
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
