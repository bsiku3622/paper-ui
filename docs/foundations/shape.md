# Shape

Shape은 요소 하나의 형태를 정하는 시스템입니다. 빈 캔버스에 버튼 하나만 놓아도 보이는 것 — 곡률, 선 두께, 포커스 링, 크기, 안쪽 여백 — 이 모두 Shape에 속합니다. 형제 사이의 간격이나 페이지 틀, 쌓임 순서처럼 두 번째 요소나 화면이 있어야 생기는 값은 [Layout](layout.md)이 맡습니다.

디자인 시스템은 다섯 층으로 쌓이고, 각 층은 자기보다 위에 있는 층만 참조합니다. Shape은 Typography를 읽을 수 있고(컨트롤 글자 줄이 inset을 정합니다), Layout은 Shape의 길이 scale 위에 섭니다. Shape은 Layout을 읽지 않습니다.

```text
Color → Typography → Shape → Layout → Motion → Primitives
```

## 원본 → 역할 → recipe

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

[contract:foundations.override.rederives-roles]: #
역할은 자기 변수를 갖지 않습니다. 별칭은 원본 변수 그 자체이고, 식은 그 식을 쓰는 요소에서 계산됩니다. 그래서 어떤 하위 트리에서 원본 변수 하나를 덮어쓰면, 그 위에 지은 역할과 recipe가 그 자리에서 모두 다시 계산됩니다. 아래 예시는 한 영역의 컨트롤 높이만 바꿉니다.

```css
.dense { --pui-shape-control-height-md: 40px; }
```

이 한 줄로 그 영역의 md 버튼 높이는 40, 입력 inset은 12, 버튼 inset은 17, 체크박스는 20, 스위치 트랙은 40×22가 됩니다. 역할 변수를 따로 구웠다면 `:root`에서 이미 계산이 끝나 이 재정의를 따라가지 못합니다.

패키지 안에서는 숫자를 원본 파일(`shape.ts` · `layout.ts` · `typography.ts` · `motion.ts`와 색 원본)에만 씁니다. recipe와 stylesheet에는 숫자가 없고, eslint `paper/source-numbers`가 패키지 전체에서 이를 막습니다.

## 길이 scale — inset

안쪽 여백은 `tokens.shape.inset`으로 고릅니다. Layout의 `gap`과 같은 scale이라, 같은 단계는 같은 길이입니다. 4dp 격자로 xl까지 오르고, 페이지 단위 거리는 8dp 흐름으로 이어집니다.

| 단계 | xs | sm | md | lg | xl | 2xl | 3xl |
|---|---|---|---|---|---|---|---|
| dp | 4 | 8 | 12 | 16 | 24 | 32 | 48 |

Box의 `padding` · `paddingX` · `paddingY`가 이 단계를 받습니다. 앱 stylesheet에서는 `padding`류 속성에 `tokens.shape.inset`을 씁니다.

## Radius

모서리는 날만 죽입니다. 그래서 한 가족은 크기와 무관하게 한 값을 씁니다.

| 역할 | 값 | 쓰는 곳 |
|---|---|---|
| `radius.control` | 4 | Button · Field · Select · Textarea · Badge, 포커스 링 |
| `radius.selection` | 3 | Checkbox |
| `radius.surface.sm / md / lg` | 4 / 6 / 8 | Box의 `radius` prop |
| `radius.full` | 999px | 알약, 원(Radio · Switch · Spinner) |

Box의 `radius="sm"`은 surface 쪽을 고릅니다. `radius.control`과 값이 같아도 역할과 변수는 따로입니다.

## Stroke · Focus

[contract:foundations.shape.stroke-px]: #
선과 포커스 링은 root 글자 크기를 따라 커지지 않도록 CSS px로 둡니다. `stroke.border` 1px은 테두리와 Divider, `stroke.emphasis` 2px은 체크 표시·Spinner 링·스위치 손잡이 둘레, `stroke.icon` 1.75는 24 artboard 위 SVG 선입니다. 포커스 링은 `focus.width` 2px · `focus.offset` 2px이고, 패키지의 모든 포커스 링은 한 스타일(`focusRing`)을 공유합니다. 링의 두께와 offset은 Shape, 색은 Color(`interaction.focus`)가 소유합니다.

## Control

[contract:foundations.shape.control-geometry]: #
컨트롤에서 원본은 높이 하나입니다. 나머지는 높이와 컨트롤 글자 줄(Typography의 control preset, 행간 16)에서 계산합니다.

