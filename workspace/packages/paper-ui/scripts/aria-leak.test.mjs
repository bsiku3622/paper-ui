import { describe, expect, it } from "vitest";

import { ariaLeaks } from "./aria-leak.mjs";

describe("ariaLeaks", () => {
  it("finds an import, a type reference and a path of React Aria", () => {
    const code = [
      'import { PressEvent } from "@react-types/shared";',
      "export declare function usePress(): import(\"@react-aria/interactions\").PressResult;",
      'export type Result = import("react-stately/useOverlayTriggerState").OverlayTriggerState;',
      'export * from "@react-stately/overlays";',
    ].join("\n");
    expect(ariaLeaks("dist/index.d.ts", code)).toHaveLength(4);
    expect(ariaLeaks("dist/index.d.ts", code)[0]).toBe('dist/index.d.ts:1: import { PressEvent } from "@react-types/shared";');
  });

  it("leaves Paper's declarations and prose alone", () => {
    const code = [
      'import { HTMLAttributes } from "react";',
      "/** React Aria does the work behind the adapters. */",
      "export declare type PressableResult = { isActive: boolean };",
    ].join("\n");
    expect(ariaLeaks("dist/index.d.ts", code)).toEqual([]);
  });
});
