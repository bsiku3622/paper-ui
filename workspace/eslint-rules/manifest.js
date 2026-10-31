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

// The colour rules live in the paint tier. The package reads `tokens.color` only in these files and folders: the
// paint tier (Surface, Paint and the paints other parts borrow), Icon's own ink, and the class maps of styles/.
// primitives/orders.test.ts and atoms/color-ownership.test.ts hold the same line as a backstop.
export const COLOR_OWNERS = [`${SRC}/primitives/paint`, `${SRC}/primitives/Icon.css.ts`, `${SRC}/styles`];

// ── Declared exceptions ──────────────────────────────────────────────────────

// Modules whose values are a moment's, not the system's. paper/inline-token does not follow what they compute.
// The keys are paths inside src; the reasons are the documented runtime list.
export const RUNTIME_STYLE = {
  "internal/aria/**": "anchored position and Aria press styles",
  "internal/measure.ts": "measured lengths of the moment",
  "theme/source-carry.ts": "the Floating's opener source carry",
};

// An app module that holds one page's content dimensions. paper/source-numbers leaves it alone.
export const APP_DIMENSION_MODULES = ["app/src/pages/demo/layout.ts"];

// Files that run outside Vite's resolver and so reach a package source by path.
export const TOOLING = [
  { file: "app/vite/theme-boot.ts", imports: `${SRC}/theme/boot.ts`, reason: "vite.config.ts is loaded before Vite resolves anything, so the boot plugin imports the boot script by relative path." },
];

// The app files that may name an element or :root in globalStyle(). Every other selector starts from a scoped class.
export const GLOBAL_SELECTOR_FILES = ["app/src/site/shell.css.ts"];

// The inspector that exists to show the typography palette may read it; no other app code does.
export const PALETTE_INSPECTOR = ["typography"];

// ── The rules ────────────────────────────────────────────────────────────────