| 역할 | sm | md | lg | 식 |
|---|---|---|---|---|
| `control.height` | 30 | 32 | 36 | 원본 |
| `control.inset.input` | 7 | 8 | 10 | (높이 − 글자 줄) / 2 — 입력값은 줄상자 사방에 같은 여백 |
| `control.inset.button` | 10 | 11 | 14 | 입력 inset × 1.4, 1px로 반올림 — 라벨이 상자를 정의하므로 더 넓게 |
| `selection.size` | 15 | 16 | 18 | 높이 / 2 |
| `control.icon` | 16 | 18 | 20 | 높이를 따르는 icon 크기 (caption · body · subheading) |
| `control.gap` | 8 | 8 | 8 | 아이콘과 라벨 사이, inset sm |

컨트롤 안의 아이콘은 옆 글자가 아니라 컨트롤 높이를 따라 30 → 16, 32 → 18, 36 → 20으로 커집니다. 컨트롤 글자는 control preset(13 · 13 · 14)이라 어느 Text 역할과도 같지 않기 때문입니다. 같은 size의 Button · Field · Select는 같은 높이를 고르고, 글자는 Typography의 control preset에서 따로 고릅니다. 각 컨트롤은 `internal/shape.ts`의 `controlGeometry`에서 자기 역할을 고르며, stylesheet가 자기만의 크기 사다리를 만들지 않습니다.

## Sizing

| 역할 | 단계 | dp |
|---|---|---|
| `icon.size` | label · caption · body · subheading | 14 · 16 · 18 · 20 |
| `dimension.width` | xs ~ xl | 72 · 108 · 160 · 240 · 360 |
| `dimension.height` | xs ~ xl | 64 · 96 · 144 · 216 · 320 |
| `measure` | xs ~ xl | 448 · 512 · 608 · 672 · 736 (28 ~ 46rem) |

아이콘 artboard의 이름은 Text 역할 이름의 부분집합이라 타입으로 묶여 있고, 그 역할의 글자 옆에 놓는 크기를 뜻합니다. 컨트롤 안의 아이콘은 이 이름이 아니라 `control.icon`을 따릅니다. `dimension`은 Box의 `width="md"` 같은 이름 있는 크기이고, `measure`는 글 덩어리의 읽기 폭입니다.

## Recipe — 컴포넌트 anatomy

`SHAPE_RECIPES`에는 숫자가 없습니다. 모든 값이 역할이거나, 원본의 anatomy 값이거나, 그 둘 위의 식입니다.

[contract:foundations.shape.recipe-geometry]: #

| 대상 | 규칙 |
|---|---|
| Checkbox | 모서리 `radius.selection`. 체크는 상자의 절반 너비·4분의 1 높이인 L자를 대각선으로 돌린 것이고, 돌리면 시각 무게가 아래 왼쪽으로 쏠려 자기 획의 ¼ · ½만큼 옮깁니다. indeterminate 대시는 체크의 긴 변 길이로 그은 둥근 끝 emphasis 선입니다. |
| Radio | 점은 상자의 절반입니다. |
| Switch | 트랙 폭 = 컨트롤 높이, 트랙 높이 = 선택 상자 + 테, 손잡이 = 선택 상자 − 테. 테는 `stroke.emphasis`라, 손잡이는 사방 2px 안쪽에 앉고 정확히 자기 폭만큼 이동합니다. RTL에서는 이동 방향을 뒤집습니다. |
| Textarea | 한 줄은 같은 size의 Field와 정확히 같은 높이입니다: block 여백 = (컨트롤 높이 − textarea 글자 줄) / 2 − 테두리. 최소 높이는 `dimension.height.sm`입니다. |
| Select | 화살표는 trailing icon입니다. `control.icon` 크기의 Icon이 입력 inset 자리에 앉고, 값은 그보다 `control.gap`만큼 앞에서 멈춥니다 — Field의 leading icon을 거울로 비춘 구조입니다. |
| Spinner | 지름은 `control.icon`, 링은 `stroke.emphasis`입니다. 버튼 안 스피너는 라벨 글자(1em)를 따릅니다. |
| Badge | 높이 20 · 22 · 24와 inset 6 · 8 · 10은 규칙으로 나오지 않아 원본 anatomy에 둡니다. 점은 글자의 0.5em, 점과 글자 사이는 inset xs입니다. |

링크 밑줄 offset은 글자의 장식이라 Typography(`typography.palette.decoration.underlineOffset`)가 소유합니다.

## 앱에서

앱은 간격·형태·깊이를 역할로 고릅니다. 안쪽 여백은 `tokens.shape.inset`, 형제 사이·margin·위치 offset은 `tokens.layout.gap`, 선은 `tokens.shape.stroke`, 그림자와 z는 `tokens.layout.elevation`입니다. 사이드바 폭이나 그리드 트랙처럼 그 화면에만 있는 치수는 앱이 직접 씁니다. eslint `paper/source-numbers`의 앱 범위가 이 경계를 지킵니다.
