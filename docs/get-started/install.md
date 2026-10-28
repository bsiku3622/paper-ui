# Installation

paper-ui를 React 앱에 붙이는 방법입니다. 패키지 하나와 스타일시트 한 줄이면 됩니다.

## 패키지

```bash
pnpm add @studio-baeks/paper-ui
```

paper-ui는 React 18.2 이상 또는 React 19를 peer dependency로 받습니다(`^18.2.0 || ^19.0.0`). 패키지는 ESM 전용이라 `require`를 지원하지 않습니다. 앱은 `import`로 불러오고, CommonJS 코드는 동적 `import()`로만 불러옵니다. TypeScript 타입은 entry마다 선언 파일 하나로 묶여 있고, `moduleResolution`이 `bundler` · `node16` · `nodenext` 중 하나이면 그 파일을 찾습니다.

패키지는 쓰임에 따라 entry를 나눕니다. 이름 하나는 한 entry에서만 나오므로, 같은 이름을 두 경로에서 고를 일은 없습니다.

| entry | 담는 것 |
|---|---|
| `@studio-baeks/paper-ui` | 컴포넌트, hook, `PaperProvider`와 그 prop 타입. 클라이언트에서 도는 코드라 `"use client"` 경계를 선언합니다. |
| `@studio-baeks/paper-ui/tokens` | `tokens`, 어휘 상수(`CONTROL_SIZES` · `SPACES` …)와 어휘 타입(`Space` · `Accent` · `Variant` …). 축마다 상수와 타입이 한 짝이고, 목록은 [공개 어휘](../foundations/README.md#공개-어휘)에 있습니다. React와 CSS를 import하지 않는 값입니다. |
| `@studio-baeks/paper-ui/styles.css` | 전역 스타일시트 하나. CSS 변수, 유틸리티 클래스, 컴포넌트 스타일이 모두 여기에 들어 있습니다. |

## 스타일 불러오기

컴포넌트를 쓰기 전에 앱 진입점에서 스타일시트를 한 번 import 합니다. 스타일이 들어오는 길은 이 한 줄뿐입니다. 이 한 줄이 `:root`에 모든 CSS 변수(색·크기·타이포)를 깔고, 유틸리티 클래스와 컴포넌트 스타일을 함께 들여옵니다.

```ts
import "@studio-baeks/paper-ui/styles.css";
```

컴포넌트와 `PaperProvider`는 CSS를 import하지 않습니다. 그래서 이 줄을 빠뜨린 앱은 스타일 없는 화면을 받습니다. 개발 중에는 `PaperProvider`가 스타일시트가 없다는 경고를 콘솔에 한 번 남깁니다.

## 우선순위

[contract:install.layers.every-rule-layered]: #
패키지의 CSS 규칙은 모두 cascade layer `pui` 안에 있습니다. `pui`는 다섯 하위 레이어로 나뉘고, 뒤에 선언된 레이어가 특정도와 무관하게 앞의 레이어를 이깁니다.

```text
pui.reset < pui.theme < pui.base < pui.utilities < pui.components
```

`reset`에는 box-sizing과 body 여백, `theme`에는 CSS 변수, `base`에는 문서 바탕(body의 면과 글자, 포커스 링, Text 역할, reduced motion)이 있습니다. `utilities`에는 유틸리티 클래스가, `components`에는 Primitive와 Atom의 스타일이 있습니다. `@keyframes`와 `@property`만 레이어 밖에 섭니다.

[contract:install.layers.app-css-wins]: #
앱의 CSS는 레이어 밖에 두는 것이 기본입니다. 레이어 밖의 CSS는 로드 순서와 특정도에 상관없이 패키지 CSS를 이깁니다. 그래서 앱이 컴포넌트에 넘긴 className은 스타일시트가 어떤 순서로 실리든 hover·disabled 같은 상태 규칙까지 덮습니다. `!important`는 반대로 레이어 안의 것이 이깁니다. 사용자가 움직임을 줄였을 때(reduced motion) 패키지가 거는 `!important`는 앱의 `!important`보다 강합니다.

같은 이유로 앱의 요소 reset(예: `button { background: none }`)도 레이어 밖에 두면 컴포넌트 스타일까지 이깁니다. 전역 reset은 `pui`보다 먼저 선언한 레이어에 넣어주세요. 레이어의 순서는 처음 선언된 순서로 정해지므로, 아래 선언을 담은 CSS는 `styles.css`보다 먼저 불러와야 합니다.

```css
@layer reset, pui;

@layer reset {
  button { background: none; }
}
```

## 실행 환경

paper-ui는 브라우저에서 렌더하는 앱(CSR)과 서버에서 HTML을 먼저 그리는 앱(SSR · RSC)을 모두 대상으로 합니다. 환경마다 달라지는 것은 어느 entry에서 무엇을 가져오느냐입니다.

- **CSR** — 세 entry를 위 표대로 씁니다.
- **SSR** — 서버가 컴포넌트를 HTML로 그리고 브라우저가 그 위에 이어 붙습니다. 스타일시트는 서버가 내려 주는 문서의 `<head>`에 들어 있어야 첫 화면부터 스타일이 섭니다.
- **RSC** — 루트 entry는 `"use client"` 경계입니다. 서버 컴포넌트는 `tokens`와 어휘를 `@studio-baeks/paper-ui/tokens`에서 import합니다. 루트 entry의 컴포넌트는 클라이언트 컴포넌트로 렌더되므로, 서버 컴포넌트가 넘기는 prop은 직렬화할 수 있는 값이어야 하고 hook은 클라이언트 컴포넌트 안에서만 부릅니다.

## 지원 브라우저

[contract:install.browsers.baseline]: #
paper-ui는 Chrome·Edge 125, Firefox 121, Safari 16.4(iOS 포함) 이상을 지원합니다. 하한을 정하는 기능은 `round()` · `:has()` · `:dir()`입니다. 버튼의 좌우 여백, Field·Select의 키보드 포커스 링, 오른쪽에서 왼쪽으로 쓰는 화면의 Switch가 이 세 기능에 기댑니다. 하한보다 새로운 CSS 기능은 enhancement로만 쓰고, 그 기능이 없는 하한 브라우저에서는 움직임만 빠집니다.

## 첫 화면

Provider로 감싸고 컴포넌트를 배치합니다. Provider는 DOM wrapper를 만들지 않아 레이아웃에 영향을 주지 않습니다 — 테마는 `<html data-theme>`으로 전역에 겁니다.

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

`PaperProvider`가 고르는 설정은 하나뿐입니다 — 테마입니다. `defaultTheme`으로 `light`·`dark`·`system`(기본) 중 하나를 주고, `system`이면 OS 설정(`prefers-color-scheme`)을 따라갑니다. 사용자가 고른 값은 localStorage에 남아 다음 방문에 이깁니다.

브랜드 색을 고르는 설정은 없습니다. 이 시스템엔 `primaryColor`가 없습니다 — 정체성이 색이 아니라 순백·검정·여백에서 나오기 때문입니다. 자세한 이유는 [원칙](philosophy.md)에 있습니다.

## 테마 토글

토글 UI를 직접 만들 때는 `useTheme`을 씁니다. `theme`은 사용자의 선택(`system` 포함), `resolved`는 실제로 적용된 `light`/`dark`입니다.

```tsx
import { useTheme } from "@studio-baeks/paper-ui";

const ThemeToggle = () => {
  const { resolved, setTheme } = useTheme();
  return (
    <Button variant="quiet" onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}>
      {resolved === "dark" ? "라이트" : "다크"}
    </Button>
  );
};
```

화면 일부만 반대 테마로 뒤집으려면 `<ThemeScope>`나 `<Box inverse>`를 씁니다 — 같은 엔진입니다.

## 폰트

시스템은 서체를 번들하지 않습니다. sans는 Pretendard를 맨 앞에 둡니다 — 라틴과 한글을 한 몸으로 그려 굵기가 균형을 잃지 않기 때문이고, `-apple-system`은 그 뒤 fallback입니다. mono는 OS의 등폭 서체(SF Mono·Cascadia)를 먼저 쓰고 한글은 D2Coding으로 떨어집니다. Pretendard와 한글 mono를 쓰려면 앱에서 아래 두 스타일시트를 직접 불러오세요.

[contract:install.fonts.snippet-matches-app]: #
아래 두 줄은 Pretendard(v1.3.9)와 D2Coding을 불러옵니다. 두 스타일시트 주소는 모두 버전을 고정합니다. D2Coding 저장소에는 release tag가 없어서 커밋으로 고정하고, 그 스타일시트가 가리키는 글꼴 파일은 저장소의 기본 브랜치를 따릅니다.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fonts-archive/D2Coding@5ac6fc6fada70f1d8a8561cec826722574c51a6e/D2Coding.css" />
```

폰트를 안 불러와도 시스템 폰트로 정상 동작합니다. 서체는 권장이지 필수가 아닙니다. 표의 숫자 열은 mono가 아니라 sans에 `tabular-nums`로 자리만 맞춥니다 — 등폭은 코드·토큰 같은 기술적인 자리에만 씁니다.
