import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

import { STRUCTURAL, STYLE_CATEGORIES, categoryOf, isKeyframeSelector, isStructural } from "./structural.js";

const eslint = new ESLint();
const reports = async (code, filePath) =>
  (await eslint.lintText(code, { filePath }))[0].messages.filter((message) => message.severity === 2 && message.ruleId === "paper/source-numbers");
const flagged = async (code, filePath) => (await reports(code, filePath)).length > 0;

const PACKAGE_CSS = "packages/paper-ui/src/atoms/Probe.css.ts";
const APP_CSS = "app/src/pages/Probe.css.ts";
const APP_TSX = "app/src/pages/Probe.tsx";
const css = (rule) => `import { style } from "@vanilla-extract/css";\nexport const probe = style(${rule});`;

test("[guardrails.source-numbers.structural-only] a number, a unit or an easing in a style position is a source value unless it is structural, in the package and in the app", async () => {
  for (const rule of [
    "{ opacity: 0.5 }",
    "{ fontWeight: 600 }",
    "{ lineHeight: 1.04 }",
    "{ letterSpacing: '-0.035em' }",
    "{ transition: 'opacity 150ms ease' }",
    "{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }",
    "{ animation: 'spin 1s linear infinite' }",
    "{ paddingBlock: 'clamp(2rem, 8vh, 4rem)' }",
    "{ gap: 26 }",
    "{ padding: '0 28px' }",
    "{ borderRadius: 6 }",
    "{ border: '2px solid var(--x)' }",
    "{ outlineOffset: '3px' }",
    "{ top: 20 }",
    "{ transform: 'translateY(1px)' }",
    "{ transform: 'scale(1.02)' }",
    "{ transform: 'rotate(30deg)' }",
    "{ margin: `calc(${'var(--x)'} * 3)` }",
    "{ fontSize: '14px' }",
    "{ wordSpacing: '0.2em' }",
    "{ textUnderlineOffset: '0.2em' }",
    "{ opacity: dense ? 0.4 : 1 }",
    "{ gap: dense && '4px' }",
    "{ selectors: { '&:hover': { opacity: 0.8 } } }",
    "{ '@media': { '(min-width: 40em)': { padding: '9px' } } }",
    "[{ gap: 4 }, { color: 'var(--x)' }]",
    "{ padding: pad(8) }",
  ]) {
    assert.equal(await flagged(css(rule), PACKAGE_CSS), true, `package ${rule}`);
    assert.equal(await flagged(css(rule), APP_CSS), true, `app ${rule}`);
  }
});

test("[guardrails.source-numbers.structural-only] the package takes dimension from roles too, and the app owns its screen's dimensions", async () => {
  for (const rule of ["{ width: 16 }", "{ width: '1.25rem' }", "{ minHeight: '3em' }", "{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }", "{ aspectRatio: '16 / 9' }", "{ flexBasis: '10rem' }"]) {
    assert.equal(await flagged(css(rule), PACKAGE_CSS), true, `package ${rule}`);
  }
  for (const rule of ["{ width: 218, height: 58 }", "{ maxWidth: 1540 }", "{ gridTemplateColumns: '218px minmax(0,1fr) 260px' }", "{ minWidth: '44rem' }", "{ flexBasis: '10rem' }"]) {
    assert.equal(await flagged(css(rule), APP_CSS), false, `app ${rule}`);
  }
});

test("[guardrails.source-numbers.structural-only] every structural value, a role and a name stay open", async () => {
  for (const rule of [
    "{ margin: 0, padding: '0px', gap: '0rem', top: 0 }",
    "{ width: '100%', height: '100%', minWidth: 0, maxWidth: '100%' }",
    "{ transform: 'translate(-50%, -50%)', insetInlineStart: '50%' }",
    "{ transform: 'rotate(45deg)' }",
    "{ transform: 'rotate(-90deg) rotate(180deg)' }",
    "{ gridTemplateColumns: 'minmax(0, 1fr)' }",
    "{ gridTemplateColumns: '1fr auto' }",
    "{ opacity: 0 }",
    "{ opacity: 1 }",
    "{ flex: 1, flexGrow: 1, flexShrink: 0, scale: 1 }",
    "{ aspectRatio: 1 }",
    "{ aspectRatio: '1' }",
    "{ marginLeft: 'calc(var(--x) / 2)', marginTop: 'calc(var(--x) * -1)' }",
    "{ animationIterationCount: '1 !important' }",
    "{ padding: tokens.shape.inset.lg, gap: tokens.layout.gap.md, borderRadius: tokens.shape.radius.control, fontSize: tokens.typography.role.body.size }",
    "{ fontWeight: emphasisRule('semibold').fontWeight, transition: transition('hover', 'color') }",
    "{ zIndex: 0 }",
    "{ width: 'var(--pui-shape-dimension-width-3xl)' }",
    "{ display: 'grid', order: 2, gridColumnStart: 2, content: '\"2px\"' }",
    "{ selectors: { '&:nth-child(2)': { padding: 0 } } }",
    "{ ...typographyRule('caption'), ...elevationStyle('overlay') }",
    "{ boxShadow: strokeRing(tokens.color.ink.tertiary) }",
  ]) assert.equal(await flagged(css(rule), PACKAGE_CSS), false, rule);
});

