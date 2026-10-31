# Overview

Foundations는 화면에 쓰이는 모든 값을 정하는 다섯 시스템입니다. 색·글자·형태·배치·시간이 각자 하나의 시스템을 이루고, Primitive와 Atom은 이 값을 고르기만 합니다. 컴포넌트 안에 숫자나 색을 직접 쓰는 일은 없습니다.

## 다섯 시스템은 쌓인다

다섯 시스템은 정해진 순서로 쌓이고, 각 시스템은 자기보다 앞에 있는 시스템만 참조합니다.

```text
Color → Typography → Shape → Layout → Motion → Primitives → Atoms
```

| 시스템 | 정하는 것 | 앞 시스템에서 가져오는 것 | 원본 |
|---|---|---|---|
| [Color](color.md) | 면·잉크·경계·의미색·상태 tint | — | `tokens/palette.ts` |
| [Typography](typography.md) | 서체·크기·굵기·행간·자간, 글자 역할 | 역할별 기본 잉크(Color) | `tokens/typography.ts` |
| [Shape](shape.md) | 요소 하나의 곡률·선·포커스 링·크기·안쪽 여백 | 컨트롤 글자 줄(Typography) | `tokens/shape.ts` |
| [Layout](layout.md) | 형제 간격·페이지 틀·breakpoint·elevation(position · z · 그림자) | 길이 scale(Shape), 그림자 색(Color) | `tokens/layout.ts` |
| [Motion](motion.md) | 전이 시간·곡선·상황별 움직임 | 위 네 시스템이 바뀌는 방식 | `tokens/motion.ts` |

Shape와 Layout의 경계는 하나의 질문으로 가립니다. **빈 캔버스에 그 요소 하나만 놓아도 남는가.** 버튼의 곡률·높이·안쪽 여백은 버튼 하나만 있어도 보이므로 Shape이고, 형제 사이 간격이나 쌓임 순서는 두 번째 요소나 화면이 있어야 생기므로 Layout입니다.

## 원본 → 역할 → 조합

다섯 시스템은 모두 같은 세 단계로 짜여 있습니다. 숫자와 색은 원본에 한 번만 적고, 컴포넌트와 앱은 역할을 고르며, 역할을 묶어 컴포넌트 하나가 쓰는 완성형을 만듭니다.

| 시스템 | 원본 | 역할 | 조합 |
|---|---|---|---|
| Color | OKLCH Palette → HEX Palette Token | `bg` · `ink` · `border` · `accent` · `interaction` … | accent × variant profile |
| Typography | Typography Palette | `hero` ~ `label` 글자 역할 | Control preset · 코드 · 강조 규칙 |
| Shape | `SHAPE_SOURCE` | `inset` · `radius` · `control` · `selection` … | Shape recipe |
| Layout | `LAYOUT_SOURCE` | `gap` · `gutter` · `container` · `breakpoint` · `section` | elevation class · Surface `elevation` |
| Motion | duration · easing · loop | `press` · `hover` · `state` · `enter` · `exit` · `theme` | `transition()` · `presence` · `loop` |

Playground의 [Foundations](/playground/foundations/color) 페이지가 이 순서 그대로 각 시스템을 보여줍니다. 위에서부터 원본, 역할, 조합 순서입니다. Color만은 예전 형태(Palette 행렬과 역할별 값 카드)를 유지하고, 맨 아래에 accent × variant 표가 붙어 조합 단을 맡습니다. 모든 페이지의 행은 원본에서 파생하므로, 역할이나 단계를 더하면 페이지가 따라옵니다.

## 이름 계약

원본에서 화면까지 이름은 같은 자리에서 나오도록 짜여 있습니다. 사람이 적는 값은 `SOURCE`, 그 값을 CSS 값으로 바꾼 트리는 `VALUES`, 앱이 고르는 변수 참조 객체는 `tokens.<system>`, 역할을 묶은 완성형은 `<system>-recipes.ts`에 둡니다. 시스템마다 세 단계가 놓인 파일은 아래 표와 같습니다. 조합이 아직 `<system>-recipes.ts`로 나뉘지 않은 시스템은 지금 그 조합이 있는 파일을 적었습니다.

