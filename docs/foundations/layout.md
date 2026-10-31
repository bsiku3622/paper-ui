# Layout

Layout은 요소 사이의 관계를 정하는 시스템입니다. 형제 사이의 간격(gap), 페이지 가장자리와 내용 사이(gutter), 본문의 최대 폭(container), 뷰포트 분기점(breakpoint), 그리고 깊이(elevation)가 여기에 속합니다. 요소 하나만으로 보이는 곡률·선·크기·안쪽 여백은 [Shape](shape.md)이 맡습니다.

Layout은 Shape 위에 섭니다. 거리는 Shape의 길이 scale에서 고르므로, 같은 단계의 gap과 inset은 같은 길이입니다. 그림자 색은 Color에서 옵니다.

## 원본 → 역할

Layout의 숫자는 `tokens/layout.ts`의 `LAYOUT_SOURCE`에만 있습니다. container와 tier의 z · nudge는 `--pui-layout-*` 변수로 한 번 emit합니다. 그림자의 기하는 모드마다 달라서 모드별 원본 변수(`--pui-layout-shadow-<depth>-<i>`)로 굽고, 그림자 자체는 변수로 굽지 않고 쓰이는 요소에서 조립합니다([테마 스코프](color.md)).

| 역할 | 값 | 비고 |
|---|---|---|
| `layout.gap.xs ~ 3xl` | 4 · 8 · 12 · 16 · 24 · 32 · 48 | Shape inset과 같은 scale |
| `layout.gutter` | 16 | 페이지 가장자리와 내용 사이, 모달 scrim의 안쪽, 팝오버가 뷰포트에 닿을 때 남기는 여백 |
| `layout.container.content` | 72rem (1152) | 사이트 본문 격자의 최대 폭. Box에서는 `maxWidth="container.content"`로 고릅니다 |
| `layout.breakpoint.sm / md / lg / xl` | 30 · 48 · 64 · 80em (480 · 768 · 1024 · 1280px) | 미디어 쿼리가 변수를 못 읽어 값으로 둡니다 |
| `layout.section.start / end` | clamp(3xl, 8vh, 2 × 3xl) · clamp(2xl, 5vh, 3xl) | 페이지 구획의 위·아래 거리. 뷰포트 높이를 따라 자라는 유동 단계입니다 |
| `elevation.<tier>` (class) | 아래 표 | tier 하나가 position · z · 그림자를 한 번에 붙이는 class입니다. `tokens.layout`의 역할이 아닙니다 |

Stack · Inline · Grid의 `gap`, Inline · Grid의 `rowGap` · `columnGap`이 gap 단계를 받습니다. 자식을 늘어놓지 않는 Box에는 gap이 없습니다. 앱 stylesheet에서는 `gap` · `margin` · `top`/`left` 같은 위치 offset에 `tokens.layout.gap`을 씁니다. 실행 중에 숫자 픽셀이 필요한 배치 값(Floating의 `offset` · `crossOffset`, Draggable의 `keyboardStep`)도 숫자가 아니라 같은 gap 단계 이름을 받고, 쓰이는 자리에서 재어 픽셀로 바뀝니다. 그래서 하위 트리가 scale을 덮으면 그 값도 따라갑니다.

[contract:foundations.layout.breakpoint-em]: #
breakpoint는 em으로 적습니다. 길이는 rem, 미디어 쿼리는 em, 선과 포커스 링은 px로 쓰는 것이 단위 정책이라, 사용자가 브라우저의 기본 글자 크기를 키우면 container · gutter 같은 길이와 breakpoint가 같은 비율로 움직입니다. 미디어 쿼리의 em은 문서의 `html` 글자 크기가 아니라 브라우저의 기본 글자 크기를 기준으로 하고, 기본 크기(16px)에서는 dp를 16으로 나눈 값이라 `30em`은 480px와 같은 자리입니다. 기본 크기가 20px인 브라우저에서는 `48em`이 960px라서 900px 창이 이미 `md`보다 좁은 화면으로 읽힙니다.

