import { describe, expect, it } from "vitest";
import type { HtmlTagDescriptor } from "vite";

import { themeBootScript } from "@studio-baeks/paper-ui/theme-boot";

import { themeBoot } from "../vite/theme-boot";
import { THEME } from "./theme";

describe("the theme boot script", () => {
  it("is the script of the options the Provider gets, first in <head>", () => {
    const tags = (themeBoot().transformIndexHtml as () => HtmlTagDescriptor[])();
    expect(tags).toEqual([{ tag: "script", children: themeBootScript(THEME), injectTo: "head-prepend" }]);
  });
});