```text
SOURCE  →  VALUES  →  역할 (tokens.<system>)  →  조합 (<system>-recipes.ts)
dp·em·색    CSS 값       var() 참조                  숫자 없는 완성형
```

`VALUES`의 prefix는 인자로 줍니다. `buildVarTree(TYPOGRAPHY_VALUES, ["typography"])`는 `--pui-typography-palette-*` 이름을 만들고, 같은 트리를 `walkValues()`로 걸어 `:root` 변수를 굽습니다. 그래서 같은 트리 한 벌에서 CSS 이름과 TS 경로가 나옵니다.

| 시스템 | 파일 |
|---|---|
| Color | `tokens/palette.ts` · `tokens/colors.ts` · `tokens/color-modes.ts` · `tokens/color-recipes.ts` |
| Typography | `tokens/typography.ts` · `tokens/typography-recipes.ts` · `styles/typography.css.ts` |
| Shape | `tokens/shape.ts` · `tokens/shape-recipes.ts` |
| Layout | `tokens/layout.ts` · `primitives/Box.css.ts` · `primitives/paint/Surface.css.ts` |
| Motion | `tokens/motion.ts` · `styles/motion.css.ts` |
| State recipes | `tokens/state.ts` · `tokens/state-recipes.ts` · `styles/states.css.ts` |

네 군데는 시스템마다 일부러 다르게 짜여 있습니다. 모양을 억지로 맞추면 쓰임이 틀어지므로, 다른 점과 까닭을 한 표에 모아 둡니다.

| 시스템 | 다른 점 | 까닭 |
|---|---|---|
| Color | 역할을 light·dark 두 벌로 굽습니다. | 테마가 바뀌면 같은 이름의 변수 값만 바뀌어, 소비처가 테마를 분기하지 않습니다. |
| Motion | 변수를 굽지 않습니다. | duration·easing은 한 변수로 줄여 쓰기 어려워, stylesheet가 빌드 때 transition 문자열로 조립합니다. 변위는 길이라서 Shape·Layout 변수를 가리킵니다. |
| Typography | 강조를 규칙으로 공개합니다. | 글자 안의 강조는 `emphasisRule()`이 Palette의 굵기 이름(`regular` · `medium` · `semibold` · `bold`)으로 고르고, 앱은 Palette를 직접 읽지 않습니다. 장식(밑줄 `underlineOffset`)만 Palette에서 읽습니다. |
| Motion | 역할만 공개합니다. | duration·easing·loop는 Motion의 원본이라 `tokens.motion`에 없습니다. 컴포넌트는 역할을 고르고 `transition(role, …속성)`으로 조립해, 속성마다 자기 duration을 따로 고르지 않습니다. |

## 값이 화면까지 가는 길

`tokens` 객체의 leaf는 값이 아니라 CSS 변수 참조입니다. `tokens.color.bg.raised`는 `#ffffff`가 아니라 `"var(--pui-color-bg-raised)"`이고, 실제 값은 `tokens/variables.css.ts`가 `:root`와 테마 스코프에 한 번 굽습니다. 테마가 바뀌면 변수 값만 바뀌므로 소비처는 테마를 분기하지 않습니다.

```text
원본 values tree
   │  walkValues() / buildVarTree() — 같은 tree, 같은 이름 규칙
   ├──► tokens/variables.css.ts   :root { --pui-color-ink-primary: … }
   └──► tokens 객체            tokens.color.ink.primary = "var(--pui-color-ink-primary)"
```

두 산출물이 같은 tree를 같은 헬퍼로 걷기 때문에 변수 이름과 TS 경로가 어긋날 수 없습니다. 축 목록을 손으로 나열하지 않고 tree를 통째로 걷는 것도 같은 이유입니다 — 나열하면 축이 늘 때 조용히 빠지고, 빠진 변수는 에러 없이 초기값으로 떨어집니다.

