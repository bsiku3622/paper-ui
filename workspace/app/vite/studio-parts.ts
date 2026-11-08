// Marks each use of a Paper part in the demo screens, so the studio (/demo) can tell which one was clicked and hand it other props.
// Dev server only: a build has none of this, and the source files are never touched.
//
// A mark is the file, the part and its place among that part's uses in the file ("pages/demo/OverviewScreen.tsx#Button:3"), which
// outlives edits around it. For every use the plugin writes, after the props the code gives,
//
//     {...__studioPart("<mark>", <line>, { <the props written as plain values> }, [<the names of the others>])}
//
// and at the top of every component that holds such a use, `__studioUse();`, which subscribes that component to the studio's
// state so it draws again when a prop is set. Both are no-ops outside the studio's frame (src/pages/studio/mark.ts). The owner's
// host keeps the same file (vite/studio-parts.ts there) with other paths; the two are kept equal by hand.

import ts from "typescript";
import type { Plugin } from "vite";

export type PartsOptions = {
  // The absolute path of the source folder, with a trailing slash. Marks are named relative to it.
  src: string;
  // Which files (relative to src) are marked, and which of those are left alone.
  include: RegExp;
  skip?: RegExp;
  // The tags that are parts.
  tags: ReadonlySet<string>;
  // Where the runtime is imported from, as the dev server serves it.
  runtime: string;
};

type Literal = string | number | boolean;
const DYNAMIC = Symbol("dynamic");
const SKIPPED_PROPS = new Set(["key", "ref", "children"]);

const literalOf = (value: ts.JsxAttributeValue | undefined): Literal | typeof DYNAMIC => {
  if (value === undefined) return true;
  if (ts.isStringLiteral(value)) return value.text;
  if (ts.isJsxExpression(value) && value.expression) {
    const expression = value.expression;
    if (ts.isStringLiteralLike(expression)) return expression.text;
    if (ts.isNumericLiteral(expression)) return Number(expression.text);
    if (expression.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (expression.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isPrefixUnaryExpression(expression) && expression.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(expression.operand)) return -Number(expression.operand.text);
  }
  return DYNAMIC;
};

const isComponentName = (name: string | undefined) => name !== undefined && /^[A-Z]/.test(name);
const isDefaultExport = (node: ts.Node) => ts.isFunctionDeclaration(node) && (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.ExportDefault) === ts.ModifierFlags.ExportDefault;

// The component a use belongs to: the nearest enclosing function that is named like one (or is the default export), through any
// callback or render helper in between. A function named like a component that the file calls as a function (`Row(item)`) is a
// render helper, and runs inside whatever calls it: it takes no subscription of its own, because the number of times it runs may
// change from one render to the next, and a hook may not. A use outside any component has none, and draws again when its parent does.
const componentOf = (node: ts.Node, called: ReadonlySet<string>): ts.FunctionLikeDeclaration | null => {
  for (let at: ts.Node | undefined = node.parent; at; at = at.parent) {
    if (ts.isFunctionDeclaration(at)) {
      const name = at.name?.text;
      if ((isComponentName(name) || isDefaultExport(at)) && !(name && called.has(name))) return at.body ? at : null;
    } else if (ts.isArrowFunction(at) || ts.isFunctionExpression(at)) {
      let holder: ts.Node = at.parent;
      // memo(() => …) and forwardRef(() => …) are the component's body in a call.
      if (ts.isCallExpression(holder) && holder.arguments.includes(at as ts.Expression)) holder = holder.parent;
      const name = ts.isVariableDeclaration(holder) && ts.isIdentifier(holder.name) ? holder.name.text : ts.isFunctionExpression(at) ? at.name?.text : undefined;
      if ((isComponentName(name) || ts.isExportAssignment(holder)) && !(name && called.has(name))) return at;
    }
  }
  return null;
};

// The names the file calls as functions.
const calledIn = (source: ts.SourceFile): Set<string> => {
  const called = new Set<string>();
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) called.add(node.expression.text);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return called;
};

type Edit = { at: number; text: string; order: number };

// The source with every use of a tag in `options.tags` marked, or null when it has none.
export const transformParts = (code: string, relative: string, options: PartsOptions): string | null => {
  const source = ts.createSourceFile(relative, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits: Edit[] = [];
  const seen = new Map<string, number>();
  const holders = new Set<ts.FunctionLikeDeclaration>();
  const called = calledIn(source);
  let order = 0;

  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(source);
      if (options.tags.has(tag)) {
        const nth = (seen.get(tag) ?? 0) + 1;
        seen.set(tag, nth);
        const literals: Record<string, Literal> = {};
        const dynamic: string[] = [];
        for (const attribute of node.attributes.properties) {
          if (ts.isJsxSpreadAttribute(attribute)) {
            dynamic.push("...");
            continue;
          }
          const name = attribute.name.getText(source);
          if (SKIPPED_PROPS.has(name)) continue;
          const value = literalOf(attribute.initializer);
          if (value === DYNAMIC) dynamic.push(name);
          else literals[name] = value;
        }
        const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
        const mark = `${relative}#${tag}:${nth}`;
        edits.push({ at: node.attributes.end, text: ` {...__studioPart(${JSON.stringify(mark)}, ${line}, ${JSON.stringify(literals)}, ${JSON.stringify(dynamic)})}`, order: order++ });
        const holder = componentOf(node, called);
        if (holder) holders.add(holder);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (edits.length === 0) return null;

  for (const holder of holders) {
    const body = holder.body!;
    if (ts.isBlock(body)) edits.push({ at: body.getStart(source) + 1, text: " __studioUse();", order: order++ });
    else {
      edits.push({ at: body.getStart(source), text: "{ __studioUse(); return ", order: order++ });
      edits.push({ at: body.getEnd(), text: "; }", order: order++ });
    }
  }

  // Last first, so an earlier place still means what it did. Where two edits meet, the one made first stays first.
  const marked = edits.sort((a, b) => b.at - a.at || b.order - a.order).reduce((text, { at, text: insert }) => `${text.slice(0, at)}${insert}${text.slice(at)}`, code);
  return `${marked}\nimport { __studioPart, __studioUse } from ${JSON.stringify(options.runtime)};\n`;
};

export const studioParts = (options: PartsOptions): Plugin => ({
  name: "paper-studio-parts",
  // The dev server only: neither a build nor a test run marks anything.
  apply: (_config, env) => env.command === "serve" && !process.env.VITEST,
  enforce: "pre",
  transform(code, id) {
    const file = id.split("?")[0]!;
    if (!file.startsWith(options.src) || !file.endsWith(".tsx")) return;
    const relative = file.slice(options.src.length);
    if (!options.include.test(relative) || options.skip?.test(relative)) return;
    const out = transformParts(code, relative, options);
    return out ? { code: out, map: null } : undefined;
  },
});
