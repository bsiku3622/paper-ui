# Color

Color는 면·잉크·경계·의미색·상태 tint를 정하는 시스템입니다. 베이스는 흰색과 검정 둘뿐이고, 색(blue·green·amber·red)은 상태·포커스·링크처럼 의미가 있는 자리에만 작게 얹습니다. 다섯 시스템 중 가장 앞에 있어 다른 시스템을 참조하지 않습니다.

색은 한 방향으로만 흐릅니다.

```text
palette.ts (OKLCH 원본 + 조립) ──호출──> color-ladder.ts (순수 색 계산)
       │
       └── 완성된 OKLCH 좌표 + HEX Palette Token
                         ↓
        colors.ts (COLOR_SELECTION: 테마별 역할 → Palette 경로) → CSS 변수 → 화면
```

## Palette — 원본

`tokens/palette.ts`가 유일한 색 원본입니다. 중립 ramp 하나와 accent ramp 넷(blue·green·amber·red)의 OKLCH 기준점, 그리고 `alpha05`~`alpha95` 고정 opacity 단계를 가집니다. 기준점 사이는 OKLCH에서 보간하고, sRGB 밖으로 나가는 색만 chroma를 줄여 담습니다. 이 계산은 `color-ladder.ts`의 순수 함수가 맡고, `color-ladder.ts`는 palette 데이터를 import하지 않아 의존이 한 방향으로 유지됩니다.

Palette는 테마와 무관합니다. 테마를 바꿔도 ramp는 그대로이고, light·dark 의미 역할이 같은 ramp에서 서로 다른 단계를 고를 뿐입니다.

| ramp | 단계 | 비고 |
|---|---|---|
| neutral | 0 · 50 · 100 · 150 · 200 · 300 · 400 · 500 · 600 · 650 · 700 · 800 · 875 · 900 · 925 · 950 | hue 286°·낮은 chroma의 cool neutral. 0이 가장 밝고 950이 가장 어둡습니다 |
| blue · green · amber · red | 50 ~ 950 (14단계) | 같은 번호는 네 hue에서 같은 OKLCH 명도입니다 |
| alpha | 05 ~ 95 | neutral 0과 950 끝점에 고정 opacity를 얹은 반투명 단계 |

`150`·`650`·`875`·`925` 같은 중간 단계는 앞뒤 기준점 사이를 보간해 만듭니다. 어느 두 기준점 사이의 어디쯤인지는 `NEUTRAL_BETWEEN`이 단계마다 적습니다. `925`는 다크의 raised 면처럼 950 바로 위에 떠야 하는 자리를 위해 있습니다. amber는 밝은 단계(90°)에서 노랑을 유지하다가 400부터 주황(65°)으로 넘어가고, 200·300의 chroma를 완만하게 올려 채도가 갑자기 튀지 않게 했습니다. 이 보정은 조립 코드의 분기가 아니라 `ACCENT_IDENTITIES.amber`의 `paleHue`와 `chromaRatio` 데이터입니다.

Palette Token은 내부 이름입니다. 컴포넌트와 앱은 import하지 않고, 의미 역할만 고릅니다. 생성된 단계는 Playground [Color](/playground/foundations/color)의 Palette 행렬에서 확인합니다. 칩에 포인터를 올리면 단계와 HEX가 보입니다.

## 의미 역할

화면이 쓰는 색 이름입니다. 모든 역할은 테마마다 Palette Token 하나를 고르고, 다른 역할을 참조하거나 색을 계산하지 않습니다. 그 선택은 `colors.ts`의 `COLOR_SELECTION`(테마별 역할 → Palette 경로) 한 표에 있고, `COLOR_VALUES`는 그 표에서 파생합니다. 그래서 모든 leaf는 생성된 Palette Token과 값이 같고, Playground [Color](/playground/foundations/color)의 각 칸은 이 표를 읽어 Palette Token 이름을 보여줍니다.