[contract:foundations.layout.section-fluid]: #
section은 고정 gap 사다리의 선언된 유동 예외입니다. `start`는 `clamp(3xl, 8vh, 2 × 3xl)`, `end`는 `clamp(2xl, 5vh, 3xl)`이라 뷰포트가 낮으면 3xl · 2xl에 머물고 높아지면 위 한도까지 자랍니다. 새 변수를 굽지 않고 Space 원본 변수를 쓰는 식이라, 하위 트리에서 Space 원본을 덮으면 section도 다시 계산됩니다. 유동 단계는 Typography의 `hero`와 이 section 둘뿐입니다.

## Elevation — 위치와 쌓임과 그림자는 한 단위다

[contract:foundations.layout.elevation-unit]: #
tier 하나를 고르면 position, z, 그림자가 함께 정해집니다. z는 position이 있는 요소에서만 작동하므로 position도 tier가 정하고, 그림자는 떠 있는 tier만 갖습니다. 이 단위는 `elevation` class, Surface의 `elevation` prop, Floating, Switch 손잡이가 같은 레시피로 적용하며, 일부만 따로 가져다 쓰는 길은 공개하지 않습니다.

| tier | position | z | 그림자 깊이 | 쓰는 곳 |
|---|---|---|---|---|
| `lifted` | relative | 10 | lifted | 스위치 손잡이처럼 살짝 들린 작은 것 |
| `sticky` | sticky | 20 | 없음 | sticky 헤더·사이드바 — 경계선으로 나눕니다 |
| `overlay` | relative | 30 | floating | 팝오버·메뉴 |
| `modal` | relative | 40 | floating | 대화상자, 그 아래 `color.overlay.scrim` |
| `toast` | relative | 50 | floating | 가장 위 알림 |

tier의 목록은 `ELEVATIONS`(`/tokens`)이고, Surface의 `elevation` prop과 `elevation` class 지도의 키가 모두 이 목록을 돕니다. 지면에 붙은 면은 tier가 아닙니다. elevation을 주지 않은 요소가 곧 지면입니다.

[contract:foundations.layout.elevation-nesting]: #
tier 사이는 10씩 띄우고 같은 tier 안의 한 걸음(nudge)은 1이라, 한 tier는 nudge 9번을 담습니다(`ELEVATION_NEST_LIMIT`). 같은 tier의 panel 위에 열린 panel은 nudge 하나만큼 올라가고 9번을 넘으면 거기에 머물러서, 중첩이 아무리 깊어도 다음 tier에 닿지 않습니다 — 가장 깊은 modal(49)도 toast(50) 아래입니다. 더 높은 tier 위에 열린 panel은 그 tier를 따릅니다. 대화상자 위의 팝오버는 modal tier에서 한 nudge 올라 대화상자의 scrim 위에 서고, 팝오버 위의 대화상자는 modal tier의 처음에 서서 팝오버를 scrim으로 덮습니다.

흐름 안에 그리는 견본과 목업은 `isolation: isolate`를 가진 무대 안에 둡니다. 무대가 쌓임 맥락을 가두므로 견본의 z가 sticky 헤더나 도구 위로 올라오지 않습니다. 같은 tier의 요소는 DOM 순서로 쌓이므로, 페이지 헤더 아래에서 따라 내려오는 sticky 레일은 `isolation: isolate`를 가진 프레임 안에 두어 헤더가 레일에 가려지지 않게 합니다.

그림자 깊이는 lifted와 floating 둘뿐입니다. 기하는 모드별로 Layout이 갖고(다크는 더 조이고 음의 spread를 씁니다), 그림자 색(shadow colour)은 Color의 `shadow.lifted` · `shadow.floating`이 칠합니다. 그림자는 tier마다 그림자 깊이의 겹별 기하 변수와 그림자 색 변수를 쓰이는 요소에서 이어 붙인 값이라, 테마 스코프가 기하나 색 어느 쪽을 바꿔도 그 아래의 그림자가 따라옵니다. 스코프 요소 자신이 드리우는 그림자는 바깥 지면의 모드로 그려집니다.

Surface는 `elevation` prop으로 tier를 고릅니다. position, z, 그림자가 함께 붙습니다. Surface가 아닌 요소는 같은 class를 직접 받습니다.

```tsx
<Surface fill="raised" border radius="md" padding="md" elevation="overlay">…</Surface>
<div className={elevation.toast}>…</div>
```