test("[guardrails.source-numbers.structural-only] the check follows a same-file const, a template, a mapper and JSX style", async () => {
  assert.equal(await flagged("import { style } from '@vanilla-extract/css';\nconst S = 16;\nexport const probe = style({ width: S });", PACKAGE_CSS), true);
  assert.equal(await flagged("import { style } from '@vanilla-extract/css';\nexport const probe = style({ width: `${16}px` });", PACKAGE_CSS), true);
  assert.equal(await flagged("import { style } from '@vanilla-extract/css';\nconst SIZES = { sm: 12, md: 16 };\nexport const probe = style({ width: SIZES.md });", PACKAGE_CSS), true);
  assert.equal(await flagged("import { styleVariants } from '@vanilla-extract/css';\nexport const probe = styleVariants({ a: 1 }, (value) => ({ gap: '4px' }));", PACKAGE_CSS), true);
  assert.equal(await flagged("import { layered } from '../tokens/layers.css';\nconst { style } = layered('components');\nexport const probe = style({ gap: '4px' });", PACKAGE_CSS), true);
  assert.equal(await flagged("import { layered } from '../tokens/layers.css';\nexport const probe = layered('components').style({ gap: '4px' });", PACKAGE_CSS), true);
  assert.equal(await flagged("export const X = ({ dense }) => <div style={{ padding: dense ? '4px' : '8px' }} />;", APP_TSX), true);
  assert.equal(await flagged("export const props = { style: { marginTop: 8 } };", APP_TSX), true);
  assert.equal(await flagged("export const X = () => <Box style={{ width: 218, gridTemplateColumns: '1fr 2fr' }} />;", APP_TSX), false);
  // Outside a style position a number is a number.
  assert.equal(await flagged("export const X = () => <Box padding='md' data-count={8}>{16}</Box>; export const n = { padding: 8 };", APP_TSX), false);
  assert.equal(await flagged("export const n = { padding: 8 };", "packages/paper-ui/src/internal/probe.ts"), false);
});

test("[guardrails.source-numbers.structural-only] the token layer and tests are not read", async () => {
  assert.equal(await flagged("export const SOURCE = { space: { sm: 8 } };", "packages/paper-ui/src/tokens/shape.ts"), false);
  assert.equal(await flagged(css("{ padding: '9px' }"), "packages/paper-ui/src/tokens/probe.css.ts"), false);
  assert.equal(await flagged(css("{ padding: '9px' }"), "packages/paper-ui/src/atoms/Probe.test.ts"), false);
  assert.equal(await flagged(css("{ padding: '9px' }"), "fixtures/harness/src/probe.css.ts"), false);
});

test("[guardrails.source-numbers.media-keys] a media or container query takes its length from tokens.layout.breakpoint", async () => {
  for (const rule of [
    "{ '@media': { 'screen and (max-width: 760px)': { gap: 0 } } }",
    "{ '@media': { '(min-width: 40em)': { gap: 0 } } }",
    "{ '@container': { '(min-width: 30rem)': { gap: 0 } } }",
    "{ '@media': { [`(max-width: 760px)`]: { gap: 0 } } }",
    "{ '@media': { [NARROW]: { gap: 0 } } }",
  ]) {
    const code = rule.includes("NARROW") ? `import { style } from "@vanilla-extract/css";\nconst NARROW = "(max-width: 760px)";\nexport const probe = style(${rule});` : css(rule);
    assert.equal(await flagged(code, PACKAGE_CSS), true, `package ${rule}`);
    assert.equal(await flagged(code, APP_CSS), true, `app ${rule}`);
  }
  for (const rule of [
    "{ '@media': { [`screen and (max-width: ${tokens.layout.breakpoint.md})`]: { gap: 0 } } }",
    "{ '@media': { [narrow]: { gap: 0 } } }",
    "{ '@media': { [DEMO_MEDIA.rail]: { gap: 0 } } }",
    "{ '@media': { '(prefers-reduced-motion: reduce)': { gap: 0 }, '(prefers-contrast: more)': { gap: 0 }, '(hover: hover)': { gap: 0 }, '(min-width: 0)': { gap: 0 } } }",
    "{ '@media': { '(min-resolution: 2dppx)': { gap: 0 } } }",
  ]) {
    assert.equal(await flagged(css(rule), PACKAGE_CSS), false, `package ${rule}`);
    assert.equal(await flagged(css(rule), APP_CSS), false, `app ${rule}`);
  }
  // A keyframes block opens and closes at structural selectors.
  assert.equal(await flagged("import { keyframes } from '@vanilla-extract/css';\nexport const probe = keyframes({ '0%': { opacity: 0 }, '25%': { opacity: 1 }, '100%': { opacity: 0 } });", PACKAGE_CSS), true);
  assert.equal(await flagged("import { keyframes } from '@vanilla-extract/css';\nexport const probe = keyframes({ from: { opacity: 0 }, '50%': { opacity: 1 }, to: { opacity: 0 } });", PACKAGE_CSS), false);
});

