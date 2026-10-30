// One JSX grammar for the registry: printJsx writes an element tree as code, parseOpeningTag reads
// that code back. Both stop at the same forms — a quoted string, {true}/{false}, a bare name,
// {number}, {<Element />} and a named expression — so what is printed can always be parsed.

import { Fragment, isValidElement, type ElementType, type ReactElement, type ReactNode } from "react";

import * as paperUi from "@studio-baeks/paper-ui";

const CODES = new WeakMap<object, string>();
const SPREADS = new WeakMap<object, { code: string; keys: readonly string[] }[]>();

// A function or object the page passes to the subject, with the expression the code panel shows for it.
export const named = <T extends object>(code: string, value: T): T => {
  CODES.set(value, code);
  return value;
};

// Props that reach the element through `{...expression}`: the printer writes the expression instead
// of the keys it produced.
export const spreadOf = <E extends ReactElement>(element: E, code: string, keys: readonly string[]): E => {
  SPREADS.set(element, [...(SPREADS.get(element) ?? []), { code, keys }]);
  return element;
};

const codeOf = (value: unknown): string | undefined =>
  typeof value === "function" || (typeof value === "object" && value !== null) ? CODES.get(value) : undefined;

export const sourceOf = codeOf;

const isComponent = (value: unknown): boolean =>
  typeof value === "function" || (typeof value === "object" && value !== null && "$$typeof" in value);

// Every component the package exports, and its compound statics (Floating.Content, Select.Option).
export const componentNames = (parts: Readonly<Record<string, ElementType>> = {}): Map<unknown, string> => {
  const names = new Map<unknown, string>();
  for (const [key, value] of Object.entries(paperUi)) {
    if (!/^[A-Z]/.test(key) || !isComponent(value)) continue;
    names.set(value, key);
    for (const [member, part] of Object.entries(value as object)) {
      if (/^[A-Z]/.test(member) && isComponent(part)) names.set(part, `${key}.${member}`);
    }
  }
  for (const [key, value] of Object.entries(parts)) names.set(value, key);
  return names;
};

// ── printing ─────────────────────────────────────────────────────────────────

export type PrintOptions = {
  // The component's own defaults: a prop equal to one is left out.
  defaults?: Readonly<Record<string, unknown>>;
  // The element names those defaults belong to. Others print every prop they carry.
  scope?: readonly string[];
  names: ReadonlyMap<unknown, string>;
  // Class names that are demo chrome and not part of what a reader would write.
  ignoreClasses?: ReadonlySet<string>;
};

const WIDTH = 88;
const quote = (text: string) => (text.includes('"') || /[\n\\]/.test(text) ? `{${JSON.stringify(text)}}` : `"${text}"`);

const nameOf = (type: unknown, names: ReadonlyMap<unknown, string>): string => {
  if (type === Fragment) return "";
  if (typeof type === "string") return type;
  const found = names.get(type);
  if (found === undefined) throw new Error("printJsx: an element type has no name; export it from the package or list it in the spec's parts.");
  return found;
};

type Piece = { kind: "text"; text: string } | { kind: "node"; lines: string[] } | { kind: "code"; code: string };

const pieces = (children: ReactNode, options: PrintOptions): Piece[] => {
  const out: Piece[] = [];
  const visit = (node: unknown): void => {
    if (node === null || node === undefined || typeof node === "boolean") return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (typeof node === "string" || typeof node === "number") {
      const last = out[out.length - 1];
      if (last?.kind === "text") last.text += String(node);
      else out.push({ kind: "text", text: String(node) });
      return;
    }
    if (isValidElement(node)) { out.push({ kind: "node", lines: elementLines(node, options) }); return; }
    const code = codeOf(node);
    if (code !== undefined) { out.push({ kind: "code", code }); return; }
    throw new Error("printJsx: a child is neither text, an element nor a named function.");
  };
  visit(children);
  return out;
};

const attributes = (element: ReactElement, name: string, options: PrintOptions): string[] => {
  const props = element.props as Record<string, unknown>;
  const spreads = SPREADS.get(element) ?? [];
  const spread = new Set(spreads.flatMap((entry) => entry.keys));
  const own = options.scope?.includes(name) ? (options.defaults ?? {}) : {};
  const out = spreads.map((entry) => `{...${entry.code}}`);
  for (const [prop, value] of Object.entries(props)) {
    if (prop === "children" || prop === "key" || prop === "data-testid" || spread.has(prop) || value === undefined || value === null) continue;
    if (prop === "ref" && codeOf(value) === undefined) continue;
    if (prop === "className") {
      const kept = String(value).split(/\s+/).filter((token) => token && !options.ignoreClasses?.has(token));
      if (kept.length) out.push(`className=${quote(kept.join(" "))}`);
      continue;
    }
    if (value === false) { if (own[prop] === true) out.push(`${prop}={false}`); continue; }
    if (value === own[prop]) continue;
    if (value === true) out.push(prop);
    else if (typeof value === "string") out.push(`${prop}=${quote(value)}`);
    else if (typeof value === "number") out.push(`${prop}={${value}}`);
    else if (options.names.has(value)) out.push(`${prop}={${options.names.get(value)}}`);
    else if (Array.isArray(value) && value.every((item) => typeof item === "string")) out.push(`${prop}={${JSON.stringify(value)}}`);
    else if (isValidElement(value)) out.push(`${prop}={${elementLines(value, options).map((line) => line.trim()).join(" ")}}`);
    else if (codeOf(value) !== undefined) out.push(`${prop}={${codeOf(value)}}`);
    else throw new Error(`printJsx: ${name} ${prop} is neither a literal, an element nor a named value.`);
  }
  return out;
};