| 시스템 | 경로 | 역할 |
|---|---|---|
| Surface | `bg.<level>` | `canvas` · `raised` · `sunken` |
| Control | `control.<role>` | `track` |
| Ink | `ink.<level>` | `primary` · `secondary` · `tertiary` |
| Border | `border.<level>` | `base` · `strong` · `hover` |
| Accent | `accent.<name>.<tone>` | `primary` · `info` · `success` · `warning` · `error` × `solid` · `wash` · `ink` · `soft` · `subtle` |
| Interaction | `interaction.<state>` | `bgHover.onSurface` · `bgHover.onPrimarySolid` · `bgHover.onAccentSolid` · `selected` · `active` · `focus` · `link` |
| Overlay | `overlay.<role>` | `scrim` |
| Shadow | `shadow.<depth>` | `floating` · `lifted` |
| Opacity | `opacity.<role>` | `disabled` · `subdued` |

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
| `interaction.link` | blue.700 | blue.300 |
| `overlay.scrim` | alpha30.neutral.950 | alpha60.neutral.950 |
| `shadow.floating` · `lifted` | alpha10.neutral.950 · alpha10.neutral.950 | alpha60.neutral.950 · alpha45.neutral.950 |

[contract:foundations.color.surface-ladder]: #
면은 앞에서 뒤로 `raised` > `canvas` > `sunken` 순서로 물러납니다. 라이트는 세 단계가 모두 다르고, 다크는 두 단계입니다 — 페이지(`canvas`)가 이미 가장 깊은 단계라 `sunken`이 같은 neutral.950을 씁니다. 그래서 다크에서 canvas 위의 sunken 면은 면 색이 아니라 경계로 구분하고, raised 위에서는 두 모드 모두 물러나 보입니다. 이 순서는 `SURFACE_ORDER`에 선언되어 있고, 두 모드에서 명도가 앞에서 뒤로 줄어드는지와 모든 잉크가 모든 면 위에서 4.5:1 이상인지를 단위 테스트가 지킵니다.

`control.track`은 Switch 트랙과 진행 막대의 홈처럼 컨트롤 안에 박힌 면입니다. `bg` 밖에 따로 둔 이유는 컨트롤의 세부가 일반 페이지 면으로 번지지 않게 하기 위해서입니다. 포커스 링의 색은 `interaction.focus`가 갖고, 두께와 offset은 [Shape](shape.md)이, 그림자의 기하는 [Layout](layout.md)의 elevation이 갖습니다.

그림자의 색은 층 이름이 아니라 깊이로 부릅니다. `floating`은 팝오버·대화상자·알림처럼 떠 있는 층의 그림자 색이고, `lifted`는 살짝 들린 층의 그림자 색입니다. 라이트에서는 두 값이 같고 다크에서만 갈립니다(60 대 45). 이 시스템에서 "overlay"는 떠 있는 층(Floating · elevation `overlay` · `overlay.scrim`)만 가리키고, 면 위에 얹는 상태 wash는 tint라고 부릅니다.

`opacity`는 팔레트 단계가 아니라 alpha 단계 하나를 값으로 씁니다. `disabled`는 alpha 50(0.5), `subdued`는 alpha 70(0.7)이고 어떤 테마에서도 같습니다. 선택표 밖에 있어서 위 표와 Playground Color에는 나오지 않습니다.

`interaction`의 상태 역할은 뜻이 서로 다릅니다. `active`는 중립 항목이 눌리는 동안의 면, `selected`는 중립 항목이 선택된 면, `focus`는 입력이 향하는 자리 — 키보드 포커스 링과 drop 대상의 경계 — 입니다. 항목은 이 면을 `tokens/color-recipes.ts`의 `itemProfile`(hover는 `bgHover.onSurface`, 눌림은 `active`, 선택은 `selected`)에서 읽고, 눌림이 선택을, 선택이 hover를 이깁니다.

링크의 색은 `interaction.link`입니다. 지금은 `accent.info.ink`와 같은 blue.700 · blue.300을 고르지만 뜻이 다른 역할입니다. info는 상태를 알리고 link는 눌러서 이동할 수 있다는 표시라, 상태색을 바꿔도 링크가 따라 움직이지 않습니다. 링크는 모든 면 위에서 4.5:1 이상입니다.

## 테마 스코프

테마는 색 역할 전체와 Layout의 그림자 기하를 한 묶음(**모드**)으로 고르는 일입니다. 모드는 light · dark 둘이고, `<html>`이나 요소에 건 `data-pui-theme` 속성이 정합니다.

[contract:foundations.theme.system-fallback]: #
`<html>`에 속성이 없으면 OS의 `prefers-color-scheme`이 모드를 정합니다. `:root`는 light이고, OS가 dark이면서 속성이 없을 때만 `:root:not([data-pui-theme])`가 dark 묶음을 덮습니다. 속성이 있으면 OS와 무관하게 그 값이 이깁니다. 스타일시트와 엔진(`readRootMode`)이 같은 규칙을 씁니다.

