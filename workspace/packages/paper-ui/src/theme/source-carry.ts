// source-carry.ts — the source overrides of the place a portal was opened from.
//
// A portal lands under <body>, outside the subtree that may override a Shape, Layout or Typography source variable
// (`.dense { --pui-shape-control-height-md: 40px }`), so what it holds would draw with the defaults. The portal root
// carries the variables that differ between the opener and the container, and every role built on them is recomputed
// inside. Colour roles are not copied: the mode travels as the scope attribute (scope.ts).

import { useState, type CSSProperties } from "react";

import { SOURCE_VARIABLES } from "../tokens";

/** The source variables the opener has set differently from the container, by name. */
export function sourceCarry(opener: Element | null | undefined, container: Element): CSSProperties {
  if (!opener?.isConnected) return {};
  const view = container.ownerDocument.defaultView;
  if (!view) return {};
  const here = view.getComputedStyle(opener);
  const there = view.getComputedStyle(container);
  const carry: Record<string, string> = {};
  for (const name of SOURCE_VARIABLES) {
    const value = here.getPropertyValue(name);
    if (value !== "" && value !== there.getPropertyValue(name)) carry[name] = value;
  }
  return carry as CSSProperties;
}

/** `sourceCarry` once for the life of the portal, read while it first renders so its first painted frame already has it. */
export function useSourceCarry(opener: (() => Element | null | undefined) | undefined, container: Element | undefined): CSSProperties {
  const [carry] = useState(() => (typeof document === "undefined" ? {} : sourceCarry(opener?.() ?? document.activeElement, container ?? document.body)));
  return carry;
}
