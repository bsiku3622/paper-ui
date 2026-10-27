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

const noRawColor = {
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

const noInlineTokens = {
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

const noRawGeometry = {
  meta: { type: "problem", schema: [], messages: { raw: "고정 geometry는 semantic Shape / Layout 토큰이나 내부 recipe에서 선택하세요." } },
  create(context) {
    const lengthProperty = /^(?:(?:min|max)?(?:Width|Height)|width|height|(?:padding|margin|inset|gap|rowGap|columnGap|top|right|bottom|left|borderRadius|borderWidth|outlineWidth|outlineOffset|strokeWidth).*)$/;
    const check = (node, value) => {
      if (typeof value === "string" && /(?:^|[^\w])[-+]?(?:\d*\.)?\d+(?:px|rem|em|ch)\b/i.test(value)
        || typeof value === "number" && value !== 0 && lengthProperty.test(propertyName(node) ?? "")) context.report({ node, messageId: "raw" });
    };
    return {
      Literal(node) { check(node, node.value); },
      TemplateLiteral(node) { check(node, node.quasis.map((part) => part.value.cooked ?? part.value.raw).join(" ")); },
    };
  },
};

export default { rules: { "no-raw-color": noRawColor, "no-inline-tokens": noInlineTokens, "no-raw-geometry": noRawGeometry } };
