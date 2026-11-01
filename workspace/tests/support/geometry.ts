import type { Locator } from "@playwright/test";

import { emittedDeclarations, resolveDp } from "../../packages/paper-ui/src/tokens/resolve-dp";

export type Metrics = {
  width: number;
  height: number;
  padding: number;
  blockPadding: number;
  radius: number;
  transform: string;
  inset: number;
};

// A length as the browser computes it.
export const px = (value: number) => `${value}px`;

// The computed geometry of an element, or of one of its pseudo-elements, in CSS px.
export const metrics = (target: Locator, pseudo?: string): Promise<Metrics> => target.evaluate((element, pseudo) => {
  const s = getComputedStyle(element, pseudo);
  return { width: parseFloat(s.width), height: parseFloat(s.height), padding: parseFloat(s.paddingInlineStart), blockPadding: parseFloat(s.paddingBlockStart), radius: parseFloat(s.borderRadius), transform: s.transform, inset: parseFloat(s.insetInlineStart) };
}, pseudo);

// A role or recipe in dp, resolved from the sources the stylesheet emits at the default root, with the source overrides
// of a subtree laid over them. The numbers a spec expects of the browser come from here, not from the spec.
export const roleDp = (role: string, overrides: Record<string, string> = {}): number =>
  resolveDp(role, new Map([...emittedDeclarations(), ...Object.entries(overrides)]));
