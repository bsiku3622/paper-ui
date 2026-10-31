import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { ESLint } from "eslint";

// The second lint pass has to reach the package's files. ESLint takes its base path from the working directory, so a
// run from packages/paper-ui matches none of the workspace paths in the config and only the catch-all block fires.

test("the second lint pass reports a paper rule on a package file, and the package build runs it from the workspace root", async () => {
  const second = new ESLint({ overrideConfigFile: "eslint.paper.config.js" });
  const code = 'import { style } from "@vanilla-extract/css";\nexport const probe = style({ color: "#f00" });';
  const [result] = await second.lintText(code, { filePath: "packages/paper-ui/src/atoms/Probe.css.ts" });
  assert.ok(result.messages.some((message) => message.ruleId === "paper/raw-color"), JSON.stringify(result.messages));

  const { scripts } = JSON.parse(readFileSync("packages/paper-ui/package.json", "utf-8"));
  assert.match(scripts.build, /pnpm --dir \.\.\/\.\. exec eslint packages\/paper-ui\/src -c eslint\.paper\.config\.js --quiet/);
});
