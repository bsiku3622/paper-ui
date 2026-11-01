import type { Locator } from "@playwright/test";

// WCAG contrast between colours, and one colour laid over another. Colours are the forms the tokens and the browser
// give: #rrggbb, #rrggbbaa, and the rgb() / rgba() a computed style returns. The unit tests of Color read the same file.

export type Rgba = readonly [red: number, green: number, blue: number, alpha: number];

export const parseColor = (color: string): Rgba => {
  const hex = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?$/i.exec(color);
  if (hex) return [parseInt(hex[1]!, 16), parseInt(hex[2]!, 16), parseInt(hex[3]!, 16), hex[4] ? parseInt(hex[4], 16) / 255 : 1];
  const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)$/i.exec(color);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), rgb[4] === undefined ? 1 : rgb[5] ? Number(rgb[4]) / 100 : Number(rgb[4])];
  throw new Error(`Not a colour: ${color}`);
};

export const luminance = (color: string) => {
  const [r, g, b] = parseColor(color).slice(0, 3).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};

// The contrast ratio of two opaque colours.
export const contrast = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
};

// An overlay laid over an opaque surface, as the eye sees it: #rrggbb.
export const over = (overlay: string, surface: string): string => {
  const [r, g, b, alpha] = parseColor(overlay);
  const below = parseColor(surface);
  const mixed = [r, g, b].map((channel, index) => Math.round(channel * alpha + below[index]! * (1 - alpha)));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
};

// The computed background and text colour of an element.
export const colors = (target: Locator) => target.evaluate((element) => ({ background: getComputedStyle(element).backgroundColor, color: getComputedStyle(element).color }));
