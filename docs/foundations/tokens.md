# Tokens

모든 색·크기·시간의 정본입니다. 컴포넌트는 이 값을 직접 알지 못하고, `tokens` 객체의 `var()` 참조로만 닿습니다. 컬러는 `OKLCH Palette → HEX Palette Token → semantic system → real use` 순서로 흐릅니다. 자세한 경계는 [색 아키텍처](color-architecture.md)에 고정합니다.

2026년 doodle 작업 화면에서 확인한 여백과 면의 조합을 중립 토큰에 반영했습니다. 문서 폭·점무늬·패널 배치 같은 화면 고유의 형태는 공통 토큰으로 올리지 않았습니다. [Tokens Playground](/playground/tokens)의 조합 예시에서 light/dark 결과를 함께 볼 수 있습니다.

## Color

베이스는 종이색 배경과 중립 잉크입니다. 색은 의미가 있을 때 accent로 얹습니다. 컬러 API는 다섯 의미 시스템을 가집니다.

| 시스템 | 경로 | 토큰 |
|---|---|---|
| Surface | `bg.<level>` | `raised · canvas · sunken · well` |
| Border | `border.<level>` | `base · strong · hover` |
| Ink | `ink.<level>` | `primary · secondary · tertiary` |
| Accent | `accent.<name>.<ladder>` | `primary · info · success · warning · error` × `solid · wash · soft · subtle` |
| Interaction | `interaction.<state>` | `bgHover · selected · active · focus` |
| Overlay | `overlay.<role>` | `scrim` |
| Shadow | `shadow.<role>` | `overlay · overlayMinimal` |

예: `tokens.color.bg.canvas`, `tokens.color.ink.primary`, `tokens.color.accent.warning.soft`, `tokens.color.interaction.bgHover.onSurface`, `tokens.color.overlay.scrim`, `tokens.color.shadow.overlay`. Semantic tree의 모든 leaf는 생성된 Palette Token과 값이 같습니다. 다른 semantic leaf를 참조하거나 semantic 단계에서 색 계산을 하지 않습니다.

### OKLCH Palette → HEX Palette Token

`palette.ts`는 테마와 무관한 중립·accent OKLCH ramp와 `alpha05`~`alpha95` percentage scale을 하나씩 가집니다. `color-ladder.ts`는 anchor 사이를 OKLCH에서 보간하고 sRGB 밖의 색은 chroma를 낮춰 gamut 안으로 옮깁니다. 일반 색은 6자리 HEX, alpha step은 8자리 HEX Palette Token으로 생성합니다. Raw HEX를 직접 관리하지 않습니다.

중립 step 번호는 밝은 쪽에서 어두운 쪽으로 진행합니다. `0`은 white에 가까운 끝점이고 `950`은 near-black 끝점입니다. Neutral과 Accent 모두 `900 · 925 · 950`을 가지며, `925`는 두 ramp에서 앞뒤 anchor 사이에 생성합니다. Dark `bg.canvas`는 `neutral.925`, `bg.raised`는 `neutral.950`을 선택합니다. Palette 화면은 테마가 바뀌어도 같은 ramp를 보여줍니다. Light/Dark surface·ink·border·accent 의미 역할은 `colors.ts`에서 서로 다른 step을 선택합니다. Neutral은 hue 286°·낮은 chroma의 단일 cool-neutral ramp입니다. Accent palette는 13 step으로 만들고, `primary · info · success · warning · error`가 neutral·blue·green·amber·red의 토큰을 선택합니다.

Accent는 `solid`(채운 면과 지면 위 색 글자) · `wash`(solid 위 전경과 가벼운 tint) · `soft`(부드러운 면과 hairline 경계) · `subtle`(muted 글자)를 공유합니다. `muted`는 Ghost형 투명 면에 선택된 accent의 `subtle` 전경을 쓰는 보조 variant입니다.

### Interaction과 상수

