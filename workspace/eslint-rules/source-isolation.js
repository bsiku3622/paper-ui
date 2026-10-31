// paper/source-isolation — only the token layer reads raw values, and every other file reaches them by a path the
// manifest declares.
//
//   (a) A package file outside src/tokens imports src/tokens only through its barrel (index.ts), through a
//       binding-free import of a stylesheet there (`import "../tokens/variables.css"`), or through the layer
//       module (tokens/layers.css.ts), which holds names and wrappers and no value. src/tokens/inspect is never
//       importable by package code.
//   (b) An app or fixture file imports nothing that resolves into packages/*/src (the manifest's TOOLING is the
//       one exception), the package only through its exports, and @paper-ui/inspect/<system> only from that
//       system's inspector.
//   (c) In an inspector, a value derived from what it imports from the inspect alias reaches text, and the kit's
//       display parts, and nothing else: not `style`, not `className`, not a prop of a package component other
//       than children, title and aria-*.
//
// Every file outside src/tokens also writes no `--pui-` variable name as a string; sourceVars() names them.
// Test files are verification code and are exempt from all of it.

import {
  INSPECT_ALIAS,
  INSPECT_DIR,
  INSPECT_SYSTEMS,
  LAYER_MODULE,
  PACKAGE_EXPORTS,
  PACKAGE_NAME,
  TOKEN_BARREL,
  TOKEN_LAYER,
  TOOLING,
  inspectSystemOf,
  isInside,
  isTestFile,
  resolveRelative,
  workspacePath,
} from "./manifest.js";

const strip = (file) => file.replace(/\.(?:[cm]?[jt]sx?)$/, "").replace(/\/index$/, "");
const BARREL = strip(TOKEN_BARREL);
const LAYERS = strip(LAYER_MODULE);
const PACKAGE_SRC = TOKEN_LAYER.replace(/\/tokens$/, "");
const VARIABLE_LITERAL = /--(?:pui|paper)-/;

const isStylesheet = (target) => target.endsWith(".css");
const intoPackageSource = (target) => /^packages\/[^/]+\/src(?:\/|$)/.test(target);

const ITERATORS = new Set(["map", "flatMap", "filter", "forEach", "find", "findLast", "some", "every", "reduce", "reduceRight", "sort", "toSorted"]);
// A method whose callback's return value is what comes out. filter, find and sort hand back the receiver's own members.
const PRODUCERS = new Set(["map", "flatMap", "reduce", "reduceRight", "from"]);
const ARITHMETIC = new Set(["+", "-", "*", "/", "%", "**"]);
const TYPE_WRAPPERS = new Set(["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression", "TSTypeAssertion", "TSInstantiationExpression", "ChainExpression"]);
const KIT = /^\.\/kit(?:\.tsx?)?$/;

const rootOf = (name) => {
  let node = name;
  while (node.type === "JSXMemberExpression") node = node.object;
  return node.type === "JSXIdentifier" ? node : undefined;
};

