// paper/source-numbers — a number lives in a source file. In a style position (the arguments of a vanilla-extract
// call in a .css.ts, a JSX `style` attribute or a `style:` object in a .ts/.tsx) every numeric literal, every
// number with a unit and every easing must be structural (structural.js), or come from a role.
//
// Scope "package" reads every category of structural.js; scope "app" reads all but dimension, because an app
// owns its screen's widths, heights and tracks. Both read media and container queries: a length there is
// interpolated from tokens.layout.breakpoint, never written. Depth (zIndex, boxShadow, filter) is stated only
// in ELEVATION_OWNERS, or as strokeRing(). The app reads no typography palette.
//
// The check follows what the value is made of: template expressions, conditionals, logicals, binaries, call
// arguments, the returns of a mapper, and a same-file const the value names.

import { APP_DIMENSION_MODULES, ELEVATION_OWNERS, PALETTE_INSPECTOR, STROKE_OWNER, inspectSystemOf, workspacePath } from "./manifest.js";
import { categoryOf, isKeyframeSelector, isStructural } from "./structural.js";

const STYLE_CALLS = new Set(["style", "styleVariants", "globalStyle", "keyframes", "globalKeyframes", "createTheme", "createGlobalTheme", "recipe", "fallbackVar"]);
const KEYFRAME_CALLS = new Set(["keyframes", "globalKeyframes"]);
const QUERY_KEYS = new Set(["@media", "@container"]);
const TYPE_WRAPPERS = new Set(["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression", "TSTypeAssertion", "TSInstantiationExpression"]);
const FUNCTIONS = new Set(["ArrowFunctionExpression", "FunctionExpression"]);

