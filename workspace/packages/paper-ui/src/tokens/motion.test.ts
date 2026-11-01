import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, expectTypeOf, it } from "vitest";

import { INVENTORY } from "../inventory";
import { tokens } from "./index";
import {
  DURATION,
  EASING,
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
import * as rootEntry from "../index";
import * as publicEntry from "./public";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..");

const sourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? sourceFiles(join(directory, entry.name)) : [join(directory, entry.name)],
  );

// The design values of Motion, written down. The tests below hold for any design; this file says which design this
// is. A change to it is deliberate: review the diff, then `vitest -u` rewrites the file.
describe("the golden Motion file", () => {
  it("[foundations.motion.source-table] [foundations.motion.role-table] records the sources, the roles and loops they make, and the transitions those write", async () => {
    const written = { hover: transition("hover", "color"), state: transition("state", "background", "border-color"), theme: transition("theme", "color") };
    await expect(`${JSON.stringify({ duration: DURATION, easing: EASING, roles: MOTION, loops: MOTION_LOOPS, reduced: MOTION_REDUCED, transition: written }, null, 2)}\n`).toMatchFileSnapshot("./__golden__/motion-resolved.json");
  });
});

describe("Motion roles", () => {
  it("[foundations.motion.roles] [foundations.motion.no-focus-role] names press, hover, state, enter, exit and theme, in that order, and no focus", () => {
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
    expect(Number(MOTION.enter.scale)).toBeLessThan(1);
    const withOffset = MOTION_ROLES.filter((role) => "offset" in MOTION[role]);
    expect(withOffset).toEqual(["press", "enter"]);
    for (const role of withOffset) expect((MOTION[role] as { offset: string }).offset, role).toMatch(/^var\(--pui-/);
  });

  it("[foundations.motion.roles] takes every role's duration and easing from the scales, and every loop's curve from the easing scale", () => {
    for (const role of MOTION_ROLES) {
      expect(Object.values(DURATION), `${role} duration`).toContain(MOTION[role].duration);
      expect(Object.values(EASING), `${role} easing`).toContain(MOTION[role].easing);
    }
    for (const [name, loop] of Object.entries(MOTION_LOOPS)) expect(Object.values(EASING), `${name} curve`).toContain(loop.easing);
  });

  it("[foundations.motion.reduced] ends a role's duration by the smallest positive one", () => {
    const positive = Object.values(DURATION).map(parseFloat).filter((ms) => ms > 0);
    expect(MOTION_REDUCED.duration).toBe(DURATION.reduced);
    expect(parseFloat(MOTION_REDUCED.duration)).toBe(Math.min(...positive));
    for (const role of MOTION_ROLES) {
      if (MOTION[role].duration !== DURATION.instant) expect(parseFloat(MOTION_REDUCED.duration), role).toBeLessThan(parseFloat(MOTION[role].duration));
    }
  });

  it("[foundations.motion.reduced] [foundations.motion.reduced-layers] covers transitions, finite animations and pseudo-elements in one policy, ahead of nothing but the loops' own reduced forms", () => {
    const code = readFileSync(join(SRC, "styles", "motion.css.ts"), "utf8");
    const policy = /components\.globalStyle\("([^"]+)", \{[\s\S]*?\n\}\);/.exec(code);
    expect(policy?.[1], "the policy selector").toBe("*, *::before, *::after");
    const body = policy![0];
    for (const declaration of ["transitionDuration", "animationDuration", "animationIterationCount"]) expect(body, declaration).toContain(`${declaration}:`);
    expect(body).toContain("[REDUCED_MOTION]");
    expect(code).toContain('const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"');
    expect(body.match(/!important/g)).toHaveLength(3);
    // Every other motion class leaves reduced motion to the policy, but a loop swaps in its reduced form itself.
    expect(code.match(/REDUCED_MOTION\]: \{\s*animation: run\(MOTION_LOOPS/g)).toHaveLength(Object.keys(MOTION_LOOPS).length);
  });
});

describe("transition()", () => {
  it("[foundations.motion.transition] assembles a property with its role's duration and easing", () => {
    expect(transition("hover", "color")).toBe(`color ${MOTION.hover.duration} ${MOTION.hover.easing}`);
    expect(transition("state", "background", "border-color")).toBe(
      `background ${MOTION.state.duration} ${MOTION.state.easing}, border-color ${MOTION.state.duration} ${MOTION.state.easing}`,
    );
    expect(transition("theme", "color")).toBe(`color ${DURATION.instant} ${EASING.linear}`);
  });

  it("[foundations.motion.transition] takes each role's own timing and nothing else", () => {
    for (const role of MOTION_ROLES) {
      expect(transition(role, "opacity"), role).toBe(`opacity ${MOTION[role].duration} ${MOTION[role].easing}`);
    }
    expect(transition("press")).toBe("");
  });
});

describe("Loops", () => {
  it("[foundations.motion.compositions] [foundations.motion.loops] gives every loop frames, a period, a curve and the loop that stands in for it under reduced motion", () => {
    expect(Object.keys(MOTION_LOOPS)).toEqual(Object.keys(LOOP));
    for (const [name, loop] of Object.entries(MOTION_LOOPS)) {
      expect(loop.frames, name).toBe(LOOP_FRAMES[name as keyof typeof LOOP_FRAMES]);
      expect(loop.duration, name).toMatch(/^\d+ms$/);
      expect(Object.keys(MOTION_LOOPS), name).toContain(loop.reduced);
    }
  });

  it("[foundations.motion.reduced] [foundations.motion.reduced-loops] stands in for every loop with one that never leaves its place", () => {
    for (const [name, loop] of Object.entries(MOTION_LOOPS)) {
      const frames = Object.values(MOTION_LOOPS[loop.reduced].frames).flatMap((step) => Object.keys(step));
      expect(frames, name).toEqual(["opacity"]);
    }
  });
});

describe("The class maps", () => {
  it("[foundations.motion.class-maps-in-root] come from the component entry, not from /tokens", () => {
    const root = rootEntry as Record<string, unknown>;
    const tokensEntry = publicEntry as Record<string, unknown>;
    for (const name of ["presence", "loop"]) {
      expect(typeof root[name], `${name} in '.'`).toBe("object");
      expect(tokensEntry[name], `${name} not in /tokens`).toBeUndefined();
    }
    expect(Object.keys(root.presence as object)).toEqual(["surface", "scrim"]);
    expect(Object.keys(root.loop as object)).toEqual(Object.keys(LOOP));
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