`interaction.bgHover`는 `onSurface`·`onPrimarySolid`·`onAccentSolid` 배경 hover overlay를 제공합니다. `selected`·`active`·`focus`도 Interaction 토큰입니다. Focus ring 색은 `interaction.focus`, 링 두께와 offset은 Shape geometry가 맡습니다. Scrim은 `overlay.scrim`, 그림자 색은 `shadow.overlay`와 `shadow.overlayMinimal`에 둡니다.

Interaction overlay, scrim, shadow tint의 반투명 값은 중립 양 끝점에 고정 percentage alpha step을 적용해 8자리 HEX Palette Token으로 생성합니다. 예를 들어 `alpha05.neutral.950`이나 `alpha60.neutral.0`처럼 Palette에서 확인할 수 있고, Semantic mapping은 테마에 맞는 alpha Palette Token을 선택합니다.

`theme.css.ts`는 이 semantic tree를 light/dark CSS variable로 굽고, component·resolver·app은 `tokens.color` 참조만 씁니다. 색 변경 경로와 예시는 [Color architecture](color-architecture.md), 생성값은 [Palette Playground](/playground/palette), 실제 semantic 결과는 [Tokens Playground](/playground/tokens)에서 확인합니다.

## Shape

크기는 **5단 사다리(xs~xl) × intent(interaction·layout)** 구조입니다 — chrome(Button·Field)은 `interaction`, container(Box·Modal)는 `layout`을 씁니다. 기본 control은 compact한 32px 높이와 8px corner를 앵커로 둡니다.

**height** — `interaction` 24/30/32/40/44 (control = `md.interaction` 32) · `layout` 64~320
**입력 글자는 `weight.normal`(450), 13px(control)**입니다. `normal`은 400이 아니라 작은 sans가 Retina에서 힘이 빠지지 않게 보정한 half-step입니다. Button primary는 demo의 묵직한 인상에 맞춰 별도 `weight.strong`(650)를 사용하고, 보조 버튼은 `medium`(550)을 씁니다. 입력 자간은 `tracking.body`로 UI 라벨과 구분합니다.

⚠ Field의 안쪽 `<input>`은 자간을 따로 이어 붙여야 합니다. `font` 단축 속성은 font-* 만 다시 세우는데, 브라우저 기본 스타일시트가 폼 컨트롤에 `letter-spacing: normal`을 **명시**해 두어 상속이 거기서 끊깁니다.

**controlSize** — 컴포넌트 `size` 3단(`sm`·`md`·`lg`)은 height·padding·font-size를 함께 움직입니다: height 30/32/40, 글자 12/13/14px · **controlPaddingX** 10/12/16(버튼·탭) · **inputPaddingX** 7/9/12(입력칸) · **textareaPaddingY** 3.75/5.75/8.75

**가로 여백은 라벨과 값이 갈립니다.** 버튼과 탭의 글자는 상자를 *정의하는* 라벨이라 좌우가 넉넉해야 형태가 살고(`controlPaddingX` 10/12/16), 입력칸은 상자가 먼저 있고 값이 그 안에 놓이는 자리라 정사각 geometry를 씁니다(`inputPaddingX` 7/9/12).

입력칸 값은 **보이는 잉크가 정사각**입니다. md 한 줄 입력은 32px control 안에서 13px 글자를 세로 중앙에 두고, 가로는 `border 1 + padding 9 = 10px`의 잉크 여백을 기준으로 삼습니다. 아이콘과 chevron 슬롯을 고려해 Field·Select의 x padding을 버튼보다 좁게 둡니다.

`textareaPaddingY`는 **가로에서 세로를 계산합니다** — md에서는 `inputPaddingX 9 − 반 줄 여백 3.25 = 5.75px`입니다. 반 줄 여백은 `(줄상자 19.5 − 글자 13) / 2`로, 줄상자가 글자 위아래에 이미 갖고 있는 몫입니다. md에서 `border 1 + padding 5.75 + 반 줄 3.25 = 10px`이 되어 가로(`border 1 + padding 9`)와 같은 잉크 여백을 만듭니다.

`Button`·`Field`·`Select`·`Textarea`·`SegmentedControl`·`Tabs`가 이 사다리를 공유합니다 — height와 글자 크기입니다. Select는 오른쪽을 화살표 자리로 한 번 더 덮고, Textarea는 height를 빼고 세로 여백을 더합니다. SegmentedControl은 `sm`, Tabs는 `md`를 각 역할의 기본값으로 고릅니다.

