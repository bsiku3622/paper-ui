import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import { ARIA_BOUNDARY, ARIA_HOME } from "./eslint-rules/manifest.js";
import paper from "./eslint-rules/paper.js";

// Every boundary the paper rules guard is declared in eslint-rules/manifest.js; the blocks below only say
// which files each rule reads.

export default [
  // 워크스페이스 전체(패키지 · 앱 · fixture · 테스트 · 스크립트 · eslint-rules · 설정 파일)를 본다.
  // 산출물은 린트하지 않는다 — 번들에 섞인 eslint-disable 주석이 dist 에선 미등록 규칙("unknown rule")으로 걸린다.
  // 배포본을 검사하는 spec 이 사는 tests/dist 는 산출물이 아니라 소스다.
  { ignores: ["**/dist/**", "!tests/dist/**", "**/.types/**", "**/node_modules/**", "**/test-results/**", "**/playwright-report/**", "app/.doc-snippets/**"] },
  { linterOptions: { reportUnusedDisableDirectives: "error" } },

  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    plugins: { paper },
    rules: { "paper/no-rule-disable": "error" },
  },

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: { ...tseslint.configs.recommended.rules },
  },
  {
    files: ["packages/*/src/**/*.{ts,tsx}", "app/src/**/*.{ts,tsx}", "demos/src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },

  {
    files: ["packages/*/src/**/*.{ts,tsx}", "app/src/**/*.{ts,tsx}", "demos/src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    plugins: { "jsx-a11y": jsxA11y },
    // polymorphicPropName makes the rules read `as` as the real element; otherwise they skip Box entirely.
    settings: { "jsx-a11y": { polymorphicPropName: "as" } },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // The form Atoms wrap native controls; without this <Inline as="label"><Checkbox/></Inline> is a false positive.
      "jsx-a11y/label-has-associated-control": [
        "error",
        { controlComponents: ["Checkbox", "Radio", "Switch", "Field", "Select", "Textarea"] },
      ],
    },
  },

  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    ignores: [`${ARIA_HOME}/**`],
    rules: { "no-restricted-imports": ["error", { patterns: [ARIA_BOUNDARY] }] },
  },

  {
    files: ["packages/paper-ui/src/**/*.{ts,tsx}", "app/src/**/*.{ts,tsx}", "demos/src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    plugins: { paper },
    rules: { "paper/raw-color": "error" },
  },

  // ── 규칙 2 — 원본 격리 ─────────────────────────────────────────────────────
  // 토큰 층(tokens/)만 원본을 읽는다. 패키지는 tokens 배럴로, 앱과 fixture 는 패키지의 exports 로만 들어가고,
  // inspector 는 @paper-ui/inspect/<시스템> 하나를 글자와 kit 의 표시 부품으로만 보여 준다. 경로와 예외는
  // 모두 eslint-rules/manifest.js 에 있다. 테스트는 검증 코드라 이 규칙을 받지 않는다.
  {
    files: ["packages/paper-ui/src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}", "demos/**/*.{ts,tsx}", "fixtures/**/*.{ts,tsx}"],
    plugins: { paper },
    rules: { "paper/source-isolation": "error" },
  },

  {
    files: ["packages/paper-ui/src/**/*.{ts,tsx}", "app/src/**/*.{ts,tsx}", "demos/src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}", "**/*.css.ts"],
    plugins: { paper },
    rules: { "paper/inline-token": "error" },
  },

  {
    files: ["packages/paper-ui/src/**/*.{ts,tsx}"],
    ignores: ["packages/paper-ui/src/tokens/**", "**/*.test.{ts,tsx}"],
    plugins: { paper },
    rules: { "paper/source-numbers": ["error", { scope: "package" }] },
  },
  {
    files: ["app/src/**/*.{ts,tsx}", "demos/src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    plugins: { paper },
    rules: { "paper/source-numbers": ["error", { scope: "app" }] },
  },

  {
    files: ["packages/paper-ui/src/**/*.css.ts"],
    ignores: ["packages/paper-ui/src/tokens/layers.css.ts"],
    plugins: { paper },
    rules: { "paper/layered-styles": "error" },
  },

  {
    files: ["packages/paper-ui/src/**/*.{ts,tsx}", "app/src/**/*.{ts,tsx}", "demos/src/**/*.{ts,tsx}", "fixtures/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    plugins: { paper },
    rules: { "paper/internal-class": "error" },
  },

  {
    files: ["app/src/**/*.css.ts", "demos/src/**/*.css.ts"],
    plugins: { paper },
    rules: { "paper/global-class": "error" },
  },

];
