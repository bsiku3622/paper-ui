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

const inlineTokenRule = {
  meta: { type: "problem", schema: [], messages: { inline: "Package 토큰은 inline style 대신 .css.ts className으로 적용하세요." } },
  create(context) {
    const source = context.sourceCode;
    const containsToken = (node, seen = new Set()) => {
      if (!node || seen.has(node)) return false;
      seen.add(node);
      if (node.type === "Identifier") {
        let scope = source.getScope(node);
        while (scope && !scope.set.has(node.name)) scope = scope.upper;
        const variable = scope?.set.get(node.name);
        return variable?.defs.some((def) => {
          if (def.type === "ImportBinding") return ["tokens", "geometry"].includes(def.node.imported?.name)
            || (def.node.type === "ImportNamespaceSpecifier" && /(?:tokens|internal\/shape|@studio-baeks\/paper-ui)$/.test(def.parent.source.value));
          return def.type === "Variable" && containsToken(def.node.init, seen);
        }) ?? false;
      }
      if (node.type === "MemberExpression") return containsToken(node.object, seen);
      // Calls are intentionally opaque: Box's dimension resolver is a public layout escape.
      if (node.type === "CallExpression") return false;
      return (source.visitorKeys[node.type] ?? []).some((key) => {
        const children = node[key];
        return Array.isArray(children) ? children.some((child) => containsToken(child, seen)) : containsToken(children, seen);
      });
    };
    return { JSXAttribute(node) {
      if (node.name.name === "style" && node.value?.type === "JSXExpressionContainer" && containsToken(node.value.expression)) {
        context.report({ node, messageId: "inline" });
      }
    } };
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
  rules: { "raw-color": rawColorRule, "inline-token": inlineTokenRule, "source-numbers": sourceNumbersRule, "no-rule-disable": noRuleDisableRule },
};