상위 구조의 크기는 control 사다리에 넣지 않습니다. `shape.component.modalWidth`의 360·432·640px은 Modal이 담는 일의 폭이고, `shape.component.tableRowHeight`의 36·44·52px은 Table의 정보 밀도입니다. 전자는 `size`, 후자는 `density`로 노출됩니다. 이름과 값이 비슷해 보여도 누르는 표적 크기와 정보량은 서로 따라 움직이지 않습니다.

Link는 여기 없습니다 — 상자가 아니라 글자라, 높이도 여백도 없이 주변 텍스트에 실려 갑니다.

**베이스에서 벗어나려면 통로로 나갑니다.** `internal/sizeLadder`의 `ladderRules(patch)`가 그 자리입니다 — 인자 없이 부르면 베이스 그대로(Button·SegmentedControl·Tabs), 키를 돌려주면 그 축만 교체하고(Field·Select), `null`을 돌려주면 그 축을 뺍니다(Textarea의 `height`). 사다리를 손으로 베끼면 언젠가 갈라지고(Select가 실제로 그랬습니다), 베이스가 전부를 강제하면 역할이 다른 컨트롤이 억지로 같아집니다. 통로로 나가면 무엇을 왜 바꿨는지가 호출부 한 줄에 남고, 나머지 축은 베이스가 바뀔 때 저절로 따라옵니다.

**badge** — 높이 20/22/24, 가로 여백 `badgePaddingX` 6/8/10, **글자는 12 고정**입니다. 가로 여백이 높이와 같은 보폭(Δ2)으로 움직여 세 크기가 한 실루엣의 축소·확대로 읽힙니다. 배지는 컨트롤이 아니라 자기 축을 듭니다 — 컨트롤의 가로 여백은 세로 여백에 대한 비로 잡히는데, 배지는 20~24 상자에 18짜리 줄상자가 들어가 나눌 세로가 0~2밖에 없습니다. 배지도 컨트롤과 같은 규칙을 집니다. 밀도와 가독성은 다른 축이라, 배지가 작아진다고 글자가 따라 내려가지 않습니다. 기본 컨트롤 13px보다 한 단계 낮은 12px 표식으로 쓰며, 각 tier가 자기 앵커를 하나씩 듭니다.
**padding** — `interaction` 4/8/12/16/24 (Box 여백) · `layout` 8/12/16/20/32 (container)
**gap** — 4/8/12/16/24 (4px 배수)
**radius** — `interaction` 단일 8 · `layout` `sm` 6 · `md` 8 · `lg` 12 · `full` 999(알약). `interaction`은 Button·Field·Select뿐 아니라 Badge·Menu·Tooltip·navigation처럼 반복되는 작은 표면에도 공유됩니다.
**measure**(읽기 폭) — 5단. 글자 크기는 Shape가 아니라 Text system이 소유합니다.
**icon** — 아이콘·스피너 16/18/20. **아트보드지 잉크가 아닙니다.** `Icon`은 viewBox 24짜리 path를 받아 그리는데 아이콘 규격(lucide 등)은 그 24 안에 여백을 두고 18~20만 채우므로, 화면의 잉크는 아트보드의 75~83%입니다. 그래서 아트보드가 Checkbox와 같은 16이면 아이콘만 한 단 작아 보입니다 — 숫자가 같은 것과 같아 보이는 것은 다릅니다. 사다리가 한 단 위에 있는 이유입니다(이 축의 옛 이름은 `dot`이었는데, status dot은 이 축을 안 쓰고 소비처가 Icon·Spinner 둘뿐이라 이름이 축을 잘못 가리키고 있었습니다)
**switch** — 트랙 30×17 / 32×18 / 36×20, 손잡이 13/14/16. 손잡이가 Checkbox 변 − 2라 트랙이 Checkbox + 2로 앉습니다. 옛 규칙은 반대로 손잡이를 Checkbox에 맞춰(16) 트랙이 20이 됐는데, 스위치는 폭이 트랙 두 배라 같은 높이에서도 면적이 세 배입니다 — 높이까지 크면 폼 한 줄에서 스위치만 튑니다. 여백 `(h − thumb) / 2`가 사방에 같이 걸려 켜짐 이동이 `w − h` 한 항등식으로 떨어집니다
**shadow** (2단, 떠 있는 것만) — `shadow.overlay`(Modal·Tooltip) · `shadow.overlayMinimal`(Switch 손잡이). Geometry는 Shape가 맡고 tint만 Color token에서 선택합니다.
**constants** — `borderWidth` 1 · `focusRingWidth` 2 · `focusRingOffset` 2 · `activeIndicatorWidth` 2 · `checkMarkStrokeWidth` 2 · `spinnerStrokeWidth` 2 등. **atom/component intrinsic**은 사다리 밖 치수이며 각 소비 주체에 둡니다.

