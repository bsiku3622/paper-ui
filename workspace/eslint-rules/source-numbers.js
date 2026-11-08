import { APP_DIMENSION_MODULES, ELEVATION_OWNERS, LINE_OWNERS, PACKAGE_NAME, STROKE_OWNER, TOKEN_LAYER, isInside, resolveRelative, workspacePath } from "./manifest.js";
import { categoryOf, isKeyframeSelector, isStructural, isStyleProperty, isUnit } from "./structural.js";

export const STYLE_CALLS = new Set(["style", "styleVariants", "globalStyle", "keyframes", "globalKeyframes", "createTheme", "createGlobalTheme", "recipe", "fallbackVar"]);
const KEYFRAME_CALLS = new Set(["keyframes", "globalKeyframes"]);
const QUERY_KEYS = new Set(["@media", "@container"]);
const TYPE_WRAPPERS = new Set(["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression", "TSTypeAssertion", "TSInstantiationExpression", "ChainExpression"]);
const FUNCTIONS = new Set(["ArrowFunctionExpression", "FunctionExpression", "FunctionDeclaration"]);
const ARRAY_CALLBACKS = new Set(["map", "flatMap", "forEach"]);
const FUNCTION_WRAPPERS = new Set(["forwardRef", "memo", "useCallback"]);
const DIMENSION_MODULES = APP_DIMENSION_MODULES.map((module) => module.replace(/\.tsx?$/, ""));

const ARGUMENT = "(argument)";
const CUSTOM_PROPERTY = "--(computed)";
const RULE_BLOCKS = new Set(["selectors", "@supports", "@layer"]);

