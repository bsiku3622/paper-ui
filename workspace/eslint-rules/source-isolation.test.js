import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

const eslint = new ESLint();
const reports = async (code, filePath, ruleId = "paper/source-isolation") =>
  (await eslint.lintText(code, { filePath }))[0].messages.filter((message) => message.severity === 2 && message.ruleId === ruleId);
const flagged = async (code, filePath) => (await reports(code, filePath)).length > 0;

const PKG = "packages/paper-ui/src";
const MODULES = ["palette", "color-ladder", "colors", "color-modes", "color-recipes", "typography", "typography-recipes", "shape", "shape-recipes", "layout", "motion", "state", "state-recipes", "elevation-recipes", "helpers", "variables", "overrides", "vocabulary", "public"];
// Where a consumer stands, and how it spells the way to src/tokens from there.
const CONSUMERS = [
  ["atoms/Probe.tsx", "../tokens"],
  ["primitives/Probe.tsx", "../tokens"],
  ["primitives/float/Probe.tsx", "../../tokens"],
  ["theme/Probe.ts", "../tokens"],
  ["resolvers/Probe.ts", "../tokens"],
  ["styles/probe.css.ts", "../tokens"],
  ["internal/Probe.ts", "../tokens"],
  ["internal/aria/probe.ts", "../../tokens"],
  ["index.ts", "./tokens"],
];

test("[guardrails.source-isolation.package-barrel-only] a package file outside the token layer reads no source module, from any consumer location", async () => {
  for (const [consumer, to] of CONSUMERS) {
    for (const name of MODULES) {
      const code = `import { value } from "${to}/${name}"; export { value };`;
      assert.equal(await flagged(code, `${PKG}/${consumer}`), true, `${consumer} → ${name}`);
    }
  }
  for (const code of [
    'export * from "../tokens/typography";',
    'export { SHAPE_SOURCE } from "../tokens/shape";',
    'export const load = () => import("../tokens/layout");',
    'import { value } from "../tokens/variables.css"; export { value };',
    'import type { Loop } from "../tokens/motion"; export type { Loop };',
  ]) assert.equal(await flagged(code, `${PKG}/atoms/Probe.tsx`), true, code);
});

test("[guardrails.source-isolation.package-barrel-only] the barrel, a binding-free stylesheet and the layer module stay open", async () => {
  for (const code of [
    'import { tokens } from "../tokens"; export { tokens };',
    'import { tokens } from "../tokens/index"; export { tokens };',
    'import { tokens } from "../tokens/index.ts"; export { tokens };',
    'import type { Accent } from "../tokens"; export type { Accent };',
    'import "../tokens/variables.css";',
    'import "../tokens/layers.css";',
    'import { layered } from "../tokens/layers.css"; export const { style } = layered("components");',
    'import { layered } from "../tokens/layers.css.ts"; export const { style } = layered("components");',
    'import { useState } from "react"; export { useState };',
  ]) assert.deepEqual(await reports(code, `${PKG}/atoms/Probe.css.ts`), [], code);
  // The token layer reads itself, and a test is verification code.
  assert.deepEqual(await reports('import { SHAPE_SOURCE } from "./shape"; export { SHAPE_SOURCE };', `${PKG}/tokens/shape-recipes.ts`), []);
  assert.deepEqual(await reports('import { SHAPE_SOURCE } from "../tokens/shape"; export { SHAPE_SOURCE };', `${PKG}/styles/probe.test.ts`), []);
  assert.deepEqual(await reports('import { SHAPE_SOURCE } from "./tokens/public"; export { SHAPE_SOURCE };', `${PKG}/probe.test.ts`), []);
});

test("[guardrails.source-isolation.package-barrel-only] src/tokens/inspect is never imported by package code", async () => {
  for (const code of [
    'import { SHAPE_SOURCE } from "../tokens/inspect/shape"; export { SHAPE_SOURCE };',
    'import { SHAPE_SOURCE } from "@paper-ui/inspect/shape"; export { SHAPE_SOURCE };',
  ]) assert.equal(await flagged(code, `${PKG}/atoms/Probe.tsx`), true, code);
});

test("[guardrails.source-isolation.app-exports-only] an app or fixture file reaches the package through its exports and nothing under packages/*/src", async () => {
  for (const [code, path] of [
    ['import { COLOR_VALUES } from "../../../../packages/paper-ui/src/tokens/colors"; export { COLOR_VALUES };', "app/src/playground/foundations/Probe.tsx"],
    ['import { Box } from "../../packages/paper-ui/src/index"; export { Box };', "app/src/Probe.tsx"],
    ['import { Box } from "../../../../packages/paper-ui/src/primitives/Box"; export { Box };', "fixtures/harness/src/cases/probe.tsx"],
    ['import { tokens } from "@studio-baeks/paper-ui/src/tokens"; export { tokens };', "app/src/Probe.tsx"],
    ['import { Box } from "@studio-baeks/paper-ui/dist/index.js"; export { Box };', "app/src/Probe.tsx"],
    ['export * from "../../packages/paper-ui/src/theme/boot";', "app/vite/other.ts"],
  ]) assert.equal(await flagged(code, path), true, `${path}: ${code}`);
  for (const subpath of ["", "/tokens", "/theme-boot", "/styles.css"]) {
    assert.deepEqual(await reports(`import * as paper from "@studio-baeks/paper-ui${subpath}"; export { paper };`, "app/src/Probe.tsx"), [], subpath);
  }
});

