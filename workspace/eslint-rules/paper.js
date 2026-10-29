import path from "node:path";

const rawColor = /(?:#|%23)(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{4}|[\da-f]{3})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\s*\(/i;
const manualVar = /var\(\s*--(?:pui|paper)-/;
const colorProperty = /^(?:color|background|backgroundColor|border(?:Top|Right|Bottom|Left|Inline|Block|InlineStart|InlineEnd)?(?:Color)?|outline(?:Color)?|boxShadow|textShadow|fill|stroke|caretColor|accentColor|textDecorationColor)$/;
const namedColors = new Set(("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen").split(" "));

const propertyName = (node) => {
  const parent = node.parent;
  if (parent?.type === "Property") return parent.key.name ?? parent.key.value;
  if (parent?.type === "JSXAttribute") return parent.name.name;
  return undefined;
};

const rawColorRule = {
  meta: { type: "problem", schema: [], messages: { raw: "Raw color 금지. tokens.color의 semantic 참조를 사용하세요.", variable: "CSS variable 문자열을 직접 작성하지 말고 tokens 참조를 사용하세요." } },
  create(context) {
    const check = (node, value) => {
      if (rawColor.test(value) || (colorProperty.test(propertyName(node) ?? "") && value.split(/[\s,()]+/).some((word) => namedColors.has(word.toLowerCase())))) {
        context.report({ node, messageId: "raw" });
      }
      if (manualVar.test(value)) context.report({ node, messageId: "variable" });
    };
    return {
      Literal(node) { if (typeof node.value === "string") check(node, node.value); },
      TemplateLiteral(node) { check(node, node.quasis.map((part) => part.value.cooked ?? part.value.raw).join(" ")); },
    };
  },
};

// A package .ts/.tsx file never hands a token to `style`: a token is applied by a `.css.ts` className. The rule
// reports a JSX `style` attribute, or an object property keyed `style`, whose value reaches a binding imported
// from the token layer (src/tokens), the stylesheets (src/styles), the internals (src/internal) or the package
// itself. "Reaches" follows what the value is made of: a declarator's initialiser and destructuring, a variable's
// later assignments, member chains, a call's callee and arguments, the bodies of the functions it holds, and
// conditional, logical, binary, template, spread and TypeScript-wrapper nodes. No call is opaque and no name is
// listed. The declared runtime modules (the `runtime` option, each with its reason) are untracked: what they
// compute is a value of the moment — an anchored position, an Aria press style, a carried source variable.
const TRACKED_DIRECTORIES = ["tokens", "styles", "internal"];
const PACKAGE_IMPORT = /^@studio-baeks\/paper-ui/;
const SOURCE_ROOT = /^(.*[\\/]packages[\\/]paper-ui[\\/]src)[\\/]/;
const TYPE_WRAPPERS = new Set(["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression", "TSTypeAssertion", "TSInstantiationExpression"]);

const modulePath = (entry) => entry.replace(/\/\*\*$/, "").replace(/(?:\.css)?\.tsx?$/, "");

const inlineTokenRule = {
  meta: {
    type: "problem",
    schema: [{ type: "object", properties: { runtime: { type: "object", additionalProperties: { type: "string", minLength: 1 } } }, additionalProperties: false }],
    messages: { inline: "Package 토큰은 inline style 대신 .css.ts className으로 적용하세요." },
  },
  create(context) {
    const source = context.sourceCode;
    const root = SOURCE_ROOT.exec(context.filename)?.[1];
    const runtime = Object.keys(context.options[0]?.runtime ?? {}).map(modulePath);

    const isTracked = (specifier) => {
      if (PACKAGE_IMPORT.test(specifier)) return true;
      if (!root || !specifier.startsWith(".")) return false;
      const inside = path.relative(root, path.resolve(path.dirname(context.filename), specifier)).split(path.sep).join("/");
      if (inside.startsWith("..") || !TRACKED_DIRECTORIES.includes(inside.split("/")[0])) return false;
      return !runtime.some((module) => inside === module || inside.startsWith(`${module}/`));
    };

    const reaches = (node, seen = new Set()) => {
      if (!node || seen.has(node)) return false;
      seen.add(node);
      if (node.type === "Identifier") return identifierReaches(node, seen);
      if (TYPE_WRAPPERS.has(node.type)) return reaches(node.expression, seen);
      if (node.type.startsWith("TS")) return false;
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

// scope "all" (package): no length literal anywhere — every number lives in a token source.
// scope "spacing" (apps): spacing, form and depth come from Shape / Layout roles; an app's own
// content dimensions (widths, heights, grid tracks) stay the app's.
const sourceNumbersRule = {
  meta: {
    type: "problem",
    schema: [{ type: "object", properties: { scope: { enum: ["all", "spacing"] } }, additionalProperties: false }],
    messages: { raw: "고정 geometry는 semantic Shape / Layout 토큰이나 내부 recipe에서 선택하세요." },
  },
  create(context) {
    const scope = context.options[0]?.scope ?? "all";
    const lengthProperty = /^(?:(?:min|max)?(?:Width|Height)|width|height|zIndex|(?:padding|margin|inset|gap|rowGap|columnGap|top|right|bottom|left|borderRadius|borderWidth|outlineWidth|outlineOffset|strokeWidth).*)$/;
    const spacingProperty = /^(?:zIndex|boxShadow|border(?:Top|Right|Bottom|Left|Inline|Block)?|(?:padding|margin|inset|gap|rowGap|columnGap|top|right|bottom|left|borderRadius|outline|outlineWidth|outlineOffset|border\w*Width|border\w*Radius).*)$/;
    const unitLength = /(?:^|[^\w])[-+]?(?:\d*\.)?\d+(?:px|rem|em|ch)\b/i;
    const check = (node, value) => {
      if (scope === "spacing") {
        if (node.parent?.type !== "Property" || !spacingProperty.test(propertyName(node) ?? "")) return;
        if (typeof value === "string" && unitLength.test(value) || typeof value === "number" && value !== 0) context.report({ node, messageId: "raw" });
        return;
      }
      if (typeof value === "string" && unitLength.test(value)
        || typeof value === "number" && value !== 0 && lengthProperty.test(propertyName(node) ?? "")) context.report({ node, messageId: "raw" });
    };
    return {
      Literal(node) { check(node, node.value); },
      TemplateLiteral(node) { check(node, node.quasis.map((part) => part.value.cooked ?? part.value.raw).join(" ")); },
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
// is declared in eslint.config.js. Any other rule an eslint-disable comment switches off carries its reason
// after `--`. Reports sit at column 0 of the comment's line: disable directives cover a line from column 1,
// so no directive can hide its own report. A `/* eslint */` comment that also switches this rule off is out
// of any rule's reach, because ESLint applies inline configuration before the rules run.
const configuresPaper = /(?:^|[\s,{])["']?paper\/[\w-]+["']?\s*:/;
const noRuleDisableRule = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      paper: "paper 규칙은 주석으로 끄지 않습니다. 예외는 eslint.config.js에 선언하세요.",
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

export default {
  rules: {
    "raw-color": rawColorRule,
    "inline-token": inlineTokenRule,
    "source-numbers": sourceNumbersRule,
    "layered-styles": layeredStylesRule,
    "internal-class": internalClassRule,
    "no-rule-disable": noRuleDisableRule,
  },
};
