import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

// 절대 규칙을 문서가 아니라 빌드가 지킨다.
// 규칙을 적어두고 리뷰어의 기억력에 맡기면 3 개월 뒤에 안 지켜져 있다.

export default [
  {
    files: ["packages/*/src/**/*.{ts,tsx}", "app/src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { "@typescript-eslint": tseslint, "react-hooks": reactHooks },
    rules: {
      ...tseslint.configs.recommended.rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },

  // ── 규칙 1 — raw 색·크기 값 금지 ─────────────────────────────────────────
  // hex 는 tokens/colors.ts 에만. 다른 데서 #fff 를 쓰면 팔레트가 두 곳이 된다.
  {
    files: ["packages/paper-ui/src/**/*.{ts,tsx}", "app/src/**/*.{ts,tsx}"],
    ignores: [
      "packages/paper-ui/src/tokens/colors.ts",
      "packages/paper-ui/src/tokens/shape.ts",
      "packages/paper-ui/src/tokens/text.ts",
      "packages/paper-ui/src/styles/theme.css.ts",
      "**/*.test.{ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/]",
          message:
            "규칙 1 — raw hex 금지. 색은 tokens/colors.ts 에만 정의하고 tokens.color.X 로 참조하라.",
        },
        {
          selector: "Literal[value=/^var\\(--paper-/]",
          message:
            "규칙 1 — CSS var 문자열 직접 작성 금지. tokens.X.Y 참조 객체를 쓰라 (이름이 어긋난다).",
        },
      ],
    },
  },

  // ── 규칙 2 — VALUES(raw) import 격리 ────────────────────────────────────
  // COLOR_VALUES · SHAPE_VALUES 의 *값* 은 theme.css.ts 만 본다.
  {
    files: [
      "packages/paper-ui/src/{primitives,atoms,molecules,components,provider,resolvers}/**/*.{ts,tsx}",
      "app/src/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/tokens/colors", "**/tokens/shape"],
              message:
                "규칙 2 — raw 값 모듈은 styles/theme.css.ts 만 import 한다. tokens 배럴의 var 참조를 쓰라.",
            },
          ],
        },
      ],
    },
  },

  // ── 규칙 3 — inline style 로 토큰 주입 금지 ─────────────────────────────
  {
    files: ["packages/paper-ui/src/**/*.tsx"],
    ignores: ["**/*.test.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='style'] MemberExpression[object.name='tokens']",
          message: "규칙 3 — 토큰을 inline style 로 주입 금지. .css.ts 의 className 으로 옮겨라.",
        },
        {
          selector: "Literal[value=/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/]",
          message: "규칙 1 — raw hex 금지.",
        },
      ],
    },
  },

  // ── 규칙 4 — Primitive 위에서 raw HTML 금지 ─────────────────────────────
  // Atom 부터는 Box/Stack/Inline/Text 로 합성한다. Primitive 만 raw 를 렌더한다.
  {
    files: [
      "packages/paper-ui/src/molecules/**/*.tsx",
      "packages/paper-ui/src/components/**/*.tsx",
    ],
    ignores: ["**/*.test.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='style'] MemberExpression[object.name='tokens']",
          message: "규칙 3 — 토큰을 inline style 로 주입 금지.",
        },
        {
          selector:
            "JSXOpeningElement[name.name=/^(a|article|aside|b|blockquote|button|caption|dd|div|dl|dt|em|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|header|hr|i|img|input|label|legend|li|main|nav|ol|p|pre|section|select|small|span|strong|table|tbody|td|textarea|tfoot|th|thead|tr|ul)$/]",
          message:
            "규칙 4 — Molecule 이상에서 raw HTML 금지. Primitive(Box·Stack·Inline·Text) 또는 Atom 으로 합성하라. (svg 는 예외)",
        },
      ],
    },
  },
];
