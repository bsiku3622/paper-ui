// paper/source-numbers — a number lives in a source file. In a style position (the arguments of a vanilla-extract
// call in a .css.ts, a JSX `style` attribute, a `style:` object or a DOM style write in a .ts/.tsx) every numeric
// literal, every number with a unit and every easing must be structural (structural.js), or come from a role. Every
// property is read, whether or not a category names it, and so is a custom property's value under `vars`.
//
// Scope "package" reads every category of structural.js, and also takes an object literal keyed by style properties
// for a style position wherever it is written: a fragment in a plain module can be spread into a stylesheet from
// there. Scope "app" reads all but dimension, because an app owns its screen's widths, heights and tracks. Both read
// media and container queries: a length there is interpolated from tokens.layout.breakpoint or from an
// APP_DIMENSION_MODULES import, never written, and a key the rule cannot read is reported. Depth (zIndex, boxShadow,
// filter) is stated only in ELEVATION_OWNERS, or as strokeRing(). The app reads no typography palette.
//
// The check follows what the value is made of: template expressions, conditionals, logicals, binaries, call
// arguments, the returns of a mapper, a same-file function with what it is called with, and a same-file const the
// value names.

import { APP_DIMENSION_MODULES, ELEVATION_OWNERS, PACKAGE_NAME, STROKE_OWNER, TOKEN_LAYER, isInside, resolveRelative, workspacePath } from "./manifest.js";
import { categoryOf, isKeyframeSelector, isStructural, isStyleProperty, isUnit } from "./structural.js";

const STYLE_CALLS = new Set(["style", "styleVariants", "globalStyle", "keyframes", "globalKeyframes", "createTheme", "createGlobalTheme", "recipe", "fallbackVar"]);
const KEYFRAME_CALLS = new Set(["keyframes", "globalKeyframes"]);
const QUERY_KEYS = new Set(["@media", "@container"]);
const TYPE_WRAPPERS = new Set(["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression", "TSTypeAssertion", "TSInstantiationExpression", "ChainExpression"]);
const FUNCTIONS = new Set(["ArrowFunctionExpression", "FunctionExpression", "FunctionDeclaration"]);
const DIMENSION_MODULES = APP_DIMENSION_MODULES.map((module) => module.replace(/\.tsx?$/, ""));

// What a value is read as when no property names it: an argument of a function the rule cannot read, and a custom
// property named by an expression. Neither has a category, so only the numbers that are structural anywhere pass.
const ARGUMENT = "(argument)";
const CUSTOM_PROPERTY = "--(computed)";
// Keys whose value is rules under selectors or conditions: text there names what a rule applies to and is not a value.
const RULE_BLOCKS = new Set(["selectors", "@supports", "@layer"]);

