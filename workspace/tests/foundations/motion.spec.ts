import { expect, test, type Locator, type Page } from "@playwright/test";

import { INVENTORY } from "../../packages/paper-ui/src/inventory";
import { MOTION, MOTION_CONSUMERS, MOTION_ROLES, type MotionRole } from "../../packages/paper-ui/src/tokens/motion";
import { openHarness, openPlayground } from "../support/harness";

// The chromium project runs the role timings and the presence recipe as authored; chromium-reduced-motion runs the
// same page with prefers-reduced-motion and checks what the policy does to them.

type Fixtures = { contextOptions: { reducedMotion?: string | null } };
const isReduced = ({ contextOptions }: Fixtures) => contextOptions.reducedMotion === "reduce";

type Timing = { duration: number; easing: string };
const timing = (role: MotionRole): Timing => ({ duration: parseFloat(MOTION[role].duration), easing: MOTION[role].easing });

// Each transitioned property of an element with its duration in ms and its easing, as the browser computes them.
const transitionsOf = (target: Locator, pseudo?: "::after") =>
  target.evaluate((element, pseudo) => {
    const style = getComputedStyle(element, pseudo);
    const list = (value: string) => value.split(/,\s*(?![^()]*\))/);
    const [properties, durations, easings] = [style.transitionProperty, style.transitionDuration, style.transitionTimingFunction].map(list) as [string[], string[], string[]];
    return Object.fromEntries(
      properties.map((property, index) => [property, { duration: parseFloat(durations[index % durations.length]!) * 1000, easing: easings[index % easings.length]! }]),
    ) as Record<string, Timing>;
  }, pseudo);

// What an element looks like at the first frame of its presence animation, or after it has run out. The animation
// is started again first, so it is still there to read however late the test gets to it.
const frameOf = (target: Locator, at: "start" | "end") =>
  target.evaluate((element, at) => {
    const state = element.getAttribute("data-presence")!;
    element.removeAttribute("data-presence");
    element.getBoundingClientRect();
    element.setAttribute("data-presence", state);
    const animation = element.getAnimations()[0]!;
    if (at === "start") {
      animation.pause();
      animation.currentTime = 0;
    } else {
      animation.finish();
    }
    const style = getComputedStyle(element);
    return { opacity: style.opacity, transform: style.transform };
  }, at);

const animationOf = (target: Locator) =>
  target.evaluate((element) => {
    const style = getComputedStyle(element);
    return { name: style.animationName, duration: parseFloat(style.animationDuration) * 1000, easing: style.animationTimingFunction, fill: style.animationFillMode, iterations: style.animationIterationCount };
  });

// The Floating example of the Playground, opened from its trigger. A panel on the page is the node with its presentation.
const openFloating = async (page: Page, presentation?: "modal") => {
  await page.goto("/playground/floating");
  if (presentation) await page.getByRole("combobox", { name: "presentation", exact: true }).selectOption(presentation);
  await page.getByRole("button", { name: "설정 열기", exact: true }).click();
  return page.locator("[data-presentation]");
};

// Chromium plays every animation of the page at a fraction of its speed, so a state that lasts 100ms can be looked at.
const playbackRate = async (page: Page, rate: number) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Animation.enable");
  await cdp.send("Animation.setPlaybackRate", { playbackRate: rate });
};

type Row = { atom: string; target: (page: Page) => Locator; pseudo?: "::after"; properties: Record<string, MotionRole> };

const BUTTON = { "border-color": "hover", background: "state", color: "state", transform: "press" } as const;

// What each Atom in MOTION_CONSUMERS transitions, and with which role.
const ATOM_TRANSITIONS: Row[] = [
  { atom: "Button", target: (page) => page.getByRole("button", { name: "Button", exact: true }), properties: BUTTON },
  { atom: "IconButton", target: (page) => page.getByRole("button", { name: "Icon button" }), properties: BUTTON },
  { atom: "Field", target: (page) => page.getByLabel("Field", { exact: true }).locator(".."), properties: { "border-color": "state", background: "state" } },
  { atom: "Field", target: (page) => page.getByRole("button", { name: "지우기" }), properties: { color: "hover" } },
  { atom: "Select", target: (page) => page.getByLabel("Select", { exact: true }).locator(".."), properties: { "border-color": "state", "background-color": "state" } },
  { atom: "Textarea", target: (page) => page.getByLabel("Textarea", { exact: true }), properties: { "border-color": "state", "box-shadow": "state", background: "state" } },
  { atom: "Checkbox", target: (page) => page.getByRole("checkbox"), properties: { background: "state", "border-color": "state" } },
  { atom: "Radio", target: (page) => page.getByRole("radio"), properties: { "border-color": "state" } },
  { atom: "Switch", target: (page) => page.getByRole("switch"), properties: { background: "state" } },
  { atom: "Switch", target: (page) => page.getByRole("switch"), pseudo: "::after", properties: { transform: "state" } },
];

