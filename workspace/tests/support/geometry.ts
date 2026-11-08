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

export const px = (value: number) => `${value}px`;

export const metrics = (target: Locator, pseudo?: string): Promise<Metrics> => target.evaluate((element, pseudo) => {
  const s = getComputedStyle(element, pseudo);
  return {
    width: parseFloat(s.width),
    height: parseFloat(s.height),
    padding: parseFloat(s.paddingInlineStart) + parseFloat(s.borderInlineStartWidth),
    blockPadding: parseFloat(s.paddingBlockStart) + parseFloat(s.borderBlockStartWidth),
    radius: parseFloat(s.borderRadius),
    transform: s.transform,
    inset: parseFloat(s.insetInlineStart),
  };
}, pseudo);

export const roleDp = (role: string, overrides: Record<string, string> = {}): number =>
  resolveDp(role, new Map([...emittedDeclarations(), ...Object.entries(overrides)]));
