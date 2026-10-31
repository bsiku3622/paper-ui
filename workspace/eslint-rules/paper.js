import path from "node:path";

import { COLOR_OWNERS, GLOBAL_SELECTOR_FILES, RUNTIME_STYLE, TOKEN_LAYER, isInside, isTestFile, workspacePath } from "./manifest.js";
import { sourceIsolationRule } from "./source-isolation.js";
import { sourceNumbersRule } from "./source-numbers.js";

// A colour written by hand: a HEX (also url-encoded) or a colour function. Any string, template or key.
const rawColor = /(?:#|%23)(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{4}|[\da-f]{3})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\s*\(/i;
// The properties whose value may be a colour, so a keyword in them is read as one.
const colorProperty = /color|background|border|outline|shadow|fill|stroke|caret|accent|decoration|columnRule|filter|mask|^--/i;
const namedColors = new Set(("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen").split(" "));
// The CSS system colours, spelled as the specification spells them. A component asks for one by name through
// SYSTEM_COLORS, never by its keyword. The spelling is read as written, so `canvas` the Surface fill stays a word.
const systemColors = new Set("Canvas CanvasText LinkText VisitedText ActiveText ButtonFace ButtonText ButtonBorder Field FieldText Highlight HighlightText SelectedItem SelectedItemText Mark MarkText GrayText AccentColor AccentColorText".split(" "));

const QUOTED_WRAPPERS = new Set(["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression", "TSTypeAssertion"]);

// The string pieces a value is made of, through wrappers, conditionals, logicals, templates, concatenations,
// arrays and the arguments of a call. A piece is a string literal or a template's text.
const pieces = (node, found = []) => {
  if (!node) return found;
  if (QUOTED_WRAPPERS.has(node.type)) return pieces(node.expression, found);
  switch (node.type) {
    case "Literal": if (typeof node.value === "string") found.push(node); break;
    case "TemplateLiteral": found.push(node); node.expressions.forEach((expression) => pieces(expression, found)); break;
    case "ConditionalExpression": pieces(node.consequent, found); pieces(node.alternate, found); break;
    case "LogicalExpression":
    case "BinaryExpression": pieces(node.left, found); pieces(node.right, found); break;
    case "ArrayExpression": node.elements.forEach((element) => pieces(element, found)); break;
    case "CallExpression": node.arguments.forEach((argument) => pieces(argument, found)); break;
    default:
  }
  return found;
};
const textOf = (node) => (node.type === "TemplateLiteral" ? node.quasis.map((part) => part.value.cooked ?? part.value.raw).join(" ") : node.value);

// The package reads `tokens.color` in the Paint primitives and nowhere else: a part that needs a colour takes the class
// from there. A read is `tokens.color…` or `const { color } = tokens`.
const PACKAGE_SRC = TOKEN_LAYER.replace(/\/tokens$/, "");
const readsColorRoles = {
  MemberExpression(node) {
    return node.object.type === "Identifier" && node.object.name === "tokens" && ((!node.computed && node.property.name === "color") || (node.computed && node.property.value === "color"));
  },
  VariableDeclarator(node) {
    return node.init?.type === "Identifier" && node.init.name === "tokens" && node.id.type === "ObjectPattern"
      && node.id.properties.some((property) => property.type === "Property" && (property.key.name ?? property.key.value) === "color");
  },
};

const rawColorRule = {
  meta: { type: "problem", schema: [], messages: { raw: "Raw color 금지. tokens.color의 semantic 참조를 사용하세요.", named: "이름 있는 색(`{{word}}`)을 쓰지 않습니다. 색은 tokens.color에서, 시스템 색은 SYSTEM_COLORS에서 고릅니다.", owner: "tokens.color는 paint 층(primitives/paint)과 styles/의 class 지도, Icon의 잉크에서만 읽습니다. 다른 곳은 paint 층이 주는 class를 씁니다." } },
  create(context) {
    const file = workspacePath(context.filename);
    const ownership = isInside(file, PACKAGE_SRC) && !isInside(file, TOKEN_LAYER) && !isTestFile(file) && !COLOR_OWNERS.some((owner) => isInside(file, owner));
    const reported = new WeakSet();
    const flag = (node, messageId, data) => {
      if (reported.has(node)) return;
      reported.add(node);
      context.report({ node, messageId, data });
    };
    // A keyword in the value of a colour-capable key.
    const checkKeyword = (value) => {
      for (const piece of pieces(value)) {
        const word = textOf(piece).split(/[\s,()/]+/).find((candidate) => namedColors.has(candidate.toLowerCase()) || systemColors.has(candidate));
        if (word) flag(piece, "named", { word });
      }
    };
    return {
      ...(ownership ? {
        MemberExpression(node) { if (readsColorRoles.MemberExpression(node)) flag(node, "owner"); },
        VariableDeclarator(node) { if (readsColorRoles.VariableDeclarator(node)) flag(node, "owner"); },
      } : {}),
      Literal(node) { if (typeof node.value === "string" && rawColor.test(node.value)) flag(node, "raw"); },
      TemplateLiteral(node) { if (rawColor.test(textOf(node))) flag(node, "raw"); },
      Property(node) {
        if (node.parent.type === "ObjectExpression" && colorProperty.test(String(node.key.name ?? node.key.value ?? ""))) checkKeyword(node.value);
      },
      JSXAttribute(node) {
        if (node.value?.type === "JSXExpressionContainer" && colorProperty.test(String(node.name.name))) checkKeyword(node.value.expression);
        else if (node.value?.type === "Literal" && colorProperty.test(String(node.name.name))) checkKeyword(node.value);
      },
    };
  },
};

// A package .ts/.tsx file never hands a token to `style`: a token is applied by a `.css.ts` className. The rule
// reports a JSX `style` attribute, or an object property keyed `style`, whose value reaches a binding imported
// from the token layer (src/tokens), the stylesheets (src/styles), the internals (src/internal) or the package
// itself. "Reaches" follows what the value is made of: a declarator's initialiser and destructuring, a variable's
// later assignments, member chains, a call's callee and arguments, the bodies of the functions it holds, and
// conditional, logical, binary, template, spread and TypeScript-wrapper nodes. No call is opaque and no name is
// listed; a `throw` is not followed, since what a function throws is never the value it returns. The declared runtime modules (RUNTIME_STYLE in the manifest, each with its reason) are untracked: what they
// compute is a value of the moment — an anchored position, an Aria press style, a carried source variable.
const TRACKED_DIRECTORIES = ["tokens", "styles", "internal"];
const PACKAGE_IMPORT = /^@studio-baeks\/paper-ui/;
const SOURCE_ROOT = /^(.*[\\/]packages[\\/]paper-ui[\\/]src)[\\/]/;
const TYPE_WRAPPERS = new Set(["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression", "TSTypeAssertion", "TSInstantiationExpression"]);

const modulePath = (entry) => entry.replace(/\/\*\*$/, "").replace(/(?:\.css)?\.tsx?$/, "");
const RUNTIME_MODULES = Object.keys(RUNTIME_STYLE).map(modulePath);

const inlineTokenRule = {
  meta: {
    type: "problem",
    schema: [],
    messages: { inline: "토큰은 inline style 대신 .css.ts className으로 적용하세요." },
  },
  create(context) {
    const source = context.sourceCode;
    const root = SOURCE_ROOT.exec(context.filename)?.[1];

    const isTracked = (specifier) => {
      if (PACKAGE_IMPORT.test(specifier)) return true;
      if (!root || !specifier.startsWith(".")) return false;
      const inside = path.relative(root, path.resolve(path.dirname(context.filename), specifier)).split(path.sep).join("/");
      if (inside.startsWith("..") || !TRACKED_DIRECTORIES.includes(inside.split("/")[0])) return false;
      return !RUNTIME_MODULES.some((module) => inside === module || inside.startsWith(`${module}/`));
    };

    const reaches = (node, seen = new Set()) => {
      if (!node || seen.has(node)) return false;
      seen.add(node);
      if (node.type === "Identifier") return identifierReaches(node, seen);
      if (TYPE_WRAPPERS.has(node.type)) return reaches(node.expression, seen);
      if (node.type.startsWith("TS") || node.type === "ThrowStatement") return false;
      return (source.visitorKeys[node.type] ?? []).some((key) => {
        if (((key === "key" && node.type === "Property") || (key === "property" && node.type === "MemberExpression")) && !node.computed) return false;
        const children = node[key];
        return Array.isArray(children) ? children.some((child) => reaches(child, seen)) : reaches(children, seen);
      });
    };

    const identifierReaches = (identifier, seen) => {
      let scope = source.getScope(identifier);
      while (scope && !scope.set.has(identifier.name)) scope = scope.upper;
      const variable = scope?.set.get(identifier.name);
      if (!variable) return false;
      const defined = variable.defs.some((def) => {
        if (def.type === "ImportBinding") return def.parent.importKind !== "type" && def.node.importKind !== "type" && isTracked(def.parent.source.value);
        if (def.type === "Variable") return reaches(def.node.init, seen);
        if (def.type === "FunctionName") return reaches(def.node.body, seen);
        return false;
      });
      if (defined) return true;
      // Later assignments: `value = tokens.x` and `value.color = tokens.x`.
      return variable.references.some((reference) => {
        if (reference.writeExpr) return reaches(reference.writeExpr, seen);
        const member = reference.identifier.parent;
        const assignment = member?.type === "MemberExpression" ? member.parent : undefined;
        return assignment?.type === "AssignmentExpression" && assignment.left === member && reaches(assignment.right, seen);
      });
    };

    const check = (node, value) => { if (reaches(value)) context.report({ node, messageId: "inline" }); };
    return {
      JSXAttribute(node) {
        if (node.name.name === "style" && node.value?.type === "JSXExpressionContainer") check(node, node.value.expression);
      },
      Property(node) {
        if (node.parent.type === "ObjectExpression" && !node.computed && (node.key.name ?? node.key.value) === "style") check(node, node.value);
      },
    };
  },
};

// Package stylesheets reach vanilla-extract's rule APIs only through layered() from tokens/layers.css.ts, so
// every rule lands in a pui.* cascade layer. keyframes, createVar, fallbackVar and createGlobalVar stay direct
// imports: @keyframes and @property sit outside layers by design. Type-only imports emit nothing.
const RULE_APIS = {
  "@vanilla-extract/css": new Set(["style", "styleVariants", "globalStyle", "createTheme", "createGlobalTheme", "layer", "globalLayer"]),
  "@vanilla-extract/recipes": new Set(["recipe"]),
};
const layeredStylesRule = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      direct: "패키지 stylesheet는 {{name}} 대신 tokens/layers.css.ts의 layered()를 쓰세요. 그래야 규칙이 pui layer 안에 듭니다.",
      namespace: "패키지 stylesheet는 {{source}} 전체를 import하지 않습니다. 규칙은 tokens/layers.css.ts의 layered()로 만드세요.",
    },
  },
  create(context) {
    const check = (node, source, specifiers) => {
      const apis = RULE_APIS[source];
      if (!apis || node.importKind === "type" || node.exportKind === "type") return;
      for (const specifier of specifiers) {
        if (specifier.importKind === "type" || specifier.exportKind === "type") continue;
        if (specifier.type === "ImportNamespaceSpecifier" || specifier.type === "ExportAllDeclaration") {
          context.report({ node: specifier, messageId: "namespace", data: { source } });
          continue;
        }
        const imported = specifier.type === "ImportSpecifier" ? specifier.imported : specifier.local;
        const name = imported.name ?? imported.value;
        if (apis.has(name)) context.report({ node: specifier, messageId: "direct", data: { name } });
      }
    };
    return {
      ImportDeclaration(node) { check(node, node.source.value, node.specifiers); },
      ExportNamedDeclaration(node) { if (node.source) check(node, node.source.value, node.specifiers); },
      ExportAllDeclaration(node) { check(node, node.source.value, [node]); },
    };
  },
};