시스템마다 굽는 범위는 다릅니다.

- **Color**는 의미 역할 전체를 light·dark 두 벌로 굽습니다. `<html>`에 속성이 없으면 OS 설정이 모드를 정하고, 테마 스코프(`[data-pui-theme]`)는 자기 요소에 그 모드의 고유 역할을 겁니다. 포커스 링 색과 그림자 색처럼 지면에 그려지는 역할은 스코프의 자식부터 바뀝니다. opacity는 테마와 무관한 값으로 한 번만 굽습니다.
- **Typography**는 Palette를 굽고, 글자 역할과 control preset은 Palette 변수를 조합한 class입니다.
- **Shape·Layout**은 원본만 굽습니다. 역할은 원본 변수의 별칭이거나 쓰이는 요소에서 계산되는 `calc()` 식이라, 하위 트리에서 원본 하나를 덮으면 그 위의 역할이 그 자리에서 모두 다시 계산됩니다. 그림자의 기하는 모드마다 달라 모드별 원본 변수로 굽고, 그림자 값은 쓰이는 요소에서 기하 변수와 그림자 색을 이어 붙여 조립합니다. Portal로 옮겨진 층(Floating의 panel과 backdrop)에는 열린 자리가 덮어쓴 원본이 root에 얹혀 따라갑니다. 실행 중에 숫자가 필요한 배치 값은 gap 단계 이름으로 받아 쓰이는 자리에서 잽니다.
- **Motion**은 변수로 굽지 않습니다. duration·easing은 한 변수로 줄여 쓰기 어려워, stylesheet가 빌드 때 `transition()`으로 transition 문자열을 조립하고, 변위는 Shape·Layout 변수를 가리킵니다. 등장·퇴장과 반복은 `presence`·`loop` class로 겁니다.

## 상태 recipe

hover · 눌림 · 선택 · 비활성 · 키보드 포커스가 어떻게 보이는지는 시스템이 아니라 조합입니다. Color가 면과 선의 색을, Shape가 링의 모양을, Motion이 전이 시간을 정하고, 상태 recipe(`tokens/state-recipes.ts`)가 그 값을 상태 attribute에 묶어 style 조각으로 내놓습니다. 상태의 이름(`data-active` · `data-selected` …)은 `tokens/state.ts` 한 곳에서만 적고, recipe의 selector는 모두 거기서 만들어집니다.

| 조각 | 하는 일 |
|---|---|
| `focusRing` | 키보드 포커스 링 — `focus.width` · `focus.offset`과 `interaction.focus` |
| `stateStyle.focusVisible` | 링 주인이 native outline을 끄고 `data-focus-visible`에서 링을 그림 |
| `stateStyle.disabled` · `disabledCursor` | 비활성 — `opacity.disabled`와 not-allowed 커서 |
| `stateStyle.press` | 눌림 1px |
| `stateStyle.tinted` · `item` | 면 위 tint — hover · 눌림 · 선택 |
| `stateStyle.field` | 입력 상자의 status별 경계와 hover 경계 |
| `stateStyle.dropTarget` | drop 대상의 경계 |
| `stateStyle.hoverUnderline` | 가리킬 때만 뜨는 밑줄 — `underline="hover"`인 Link |
| `linkStyle` | Link Atom을 그릴 수 없는 자리의 링크 — stylesheet가 닿는 `a` |

[contract:foundations.state.recipes]: #
조각은 plain 객체이고 `/tokens`로 나갑니다. 어떤 조각도 transition을 정하지 않아, 요소가 쓰는 속성에 맞춰 `transition()`으로 직접 묶습니다. 색을 칠하는 조각(`tinted` · `item` · `field` · `dropTarget`)은 paint 층과 패키지 밖의 앱이 spread하고, forced-colors에서 칠하는 색은 시스템 색(`SYSTEM_COLORS`)뿐입니다. 우선순위는 비활성 > 눌림 > 선택 > hover입니다. hover는 포인터가 올라갈 수 있는 환경(`@media (hover: hover)`)에서 막히지 않은 대상에만 뜨고, 가장 약한 상태라 selector에 특정도를 더하지 않습니다.