test("[guardrails.source-isolation.app-exports-only] the manifest's tooling file and the tests are the exceptions", async () => {
  const boot = 'import { themeBootScript } from "../../packages/paper-ui/src/theme/boot"; export { themeBootScript };';
  assert.deepEqual(await reports(boot, "app/vite/theme-boot.ts"), []);
  assert.equal(await flagged(boot, "app/vite/other.ts"), true);
  assert.equal(await flagged('import { x } from "../../packages/paper-ui/src/tokens/shape"; export { x };', "app/vite/theme-boot.ts"), true);
  for (const path of ["tests/foundations/probe.spec.ts", "app/src/playground/foundations/probe.test.ts", "fixtures/harness/src/probe.test.tsx"]) {
    assert.deepEqual(await reports('import { SHAPE_SOURCE } from "../../packages/paper-ui/src/tokens/shape"; export { SHAPE_SOURCE };', path), [], path);
  }
});

test("[guardrails.source-isolation.inspector-alias] @paper-ui/inspect/<system> is imported only by that system's inspector", async () => {
  const color = 'import { PALETTE_TOKENS } from "@paper-ui/inspect/color"; export { PALETTE_TOKENS };';
  const shape = 'import { SHAPE_SOURCE } from "@paper-ui/inspect/shape"; export { SHAPE_SOURCE };';
  const FOUNDATIONS = "app/src/playground/foundations";
  assert.deepEqual(await reports(color, `${FOUNDATIONS}/ColorPage.tsx`), []);
  assert.deepEqual(await reports(color, `${FOUNDATIONS}/color-roles.ts`), []);
  assert.deepEqual(await reports(color, "app/src/docs/generated/color.ts"), []);
  assert.equal(await flagged(shape, `${FOUNDATIONS}/ColorPage.tsx`), true);
  assert.equal(await flagged(color, `${FOUNDATIONS}/kit.tsx`), true);
  assert.equal(await flagged(color, `${FOUNDATIONS}/Probe.tsx`), true);
  assert.equal(await flagged(color, "app/src/pages/Home.tsx"), true);
  assert.equal(await flagged('import { x } from "@paper-ui/inspect/nothing"; export { x };', `${FOUNDATIONS}/ColorPage.tsx`), true);
  assert.deepEqual(await reports(shape, `${FOUNDATIONS}/inspector.test.ts`), []);
});

const PAGE = "app/src/playground/foundations/ColorPage.tsx";
const flow = async (body) => reports(
  `import { Box, Surface, Text } from "@studio-baeks/paper-ui";\nimport { Swatch, Meter } from "./kit";\nimport { PALETTE_TOKENS, COLOR_VALUES } from "@paper-ui/inspect/color";\nimport { rolesOf } from "./color-roles";\n${body}`,
  PAGE,
);

test("[guardrails.source-isolation.inspector-flow] a value derived from the source reaches text and the kit's display parts, and no style, className or package prop", async () => {
  for (const body of [
    'export const X = () => <Box style={{ background: PALETTE_TOKENS.neutral["50"] }} />;',
    'export const X = () => <div style={{ background: COLOR_VALUES.bg.canvas }} />;',
    'export const X = () => <div className={PALETTE_TOKENS.neutral["50"]} />;',
    'const swatch = PALETTE_TOKENS.neutral["50"]; export const X = () => <Box style={{ background: swatch }} />;',
    'const { neutral } = PALETTE_TOKENS; export const X = () => <Box style={{ background: neutral["50"] }} />;',
    'const hex = (token: string) => `${token}`; export const X = () => <Box style={{ background: hex(PALETTE_TOKENS.neutral["50"]) }} />;',
    'export const X = () => <>{Object.values(PALETTE_TOKENS.neutral).map((color) => <Box key={color} style={{ background: color }} />)}</>;',
    'export const X = () => <>{Object.entries(PALETTE_TOKENS.neutral).map(([name, color]) => <Box key={name} style={{ background: color }} />)}</>;',
    'const Cell = ({ color }: { color: string }) => <Box style={{ background: color }} />; export const X = () => <Cell color={PALETTE_TOKENS.neutral["50"]} />;',
    'const Cell = (props: { color: string }) => <Box style={{ background: props.color }} />; export const X = () => <Cell color={PALETTE_TOKENS.neutral["50"]} />;',
    'const Cell = ({ color }: { color: string }) => <Box className={color} />; const row = PALETTE_TOKENS.neutral; export const X = () => <Cell {...row} />;',
    'export const X = () => <Surface fill={PALETTE_TOKENS.neutral["50"]} />;',
    'export const X = () => <Box {...PALETTE_TOKENS} />;',
    'export const X = () => <Text variant={rolesOf(["bg"])[0]} />;',
    'export const X = () => <Box padding={`${COLOR_VALUES.bg.canvas}`} />;',
    'export const rows = [{ style: { background: PALETTE_TOKENS.neutral["50"] } }];',
  ]) assert.equal((await flow(body)).length > 0, true, body);
});