[contract:foundations.theme.scope-roles]: #
스코프 안에서는 세 가지가 달라집니다. 스코프 요소 자신이 그 모드의 고유 역할(면·잉크·경계·accent …)과 `color-scheme`을 갖습니다. 상속되는 글자색 `ink.primary`를 스코프마다 다시 선언하므로, 스코프 안의 글자는 바깥 모드가 아니라 스코프의 모드를 따릅니다(특정도가 0이라 class가 정한 색은 그대로 이깁니다). 그리고 지면 역할은 스코프의 자식부터 그 모드로 바뀝니다.

지면 역할은 요소 바깥, 그 요소가 서 있는 지면에 그려지는 값입니다 — 포커스 링 색(`interaction.focus`), 그림자 색(`shadow.*`), 그림자 기하(`--pui-layout-shadow-<depth>-<i>`). 그래서 어두운 스코프 요소가 드리우는 그림자와 포커스 링은 바깥 지면의 모드로 그려지고, 그 안의 자식이 드리우는 것은 스코프의 모드로 그려집니다. 그림자는 변수 하나로 구워 두지 않고 쓰이는 요소에서 기하 변수와 그림자 색을 이어 붙이므로([Layout](layout.md)), 스코프가 어느 쪽을 바꿔도 따라옵니다.

## 대비 모드

`prefers-contrast: more`에서는 조용한 역할 넷만 한 단 올립니다. 경계는 모든 면 위에서 3:1 이상, `ink.tertiary`는 4.5:1 이상이 되고 나머지 역할은 그대로입니다. 올린 값은 `COLOR_CONTRAST_MORE`에 모드별로 적혀 있고, 기본 묶음 뒤에 같은 스코프 선택자로 굽기 때문에 우선순위가 기본 묶음과 같습니다.

[contract:foundations.color.contrast-more]: #

| 역할 | Light | Dark |
|---|---|---|
| `border.base` · `strong` · `hover` | neutral.600 · 650 · 700 | neutral.600 · 500 · 400 |
| `ink.tertiary` | neutral.700 | neutral.400 |

선택된 면은 옅게 깔려 색만으로는 경계가 모자랄 수 있어, 이 모드에서는 선택된 중립 항목이 `ink.primary` 1px 안쪽 선(`strokeRing`)을 더 얻습니다. 선택을 색 하나에만 기대지 않게 하는 비색 단서입니다.

## 대비 계약

