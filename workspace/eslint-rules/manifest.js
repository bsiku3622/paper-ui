// manifest.js — where the guardrails' boundaries are declared. Every rule in paper.js and every block of
// eslint.config.js reads its paths from here, and an exception is added here, with its reason, or nowhere.
// Paths are relative to the workspace (the folder holding eslint.config.js) and written with "/".

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const WORKSPACE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PACKAGE = "packages/paper-ui";
const SRC = `${PACKAGE}/src`;

// ── The token layer ──────────────────────────────────────────────────────────

// The only place a raw value exists, and the only place a source module may be imported.
export const TOKEN_LAYER = `${SRC}/tokens`;
// What the rest of the package imports from it: roles, vocabulary and composition, never a source or a helper.
export const TOKEN_BARREL = `${SRC}/tokens/index.ts`;
// The cascade layer names and the layered() wrappers hold no values, so every package .css.ts may import them
// with bindings.
export const LAYER_MODULE = `${SRC}/tokens/layers.css.ts`;

// ── The inspector alias ──────────────────────────────────────────────────────

// '@paper-ui/inspect/<system>' resolves to src/tokens/inspect/<system>.ts in the app's Vite and tsconfig.
export const INSPECT_ALIAS = "@paper-ui/inspect/";
export const INSPECT_DIR = `${SRC}/tokens/inspect`;
export const INSPECT_SYSTEMS = ["color", "typography", "shape", "layout", "motion"];

// A system's inspector page, and what belongs to it. The system is the capture, lowercased.
export const INSPECTOR_PAGE = /^app\/src\/playground\/foundations\/([A-Z]\w*)Page\.tsx$/;
export const INSPECT_CONSUMERS = [
  // The page, and the data module it reads beside it (<system>-roles.ts).
  { pattern: INSPECTOR_PAGE, system: (match) => match[1].toLowerCase() },
  { pattern: /^app\/src\/playground\/foundations\/([a-z]+)-roles\.ts$/, system: (match) => match[1] },
  // The docs generators (S29) read sources the same way.
  { pattern: /^app\/src\/docs\/generated\/([a-z]+)\.ts$/, system: (match) => match[1] },
];

// ── Tests ────────────────────────────────────────────────────────────────────

