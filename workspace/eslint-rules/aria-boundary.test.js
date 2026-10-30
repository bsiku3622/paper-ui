import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

const eslint = new ESLint();
const restricted = async (code, filePath) =>
  (await eslint.lintText(code, { filePath }))[0].messages.some((message) => message.severity === 2 && message.ruleId === "no-restricted-imports");

const imports = [
  'import { usePress } from "@react-aria/interactions";',
  'import { mergeProps } from "@react-aria/utils";',
  'import { useOverlayTriggerState } from "@react-stately/overlays";',
  'import type { PressEvent } from "@react-types/shared";',
  'import { usePress } from "react-aria/usePress";',
];

test("[primitives.aria.boundary] React Aria is imported only inside src/internal/aria", async () => {
  for (const code of imports) {
    assert.equal(await restricted(code, "packages/paper-ui/src/internal/aria/probe.ts"), false, `inside: ${code}`);
    for (const path of [
      "packages/paper-ui/src/primitives/press/probe.ts",
      "packages/paper-ui/src/atoms/probe.tsx",
      "packages/paper-ui/src/internal/probe.ts",
      "packages/paper-ui/src/theme/probe.ts",
      "app/src/probe.tsx",
      "tests/probe.ts",
      "fixtures/harness/src/probe.tsx",
    ]) assert.equal(await restricted(code, path), true, `${path}: ${code}`);
  }
});

test("[primitives.aria.boundary] the boundary leaves the other imports of those folders alone", async () => {
  assert.equal(await restricted('import { useState } from "react";', "packages/paper-ui/src/primitives/press/probe.ts"), false);
  assert.equal(await restricted('import { joinClass } from "../../internal/joinClass";', "packages/paper-ui/src/primitives/press/probe.ts"), false);
});
