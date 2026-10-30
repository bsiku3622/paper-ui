import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import paper from "./eslint-rules/paper.js";

const rawSourcePatterns = ["palette", "color-ladder", "colors", "shape", "shape-recipes", "layout", "motion"]
  .flatMap((name) => ["", ".ts", ".js"].map((extension) => `**/tokens/${name}${extension}`));
const rawBarrelRestriction = {
  regex: String.raw`(?:^|/)(?:tokens(?:/index(?:\.[tj]s)?)?|@studio-baeks/paper-ui)$`,
  importNames: ["COLOR_VALUES", "COLOR_VALUES_DARK", "PALETTE", "SHAPE_SOURCE", "SHAPE_VALUES", "SHAPE_RECIPES", "SPACE", "ANATOMY", "LAYOUT_SOURCE", "LAYOUT_VALUES", "MOTION", "MOTION_LOOPS", "MOTION_REDUCED"],
  message: "Raw source를 barrel로 우회하지 말고 semantic tokens를 사용하세요.",
};

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
    plugins: { paper },
    rules: { "paper/raw-color": "error" },
  },

  // ── 규칙 2 — VALUES(raw) import 격리 ────────────────────────────────────
  // L0 palette·L1 ladder·L2 raw VALUES는 theme.css.ts/token assembly만 본다. Foundations
  // inspector만 source layer를 그대로 보여주는 자리라 아래에서 따로 연다.
  {
    files: [
      "packages/paper-ui/src/{primitives,atoms,resolvers,theme}/**/*.{ts,tsx}",
      "app/src/**/*.{ts,tsx}",
    ],
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

  // The Foundations inspector shows each system's source as authored, so it may read those
  // source modules — to display them, never to style with them. The ladder stays closed.
  {
    files: ["app/src/playground/foundations/*.{ts,tsx}"],
    ignores: ["app/src/playground/foundations/*.css.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [rawBarrelRestriction, {
            group: [
              ...rawSourcePatterns,
              ...["colors", "palette", "color-recipes", "shape", "shape-recipes", "layout", "typography", "motion"].map((name) => `!../../../../packages/paper-ui/src/tokens/${name}`),
            ],
            message: "규칙 2 — inspector에서 허용한 source(colors·palette·color-recipes·shape·shape-recipes·layout·typography·motion) 외의 raw VALUES는 직접 import하지 않는다.",
          }],
        },
      ],
    },
  },

  // The registry's schema and printer bind select options to the vocabulary by constant name and name
  // components by what the package exports, so they (and the test that checks them) read those two
  // entries as namespaces. They export no raw source value; the raw source files stay closed, and the
  // entries stay under the barrel restriction above.
  {
    files: ["app/src/playground/registry/{schema,jsx}.ts", "app/src/playground/registry/registry.test.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [{
            group: rawSourcePatterns,
            message:
              "규칙 2 — palette·ladder·raw VALUES는 소비처에서 import하지 않는다. tokens 배럴의 semantic var 참조를 쓰라.",
          }],
        },
      ],
    },
  },

  // ── 규칙 3 — inline style 로 토큰 주입 금지 ─────────────────────────────
  // 패키지의 .ts/.tsx 는 토큰·internal·styles 에서 온 값을 `style` 로 넘기지 않는다. 아래 모듈은 실행 중에 정해지는
  // 값(위치·눌림 style·원본 변수 운반)을 만들어 규칙이 따라가지 않는다 — 이유를 함께 적는다.
  {
    files: ["packages/paper-ui/src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}", "**/*.css.ts"],
    plugins: { paper },
    rules: {
      "paper/inline-token": ["error", {
        runtime: {
          "internal/aria/**": "anchored position and Aria press styles",
          "internal/measure.ts": "measured lengths of the moment",
          "theme/source-carry.ts": "the Floating's opener source carry",
        },
      }],
    },
  },

  // ── 규칙 4 — 길이는 token source에만 ─────────────────────────────────────
  // 패키지는 예외 없이: 숫자는 Shape·Layout·Typography·Motion source에서 한 번만 쓰고, 나머지는
  // 역할·recipe·수식으로 고른다. 앱은 간격·형태·깊이를 역할로 고르고, 자기 화면의 치수
  // (폭·높이·그리드 트랙)만 직접 쓴다.
  {
    files: ["packages/paper-ui/src/**/*.{ts,tsx}"],
    ignores: [
      "packages/paper-ui/src/tokens/{shape,layout,typography,motion,palette,color-ladder,colors}.ts",
      "**/*.test.{ts,tsx}",
    ],
    plugins: { paper },
    rules: { "paper/source-numbers": ["error", { scope: "all" }] },
  },
  {
    files: ["app/src/**/*.{ts,tsx}"],
    plugins: { paper },
    rules: { "paper/source-numbers": ["error", { scope: "spacing" }] },
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

  // ── 규칙 7 — 앱과 테스트는 패키지 내부 class 이름을 쓰지 않는다 ───────────────
  // 공유 축의 class 는 패키지의 typed map 이 고른다. 앱과 테스트가 `pui-` 이름을 문자열로 알면 그 이름이
  // 약속이 되어 버린다. 변수(--pui-*)와 속성(data-pui-*)은 이름을 따로 약속하므로 통과한다.
  {
    files: ["app/src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    plugins: { paper },
    rules: { "paper/internal-class": "error" },
  },

];
