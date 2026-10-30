import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, expectTypeOf, it } from "vitest";

import { INVENTORY } from "../inventory";
import { tokens } from "./index";
import {
  DURATION,
  LOOP,
  LOOP_FRAMES,
  MOTION,
  MOTION_CONSUMERS,
  MOTION_LOOPS,
  MOTION_REDUCED,
  MOTION_ROLES,
  transition,
  type MotionRole,
} from "./motion";
import * as publicEntry from "./public";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..");

const sourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? sourceFiles(join(directory, entry.name)) : [join(directory, entry.name)],
  );

describe("Motion roles", () => {
  it("[foundations.motion.roles] names press, hover, state, enter, exit and theme, in that order, and no focus", () => {
    expect([...MOTION_ROLES]).toEqual(["press", "hover", "state", "enter", "exit", "theme"]);
    expect(Object.keys(MOTION)).toEqual([...MOTION_ROLES]);
    expect(Object.keys(MOTION)).not.toContain("focus");
    expectTypeOf<MotionRole>().toEqualTypeOf<"press" | "hover" | "state" | "enter" | "exit" | "theme">();
  });

  it("[foundations.motion.roles] gives every role at least one consumer, and a consumer only to a role", () => {
    expect(Object.keys(MOTION_CONSUMERS)).toEqual([...MOTION_ROLES]);
    for (const role of MOTION_ROLES) expect(MOTION_CONSUMERS[role].length, role).toBeGreaterThan(0);
  });

  it("[foundations.motion.roles] names consumers that exist: an Atom, a Primitive or the Provider", () => {
    const components: readonly string[] = [
      ...INVENTORY.atoms,
      ...Object.values(INVENTORY.primitives).flatMap((group) => group.components),
      ...INVENTORY.utilities.Theme,
    ];
    for (const role of MOTION_ROLES) {
      for (const consumer of MOTION_CONSUMERS[role]) expect(components, `${role} ${consumer}`).toContain(consumer);
    }
  });

  it("[foundations.motion.displacement] points a displacement at a Shape or Layout role", () => {
    expect(MOTION.press.offset).toBe(tokens.shape.stroke.border);
    expect(MOTION.enter.offset).toBe(tokens.layout.gap.xs);
    expect(MOTION.enter.scale).toBe("0.99");
    const withOffset = MOTION_ROLES.filter((role) => "offset" in MOTION[role]);
    expect(withOffset).toEqual(["press", "enter"]);
    for (const role of withOffset) expect((MOTION[role] as { offset: string }).offset, role).toMatch(/^var\(--pui-/);
  });

  it("[foundations.motion.reduced] ends a role's duration by the smallest positive one", () => {
    expect(parseFloat(MOTION_REDUCED.duration)).toBeGreaterThan(0);
    for (const role of MOTION_ROLES) {
      if (MOTION[role].duration !== DURATION.instant) expect(parseFloat(MOTION_REDUCED.duration), role).toBeLessThan(parseFloat(MOTION[role].duration));
    }
  });
});

describe("transition()", () => {
  it("[foundations.motion.transition] assembles a property with its role's duration and easing", () => {
    expect(transition("hover", "color")).toBe("color 100ms cubic-bezier(0.4, 0, 0.2, 1)");
    expect(transition("state", "background", "border-color")).toBe(
      "background 130ms cubic-bezier(0.4, 0, 0.2, 1), border-color 130ms cubic-bezier(0.4, 0, 0.2, 1)",
    );
    expect(transition("theme", "color")).toBe("color 0ms linear");
  });

  it("[foundations.motion.transition] takes each role's own timing and nothing else", () => {
    for (const role of MOTION_ROLES) {
      expect(transition(role, "opacity"), role).toBe(`opacity ${MOTION[role].duration} ${MOTION[role].easing}`);
    }
    expect(transition("press")).toBe("");
  });
});

describe("Loops", () => {
  it("[foundations.motion.compositions] gives every loop frames, a period, a curve and the loop that stands in for it under reduced motion", () => {
    expect(Object.keys(MOTION_LOOPS)).toEqual(Object.keys(LOOP));
    for (const [name, loop] of Object.entries(MOTION_LOOPS)) {
      expect(loop.frames, name).toBe(LOOP_FRAMES[name as keyof typeof LOOP_FRAMES]);
      expect(loop.duration, name).toMatch(/^\d+ms$/);
      expect(Object.keys(MOTION_LOOPS), name).toContain(loop.reduced);
    }
  });

  it("[foundations.motion.reduced] stands in for every loop with one that never leaves its place", () => {
    for (const [name, loop] of Object.entries(MOTION_LOOPS)) {
      const frames = Object.values(MOTION_LOOPS[loop.reduced].frames).flatMap((step) => Object.keys(step));
      expect(frames, name).toEqual(["opacity"]);
    }
  });
});

describe("The public tree", () => {
  it("[foundations.motion.public-tree] holds the roles and no duration, easing or loop", () => {
    expect(Object.keys(tokens.motion)).toEqual(["role"]);
    expect(tokens.motion.role).toBe(MOTION);
    // @ts-expect-error duration is Motion's source, not part of the tree
    expect(tokens.motion.duration).toBeUndefined();
    // @ts-expect-error easing is Motion's source, not part of the tree
    expect(tokens.motion.easing).toBeUndefined();
    // @ts-expect-error loop is Motion's source, not part of the tree
    expect(tokens.motion.loop).toBeUndefined();
  });

  it("[foundations.motion.public-tree] reaches /tokens as transition, MOTION_CONSUMERS and the role vocabulary only", () => {
    const entry = publicEntry as Record<string, unknown>;
    expect(entry.transition).toBe(transition);
    expect(entry.MOTION_CONSUMERS).toBe(MOTION_CONSUMERS);
    expect(entry.MOTION_ROLES).toBe(MOTION_ROLES);
    for (const source of ["DURATION", "EASING", "LOOP", "LOOP_FRAMES", "LOOP_REDUCED", "MOTION", "MOTION_LOOPS", "MOTION_REDUCED", "stateTransition"]) {
      expect(entry[source], source).toBeUndefined();
    }
  });
});

describe("Who writes motion", () => {
  const stylesheets = sourceFiles(SRC).filter((file) => file.endsWith(".css.ts"));
  const where = (file: string) => relative(SRC, file);

  it("[foundations.motion.consumers] assembles every package transition from a role", () => {
    for (const file of stylesheets) {
      for (const line of readFileSync(file, "utf8").split("\n")) {
        if (/^\s*transition:/.test(line)) expect(line, where(file)).toMatch(/transition\("/);
        expect(line, where(file)).not.toMatch(/tokens\.motion\.(duration|easing|loop)/);
      }
    }
  });

  it("[foundations.motion.compositions] keeps every keyframes rule in styles/motion.css.ts", () => {
    const writers = stylesheets.filter((file) => /\bkeyframes\s*\(/.test(readFileSync(file, "utf8")));
    expect(writers.map(where)).toEqual([join("styles", "motion.css.ts")]);
  });
});