const LENGTH = /(?<![\w.#$-])[+-]?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|ch|ex|vh|vw|vmin|vmax|dvh|svh|lvh|dvw|svw|lvw|cm|mm|in|pt|pc)\b/g;
const NUMBER = /(?<![\w.#$-])([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)(%|[a-zA-Z]+)?/g;
// What a depth property may say without a source: no depth at all.
const NO_DEPTH = /^(?:none|auto|0|inherit|initial|unset|revert)$/i;
const EASING = /\b(?:ease(?:-in)?(?:-out)?|linear|step-start|step-end)\b|\b(?:cubic-bezier|steps|linear)\(/;

// The text a number is read from: a variable's name, a quoted string and a url() are not values.
const cleanse = (text) => text
  .replace(/var\(\s*--[\w-]+/g, "var(")
  .replace(/url\([^)]*\)/g, "url()")
  .replace(/"[^"]*"|'[^']*'/g, '""');

const keyName = (property) => {
  if (property.computed) return property.key.type === "Literal" && typeof property.key.value === "string" ? property.key.value : undefined;
  return property.key.name ?? property.key.value;
};

const calleeName = (call) => {
  const callee = call.callee;
  if (callee.type === "Identifier") return callee.name;
  if (callee.type === "MemberExpression" && !callee.computed) return callee.property.name;
  return undefined;
};

export const sourceNumbersRule = {
  meta: {
    type: "problem",
    schema: [{ type: "object", properties: { scope: { enum: ["package", "app"] } }, additionalProperties: false }],
    messages: {
      number: "스타일 자리의 숫자 `{{text}}`는 원본의 값이 아니면 역할에서 고릅니다. 구조 값(0 · 100% · 1fr · 45° 배수 …)만 직접 씁니다.",
      easing: "easing `{{text}}`는 Motion 원본의 값입니다. `transition()`으로 역할을 고르세요.",
      depth: "깊이(zIndex · boxShadow · filter)는 elevation의 소유 파일이나 strokeRing()에서만 나옵니다. `elevationStyle()` 같은 조각을 펼치세요.",
      query: "미디어 쿼리에 길이 `{{text}}`를 쓰지 않습니다. `tokens.layout.breakpoint`를 넣으세요.",
      keyframe: "keyframes 선택자는 0% · 50% · 100%(from · to)입니다. `{{text}}`는 원본의 recipe에서 만듭니다.",
      palette: "앱은 Palette를 읽지 않습니다. Text 역할이나 typographyRule · codeRule · emphasisRule로 고르세요.",
    },
  },
  create(context) {
    const scope = context.options[0]?.scope ?? "package";
    const file = workspacePath(context.filename);
    if (scope === "app" && APP_DIMENSION_MODULES.includes(file)) return {};
    const source = context.sourceCode;
    const isStylesheet = file.endsWith(".css.ts");
    const ownsDepth = ELEVATION_OWNERS.includes(file);
    const reported = new WeakSet();
    const visitors = {};

    const report = (node, messageId, text) => {
      if (reported.has(node)) return;
      reported.add(node);
      context.report({ node, messageId, data: { text } });
    };

    const constantOf = (identifier) => {
      let current = source.getScope(identifier);
      while (current && !current.set.has(identifier.name)) current = current.upper;
      const def = current?.set.get(identifier.name)?.defs.find((entry) => entry.type === "Variable" && entry.node.init);
      return def?.node.init;
    };

    const rootIdentifier = (node) => {
      let current = node;
      while (current.type === "MemberExpression") current = current.object;
      return current.type === "Identifier" ? current : undefined;
    };

    // A number in a string: what precedes it and what it is.
    const readNumbers = (node, text, property) => {
      const category = property ? categoryOf(property) : undefined;
      if (!category || (scope === "app" && category === "dimension")) return;
      const clean = cleanse(text);
      if (category === "motion" && EASING.test(clean)) report(node, "easing", clean.match(EASING)[0]);
      for (const match of clean.matchAll(NUMBER)) {
        const before = clean.slice(0, match.index).trimEnd().at(-1);
        const operator = before === "/" || before === "*" ? before : undefined;
        if (!isStructural({ property, value: Number(match[1]), unit: match[2] ?? "", operator })) report(node, "number", match[0]);
      }
    };

    // ── depth ────────────────────────────────────────────────────────────────

    const isStrokeRing = (node) => node.type === "CallExpression" && node.callee.type === "Identifier" && node.callee.name === STROKE_OWNER.name;
    const stateless = (node, seen) => {
      if (seen.has(node)) return true;
      seen.add(node);
      if (TYPE_WRAPPERS.has(node.type)) return stateless(node.expression, seen);
      switch (node.type) {
        case "Literal": return typeof node.value === "number" ? node.value === 0 : typeof node.value === "string" ? NO_DEPTH.test(node.value.trim()) : true;
        case "TemplateLiteral": return node.expressions.length === 0 && stateless({ type: "Literal", value: node.quasis.map((part) => part.value.cooked ?? "").join("") }, seen);
        case "ConditionalExpression": return stateless(node.consequent, seen) && stateless(node.alternate, seen);
        case "LogicalExpression": return stateless(node.left, seen) && stateless(node.right, seen);
        case "Identifier": {
          if (node.name === "undefined") return true;
          const init = constantOf(node);
          return init !== undefined && stateless(init, seen);
        }
        case "CallExpression": return isStrokeRing(node);
        default: return false;
      }
    };

    // ── scanning a value ─────────────────────────────────────────────────────

    const queryText = (node, seen = new Set()) => {
      if (!node || seen.has(node)) return "";
      seen.add(node);
      if (TYPE_WRAPPERS.has(node.type)) return queryText(node.expression, seen);
      if (node.type === "Literal") return typeof node.value === "string" ? node.value : "";
      if (node.type === "TemplateLiteral") return node.quasis.map((part) => part.value.cooked ?? "").join(" ");
      if (node.type === "BinaryExpression") return `${queryText(node.left, seen)} ${queryText(node.right, seen)}`;
      if (node.type === "Identifier") return queryText(constantOf(node), seen);
      return "";
    };

    const checkQueries = (object, seen) => {
      for (const property of object.properties) {
        if (property.type !== "Property") continue;
        const text = property.key.type === "Literal" && typeof property.key.value === "string" ? property.key.value : queryText(property.computed ? property.key : undefined);
        const found = cleanse(text).match(LENGTH)?.find((length) => Number.parseFloat(length) !== 0);
        if (found) report(property.key, "query", found);
        scan(property.value, undefined, seen);
      }
    };

    // A value picked out of a same-file table: every entry is a candidate for the property that picks it.
    const scanMembers = (table, property, seen) => {
      if (table.type === "ObjectExpression") table.properties.forEach((entry) => scanMembers(entry.type === "SpreadElement" ? entry.argument : entry.value, property, seen));
      else if (table.type === "ArrayExpression") table.elements.forEach((element) => element && scanMembers(element, property, seen));
      else scan(table, property, seen);
    };

    const scan = (node, property, seen) => {
      if (!node || seen.has(node)) return;
      seen.add(node);
      if (TYPE_WRAPPERS.has(node.type)) return scan(node.expression, property, seen);
      switch (node.type) {
        case "Literal":
          if (typeof node.value === "string") readNumbers(node, node.value, property);
          else if (typeof node.value === "number") readNumbers(node, String(node.value), property);
          return;
        case "TemplateLiteral":
          for (const part of node.quasis) readNumbers(part, part.value.cooked ?? "", property);
          node.expressions.forEach((expression) => scan(expression, property, seen));
          return;
        case "Identifier": {
          const init = constantOf(node);
          if (init) scan(init, property, seen);
          return;
        }
        case "MemberExpression": {
          const root = rootIdentifier(node);
          const init = root && constantOf(root);
          if (init) scanMembers(init, property, seen);
          return;
        }
        case "ObjectExpression":
          for (const entry of node.properties) {
            if (entry.type === "SpreadElement") { scan(entry.argument, property, seen); continue; }
            const name = keyName(entry);
            if (entry.computed && name === undefined) scan(entry.key, undefined, seen);
            if (QUERY_KEYS.has(name) && entry.value.type === "ObjectExpression") { checkQueries(entry.value, seen); continue; }
            const own = name === undefined ? undefined : name;
            const category = own ? categoryOf(own) : undefined;
            if (category === "depth" && !ownsDepth && !stateless(entry.value, new Set())) { report(entry.value, "depth"); continue; }
            scan(entry.value, own, seen);
          }
          return;
        case "ArrayExpression":
          node.elements.forEach((element) => scan(element, property, seen));
          return;
        case "SpreadElement": return scan(node.argument, property, seen);
        case "ConditionalExpression": scan(node.consequent, property, seen); return scan(node.alternate, property, seen);
        case "LogicalExpression":
        case "BinaryExpression": scan(node.left, property, seen); return scan(node.right, property, seen);
        case "UnaryExpression": return scan(node.argument, property, seen);
        case "CallExpression":
          if (isStrokeRing(node)) return;
          node.arguments.forEach((argument) => scan(argument, property, seen));
          return;
        case "ArrowFunctionExpression":
        case "FunctionExpression": {
          if (node.body.type !== "BlockStatement") return scan(node.body, property, seen);
          for (const statement of node.body.body) if (statement.type === "ReturnStatement") scan(statement.argument, property, seen);
          return;
        }
        default:
      }
    };

    // ── style positions ──────────────────────────────────────────────────────

    const checkKeyframes = (call) => {
      const frames = call.arguments.find((argument) => argument.type === "ObjectExpression");
      for (const entry of frames?.properties ?? []) {
        const name = entry.type === "Property" ? keyName(entry) : undefined;
        if (name !== undefined && !isKeyframeSelector(name)) report(entry.key, "keyframe", name);
      }
    };

    if (isStylesheet) {
      visitors.CallExpression = (call) => {
        const name = calleeName(call);
        if (!name || !STYLE_CALLS.has(name)) return;
        if (KEYFRAME_CALLS.has(name)) checkKeyframes(call);
        const seen = new Set();
        call.arguments.forEach((argument) => scan(argument, undefined, seen));
      };
    }
    visitors.JSXAttribute = (attribute) => {
      if (attribute.name.name === "style" && attribute.value?.type === "JSXExpressionContainer") scan(attribute.value.expression, undefined, new Set());
    };
    visitors.Property = (entry) => {
      if (entry.computed || entry.parent.type !== "ObjectExpression" || (entry.key.name ?? entry.key.value) !== "style") return;
      scan(entry.value, undefined, new Set());
    };

    if (scope === "app") {
      const typography = inspectSystemOf(file) !== undefined && PALETTE_INSPECTOR.includes(inspectSystemOf(file));
      if (!typography) {
        visitors.MemberExpression = (node) => {
          if (node.computed || node.property.name !== "palette") return;
          const owner = node.object;
          if (owner.type === "MemberExpression" && !owner.computed && owner.property.name === "typography") report(node, "palette");
        };
        // `const { palette } = tokens.typography` and `const { typography: { palette } } = tokens` read it too.
        const names = (pattern, key) => pattern.properties.find((entry) => entry.type === "Property" && !entry.computed && entry.key.name === key);
        visitors.VariableDeclarator = (node) => {
          if (node.id.type !== "ObjectPattern" || !node.init) return;
          const { init } = node;
          const isTypography = init.type === "MemberExpression" && !init.computed && init.property.name === "typography";
          if (isTypography && names(node.id, "palette")) report(node, "palette");
          const nested = names(node.id, "typography");
          if (nested?.value.type === "ObjectPattern" && names(nested.value, "palette")) report(node, "palette");
        };
      }
    }

    return visitors;
  },
};
