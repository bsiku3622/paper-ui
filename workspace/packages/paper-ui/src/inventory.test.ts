import { createElement, type ElementType } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import * as pkg from "./index";
import * as tokensEntry from "./tokens/public";
import { INVENTORY, PRIMITIVE_GROUPS, PRIMITIVE_ORDERS } from "./inventory";

const exported = pkg as unknown as Record<string, unknown>;
const primitives = Object.values(INVENTORY.primitives);
const components: readonly string[] = [...primitives.flatMap((group) => group.components), ...INVENTORY.atoms];
const functions: readonly string[] = [
  ...primitives.flatMap((group) => [...group.hooks, ...("functions" in group ? group.functions : [])]),
  ...Object.values(INVENTORY.utilities).flat(),
];
const classes: readonly string[] = INVENTORY.classes;
const listed: readonly string[] = [...components, ...functions, ...classes];

describe("INVENTORY", () => {
  it("lists exactly the value exports of '.'", () => {
    expect(Object.keys(pkg).sort()).toEqual([...listed, "INVENTORY", "PRIMITIVE_ORDERS", "PRIMITIVE_GROUPS"].sort());
  });

  it("lists exactly the value exports of '/tokens' as foundations", () => {
    expect(Object.keys(tokensEntry).sort()).toEqual([...INVENTORY.foundations].sort());
  });

  it("names every export once, across both entries", () => {
    const names = [...listed, ...INVENTORY.foundations];
    expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual([]);
  });

  it("keeps PRIMITIVE_GROUPS the order of the primitive categories, the first order before the second", () => {
    expect(Object.keys(INVENTORY.primitives)).toEqual([...PRIMITIVE_GROUPS]);
    expect([...PRIMITIVE_GROUPS]).toEqual([...PRIMITIVE_ORDERS.first, ...PRIMITIVE_ORDERS.second]);
    expect(exported.PRIMITIVE_ORDERS).toBe(PRIMITIVE_ORDERS);
  });

  const isComponent = (value: unknown) => {
    const isForwardRef = typeof value === "object" && value !== null && (value as { $$typeof?: symbol }).$$typeof === Symbol.for("react.forward_ref");
    return typeof value === "function" || isForwardRef;
  };

  it("lists a function or a forwardRef object for every component", () => {
    for (const name of components) expect(isComponent(exported[name]), name).toBe(true);
  });

  it("lists the compound statics of an atom without exporting them on their own", () => {
    for (const [name, parts] of Object.entries(INVENTORY.anatomy)) {
      const compound = exported[name] as unknown as Record<string, unknown>;
      for (const part of parts) {
        expect(isComponent(compound[part]), `${name}.${part}`).toBe(true);
        expect(exported[`${name}${part}`], `${name}${part}`).toBeUndefined();
      }
    }
  });

  it("lists a function for every hook and utility", () => {
    for (const name of functions) expect(typeof exported[name], name).toBe("function");
  });

  it("lists a class function or a map of class names for every class", () => {
    for (const name of classes) {
      const value = exported[name];
      const isMap = typeof value === "object" && value !== null && Object.values(value).every((entry) => typeof entry === "string" && entry !== "");
      expect(typeof value === "function" || isMap, name).toBe(true);
    }
  });

  it("renders as='section' as a <section> for every polymorphic entry", () => {
    for (const name of INVENTORY.polymorphic) {
      const [head = "", member] = name.split(".");
      const Root = exported[head] as ElementType;
      const element = member
        ? createElement(Root, null, createElement((Root as unknown as Record<string, ElementType>)[member]!, { as: "section", value: "item" }))
        : createElement(Root, { as: "section" });
      const view = render(element);
      expect(view.container.querySelector("section"), name).not.toBeNull();
      view.unmount();
    }
  });
});
