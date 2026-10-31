// Which way text runs: at an element that is on the page, and for a locale before anything is rendered.

export type Direction = "ltr" | "rtl";

// The nearest dir attribute that names a direction, then the direction the element computes, then left to right.
export function directionOf(element: Element): Direction {
  const attribute = element.closest("[dir]")?.getAttribute("dir");
  if (attribute === "ltr" || attribute === "rtl") return attribute;
  return element.ownerDocument.defaultView?.getComputedStyle(element).direction === "rtl" ? "rtl" : "ltr";
}

// The languages written right to left, for an engine that cannot say so itself.
const RTL_LANGUAGES = ["ar", "fa", "he", "ur", "ps", "sd", "ckb", "dv", "yi"];

type TextInfo = { direction?: string };
type LocaleInfo = Intl.Locale & { getTextInfo?: () => TextInfo; textInfo?: TextInfo };

export function localeDirection(locale: string): Direction {
  let info: LocaleInfo | undefined;
  try {
    info = new Intl.Locale(locale) as LocaleInfo;
  } catch {
    info = undefined;
  }
  const direction = info?.getTextInfo?.().direction ?? info?.textInfo?.direction;
  if (direction === "ltr" || direction === "rtl") return direction;
  const language = (info?.language ?? locale.split(/[-_]/)[0] ?? "").toLowerCase();
  return RTL_LANGUAGES.includes(language) ? "rtl" : "ltr";
}
