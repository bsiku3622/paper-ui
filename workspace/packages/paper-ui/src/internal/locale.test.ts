import { describe, expect, it } from "vitest";

import { directionOf, localeDirection } from "./direction";
import { MESSAGES, resolveMessages } from "./messages";
import { resolveLocale } from "./locale";

describe("resolveLocale", () => {
  it("[primitives.locale.resolution] takes the locale given, else the document's language, else English", () => {
    expect(resolveLocale("ko", "ja")).toBe("ko");
    expect(resolveLocale(undefined, "ja")).toBe("ja");
    expect(resolveLocale(undefined, "")).toBe("en");
    expect(resolveLocale("", "")).toBe("en");
  });

  it("[primitives.locale.resolution] reads an underscore as a dash and a tag Intl rejects as English", () => {
    expect(resolveLocale("ko_KR", "")).toBe("ko-KR");
    expect(resolveLocale(undefined, "ar_EG")).toBe("ar-EG");
    expect(resolveLocale("x-klingon", "ko")).toBe("en");
    expect(resolveLocale(undefined, "not a tag")).toBe("en");
  });
});

describe("resolveMessages", () => {
  it("[primitives.locale.messages] has the same keys in every catalog, in English and Korean", () => {
    expect(Object.keys(MESSAGES.ko).sort()).toEqual(Object.keys(MESSAGES.en).sort());
    expect(MESSAGES.en).toEqual({ clear: "Clear", showPassword: "Show password", loading: "Loading" });
    expect(MESSAGES.ko).toEqual({ clear: "지우기", showPassword: "비밀번호 보기", loading: "불러오는 중" });
  });

  it("[primitives.locale.messages] matches the language subtag before the first dash or underscore, case apart", () => {
    for (const locale of ["ko", "ko-KR", "KO-kr", "ko_KR"]) expect(resolveMessages(locale), locale).toEqual(MESSAGES.ko);
    for (const locale of ["en", "en-GB", "fr", "zh-Hant", ""]) expect(resolveMessages(locale), locale).toEqual(MESSAGES.en);
  });

  it("[primitives.locale.messages] overrides key by key and ignores a key left undefined", () => {
    expect(resolveMessages("ko", { clear: "비우기", loading: undefined })).toEqual({ ...MESSAGES.ko, clear: "비우기" });
    const catalog = resolveMessages("en", { clear: "Reset" });
    expect(MESSAGES.en.clear).toBe("Clear");
    expect(catalog.clear).toBe("Reset");
  });
});

describe("localeDirection", () => {
  it("[primitives.locale.document] reads right-to-left languages as rtl and the rest as ltr", () => {
    for (const locale of ["ar", "ar-EG", "fa", "he", "ur", "ps", "sd", "ckb", "dv", "yi"]) expect(localeDirection(locale), locale).toBe("rtl");
    for (const locale of ["en", "ko", "ja", "fr-CA", "zh-Hant-TW"]) expect(localeDirection(locale), locale).toBe("ltr");
  });

  it("[primitives.locale.document] reads a tag the engine cannot parse by its first subtag", () => {
    expect(localeDirection("ar_EG")).toBe("rtl");
    expect(localeDirection("ko_KR")).toBe("ltr");
  });
});

describe("directionOf", () => {
  const tree = (dir?: string) => {
    const host = document.createElement("div");
    if (dir !== undefined) host.setAttribute("dir", dir);
    const child = document.createElement("span");
    host.append(child);
    document.body.append(host);
    return { host, child };
  };

  it("[primitives.roving-focus.direction] reads the nearest dir attribute, and left to right when there is none", () => {
    const rtl = tree("rtl");
    expect(directionOf(rtl.child)).toBe("rtl");
    const ltr = tree("ltr");
    expect(directionOf(ltr.child)).toBe("ltr");
    const none = tree();
    expect(directionOf(none.child)).toBe("ltr");
    for (const { host } of [rtl, ltr, none]) host.remove();
  });

  it("[primitives.roving-focus.direction] lets the nearest dir beat one further up, and reads the computed direction past an auto", () => {
    const outer = tree("rtl");
    outer.child.setAttribute("dir", "ltr");
    expect(directionOf(outer.child)).toBe("ltr");
    outer.child.setAttribute("dir", "auto");
    outer.child.style.direction = "rtl";
    expect(directionOf(outer.child)).toBe("rtl");
    outer.host.remove();
  });
});