export const sourceIsolationRule = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      barrel: "패키지 코드는 원본 모듈({{target}})을 직접 import하지 않고 tokens 배럴(`../tokens`)로 읽습니다.",
      inspect: "`src/tokens/inspect`는 앱의 inspector만 읽습니다. 패키지 코드는 import하지 않습니다.",
      deep: "앱과 fixture는 패키지 소스({{target}})를 import하지 않고 exports로만 씁니다 — `@studio-baeks/paper-ui` · `/tokens` · `/theme-boot` · `/styles.css`.",
      exports: "`{{specifier}}`는 패키지의 exports가 아닙니다. exports는 {{exports}}뿐입니다.",
      alias: "`{{specifier}}`는 {{owner}} inspector에서만 import합니다.",
      flowStyle: "inspector가 원본에서 읽은 값은 `style`이나 `className`에 닿지 않습니다. 글자로 보이거나 kit의 표시 부품(Swatch · Meter …)에 넘깁니다.",
      flowProp: "inspector가 원본에서 읽은 값은 패키지 컴포넌트의 `{{name}}` prop에 닿지 않습니다. children · title · aria-*와 kit 부품의 prop으로만 넘깁니다.",
      variable: "tokens로 읽고 sourceVars()로 덮어씁니다.",
    },
  },
  create(context) {
    const file = workspacePath(context.filename);
    if (isTestFile(file)) return {};
    const source = context.sourceCode;
    const inTokens = isInside(file, TOKEN_LAYER);
    const inPackage = isInside(file, PACKAGE_SRC);
    const inApp = file.startsWith("app/") || file.startsWith("fixtures/");
    const tooling = TOOLING.find((entry) => entry.file === file);
    const owner = inspectSystemOf(file);
    const visitors = {};

    // ── (a) and (b): where an import points ───────────────────────────────────

    const checkImport = (node, specifier, hasBindings) => {
      if (typeof specifier !== "string") return;
      if (inPackage && !inTokens) {
        if (specifier.startsWith(INSPECT_ALIAS)) return context.report({ node, messageId: "inspect" });
        const target = resolveRelative(file, specifier);
        if (target === undefined || !isInside(target, strip(TOKEN_LAYER))) return;
        if (isInside(target, strip(INSPECT_DIR))) return context.report({ node, messageId: "inspect" });
        if (target === BARREL) return;
        if (target === LAYERS) return;
        if (isStylesheet(target) && !hasBindings) return;
        context.report({ node, messageId: "barrel", data: { target: target.slice(PACKAGE_SRC.length + 1) } });
        return;
      }
      if (!inApp) return;
      if (specifier.startsWith(INSPECT_ALIAS)) {
        const system = specifier.slice(INSPECT_ALIAS.length);
        if (INSPECT_SYSTEMS.includes(system) && owner === system) return;
        context.report({ node, messageId: "alias", data: { specifier, owner: INSPECT_SYSTEMS.includes(system) ? system : "해당 시스템의" } });
        return;
      }
      if (specifier === PACKAGE_NAME || specifier.startsWith(`${PACKAGE_NAME}/`)) {
        const subpath = specifier === PACKAGE_NAME ? "." : `.${specifier.slice(PACKAGE_NAME.length)}`;
        if (!PACKAGE_EXPORTS.includes(subpath)) context.report({ node, messageId: "exports", data: { specifier, exports: PACKAGE_EXPORTS.join(" · ") } });
        return;
      }
      const target = resolveRelative(file, specifier);
      if (target === undefined || !intoPackageSource(target)) return;
      if (tooling && strip(tooling.imports) === target) return;
      context.report({ node, messageId: "deep", data: { target } });
    };

    visitors.ImportDeclaration = (node) => checkImport(node, node.source.value, node.specifiers.length > 0);
    visitors.ExportNamedDeclaration = (node) => { if (node.source) checkImport(node, node.source.value, true); };
    visitors.ExportAllDeclaration = (node) => checkImport(node, node.source.value, true);
    visitors.ImportExpression = (node) => { if (node.source.type === "Literal") checkImport(node, node.source.value, true); };

    // ── The variable literal ──────────────────────────────────────────────────

    if (!inTokens && (inPackage || inApp)) {
      const flag = (node, text) => { if (VARIABLE_LITERAL.test(text)) context.report({ node, messageId: "variable" }); };
      visitors.Literal = (node) => { if (typeof node.value === "string" && node.parent.source !== node) flag(node, node.value); };
      visitors.TemplateElement = (node) => flag(node, node.value.cooked ?? node.value.raw);
    }

    // ── (c): what an inspector derives from the source ───────────────────────

    if (owner !== undefined && inApp) Object.assign(visitors, inspectorFlow(context, source, file));

    return visitors;
  },
};