test("[guardrails.source-isolation.inspector-flow] text, the kit's parts, title and aria-*, a map keyed by the source and a vocabulary key stay open", async () => {
  for (const body of [
    'export const X = () => <Text>{PALETTE_TOKENS.neutral["50"]}</Text>;',
    'export const X = () => <Swatch color={PALETTE_TOKENS.neutral["50"]} label="neutral 50" />;',
    'export const X = () => <Meter value={COLOR_VALUES.bg.canvas.length} max={9} />;',
    'export const X = () => <Box title={PALETTE_TOKENS.neutral["50"]} aria-label={`neutral ${PALETTE_TOKENS.neutral["50"]}`} />;',
    'export const X = () => <div title={COLOR_VALUES.bg.canvas} data-color={COLOR_VALUES.bg.canvas}>{COLOR_VALUES.bg.canvas}</div>;',
    'const CLASSES: Record<string, string> = { a: "one" }; export const X = () => <div className={CLASSES[COLOR_VALUES.bg.canvas]} />;',
    'import * as s from "./foundations.css"; export const X = () => <>{Object.keys(PALETTE_TOKENS.neutral).map((name) => <div key={name} className={s.swatch[name]} />)}</>;',
    'const Cell = ({ color }: { color: string }) => <Box>{color}</Box>; export const X = () => <Cell color={PALETTE_TOKENS.neutral["50"]} />;',
    'export const X = () => <>{["50", "100"].map((step) => <Box key={step} style={{ order: step.length }} />)}</>;',
    'const label = "palette"; export const X = () => <Box style={{ background: "red" }} aria-label={label} />;',
  ]) assert.deepEqual(await flow(body), [], body);
});

test("[guardrails.source-isolation.inspector-flow] the flow is read in an inspector's files only", async () => {
  const code = 'import { Box } from "@studio-baeks/paper-ui";\nimport { COLOR_VALUES } from "@paper-ui/inspect/color";\nexport const X = () => <Box style={{ background: COLOR_VALUES.bg.canvas }} />;';
  assert.equal(await flagged(code, PAGE), true);
  // Elsewhere the import itself is what the rule reports; the flow is not read.
  const elsewhere = await reports(code, "app/src/pages/Home.tsx");
  assert.equal(elsewhere.length, 1);
  assert.match(elsewhere[0].message, /inspector에서만/);
});

test("[guardrails.source-isolation.variable-literal] a --pui- variable is never written as a string outside the token layer", async () => {
  for (const [code, path] of [
    ['export const style = { color: "var(--pui-color-ink-primary)" };', "app/src/Probe.tsx"],
    ['export const vars = { "--pui-shape-control-height-md": "40px" };', "app/src/Probe.tsx"],
    ['export const set = (element: HTMLElement) => element.style.setProperty("--pui-shape-space-lg", "24px");', "app/src/Probe.tsx"],
    ['export const name = `--pui-${path}`;', "app/src/Probe.tsx"],
    ['export const vars = { "--pui-shape-control-height-md": "40px" };', "fixtures/harness/src/cases/probe.tsx"],
    ['export const read = "var(--pui-color-ink-primary)";', `${PKG}/atoms/Probe.tsx`],
    ['export const read = "var(--paper-color-ink-primary)";', `${PKG}/primitives/Probe.css.ts`],
  ]) {
    const found = await reports(code, path);
    assert.equal(found.length > 0, true, `${path}: ${code}`);
    assert.equal(found.some((message) => message.message === "tokens로 읽고 sourceVars()로 덮어씁니다."), true, `${path}: ${code}`);
  }
  for (const [code, path] of [
    ['export const name = "--pui-shape-space-lg";', `${PKG}/tokens/helpers.ts`],
    ['export const name = "--pui-shape-space-lg";', "tests/foundations/probe.spec.ts"],
    ['export const name = "--pui-shape-space-lg";', `${PKG}/tokens/probe.test.ts`],
    ['export const name = "--pui-shape-space-lg";', "app/src/probe.test.tsx"],
    ['export const attribute = "data-pui-theme"; export const klass = "pui-gap";', "app/src/Probe.tsx"],
    ['export const name = "--shell-nav-height";', "app/src/Probe.tsx"],
  ]) assert.deepEqual(await reports(code, path), [], `${path}: ${code}`);
});