const text = (value: string) => (/[{}<>]/.test(value) ? `{${JSON.stringify(value)}}` : value);

function elementLines(element: ReactElement, options: PrintOptions): string[] {
  const name = nameOf(element.type, options.names);
  const attrs = name === "" ? [] : attributes(element, name, options);
  const children = pieces((element.props as { children?: ReactNode }).children, options);
  const inline = `<${[name, ...attrs].join(" ")}`;
  const open = (close: string) => (inline.length + close.length <= WIDTH ? [`${inline}${close}`] : [`<${name}`, ...attrs.map((attr) => `  ${attr}`), close === " />" ? "/>" : ">"]);
  if (children.length === 0) return name === "" ? ["<></>"] : open(" />");
  const [head = "", ...rest] = name === "" ? ["<>"] : open(">");
  const tail = `</${name}>`;
  const [only] = children;
  if (children.length === 1 && only?.kind === "text") {
    const one = `${text(only.text)}`;
    if (rest.length === 0 && head.length + one.length + tail.length <= WIDTH) return [`${head}${one}${tail}`];
  }
  const body = children.flatMap((piece) =>
    piece.kind === "text" ? [text(piece.text)] : piece.kind === "code" ? `{${piece.code}}`.split("\n") : piece.lines,
  );
  return [head, ...rest, ...body.map((line) => `  ${line}`), tail];
}

export const printJsx = (element: ReactElement, options: PrintOptions): string => elementLines(element, options).join("\n");

// ── parsing ──────────────────────────────────────────────────────────────────

export type AttrValue = boolean | number | string | { element: string } | { expression: string };
export type OpeningTag = { attrs: Record<string, AttrValue>; end: number; selfClosing: boolean };

export class ParseError extends Error {}

// The index of the brace that closes the one at `open`, skipping strings.
const closing = (code: string, open: number): number => {
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    const ch = code[i]!;
    if (ch === '"' || ch === "'" || ch === "`") {
      i = code.indexOf(ch, i + 1);
      if (i < 0) break;
    } else if (ch === "{") depth += 1;
    else if (ch === "}" && --depth === 0) return i;
  }
  throw new ParseError("괄호가 닫히지 않았습니다.");
};

const interpret = (raw: string): AttrValue => {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  if (/^"(?:[^"\\]|\\.)*"$/.test(raw)) return JSON.parse(raw) as string;
  if (raw.startsWith("<")) return { element: raw };
  return { expression: raw };
};

// The first `<name …>` in the code. A name is followed by whitespace, `>` or `/`, so Floating does
// not match Floating.Content.
export const parseOpeningTag = (code: string, name: string): OpeningTag | undefined => {
  let start = code.indexOf(`<${name}`);
  while (start >= 0 && !/[\s>/]/.test(code[start + name.length + 1] ?? "")) start = code.indexOf(`<${name}`, start + 1);
  if (start < 0) return undefined;
  const attrs: Record<string, AttrValue> = {};
  let i = start + name.length + 1;
  for (;;) {
    while (/\s/.test(code[i] ?? "")) i += 1;
    if (i >= code.length) throw new ParseError("태그가 닫히지 않았습니다.");
    if (code.startsWith("/>", i)) return { attrs, end: i + 2, selfClosing: true };
    if (code[i] === ">") return { attrs, end: i + 1, selfClosing: false };
    if (code[i] === "{") { i = closing(code, i) + 1; continue; }
    const key = /^[^\s=/>{]+/.exec(code.slice(i))?.[0];
    if (!key) throw new ParseError("속성을 읽을 수 없습니다.");
    i += key.length;
    while (/\s/.test(code[i] ?? "")) i += 1;
    if (code[i] !== "=") { attrs[key] = true; continue; }
    i += 1;
    while (/\s/.test(code[i] ?? "")) i += 1;
    const quote = code[i];
    if (quote === '"' || quote === "'") {
      const stop = code.indexOf(quote, i + 1);
      if (stop < 0) throw new ParseError("따옴표가 닫히지 않았습니다.");
      attrs[key] = code.slice(i + 1, stop);
      i = stop + 1;
    } else if (quote === "{") {
      const stop = closing(code, i);
      attrs[key] = interpret(code.slice(i + 1, stop).trim());
      i = stop + 1;
    } else throw new ParseError(`${key} 값을 읽을 수 없습니다.`);
  }
};

// The text between `<name …>` and `</name>`. Anything but plain text (elements, expressions) is undefined.
export const parseChildrenText = (code: string, name: string): string | undefined => {
  const tag = parseOpeningTag(code, name);
  if (!tag) return undefined;
  if (tag.selfClosing) return "";
  const stop = code.indexOf(`</${name}>`, tag.end);
  if (stop < 0) return undefined;
  const body = code.slice(tag.end, stop).split("\n").map((line) => line.trim()).filter(Boolean).join(" ");
  const quoted = /^\{("(?:[^"\\]|\\.)*")\}$/.exec(body)?.[1];
  if (quoted) return JSON.parse(quoted) as string;
  return /[{<]/.test(body) ? undefined : body;
};