// Tests are verification code. They import package sources and assert emitted names.
export const TEST_FILES = [/\.test\.[cm]?[jt]sx?$/, /^tests\//];

// ── The package's entries ────────────────────────────────────────────────────

const PACKAGE_JSON = JSON.parse(readFileSync(path.join(WORKSPACE, PACKAGE, "package.json"), "utf8"));
export const PACKAGE_NAME = PACKAGE_JSON.name;
// The subpaths an app may import ("." is the package itself).
export const PACKAGE_EXPORTS = Object.keys(PACKAGE_JSON.exports);

// React Aria is an implementation detail: every import of it lives in src/internal/aria.
export const ARIA_HOME = `${SRC}/internal/aria`;
export const ARIA_BOUNDARY = {
  group: ["@react-aria/*", "@react-stately/*", "@react-types/*", "react-aria", "react-aria/*", "react-aria-components", "react-aria-components/*", "react-stately", "react-stately/*"],
  message: "React Aria 는 packages/paper-ui/src/internal/aria 안에서만 import 한다. 밖에서는 Paper 의 hook · 타입을 쓴다.",
};

// ── Depth ────────────────────────────────────────────────────────────────────

// zIndex and a depth shadow are written in these two files, or spread from elevationStack / elevationCast /
// elevationStyle. Nothing else states depth.
export const ELEVATION_OWNERS = [`${SRC}/primitives/paint/Surface.css.ts`, `${SRC}/primitives/float/Floating.css.ts`];
// The one other boxShadow a file may state: the inset stroke ring, by the function that draws it.
export const STROKE_OWNER = { file: `${SRC}/tokens/shape-recipes.ts`, name: "strokeRing" };

// The colour rules live in the Paint primitives. The package reads `tokens.color` only in these files and folders: the
// Paint primitives (Surface, Paint and the paints other parts borrow), Icon's own ink, and the class maps of styles/.
// primitives/orders.test.ts and atoms/color-ownership.test.ts hold the same line as a backstop.
export const COLOR_OWNERS = [`${SRC}/primitives/paint`, `${SRC}/primitives/Icon.css.ts`, `${SRC}/styles`];

// ── Declared exceptions ──────────────────────────────────────────────────────

// Modules whose values are a moment's, not the system's. paper/inline-token does not follow what they compute.
// The keys are paths inside src; the reasons are the documented runtime list.
export const RUNTIME_STYLE = {
  "internal/aria/**": "anchored position and Aria press styles",
  "internal/measure.ts": "measured lengths of the moment",
  "theme/source-carry.ts": "the Floating's opener source carry",
  "primitives/drag/useDraggable.ts": "the drag coordinates of the moment",
  "primitives/float/nestElevation.ts": "the Floating's nesting rank",
};

// An app module that holds one page's content dimensions. paper/source-numbers leaves it alone.
export const APP_DIMENSION_MODULES = ["app/src/pages/demo/layout.ts"];

// Files that run outside Vite's resolver and so reach a package source by path.
export const TOOLING = [
  { file: "app/vite/theme-boot.ts", imports: `${SRC}/theme/boot.ts`, reason: "vite.config.ts is loaded before Vite resolves anything, so the boot plugin imports the boot script by relative path." },
];

// The app files that may name an element or :root in globalStyle(). Every other selector starts from a scoped class.
export const GLOBAL_SELECTOR_FILES = ["app/src/site/shell.css.ts"];

// ── The rules ────────────────────────────────────────────────────────────────

// The rules as the docs state them. `eslint` names what runs each; S29 renders the docs from this list.
export const RULES = [
  {
    id: "raw-color",
    eslint: ["paper/raw-color"],
    ko: { title: "raw 색값 금지", summary: "색 원본은 `tokens/palette.ts`의 OKLCH 좌표뿐이고 HEX는 `tokens/color-ladder.ts`가 생성합니다. 어떤 파일도 색 리터럴을 손으로 쓰지 않습니다 — HEX, `oklch()` 같은 색 함수, 색을 받는 속성의 이름 있는 색과 CSS 시스템 색 키워드가 모두 막히고(같은 파일의 이름 · 표 · 함수 · 축약 속성을 거쳐도), 시스템 색은 `SYSTEM_COLORS`를 거칩니다. 패키지에서 `tokens.color`를 읽는 곳은 paint 층(`primitives/paint/`)과 `styles/`의 class 지도, Icon의 잉크뿐입니다(`manifest.js`의 `COLOR_OWNERS`; `primitives/orders.test.ts`와 `atoms/color-ownership.test.ts`가 backstop)." },
    en: { title: "No raw colour values", summary: "no raw colour outside the token sources" },
  },
  {
    id: "source-isolation",
    eslint: ["paper/source-isolation", "no-restricted-imports"],
    ko: { title: "원본 격리", summary: "원본 값을 읽는 곳은 토큰 층(`tokens/`)뿐입니다. 패키지의 나머지는 tokens 배럴(`tokens/index.ts`)로만 들어가고(바인딩 없는 `variables.css` import와 이름만 담은 `layers.css`는 예외, `tokens/inspect`는 import하지 않음), 앱과 fixture는 패키지 소스를 import하지 않고 exports로만 씁니다(`vite.config`가 읽는 boot 스크립트 하나가 manifest의 `TOOLING`입니다). Foundations inspector는 자기 시스템 하나를 `@paper-ui/inspect/<시스템>`으로 읽어 글자나 kit의 표시 부품(`Swatch` · `Meter` …)으로만 보여 주고, 그 값은 `style` · `className` · 패키지 컴포넌트의 prop에 닿지 않습니다. `--pui-` 변수는 토큰 층 밖에서 문자열로 쓰지 않습니다 — `tokens`로 읽고 `sourceVars()`로 덮어씁니다. 테스트는 검증 코드라 받지 않습니다. 같은 묶음이 React Aria 경계도 지킵니다(`no-restricted-imports`, 패턴은 manifest의 `ARIA_BOUNDARY`): `@react-aria/*` · `@react-stately/*` · `@react-types/*`는 `packages/paper-ui/src/internal/aria` 밖에서 import하지 않고(`@react-stately`는 쓰지도 않습니다), 어댑터가 Paper의 이름과 타입으로 옮깁니다. 번들한 d.ts에 그 경로가 남으면 `build-types.mjs`가 빌드를 실패시킵니다." },
    en: { title: "Source isolation", summary: "source modules isolated behind the token barrel (an app uses the package through its exports and overrides a source with `sourceVars()` instead of naming its variable)" },
  },
  {
    id: "inline-token",
    eslint: ["paper/inline-token"],
    ko: { title: "inline style로 토큰 주입 금지", summary: "토큰은 `.css.ts` className으로만 적용합니다. 패키지와 앱의 `.ts` · `.tsx`에서 패키지 자신(`@studio-baeks/paper-ui*`)이나 상대 모듈에서 온 값이 `style` 또는 DOM style 쓰기(`el.style.width =` · `setProperty` · `Object.assign(el.style, …)` · `setAttribute(\"style\", …)`)에 닿으면(변수 · 함수 호출 · hook · 구조 분해를 거쳐도, 던지는 오류는 따라가지 않고) 막습니다. 상대 모듈이 무엇을 돌려주는지는 읽지 않으므로 토큰을 담았다고 봅니다. `.css` 모듈만 자기 class와 변수의 이름을 내보내므로 따라가지 않습니다(`tokens` · `styles` · `internal` 안의 것은 따라갑니다). 실행 중에 정해지는 값만 예외이고 목록은 이것이 전부입니다: Draggable 이동 좌표, Grid track, Floating rank 변수, Floating 앵커 위치, Floating 원본 변수 운반, 호출자가 넘긴 style. 예외 모듈(`internal/aria` · `internal/measure` · `theme/source-carry` · `primitives/drag/useDraggable` · `primitives/float/nestElevation`)은 manifest의 `RUNTIME_STYLE`에 이유와 함께 선언합니다." },
    en: { title: "No token in an inline style", summary: "no token read through an inline style" },
  },
  {
    id: "source-numbers",
    eslint: ["paper/source-numbers"],
    ko: { title: "숫자는 원본에만", summary: "스타일 자리(`.css.ts`의 vanilla-extract 호출 인자, `.ts` · `.tsx`의 `style`과 DOM style 쓰기)의 숫자 · 단위 · easing은 구조 값(0 · 100% · 50% · 1fr · 45° 배수 · calc의 `/ 2` · `* -1`, 정본은 `eslint-rules/structural.js`)이 아니면 원본의 값입니다. 범주가 없는 속성, `vars`의 변수 값, 스타일을 돌려주는 함수에 넘긴 숫자도 똑같이 읽습니다. 패키지에서는 스타일 속성을 키로 가진 객체 리터럴이 어느 `.ts` · `.tsx`에 있든 스타일 자리입니다 — 그 조각이 import로 stylesheet에 펼쳐질 수 있기 때문입니다. 패키지는 토큰 층 밖에서 간격 · 형태 · 깊이 · 글자 · 투명도 · 시간 · 치수 모두를 역할로 고르고, 앱은 콘텐츠 치수(폭 · 높이 · 그리드 트랙과 그 위치)만 직접 씁니다. 앱의 변수 값은 같은 파일의 규칙이 그 변수를 치수로 읽을 때만 치수입니다. 미디어 · container 쿼리의 길이는 `tokens.layout.breakpoint`나 `APP_DIMENSION_MODULES`의 import로만 적고, 읽을 수 없는 쿼리는 막습니다. 깊이(`zIndex` · `boxShadow` · `filter`)는 Surface와 Floating의 stylesheet(manifest의 `ELEVATION_OWNERS`)나 elevation 조각의 spread, 안쪽 선은 `strokeRing()`에서만 나옵니다. 앱은 Typography Palette를 읽지 않습니다 — 공개 트리에 없고, 그것을 보여 주는 Typography inspector는 `@paper-ui/inspect/typography`로 읽습니다. 한 화면의 치수 모듈(`pages/demo/layout.ts`)은 `APP_DIMENSION_MODULES`에 선언합니다." },
    en: { title: "Numbers only in sources", summary: "no number outside the token sources" },
  },
  {
    id: "layered-styles",
    eslint: ["paper/layered-styles"],
    ko: { title: "패키지 CSS는 레이어 안에", summary: "패키지 `.css.ts`는 vanilla-extract의 규칙 API(`style` · `styleVariants` · `globalStyle` · `globalLayer` …)를 직접 import하지 않고 `tokens/layers.css.ts`의 `layered(name)`으로 규칙을 만듭니다. 그래서 모든 규칙이 cascade layer `pui` 안에 들고, 레이어 밖의 앱 CSS가 로드 순서와 무관하게 이깁니다. 레이어를 정의하는 `layers.css.ts`만 예외이고, `keyframes` · `createVar` · `fallbackVar` · `createGlobalVar`는 그대로 씁니다." },
    en: { title: "Package CSS inside a layer", summary: "every package rule inside a `pui` cascade layer" },
  },
  {
    id: "internal-class",
    eslint: ["paper/internal-class"],
    ko: { title: "내부 class 이름 문자열 금지", summary: "패키지(`packages/paper-ui/src`) · 앱(`app/src`) · fixture(`fixtures/`) · 테스트(`tests/`)는 `pui-` 뒤에 글자가 오는 문자열(템플릿과 정규식 포함)을 쓰지 않습니다. 공유 축의 class는 resolver가 `styles/`의 typed map(`fillClass` · `inkClass` · `accentVariantClass` · `spaceClass`)을 인덱싱해 고르고 이름은 빌드가 짓습니다. 변수 `--pui-*`와 속성 `data-pui-*`는 이 규칙을 통과합니다(변수 문자열은 원본 격리가 막습니다). 패키지 안에서만 그 이름이 class가 아닐 수 있고 놓인 자리가 그것을 말합니다 — 요소의 id(`id` · `htmlFor` · `…Id` 바인딩), 저장 키(`…KEY` · `…Key` 바인딩과 storage 호출의 첫 인자), 테스트의 부정 단언(`.not`). `.pui-` selector와 class 자리가 읽는 바인딩은 그래도 class입니다." },
    en: { title: "No internal class names", summary: "no internal class name spelled as a string" },
  },
  {
    id: "global-class",
    eslint: ["paper/global-class"],
    ko: { title: "손으로 지은 전역 class 금지", summary: "앱 `.css.ts`의 `globalStyle` selector는 scoped class에서 시작합니다. 요소 · `:root` selector는 `site/shell.css.ts`(manifest의 `GLOBAL_SELECTOR_FILES`)뿐이고, 전역 keyframes와 전역 변수 이름은 짓지 않습니다." },
    en: { title: "No hand-named global class", summary: "no hand-named global class" },
  },
  {
    id: "no-rule-disable",
    eslint: ["paper/no-rule-disable"],
    ko: { title: "규칙은 주석으로 끄지 않음", summary: "paper 규칙은 `eslint-disable` 주석으로 끄지 않고, 예외는 `eslint-rules/manifest.js`에만 선언합니다. 다른 규칙을 끄는 주석은 `-- 이유`를 달고, 아무것도 가리지 않는 disable 주석도 오류입니다. `pnpm lint`는 두 번 돕니다 — 두 번째 판(`eslint.paper.config.js`)은 paper 규칙만 주석 설정을 끈 채 읽어서 `/* eslint paper/…: \"off\" */` 같은 설정 주석도 아무것도 끄지 못합니다." },
    en: { title: "Rules are not switched off by comment", summary: "no `eslint-disable` comment that switches a `paper/*` rule off" },
  },
];

// ── Path helpers ─────────────────────────────────────────────────────────────

export const toPosix = (value) => value.split(path.sep).join("/");

// The workspace-relative path of a linted file.
export const workspacePath = (filename) => toPosix(path.relative(WORKSPACE, filename));

export const isInside = (target, directory) => target === directory || target.startsWith(`${directory}/`);

export const isTestFile = (file) => TEST_FILES.some((pattern) => pattern.test(file));

// The workspace path an import resolves to, without its extension and without a trailing /index; undefined
// for a specifier that is not a path.
export const resolveRelative = (file, specifier) => {
  if (!specifier.startsWith(".")) return undefined;
  const joined = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
  return joined.replace(/\.(?:[cm]?[jt]sx?)$/, "").replace(/\/index$/, "");
};

// The system an inspector file is allowed to import, if it is one.
export const inspectSystemOf = (file) => {
  for (const { pattern, system } of INSPECT_CONSUMERS) {
    const match = pattern.exec(file);
    if (match) return system(match);
  }
  return undefined;
};