기본 컨트롤 사다리는 `sm 30px / md 32px / lg 40px`, 버튼 여백 `10 / 12 / 16px`, 입력 여백 `7 / 9 / 12px`입니다. 글자 크기는 `12 / 13 / 14px`로 각 단계에 맞춥니다. 기본 md는 Project Manager 데모의 버튼·검색 입력에서 가져왔습니다.

`radius.full`은 사다리의 끝이 아니라 사다리 밖입니다. 999px은 크기가 아니라 "높이의 절반까지"라는 규칙이어서, 같은 값이 32px 버튼에서는 16px 곡선이 되고 22px 배지에서는 11px 곡선이 됩니다. 어디에 얹히느냐가 실제 반경을 정하니 intent(interaction·layout)로 갈릴 이유가 없고, 그래서 둘과 나란한 셋째 가지로 섭니다.

이 값은 원래 `constants.pillRadius`였습니다. 이름은 맞았지만 자리가 틀렸습니다. radius 축을 읽는 사람에게 알약이 보이지 않았고, 쓰려면 축 바깥의 서랍을 뒤져야 했습니다. 그러는 동안 데모의 hero CTA는 라이브러리 밖에서 CSS로 버튼 모서리를 덮어쓰고 있었습니다. 축이 자기 최대값을 API로 들지 않으면 소비처는 축을 우회합니다.

토큰의 이름은 `radius.full`이지만 컴포넌트가 여는 prop은 `shape="pill"`입니다. 이름이 갈리는 데는 이유가 있습니다. Box는 곡선의 크기를 고릅니다 — `sm`·`md`·`lg`·`full`이 한 사다리 위에 있고, `radius`는 그중 어느 칸이냐를 묻습니다. Button·Badge·Field·Select·SegmentedControl은 사다리를 아예 열지 않습니다. 물어보는 것은 실루엣이 알약이냐 아니냐 하나뿐이라, `radius`라는 이름은 있지도 않은 선택지를 암시합니다. 같은 999px을 두 이름으로 부르는 게 아니라, 서로 다른 두 질문에 각자의 이름을 준 것입니다. Tabs는 열린 underline navigation이라 이 shape 축 자체를 갖지 않습니다.

`shape`는 실루엣 축이지 밀도 축이 아닙니다. 알약이 되어도 여백은 컨트롤 사다리 그대로여서, 같은 `size`의 형제와 글자 시작점이 갈리지 않습니다. 그리고 Textarea에는 이 축이 없습니다 — 999px은 "높이의 절반"이라는 규칙이라 한 줄짜리 컨트롤에서만 알약이 되고, 여러 줄 상자에서는 경기장이 됩니다.

## Motion · Layout

**motion** — `duration`(instant·reduced·fast~slow) · `easing`(linear·standard·decelerate·accelerate·overshoot) · `loop`(spin·pulse) · `role`(hover·state·enter…). `reduced`는 reduced-motion 환경용 최소 duration이고 `linear`는 반복 회전 등에 씁니다. 유일하게 CSS 변수로 굽지 않고 값을 직접 듭니다 — `stateTransition("background", "color")`로 인라인됩니다.

