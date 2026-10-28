# Color

Color는 면·잉크·경계·의미색·상태 overlay를 정하는 시스템입니다. 베이스는 흰색과 검정 둘뿐이고, 색(blue·green·amber·red)은 상태·포커스·링크처럼 의미가 있는 자리에만 작게 얹습니다. 다섯 시스템 중 가장 앞에 있어 다른 시스템을 참조하지 않습니다.

색은 한 방향으로만 흐릅니다.

```text
palette.ts (OKLCH 원본 + 조립) ──호출──> color-ladder.ts (순수 색 계산)
       │
       └── 완성된 OKLCH 좌표 + HEX Palette Token
                         ↓
                colors.ts (의미 역할, light·dark) → CSS 변수 → 화면
```

## Palette — 원본

`tokens/palette.ts`가 유일한 색 원본입니다. 중립 ramp 하나와 accent ramp 넷(blue·green·amber·red)의 OKLCH 기준점, 그리고 `alpha05`~`alpha95` 고정 opacity 단계를 가집니다. 기준점 사이는 OKLCH에서 보간하고, sRGB 밖으로 나가는 색만 chroma를 줄여 담습니다. 이 계산은 `color-ladder.ts`의 순수 함수가 맡고, `color-ladder.ts`는 palette 데이터를 import하지 않아 의존이 한 방향으로 유지됩니다.

Palette는 테마와 무관합니다. 테마를 바꿔도 ramp는 그대로이고, light·dark 의미 역할이 같은 ramp에서 서로 다른 단계를 고를 뿐입니다.

| ramp | 단계 | 비고 |
|---|---|---|
| neutral | 0 · 50 · 100 · 150 · 200 · 300 · 400 · 500 · 600 · 650 · 700 · 800 · 875 · 900 · 925 · 950 | hue 286°·낮은 chroma의 cool neutral. 0이 가장 밝고 950이 가장 어둡습니다 |
| blue · green · amber · red | 50 ~ 950 (14단계) | 같은 번호는 네 hue에서 같은 OKLCH 명도입니다 |
| alpha | 05 ~ 95 | neutral 0과 950 끝점에 고정 opacity를 얹은 반투명 단계 |

`650`·`875`·`925` 같은 중간 단계는 앞뒤 기준점 사이를 보간해 만듭니다. `925`는 다크의 raised 면처럼 950 바로 위에 떠야 하는 자리를 위해 있습니다. amber는 밝은 단계(90°)에서 노랑을 유지하다가 400부터 주황(65°)으로 넘어가고, 200·300의 chroma를 완만하게 올려 채도가 갑자기 튀지 않게 했습니다.

Palette Token은 내부 이름입니다. 컴포넌트와 앱은 import하지 않고, 의미 역할만 고릅니다. 원본 좌표와 생성된 HEX는 Playground [Color](/playground/foundations/color)의 Color Palette 표에서 확인합니다.

## 의미 역할

화면이 쓰는 색 이름입니다. 모든 역할은 테마마다 Palette Token 하나를 고르고, 다른 역할을 참조하거나 색을 계산하지 않습니다. 그래서 `colors.ts`의 모든 leaf는 생성된 Palette Token과 값이 같습니다.

| 시스템 | 경로 | 역할 |
|---|---|---|
| Surface | `bg.<level>` | `canvas` · `raised` · `sunken` |
| Control | `control.<role>` | `track` |
| Ink | `ink.<level>` | `primary` · `secondary` · `tertiary` |
| Border | `border.<level>` | `base` · `strong` · `hover` |
| Accent | `accent.<name>.<tone>` | `primary` · `info` · `success` · `warning` · `error` × `solid` · `wash` · `ink` · `soft` · `subtle` |
| Interaction | `interaction.<state>` | `bgHover.onSurface` · `bgHover.onPrimarySolid` · `bgHover.onAccentSolid` · `selected` · `active` · `focus` |
| Overlay | `overlay.<role>` | `scrim` |
| Shadow | `shadow.<role>` | `overlay` · `overlayMinimal` |

각 역할이 고르는 단계는 다음과 같습니다.

