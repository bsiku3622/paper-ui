import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tokenBoundaries from "./eslint-rules/token-boundaries.js";

const rawSourcePatterns = ["palette", "color-ladder", "colors", "shape", "shape-recipes", "layout"]
  .flatMap((name) => ["", ".ts", ".js"].map((extension) => `**/tokens/${name}${extension}`));
const rawBarrelRestriction = {
  regex: String.raw`(?:^|/)(?:tokens(?:/index(?:\.[tj]s)?)?|@studio-baeks/paper-ui)$`,
  importNames: ["COLOR_VALUES", "COLOR_VALUES_DARK", "PALETTE", "SHAPE_SOURCE", "SHAPE_VALUES", "SHAPE_RECIPES", "SPACE", "ANATOMY", "LAYOUT_SOURCE", "LAYOUT_VALUES"],
  message: "Raw source를 barrel로 우회하지 말고 semantic tokens를 사용하세요.",
};

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
  // OKLCH source는 L0 palette, generated HEX token은 L1 generator에만. 소비처에 raw HEX를
  // 쓰면 같은 색의 정본이 두 곳이 된다.
  {
    files: ["packages/paper-ui/src/**/*.{ts,tsx}", "app/src/**/*.{ts,tsx}"],
    ignores: [
      "packages/paper-ui/src/tokens/palette.ts",
      "packages/paper-ui/src/tokens/color-ladder.ts",
      "**/*.test.{ts,tsx}",
    ],
    plugins: { "token-boundaries": tokenBoundaries },
    rules: { "token-boundaries/no-raw-color": "error" },
  },

  // ── 규칙 2 — VALUES(raw) import 격리 ────────────────────────────────────
  // L0 palette·L1 ladder·L2 raw VALUES는 theme.css.ts/token assembly만 본다. Palette
  // foundations viewer만 source layer를 그대로 보여주는 inspector라 예외다.
  {
    files: [
      "packages/paper-ui/src/{primitives,atoms,provider,resolvers}/**/*.{ts,tsx}",
      "app/src/**/*.{ts,tsx}",
    ],
    ignores: ["app/src/playground/Palette.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            rawBarrelRestriction,
            {
              group: rawSourcePatterns,
              message:
                "규칙 2 — palette·ladder·raw VALUES는 소비처에서 import하지 않는다. tokens 배럴의 semantic var 참조를 쓰라.",
            },
          ],
        },
      ],
    },
  },

  // Foundations token inspector may read the two source modules it displays.
  // Keep ladder/shape and other raw-token imports restricted in this file.
  {
    files: ["app/src/playground/Tokens.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [rawBarrelRestriction, {
            group: [
              ...rawSourcePatterns,
              "!../../../packages/paper-ui/src/tokens/colors",
              "!../../../packages/paper-ui/src/tokens/palette",
            ],
            message: "규칙 2 — inspector에서 허용한 colors·palette 외의 raw VALUES는 직접 import하지 않는다.",
          }],
        },
      ],
    },
  },

  // ── 규칙 3 — inline style 로 토큰 주입 금지 ─────────────────────────────
  {
    files: ["packages/paper-ui/src/**/*.tsx"],
    ignores: ["**/*.test.tsx"],
    plugins: { "token-boundaries": tokenBoundaries },
    rules: { "token-boundaries/no-inline-tokens": "error" },
  },

  // ── 규칙 4 — 길이는 token source에만 ─────────────────────────────────────
  // 패키지는 예외 없이: 숫자는 Shape·Layout·Typography·Motion source에서 한 번만 쓰고, 나머지는
  // 역할·recipe·수식으로 고른다. 앱은 간격·형태·깊이를 역할로 고르고, 자기 화면의 치수
  // (폭·높이·그리드 트랙)만 직접 쓴다.
  {
    files: ["packages/paper-ui/src/**/*.{ts,tsx}"],
    ignores: [
      "packages/paper-ui/src/tokens/{shape,layout,text,motion,palette,color-ladder,colors}.ts",
      "**/*.test.{ts,tsx}",
    ],
    plugins: { "token-boundaries": tokenBoundaries },
    rules: { "token-boundaries/no-raw-geometry": ["error", { scope: "all" }] },
  },
  {
    files: ["app/src/**/*.{ts,tsx}"],
    plugins: { "token-boundaries": tokenBoundaries },
    rules: { "token-boundaries/no-raw-geometry": ["error", { scope: "spacing" }] },
  },

];
