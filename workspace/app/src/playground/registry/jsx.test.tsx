import { describe, expect, it } from "vitest";

import { Box, Button, Field, Floating, Icon, Inline, Pressable, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { componentNames, named, parseChildrenText, parseOpeningTag, printJsx, spreadOf } from "./jsx";

const names = componentNames();
const print = (element: Parameters<typeof printJsx>[0], defaults: Record<string, unknown> = {}, scope: string[] = []) => printJsx(element, { names, defaults, scope });

describe("componentNames", () => {
  it("names the package's components and their compound statics", () => {
    expect(names.get(Box)).toBe("Box");
    expect(names.get(Floating.Content)).toBe("Floating.Content");
    expect(names.get(Floating)).toBe("Floating");
  });
});

describe("printJsx", () => {
  it("writes strings quoted, numbers in braces, true bare and leaves out false and undefined", () => {
    expect(print(<Surface as={Stack} gap="md" tabIndex={-1} aria-hidden border={false} radius={undefined} />)).toBe('<Surface as={Stack} gap="md" tabIndex={-1} aria-hidden />');
  });

  it("leaves out a prop equal to the component's default, but only on the elements the defaults belong to", () => {
    const tree = (
      <Stack gap="md" align="stretch">
        <Inline gap="md" />
      </Stack>
    );
    expect(print(tree, { gap: "md" }, ["Stack"])).toBe('<Stack align="stretch">\n  <Inline gap="md" />\n</Stack>');
  });

  it("keeps false when the default is true", () => {
    expect(print(<Button loading={false} disabled />, { loading: true }, ["Button"])).toBe("<Button loading={false} disabled />");
  });

  it("writes children as text and as nested elements, and merges adjacent text", () => {
    expect(print(<Text>{"x: "}{3}</Text>)).toBe("<Text>x: 3</Text>");
    expect(print(<Box><Icon><path d="M1 1" /></Icon></Box>)).toBe('<Box>\n  <Icon>\n    <path d="M1 1" />\n  </Icon>\n</Box>');
  });

  it("writes a function through its name and refuses one without", () => {
    expect(print(<Button onClick={named("save", () => {})} />)).toBe("<Button onClick={save} />");
    expect(() => print(<Button onClick={() => {}} />)).toThrow(/named/);
  });

  it("writes an element-valued prop inline and a component-valued one by name", () => {
    expect(print(<Button as={Box} />)).toBe("<Button as={Box} />");
    expect(print(<Field leading={<Icon />} />)).toBe("<Field leading={<Icon />} />");
  });

  it("writes a render function child as its named code", () => {
    expect(print(<Pressable>{named("({ isPressed }) => isPressed", () => "x")}</Pressable>)).toBe("<Pressable>\n  {({ isPressed }) => isPressed}\n</Pressable>");
  });

  it("writes a spread through its expression and not through the keys it produced", () => {
    const props = { onPointerDown: named("down", () => {}), "data-pressed": true };
    expect(print(spreadOf(<Box {...props} />, "mergeProps(a, b)", Object.keys(props)))).toBe("<Box {...mergeProps(a, b)} />");
  });

  it("breaks a long tag into one prop per line", () => {
    const code = print(<Surface fill="raised" border radius="md" padding="lg" paddingX="xl" paddingY="xl" width="240px" minWidth="120px" />);
    expect(code.split("\n")[0]).toBe("<Surface");
    expect(parseOpeningTag(code, "Surface")?.attrs).toMatchObject({ fill: "raised", border: true, minWidth: "120px" });
  });

  it("leaves out the testid and a class the page asks to ignore", () => {
    expect(printJsx(<Box data-testid="x" className="demo keep" />, { names, ignoreClasses: new Set(["demo"]) })).toBe('<Box className="keep" />');
  });
});

describe("parseOpeningTag", () => {
  it("reads a quoted string, {true}, {false}, a bare name, a number, an element and an expression", () => {
    const code = `<Foo a="x y" b={true} c={false} d e={2.5} f={<Icon />} g={fn("}")} h={"q"} {...rest}>`;
    expect(parseOpeningTag(code, "Foo")).toEqual({
      attrs: { a: "x y", b: true, c: false, d: true, e: 2.5, f: { element: "<Icon />" }, g: { expression: 'fn("}")' }, h: "q" },
      end: code.length,
      selfClosing: false,
    });
  });

  it("finds a name only where it ends: Floating is not Floating.Content", () => {
    const code = '<Floating.Content dismissable={false}><Floating modal>';
    expect(parseOpeningTag(code, "Floating")?.attrs).toEqual({ modal: true });
    expect(parseOpeningTag(code, "Floating.Content")?.attrs).toEqual({ dismissable: false });
  });

  it("reads a tag across lines and tells a self-closing one", () => {
    const tag = parseOpeningTag('<Box\n  a="1"\n  b\n/>', "Box");
    expect(tag).toMatchObject({ attrs: { a: "1", b: true }, selfClosing: true });
  });

  it("is undefined without the tag and throws on one that never closes", () => {
    expect(parseOpeningTag("<Box />", "Stack")).toBeUndefined();
    expect(() => parseOpeningTag('<Box a="x', "Box")).toThrow();
    expect(() => parseOpeningTag("<Box a={", "Box")).toThrow();
  });
});

describe("parseChildrenText", () => {
  it("reads plain text, quoted text and nothing for a self-closing tag", () => {
    expect(parseChildrenText("<Text>\n  저장\n</Text>", "Text")).toBe("저장");
    expect(parseChildrenText('<Text>{"a {b}"}</Text>', "Text")).toBe("a {b}");
    expect(parseChildrenText("<Text />", "Text")).toBe("");
  });

  it("is undefined for children that are not plain text", () => {
    expect(parseChildrenText("<Text><b>x</b></Text>", "Text")).toBeUndefined();
    expect(parseChildrenText("<Text>{value}</Text>", "Text")).toBeUndefined();
  });
});
