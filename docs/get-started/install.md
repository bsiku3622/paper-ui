# Installation

paper-ui를 React 앱에 붙이는 방법입니다. 패키지 하나와 스타일시트 한 줄이면 됩니다.

## 패키지

```bash
pnpm add @studio-baeks/paper-ui
```

React 18 이상이 필요합니다 (peer dependency).

## 스타일 불러오기

컴포넌트를 쓰기 전에 앱 진입점에서 스타일시트를 한 번 import 합니다. 이 한 줄이 `:root`에 모든 CSS 변수(색·크기·타이포)를 깔고, 컴포넌트가 참조하는 유틸리티 클래스를 emit 합니다.

```ts
import "@studio-baeks/paper-ui/styles.css";
```

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

시스템은 서체를 번들하지 않습니다. sans는 Pretendard를 맨 앞에 둡니다 — 라틴과 한글을 한 몸으로 그려 굵기가 균형을 잃지 않기 때문이고, `-apple-system`은 그 뒤 fallback입니다. mono는 OS의 등폭 서체(SF Mono·Cascadia)를 먼저 쓰고 한글은 D2Coding으로 떨어집니다. Pretendard를 쓰려면 앱에서 직접 불러오세요.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.min.css" />
```

폰트를 안 불러와도 시스템 폰트로 정상 동작합니다. 서체는 권장이지 필수가 아닙니다. 표의 숫자 열은 mono가 아니라 sans에 `tabular-nums`로 자리만 맞춥니다 — 등폭은 코드·토큰 같은 기술적인 자리에만 씁니다.
