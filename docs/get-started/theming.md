# Theming

paper-ui의 테마는 두 가지를 구분합니다. **선택**은 사용자가 고른 `light` · `dark` · `system`이고, **모드**는 화면에 실제로 적용된 `light` 또는 `dark`입니다. `system`을 고르면 OS 설정(`prefers-color-scheme`)이 모드를 정합니다.

모드의 정본은 `<html data-pui-theme>` 속성 하나입니다. 스타일시트도 hook도 이 속성을 읽고, 속성이 없으면 OS 설정을 따릅니다([Color](../foundations/color.md#테마-스코프)). 속성을 쓰는 쪽은 셋입니다 — `<head>`의 부팅 스크립트, `PaperProvider`, 그리고 외부 테마 관리자.

## Provider와 저장

`PaperProvider`는 선택을 저장하고, 고른 모드를 `<html>`에 씁니다. DOM wrapper를 만들지 않고, 스타일시트도 import하지 않습니다.

```tsx
<PaperProvider defaultTheme="system" storageKey="pui-theme">…</PaperProvider>
```

| prop | 기본값 | 뜻 |
|---|---|---|
| `defaultTheme` | `system` | 사용자가 고르기 전의 선택. 저장된 값이 있으면 그 값이 이깁니다 |
| `storageKey` | `pui-theme` | 선택을 담는 localStorage 키. `null`이면 저장하지 않습니다 |

[contract:foundations.theme.storage]: #
선택은 `setTheme`가 부를 때만 `storageKey`로 localStorage에 쓰입니다. `storageKey`가 `null`이면 저장소를 읽지도 쓰지도 않고, 선택은 그 페이지에만 남습니다. 저장소가 막혀 있어도(사생활 보호 모드 등) 오류 없이 같은 방식으로 동작합니다.

[contract:foundations.theme.one-store]: #
문서 하나에는 테마 저장소가 하나뿐입니다. `PaperProvider`는 중첩하거나 나란히 몇 개를 놓아도 그 저장소 하나에 붙어 같은 선택과 같은 모드를 봅니다. 마지막 Provider가 사라지면 `<html>`의 속성은 Provider가 붙기 전의 값으로 돌아갑니다. 설정이 서로 다른 Provider를 두면 먼저 설정한 쪽이 이기고, 개발 중에 오류가 한 번 남습니다.

## 첫 화면 전에 적용하기

Provider는 앱이 실행된 뒤에야 속성을 쓰므로, 그것만으로는 어두운 화면을 쓰는 사용자가 밝은 화면을 잠깐 봅니다. `@studio-baeks/paper-ui/theme-boot`의 `themeBootScript`가 만드는 짧은 인라인 스크립트를 `<head>` 맨 앞에 두면 이 간격이 없어집니다. React도 CSS도 import하지 않는 entry라 빌드 도구와 서버가 단독으로 불러옵니다.

[contract:foundations.theme.boot-before-paint]: #
부팅 스크립트는 앱의 JavaScript가 돌기 전에 `<html data-pui-theme>`를 씁니다. 저장된 선택이 있으면 그 선택이, 없으면 `defaultTheme`이 정하고, `system`이면 OS 설정을 따릅니다. 그래서 저장된 `light`는 어두운 OS보다 이깁니다.

옵션은 Provider와 같아야 합니다. 같은 `storageKey`와 `defaultTheme`을 두 곳에 넘기세요.

Vite는 `transformIndexHtml`로 넣습니다.

```ts
import { defineConfig } from "vite";
import { themeBootScript } from "@studio-baeks/paper-ui/theme-boot";

export default defineConfig({
  plugins: [
    {
      name: "theme-boot",
      transformIndexHtml: () => [{ tag: "script", children: themeBootScript(), injectTo: "head-prepend" }],
    },
  ],
});
```

SSR은 문서의 `<head>`에 인라인 `<script>`로 넣습니다. 스크립트가 서버가 그린 `<html>`에 속성을 더하므로 `<html>`에는 `suppressHydrationWarning`을 줍니다. CSP를 쓰는 앱은 이 스크립트에 nonce나 hash를 붙입니다.

```tsx
import { themeBootScript } from "@studio-baeks/paper-ui/theme-boot";

export const Document = ({ children }: { children: React.ReactNode }) => (
  <html lang="ko" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: themeBootScript() }} />
    </head>
    <body>{children}</body>
  </html>
);
```

## 외부 테마 관리자

속성이 정본이라 다른 테마 관리자가 `<html data-pui-theme="dark">`를 쓰기만 해도 스타일시트와 `useResolvedTheme`이 따라갑니다. Provider는 붙을 때 자기 선택을 한 번 쓰고, 그 뒤에 다른 쪽이 쓴 속성은 되돌리지 않고 읽습니다. 서버가 쿠키로 아는 테마가 있다면 그 값을 서버가 `<html data-pui-theme>`에 직접 쓰는 편이 가장 정확합니다.

## hook

| hook | Provider | 돌려주는 것 |
|---|---|---|
| `useTheme()` | 안에서만 | `theme`(선택, `system` 포함) · `resolved`(`<html>`이 보이는 모드) · `setTheme(선택)` |
| `useResolvedTheme()` | 어디서나 | 가장 가까운 Box `theme`의 모드, 없으면 Provider의 모드, 없으면 `<html>` 속성(속성이 없으면 OS 설정) |

`useTheme`을 Provider 밖에서 부르면 오류입니다. 선택을 바꾸는 주인이 Provider이기 때문입니다. `useResolvedTheme`은 읽기만 하므로 Provider 없이도 실제 모드를 답합니다.

서버 렌더는 `<html>`을 읽지 못해 Provider의 `defaultTheme`로 답하고, `system`이면 `light`로 답합니다. 하이드레이션 직후 실제 모드로 한 번 다시 그립니다.

## 일부만 뒤집기

화면의 한 부분만 다른 모드로 두려면 Box의 `theme`을 씁니다. `light` · `dark`는 고정이고 `inverse`는 주변의 반대입니다. 자세한 규칙은 [Layout](../primitives/layout.md#box--면-하나)에 있습니다.

```tsx
<Box theme="inverse" padding="lg" radius="md">
  <Text variant="heading">반대 테마의 면</Text>
</Box>
```

## 전환은 즉시

[contract:foundations.theme.swap-instant]: #
모드가 바뀌는 프레임 동안 `<html>`이 `data-pui-theme-swap` 속성을 달고, 그동안 모든 요소의 transition은 즉시 끝납니다(Motion의 `theme` 역할). 그래서 버튼·입력·스위치가 페이지보다 늦게 따라 바뀌지 않습니다. Provider가 쓸 때뿐 아니라 Box의 `theme`이나 Overlay가 여는 층의 모드가 바뀔 때도 같고, 페이지에 있는 다른 라이브러리의 transition도 그 프레임에는 멈춥니다.