// The data flow of an inspector file. A value is derived when it comes from an import of the inspect alias or of
// an inspector's own data module, through variables, member chains, calls, destructuring, and the callback
// parameters of a method called on a derived receiver. A local component or function is read with its call-site
// arguments. A lookup keyed by a derived value into a map that is not derived (a class map, a literal specimen
// table) hands back the map's own entry, so it is not derived: only the key came from the source.
function inspectorFlow(context, source, file) {
  const memo = new Map();
  const running = new Set();

  const variableOf = (identifier) => {
    let scope = source.getScope(identifier);
    while (scope && !scope.set.has(identifier.name)) scope = scope.upper;
    return scope?.set.get(identifier.name);
  };

  // An import from the alias, or from a sibling module that is itself an inspector's.
  const isSourceImport = (declaration) => {
    if (declaration.importKind === "type") return false;
    const specifier = declaration.source.value;
    if (specifier.startsWith(INSPECT_ALIAS)) return true;
    const target = resolveRelative(file, specifier);
    return target !== undefined && (inspectSystemOf(`${target}.ts`) ?? inspectSystemOf(`${target}.tsx`)) !== undefined;
  };

  const derived = (node) => {
    if (!node) return false;
    if (memo.has(node)) return memo.get(node);
    if (running.has(node)) return false;
    running.add(node);
    const result = compute(node);
    running.delete(node);
    memo.set(node, result);
    return result;
  };

  const compute = (node) => {
    if (TYPE_WRAPPERS.has(node.type)) return derived(node.expression);
    switch (node.type) {
      case "Identifier": return variableDerived(node);
      case "MemberExpression": return derived(node.object);
      case "CallExpression": return callDerived(node);
      case "ConditionalExpression": return derived(node.consequent) || derived(node.alternate);
      case "LogicalExpression": return derived(node.left) || derived(node.right);
      case "BinaryExpression": return ARITHMETIC.has(node.operator) && (derived(node.left) || derived(node.right));
      case "UnaryExpression": return (node.operator === "-" || node.operator === "+") && derived(node.argument);
      case "TemplateLiteral": return node.expressions.some(derived);
      case "ArrayExpression": return node.elements.some((element) => element && derived(element));
      case "ObjectExpression": return node.properties.some((property) => derived(property.type === "SpreadElement" ? property.argument : property.value));
      case "SpreadElement": return derived(node.argument);
      case "AwaitExpression": return derived(node.argument);
      case "AssignmentExpression": return derived(node.right);
      case "SequenceExpression": return derived(node.expressions.at(-1));
      default: return false;
    }
  };

  const callDerived = (call) => {
    if (derived(call.callee)) return true;
    const method = call.callee.type === "MemberExpression" && !call.callee.computed ? call.callee.property.name : call.callee.name;
    const local = localFunction(call.callee);
    return call.arguments.some((argument) => {
      if (argument.type === "ArrowFunctionExpression" || argument.type === "FunctionExpression") return PRODUCERS.has(method) && returnsDerived(argument);
      return derived(argument);
    }) || (local !== undefined && returnsDerived(local));
  };

  const returns = (fn) => {
    if (fn.body.type !== "BlockStatement") return [fn.body];
    const found = [];
    const visit = (node) => {
      if (!node || typeof node.type !== "string") return;
      if (node.type === "ReturnStatement") { if (node.argument) found.push(node.argument); return; }
      if (node !== fn && /Function/.test(node.type)) return;
      for (const key of source.visitorKeys[node.type] ?? []) {
        const child = node[key];
        if (Array.isArray(child)) child.forEach(visit); else visit(child);
      }
    };
    visit(fn.body);
    return found;
  };
  const returnsDerived = (fn) => returns(fn).some(derived);

  // The function a call or a JSX element names, when this file defines it.
  const localFunction = (callee) => {
    if (callee.type !== "Identifier") return undefined;
    const variable = variableOf(callee);
    for (const def of variable?.defs ?? []) {
      if (def.type === "FunctionName") return def.node;
      if (def.type === "Variable" && def.node.init && /^(?:ArrowFunction|Function)Expression$/.test(def.node.init.type)) return def.node.init;
    }
    return undefined;
  };

  const variableDerived = (identifier) => {
    const variable = variableOf(identifier);
    if (!variable) return false;
    return variable.defs.some((def) => {
      if (def.type === "ImportBinding") return isSourceImport(def.parent);
      if (def.type === "Variable") {
        const declaration = def.parent;
        if (declaration.parent?.type === "ForOfStatement" || declaration.parent?.type === "ForInStatement") return derived(declaration.parent.right);
        return derived(def.node.init);
      }
      if (def.type === "Parameter") return parameterDerived(def.node, identifier.name);
      return false;
    }) || variable.references.some((reference) => reference.writeExpr && reference.identifier !== identifier && derived(reference.writeExpr));
  };

  // Which call-site argument or callback receiver reaches this parameter.
  const parameterDerived = (fn, name) => {
    const call = fn.parent;
    if (call?.type === "CallExpression" && call.arguments.includes(fn)) {
      const method = call.callee.type === "MemberExpression" && !call.callee.computed ? call.callee.property.name : undefined;
      if (method && ITERATORS.has(method)) return derived(call.callee.object) || (method === "reduce" && call.arguments.slice(1).some(derived));
    }
    const index = fn.params.findIndex((param) => declares(param, name));
    if (index < 0) return false;
    const holder = fn.type === "FunctionDeclaration" ? fn.id : fn.parent?.type === "VariableDeclarator" ? fn.parent.id : undefined;
    const variable = holder?.type === "Identifier" ? variableOf(holder) : undefined;
    if (!variable) return false;
    return variable.references.some((reference) => {
      const use = reference.identifier.parent;
      if (use?.type === "CallExpression" && use.callee === reference.identifier) return derived(use.arguments[index]);
      if (use?.type === "JSXOpeningElement" || use?.type === "JSXClosingElement") {
        if (use.type !== "JSXOpeningElement" || index !== 0) return false;
        return use.attributes.some((attribute) => attribute.type === "JSXSpreadAttribute" ? derived(attribute.argument) : propertyNamed(fn.params[0], name, attribute) && attributeDerived(attribute));
      }
      return false;
    });
  };

  const declares = (pattern, name) => {
    if (!pattern) return false;
    if (pattern.type === "Identifier") return pattern.name === name;
    if (pattern.type === "AssignmentPattern") return declares(pattern.left, name);
    if (pattern.type === "RestElement") return declares(pattern.argument, name);
    if (pattern.type === "ArrayPattern") return pattern.elements.some((element) => declares(element, name));
    if (pattern.type === "ObjectPattern") return pattern.properties.some((property) => declares(property.type === "RestElement" ? property.argument : property.value, name));
    return false;
  };

  // Does the JSX attribute feed the destructured prop `name` (or any prop, when the parameter is one identifier)?
  const propertyNamed = (param, name, attribute) => {
    if (param.type === "Identifier") return true;
    const pattern = param.type === "AssignmentPattern" ? param.left : param;
    if (pattern.type !== "ObjectPattern") return true;
    const entry = pattern.properties.find((property) => property.type !== "RestElement" && declares(property.value, name));
    if (!entry) return pattern.properties.some((property) => property.type === "RestElement" && declares(property.argument, name));
    const key = entry.key?.name ?? entry.key?.value;
    return attribute.type === "JSXAttribute" && attribute.name.name === key;
  };

  const attributeDerived = (attribute) => attribute.value?.type === "JSXExpressionContainer" && derived(attribute.value.expression);

  // ── The elements the page renders ────────────────────────────────────────

  const importOf = (name) => {
    const root = rootOf(name);
    if (!root) return undefined;
    const variable = variableOf(root);
    return variable?.defs.find((def) => def.type === "ImportBinding")?.parent;
  };

  const kindOf = (element) => {
    const name = element.name;
    if (name.type === "JSXIdentifier" && /^[a-z]/.test(name.name)) return "intrinsic";
    const declaration = importOf(name);
    if (!declaration) return "local";
    const specifier = declaration.source.value;
    if (KIT.test(specifier)) return "kit";
    if (specifier === PACKAGE_NAME || specifier.startsWith(`${PACKAGE_NAME}/`)) return "package";
    return "other";
  };

  return {
    JSXOpeningElement(element) {
      const kind = kindOf(element);
      if (kind === "kit") return;
      for (const attribute of element.attributes) {
        if (attribute.type === "JSXSpreadAttribute") {
          if (kind === "package" && derived(attribute.argument)) context.report({ node: attribute, messageId: "flowProp", data: { name: "…" } });
          continue;
        }
        const name = attribute.name.type === "JSXNamespacedName" ? `${attribute.name.namespace.name}:${attribute.name.name.name}` : attribute.name.name;
        if (!attributeDerived(attribute)) continue;
        if (name === "style" || name === "className") context.report({ node: attribute, messageId: "flowStyle" });
        else if (kind === "package" && name !== "children" && name !== "title" && name !== "key" && !name.startsWith("aria-")) context.report({ node: attribute, messageId: "flowProp", data: { name } });
      }
    },
    Property(property) {
      if (property.computed || property.parent.type !== "ObjectExpression") return;
      const key = property.key.name ?? property.key.value;
      if ((key === "style" || key === "className") && derived(property.value)) context.report({ node: property, messageId: "flowStyle" });
    },
  };
}