const LENGTH = /(?<![\w.#$-])[+-]?(?:\d+\.?\d*|\.\d+)(?:px|r?em|r?ex|r?ch|r?lh|cap|r?ic|[sdl]?v[hwib]|[sdl]?vmin|[sdl]?vmax|cq[hwib]|cqmin|cqmax|cm|mm|q|in|pt|pc)\b/gi;
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
  return String(property.key.name ?? property.key.value);
};

const calleeName = (call) => {
  const callee = call.callee;
  if (callee.type === "Identifier") return callee.name;
  if (callee.type === "MemberExpression" && !callee.computed) return callee.property.name;
  return undefined;
};

// ── same-file values ─────────────────────────────────────────────────────────

const variableOf = (source, identifier) => {
  let scope = source.getScope(identifier);
  while (scope && !scope.set.has(identifier.name)) scope = scope.upper;
  return scope?.set.get(identifier.name);
};

// What a same-file name can hold: its initialiser, what is assigned to it later, and the function it declares.
export const heldBy = (source, identifier) => {
  const variable = variableOf(source, identifier);
  if (!variable) return [];
  const written = variable.references.flatMap((reference) => (reference.writeExpr ? [reference.writeExpr] : []));
  const declared = variable.defs.flatMap((def) => (def.type === "FunctionName" ? [def.node] : []));
  return [...new Set([...written, ...declared])];
};

// What a function can return: its expression body, or every `return` in its own body.
export const returnsOf = (source, fn) => {
  if (fn.body?.type !== "BlockStatement") return fn.body ? [fn.body] : [];
  const found = [];
  const walk = (node) => {
    if (!node || FUNCTIONS.has(node.type)) return;
    if (node.type === "ReturnStatement") {
      if (node.argument) found.push(node.argument);
      return;
    }
    for (const key of source.visitorKeys[node.type] ?? []) {
      const child = node[key];
      if (Array.isArray(child)) child.forEach(walk);
      else walk(child);
    }
  };
  fn.body.body.forEach(walk);
  return found;
};

// The same-file function a call runs, if it can be read.
export const calledFunction = (source, call) => (call.callee.type === "Identifier" ? heldBy(source, call.callee).find((held) => FUNCTIONS.has(held.type)) : undefined);

// The object and array literals a value can be, by way of same-file names and tables.
const tablesOf = (source, node, seen = new Set()) => {
  if (!node || seen.has(node)) return [];
  seen.add(node);
  if (TYPE_WRAPPERS.has(node.type)) return tablesOf(source, node.expression, seen);
  switch (node.type) {
    case "ObjectExpression":
    case "ArrayExpression": return [node];
    case "Identifier": return heldBy(source, node).flatMap((held) => tablesOf(source, held, seen));
    case "MemberExpression": return picked(source, node, seen).flatMap((value) => tablesOf(source, value, seen));
    case "ConditionalExpression": return [node.consequent, node.alternate].flatMap((branch) => tablesOf(source, branch, seen));
    case "LogicalExpression": return [node.left, node.right].flatMap((branch) => tablesOf(source, branch, seen));
    default: return [];
  }
};

// What a member expression can pick out of a same-file table: the named entry, or every entry when the name is
// computed or the table does not write it.
export const picked = (source, member, seen = new Set()) => {
  const key = member.computed ? (member.property.type === "Literal" ? String(member.property.value) : undefined) : member.property.name;
  return tablesOf(source, member.object, seen).flatMap((table) => {
    if (table.type === "ArrayExpression") {
      const element = key === undefined ? undefined : table.elements[Number(key)];
      return element ? [element] : table.elements.filter(Boolean);
    }
    const named = key === undefined ? [] : table.properties.filter((entry) => entry.type === "Property" && keyName(entry) === key);
    if (named.length > 0) return named.map((entry) => entry.value);
    return table.properties.map((entry) => (entry.type === "SpreadElement" ? entry.argument : entry.value));
  });
};

// Does this expression name a style declaration: `el.style`, or a name that holds it?
export const isStyleDeclaration = (source, node) => {
  if (TYPE_WRAPPERS.has(node.type)) return isStyleDeclaration(source, node.expression);
  if (node.type === "MemberExpression") return !node.computed ? node.property.name === "style" : node.property.value === "style";
  if (node.type !== "Identifier") return false;
  if (node.name === "style") return true;
  const destructured = variableOf(source, node)?.defs.some((def) => def.type === "Variable" && def.node.id.type === "ObjectPattern"
    && def.node.id.properties.some((entry) => entry.type === "Property" && keyName(entry) === "style" && entry.value.name === node.name));
  return destructured || heldBy(source, node).some((held) => held.type === "MemberExpression" && isStyleDeclaration(source, held));
};

const rootOf = (node) => {
  let current = node;
  while (current.type === "MemberExpression" || TYPE_WRAPPERS.has(current.type)) current = current.type === "MemberExpression" ? current.object : current.expression;
  return current;
};

// The names a parameter or a destructuring pattern binds.
const patternNames = (pattern) => {
  switch (pattern?.type) {
    case "Identifier": return [pattern.name];
    case "AssignmentPattern": return patternNames(pattern.left);
    case "RestElement": return patternNames(pattern.argument);
    case "ArrayPattern": return pattern.elements.flatMap(patternNames);
    case "ObjectPattern": return pattern.properties.flatMap((entry) => patternNames(entry.type === "RestElement" ? entry.argument : entry.value));
    default: return [];
  }
};

// The keys a destructuring pattern walks to reach a name.
const patternPath = (pattern, name) => {
  if (pattern.type === "Identifier") return pattern.name === name ? [] : undefined;
  if (pattern.type !== "ObjectPattern") return undefined;
  for (const entry of pattern.properties) {
    if (entry.type !== "Property") continue;
    const rest = patternPath(entry.value, name);
    if (rest) return [keyName(entry) ?? "*", ...rest];
  }
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
      queryUnread: "미디어 쿼리 `{{text}}`를 읽을 수 없습니다. 같은 파일에서 `tokens.layout.breakpoint`로 적으세요.",
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

    // A number in a string: what precedes it and what it is. A key with no name to read it by is not a value.
    const readNumbers = (node, text, property) => {
      if (property === undefined || RULE_BLOCKS.has(property)) return;
      const category = categoryOf(property);
      if (scope === "app" && category === "dimension") return;
      const clean = cleanse(text);
      if ((category === "motion" || property.startsWith("--")) && EASING.test(clean)) report(node, "easing", clean.match(EASING)[0]);
      for (const match of clean.matchAll(NUMBER)) {
        const unit = match[2] ?? "";
        // `2xl` is a scale's name, not a number with a unit.
        if (unit !== "" && !isUnit(unit)) continue;
        const before = clean.slice(0, match.index).trimEnd().at(-1);
        const operator = before === "/" || before === "*" ? before : undefined;
        if (!isStructural({ property, value: Number(match[1]), unit, operator })) report(node, "number", match[0]);
      }
    };

    // A value is read once for each property that reads it: the same const can be a width and a padding.
    const firstRead = (seen, node, property) => {
      const properties = seen.get(node) ?? new Set();
      if (properties.has(property)) return false;
      seen.set(node, properties.add(property));
      return true;
    };

    // ── what a same-file function is called with ─────────────────────────────

    // While a function's body is read, its parameters stand for the arguments of the call.
    const bindings = new Map();
    const applying = new Set();
    const apply = (fn, args, read, { table = false } = {}) => {
      if (applying.has(fn)) return;
      applying.add(fn);
      const names = source.scopeManager.acquire(fn, true);
      const bound = [];
      fn.params.forEach((param, index) => {
        const given = param.type === "RestElement" ? args.slice(index) : args.slice(index, index + 1);
        const whole = !table && (param.type === "Identifier" || param.type === "RestElement" || (param.type === "AssignmentPattern" && param.left.type === "Identifier"));
        for (const name of patternNames(param)) {
          const variable = names?.set.get(name);
          if (!variable) continue;
          bindings.set(variable, { given, whole });
          bound.push(variable);
        }
      });
      returnsOf(source, fn).forEach(read);
      bound.forEach((variable) => bindings.delete(variable));
      applying.delete(fn);
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
          const held = heldBy(source, node);
          return held.length > 0 && held.every((value) => stateless(value, seen));
        }
        case "CallExpression": return isStrokeRing(node);
        default: return false;
      }
    };

    // ── media and container queries ──────────────────────────────────────────

    const isTokensImport = (def) => {
      const specifier = def.parent.source.value;
      const imported = def.node.imported?.name ?? def.node.imported?.value;
      if (imported !== "tokens") return false;
      return specifier === `${PACKAGE_NAME}/tokens` || isInside(resolveRelative(file, specifier) ?? "", TOKEN_LAYER);
    };

    // The path under `tokens` a value reads, through same-file aliases; undefined when it reads something else.
    const tokenPath = (node, seen = new Set()) => {
      if (seen.has(node)) return undefined;
      seen.add(node);
      if (TYPE_WRAPPERS.has(node.type)) return tokenPath(node.expression, seen);
      if (node.type === "MemberExpression") {
        const base = tokenPath(node.object, seen);
        if (!base) return undefined;
        const key = node.computed ? (node.property.type === "Literal" ? String(node.property.value) : "*") : node.property.name;
        return [...base, key];
      }
      if (node.type !== "Identifier") return undefined;
      const def = variableOf(source, node)?.defs[0];
      if (def?.type === "ImportBinding") return isTokensImport(def) ? [] : undefined;
      if (def?.type !== "Variable" || !def.node.init) return undefined;
      const base = tokenPath(def.node.init, seen);
      const inner = patternPath(def.node.id, node.name);
      return base && inner ? [...base, ...inner] : undefined;
    };

    const isDimensionImport = (node) => {
      const root = rootOf(node);
      if (root.type !== "Identifier") return false;
      return variableOf(source, root)?.defs.some((def) => def.type === "ImportBinding" && DIMENSION_MODULES.includes(resolveRelative(file, def.parent.source.value))) ?? false;
    };

    const lengthIn = (text, at) => {
      const found = cleanse(text).match(LENGTH)?.find((length) => Number.parseFloat(length) !== 0);
      if (found) report(at, "query", found);
    };

    // What a query is made of, down to its text and its names. A name that comes from tokens.layout.breakpoint or a
    // declared dimension module says nothing more; anything else that cannot be read is reported at the key.
    const checkQuery = (node, at, seen) => {
      if (!node || seen.has(node)) return;
      seen.add(node);
      if (TYPE_WRAPPERS.has(node.type)) return checkQuery(node.expression, at, seen);
      const unread = () => report(at, "queryUnread", source.getText(node));
      switch (node.type) {
        case "Literal":
          if (typeof node.value === "string") lengthIn(node.value, at);
          else if (typeof node.value === "number" && node.value !== 0) report(at, "query", String(node.value));
          return;
        case "TemplateLiteral":
          node.quasis.forEach((part) => lengthIn(part.value.cooked ?? "", at));
          node.expressions.forEach((expression) => checkQuery(expression, at, seen));
          return;
        case "BinaryExpression":
        case "LogicalExpression":
          checkQuery(node.left, at, seen);
          return checkQuery(node.right, at, seen);
        case "ConditionalExpression":
          checkQuery(node.consequent, at, seen);
          return checkQuery(node.alternate, at, seen);
        case "ObjectExpression":
          return node.properties.forEach((entry) => checkQuery(entry.type === "SpreadElement" ? entry.argument : entry.value, at, seen));
        case "Identifier":
        case "MemberExpression": {
          const path = tokenPath(node);
          if (path) return path[0] === "layout" && path[1] === "breakpoint" ? undefined : unread();
          if (isDimensionImport(node)) return;
          const root = rootOf(node);
          const bound = root.type === "Identifier" ? bindings.get(variableOf(source, root)) : undefined;
          if (bound) return bound.given.forEach((given) => checkQuery(given, at, seen));
          const values = node.type === "Identifier" ? heldBy(source, node) : picked(source, node);
          if (values.length === 0) return unread();
          return values.forEach((value) => checkQuery(value, at, seen));
        }
        case "CallExpression": {
          const fn = calledFunction(source, node);
          if (fn) return apply(fn, node.arguments, (value) => checkQuery(value, at, new Set()));
          return isDimensionImport(node.callee) ? undefined : unread();
        }
        default:
          return unread();
      }
    };

    const checkQueryBlock = (node, seen) => {
      if (!node || !firstRead(seen, node, "@media")) return;
      if (TYPE_WRAPPERS.has(node.type)) return checkQueryBlock(node.expression, seen);
      switch (node.type) {
        case "ObjectExpression":
          for (const entry of node.properties) {
            if (entry.type === "SpreadElement") { checkQueryBlock(entry.argument, seen); continue; }
            if (entry.computed) checkQuery(entry.key, entry.key, new Set());
            else if (entry.key.type === "Literal" && typeof entry.key.value === "string") lengthIn(entry.key.value, entry.key);
            scan(entry.value, undefined, seen);
          }
          return;
        case "ConditionalExpression":
          checkQueryBlock(node.consequent, seen);
          return checkQueryBlock(node.alternate, seen);
        case "LogicalExpression":
          if (node.operator !== "&&") checkQueryBlock(node.left, seen);
          return checkQueryBlock(node.right, seen);
        case "Literal":
          return;
        case "Identifier": {
          if (node.name === "undefined") return;
          const held = heldBy(source, node);
          if (held.length === 0) return report(node, "queryUnread", source.getText(node));
          return held.forEach((value) => checkQueryBlock(value, seen));
        }
        default:
          return report(node, "queryUnread", source.getText(node));
      }
    };

    // ── scanning a value ─────────────────────────────────────────────────────

    // A value picked out of a same-file table: every entry is a candidate for the property that picks it. With no
    // property the picked value is a rule of its own.
    const scanMembers = (table, property, seen) => {
      if (property === undefined) return scan(table, undefined, seen);
      if (TYPE_WRAPPERS.has(table.type)) return scanMembers(table.expression, property, seen);
      if (table.type === "ObjectExpression") table.properties.forEach((entry) => scanMembers(entry.type === "SpreadElement" ? entry.argument : entry.value, property, seen));
      else if (table.type === "ArrayExpression") table.elements.forEach((element) => element && scanMembers(element, property, seen));
      else if (table.type !== "Identifier") scan(table, property, seen);
      else if (firstRead(seen, table, property)) heldBy(source, table).forEach((held) => scanMembers(held, property, seen));
    };

    // An app may keep one of its own dimensions in a variable: one that a same-file rule reads as a dimension holds one.
    const readAsDimension = (key) => {
      if (key.type !== "Identifier") return false;
      return variableOf(source, key)?.references.some((reference) => {
        for (let at = reference.identifier, up = at.parent; up; at = up, up = up.parent) {
          if (up.type === "Property") return up.value === at && categoryOf(keyName(up) ?? "") === "dimension";
        }
        return false;
      }) ?? false;
    };

    const scanEntry = (entry, seen) => {
      if (entry.type === "SpreadElement") return scan(entry.argument, undefined, seen);
      const name = keyName(entry);
      if (QUERY_KEYS.has(name)) return checkQueryBlock(entry.value, seen);
      if (scope === "app" && name === undefined && readAsDimension(entry.key)) return;
      const own = name ?? CUSTOM_PROPERTY;
      if (categoryOf(own) === "depth" && !ownsDepth && !stateless(entry.value, new Set())) return report(entry.value, "depth");
      scan(entry.value, own, seen);
    };

    const scan = (node, property, seen) => {
      if (!node || !firstRead(seen, node, property)) return;
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
          const variable = variableOf(source, node);
          const bound = bindings.get(variable);
          if (bound) bound.given.forEach((given) => (bound.whole ? scan(given, property, seen) : scanMembers(given, property, seen)));
          const destructured = variable?.defs.some((def) => def.type === "Variable" && def.node.id.type !== "Identifier");
          heldBy(source, node).forEach((held) => (destructured ? scanMembers(held, property, seen) : scan(held, property, seen)));
          return;
        }
        case "MemberExpression": {
          const root = rootOf(node);
          if (root.type !== "Identifier") return scanMembers(root, property, seen);
          bindings.get(variableOf(source, root))?.given.forEach((given) => scanMembers(given, property, seen));
          const values = picked(source, node);
          (values.length > 0 ? values : heldBy(source, root)).forEach((value) => scanMembers(value, property, seen));
          return;
        }
        case "ObjectExpression":
          node.properties.forEach((entry) => scanEntry(entry, seen));
          return;
        case "ArrayExpression":
          node.elements.forEach((element) => scan(element, property, seen));
          return;
        case "SpreadElement": return scan(node.argument, property, seen);
        case "ConditionalExpression": scan(node.consequent, property, seen); return scan(node.alternate, property, seen);
        case "LogicalExpression":
        case "BinaryExpression": scan(node.left, property, seen); return scan(node.right, property, seen);
        case "UnaryExpression": return scan(node.argument, property, seen);
        case "CallExpression": {
          if (isStrokeRing(node)) return;
          const fn = calledFunction(source, node);
          if (fn && !applying.has(fn)) return apply(fn, node.arguments, (value) => scan(value, property, new Map()));
          // A function the rule cannot read: what goes in may be what comes out.
          const value = property ?? ARGUMENT;
          node.arguments.forEach((argument) => scan(argument, value, seen));
          scan(node.callee.type === "MemberExpression" ? node.callee.object : node.callee, value, seen);
          return;
        }
        case "ArrowFunctionExpression":
        case "FunctionExpression":
        case "FunctionDeclaration":
          returnsOf(source, node).forEach((value) => scan(value, property, seen));
          return;
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

    const scanStyleCall = (call, name) => {
      if (KEYFRAME_CALLS.has(name)) checkKeyframes(call);
      const [first, second] = call.arguments;
      // A mapper's parameter is an entry of the table it is given; a table entry it does not read is not a value.
      if (name === "styleVariants" && second) {
        const mapper = second.type === "Identifier" ? heldBy(source, second).find((held) => FUNCTIONS.has(held.type)) : second;
        if (FUNCTIONS.has(mapper?.type)) return apply(mapper, [first], (value) => scan(value, undefined, new Map()), { table: true });
      }
      const seen = new Map();
      // A selector is not a value.
      (name === "globalStyle" ? call.arguments.slice(1) : call.arguments).forEach((argument) => scan(argument, undefined, seen));
    };

    // A function that returns a fragment takes its numbers from its callers.
    const isFragment = (node, seen = new Set()) => {
      if (seen.has(node)) return false;
      seen.add(node);
      if (TYPE_WRAPPERS.has(node.type)) return isFragment(node.expression, seen);
      if (node.type === "Identifier") return heldBy(source, node).some((held) => isFragment(held, seen));
      return node.type === "ObjectExpression" && node.properties.some((entry) => entry.type === "Property" && isStyleProperty(keyName(entry) ?? ""));
    };

    visitors.CallExpression = (call) => {
      const name = calleeName(call);
      if (isStylesheet && name && STYLE_CALLS.has(name)) scanStyleCall(call, name);
      // `el.style.setProperty("width", value)`
      if (name === "setProperty" && call.callee.type === "MemberExpression" && isStyleDeclaration(source, call.callee.object)) {
        const [property, value] = call.arguments;
        scan(value, property?.type === "Literal" && typeof property.value === "string" ? property.value : CUSTOM_PROPERTY, new Map());
      }
      if (scope === "package") {
        const fn = calledFunction(source, call);
        if (fn && returnsOf(source, fn).some((value) => isFragment(value))) apply(fn, call.arguments, (value) => scan(value, undefined, new Map()));
      }
    };
    visitors.JSXAttribute = (attribute) => {
      if (attribute.name.name === "style" && attribute.value?.type === "JSXExpressionContainer") scan(attribute.value.expression, undefined, new Map());
    };
    visitors.Property = (entry) => {
      if (entry.computed || entry.parent.type !== "ObjectExpression" || (entry.key.name ?? entry.key.value) !== "style") return;
      scan(entry.value, undefined, new Map());
    };
    // `el.style.width = value`, and the whole declaration as text.
    visitors.AssignmentExpression = (node) => {
      const { left } = node;
      if (left.type !== "MemberExpression") return;
      const name = left.computed ? (left.property.type === "Literal" ? String(left.property.value) : CUSTOM_PROPERTY) : left.property.name;
      if (isStyleDeclaration(source, left.object) || isStyleDeclaration(source, left)) scan(node.right, name, new Map());
    };

    if (scope === "package") {
      // A fragment: an entry keyed by a style property is a style value in any file.
      visitors.ObjectExpression = (object) => {
        for (const entry of object.properties) {
          // A function under such a key is an option, not a value.
          if (entry.type === "Property" && isStyleProperty(keyName(entry) ?? "") && !FUNCTIONS.has(entry.value.type)) scanEntry(entry, new Map());
        }
      };
    }

    if (scope === "app") {
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

    return visitors;
  },
};