// An app or a test never writes the name of a package class. Shared axes reach their class through the
// package's typed maps, so a `pui-` string is a name the package no longer promises. `--pui-*` variables and
// `data-pui-*` attributes pass: the character before the prefix is `-` there. A template literal counts each
// placeholder as a letter, so `pui-${name}-dot` is read as a class name too.
const internalClass = /(^|[^-\w])pui-[a-z]/;
const internalClassRule = {
  meta: { type: "problem", schema: [], messages: { internal: "패키지 내부 class 이름을 문자열로 쓰지 않습니다. 공유 축은 컴포넌트 prop 으로 고릅니다." } },
  create(context) {
    const check = (node, value) => { if (internalClass.test(value)) context.report({ node, messageId: "internal" }); };
    return {
      Literal(node) { if (typeof node.value === "string") check(node, node.value); },
      TemplateLiteral(node) { check(node, node.quasis.map((part) => part.value.cooked ?? part.value.raw).join("x")); },
    };
  },
};

// No eslint-disable comment names a paper rule and no `/* eslint */` comment configures one — an exception
// is declared in eslint-rules/manifest.js. Any other rule an eslint-disable comment switches off carries its reason
// after `--`. Reports sit at column 0 of the comment's line: disable directives cover a line from column 1,
// so no directive can hide its own report. A `/* eslint */` comment that also switches this rule off is out
// of any rule's reach, because ESLint applies inline configuration before the rules run.
const configuresPaper = /(?:^|[\s,{])["']?paper\/[\w-]+["']?\s*:/;
const noRuleDisableRule = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      paper: "paper 규칙은 주석으로 끄지 않습니다. 예외는 eslint-rules/manifest.js에 선언하세요.",
      blanket: "규칙을 적지 않은 eslint-disable은 paper 규칙까지 끕니다. 끌 규칙과 `-- 이유`를 적으세요.",
      reason: "규칙을 끄는 주석에는 `-- 이유`를 적으세요.",
    },
  },
  create(context) {
    const source = context.sourceCode;
    const report = (comment, messageId) => context.report({ loc: { line: comment.loc.start.line, column: -1 }, messageId });
    const namesPaper = (rules) => rules.some((rule) => rule.startsWith("paper/"));
    return {
      Program() {
        for (const directive of source.getDisableDirectives().directives) {
          if (directive.type === "enable") continue;
          const rules = directive.value.split(",").map((rule) => rule.trim()).filter(Boolean);
          if (rules.length === 0) report(directive.node, "blanket");
          else if (namesPaper(rules)) report(directive.node, "paper");
          else if (!directive.justification?.trim()) report(directive.node, "reason");
        }
        // Inline configuration (`/* eslint quotes: 0, paper/raw-color: "off" */`) is the other way to switch a
        // rule off; a paper rule id anywhere among its keys is reported.
        for (const comment of source.getInlineConfigNodes()) {
          const [label, ...config] = comment.value.trim().split(/\s+/);
          if (label === "eslint" && configuresPaper.test(config.join(" "))) report(comment, "paper");
        }
      },
    };
  },
};