[contract:foundations.state.tint-property]: #
tint는 `--pui-state-tint` 하나입니다. `styles/states.css.ts`가 `<color>`, 상속 없음, 초기값 투명으로 등록해 전이할 수 있고, 규칙은 이 변수만 바꾸므로 면 색은 건드리지 않습니다. `@property`를 쓰지 못하는 브라우저에서는 tint는 뜨되 번지지 않습니다. 키보드 링의 baseline(`:where(:focus-visible)`)도 같은 파일에 있고, 그 규칙은 [Shape](shape.md#stroke--focus)가 정합니다.

[contract:foundations.state.source-scan]: #
상태가 적히는 곳은 정해져 있고, 패키지 소스 전체를 훑는 테스트(`styles/states.test.ts`)가 지킵니다. `:hover` · `:active` · `:focus-visible` selector는 상태 recipe(`tokens/state-recipes.ts`), 링 baseline(`styles/states.css.ts`), paint 층(`primitives/paint/`와 accent × variant 지도 `styles/color.css.ts`)에만 있고, 상태 · 값 · 표지 속성(`data-*`)의 철자는 `tokens/state.ts`에만 있습니다. 나머지는 recipe와 selector helper를 부르므로, 컴포넌트가 다는 이름과 stylesheet가 읽는 이름이 어긋날 수 없습니다.

## 공개 어휘

prop이 받는 닫힌 값의 집합을 **축**이라 부릅니다. 축마다 상수 하나와 타입 하나가 짝으로 공개되고, 앱은 목록을 손으로 다시 적지 않고 이 짝을 씁니다. 모든 짝은 `@studio-baeks/paper-ui/tokens`에서 나오며, 각 짝은 자기 시스템 파일에 한 번만 정의되고 `tokens/vocabulary.ts`가 모아 다시 내보냅니다.

[contract:foundations.vocabulary.one-pair-per-axis]: #

| 짝 (상수 · 타입) | 정의 위치 | 쓰는 prop · tokens 경로 |
|---|---|---|
| `STATUSES` · `Status` | `tokens/colors.ts` | Field · Textarea · Select의 `status` |
| `CHOICE_STATUSES` · `ChoiceStatus` | `tokens/colors.ts` | Checkbox · Radio · Switch의 `status` — `STATUSES`의 부분집합(`error`) |
| `ACCENTS` · `Accent` | `tokens/colors.ts` | Button · IconButton · Badge의 `accent`, `tokens.color.accent.<accent>` |
| `ACCENT_TONES` · `AccentTone` | `tokens/colors.ts` | `tokens.color.accent.<accent>.<tone>` |
| `VARIANTS` · `Variant` | `tokens/color-recipes.ts` | Button · IconButton · Badge의 `variant` |
| `SELECTABLE_VARIANTS` · `SelectableVariant` | `tokens/color-recipes.ts` | 선택된 상태를 soft 면으로 알릴 수 있는 variant — `VARIANTS`의 부분집합 |
| `SURFACE_FILLS` · `SurfaceFill` | `tokens/colors.ts` | Surface의 `fill`, Field · Textarea · Select의 `fill`(raised · sunken), `tokens.color.bg.<fill>` |
| `INK_LEVELS` · `InkLevel` | `tokens/colors.ts` | `tokens.color.ink.<level>` |
| `INKS` · `Ink` | `tokens/colors.ts` | Text · Icon의 `ink` — `INK_LEVELS`와 `STATUSES`, 그리고 `inherit` |
| `BORDER_LEVELS` · `BorderLevel` | `tokens/colors.ts` | `tokens.color.border.<level>` |
| `DIVIDER_LEVELS` · `DividerLevel` | `tokens/colors.ts` | Divider의 `level` — `BORDER_LEVELS`의 부분집합 |
| `DEPTHS` · `Depth` | `tokens/colors.ts` | `tokens.color.shadow.<depth>`, Layout elevation이 가진 그림자 깊이 |
| `COLOR_MODES` · `ColorMode` | `tokens/color-modes.ts` | 색 역할 한 벌과 그림자 기하를 묶는 모드 — light · dark |
| `THEME_PREFERENCES` · `ThemePreference` | `tokens/color-modes.ts` | 사용자가 고르는 테마 — 모드 둘과 `system`. `PaperProvider`의 `defaultTheme`, `useTheme().theme` |
| `SURFACE_THEMES` · `SurfaceTheme` | `tokens/color-modes.ts` | Surface의 `theme` — 모드 둘과 주변의 반대인 `inverse` |
| `TEXT_VARIANTS` · `TextVariant` | `tokens/typography.ts` | Text의 `variant`, `tokens.typography.role.<variant>` |
| `TEXT_FAMILIES` · `TextFamily` | `tokens/typography.ts` | Text의 `family` |
| `CONTROL_SIZES` · `ControlSize` | `tokens/typography.ts` | 컨트롤의 `size` |
| `CONTROL_FONT_SIZES` · `ControlFontSize` | `tokens/typography.ts` | 컨트롤의 `fontSize` — 컨트롤 상자가 담을 수 있는 `TEXT_VARIANTS`의 부분집합 |
| `CONTROL_PRESETS` · `ControlPreset` | `tokens/typography.ts` | `tokens.typography.preset.<preset>` |
| `EMPHASES` · `Emphasis` | `tokens/typography.ts` | `emphasisRule()`의 인자 — Palette 굵기 이름의 부분집합 |
| `SPACES` · `Space` | `tokens/shape.ts` | Box의 `padding`, Stack · Inline · Grid의 `gap` · `rowGap` · `columnGap`, `tokens.shape.inset.<space>`, `tokens.layout.gap.<space>` |
| `DIMENSIONS` · `Dimension` | `tokens/shape.ts` | Box의 `width` · `height` 이름 값, `tokens.shape.dimension` |
| `MEASURES` · `Measure` | `tokens/shape.ts` | Box의 `measure.<measure>` 폭, `tokens.shape.measure.<measure>` |
| `ICON_SIZES` · `IconSize` | `tokens/shape.ts` | Icon의 `size`, IconButton의 `iconSize` — `TEXT_VARIANTS`의 부분집합 |
| `CONTROL_SHAPES` · `ControlShape` | `tokens/shape.ts` | Button · Badge · Field · Select의 `shape` |
| `SURFACE_RADII` · `SurfaceRadius` | `tokens/shape.ts` | Surface의 `radius` — `radius.surface`의 단계와 `full` |
| `ELEVATIONS` · `Elevation` | `tokens/layout.ts` | Surface의 `elevation`, `elevation` class 지도의 키 |
| `BREAKPOINTS` · `Breakpoint` | `tokens/layout.ts` | `tokens.layout.breakpoint.<breakpoint>` |
| `CONTAINERS` · `Container` | `tokens/layout.ts` | Box의 `container.<container>` 폭, `tokens.layout.container.<container>` |
| `ALIGNS` · `Align` | `tokens/layout.ts` | Stack · Inline · Grid의 `align` (Stack은 `baseline` 제외) |
| `JUSTIFIES` · `Justify` | `tokens/layout.ts` | Stack · Inline · Grid의 `justify` — 주축 분배 |
| `JUSTIFY_ITEMS` · `JustifyItem` | `tokens/layout.ts` | Grid의 `justifyItems` — 칸 안의 가로 정렬 |
| `ORIENTATIONS` · `Orientation` | `tokens/layout.ts` | Divider의 `orientation`, RovingFocus의 `orientation`(`both` 추가) |
| `MOTION_ROLES` · `MotionRole` | `tokens/motion.ts` | `tokens.motion.role.<role>`, `transition()`의 첫 인자 |
| `STATE_NAMES` · `StateName` | `tokens/state.ts` | 상태 attribute의 이름(`stateSelector()`의 인자) — active · focused · focusVisible · selected · disabled · invalid · required · dragging · dropTarget. attribute 이름은 이 파일 한 곳에서만 씁니다 |

새 축은 원본 tree에서 파생하거나 `satisfies`로 양방향 묶고 `vocabulary.ts`에 상수·타입 짝으로 공개합니다. 원본 tree에서 파생한 축은 단계를 더하면 상수와 타입이 함께 늘고, `satisfies`로 묶은 축은 한쪽만 늘면 타입 검사가 막습니다.

## 앱에서 쓰기

앱은 `@studio-baeks/paper-ui/tokens`에서 `tokens`를 가져와 stylesheet에서 역할을 고릅니다. 이 entry는 React와 CSS를 import하지 않으므로 서버 컴포넌트와 stylesheet 어디서든 같은 경로로 씁니다. 아래 예시는 패널 하나를 만듭니다.

```ts
import { style } from "@vanilla-extract/css";
import { elevation } from "@studio-baeks/paper-ui";
import { tokens, transition } from "@studio-baeks/paper-ui/tokens";

export const panel = style([elevation.overlay, {
  padding: tokens.shape.inset.lg,
  borderRadius: tokens.shape.radius.surface.lg,
  border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}`,
  background: tokens.color.bg.raised,
  transition: transition("hover", "background-color"),
}]);
```

예시처럼 stylesheet를 `.css.ts`로 쓰는 앱은 `@vanilla-extract/css`와 번들러 플러그인(예: `@vanilla-extract/vite-plugin`)을 직접 설치합니다. 패키지는 빌드할 때만 vanilla-extract를 쓰고, 배포본은 완성된 CSS(`styles.css`)만 담기 때문입니다.

안쪽 여백은 `tokens.shape.inset`, 형제 사이와 margin·위치 offset은 `tokens.layout.gap`에서 고르고, position·z·그림자는 `elevation` class 하나로 한 번에 붙입니다. `elevation`은 class 지도라 `/tokens`가 아니라 컴포넌트 entry(`@studio-baeks/paper-ui`)에서 나옵니다. 미디어 쿼리는 CSS 변수를 읽지 못하므로 `tokens.layout.breakpoint`는 `"48em"` 같은 값입니다. 사이드바 폭이나 그리드 트랙처럼 그 화면에만 있는 치수는 앱이 직접 씁니다.

스타일을 고르는 순서는 하나입니다. 먼저 Primitive와 Atom의 prop으로 고릅니다. prop에 없는 정적인 값, 상태 selector, 미디어 쿼리는 `.css.ts`의 `style()`과 `styleVariants()`로 쓰고, 하위 요소는 `globalStyle(`${scoped} …`)`처럼 자기 class 아래의 selector로 고릅니다. 분기점은 `tokens.layout.breakpoint`, 페이지 틀은 `container.content`와 `layout.gutter`, 읽기 폭은 `shape.measure`에서 가져옵니다. inline style은 위치, 퍼센트, 항목마다 다른 표시 값처럼 실행 중에 정해지는 값에만 쓰고 토큰을 넣는 데 쓰지 않습니다. 이름을 손으로 지은 전역 class는 만들지 않고, 글자는 `Text` 역할이나 `typographyRule` · `codeRule` · `emphasisRule`로, 불투명도는 `tokens.color.opacity` 역할로 고릅니다. 앱이 직접 쓰는 길이는 폭, 높이, 그리드 트랙처럼 그 화면의 치수뿐입니다.

## 규칙은 빌드가 지킨다

원칙은 리뷰어의 기억이 아니라 eslint가 지킵니다. 각 규칙 뒤의 이름은 그 규칙을 거는 eslint 규칙입니다.

[contract:guardrails.layered-styles.package-css-layered]: #
[contract:guardrails.no-rule-disable.paper-rules-stay-on]: #
[contract:guardrails.no-rule-disable.reason-required]: #
[contract:guardrails.internal-class.no-class-names]: #
[contract:guardrails.inline-token.no-token-style]: #
[contract:guardrails.inline-token.declared-runtime]: #

1. **raw 색값 금지** (`paper/raw-color`). OKLCH source는 `palette.ts`, HEX 생성은 `color-ladder.ts`에만 있습니다. 소비처는 `tokens.color`만 참조하고 색을 계산하지 않습니다.
2. **원본 import 격리** (`no-restricted-imports`). palette·ladder·shape·layout의 원본 모듈은 컴포넌트·resolver·앱이 import하지 않습니다. 원본을 그대로 보여주는 Foundations inspector만 예외입니다.
3. **패키지의 inline style로 토큰 주입 금지** (`paper/inline-token`). 패키지 스타일은 `.css.ts`의 className으로만 적용합니다. 패키지의 `.ts` · `.tsx`에서 토큰 · `styles` · `internal` · 패키지 자신에서 온 값이 `style`에 닿으면, 변수와 함수 호출을 거쳐도 규칙이 따라가 막습니다. 실행 중에 정해지는 값만 예외이고 그 목록이 전부입니다: Draggable 이동 좌표, Grid track, Floating rank 변수, Floating 앵커 위치, Floating 원본 변수 운반, 호출자가 넘긴 style.
4. **길이는 원본에만** (`paper/source-numbers`). 패키지는 원본 파일 밖에서 길이 숫자를 쓰지 않습니다. 앱은 간격·형태·깊이(padding·margin·gap·offset·radius·선·그림자·z)를 역할로 고르고, 화면 고유의 치수만 직접 씁니다.
5. **패키지 CSS는 레이어 안에** (`paper/layered-styles`). 패키지 stylesheet는 vanilla-extract의 `style` · `styleVariants` · `globalStyle`을 직접 부르지 않고 `tokens/layers.css.ts`의 `layered()`로 규칙을 만듭니다. 그래서 모든 규칙이 cascade layer `pui` 안에 들고, 레이어 밖의 앱 CSS가 로드 순서와 무관하게 이깁니다([우선순위](../get-started/install.md#우선순위)). 레이어를 정의하는 `layers.css.ts`만 예외이고, `keyframes`·`createVar`는 그대로 씁니다.
6. **규칙은 주석으로 끄지 않음** (`paper/no-rule-disable`). paper 규칙은 `eslint-disable` 주석으로 끌 수 없고, 예외는 `eslint.config.js`에만 선언합니다. 다른 규칙을 끄는 주석은 `--` 뒤에 이유를 적고, 아무것도 가리지 않는 주석은 그 자체로 오류입니다.
7. **앱은 패키지 내부 class 이름을 쓰지 않음** (`paper/internal-class`). 앱과 테스트는 `pui-` 뒤에 글자가 오는 문자열을 쓰지 않습니다. 공유 축의 class는 패키지가 가진 타입 있는 지도(`fillClass` · `inkClass` · `accentVariantClass` · `spaceClass`)에서 고르고, 그 이름은 빌드가 짓습니다. 변수 `--pui-*`와 속성 `data-pui-*`는 이름을 따로 약속하므로 통과합니다.

[contract:foundations.class-maps.follow-vocabulary]: #
값만 원본에서 나오는 것이 아닙니다. 어휘 상수와 타입, class 지도의 키도 같은 원본 tree를 돌아 만들어지므로, 원본에 단계를 더하면 상수 · 타입 · class가 함께 늘고 어휘 밖의 이름은 타입에서 걸립니다.

이 검사는 사람이 기억해서 돌리지 않습니다. 패키지 build는 lint와 typecheck를 통과해야 번들을 만들고, 배포 전(`prepublishOnly`)과 CI는 `pnpm verify`로 lint · typecheck · 단위 테스트 · build · e2e를 같은 순서로 돌립니다.

접근성도 같은 방식으로 지킵니다. `eslint-plugin-jsx-a11y`가 `as`로 바뀐 요소까지 읽도록 설정되어 있어, `<Box as="button">` 같은 경우도 검사합니다.