| 역할 | Light | Dark |
|---|---|---|
| `bg.canvas` | neutral.50 | neutral.950 |
| `bg.raised` | neutral.0 | neutral.925 |
| `bg.sunken` | neutral.100 | neutral.950 |
| `control.track` | neutral.200 | neutral.800 |
| `ink.primary` · `secondary` · `tertiary` | neutral.900 · 700 · 650 | neutral.100 · 400 · 500 |
| `border.base` · `strong` · `hover` | neutral.200 · 300 · 400 | neutral.800 · 700 · 600 |
| `interaction.bgHover.onSurface` | alpha05.neutral.950 | alpha05.neutral.0 |
| `interaction.bgHover.onPrimarySolid` | alpha10.neutral.0 | alpha10.neutral.950 |
| `interaction.bgHover.onAccentSolid` | alpha15.neutral.950 | alpha15.neutral.950 |
| `interaction.selected` · `active` | alpha15.neutral.950 · alpha15.neutral.950 | alpha10.neutral.0 · alpha15.neutral.0 |
| `interaction.focus` | blue.600 | blue.400 |
| `overlay.scrim` | alpha30.neutral.950 | alpha60.neutral.950 |
| `shadow.overlay` · `overlayMinimal` | alpha10.neutral.950 · alpha10.neutral.950 | alpha60.neutral.950 · alpha45.neutral.950 |

`control.track`은 Switch 트랙과 진행 막대의 홈처럼 컨트롤 안에 박힌 면입니다. `bg` 밖에 따로 둔 이유는 컨트롤의 세부가 일반 페이지 면으로 번지지 않게 하기 위해서입니다. 포커스 링의 색은 `interaction.focus`가 갖고, 두께와 offset은 [Shape](shape.md)이, 그림자의 기하는 [Layout](layout.md)의 elevation이 갖습니다.

## Accent

`primary`와 네 상태색은 같은 다섯 tone을 공유합니다. `primary`는 neutral이고, `info`·`success`·`warning`·`error`는 각각 blue·green·amber·red ramp에서 고릅니다. 이 시스템에는 `primaryColor`가 없습니다 — 1차 행동도 검정입니다.

| tone | 쓰는 곳 | Light | Dark |
|---|---|---|---|
| `solid` | 채운 면, 상태 점 | 600 (primary 950) | 600 (primary 50) |
| `wash` | solid 위 글자 | 50 (primary 0) | 50 (primary 950) |
| `ink` | soft·hairline·ghost 위 글자, 링크와 의미색 글자 | 700 (primary 900) | 300 (primary 100) |
| `soft` | soft variant의 옅은 면 | 150 (primary 200) | 925 (primary 875) |
| `subtle` | muted variant의 글자 | 700 (primary 700) | 400 (primary 500) |

light `warning`은 의도된 예외입니다. `solid`가 amber.400, `wash`가 흰색(neutral.0)이라 작은 글자 대비 4.5:1에 못 미치지만, 중간 밝기의 주황 채움이 시각적으로 맞다고 판단해 남겨 두었습니다. 나머지 조합은 4.5:1을 지킵니다.

## Accent × variant

Atom은 색을 직접 고르지 않고 `accent`와 `variant` 두 축을 말합니다. 이 조합이 어떤 tone을 쓰는지는 `styles/color-profile.ts`가 한 곳에서 정합니다.

| variant | 면 | 글자 | hover |
|---|---|---|---|
| `solid` | `solid` | `wash` | `bgHover.onPrimarySolid`(primary) 또는 `onAccentSolid` overlay |
| `soft` | `soft` | `ink` | `bgHover.onSurface` overlay |
| `hairline` | `bg.raised` + `border.base` | `ink`(primary는 `ink.primary`) | `border.hover` |
| `ghost` | 투명 | `ink` | `bgHover.onSurface` overlay |
| `muted` | 투명 | `subtle` | `bgHover.onSurface` overlay |

`resolveAccent("error", "solid")`는 `"pui-a-error-solid"`라는 이름만 돌려주고, 그 이름의 실체는 `styles/color.css.ts`가 같은 `ACCENTS × VARIANTS` 배열을 걸어 굽습니다. resolver가 만들 수 있는 모든 이름에 대응하는 규칙이 반드시 있으므로 조합이 빠지거나 어긋날 수 없습니다. 면은 색과 다른 축이라 `resolveSurface("raised")` → `"pui-surface-raised"`로 따로 갑니다. hover는 `.pui-interactive`가 붙은 컴포넌트에만 걸려, Badge처럼 누를 수 없는 표식에는 번지지 않습니다. 상태별 우선순위는 [상태와 피드백](../atoms/states.md)에 있습니다.

## 색을 바꿀 때

1. `palette.ts`에서 OKLCH 기준점이나 alpha 단계를 고칩니다.
2. Playground의 Color Palette 표에서 생성된 HEX와 gamut mapping을 확인합니다. 앱 테마를 바꿔도 ramp가 같아야 합니다.
3. 어떤 역할이 다른 단계를 써야 하면 `colors.ts`에서 그 테마의 매핑만 고칩니다.
4. 컴포넌트에서는 의미 역할만 쓰고, light·dark 양쪽에서 확인합니다.

지켜야 할 불변식은 하나입니다. 모든 의미 역할은 생성된 Palette Token과 같고, 화면에 그려지는 모든 색은 의미 역할을 거쳐 들어옵니다.
