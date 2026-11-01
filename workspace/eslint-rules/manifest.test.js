import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  APP_DIMENSION_MODULES,
  ELEVATION_OWNERS,
  GLOBAL_SELECTOR_FILES,
  INSPECT_ALIAS,
  INSPECT_DIR,
  INSPECT_SYSTEMS,
  LAYER_MODULE,
  PACKAGE_EXPORTS,
  RULES,
  RUNTIME_STYLE,
  STROKE_OWNER,
  TOKEN_BARREL,
  TOKEN_LAYER,
  TOOLING,
  WORKSPACE,
  inspectSystemOf,
  isTestFile,
  resolveRelative,
} from "./manifest.js";
import paper from "./paper.js";

const read = (file) => readFileSync(path.join(WORKSPACE, file), "utf8");
const exists = (file) => existsSync(path.join(WORKSPACE, file));

test("[guardrails.manifest.declared-boundaries] every path the manifest declares exists, and what it names is there", () => {
  for (const file of [TOKEN_BARREL, LAYER_MODULE, STROKE_OWNER.file, ...ELEVATION_OWNERS, ...APP_DIMENSION_MODULES, ...GLOBAL_SELECTOR_FILES, ...TOOLING.flatMap((entry) => [entry.file, entry.imports])]) {
    assert.equal(exists(file), true, file);
  }
  assert.equal(exists(TOKEN_LAYER), true);
  for (const system of INSPECT_SYSTEMS) assert.equal(exists(`${INSPECT_DIR}/${system}.ts`), true, system);
  assert.match(read(STROKE_OWNER.file), new RegExp(`export const ${STROKE_OWNER.name}\\b`));
  // A runtime module is a path inside src; its reason is stated.
  for (const [module, reason] of Object.entries(RUNTIME_STYLE)) {
    assert.equal(exists(`${TOKEN_LAYER.replace(/\/tokens$/, "")}/${module.replace(/\/\*\*$/, "")}`) || exists(`${TOKEN_LAYER.replace(/\/tokens$/, "")}/${module.replace(/\/\*\*$/, "")}.ts`), true, module);
    assert.ok(reason.length > 0, module);
  }
  for (const entry of TOOLING) assert.ok(entry.reason.length > 0, entry.file);
});

test("[guardrails.manifest.declared-boundaries] the app's alias, the package's exports and the inspector files agree with the manifest", () => {
  const exportsMap = JSON.parse(read("packages/paper-ui/package.json")).exports;
  assert.deepEqual(PACKAGE_EXPORTS, Object.keys(exportsMap));
  assert.deepEqual(PACKAGE_EXPORTS, [".", "./tokens", "./theme-boot", "./styles.css"]);
  // One alias, in Vite and in tsconfig, to src/tokens/inspect.
  const vite = read("app/vite.config.ts");
  assert.ok(vite.includes(`/^${INSPECT_ALIAS.replace(/\//g, "\\/")}(.+)$/`), "the Vite alias");
  assert.ok(vite.includes(INSPECT_DIR.replace("packages/paper-ui/", "../packages/paper-ui/") + "/"), "the Vite alias target");
  const paths = JSON.parse(read("app/tsconfig.json")).compilerOptions.paths;
  assert.deepEqual(paths, { [`${INSPECT_ALIAS}*`]: ["../packages/paper-ui/src/tokens/inspect/*.ts"] });
  // An inspector page is named for its system.
  assert.equal(inspectSystemOf("app/src/playground/foundations/ColorPage.tsx"), "color");
  assert.equal(inspectSystemOf("app/src/playground/foundations/typography-roles.ts"), "typography");
  assert.equal(inspectSystemOf("app/src/docs/generated/layout.ts"), "layout");
  assert.equal(inspectSystemOf("app/src/playground/foundations/kit.tsx"), undefined);
  assert.equal(inspectSystemOf("app/src/pages/Home.tsx"), undefined);
  for (const file of ["packages/paper-ui/src/tokens/color.test.ts", "tests/foundations/shape.spec.ts", "app/src/playground/foundations/inspector.test.ts", "scripts/x.test.mjs"]) assert.equal(isTestFile(file), true, file);
  assert.equal(isTestFile("app/src/playground/foundations/ColorPage.tsx"), false);
  assert.equal(resolveRelative("packages/paper-ui/src/atoms/Button.tsx", "../tokens/index.ts"), "packages/paper-ui/src/tokens");
  assert.equal(resolveRelative("packages/paper-ui/src/atoms/Button.tsx", "react"), undefined);
});

test("[guardrails.manifest.declared-boundaries] RULES lists the plugin's eight rules, in Korean and English, with what runs each", () => {
  assert.deepEqual(RULES.map((rule) => rule.id).sort(), Object.keys(paper.rules).sort());
  assert.equal(RULES.length, 8);
  for (const rule of RULES) {
    for (const language of ["ko", "en"]) {
      assert.ok(rule[language].title.length > 0 && rule[language].summary.length > 0, `${rule.id} ${language}`);
    }
    assert.ok(rule.eslint.length > 0, rule.id);
    assert.ok(rule.eslint.includes(`paper/${rule.id}`), rule.id);
    for (const id of rule.eslint.filter((entry) => entry.startsWith("paper/"))) assert.ok(paper.rules[id.slice("paper/".length)], id);
    assert.match(rule.ko.summary, /[가-힣]/, rule.id);
    assert.doesNotMatch(rule.en.summary, /[가-힣]/, rule.id);
  }
});