// An app stylesheet makes no global name of its own. A globalStyle selector starts from a scoped class (an
// interpolated `${scoped}`), so the rule reaches only what a component names; an element or :root selector
// lives in the manifest's GLOBAL_SELECTOR_FILES. A global keyframes or a global variable is a name made up by
// hand, and has no place at all. Where a selector is built by a call, the rule cannot see its start and passes.
// Does a selector list, written as a template, have a selector that begins with literal text?
const templateStartsWithText = (quasis) => {
  let depth = 0;
  let atStart = true;
  for (const [index, part] of quasis.entries()) {
    for (const char of part.value.cooked ?? "") {
      if (atStart) {
        if (/[\s,]/.test(char)) continue;
        return true;
      }
      if (char === "(") depth += 1;
      else if (char === ")") depth = Math.max(0, depth - 1);
      else if (char === "," && depth === 0) atStart = true;
    }
    // An interpolation that opens a selector is the scoped class itself.
    if (index < quasis.length - 1) atStart = false;
  }
  return false;
};

const startsWithText = (node, resolve) => {
  if (!node) return false;
  switch (node.type) {
    case "Literal": return typeof node.value === "string" && node.value.trim() !== "";
    case "TemplateLiteral": return templateStartsWithText(node.quasis);
    case "BinaryExpression": return node.operator === "+" && startsWithText(node.left, resolve);
    case "Identifier": {
      const init = resolve(node);
      return init !== undefined && startsWithText(init, resolve);
    }
    default: return false;
  }
};

