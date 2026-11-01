import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

const eslint = new ESLint();
const packagePath = "packages/paper-ui/src/atoms/TokenProbe.tsx";
const errors = async (code, filePath = packagePath) =>
  (await eslint.lintText(code, { filePath }))[0].messages.filter((message) => message.severity === 2);
const hasRule = async (code, rule, path) => (await errors(code, path)).some((message) => message.ruleId === rule);

test("raw colors are caught in JSX, compound CSS, encoded SVG and templates", async () => {
  for (const code of [
    'export const X = () => <div style={{color: "#f00"}} />;',
    'export const style = { border: "1px solid #ff0000" };',
    'export const style = { backgroundImage: "url(data:image/svg+xml,%23ff0000)" };',
    'export const style = { border: `1px solid #ff0000` };',
    'export const style = { color: "red" };',
    'export const style = { background: "linear-gradient(red, blue)" };',
    'export const style = { background: "rgb(1 2 3)" };',
  ]) assert.equal(await hasRule(code, "paper/raw-color"), true, code);
});

test("consumer styles, CSS classes, inherited ink and system colors through SYSTEM_COLORS stay available", async () => {
  assert.deepEqual(await errors('import {tokens} from "@studio-baeks/paper-ui/tokens"; export const X = () => <div className={s.probe} data-token={tokens.color.ink.primary} />;', "app/src/TokenProbe.tsx"), []);
  assert.deepEqual(await errors('import {tokens, SYSTEM_COLORS} from "../tokens"; export const style = {color: tokens.color.ink.primary, borderColor: "currentColor", background: "transparent", outlineColor: SYSTEM_COLORS.canvasText};', "packages/paper-ui/src/styles/TokenProbe.css.ts"), []);
  assert.deepEqual(await errors('export const X = ({style}) => <div style={style} />;'), []);
});

