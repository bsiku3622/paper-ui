# Layout

Layout은 요소 사이의 관계를 정하는 시스템입니다. 형제 사이의 간격(gap), 페이지 가장자리와 내용 사이(gutter), 본문의 최대 폭(container), 뷰포트 분기점(breakpoint), 그리고 깊이(elevation)가 여기에 속합니다. 요소 하나만으로 보이는 곡률·선·크기·안쪽 여백은 [Shape](shape.md)이 맡습니다.

Layout은 Shape 위에 섭니다. 거리는 Shape의 길이 scale에서 고르므로, 같은 단계의 gap과 inset은 같은 길이입니다. 그림자 색은 Color에서 옵니다.

## 원본 → 역할

Layout의 숫자는 `tokens/layout.ts`의 `LAYOUT_SOURCE`에만 있습니다. container와 z는 `--pui-layout-*` 변수로 한 번 emit하고, 그림자는 테마마다 색이 바뀌므로 테마 스코프가 조립된 값을 통째로 교체합니다.

| 역할 | 값 | 비고 |
|---|---|---|
| `layout.gap.xs ~ 3xl` | 4 · 8 · 12 · 16 · 24 · 32 · 48 | Shape inset과 같은 scale |
| `layout.gutter` | 16 | 페이지 가장자리와 내용 사이, 모달 scrim의 안쪽 |
| `layout.container.content` | 72rem (1152) | 사이트 본문 격자의 최대 폭 |
| `layout.breakpoint.sm / md / lg / xl` | 480 · 768 · 1024 · 1280px | 미디어 쿼리가 변수를 못 읽어 값으로 둡니다 |
| `layout.elevation.<level>.z / .shadow` | 아래 표 | 층 하나가 쌓임과 그림자를 함께 정합니다 |

Stack · Inline · Grid의 `gap`, Grid의 `rowGap` · `columnGap`, Box의 `gap`이 gap 단계를 받습니다. 앱 stylesheet에서는 `gap` · `margin` · `top`/`left` 같은 위치 offset에 `tokens.layout.gap`을 씁니다.

## Elevation — 쌓임과 그림자는 한 결정이다

층(level) 하나를 고르면 z와 그림자가 함께 정해집니다. z만 overlay이고 그림자는 없는 조합처럼 어긋난 상태를 구조가 허용하지 않습니다. 그림자는 떠 있는 층만 갖습니다.

| level | z | 그림자 깊이 | 쓰는 곳 |
|---|---|---|---|
| `base` | 0 | 없음 | 지면에 붙은 면 |
| `raised` | 10 | lifted | 스위치 손잡이처럼 살짝 들린 작은 것, 미리보기 위 도구 |
| `sticky` | 20 | 없음 | sticky 헤더·사이드바 — 경계선으로 나눕니다 |
| `overlay` | 30 | floating | 팝오버·메뉴 |
| `modal` | 40 | floating | 대화상자, 그 아래 `color.overlay.scrim` |
| `toast` | 50 | floating | 가장 위 알림 |

tier 사이를 10씩 띄워, 같은 tier 안에서 조금 올리고 내려도 다음 tier를 넘지 않습니다. 중첩된 Overlay는 깊이마다 한 tier(`modal − overlay`)씩 올라갑니다.

그림자 깊이는 lifted와 floating 둘뿐입니다. 기하는 테마별로 Layout이 갖고(다크는 더 조이고 음의 spread를 씁니다), 그림자 색(shadow colour)은 Color의 `shadow.lifted` · `shadow.floating`이 칠합니다.

Box는 `elevation` prop으로 층을 고릅니다. z와 그림자가 함께 붙습니다.

```tsx
<Box surface="raised" border radius="md" padding="md" elevation="overlay">…</Box>
```
