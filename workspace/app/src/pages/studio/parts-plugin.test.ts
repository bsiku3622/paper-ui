import { describe, expect, it } from "vitest";

import { transformParts, type PartsOptions } from "../../../vite/studio-parts";

// The dev server's plugin marks every use of a part in a screen's source, and makes each component that holds a use draw again when
// the studio sets a prop. It reads the source with the TypeScript parser and writes only text it adds.

const OPTIONS: PartsOptions = {
  src: "/work/src/",
  include: /^pages\/demo\//,
  tags: new Set(["Button", "Stack", "Text"]),
  runtime: "/src/pages/studio/mark.ts",
};

const run = (code: string) => transformParts(code, "pages/demo/Screen.tsx", OPTIONS) ?? "";

describe("the studio's part marks", () => {
  it("writes a mark, the line and the props written as plain values after each use of a part", () => {
    const out = run(`export const Screen = () => (\n  <Stack gap="md" padding={4}>\n    <Button variant="ghost" size="sm" onClick={go} disabled>Go</Button>\n  </Stack>\n);\n`);
    expect(out).toContain(`<Stack gap="md" padding={4} {...__studioPart("pages/demo/Screen.tsx#Stack:1", 2, {"gap":"md","padding":4}, [])}>`);
    expect(out).toContain(`{...__studioPart("pages/demo/Screen.tsx#Button:1", 3, {"variant":"ghost","size":"sm","disabled":true}, ["onClick"])}`);
  });

  it("numbers the uses of one part in a file, in order", () => {
    const out = run(`export const Screen = () => <Stack><Button /><Button /></Stack>;\n`);
    expect(out).toContain("#Button:1");
    expect(out).toContain("#Button:2");
  });

  it("names the props it cannot read as values, including a spread", () => {
    const out = run(`export const Screen = ({ rest, tone }) => <Text variant={tone} {...rest} as="span" />;\n`);
    expect(out).toContain(`{"as":"span"}, ["variant","..."]`);
  });

  it("subscribes the component that holds a use, once, at the top of its body", () => {
    const out = run(`export const Screen = () => {\n  const a = 1;\n  return <Stack><Button /></Stack>;\n};\n`);
    expect(out.match(/__studioUse\(\)/g)).toHaveLength(1);
    expect(out).toContain("{ __studioUse();\n  const a = 1;");
  });

  it("gives an expression body a block, and finds the component through a callback and memo", () => {
    const concise = run(`export const Screen = () => <Stack />;\n`);
    expect(concise).toContain("=> { __studioUse(); return <Stack");
    const nested = run(`const Row = memo(({ items }) => items.map((item) => <Button key={item} />));\n`);
    expect(nested).toContain("{ __studioUse(); return items.map");
  });

  it("leaves a function that is not a component to the component that calls it", () => {
    const out = run(`const render = () => <Stack />;\nexport const Screen = () => <div>{render()}</div>;\n`);
    expect(out).toContain("#Stack:1");
    expect(out).not.toContain("__studioUse()");
  });

  it("takes no subscription for a function named like a component that the file calls as a function", () => {
    // Row runs inside Screen, as often as there are items, and a hook may not run a different number of times.
    const out = run(`const Row = (item) => <Button key={item} />;\nexport const Screen = ({ items }) => <Stack>{items.map((item) => Row(item))}</Stack>;\n`);
    expect(out.match(/__studioUse\(\)/g)).toHaveLength(1);
    expect(out).toContain("export const Screen = ({ items }) => { __studioUse(); return <Stack");
    expect(out).toContain("const Row = (item) => <Button");
  });

  it("imports the runtime from where the dev server serves it, and does nothing to a file without parts", () => {
    expect(run(`export const A = () => <Button />;\n`)).toMatch(/import \{ __studioPart, __studioUse \} from "\/src\/pages\/studio\/mark\.ts";\n$/);
    expect(transformParts(`export const A = () => <div />;\n`, "pages/demo/A.tsx", OPTIONS)).toBeNull();
  });

  it("keeps the source otherwise as it was", () => {
    const code = `export const Screen = () => <Stack gap="md">text</Stack>;\n`;
    const out = run(code);
    const without = out.replace(/ \{\.\.\.__studioPart\([^)]*\)\}/g, "").replace("=> { __studioUse(); return ", "=> ").replace("; }", "").replace(/\nimport .*\n$/, "");
    expect(without).toBe(code);
  });
});