const LENGTH = /(?<![\w.#$-])[+-]?(?:\d+\.?\d*|\.\d+)(?:px|r?em|r?ex|r?ch|r?lh|cap|r?ic|[sdl]?v[hwib]|[sdl]?vmin|[sdl]?vmax|cq[hwib]|cqmin|cqmax|cm|mm|q|in|pt|pc)\b/gi;
const NUMBER = /(?<![\w.#$-])([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)(%|[a-zA-Z]+)?/g;
const NO_DEPTH = /^(?:none|auto|0|inherit|initial|unset|revert)$/i;
const LINE_PROPERTY = /^border(?:Top|Right|Bottom|Left|Block|Inline|BlockStart|BlockEnd|InlineStart|InlineEnd)?(?:Width|Style)?$/;
const EASING = /\b(?:ease(?:-in)?(?:-out)?|linear|step-start|step-end)\b|\b(?:cubic-bezier|steps|linear)\(/;

const cleanse = (text) => text
  .replace(/var\(\s*--[\w-]+/g, "var(")
  .replace(/url\([^)]*\)/g, "url()")
  .replace(/"[^"]*"|'[^']*'/g, '""');

const keyName = (property) => {
  if (property.computed) return property.key.type === "Literal" && typeof property.key.value === "string" ? property.key.value : undefined;
  return String(property.key.name ?? property.key.value);
};

export const variableOf = (source, identifier) => {
  let scope = source.getScope(identifier);
  while (scope && !scope.set.has(identifier.name)) scope = scope.upper;
  return scope?.set.get(identifier.name);
};

export const calleeName = (source, call) => {
  const { callee } = call;
  if (callee.type === "MemberExpression" && !callee.computed) return callee.property.name;
  if (callee.type !== "Identifier") return undefined;
  const def = variableOf(source, callee)?.defs[0];
  const imported = def?.type === "ImportBinding" ? def.node.imported : undefined;
  return imported?.name ?? imported?.value ?? callee.name;
};

export const heldBy = (source, identifier) => {
  const variable = variableOf(source, identifier);
  if (!variable) return [];
  const written = variable.references.flatMap((reference) => (reference.writeExpr ? [reference.writeExpr] : []));
  const declared = variable.defs.flatMap((def) => (def.type === "FunctionName" ? [def.node] : []));
  return [...new Set([...written, ...declared])];
};

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

export const calledFunction = (source, call) => (call.callee.type === "Identifier" ? heldBy(source, call.callee).find((held) => FUNCTIONS.has(held.type)) : undefined);

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

const entriesOf = (table, key) => {
  if (table.type === "ArrayExpression") {
    const element = key === undefined ? undefined : table.elements[Number(key)];
    const elements = element ? [element] : table.elements.filter(Boolean);
    return elements.map((entry) => (entry.type === "SpreadElement" ? entry.argument : entry));
  }
  const named = key === undefined ? [] : table.properties.filter((entry) => entry.type === "Property" && keyName(entry) === key);
  if (named.length > 0) return named.map((entry) => entry.value);
  return table.properties.map((entry) => (entry.type === "SpreadElement" ? entry.argument : entry.value));
};

const memberKey = (member) => (member.computed ? (member.property.type === "Literal" ? String(member.property.value) : undefined) : member.property.name);

export const picked = (source, member, seen = new Set()) => tablesOf(source, member.object, seen).flatMap((table) => entriesOf(table, memberKey(member)));

const isStyleDeclaration = (source, node) => {
  if (TYPE_WRAPPERS.has(node.type)) return isStyleDeclaration(source, node.expression);
  if (node.type === "MemberExpression") return !node.computed ? node.property.name === "style" : node.property.value === "style";
  if (node.type !== "Identifier") return false;
  if (node.name === "style") return true;
  const destructured = variableOf(source, node)?.defs.some((def) => def.type === "Variable" && def.node.id.type === "ObjectPattern"
    && def.node.id.properties.some((entry) => entry.type === "Property" && keyName(entry) === "style" && entry.value.name === node.name));
  return destructured || heldBy(source, node).some((held) => held.type === "MemberExpression" && isStyleDeclaration(source, held));
};

export const rootOf = (node) => {
  let current = node;
  while (current.type === "MemberExpression" || TYPE_WRAPPERS.has(current.type)) current = current.type === "MemberExpression" ? current.object : current.expression;
  return current;
};

export const memberKeys = (node) => {
  const keys = [];
  for (let at = node; at.type === "MemberExpression" || TYPE_WRAPPERS.has(at.type); at = at.type === "MemberExpression" ? at.object : at.expression) {
    if (at.type === "MemberExpression") keys.unshift(memberKey(at));
  }
  return keys;
};

export const patternPath = (pattern, name) => {
  switch (pattern?.type) {
    case "Identifier": return pattern.name === name ? [] : undefined;
    case "AssignmentPattern": return patternPath(pattern.left, name);
    case "RestElement": return patternPath(pattern.argument, name);
    case "ArrayPattern":
      for (const [index, element] of pattern.elements.entries()) {
        const rest = patternPath(element, name);
        if (rest) return [String(index), ...rest];
      }
      return undefined;
    case "ObjectPattern":
      for (const entry of pattern.properties) {
        const rest = patternPath(entry.type === "Property" ? entry.value : entry, name);
        if (rest) return entry.type === "Property" ? [keyName(entry), ...rest] : rest;
      }
      return undefined;
    default: return undefined;
  }
};

export const domStyleWrites = (source, node) => {
  if (node.type === "AssignmentExpression") {
    const { left, right } = node;
    if (left.type !== "MemberExpression") return [];
    if (isStyleDeclaration(source, left.object)) return [{ property: memberKey(left), value: right }];
    return isStyleDeclaration(source, left) ? [{ property: "cssText", value: right }] : [];
  }
  const { callee } = node;
  if (callee.type !== "MemberExpression" || callee.computed) return [];
  const [first, second] = node.arguments;
  switch (callee.property.name) {
    case "setProperty":
      if (!isStyleDeclaration(source, callee.object)) return [];
      return first?.type === "Literal" ? [{ property: String(first.value), value: second }] : [{ value: first }, { value: second }];
    case "assign":
      return callee.object.name === "Object" && first && isStyleDeclaration(source, first) ? node.arguments.slice(1).map((value) => ({ value })) : [];
    case "setAttribute":
      return first?.type === "Literal" && first.value === "style" ? [{ property: "cssText", value: second }] : [];
    default:
      return [];
  }
};

const nameOfFunction = (source, fn) => {
  if (fn.type === "FunctionDeclaration") return fn.id ? variableOf(source, fn.id) : undefined;
  let at = fn;
  while (TYPE_WRAPPERS.has(at.parent?.type) || (at.parent?.type === "CallExpression" && at.parent.arguments[0] === at && FUNCTION_WRAPPERS.has(calleeName(source, at.parent)))) at = at.parent;
  const declarator = at.parent;
  return declarator?.type === "VariableDeclarator" && declarator.init === at && declarator.id.type === "Identifier" ? variableOf(source, declarator.id) : undefined;
};

const elementsOf = (source, node) => {
  const tables = tablesOf(source, node);
  return tables.length > 0 ? tables.flatMap((table) => entriesOf(table)) : [node];
};

const readKeys = (source, value, keys, seen) => {
  if (keys.length === 0) return [value];
  const tables = tablesOf(source, value);
  if (tables.length > 0) return tables.flatMap((table) => entriesOf(table, keys[0])).flatMap((entry) => readKeys(source, entry, keys.slice(1), seen));
  const root = rootOf(value);
  const variable = root.type === "Identifier" ? variableOf(source, root) : undefined;
  if (variable?.defs.some((def) => def.type === "Parameter")) return givenTo(source, variable, [...memberKeys(value), ...keys], seen);
  return [value];
};

export const givenTo = (source, variable, keys = [], seen = new Set()) => {
  const def = variable?.defs.find((entry) => entry.type === "Parameter");
  if (!def || seen.has(variable)) return [];
  seen.add(variable);
  const fn = def.node;
  const index = fn.params.findIndex((param) => patternPath(param, variable.name) !== undefined);
  if (index < 0) return [];
  const param = fn.params[index];
  const path = [...patternPath(param, variable.name), ...keys];
  const read = (value, at = path) => readKeys(source, value, at, seen);

  const fromCall = (call) => {
    const spreads = call.arguments.slice(0, index + 1).filter((argument) => argument.type === "SpreadElement");
    const given = (param.type === "RestElement" ? call.arguments.slice(index) : call.arguments.slice(index, index + 1)).filter((argument) => argument.type !== "SpreadElement");
    return [...given.flatMap((value) => read(value)), ...spreads.flatMap((spread) => elementsOf(source, spread.argument).flatMap((value) => read(value)))];
  };
  const fromElement = (element) => {
    if (index !== 0) return [];
    const [key, ...rest] = path;
    return element.attributes.flatMap((attribute) => {
      if (attribute.type === "JSXSpreadAttribute") return read(attribute.argument);
      if (key !== undefined && attribute.name.name !== key) return [];
      const value = attribute.value?.type === "JSXExpressionContainer" ? attribute.value.expression : attribute.value;
      return value ? read(value, rest) : [];
    });
  };
  const fromCallback = (call, at) => {
    if (index !== 0) return [];
    const name = calleeName(source, call);
    if (name === "styleVariants" && call.arguments[1] === at) return elementsOf(source, call.arguments[0]).flatMap((value) => read(value));
    if (!ARRAY_CALLBACKS.has(name) || call.arguments[0] !== at || call.callee.type !== "MemberExpression") return [];
    const over = call.callee.object;
    const ofObject = over.type === "CallExpression" && over.callee.type === "MemberExpression" && over.callee.object.name === "Object" ? over.callee.property.name : undefined;
    if (ofObject === "keys" || (ofObject === "entries" && path[0] === "0")) return [];
    if (ofObject !== "values" && ofObject !== "entries") return elementsOf(source, over).flatMap((value) => read(value));
    return elementsOf(source, over.arguments[0]).flatMap((value) => read(value, ofObject === "entries" ? path.slice(1) : path));
  };
  const fromName = (named, visited = new Set()) => {
    if (!named || visited.has(named)) return [];
    visited.add(named);
    return named.references.flatMap((reference) => {
      let at = reference.identifier;
      while (TYPE_WRAPPERS.has(at.parent?.type) || at.parent?.type === "ConditionalExpression" || at.parent?.type === "LogicalExpression") at = at.parent;
      const up = at.parent;
      if (up?.type === "CallExpression") return up.callee === at ? fromCall(up) : up.arguments.includes(at) ? fromCallback(up, at) : [];
      if (up?.type === "JSXOpeningElement") return fromElement(up);
      return up?.type === "VariableDeclarator" && up.init === at && up.id.type === "Identifier" ? fromName(variableOf(source, up.id), visited) : [];
    });
  };
  return [...(fn.parent?.type === "CallExpression" && fn.parent.arguments.includes(fn) ? fromCallback(fn.parent, fn) : []), ...fromName(nameOfFunction(source, fn))];
};

export const sourceNumbersRule = {
  meta: {
    type: "problem",
    schema: [{ type: "object", properties: { scope: { enum: ["package", "app"] } }, additionalProperties: false }],
    messages: {
      number: "스타일 자리의 숫자 `{{text}}`는 원본의 값이 아니면 역할에서 고릅니다. 구조 값(0 · 100% · 1fr · 45° 배수 …)만 직접 씁니다.",
      easing: "easing `{{text}}`는 Motion 원본의 값입니다. `transition()`으로 역할을 고르세요.",
      depth: "깊이(zIndex · boxShadow · filter)는 elevation의 소유 파일이나 strokeRing()에서만 나옵니다. `elevationStyle()` 같은 조각을 펼치세요.",
      line: "선의 두께와 모양은 손으로 쓰지 않습니다. `lineRule()`이나 `lineFrame()`을 펼치세요. 지울 때만 0이나 none을 씁니다.",
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
    const ownsLine = LINE_OWNERS.includes(file);
    const reported = new WeakSet();
    const visitors = {};

    const report = (node, messageId, text) => {
      if (reported.has(node)) return;
      reported.add(node);
      context.report({ node, messageId, data: { text } });
    };

    const readNumbers = (node, text, property) => {
      if (property === undefined || RULE_BLOCKS.has(property)) return;
      const category = categoryOf(property);
      if (scope === "app" && category === "dimension") return;
      const clean = cleanse(text);
      if ((category === "motion" || property.startsWith("--")) && EASING.test(clean)) report(node, "easing", clean.match(EASING)[0]);
      for (const match of clean.matchAll(NUMBER)) {
        const unit = match[2] ?? "";
        if (unit !== "" && !isUnit(unit)) continue;
        const before = clean.slice(0, match.index).trimEnd().at(-1);
        const operator = before === "/" || before === "*" ? before : undefined;
        if (!isStructural({ property, value: Number(match[1]), unit, operator })) report(node, "number", match[0]);
      }
    };

    const firstRead = (seen, node, property) => {
      const properties = seen.get(node) ?? new Set();
      if (properties.has(property)) return false;
      seen.set(node, properties.add(property));
      return true;
    };

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
          const held = [...heldBy(source, node), ...givenTo(source, variableOf(source, node))];
          return held.length > 0 && held.every((value) => stateless(value, seen));
        }
        case "CallExpression": return isStrokeRing(node);
        default: return false;
      }
    };

    const isTokensImport = (def) => {
      const specifier = def.parent.source.value;
      const imported = def.node.imported?.name ?? def.node.imported?.value;
      if (imported !== "tokens") return false;
      return specifier === `${PACKAGE_NAME}/tokens` || isInside(resolveRelative(file, specifier) ?? "", TOKEN_LAYER);
    };

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
          const given = root.type === "Identifier" ? givenTo(source, variableOf(source, root), memberKeys(node)) : [];
          const values = [...given, ...(node.type === "Identifier" ? heldBy(source, node) : picked(source, node))];
          if (values.length === 0) return unread();
          return values.forEach((value) => checkQuery(value, at, seen));
        }
        case "CallExpression": {
          const fn = calledFunction(source, node);
          if (fn) return returnsOf(source, fn).forEach((value) => checkQuery(value, at, seen));
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
          const held = [...heldBy(source, node), ...givenTo(source, variableOf(source, node))];
          if (held.length === 0) return report(node, "queryUnread", source.getText(node));
          return held.forEach((value) => checkQueryBlock(value, seen));
        }
        default:
          return report(node, "queryUnread", source.getText(node));
      }
    };

    const scanMembers = (table, property, seen) => {
      if (property === undefined) return scan(table, undefined, seen);
      if (TYPE_WRAPPERS.has(table.type)) return scanMembers(table.expression, property, seen);
      if (table.type === "ObjectExpression") table.properties.forEach((entry) => scanMembers(entry.type === "SpreadElement" ? entry.argument : entry.value, property, seen));
      else if (table.type === "ArrayExpression") table.elements.forEach((element) => element && scanMembers(element, property, seen));
      else if (table.type !== "Identifier") scan(table, property, seen);
      else if (firstRead(seen, table, property)) heldBy(source, table).forEach((held) => scanMembers(held, property, seen));
    };

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
      if (LINE_PROPERTY.test(own) && !ownsLine && !(entry.shorthand && !isStylesheet) && !stateless(entry.value, new Set())) return report(entry.value, "line");
      scan(entry.value, own, seen);
    };

    const functionOf = (node) => (node?.type === "Identifier" ? heldBy(source, node).find((held) => FUNCTIONS.has(held.type)) : node);

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
          givenTo(source, variable).forEach((given) => scan(given, property, seen));
          const destructured = variable?.defs.some((def) => def.type === "Variable" && def.node.id.type !== "Identifier");
          heldBy(source, node).forEach((held) => (destructured ? scanMembers(held, property, seen) : scan(held, property, seen)));
          return;
        }
        case "MemberExpression": {
          const root = rootOf(node);
          if (root.type !== "Identifier") return scanMembers(root, property, seen);
          givenTo(source, variableOf(source, root), memberKeys(node)).forEach((given) => scan(given, property, seen));
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
          if (fn) return returnsOf(source, fn).forEach((value) => scan(value, property, seen));
          const value = property ?? ARGUMENT;
          node.arguments.forEach((argument) => scan(argument, value, seen));
          const overTable = ARRAY_CALLBACKS.has(calleeName(source, node)) && FUNCTIONS.has(functionOf(node.arguments[0])?.type);
          if (!overTable) scan(node.callee.type === "MemberExpression" ? node.callee.object : node.callee, value, seen);
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

    const checkKeyframes = (call) => {
      const frames = call.arguments.find((argument) => argument.type === "ObjectExpression");
      for (const entry of frames?.properties ?? []) {
        const name = entry.type === "Property" ? keyName(entry) : undefined;
        if (name !== undefined && !isKeyframeSelector(name)) report(entry.key, "keyframe", name);
      }
    };

    const scanStyleCall = (call, name) => {
      if (KEYFRAME_CALLS.has(name)) checkKeyframes(call);
      const seen = new Map();
      const mapper = name === "styleVariants" ? functionOf(call.arguments[1]) : undefined;
      if (FUNCTIONS.has(mapper?.type)) return returnsOf(source, mapper).forEach((value) => scan(value, undefined, seen));
      (name === "globalStyle" ? call.arguments.slice(1) : call.arguments).forEach((argument) => scan(argument, undefined, seen));
    };

    const scanWrites = (node) => domStyleWrites(source, node).forEach(({ property, value }) => scan(value, property ?? CUSTOM_PROPERTY, new Map()));

    visitors.CallExpression = (call) => {
      const name = calleeName(source, call);
      if (isStylesheet && name && STYLE_CALLS.has(name)) scanStyleCall(call, name);
      scanWrites(call);
    };
    visitors.JSXAttribute = (attribute) => {
      if (attribute.name.name === "style" && attribute.value?.type === "JSXExpressionContainer") scan(attribute.value.expression, undefined, new Map());
    };
    visitors.Property = (entry) => {
      if (entry.computed || entry.parent.type !== "ObjectExpression" || (entry.key.name ?? entry.key.value) !== "style") return;
      scan(entry.value, undefined, new Map());
    };
    visitors.AssignmentExpression = scanWrites;

    if (scope === "package") {
      visitors.ObjectExpression = (object) => {
        for (const entry of object.properties) {
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
