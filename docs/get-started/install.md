# Installation

paper-ui를 React 앱에 붙이는 방법입니다. 패키지 하나와 스타일시트 한 줄이면 됩니다.

## 패키지

```bash
pnpm add @studio-baeks/paper-ui
```

[contract:install.package.peers]: #
paper-ui는 React 18.2 이상 또는 React 19를 peer dependency로 받습니다(`^18.2.0 || ^19.0.0`). 패키지는 ESM 전용이라 `require`를 지원하지 않습니다. 앱은 `import`로 불러오고, CommonJS 코드는 동적 `import()`로만 불러옵니다. TypeScript 타입은 entry마다 선언 파일 하나로 묶여 있고, `moduleResolution`이 `bundler` · `node16` · `nodenext` 중 하나이면 그 파일을 찾습니다.

[contract:install.entry.one-home]: #
패키지는 쓰임에 따라 entry를 나눕니다. 이름 하나는 한 entry에서만 나오므로, 같은 이름을 두 경로에서 고를 일은 없습니다.

[contract:install.entry.table]: #

| entry | 담는 것 |
|---|---|
| `@studio-baeks/paper-ui` | 컴포넌트, hook, `PaperProvider`와 그 prop 타입. 클라이언트에서 도는 코드라 `"use client"` 경계를 선언합니다. |
| `@studio-baeks/paper-ui/tokens` | `tokens`, 어휘 상수(`CONTROL_SIZES` · `SPACES` …)와 어휘 타입(`Space` · `Accent` · `Variant` …), 원본을 덮어쓰는 `sourceVars`([원본 덮어쓰기](#원본-덮어쓰기)). 축마다 상수와 타입이 한 짝이고, 목록은 [공개 어휘](../foundations/README.md#공개-어휘)에 있습니다. React와 CSS를 import하지 않는 값입니다. |
| `@studio-baeks/paper-ui/theme-boot` | 첫 화면 전에 테마를 적용하는 `themeBootScript`와 `THEME_STORAGE_KEY` · `THEME_ATTRIBUTE`. React와 CSS를 import하지 않으므로 빌드 도구와 서버가 단독으로 불러옵니다. [Theming](theming.md)에서 씁니다. |
| `@studio-baeks/paper-ui/styles.css` | 전역 스타일시트 하나. CSS 변수와 컴포넌트 스타일이 모두 여기에 들어 있습니다. |

## 스타일 불러오기

컴포넌트를 쓰기 전에 앱 진입점에서 스타일시트를 한 번 import 합니다. 스타일이 들어오는 길은 이 한 줄뿐입니다. 이 한 줄이 `:root`에 모든 CSS 변수(색·크기·타이포)를 깔고 컴포넌트 스타일을 함께 들여옵니다.

```ts
import "@studio-baeks/paper-ui/styles.css";
```

[contract:install.styles.provider-warning]: #
컴포넌트와 `PaperProvider`는 CSS를 import하지 않습니다. 그래서 이 줄을 빠뜨린 앱은 스타일 없는 화면을 받습니다. 개발 중에는 `PaperProvider`가 스타일시트가 없다는 경고를 콘솔에 한 번 남깁니다.

## 우선순위

[contract:install.layers.every-rule-layered]: #
패키지의 CSS 규칙은 모두 cascade layer `pui` 안에 있습니다. `pui`는 다섯 하위 레이어로 나뉘고, 뒤에 선언된 레이어가 특정도와 무관하게 앞의 레이어를 이깁니다.

```text
pui.reset < pui.theme < pui.base < pui.utilities < pui.components
```

[contract:install.layers.contents]: #
`reset`에는 box-sizing과 body 여백, 부품 button의 reset(`bareButton`), `theme`에는 CSS 변수, `base`에는 문서 바탕(body의 면과 body 역할의 글자, 포커스 링)이 있습니다. `utilities`에는 면·잉크·간격·높이·글자 역할과 preset·등장과 반복(`presence` · `loop`)처럼 공유 축의 이름이 고르는 class가, `components`에는 Primitive와 Atom의 스타일과 reduced motion 정책이 있습니다. 그래서 타입 preset과 크기 · 색이 button reset을 이깁니다. `@keyframes`와 `@property`만 레이어 밖에 섭니다.

[contract:install.layers.app-css-wins]: #
앱의 CSS는 레이어 밖에 두는 것이 기본입니다. 레이어 밖의 CSS는 로드 순서와 특정도에 상관없이 패키지 CSS를 이깁니다. 그래서 앱이 컴포넌트에 넘긴 className은 스타일시트가 어떤 순서로 실리든 hover·disabled 같은 상태 규칙까지 덮습니다. `!important`는 반대로 레이어 안의 것이 이깁니다. 사용자가 움직임을 줄였을 때(reduced motion) 패키지가 거는 `!important`는 앱의 `!important`보다 강합니다.

같은 이유로 앱의 요소 reset(예: `button { background: none }`)도 레이어 밖에 두면 컴포넌트 스타일까지 이깁니다. 전역 reset은 `pui`보다 먼저 선언한 레이어에 넣어주세요. 레이어의 순서는 처음 선언된 순서로 정해지므로, 아래 선언을 담은 CSS는 `styles.css`보다 먼저 불러와야 합니다.

```css
@layer reset, pui;

@layer reset {
  button { background: none; }
}
```

## 이 스타일시트가 거는 전역 규칙

패키지의 규칙은 거의 모두 class를 단 요소에만 걸립니다. class 없이 문서나 요소 전체에 거는 규칙은 아래 표가 전부이고, 모두 `pui` 레이어 안에 있습니다. 레이어 밖에 서는 것은 `@keyframes`와 `@property`뿐입니다. `PaperProvider`가 DOM wrapper를 만들지 않는다는 말은 이 표와 별개입니다 — Provider는 요소를 더하지 않고, 아래 규칙은 스타일시트를 불러오면 Provider가 없어도 걸립니다.

[contract:install.stylesheet.global-rules]: #

| 레이어 | 선택자 | 거는 것 |
|---|---|---|
| `pui.reset` | `*` | `box-sizing: border-box` |
| `pui.reset` | `body` | `margin: 0` |
| `pui.theme` | `:root` | Shape · Layout · Typography 원본 변수와 투명도, 라이트 모드의 색 역할, 기본값 `color-scheme: light` |
| `pui.theme` | `:root[data-pui-theme=light]`, `[data-pui-theme=light]` | 라이트 모드의 색 역할과 `color-scheme: light` |
| `pui.theme` | `:root[data-pui-theme=light]`, `[data-pui-theme=light] > *` | 지면 역할 — 포커스 링 색, 그림자 색, 그림자 기하 |
| `pui.theme` | `:root[data-pui-theme=dark]`, `[data-pui-theme=dark]` | 다크 모드의 색 역할과 `color-scheme: dark` |
| `pui.theme` | `:root[data-pui-theme=dark]`, `[data-pui-theme=dark] > *` | 지면 역할 |
| `pui.theme` | `:root:not([data-pui-theme])` | `prefers-color-scheme: dark`일 때 `<html>`에 속성이 없으면 다크 모드의 색 역할과 `color-scheme: dark` |
| `pui.base` | `body` | 문서의 면(`bg.canvas`), 잉크(`ink.primary`), body 역할의 글자 |
| `pui.base` | `:where([data-pui-theme])` | 스코프 잉크 — 모드 스코프 안의 글자는 그 모드의 `ink.primary`를 받습니다(특정도 0) |
| `pui.base` | `:root[data-pui-theme-swap] *`, `:root[data-pui-theme-swap] ::before`, `:root[data-pui-theme-swap] ::after` | 테마를 바꾸는 동안 전환을 즉시로 만듭니다(`!important`) |
| `pui.base` | `:where(:focus-visible)` | 포커스 링 baseline — `outline`의 두께 · 색 · offset만 정하고 모서리는 건드리지 않습니다(특정도 0) |
| `pui.components` | `*`, `::before`, `::after` | `prefers-reduced-motion: reduce`이면 전환과 애니메이션을 거의 0으로 줄이는 정책(`!important`). `loop`의 반복은 이 정책보다 앞선 레이어에서 자기 줄인 모습을 `!important`로 지킵니다 |

`prefers-contrast: more`이면 `pui.theme`의 `:root`와 모드 선택자들이 같은 스코프에서 경계 셋과 `ink.tertiary`를 한 단 올려 다시 선언합니다. 이 규칙을 끄려면 레이어 밖에 규칙을 하나 두면 됩니다. 레이어 밖의 CSS는 특정도와 로드 순서에 상관없이 이기므로, `body { margin: 8px }`나 `:where(:focus-visible) { outline: none }`이 그대로 적용됩니다.

## 원본 덮어쓰기

한 영역의 크기나 간격만 바꾸고 싶다면 역할이 아니라 원본을 덮어씁니다. 컨트롤 높이 같은 원본을 하위 트리에서 하나 바꾸면 그 위에 지은 역할이 그 자리에서 다시 계산됩니다([Shape › 원본 덮어쓰기](../foundations/shape.md#원본-덮어쓰기)). `sourceVars()`는 원본의 경로에서 방출되는 변수 이름을 만들어 주므로, 변수 이름을 문자열로 적지 않아도 됩니다.

```ts
import { style } from "@vanilla-extract/css";
import { sourceVars } from "@studio-baeks/paper-ui/tokens";

export const dense = style({
  vars: sourceVars({ shape: { control: { height: { md: "40px" } } } }),
});
```

경로는 `shape` · `layout` · `typography` 원본에서 시작하고, 역할의 경로는 타입이 막고 모르는 경로는 실행 때 던집니다. 결과는 React의 `style`에도 그대로 들어갑니다. 그 영역에서 연 Floating의 panel도 덮어쓴 원본을 따라갑니다. 색 역할은 이 길로 덮어쓰지 않습니다 — 색은 테마 스코프가 정합니다([테마](theming.md)).

## 실행 환경

paper-ui는 브라우저에서 렌더하는 앱(CSR)과 서버에서 HTML을 먼저 그리는 앱(SSR · RSC)을 모두 대상으로 합니다. 환경마다 달라지는 것은 어느 entry에서 무엇을 가져오느냐입니다.

[contract:install.runtime.environments]: #
- **CSR** — 네 entry를 위 표대로 씁니다.
- **SSR** — 서버가 컴포넌트를 HTML로 그리고 브라우저가 그 위에 이어 붙습니다. 스타일시트는 서버가 내려 주는 문서의 `<head>`에 들어 있어야 첫 화면부터 스타일이 섭니다.
- **RSC** — 루트 entry는 `"use client"` 경계입니다. 서버 컴포넌트는 `tokens`와 어휘를 `@studio-baeks/paper-ui/tokens`에서 import합니다. 루트 entry의 컴포넌트는 클라이언트 컴포넌트로 렌더되므로, 서버 컴포넌트가 넘기는 prop은 직렬화할 수 있는 값이어야 하고 hook은 클라이언트 컴포넌트 안에서만 부릅니다. class 지도(`elevation` · `presence` · `loop`)와 class 함수(`surfaceClass` · `paintClass`)도 루트 entry의 export라서 클라이언트 entry에 속합니다. 서버 컴포넌트가 이것을 import하면 값이 아니라 client reference를 받으므로, class가 필요한 자리는 클라이언트 컴포넌트 안에 둡니다.

## 지원 브라우저

[contract:install.browsers.baseline]: #
paper-ui는 Chrome·Edge 125, Firefox 121, Safari 16.4(iOS 포함) 이상을 지원합니다. Chrome · Edge의 하한은 `round()`, Firefox의 하한은 `:has()`가 정하고, 버튼의 좌우 여백과 빈 선택을 보여 주는 Select가 이 두 기능에 기댑니다. Safari의 하한은 hover tint의 전이를 주는 `@property`가 들어온 판입니다. 하한보다 새로운 CSS 기능은 enhancement로만 쓰고, 그 기능이 없는 하한 브라우저에서는 움직임만 빠집니다.

## 첫 화면

[contract:install.provider.first-screen]: #
Provider로 감싸고 컴포넌트를 배치합니다. Provider는 DOM wrapper를 만들지 않아 레이아웃에 영향을 주지 않습니다 — 테마는 `<html data-pui-theme>`으로 전역에 겁니다.

```tsx
import { PaperProvider, Stack, Text, Button } from "@studio-baeks/paper-ui";

export const App = () => (
  <PaperProvider>
    <Stack gap="md" padding="xl">
      <Text variant="title">안녕하세요</Text>
      <Button>시작하기</Button>
    </Stack>
  </PaperProvider>
);
```

[contract:install.provider.settings]: #
`PaperProvider`가 고르는 설정은 테마, 언어(`locale`), 문구(`messages`)입니다. `defaultTheme`으로 `light`·`dark`·`system`(기본) 중 하나를 주고, `system`이면 OS 설정(`prefers-color-scheme`)을 따라갑니다. 사용자가 고른 값은 localStorage의 `storageKey`(기본 `pui-theme`)에 남아 다음 방문에 이깁니다. 첫 화면 전에 적용하는 부팅 스크립트와 저장 규칙은 [Theming](theming.md)에 있습니다. `locale`은 Atom이 스스로 말하는 문구의 언어를 정하고, 줄 때만 `<html lang>`과 `<html dir>`에 씁니다. 주지 않으면 `<html lang>`을 읽을 뿐 `<html>`을 건드리지 않습니다([테마와 언어](../primitives/README.md#테마와-언어)).

[contract:install.provider.no-primary-color]: #
브랜드 색을 고르는 설정은 없습니다. 이 시스템엔 `primaryColor`가 없습니다 — 정체성이 색이 아니라 순백·검정·여백에서 나오기 때문입니다. 자세한 이유는 [원칙](philosophy.md)에 있습니다.

## 테마 토글

[contract:install.provider.use-theme]: #
토글 UI를 직접 만들 때는 `useTheme`을 씁니다. `theme`은 사용자의 선택(`system` 포함), `resolved`는 실제로 적용된 `light`/`dark`입니다.

```tsx
import { Icon, IconButton, useTheme } from "@studio-baeks/paper-ui";

const ThemeToggle = () => {
  const { resolved, setTheme } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  return (
    <IconButton variant="hairline" aria-label={next === "dark" ? "다크 테마로 전환" : "라이트 테마로 전환"} onClick={() => setTheme(next)}>
      <Icon>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </Icon>
    </IconButton>
  );
};
```

화면 일부만 다른 모드로 두려면 `<Surface theme="inverse">`처럼 Surface의 `theme`을 씁니다 — 같은 엔진입니다.

## 폰트

서체는 Typography 계약의 일부입니다. 시스템은 서체 파일을 번들하지 않지만, 굵기 사다리(400 · 450 · 500 · 600 · 650 · 700)는 Pretendard Variable이 있다고 전제하고 세워져 있습니다. sans는 Pretendard를 맨 앞에 둡니다 — 라틴과 한글을 한 몸으로 그려 굵기가 균형을 잃지 않기 때문이고, `-apple-system`은 그 뒤 fallback입니다. mono는 OS의 등폭 서체(ui-monospace · SF Mono · Menlo · Consolas)를 먼저 쓰고 한글은 D2Coding으로 떨어집니다. 서체 스택의 정본은 [Typography](../foundations/typography.md#서체)에 있고, 앱에서는 아래 두 스타일시트를 직접 불러오세요.

[contract:install.fonts.snippet-matches-app]: #
아래 두 줄은 Pretendard(v1.3.9)와 D2Coding을 불러옵니다. 두 스타일시트 주소는 모두 버전을 고정합니다. D2Coding 저장소에는 release tag가 없어서 커밋으로 고정하고, 그 스타일시트가 가리키는 글꼴 파일은 저장소의 기본 브랜치를 따릅니다.

<!-- generated:install-fonts -->
<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fonts-archive/D2Coding@5ac6fc6fada70f1d8a8561cec826722574c51a6e/D2Coding.css" />
```
<!-- /generated:install-fonts -->

[contract:install.fonts.stylesheets]: #
두 주소는 패키지가 `FONT_STYLESHEETS`(`@studio-baeks/paper-ui/tokens`)로 공개하는 값과 같습니다. 이 사이트도 페이지에 정확히 이 두 스타일시트만 불러옵니다.

[contract:install.fonts.geometry-without-font]: #
서체를 불러오지 않으면 굵기 사다리가 접힙니다. Windows(Segoe UI·맑은 고딕)에서는 450·500이 400으로, 600·650이 700으로 접히고, Android(Roboto)에서는 450이 500으로, 600·650이 700으로 접힙니다. macOS는 대부분의 단계를 유지합니다. 행간이 px 고정값이라 접혀도 컨트롤의 높이와 안쪽 여백은 그대로이고, 글자의 굵기 차이만 줄어듭니다. 한글 mono는 D2Coding이 없으면 시스템 CJK 글꼴로 떨어집니다.

표의 숫자 열은 mono가 아니라 sans에 `tabular-nums`로 자리만 맞춥니다 — 등폭은 코드·토큰 같은 기술적인 자리에만 씁니다.

## 검증

[contract:install.smoke.steps]: #
`pnpm smoke:dist`가 이 문서의 약속을 npm에 올라갈 모습 그대로 확인합니다. 워크스페이스가 아니라 `pnpm pack`으로 묶은 tarball을 임시 폴더에 풀고, publint(`--strict`)와 attw(esm-only)로 exports 형태를 검사하고, 빌드된 스타일시트가 쓰는 CSS 기능을 [지원 브라우저](#지원-브라우저)의 하한과 대조한 다음, 같은 tarball을 설치한 React 19와 React 18.2 소비자 앱을 각각 짓습니다. 소비자 앱은 vanilla-extract 없이 `tsc`(`bundler`와 `node16` 해석, `skipLibCheck` 끔)와 Vite 빌드를 통과하고, Playwright가 두 빌드를 `vite preview`로 띄워 아래를 봅니다.

[contract:install.styles.single-import]: #
소비자가 불러오는 스타일은 `styles.css` 하나뿐이고, 그것만으로 `:root`에 원본 변수와 라이트 모드의 색 역할이 서며 md Button의 높이가 Shape 원본의 값과 같습니다.

[contract:install.entry.exports-render]: #
루트 entry의 export는 모두 두 React에서 콘솔 오류 없이 렌더되거나 실행됩니다. 확인하는 목록은 `INVENTORY`이고, 목록에 있는 이름을 하네스가 빠뜨리면 검증이 실패합니다. 위 [우선순위](#우선순위)의 `install.layers.app-css-wins`도 같은 소비자 앱에서 확인합니다.

[contract:install.entry.tokens-server-safe]: #
`/tokens`와 `/theme-boot`는 React를 import하지 않고 `"use client"`를 달지 않습니다. 검증은 두 entry와 그것이 부르는 chunk의 import를 읽고, `react-server` 조건의 Node에서 두 entry를 실제로 불러옵니다. 루트 entry의 첫 문장은 `"use client"`입니다. 스타일시트가 선택자 수준에서 지키는 규칙은 [이 스타일시트가 거는 전역 규칙](#이-스타일시트가-거는-전역-규칙)의 표와 같고, 같은 검증에서 빌드된 `dist/paper-ui.css`와 대조합니다.

## 공개 이름의 기록

[contract:install.api.surface-recorded]: #
패키지가 내보내는 이름은 `packages/paper-ui/api/surface.json`에 기록됩니다. 네 entry의 값과 타입 이름, `tokens`의 leaf 경로, 스타일시트가 내는 CSS 변수와 레이어의 이름, 버전이 들어 있고, `api.test.ts`가 소스에서 계산한 값과 같은지 확인합니다. 이름이 생기거나 사라지거나 옮겨 가면 같은 변경에서 `pnpm api:update`로 기록을 고치고, 그 diff가 리뷰에서 API 변경으로 읽힙니다.

[contract:install.api.bump-required]: #
이미 낸 버전의 기록(`api/released/<버전>.json`)은 바꿀 수 없고, `pnpm api:update`는 그 버전의 이름을 바꾸려는 시도를 거부합니다. 새 버전은 변경에 맞게 올라야 합니다 — 0.x에서는 이름이 사라지거나 바뀌면 minor, 더하기만 하면 patch이고, 1.0 이후에는 각각 major와 minor입니다. 새 버전은 `CHANGELOG.md`에 `## <버전>` 제목도 가져야 합니다. 발행 직전(`prepublishOnly`)에 그 버전의 기록이 `api/released/`에 남습니다. pre-release(`x.y.z-alpha` · `x.y.z-beta` · `x.y.z-rc.n`)의 기록도 똑같이 고정되지만 다음 버전에 이름을 약속하지 않으므로, bump는 마지막 정식 버전에서 잽니다.
