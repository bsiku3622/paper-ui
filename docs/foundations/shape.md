# Shape

Shape은 요소 하나의 형태를 정하는 시스템입니다. 빈 캔버스에 버튼 하나만 놓아도 보이는 것 — 곡률, 선 두께, 포커스 링, 크기, 안쪽 여백 — 이 모두 Shape에 속합니다. 형제 사이의 간격이나 페이지 틀, 쌓임 순서처럼 두 번째 요소나 화면이 있어야 생기는 값은 [Layout](layout.md)이 맡습니다.

Shape은 다른 시스템을 읽지 않는 [1차 시스템](README.md#1차와-2차)입니다. Layout은 Shape의 길이 scale 위에 서고, Shape은 Layout을 읽지 않습니다. 컨트롤 안쪽 여백처럼 글자 줄이 필요한 값은 2차 [Control](README.md#control)이 만들고, 선 하나를 조립하는 일은 2차 [Line](README.md#line)이 합니다.

## 원본 → 역할 → recipe

[contract:foundations.shape.source-dp]: #
Shape의 숫자는 `tokens/shape.ts`의 `SHAPE_SOURCE` 한 곳에만 dp 단위로 적습니다(기본 root 16px에서 1dp = 1px). 그 아래는 한 방향으로만 흐릅니다.

```text
SHAPE_SOURCE    원본 숫자 (dp)
     ↓
SHAPE_VALUES    CSS 값으로 바꾼 원본 → --pui-shape-* 변수로 한 번만 emit
     ↓
SHAPE           공개 역할: 원본 변수의 별칭이거나, 원본 위의 calc() 식
     ↓
SHAPE_RECIPES   컴포넌트 anatomy: 역할과 원본 anatomy를 조합한 식 (비공개)
     ↓
*.css.ts        className으로 적용
```

### 원본 덮어쓰기

[contract:foundations.override.rederives-roles]: #
역할은 자기 변수를 갖지 않습니다. 별칭은 원본 변수 그 자체이고, 식은 그 식을 쓰는 요소에서 계산됩니다. 그래서 어떤 하위 트리에서 원본 변수 하나를 덮어쓰면, 그 위에 지은 역할과 recipe가 그 자리에서 모두 다시 계산됩니다. 아래 예시는 한 영역의 컨트롤 높이만 바꿉니다.

```ts
import { style } from "@vanilla-extract/css";
import { sourceVars } from "@studio-baeks/paper-ui/tokens";

export const dense = style({ vars: sourceVars({ shape: { control: { height: { md: "36px" } } } }) });
```

[contract:foundations.override.worked-example]: #
이 한 줄로 그 영역의 md 버튼 높이는 36, 입력 inset은 10이 됩니다. 버튼 inset은 크기마다 손으로 적는 원본(`control.buttonInset`)이라 높이를 따라가지 않고 17 그대로입니다 — 높이와 함께 바꾸려면 그 원본도 덮어씁니다. 체크박스와 스위치는 자기 사다리(`selection.size`)를 따르므로 그대로입니다. 역할 변수를 따로 구웠다면 `:root`에서 이미 계산이 끝나 이 재정의를 따라가지 못합니다.

[contract:foundations.override.source-paths-only]: #
`sourceVars()`는 원본 트리의 경로를 그 값이 방출되는 변수 이름으로 바꿔 돌려줍니다. 경로는 원본을 그대로 따라 `shape` · `layout` · `typography` 셋에서 시작하고, 역할의 경로(`shape.inset`)는 타입이 막고 모르는 경로는 실행 때 던집니다. 돌려주는 이름은 언제나 모드와 무관하게 구워지는 원본 변수(`SOURCE_VARIABLES`)의 부분집합이라, 같은 값을 Floating의 panel이 따라 옮깁니다. 결과는 vanilla-extract의 `vars`와 React의 `style`에 그대로 들어갑니다. 변수를 일반 CSS에 직접 적을 수도 있습니다(`.dense { --pui-shape-control-height-md: 36px }`). 이 형태는 타입도 `sourceVars()`도 검사하지 못합니다 — 이름은 Playground [Shape](/playground/foundations/shape)의 원본 표에 나옵니다. 앱과 fixture는 `--pui-` 이름을 문자열로 쓰지 않고 이 함수를 부릅니다(`paper/source-isolation`).

[contract:foundations.override.unknown-warning]: #
일반 CSS의 오타나 역할 이름은 아무 일도 하지 않고 조용히 지나가므로, 개발 중에는 `PaperProvider`가 처음 마운트될 때 문서의 스타일시트를 한 번 읽어 `--pui-shape-*` · `--pui-layout-*` · `--pui-typography-*` 선언 가운데 패키지가 내지 않는 이름을 `[paper-ui] ` 경고 하나로 알립니다. `@layer` · `@media` 안의 규칙, 중첩 규칙, `@import`한 시트와 `adoptedStyleSheets`까지 읽습니다. 보지 못하는 것도 있습니다. 인라인 `style`과 스크립트가 `setProperty`로 쓴 값은 읽지 않고, 브라우저가 읽지 못하게 하는 다른 출처의 시트는 건너뛰며, 마운트 뒤에 들어온 시트와 Shadow DOM 안의 시트는 보지 않습니다. 프로덕션 빌드와 Provider가 없는 페이지에서는 돌지 않습니다.

[contract:foundations.override.portal-carry]: #
그 영역에서 연 Floating의 panel은 `<body>` 아래로 옮겨지지만 덮어쓴 원본을 잃지 않습니다. Portal의 root가 열린 자리와 container 사이에서 값이 다른 원본 변수(`SOURCE_VARIABLES`: Shape · mode와 무관한 Layout · Typography)만 얹어 옮기므로, 영역 안에서 연 popover와 dialog 속 컨트롤도 40이 되고 dialog의 scrim 여백도 영역의 gutter를 따릅니다. 처음부터 열려 있는 panel도 Trigger가 선 자리를 따르고, 영역 밖에서 연 것은 기본값 그대로입니다. 색 역할은 옮기지 않고, 모드는 테마 속성이 옮깁니다.

패키지 안에서는 숫자를 원본 파일(`shape.ts` · `layout.ts` · `typography.ts` · `motion.ts`와 색 원본)에만 씁니다. recipe와 stylesheet에는 구조 값(0 · 100% · 1fr · 절반 `/ 2` · 45° 회전 …) 말고 숫자가 없고, eslint `paper/source-numbers`가 토큰 층 밖의 패키지 전체에서 이를 막습니다.

## 길이 scale — inset

[contract:foundations.shape.inset-scale]: #
안쪽 여백은 `tokens.shape.inset`으로 고릅니다. Layout의 `gap`과 같은 scale이라, 같은 단계는 같은 길이입니다. 4dp 격자로 xl까지 오르고, 페이지 단위 거리는 8dp 흐름으로 이어집니다.

[contract:foundations.shape.inset-values]: #

| 단계 | xs | sm | md | lg | xl | 2xl | 3xl |
|---|---|---|---|---|---|---|---|
| dp | 4 | 8 | 12 | 16 | 24 | 32 | 48 |

Box의 `padding` · `paddingX` · `paddingY`가 이 단계를 받습니다. 앱 stylesheet에서는 `padding`류 속성에 `tokens.shape.inset`을 씁니다.

## Radius

컨트롤의 모서리는 크기를 따릅니다. 같은 곡선이 작은 상자에서는 훨씬 둥글게 읽히기 때문입니다. 면은 Surface의 `radius`가 고르고, 글자 줄 곁의 링과 알약과 원은 크기와 무관하게 값 하나를 씁니다.

[contract:foundations.shape.radius-table]: #

<!-- generated:shape-radius -->
<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->
| 역할 | 값 | 쓰는 곳 |
| --- | --- | --- |
| `radius.control.xs / sm / md / lg / xl` | 8 / 12 / 12 / 12 / 12 | `shape="rounded"` — Field · Select · Textarea의 기본 |
| `radius.small.xs / sm / md / lg / xl` | 4 / 6 / 6 / 6 / 6 | `shape="small"` |
| `radius.selection` | 4 | Checkbox |
| `radius.surface.sm / md / lg` | 12 / 16 / 20 | Surface의 `radius` prop |
| `radius.text` | 4 | 글자 줄 곁에 서는 것 — Link의 링 |
| `radius.pill` | 999px | 알약, `shape="pill"` — Button · IconButton · Badge · SegmentControl의 기본 |
| `radius.full` | 999px | 원(Radio · Switch · Spinner), Surface의 `radius="full"` |
<!-- /generated:shape-radius -->

[contract:foundations.shape.corner-by-size]: #
`shape="rounded"`인 컨트롤은 자기 크기의 `radius.control`을 읽습니다. Field · Select · Textarea는 기본이 rounded이고, Button · IconButton · Badge는 `shape="rounded"`를 받을 때 그렇습니다. 원본이 크기마다 따로 있어서 `PaperProvider`와 `sourceVars`로 크기별로 덮어쓸 수 있습니다.

[contract:foundations.shape.control-shapes]: #
컨트롤의 모서리(`shape`)는 네 단계입니다. `sharp`는 모서리가 없고, `small`은 자기 크기의 `radius.small`을, `rounded`는 `radius.control`을, `pill`은 `radius.pill`을 읽습니다. 안쪽의 모서리도 같은 단계를 따릅니다. SegmentControl의 칸은 `nestedRadius`로, Select 목록의 항목은 같은 곡률로, 목록은 항목 곡률에 안쪽 여백(`inset.xs`, 곡률보다 크지 않게)을 더해서, Field의 지우기 · 보기 버튼은 `radius.control.xs`를 넘지 않게 고릅니다. 그래서 `sharp` 안에서는 모두 각집니다. pill Select의 목록은 알약이 아니라 rounded로 열립니다.

[contract:foundations.shape.app-shape]: #
앱 전체의 단계는 `PaperProvider`의 `controlShape`가 정합니다. 컨트롤에 준 `shape`가 먼저이고, 없으면 가장 가까운 Provider의 `controlShape`, 그것도 없으면 부품의 기본입니다. Button · IconButton · Badge · SegmentControl의 기본은 pill, Field · Select · Textarea · Control의 기본은 rounded입니다. 여러 줄 상자에 알약은 맞지 않아서 Textarea는 `pill`을 받으면 rounded로 섭니다.

```tsx
<PaperProvider controlShape="small">…</PaperProvider>
```

[contract:foundations.shape.pill-not-circle]: #
`radius.pill`은 알약의 모양이고 `radius.full`은 원의 기하입니다. `radius.pill`을 낮추면 pill인 컨트롤(Button · IconButton · Badge · SegmentControl의 기본)만 따라오고, Radio · Switch · Spinner는 원으로 남습니다.

[contract:foundations.shape.pill-inset]: #
`shape="pill"`인 Field와 Select는 값을 버튼 inset(`control.inset.button`)에 둡니다. 알약의 둥근 끝이 값 곁의 자리를 먹으므로, pill Button이 라벨 둘레에 두는 넓은 자리를 입력 틀도 똑같이 둡니다. Select의 화살표도 그 inset에 서고, 값은 화살표 앞 `control.gap`에서 멈춥니다. rounded 틀은 입력 inset(`control.inset.input`) 그대로입니다.

[contract:foundations.shape.radius-separate]: #
Surface의 `radius="sm"`은 surface 쪽을 고릅니다. `radius.control.sm`과 값이 같아도 역할과 변수는 따로입니다.

[contract:foundations.shape.nested-radius]: #
둥근 상자 안에 일정한 거리를 두고 놓이는 것의 모서리는 `nestedRadius(바깥 곡률, 거리)`로 고릅니다. 바깥 곡률에서 거리를 뺀 값이라 두 곡선이 나란해지고, 거리가 곡률보다 크면 각진 모서리가 됩니다.

## Stroke · Focus

[contract:foundations.shape.stroke-px]: #
선과 포커스 링은 root 글자 크기를 따라 커지지 않도록 CSS px로 둡니다. `stroke.border` 1px은 테두리와 Divider, `stroke.emphasis` 2px은 체크 표시·Spinner 링·스위치 손잡이 둘레·Slider 손잡이의 테, `stroke.icon` 1.75는 24 artboard 위 SVG 선입니다. 포커스 링은 `focus.width` 2px · `focus.offset` 2px이고, 패키지의 모든 포커스 링은 한 스타일(`focusRing`)을 공유합니다. 링의 두께와 offset은 Shape, 색은 Color(`interaction.focus`)가 소유합니다. 안쪽에 그리는 1px 선은 `strokeRing(color)`가 `inset 0 0 0 stroke.border`로 한 곳에서 만들어, 요소의 크기를 바꾸지 않고 상자 안쪽에 선을 긋습니다.

[contract:foundations.shape.focus-ring]: #
링은 요소 자신의 곡률을 따릅니다. 전역 baseline(`:where(:focus-visible)`)은 링만 그리고 요소의 모양을 바꾸지 않으므로, 자기 곡률이 없는 요소(제목, 사이드바 링크)의 키보드 링은 각지게 그려집니다. 곡률은 링을 그리는 요소가 정합니다 — Button · Field · Select · Textarea는 자기 `shape`의 곡률을, Link는 `radius.text`를 가집니다. Field와 Select는 wrapper가 링을 그리는 틀이라 그 곡률을, Textarea는 자기 곡률을 따르고, 안쪽 native control은 곡률도 outline도 갖지 않습니다.

## Control

[contract:foundations.shape.control-geometry]: #
컨트롤 원본은 <!-- generated:shape-source --><!-- 이 블록은 생성됩니다 — pnpm docs:sync -->높이 사다리(`control.height`: xs 32 · sm 36 · md 40 · lg 44 · xl 48)와 버튼 inset 사다리(`control.buttonInset`: xs 11 · sm 14 · md 17 · lg 20 · xl 23), 표식 사다리(`selection.size`: xs 16 · sm 18 · md 18 · lg 20 · xl 20)이고, `anatomy`는 Badge 높이·inset(`anatomy.badge`)과 체크의 보정 비율(`anatomy.checkbox.markShift`: x 0.25 · y -0.5, `stroke.emphasis`의 배수)과 inline 점 · spinner 크기(`anatomy.inline`: 0.5em · 1em)입니다.<!-- /generated:shape-source --> 나머지는 높이와 컨트롤 글자 줄(Typography의 control preset이 읽는 글자 한 줄, 행간 16)에서 계산합니다. 입력값이 앉는 줄상자 `inputLeading` 20은 이 식의 입력이 아니라 caret 높이를 위한 값이라, 글자 줄 안쪽에서 중앙에 앉습니다.

[contract:foundations.shape.control-table]: #

<!-- generated:shape-control -->
<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->
| 역할 | xs | sm | md | lg | xl | 식 |
| --- | --- | --- | --- | --- | --- | --- |
| `control.height` | 32 | 36 | 40 | 44 | 48 | 원본 |
| `control.inset.input` | 8 | 10 | 12 | 14 | 16 | (높이 − preset 글자 줄) / 2 — 입력값은 글자 줄 사방에 같은 여백 |
| `control.inset.button` | 11 | 14 | 17 | 20 | 23 | 원본(`control.buttonInset`) — 크기마다 손으로 적습니다. 라벨이 상자를 정의하므로 입력값보다 넓게 |
| `selection.size` | 16 | 18 | 18 | 20 | 20 | 원본 — Checkbox와 Radio의 상자. 컨트롤 높이와 따로 움직입니다 |
| `control.icon` | 16 | 16 | 18 | 20 | 20 | 높이를 따르는 icon 크기 (caption · caption · body · subheading · subheading) |
| `control.gap` | 8 | 8 | 8 | 8 | 8 | 아이콘과 라벨 사이, inset sm |
<!-- /generated:shape-control -->

[contract:foundations.shape.geometry-entry]: #
컨트롤 안의 아이콘은 옆 글자가 아니라 컨트롤 높이를 따라 커집니다(`control.icon`). 컨트롤 글자는 control preset이라 어느 Text 역할과도 같지 않기 때문입니다. 같은 size의 Button · Field · Select는 같은 높이를 고르고, 글자는 Typography의 control preset에서 따로 고릅니다. 크기가 있는 Atom은 모두 [Control](../primitives/control.md) 하나로 크기를 정합니다. stylesheet가 자기만의 크기 사다리를 만들지 않습니다. 선택 상자에서 나오는 체크 · 점 · 트랙 · 손잡이 · 누르는 자리는 `markParts` 식 한 벌이고, 표의 값은 그 식을 크기마다 푼 것입니다. `control.icon`은 컨트롤 안 아이콘의 기본 크기입니다. 컨트롤 안의 Icon은 그 컨트롤이 정한 크기를 CSS 변수로 읽고, 명시한 `size`가 있으면 그것이 이깁니다.

[contract:foundations.shape.control-line-room]: #
inset은 컨트롤의 바깥 가장자리에서 잽니다. 디자인 파일이 재는 자리와 같습니다. 선을 그리지 않는 컨트롤은 선 자리를 남기지 않아서, 면과 그 안쪽에 그리는 그림자가 가장자리까지 닿습니다. 선을 그리는 variant, 오류 같은 상태, 더 높은 대비, 강제 색상(OS가 모든 컨트롤의 가장자리를 그립니다)에서만 1px 자리를 되찾고, 그만큼 inset이 줄어서 안의 글자는 제자리에 있습니다. 선이 있는지는 variant와 상태를 아는 paint가 정하고(`CONTROL_LINE_ROOM`), 틀의 두께와 inset이 그 값을 읽습니다(`CONTROL_LINE` · `insideLine`). 자리는 상속되는 길이로 등록되어 있어, Select 안의 native select가 제 틀의 자리를 읽고, 선을 가진 컨트롤은 모두 제 자리를 스스로 정하며, 그 밖의 요소는 자리가 없습니다. Paint로 칠한 일반 상자는 이 규칙 밖이라 variant가 바뀌어도 틀이 그대로입니다.

## Sizing

[contract:foundations.shape.sizing-table]: #

<!-- generated:shape-sizing -->
<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->
| 역할 | 단계 | dp |
| --- | --- | --- |
| `icon.size` | label · caption · body · subheading | 14 · 16 · 18 · 20 |
| `dimension.width` | xs ~ xl | 72 · 108 · 160 · 240 · 360 |
| `dimension.height` | xs ~ xl | 64 · 96 · 144 · 216 · 320 |
| `measure` | xs ~ xl | 448 · 512 · 608 · 672 · 736 (28 ~ 46rem) |
<!-- /generated:shape-sizing -->

아이콘 artboard의 이름은 Text 역할 이름의 부분집합이라 타입으로 묶여 있고, 그 역할의 글자 옆에 놓는 크기를 뜻합니다. 컨트롤 안의 아이콘은 이 이름이 아니라 `control.icon`을 따릅니다. `dimension`은 Box의 `width="md"` 같은 이름 있는 크기이고, `measure`는 글 덩어리의 읽기 폭이라 Box에서는 `maxWidth="measure.md"`로 고릅니다. 이름 있는 크기는 모두 class가 됩니다.

## Target

[contract:foundations.shape.target-reach]: #
누를 수 있는 최소 크기는 `target.min` 24px(CSS px)입니다. 시각 크기가 더 작은 표식은 보이지 않는 hit area를 `targetReach`로 넓힙니다. `targetReach(visual)`은 `(min(visual, target.min) − target.min) / 2`라서 표식이 24px에 못 미치는 만큼의 절반이고, 이미 24px 이상이면 0입니다. 값은 hit area가 표식 밖으로 뻗는 거리를 음수 inset으로 적은 것입니다.

[contract:foundations.shape.target-table]: #

| 대상 | 식 | xs | sm | md | lg | xl |
|---|---|---|---|---|---|---|
| `target.selection` | targetReach(`selection.size`) | −4 | −3 | −3 | −2 | −2 |
| `target.switchBlock` | targetReach(Switch 트랙 높이) | −3 | −2 | −2 | −1 | −1 |
| `target.action` | targetReach(`control.icon`) | −4 | −4 | −3 | −2 | −2 |

[contract:foundations.shape.hit-area]: #
hit area를 갖는 Atom은 Checkbox · Radio · Switch와 Field의 지우기와 보기 버튼입니다. 보이지 않는 `::before`가 표식 밖으로 넓어지고 색을 칠하지 않습니다. Field의 버튼 안 아이콘은 `control.icon` 그대로 그려지고 `::before`가 `target.action`만큼 사방으로 넓어져 24px 정사각이 됩니다. 나란한 두 버튼은 `control.gap` 8을 사이에 두므로 서로의 hit area를 침범하지 않습니다. Checkbox · Radio는 `target.selection`만큼 사방으로, Switch는 `target.switchBlock`만큼 트랙 위아래로 넓어지고 가로는 트랙 폭이 이미 24px 이상이라 그대로입니다. `::before`는 padding box에서 놓이므로, 선 자리를 둔 상자(오류 · 더 높은 대비 · 강제 색상)에서는 그 한 줄만큼 더 멀리서 시작하고, 선 자리가 없는 쉬는 표식에서는 상자 가장자리에서 시작합니다.

[contract:foundations.shape.no-coarse-growth]: #
coarse pointer에서 더 키우지 않습니다 — 촘촘한 목록에서 hit area가 겹치면 탭이 엉뚱한 곳으로 가기 때문이고, 행 단위 hit area는 앱이 정합니다. 예외는 Component가 행을 스스로 쌓아 서로 겹치지 않게 하는 경우뿐이고, 지금은 [Sidebar](../components/README.md#sidebar)의 항목이 터치 화면에서 lg 높이를 받습니다.

## Recipe — 컴포넌트 anatomy

[contract:foundations.shape.recipe-structural-numbers]: #
`SHAPE_RECIPES`에는 구조 값(절반 `/ 2`, 45° 회전)만 쓰고, 광학 보정 비율은 원본 anatomy에 둡니다. 모든 값이 역할이거나, 원본의 anatomy 값이거나, 그 둘 위의 식입니다. 단위 테스트가 var() 이름을 지운 recipe 문자열에 남은 숫자를 `STRUCTURAL`과 대조합니다.

[contract:foundations.shape.recipe-geometry]: #

| 대상 | 규칙 |
|---|---|
| Checkbox | 모서리 `radius.selection`. 체크는 상자의 절반 너비·4분의 1 높이인 L자를 대각선으로 돌린 것이고, 돌리면 시각 무게가 아래 왼쪽으로 쏠려 자기 획(`stroke.emphasis`)의 배수만큼 옮깁니다. 그 배수는 원본 `anatomy.checkbox.markShift`(x ¼ · y −½)입니다. indeterminate 대시는 체크의 긴 변 길이로 그은 둥근 끝 emphasis 선입니다. |
| Radio | 점은 원본 `anatomy.radio.dot`이 정한 상자의 비율입니다. 검은 면 위의 흰 점은 크게 읽혀 절반보다 작게 둡니다. |
| Switch | 트랙 높이 = 선택 상자 + 테, 트랙 폭 = 높이 × 원본 `anatomy.switch.length`(1.5)라 짧고 뚱뚱합니다. 손잡이는 지름이 선택 상자 − 테인 원입니다. 테는 `stroke.emphasis`라, 손잡이는 사방 2px 안쪽에 앉고 트랙에서 손잡이와 양쪽 테를 뺀 만큼 이동합니다. 손잡이는 `inset-inline-start`로 놓이고 켜지면 그 값에 이동 거리가 더해지는 논리 속성이라 RTL에서는 저절로 뒤집힙니다. 오류의 안쪽 테(`stroke.border`)는 박스 안에 그려져 크기를 늘리지 않습니다. |
| Textarea | 한 줄은 같은 size의 Field와 정확히 같은 높이입니다: block 여백 = (컨트롤 높이 − textarea 글자 줄) / 2 − 테두리. 최소 높이는 없고 높이는 `rows`(기본 4)가 정합니다 — 4줄은 xs 88 · sm 92 · md 96 · lg 100 · xl 104입니다. |
| Select | 화살표는 trailing icon입니다. `control.icon` 크기의 Icon(레시피에 따로 둔 값이 없습니다)이 입력 inset 자리에 앉고, 값은 그보다 `control.gap`만큼 앞에서 멈춥니다 — Field의 leading icon을 거울로 비춘 구조입니다. |
| Spinner | 지름은 `control.icon`, 고리의 두께는 `stroke.emphasis`이고 mask가 가운데를 도려냅니다. 꼬리는 원본 `anatomy.spinner.tail`만큼 비운 자리에서 시작합니다. 글줄 안에 놓는 스피너(`spinner.inline`)는 라벨 글자(1em)를 따르고, Button의 loading 표식이 그 크기입니다. |
| SegmentControl | 트랙은 컨트롤 높이와 모서리를 따르고, 칸은 안쪽으로 `inset.xs` 들어가 앉으며 모서리는 `nestedRadius`입니다. 칸의 안쪽 여백은 글자가 폭을 정하면 `inset.lg`, 폭을 나누면 `inset.md`입니다. |
| Slider | 막대 높이는 Switch 트랙과 같습니다. 손잡이는 지름이 막대 높이인 원이고 `stroke.emphasis` 테를 두릅니다. 막대가 최소 target에 못 미치면 위아래 빈 자리로 넓힙니다. |
| Marker | 띠의 높이와 줄 상자 안의 자리, 글자 밖으로 나가는 길이는 규칙으로 나오지 않아 원본 `anatomy.marker`에 둡니다. |
| Badge | 높이와 inset은 규칙으로 나오지 않아 원본 `anatomy.badge`에 둡니다. 점은 `anatomy.inline`의 글자 0.5em이고, 점과 글자 사이는 inset xs입니다. |

[contract:foundations.shape.switch-thumb]: #
Switch의 손잡이는 꺼지면 트랙 끝에서 테만큼, 켜지면 반대쪽 끝에서 테만큼 떨어져 앉고 그 값은 논리 속성이 정합니다. 오른쪽에서 왼쪽으로 쓰는 문서에서는 두 끝이 서로 바뀝니다 — 켜진 손잡이가 트랙의 왼쪽 끝에서 테만큼 떨어집니다. 이는 별도 규칙 없이 같은 선언이 읽는 방향만 바뀐 결과이고, 테스트는 손잡이가 트랙의 양 끝에서 떨어진 거리를 읽습니다.

링크 밑줄 offset은 글자의 장식이라 Typography의 Palette(`decoration.underlineOffset`)가 소유하고, 앱에는 `linkStyle`로 나갑니다.

## 앱에서

앱은 간격·형태·깊이를 역할로 고릅니다. 안쪽 여백은 `tokens.shape.inset`, 형제 사이·margin·위치 offset은 `tokens.layout.gap`, 선은 `tokens.shape.stroke`, position·z·그림자는 Layout의 `elevation` class입니다. 사이드바 폭이나 그리드 트랙처럼 그 화면에만 있는 치수는 앱이 직접 쓰고, 미디어 쿼리의 길이는 `tokens.layout.breakpoint`로 적습니다. eslint `paper/source-numbers`의 앱 범위(콘텐츠 치수를 뺀 모든 범주)가 이 경계를 지킵니다.