const labelOf = (row: Row) => `${row.atom}${row.pseudo ? ` ${row.pseudo}` : ""}`;

test("[foundations.motion.consumers] lists as consumers the Atoms that transition each role, and no others", () => {
  const atoms: readonly string[] = INVENTORY.atoms;
  for (const role of MOTION_ROLES) {
    const covered = new Set(ATOM_TRANSITIONS.filter((row) => Object.values(row.properties).includes(role)).map((row) => row.atom));
    expect([...covered].sort(), role).toEqual(MOTION_CONSUMERS[role].filter((consumer) => atoms.includes(consumer)).sort());
  }
});

test.describe("with motion", () => {
  test.skip(isReduced, "reduced motion collapses every timing; the policy is checked in chromium-reduced-motion");

  test("[foundations.motion.consumers] every Atom transitions each property with its role's duration and easing, and nothing else", async ({ page }) => {
    await openHarness(page, "motion");
    for (const row of ATOM_TRANSITIONS) {
      const actual = await transitionsOf(row.target(page), row.pseudo);
      expect(Object.keys(actual).sort(), labelOf(row)).toEqual(Object.keys(row.properties).sort());
      for (const [property, role] of Object.entries(row.properties)) {
        expect(actual[property]!.duration, `${labelOf(row)} ${property}`).toBeCloseTo(timing(role).duration, 3);
        expect(actual[property]!.easing, `${labelOf(row)} ${property}`).toBe(timing(role).easing);
      }
    }
  });

  test("[foundations.motion.compositions] presence enters with the enter role and leaves with the exit role, and does nothing without data-presence", async ({ page }) => {
    await openHarness(page, "motion");
    expect((await animationOf(page.getByTestId("surface-idle"))).name).toBe("none");

    const entering = await animationOf(page.getByTestId("surface-entering"));
    expect(entering).toMatchObject({ easing: timing("enter").easing, fill: "none", iterations: "1" });
    expect(entering.duration).toBeCloseTo(timing("enter").duration, 3);
    const exiting = await animationOf(page.getByTestId("surface-exiting"));
    expect(exiting).toMatchObject({ easing: timing("exit").easing, fill: "forwards", iterations: "1" });
    expect(exiting.duration).toBeCloseTo(timing("exit").duration, 3);
    expect(entering.name).not.toBe(exiting.name);

    // The surface rises from the enter offset and scale, and sinks back to them; a scrim only fades.
    const hidden = { opacity: "0", transform: "matrix(0.99, 0, 0, 0.99, 0, 4)" };
    expect(await frameOf(page.getByTestId("surface-entering"), "start")).toEqual(hidden);
    expect(await frameOf(page.getByTestId("surface-exiting"), "end")).toEqual(hidden);
    for (const [id, at] of [["scrim-entering", "start"], ["scrim-exiting", "end"]] as const) {
      expect(await frameOf(page.getByTestId(id), at), id).toEqual({ opacity: "0", transform: "none" });
    }
    const scrim = await animationOf(page.getByTestId("scrim-exiting"));
    expect(scrim).toMatchObject({ easing: timing("exit").easing, fill: "forwards" });
  });

  test("[foundations.motion.compositions] loops run at their own period and curve, and Spinner and the loading Button compose the spin", async ({ page }) => {
    await openHarness(page, "motion");
    const spin = await animationOf(page.getByTestId("loop-spin"));
    const pulse = await animationOf(page.getByTestId("loop-pulse"));
    expect(spin).toMatchObject({ duration: 900, easing: "linear", iterations: "infinite" });
    expect(pulse).toMatchObject({ duration: 1400, easing: timing("state").easing, iterations: "infinite" });
    expect(spin.name).not.toBe(pulse.name);
    expect(await animationOf(page.getByRole("status", { name: "Spinner" }))).toEqual(spin);
    expect(await animationOf(page.getByRole("button", { name: "Saving" }).locator("span[aria-hidden]"))).toEqual(spin);
  });

  test("[primitives.floating.presence] a popover rises in with the enter role, and a modal's scrim only fades in", async ({ page }) => {
    await playbackRate(page, 0.1);
    const popover = await openFloating(page);
    await expect(popover).toHaveAttribute("data-presence", "entering");
    const entering = await animationOf(popover);
    expect(entering).toMatchObject({ easing: timing("enter").easing, fill: "none", iterations: "1" });
    expect(entering.duration).toBeCloseTo(timing("enter").duration, 3);
    expect(entering.name).not.toBe("none");
    await playbackRate(page, 1);
    await expect(popover).not.toHaveAttribute("data-presence", /.*/);
    await page.keyboard.press("Escape");
    await expect(popover).toHaveCount(0);

    await playbackRate(page, 0.1);
    await page.getByRole("combobox", { name: "presentation", exact: true }).selectOption("modal");
    await page.getByRole("button", { name: "설정 열기", exact: true }).click();
    const dialog = page.locator("[data-presentation=modal]");
    const scrim = dialog.locator("xpath=..");
    await expect(scrim).toHaveAttribute("data-presence", "entering");
    await expect(dialog).toHaveAttribute("data-presence", "entering");
    const fade = await animationOf(scrim);
    expect(fade).toMatchObject({ easing: timing("enter").easing, fill: "none", iterations: "1" });
    expect(fade.duration).toBeCloseTo(timing("enter").duration, 3);
    expect(fade.name).not.toBe(entering.name);
  });

  test("[primitives.floating.presence] closing hides the panel from assistive technology at once, keeps it for the exit role, then removes it and gives focus back", async ({ page }) => {
    const panel = await openFloating(page);
    const trigger = page.getByRole("button", { name: "설정 열기", exact: true });
    await expect(panel).toBeVisible();
    await expect(panel).not.toHaveAttribute("data-presence", /.*/);
    await playbackRate(page, 0.1);
    await page.keyboard.press("Escape");
    await expect(panel).toHaveAttribute("data-presence", "exiting");
    await expect(panel).toHaveAttribute("aria-hidden", "true");
    await expect(panel).toHaveAttribute("inert", /.*/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const leaving = await animationOf(panel);
    expect(leaving).toMatchObject({ easing: timing("exit").easing, fill: "forwards", iterations: "1" });
    expect(leaving.duration).toBeCloseTo(timing("exit").duration, 3);
    await playbackRate(page, 1);
    await expect(panel).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("[primitives.floating.presence] a panel reopened while it is leaving is a new one: it enters again and takes focus", async ({ page }) => {
    const panel = await openFloating(page);
    await expect(panel).not.toHaveAttribute("data-presence", /.*/);
    await playbackRate(page, 0.1);
    await page.keyboard.press("Escape");
    await expect(panel).toHaveAttribute("data-presence", "exiting");
    await page.getByRole("button", { name: "설정 열기", exact: true }).click({ force: true });
    await expect(panel).toHaveAttribute("data-presence", "entering");
    await expect(panel).not.toHaveAttribute("aria-hidden", /.*/);
    await playbackRate(page, 1);
    await expect(page.getByRole("heading", { name: "설정", exact: true })).toBeFocused();
  });

  test("[foundations.motion.roles] draws one row per role on the Motion page, in the vocabulary's order", async ({ page }) => {
    await openPlayground(page, "foundations/motion", "Motion");
    const rows = await page.locator("code").filter({ hasText: /^motion\.role\./ }).allTextContents();
    expect(rows).toEqual(MOTION_ROLES.map((role) => `motion.role.${role}`));
    await expect(page.getByRole("heading", { name: "Motion composition", exact: true })).toBeVisible();
    await expect(page.getByText("4px · 0.99", { exact: true })).toBeVisible();
  });

  test("[foundations.motion.roles] times the press, hover and state specimens as their roles", async ({ page }) => {
    await openPlayground(page, "foundations/motion", "Motion");
    const press = await transitionsOf(page.getByRole("button", { name: "눌러 보기", exact: true }));
    const hover = await transitionsOf(page.getByRole("button", { name: "포인터를 올려 보세요", exact: true }));
    const state = await transitionsOf(page.getByRole("switch", { name: "상태 전이 예시" }));
    expect(press.transform!.duration).toBeCloseTo(timing("press").duration, 3);
    expect(hover["border-color"]!.duration).toBeCloseTo(timing("hover").duration, 3);
    expect(state.background!.duration).toBeCloseTo(timing("state").duration, 3);
    expect(state.background!.easing).toBe(timing("state").easing);
  });

  test("[foundations.motion.compositions] shows the enter specimen rising 4px and the exit specimen playing its enter on load, then leaving and staying hidden", async ({ page }) => {
    await openPlayground(page, "foundations/motion", "Motion");
    // A presence specimen is a button and the surface it opens and closes, in the row's specimen cell.
    const specimen = (role: MotionRole) => page.getByText(`motion.role.${role}`, { exact: true }).locator("xpath=../following-sibling::div[1]");
    const surface = (role: MotionRole) => specimen(role).locator("xpath=./div/*[2]");

    // The exit specimen starts open and has played its enter already.
    await expect(surface("exit")).toHaveAttribute("data-presence", "entering");
    expect((await animationOf(surface("exit"))).name).not.toBe("none");
    await specimen("exit").getByRole("button", { name: "닫기", exact: true }).click();
    await expect(surface("exit")).toHaveAttribute("data-presence", "exiting");
    await expect(surface("exit")).toHaveCSS("opacity", "0");

    await expect(surface("enter")).toBeHidden();
    await specimen("enter").getByRole("button", { name: "열기", exact: true }).click();
    await expect(surface("enter")).toHaveAttribute("data-presence", "entering");
    expect(await frameOf(surface("enter"), "start")).toEqual({ opacity: "0", transform: "matrix(0.99, 0, 0, 0.99, 0, 4)" });
  });
});

test.describe("with reduced motion", () => {
  test.skip(({ contextOptions }) => !isReduced({ contextOptions }), "the policy only applies where the user asks for less motion");

  test("[foundations.motion.reduced] ends every transition at once, the Switch thumb's included", async ({ page }) => {
    await openHarness(page, "motion");
    for (const row of ATOM_TRANSITIONS) {
      const actual = await transitionsOf(row.target(page), row.pseudo);
      for (const property of Object.keys(row.properties)) expect(actual[property]!.duration, `${labelOf(row)} ${property}`).toBeCloseTo(0.01, 3);
    }
  });

  test("[foundations.motion.reduced] ends a finite animation at once, so presence jumps", async ({ page }) => {
    await openHarness(page, "motion");
    for (const id of ["surface-entering", "surface-exiting", "scrim-entering", "scrim-exiting"]) {
      const animation = await animationOf(page.getByTestId(id));
      expect(animation.duration, id).toBeCloseTo(0.01, 3);
      expect(animation.iterations, id).toBe("1");
    }
    expect((await frameOf(page.getByTestId("surface-exiting"), "end")).opacity).toBe("0");
  });

  test("[primitives.floating.presence] takes a Floating off the page at the first tick of its exit, not after the exit role's time", async ({ page }) => {
    const panel = await openFloating(page);
    await expect(panel).toBeVisible();
    const frames = await panel.evaluate(async (element) => {
      element.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      let count = 0;
      while (element.isConnected && count < 30) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        count += 1;
      }
      return count;
    });
    // The exit animation is cut to one instant, which the browser ends on its next animation frames: two or three, by where the
    // press falls in the frame and when the browser starts the animation. The exit role's own time would be six or more.
    expect(frames).toBeLessThanOrEqual(3);
    await expect(page.getByRole("button", { name: "설정 열기", exact: true })).toBeFocused();
  });

  test("[foundations.motion.reduced] turns the Spinner, the loading Button's spinner and the spin loop into the pulse", async ({ page }) => {
    await openHarness(page, "motion");
    const pulse = await animationOf(page.getByTestId("loop-pulse"));
    expect(pulse).toMatchObject({ duration: 1400, iterations: "infinite" });
    for (const target of [page.getByTestId("loop-spin"), page.getByRole("status", { name: "Spinner" }), page.getByRole("button", { name: "Saving" }).locator("span[aria-hidden]")]) {
      expect(await animationOf(target)).toEqual(pulse);
    }
  });

  test("[foundations.motion.reduced] pulses the loop specimens on the Motion page", async ({ page }) => {
    await openPlayground(page, "foundations/motion", "Motion");
    const pulse = await animationOf(page.getByText("motion.loop.pulse", { exact: true }).locator("xpath=../following-sibling::div[1]/span"));
    expect(pulse).toMatchObject({ duration: 1400, iterations: "infinite" });
    expect(await animationOf(page.getByRole("status", { name: "회전 반복 예시" }))).toEqual(pulse);
  });
});
