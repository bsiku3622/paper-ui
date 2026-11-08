import { useState, type CSSProperties } from "react";

import { SOURCE_VARIABLES } from "../tokens";

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

export function useSourceCarry(opener: (() => Element | null | undefined) | undefined, container: Element | undefined): CSSProperties {
  const [carry] = useState(() => (typeof document === "undefined" ? {} : sourceCarry(opener?.() ?? document.activeElement, container ?? document.body)));
  return carry;
}