글자는 4.5:1입니다. 컨트롤과 그 상태를 알리는 표식은 3:1입니다 — 선택 상자와 라디오의 경계, 스위치 트랙의 테와 켜진 트랙, 체크 면과 그 위의 표식, 포커스 링, 오류 경계. 선택 표식은 꺼져 있을 때 이 테가 유일한 단서이므로 테에 `ink.tertiary`를 씁니다. 3:1을 지키는 가장 옅은 기존 역할이고(라이트 #6b6b6d가 면 위에서 4.80~5.32, 다크 #98989a가 5.85~6.55), 경계 역할은 라이트에서 2.0을 넘지 못해 쓸 수 없습니다. 표식만을 위한 역할은 없습니다 — neutral.600 같은 원본 단계를 따로 드러내면 컨트롤 전용 색이나 Color 페이지의 새 행이 됩니다. 켜진 Switch는 primary solid 트랙과 `bg.raised` 손잡이이고, 켜짐은 면(최소 15:1)이 알립니다.

[contract:foundations.color.non-text-contrast]: #
단위 테스트(`tokens/color.test.ts`)가 두 테마의 모든 면(raised · canvas · sunken) 위에서 표식의 꺼진 테(`ink.tertiary`), 켜진 면(`accent.primary.solid`), 포커스 링, 오류 테(`accent.error.ink`)가 3:1 이상임을, 꺼진 트랙이 켜진 트랙과 3:1 이상 갈리고 켜진 트랙 위의 손잡이(`bg.raised`)와 체크(`accent.primary.wash`)가 3:1 이상임을 지킵니다. 다크 `accent.ink`는 모든 다크 면 위에서 4.5:1 이상으로 라이트와 같고, hover · selected · active의 tint를 면에 깐 자리 위의 `ink.primary`도 4.5:1 이상입니다.

명시된 예외는 둘입니다. 하나는 입력 경계(`border.base`)입니다. 회색 선은 한 벌이라는 결정에 따라 컨트롤 전용 경계색을 두지 않으므로, 라벨 · placeholder · hover 경계 · 포커스 링이 입력의 존재를 보완하고 `prefers-contrast: more`에서 3:1로 오릅니다. 다른 하나는 옅게 깔린 selected 면(accent `soft`, `interaction.selected`)입니다. `aria-pressed` · `aria-current`와 `ink.primary`가 선택을 보완하고 `prefers-contrast: more`에서 `ink.primary` 안쪽 테를 얻습니다. selected · active 면 위의 글자는 `ink.primary`만 씁니다. 단위 테스트는 두 예외가 실제로 3:1 아래임을 확인해 목록이 거짓이 되지 않게 합니다.

## Forced colors

Windows 고대비처럼 OS가 색을 정하는 모드(`forced-colors: active`)에서는 대부분의 요소를 OS에 맡깁니다. 상태가 배경에만 기대는 자리 — 선택 표식, Spinner, selected 면 — 만 `forced-color-adjust: none`으로 빼고 시스템 색으로 직접 그립니다. 시스템 색 이름은 `SYSTEM_COLORS`(`Canvas` · `CanvasText` · `ButtonFace` · `ButtonText` · `Highlight` · `HighlightText` · `GrayText` · `LinkText`)만 적어 두고, 값은 OS가 정합니다. hover는 Highlight 경계, 비활성은 GrayText, 포커스 링은 Highlight입니다. 선택 표식은 Canvas 면과 ButtonText 테에서 켜지면 Highlight 면과 HighlightText 표식이 되고, Switch의 테는 같은 안쪽 테(`strokeRing`)로 ButtonText · Highlight를 그립니다. Divider는 background가 아니라 border로 그어 이 모드에서도 남습니다. 이 모드의 표식별 모습은 [States](../atoms/states.md#대비--forced-colors--prefers-contrast--target)에 있습니다.

## Accent

`primary`와 네 상태색은 같은 다섯 tone을 공유합니다. `primary`는 neutral이고, `info`·`success`·`warning`·`error`는 각각 blue·green·amber·red ramp에서 고릅니다. 이 시스템에는 `primaryColor`가 없습니다 — 1차 행동도 검정입니다.

| tone | 쓰는 곳 | Light | Dark |
|---|---|---|---|
| `solid` | 채운 면, 상태 점 | 600 (primary 950) | 600 (primary 50) |
| `wash` | solid 위 글자 | 50 (primary 0) | 50 (primary 950) |
| `ink` | soft·hairline·ghost 위 글자와 의미색 글자 (링크는 `interaction.link`) | 700 (primary 900) | 300 (primary 100) |
| `soft` | soft variant의 옅은 면 | 150 (primary 200) | 925 (primary 875) |
| `subtle` | muted variant의 글자 | 700 (primary 700) | 400 (primary 500) |

tone마다 고르는 단계는 `ACCENT_TONE_STEPS`(상태색)와 `PRIMARY_TONE_STEPS`(primary)의 [light, dark] 쌍입니다. 이 표를 벗어나는 조합은 `STATUS_EXCEPTIONS`에 status 이름으로 적고, pigment 이름으로는 분기하지 않습니다.

light `warning`은 의도된 예외입니다. `STATUS_EXCEPTIONS.warning`이 light의 `solid`를 amber.400, `wash`를 흰색(neutral.0)으로 바꿔 작은 글자 대비가 4.5:1에 못 미치지만, 중간 밝기의 주황 채움이 시각적으로 맞다고 판단해 남겨 두었습니다. 나머지 조합은 4.5:1을 지킵니다.

상태 점은 두 가지입니다. 독립 상태 점은 accent `solid`를, 글자 옆에 붙는 점은 그 글자의 잉크를 씁니다.

## Accent × variant

Atom은 색을 직접 고르지 않고 `accent`와 `variant` 두 축을 말합니다. 이 조합이 어떤 tone을 쓰는지는 `tokens/color-recipes.ts`의 `VARIANT_RECIPE`가 한 곳에서 정하고, `accentProfile`과 Playground [Color](/playground/foundations/color)의 Accent × variant 표가 같은 표를 읽습니다.

[contract:foundations.color.profile-shape]: #

| variant | 면 | 글자 | hover | selected |
|---|---|---|---|---|
| `solid` | `solid` | `wash` | `bgHover.onPrimarySolid`(primary) 또는 `onAccentSolid` tint | 없음 |
| `soft` | `soft` | `ink` | `bgHover.onSurface` tint | 없음 |
| `hairline` | `bg.raised` + `border.base` | `ink`(primary는 `ink.primary`) | `border.hover` | 그 accent의 `soft` 면, 경계는 투명 |
| `ghost` | 투명 | `ink` | `bgHover.onSurface` tint | 그 accent의 `soft` 면 |
| `muted` | 투명 | `subtle` | `bgHover.onSurface` tint | 그 accent의 `soft` 면, 글자는 `ink` |

선택된 상태를 soft 면으로 알릴 수 있는 variant는 `SELECTABLE_VARIANTS`(`hairline` · `ghost` · `muted`)입니다. 면이 없거나 옅어서 선택된 모습이 따로 필요한 variant들이고, `solid`와 `soft`는 이미 면이 있어 selected가 없습니다. 선택은 `data-selected`나 `aria-current`가 알리고 `Paint`의 `selected`가 `data-selected`를 답니다. 선택된 면 위의 hover는 경계를 올리지 않고 tint만 얹습니다. tint는 면(`backgroundColor`)을 바꾸지 않고 면 위에 깔린 한 겹 `--pui-state-tint`를 옮기는 것이라, 전이가 면 위에서 합성됩니다([상태와 피드백](../atoms/states.md#tint와-색-profile)).

profile은 `accentProfile(accent, variant)`가 `{ face, ink, border, hover, selected? }`로 돌려줍니다. `hover`는 `{ tint }`와 `{ border }` 중 하나뿐이라 variant마다 hover 표현이 정확히 하나이고, `selected`는 `SELECTABLE_VARIANTS`에만 있습니다. 같은 파일이 입력 상자(`outlinedControlProfile`: 면·잉크·경계·hover 경계·status별 경계), 중립 항목(`itemProfile`), 선택 표식(`markProfile`, OS가 색을 정하는 모드의 `markForcedProfile`)의 색도 데이터로 정합니다.

`paintClass({ accent: "error", variant: "solid" })`는 `styles/color.css.ts`의 `accentVariantClass.error.solid`에 든 class를 고릅니다. 그 지도는 `ACCENTS × VARIANTS` 배열을 걸어 만들므로 조합이 빠지거나 어긋날 수 없고, 어휘 밖의 이름은 타입에서 걸립니다. class의 이름은 빌드가 짓습니다. 전역으로 약속된 이름이 없으니 앱은 이름을 문자열로 붙들지 않고 컴포넌트 prop으로 고릅니다. 면과 잉크는 색과 다른 축이라 `fillClass` · `inkClass`로 따로 갑니다. 글자와 아이콘의 `ink`는 `INKS`, 곧 Color의 `ink.*` 이름(`primary` · `secondary` · `tertiary`)과 상태 이름과 `inherit`입니다. hover는 `hoverable`을 준 컴포넌트에만 걸려, Badge처럼 누를 수 없는 표식에는 번지지 않습니다. 상태별 우선순위는 [상태와 피드백](../atoms/states.md)에 있습니다.

## 색을 바꿀 때

1. `palette.ts`에서 OKLCH 기준점이나 alpha 단계를 고칩니다.
2. Playground Color의 Palette 행렬에서 생성된 단계를 확인합니다. 칩에 포인터를 올리면 단계와 HEX가 보입니다. 앱 테마를 바꿔도 ramp가 같아야 합니다.
3. 어떤 역할이 다른 단계를 써야 하면 `colors.ts`의 `COLOR_SELECTION`에서 그 역할의 경로만 고칩니다. 새 역할은 선택표에 leaf를 더하고 Playground Color의 `ROLE_NOTES`에 설명을 답니다. 설명이 빠지면 타입 검사가 막습니다.
4. 컴포넌트에서는 의미 역할만 쓰고, light·dark 양쪽에서 확인합니다.

지켜야 할 불변식은 하나입니다. 모든 의미 역할은 생성된 Palette Token과 같고, 화면에 그려지는 모든 색은 의미 역할을 거쳐 들어옵니다.
