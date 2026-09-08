import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

// 절대 규칙을 문서가 아니라 빌드가 지킨다.
// 규칙을 적어두고 리뷰어의 기억력에 맡기면 3 개월 뒤에 안 지켜져 있다.

export default [
  // 빌드 산출물은 린트하지 않는다 — 번들에 섞인 eslint-disable 주석이 dist 에선 미등록
  // 규칙("unknown rule")으로 걸린다. src 만 본다.
  { ignores: ["**/dist/**", "**/public/docs/**"] },
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

  // ── a11y 를 빌드가 지킨다 (원칙 6 의 확장) ────────────────────────────────
  // 접근성 기본(유효한 role·aria, 대체텍스트, 키보드 상호작용, 양수 tabindex 금지 등)을
  // 리뷰 기억력이 아니라 lint 로 강제한다. paper-ui 는 raw HTML 을 <Box as="button"> 로
  // 추상화하므로 polymorphicPropName 으로 `as` 를 실제 요소로 읽게 한다 — 안 그러면
  // 규칙이 Box 를 못 알아보고 통째로 건너뛴다.
  {
    files: ["packages/*/src/**/*.{ts,tsx}", "app/src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    plugins: { "jsx-a11y": jsxA11y },
    settings: { "jsx-a11y": { polymorphicPropName: "as" } },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // 우리 폼 아톰은 native 컨트롤을 감싸므로 <label> 안의 컨트롤로 인정한다 —
      // 안 그러면 <Inline as="label"><Checkbox/></Inline> 가 오탐으로 걸린다.
      "jsx-a11y/label-has-associated-control": [
        "error",
        { controlComponents: ["Checkbox", "Radio", "Switch", "Field", "Select", "Textarea"] },
      ],
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
      // ⚠ 한시적 예외 — app/src/lab 은 **값을 고르는 도구**다. 후보 hex 를 나란히 놓고
      //   사이트를 돌아다니며 눈으로 고르는 자리라, 여기서는 hex 가 우회가 아니라 주제다.
      //   고르고 나면 값은 tokens/colors.ts 로 옮기고 이 폴더와 이 줄을 함께 지운다.
      //   (라이브러리에는 안 들어간다 — app 전용이고 `?lab=` 로만 켜진다.)
      "app/src/lab/**",
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
  // raw HTML 은 Primitive 와 Atom 까지다(Button→button · Field→input). Molecule 부터는
  // Primitive·Atom 합성만 — raw 태그가 꼭 필요하면 <Box as="…"> 가 유일한 통로다.
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
