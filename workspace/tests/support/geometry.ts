import type { Locator } from "@playwright/test";

export type Metrics = {
  width: number;
  height: number;
  padding: number;
  blockPadding: number;
  radius: number;
  transform: string;
  inset: number;
};

// The computed geometry of an element, or of one of its pseudo-elements, in CSS px.
export const metrics = (target: Locator, pseudo?: string): Promise<Metrics> => target.evaluate((element, pseudo) => {
  const s = getComputedStyle(element, pseudo);
  return { width: parseFloat(s.width), height: parseFloat(s.height), padding: parseFloat(s.paddingInlineStart), blockPadding: parseFloat(s.paddingBlockStart), radius: parseFloat(s.borderRadius), transform: s.transform, inset: parseFloat(s.insetInlineStart) };
}, pseudo);