// The rules as the docs state them. `eslint` names what runs each; S29 renders the docs from this list.
export const RULES = [
  {
    id: "raw-color",
    eslint: ["paper/raw-color"],
    ko: { title: "raw 색값 금지", summary: "색 원본은 palette.ts의 OKLCH 좌표뿐이고 HEX는 color-ladder.ts가 생성합니다. 어떤 파일도 색 리터럴을 손으로 쓰지 않고, 이름 있는 색과 시스템 색도 SYSTEM_COLORS를 거칩니다. 패키지에서 tokens.color를 읽는 곳은 paint 층과 styles/의 class 지도, Icon의 잉크뿐입니다." },
    en: { title: "No raw colour values", summary: "The only colour source is the OKLCH coordinates in palette.ts, and color-ladder.ts generates the HEX. No file writes a colour literal by hand; named and system colours go through SYSTEM_COLORS. The package reads tokens.color only in the paint tier, the class maps of styles/ and Icon's ink." },
  },
  {
    id: "source-isolation",
    eslint: ["paper/source-isolation", "no-restricted-imports"],
    ko: { title: "원본 격리", summary: "토큰 층(tokens/)만 원본 값을 읽습니다. 패키지는 tokens 배럴로만 들어가고, 앱과 fixture는 패키지를 exports로만 씁니다. inspector는 자기 시스템 하나를 @paper-ui/inspect/<시스템>으로 읽어 글자나 kit의 표시 부품으로만 보여주고, --pui- 변수는 문자열로 쓰지 않고 sourceVars()로 덮어씁니다. React Aria는 internal/aria 밖에서 import하지 않습니다." },
    en: { title: "Source isolation", summary: "Only the token layer reads raw values. The package enters it through the tokens barrel, and apps and fixtures use the package through its exports. An inspector reads its own system through @paper-ui/inspect/<system> and shows it as text or through the kit's display parts; a --pui- variable is never written as a string but overridden with sourceVars(). React Aria is imported only inside internal/aria." },
  },
  {
    id: "inline-token",
    eslint: ["paper/inline-token"],
    ko: { title: "inline style로 토큰 주입 금지", summary: "토큰은 .css.ts의 className으로만 적용합니다. 패키지와 앱의 .tsx에서 토큰 · styles · internal · 패키지에서 온 값이 style에 닿으면 막습니다. 실행 중에 정해지는 값만 예외이고 그 목록이 전부입니다." },
    en: { title: "No token in an inline style", summary: "A token is applied only through a .css.ts className. A value that comes from the tokens, styles, internal or the package and reaches a style in a package or app .tsx is rejected. Only a value of the moment is exempt, and the list is complete." },
  },
  {
    id: "source-numbers",
    eslint: ["paper/source-numbers"],
    ko: { title: "숫자는 원본에만", summary: "스타일 자리에 쓰는 숫자와 단위와 easing은 구조 값(0 · 100% · 1fr · 45° 배수 …) 말고는 원본 파일에만 있습니다. 패키지는 모든 범주를, 앱은 콘텐츠 치수(폭 · 높이 · 트랙)를 뺀 간격 · 형태 · 깊이 · 글자 · 투명도 · 시간 · 분기점을 역할로 고릅니다. 깊이는 elevation의 두 파일과 strokeRing에서만 나옵니다." },
    en: { title: "Numbers only in sources", summary: "A number, a unit or an easing in a style position is a source value unless it is structural (0, 100%, 1fr, a multiple of 45deg …). The package takes every category from roles; the app takes all but content dimensions (width, height, tracks). Depth comes only from the two elevation files and strokeRing." },
  },
  {
    id: "layered-styles",
    eslint: ["paper/layered-styles"],
    ko: { title: "패키지 CSS는 레이어 안에", summary: "패키지 .css.ts는 vanilla-extract의 규칙 API를 직접 부르지 않고 tokens/layers.css.ts의 layered()로 규칙을 만들어 모든 규칙이 cascade layer pui 안에 듭니다." },
    en: { title: "Package CSS inside a layer", summary: "A package .css.ts does not call vanilla-extract's rule APIs directly; it makes rules through layered() from tokens/layers.css.ts, so every rule sits inside the cascade layer pui." },
  },
  {
    id: "internal-class",
    eslint: ["paper/internal-class"],
    ko: { title: "내부 class 이름 문자열 금지", summary: "앱과 테스트는 pui- 뒤에 글자가 오는 문자열을 쓰지 않습니다. 공유 축의 class는 패키지의 typed map에서 고릅니다. 변수 --pui-*와 속성 data-pui-*는 통과합니다." },
    en: { title: "No internal class names", summary: "An app or a test does not write a string where pui- is followed by a letter. A shared axis picks its class from the package's typed maps. The variables --pui-* and attributes data-pui-* pass." },
  },
  {
    id: "global-class",
    eslint: ["paper/global-class"],
    ko: { title: "손으로 지은 전역 class 금지", summary: "앱 .css.ts의 globalStyle selector는 scoped class에서 시작합니다. 요소 · :root selector는 site/shell.css.ts에만 두고, 전역 keyframes와 전역 변수 이름은 짓지 않습니다." },
    en: { title: "No hand-named global class", summary: "A globalStyle selector in an app .css.ts starts from a scoped class. Element and :root selectors live only in site/shell.css.ts, and no global keyframes or variable name is made up." },
  },
  {
    id: "no-rule-disable",
    eslint: ["paper/no-rule-disable"],
    ko: { title: "규칙은 주석으로 끄지 않음", summary: "paper 규칙은 eslint-disable 주석으로 끄지 않고 예외는 manifest에만 선언합니다. 다른 규칙을 끄는 주석은 -- 뒤에 이유를 적습니다. 두 번째 lint(--no-inline-config)가 이를 한 번 더 확인합니다." },
    en: { title: "Rules are not switched off by comment", summary: "A paper rule is not switched off by an eslint-disable comment; an exception is declared in the manifest only. A comment that switches another rule off states its reason after --. A second lint run with --no-inline-config checks this once more." },
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
