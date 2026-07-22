# 설치

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

Provider로 감싸고 컴포넌트를 배치합니다. Provider는 DOM wrapper를 만들지 않아 레이아웃에 영향을 주지 않습니다.

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

`PaperProvider`가 받는 설정은 없습니다. 이 시스템엔 `primaryColor`도, 테마 토글도 없습니다 — 정체성이 색이 아니라 순백·검정·여백에서 나오기 때문입니다. 자세한 이유는 [원칙](principles.md)에 있습니다.

## 폰트

시스템은 서체를 번들하지 않습니다. 라틴은 `-apple-system`(macOS의 SF)을, 한글은 Pretendard를 기본으로 삼고, 숫자는 JetBrains Mono를 씁니다. Pretendard·JetBrains Mono를 쓰려면 앱에서 직접 불러오세요.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.min.css" />
```

폰트를 안 불러와도 시스템 폰트로 정상 동작합니다. 서체는 권장이지 필수가 아닙니다.
