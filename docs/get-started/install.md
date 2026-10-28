# Installation

paper-ui를 React 앱에 붙이는 방법입니다. 패키지 하나와 스타일시트 한 줄이면 됩니다.

## 패키지

```bash
pnpm add @studio-baeks/paper-ui
```

React 18 이상이 필요합니다 (peer dependency).

패키지는 쓰임에 따라 entry를 나눕니다. 이름 하나는 한 entry에서만 나오므로, 같은 이름을 두 경로에서 고를 일은 없습니다.

| entry | 담는 것 |
|---|---|
| `@studio-baeks/paper-ui` | 컴포넌트, hook, `PaperProvider`와 그 prop 타입. 클라이언트에서 도는 코드라 `"use client"` 경계를 선언합니다. |
| `@studio-baeks/paper-ui/tokens` | `tokens`, 어휘 상수(`CONTROL_SIZES` · `SPACE_KEYS` …)와 어휘 타입(`Space` · `Accent` · `Variant` …). React와 CSS를 import하지 않는 값입니다. |
| `@studio-baeks/paper-ui/styles.css` | 전역 스타일시트 하나. CSS 변수, 유틸리티 클래스, 컴포넌트 스타일이 모두 여기에 들어 있습니다. |

## 스타일 불러오기

컴포넌트를 쓰기 전에 앱 진입점에서 스타일시트를 한 번 import 합니다. 스타일이 들어오는 길은 이 한 줄뿐입니다. 이 한 줄이 `:root`에 모든 CSS 변수(색·크기·타이포)를 깔고, 유틸리티 클래스와 컴포넌트 스타일을 함께 들여옵니다.

```ts
import "@studio-baeks/paper-ui/styles.css";
```

컴포넌트와 `PaperProvider`는 CSS를 import하지 않습니다. 그래서 이 줄을 빠뜨린 앱은 스타일 없는 화면을 받습니다. 개발 중에는 `PaperProvider`가 스타일시트가 없다는 경고를 콘솔에 한 번 남깁니다.

## 실행 환경

paper-ui는 브라우저에서 렌더하는 앱(CSR)과 서버에서 HTML을 먼저 그리는 앱(SSR · RSC)을 모두 대상으로 합니다. 환경마다 달라지는 것은 어느 entry에서 무엇을 가져오느냐입니다.

- **CSR** — 세 entry를 위 표대로 씁니다.
- **SSR** — 서버가 컴포넌트를 HTML로 그리고 브라우저가 그 위에 이어 붙습니다. 스타일시트는 서버가 내려 주는 문서의 `<head>`에 들어 있어야 첫 화면부터 스타일이 섭니다.
- **RSC** — 루트 entry는 `"use client"` 경계입니다. 서버 컴포넌트는 `tokens`와 어휘를 `@studio-baeks/paper-ui/tokens`에서 import합니다. 루트 entry의 컴포넌트는 클라이언트 컴포넌트로 렌더되므로, 서버 컴포넌트가 넘기는 prop은 직렬화할 수 있는 값이어야 하고 hook은 클라이언트 컴포넌트 안에서만 부릅니다.

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
