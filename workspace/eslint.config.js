import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import { ARIA_BOUNDARY } from "./eslint-rules/manifest.js";
import paper from "./eslint-rules/paper.js";

// Every boundary the paper rules guard is declared in eslint-rules/manifest.js; the blocks below only say
// which files each rule reads.

// 절대 규칙을 문서가 아니라 빌드가 지킨다.
// 규칙을 적어두고 리뷰어의 기억력에 맡기면 3 개월 뒤에 안 지켜져 있다.

export default [
  // 워크스페이스 전체(패키지 · 앱 · fixture · 테스트 · 스크립트 · eslint-rules · 설정 파일)를 본다.
  // 산출물은 린트하지 않는다 — 번들에 섞인 eslint-disable 주석이 dist 에선 미등록 규칙("unknown rule")으로 걸린다.
  // 배포본을 검사하는 spec 이 사는 tests/dist 는 산출물이 아니라 소스다.
  { ignores: ["**/dist/**", "!tests/dist/**", "**/.types/**", "**/node_modules/**", "**/test-results/**", "**/playwright-report/**"] },
  // 쓰이지 않는 disable 주석도 오류다 — 이유가 사라진 주석이 남아 다음 위반을 가리지 않게.
  { linterOptions: { reportUnusedDisableDirectives: "error" } },

  // ── 규칙은 주석으로 끄지 않는다 ─────────────────────────────────────────────
  // paper 규칙의 예외는 이 파일에만 선언한다. 다른 규칙을 끄는 주석은 `-- 이유`를 단다.
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    plugins: { paper },
    rules: { "paper/no-rule-disable": "error" },
  },

  // TypeScript 는 어디서든(테스트 · fixture · 스크립트 · 설정 포함) 같은 parser 와 recommended 규칙으로 읽는다.
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
    files: ["packages/*/src/**/*.{ts,tsx}", "app/src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
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

  // ── React Aria 경계 ─────────────────────────────────────────────────────────
  // React Aria 는 패키지의 구현 세부라 import 가 모두 src/internal/aria 안에 산다. 경계의 패턴은 manifest 에 있다.
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    ignores: ["packages/paper-ui/src/internal/aria/**"],
    rules: { "no-restricted-imports": ["error", { patterns: [ARIA_BOUNDARY] }] },
  },

  // ── 규칙 1 — raw 색값 금지 ─────────────────────────────────────────────
  // 색 원본은 palette.ts 의 OKLCH 좌표뿐이고 HEX 는 color-ladder.ts 가 생성한다. 어떤 파일도 색 리터럴을
  // 손으로 쓰지 않고, 이름 있는 색과 시스템 색도 SYSTEM_COLORS 를 거친다 — 원본 파일도 예외가 아니다.
  {
    files: ["packages/paper-ui/src/**/*.{ts,tsx}", "app/src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    plugins: { paper },
    rules: { "paper/raw-color": "error" },
  },

  // ── 규칙 2 — 원본 격리 ─────────────────────────────────────────────────────
  // 토큰 층(tokens/)만 원본을 읽는다. 패키지는 tokens 배럴로, 앱과 fixture 는 패키지의 exports 로만 들어가고,
  // inspector 는 @paper-ui/inspect/<시스템> 하나를 글자와 kit 의 표시 부품으로만 보여 준다. 경로와 예외는
  // 모두 eslint-rules/manifest.js 에 있다. 테스트는 검증 코드라 이 규칙을 받지 않는다.
  {
    files: ["packages/paper-ui/src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}", "fixtures/**/*.{ts,tsx}"],
    plugins: { paper },
    rules: { "paper/source-isolation": "error" },
  },

  // ── 규칙 3 — inline style 로 토큰 주입 금지 ─────────────────────────────
  // .ts/.tsx 는 토큰·internal·styles·패키지에서 온 값을 `style` 로 넘기지 않는다. 실행 중에 정해지는 값을 만드는
  // 모듈(위치·눌림 style·원본 변수 운반)은 manifest 의 RUNTIME_STYLE 에 이유와 함께 선언한다.
  {
    files: ["packages/paper-ui/src/**/*.{ts,tsx}", "app/src/**/*.tsx"],
    ignores: ["**/*.test.{ts,tsx}", "**/*.css.ts"],
    plugins: { paper },
    rules: { "paper/inline-token": "error" },
  },

  // ── 규칙 4 — 숫자는 원본에만 ─────────────────────────────────────────────
  // 패키지는 예외 없이: 숫자는 token 원본에서 한 번만 쓰고, 나머지는 역할·recipe·수식으로 고른다. 앱은 간격·형태·
  // 깊이·글자·투명도·시간·분기점을 역할로 고르고, 자기 화면의 치수(폭·높이·그리드 트랙)만 직접 쓴다.
  {
    files: ["packages/paper-ui/src/**/*.{ts,tsx}"],
    ignores: ["packages/paper-ui/src/tokens/**", "**/*.test.{ts,tsx}"],
    plugins: { paper },
    rules: { "paper/source-numbers": ["error", { scope: "package" }] },
  },
  {
    files: ["app/src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    plugins: { paper },
    rules: { "paper/source-numbers": ["error", { scope: "app" }] },
  },

  // ── 규칙 5 — 패키지 CSS 는 cascade layer 안에 ──────────────────────────────
  // 패키지 규칙은 모두 pui.* layer 에 들어가 layer 밖의 앱 CSS 가 로드 순서와 무관하게 이긴다.
  // layer 이름과 wrapper 를 정의하는 tokens/layers.css.ts 만 vanilla-extract 의 규칙 API 를 직접 부른다.
  {
    files: ["packages/paper-ui/src/**/*.css.ts"],
    ignores: ["packages/paper-ui/src/tokens/layers.css.ts"],
    plugins: { paper },
    rules: { "paper/layered-styles": "error" },
  },

  // ── 규칙 6 — 앱과 테스트는 패키지 내부 class 이름을 쓰지 않는다 ───────────────
  // 공유 축의 class 는 패키지의 typed map 이 고른다. 앱과 테스트가 `pui-` 이름을 문자열로 알면 그 이름이
  // 약속이 되어 버린다. 변수(--pui-*)와 속성(data-pui-*)은 이름을 따로 약속하므로 통과한다.
  {
    files: ["app/src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    plugins: { paper },
    rules: { "paper/internal-class": "error" },
  },

  // ── 규칙 7 — 앱은 전역 이름을 짓지 않는다 ─────────────────────────────────
  // globalStyle 의 selector 는 scoped class 에서 시작한다. 요소 · :root selector 는 manifest 의
  // GLOBAL_SELECTOR_FILES 에만 둔다.
  {
    files: ["app/src/**/*.css.ts"],
    plugins: { paper },
    rules: { "paper/global-class": "error" },
  },

];
