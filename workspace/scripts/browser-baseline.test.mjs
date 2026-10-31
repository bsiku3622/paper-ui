import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { ENGINES, FEATURES, buildTargets, checkStylesheet, compareVersions, parseFloor } from "./browser-baseline.mjs";

const { browserslist } = JSON.parse(readFileSync(new URL("../packages/paper-ui/package.json", import.meta.url), "utf8"));

test("[install.browsers.baseline] the declared floor supports every required CSS feature the stylesheet uses", () => {
  const floor = parseFloor(browserslist);
  assert.deepEqual(floor, { chrome: "125", edge: "125", firefox: "121", safari: "16.4", ios_saf: "16.4" });
  assert.deepEqual(buildTargets(browserslist), ["chrome125", "edge125", "firefox121", "safari16.4", "ios16.4"]);

  // The table never declares a required feature the floor lacks.
  for (const feature of FEATURES.filter(({ kind }) => kind === "required")) {
    for (const engine of ENGINES) assert.ok(compareVersions(feature.since[engine], floor[engine]) <= 0, `${feature.name} on ${engine}`);
  }

  const css = [
    "@layer pui;@layer pui.components{",
    ".a:has(input:focus-visible){outline:2px solid}",
    ".b:dir(rtl):checked::after{transform:translate(-1px,-50%)}",
    ".c{padding-inline:round(nearest,calc(var(--h) * 1.4),1px);inset-inline-end:0}",
    ":where(.d){translate:0 1px}",
    "}:root{color-scheme:light}",
    "@media (prefers-reduced-motion: reduce){*{transition-duration:0s}}",
    "@media (forced-colors: active){.e{border-color:CanvasText}}",
    "@media (prefers-color-scheme: dark){:root:not([data-pui-theme]){color-scheme:dark}}",
    ".f{overflow-wrap:anywhere}:root{--pui-typography-palette-font-size-hero:clamp(2.25rem, 6vw, 3.75rem)}",
    "@media (prefers-contrast: more){:root{--pui-color-border-base:#000}}",
    ".g{overflow-x:clip}",
    ".h{min-width:fit-content}.i{height:max-content}",
    "@property --t{syntax:'<color>';inherits:false;initial-value:transparent}",
    "@media (hover: hover){.j:hover{outline:0}}",
  ].join("");
  const result = checkStylesheet(css, floor);
  assert.deepEqual(result.used, FEATURES.map(({ name }) => name));
  assert.deepEqual(result.failures, []);

  // Look-alikes are not features: the color-scheme property inside its media query's name, an inset shadow, translate() and a round cap.
  assert.deepEqual(checkStylesheet("@media (prefers-color-scheme: dark){.a{box-shadow:inset 0 0 0 1px;transform:translateY(1px);stroke-linecap:round}}", floor).used, ["prefers-color-scheme"]);
  // The :hover pseudo-class is not the hover media feature.
  assert.deepEqual(checkStylesheet(".a:hover{color:red}", floor).used, []);
  // Hidden overflow and the clip margin are not the clip keyword.
  assert.deepEqual(checkStylesheet(".a{overflow:hidden;overflow-clip-margin:2px}", floor).used, []);
  // Grid track sizing takes the same words but is not a box size.
  assert.deepEqual(checkStylesheet(".a{grid-template-columns:min-content 1fr;grid-auto-rows:max-content}", floor).used, []);

  // A floor below a required feature fails the check.
  assert.deepEqual(checkStylesheet(".a:has(b){}", { ...floor, firefox: "120" }).failures, [{ name: ":has()", missing: ["firefox"] }]);

  // An enhancement newer than the floor only degrades.
  const table = [{ name: "@property", pattern: /@property\b/, kind: "enhancement", since: { chrome: "85", edge: "85", firefox: "128", safari: "16.4", ios_saf: "16.4" } }];
  assert.deepEqual(checkStylesheet("@property --t{syntax:'<color>';inherits:false;initial-value:transparent}", floor, table), {
    used: ["@property"],
    failures: [],
    degraded: [{ name: "@property", missing: ["firefox"] }],
  });
});