test("[guardrails.source-numbers.depth-owners] depth is stated by the elevation owners and drawn as strokeRing()", async () => {
  for (const rule of ["{ zIndex: 5 }", "{ zIndex: 'var(--x)' }", "{ boxShadow: '0 0 0 1px var(--x)' }", "{ boxShadow: shadows.low }", "{ filter: 'blur(4px)' }", "{ boxShadow: tokens.layout.shadow }", "{ boxShadow: ring(tokens.color.ink.primary) }"]) {
    assert.equal(await flagged(css(rule), PACKAGE_CSS), true, `package ${rule}`);
    assert.equal(await flagged(css(rule), APP_CSS), true, `app ${rule}`);
  }
  assert.equal(await flagged("export const X = () => <div style={{ zIndex: 1 }} />;", APP_TSX), true);
  for (const rule of ["{ boxShadow: 'none' }", "{ zIndex: 0 }", "{ boxShadow: strokeRing(tokens.color.border.base) }", "{ ...elevationStyle('overlay') }", "{ ...elevationStack('modal', 'var(--rank)'), ...elevationCast('modal') }"]) {
    assert.equal(await flagged(css(rule), PACKAGE_CSS), false, rule);
  }
  const owners = ["packages/paper-ui/src/primitives/paint/Surface.css.ts", "packages/paper-ui/src/primitives/float/Floating.css.ts"];
  for (const owner of owners) {
    assert.equal(await flagged(css("{ zIndex: ELEVATION.z.overlay, boxShadow: ELEVATION.shadow.overlay }"), owner), false, owner);
    assert.equal(await flagged(css("{ zIndex: 5 }"), owner), true, `${owner} still writes no number`);
  }
});

test("[guardrails.source-numbers.app-roles] the app reads no typography palette", async () => {
  for (const code of [
    "import { tokens } from '@studio-baeks/paper-ui/tokens';\nexport const bold = tokens.typography.palette.weight.bold;",
    "import { tokens } from '@studio-baeks/paper-ui/tokens';\nexport const X = () => <b style={{ fontWeight: tokens.typography.palette.weight.bold }} />;",
    "import { tokens } from '@studio-baeks/paper-ui/tokens';\nconst { palette } = tokens.typography;\nexport const p = palette.weight.bold;",
    "import { tokens } from '@studio-baeks/paper-ui/tokens';\nconst { typography: { palette } } = tokens;\nexport const p = palette.weight.bold;",
  ]) assert.equal(await flagged(code, APP_TSX), true, code);
  const read = "import { tokens } from '@studio-baeks/paper-ui/tokens';\nexport const p = tokens.typography.palette.fontSize;";
  assert.equal(await flagged(read, "app/src/playground/foundations/TypographyPage.tsx"), false);
  assert.equal(await flagged(read, "app/src/playground/foundations/typography-roles.ts"), false);
  assert.equal(await flagged(read, "app/src/playground/foundations/ShapePage.tsx"), true);
  assert.equal(await flagged("import { tokens } from '@studio-baeks/paper-ui/tokens';\nexport const p = tokens.typography.role.body.size;", APP_TSX), false);
});

test("[guardrails.source-numbers.app-roles] the module the manifest declares for a page's dimensions is left alone", async () => {
  const frame = "export const DEMO_LAYOUT = { frame: 1540 };\nexport const probe = { style: { padding: 24, opacity: 0.4 } };";
  assert.equal(await flagged(frame, "app/src/pages/demo/layout.ts"), false);
  assert.equal(await flagged(frame, "app/src/pages/demo/other.ts"), true);
});

test("structural.js names what is structural once", () => {
  assert.deepEqual(STRUCTURAL.percentages, [100, 50, -50]);
  assert.equal(categoryOf("paddingInlineStart"), "spacing");
  assert.equal(categoryOf("border-top-left-radius"), "form");
  assert.equal(categoryOf("borderTopColor"), undefined);
  assert.equal(categoryOf("zIndex"), "depth");
  assert.equal(categoryOf("transitionDuration"), "motion");
  assert.equal(categoryOf("gridTemplateColumns"), "dimension");
  assert.equal(categoryOf("display"), undefined);
  for (const [category, entries] of Object.entries(STYLE_CATEGORIES)) assert.ok(entries.length > 0, category);
  assert.equal(isStructural({ property: "opacity", value: 1 }), true);
  assert.equal(isStructural({ property: "zIndex", value: 1 }), false);
  assert.equal(isStructural({ property: "width", value: 50, unit: "%" }), true);
  assert.equal(isStructural({ property: "width", value: 33, unit: "%" }), false);
  assert.equal(isStructural({ property: "transform", value: 135, unit: "deg" }), true);
  assert.equal(isStructural({ property: "transform", value: 30, unit: "deg" }), false);
  assert.equal(isStructural({ property: "margin", value: 2, operator: "/" }), true);
  assert.equal(isStructural({ property: "margin", value: 3, operator: "/" }), false);
  assert.equal(isKeyframeSelector("50%"), true);
  assert.equal(isKeyframeSelector("25%"), false);
});