const GLOBAL_NAMES = new Set(["globalKeyframes", "createGlobalVar"]);
const globalClassRule = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      selector: "globalStyle selector는 scoped class에서 시작합니다. 요소 · :root selector는 {{files}}에만 둡니다.",
      name: "전역 이름을 손으로 짓지 않습니다. `{{name}}`은 scoped export로 만드세요.",
    },
  },
  create(context) {
    const file = workspacePath(context.filename);
    const source = context.sourceCode;
    const resolve = (identifier) => {
      let scope = source.getScope(identifier);
      while (scope && !scope.set.has(identifier.name)) scope = scope.upper;
      return scope?.set.get(identifier.name)?.defs.find((def) => def.type === "Variable" && def.node.init)?.node.init;
    };
    const mayName = GLOBAL_SELECTOR_FILES.includes(file);
    return {
      CallExpression(call) {
        const name = call.callee.type === "Identifier" ? call.callee.name : undefined;
        if (name === "globalStyle" && !mayName && startsWithText(call.arguments[0], resolve)) context.report({ node: call.arguments[0], messageId: "selector", data: { files: GLOBAL_SELECTOR_FILES.join(" · ") } });
        else if (GLOBAL_NAMES.has(name) && !mayName) context.report({ node: call, messageId: "name", data: { name } });
      },
    };
  },
};

export default {
  rules: {
    "raw-color": rawColorRule,
    "inline-token": inlineTokenRule,
    "source-isolation": sourceIsolationRule,
    "source-numbers": sourceNumbersRule,
    "layered-styles": layeredStylesRule,
    "internal-class": internalClassRule,
    "global-class": globalClassRule,
    "no-rule-disable": noRuleDisableRule,
  },
};