test("[guardrails.internal-class.no-class-names] the package, an app, a fixture or a test cannot spell a package class name, but variables and attributes keep their prefix", async () => {
  for (const [code, path] of [
    ['export const className = "pui-info-ink";', "app/src/pages/Probe.tsx"],
    ['export const className = `pui-${accent}-dot`;', "app/src/pages/Probe.tsx"],
    ['export const X = () => <div className="home pui-gap-sm" />;', "app/src/pages/Probe.tsx"],
    ['export const selector = ".pui-gap-sm";', "tests/primitives/probe.spec.ts"],
    ['export const X = () => <div className="pui-foo" />;', "packages/paper-ui/src/atoms/Button.test.tsx"],
    ['export const X = () => <div className="pui-foo" />;', "packages/paper-ui/src/primitives/Probe.tsx"],
    ['export const className = "pui-info-ink";', "packages/paper-ui/src/atoms/TokenProbe.tsx"],
    ['export const name = "pui-foo";', "packages/paper-ui/src/styles/probe.css.ts"],
    ['export const name = "pui-foo";', "packages/paper-ui/src/resolvers/probe.ts"],
    ['export const X = () => <div className="pui-foo" />;', "fixtures/harness/src/cases/probe.tsx"],
    ['export const selector = ".pui-foo";', "fixtures/harness/vite.config.probe.ts"],
    ['expect(el.className).toContain("pui-gap-md");', "packages/paper-ui/src/primitives/probe.test.tsx"],
    ['expect(el.className).toMatch(/pui-gap-md/);', "packages/paper-ui/src/primitives/probe.test.tsx"],
    ['expect(el.className).toMatch(/pui-gap-md/);', "tests/primitives/probe.spec.ts"],
    // A concatenation that starts a class name.
    ['export const X = ({ n }) => <div className={"pui-" + n} />;', "app/src/pages/Probe.tsx"],
    ['await page.locator(".pui-" + n).click();', "tests/primitives/probe.spec.ts"],
    ['export const name = "pui-" + n;', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['export const name = `pui-` + n;', "fixtures/harness/src/probe.ts"],
    ['export const name = "home pui-" + n;', "app/src/pages/Probe.tsx"],
    ['export const name = "home " + "pui-" + n;', "app/src/pages/Probe.tsx"],
    ['export const selector = ".pui-" + n;', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['const fooId = "pui-" + n; export const X = () => <div className={fooId} />;', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['const controlId = "pui-" + n;', "app/src/pages/Probe.tsx"],
    // A binding named for an id or a key is still a class where a class position reads it, and in a selector.
    ['const fooId = "pui-foo"; export const X = () => <div className={fooId} />;', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['const fooKey = "pui-foo"; export const props = { className: `${fooKey} other` };', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['const fooId = "pui-foo"; export const add = (el) => el.classList.add(fooId);', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['const fooId = "pui-foo"; export const add = (el) => { el.className = fooId; };', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['const fooId = "pui-foo"; const other = fooId; export const X = () => <div className={other} />;', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['export const SELECTOR_KEY = ".pui-foo";', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['expect(el).toHaveClass("pui-foo");', "packages/paper-ui/src/atoms/Probe.test.tsx"],
    // Only the package has names of its own: everywhere else the same positions are a class name.
    ['const controlId = "pui-foo";', "app/src/pages/Probe.tsx"],
    ['export const STORAGE_KEY = "pui-foo";', "fixtures/harness/src/probe.ts"],
    ['expect(source).not.toContain("pui-foo");', "tests/primitives/probe.spec.ts"],
    ['localStorage.setItem("pui-theme", "dark");', "tests/foundations/probe.spec.ts"],
    // A negative assertion is a test's: source that says `.not` is not asserting.
    ['builder.not.add("pui-foo");', "packages/paper-ui/src/atoms/Probe.tsx"],
  ]) assert.equal(await hasRule(code, "paper/internal-class", path), true, `${path}: ${code}`);
  for (const [code, path] of [
    ['export const color = "var(--pui-color-ink-primary)";', "app/src/pages/Probe.tsx"],
    ['export const attribute = "data-pui-status";', "app/src/pages/Probe.tsx"],
    ['export const variable = `--pui-${name}`;', "app/src/pages/Probe.tsx"],
    ['export const selector = "[data-pui-theme]";', "tests/foundations/probe.spec.ts"],
    ['export const X = () => <div data-pui-theme="dark" style={{ "--pui-x": 0 }} />;', "fixtures/harness/src/cases/probe.tsx"],
    ['export const attribute = "data-pui-status"; export const variable = "--pui-color";', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['export const variable = "--pui-" + name; export const attribute = "data-pui-" + name;', "app/src/pages/Probe.tsx"],
    ['export const other = "pui" + n; export const after = n + "-pui-"; export const sum = 1 + n;', "app/src/pages/Probe.tsx"],
    ['await page.locator("[data-pui-" + n + "]").click();', "tests/primitives/probe.spec.ts"],
    // In the package a `pui-` name that is not a class says so by where it sits.
    ['const controlId = "pui-" + n;', "packages/paper-ui/src/primitives/field/FormField.tsx"],
    ['export const controlId = (id, generatedId) => { const controlId = id ?? `pui-field-${generatedId}`; return { id: controlId, htmlFor: controlId }; };', "packages/paper-ui/src/primitives/field/FormField.tsx"],
    ['export const THEME_STORAGE_KEY = "pui-theme";', "packages/paper-ui/src/theme/engine.ts"],
    ['expect(source).not.toContain("pui-state-tint");', "packages/paper-ui/src/styles/states.test.ts"],
    ['expect(source).not.toMatch(/pui-state-tint/);', "packages/paper-ui/src/styles/states.test.ts"],
    ['localStorage.setItem("pui-theme", "dark"); expect(localStorage.getItem("pui-theme")).toBeNull();', "packages/paper-ui/src/theme/provider.test.tsx"],
    ['export const X = () => <><label htmlFor="pui-x" /><input id="pui-x" /></>;', "packages/paper-ui/src/atoms/Probe.tsx"],
    ['export const props = { id: "pui-x" };', "packages/paper-ui/src/atoms/Probe.tsx"],
  ]) assert.equal(await hasRule(code, "paper/internal-class", path), false, `${path}: ${code}`);
});

test("[guardrails.no-rule-disable.paper-rules-stay-on] a comment cannot switch a paper rule off", async () => {
  for (const code of [
    '// eslint-disable-next-line paper/raw-color -- 브랜드 색\nexport const style = { color: "#f00" };',
    'export const style = { color: "#f00" }; // eslint-disable-line paper/raw-color, paper/no-rule-disable -- 둘 다',
    '/* eslint-disable */\nexport const style = { color: "#f00" };',
    '/* eslint paper/raw-color: "off" */\nexport const style = { color: "#f00" };',
    '/* eslint quotes:0,paper/raw-color:0 */\nexport const style = { color: "#f00" };',
    '/* eslint "paper/raw-color": "off" */\nexport const style = { color: "#f00" };',
  ]) assert.equal(await hasRule(code, "paper/no-rule-disable"), true, code);
  assert.equal(await hasRule('/* eslint no-restricted-imports: ["error", "paper/probe"] */\nexport const x = 1;', "paper/no-rule-disable"), false);
});

test("[guardrails.no-rule-disable.reason-required] other rules are switched off only with a reason, and only where they fire", async () => {
  const autofocus = "export const X = () => <input aria-label=\"이름\" autoFocus />;";
  assert.equal(await hasRule(`// eslint-disable-next-line jsx-a11y/no-autofocus\n${autofocus}`, "paper/no-rule-disable"), true);
  assert.deepEqual(await errors(`// eslint-disable-next-line jsx-a11y/no-autofocus -- 열리자마자 입력에 포커스를 둔다\n${autofocus}`), []);
  const unused = await errors("// eslint-disable-next-line jsx-a11y/no-autofocus -- 가릴 것이 없는 주석\nexport const x = 1;");
  assert.equal(unused.some((message) => message.ruleId === null && message.message.startsWith("Unused eslint-disable directive")), true);
});

test("build output is not linted, but the specs under tests/dist are", async () => {
  for (const path of ["packages/paper-ui/dist/index.js", "app/dist/assets/index.js", "fixtures/harness/dist/main.js", "tests/foundations/dist/probe.spec.ts"]) {
    assert.equal(await eslint.isPathIgnored(path), true, path);
  }
  assert.equal(await eslint.isPathIgnored("tests/dist/consumer.spec.ts"), false);
});

test("[guardrails.no-rule-disable.second-pass] the second lint pass runs the paper rules with inline configuration off, so a comment that switches them off changes nothing", async () => {
  const second = new ESLint({ overrideConfigFile: "eslint.paper.config.js" });
  const code = '/* eslint paper/no-rule-disable: "off", paper/raw-color: "off" */\nexport const style = { color: "#f00" };';
  // The main pass lets the comment through: ESLint applies inline configuration before any rule runs.
  assert.deepEqual(await errors(code), []);
  const messages = (await second.lintText(code, { filePath: packagePath }))[0].messages.filter((message) => message.severity === 2);
  assert.deepEqual(messages.map((message) => message.ruleId).sort(), ["paper/no-rule-disable", "paper/raw-color"]);
  // It reads only the paper rules.
  const other = (await second.lintText("export const x = 1; var y = 2; export { y };", { filePath: packagePath }))[0].messages;
  assert.deepEqual(other, []);
});

test("[guardrails.a11y.polymorphic] reads a primitive's `as` as the element it renders, so jsx-a11y checks it", async () => {
  const code = 'export const X = () => <Box as="img" src="a.png" />;';
  assert.equal(await hasRule(code, "jsx-a11y/alt-text"), true);
  assert.equal(await hasRule('export const X = () => <Box src="a.png" />;', "jsx-a11y/alt-text"), false);
});