**layout** — `z` 6단 tier(base~toast) · `breakpoint`(sm~xl) · `container`(콘텐츠 폭) · `sizeIntent`(full·fit…) · `inset`. 배치 어휘를 노출하되 반응형 Box 프로퍼티를 전면 열지는 않습니다 — 유연함은 escape로 엽니다(정체성: 구조 안전 > 자유도).

## Text

타이포는 네 축이 직교합니다 — **size · weight · leading · tracking**. 각 축이 토큰(`tokens.text.size.body` = `var(--pui-text-size-body)`)이라, 컴포넌트가 `"0.875rem"` 같은 raw 값을 박을 일이 없습니다. variant는 이 축들을 조합한 7단 위계입니다. 서체는 위계가 아니라 별도의 **family 축**(sans·mono)으로, 어느 variant에도 교차합니다.

| variant | size | weight | 자리 |
|---|---|---|---|
| `display` | 32px | 700 | 랜딩 hero (페이지당 하나) |
| `title` | 22px | 700 | 페이지 제목 (h1) |
| `heading` | 17px | 600 | 섹션 제목 (h2) |
| `subheading` | 15px | 600 | 카드·소제목 (h3) |
| `body` (기본) | 14px | 450 | 본문 |
| `caption` | 12px | 450 | 부연·메타 |
| `label` | 12px | 600 | 폼 라벨·표 머리 |

**body 14px**가 anchor입니다 — 복잡한 앱의 표준 밀도(shadcn·Atlassian·Linear). 콘텐츠 사이트의 16px로 키우면 밀도가 풀려 대시보드가 늘어집니다. 제목 위계는 셋(`title`·`heading`·`subheading` = h1·h2·h3)이라 페이지와 문서의 계층이 또렷합니다.

**family — sans · mono.** 서체는 variant 위에 교차하는 축입니다(`<Text family="mono">`). `mono`(시스템 등폭 = macOS SF Mono)는 코드·토큰·식별자 같은 기술적 자리에만 씁니다 — 숫자라고 무조건 등폭으로 두지 않습니다(표의 숫자 열은 sans 그대로 `tabular-nums`). mono는 variant마다 다른 sans 자간(display `-0.03em` 등)을 얹으면 큰 글씨가 짓눌리므로 그걸 버리고 `tracking.mono`(`-0.04em`)를 씁니다 — SF Mono·D2Coding은 advance가 넓어 UI에서 벌어져 보이기 때문에 조입니다. half-step weight도 쓰지 않습니다(그 보정은 작은 sans용) — `body`·`caption`의 mono는 `weight.regular`(`400`)으로 렌더됩니다. 같은 px에서 sans보다 크게 읽히므로 크기는 `monoSizeScale`(`0.95`)을 곱합니다(`body` mono는 13.3px).

`weight`는 variant와 **직교하는 별도 축**입니다(`regular` 400 · `normal` 450 · `medium` 550 · `semibold` 600 · `strong` 650 · `bold` 700). `regular`는 mono 본문·caption의 보정 전 굵기이고, Button·Tab처럼 UI 컨트롤은 variant 기본 굵기 대신 여기서 골라 씁니다 — sans의 450·550·650 보정 단계는 작은 글씨가 Retina에 눌리지 않게 하기 위함입니다.

## 참조 방식

컴포넌트는 값이 아니라 참조를 봅니다. `tokens.color.bg.raised`는 `#ffffff`가 아니라 `"var(--pui-color-bg-raised)"`입니다. OKLCH source는 `palette.ts`, generated HEX Palette Token은 `color-ladder.ts`, 의미 역할은 `colors.ts`에 있습니다. `theme.css.ts`는 마지막 tree를 `:root`에 굽고, 컴포넌트는 var 참조만 봅니다. 이 간접층 덕분에 palette·값·화면 역할이 섞이지 않고, 값 하나를 바꿔도 이름이 어긋나지 않습니다. source와 생성값은 Playground [Palette](/playground/palette), semantic 결과는 [Tokens](/playground/tokens)에서 확인합니다. 전체 흐름은 [색 아키텍처](color-architecture.md)와 [아키텍처](architecture.md)에서 다룹니다.
