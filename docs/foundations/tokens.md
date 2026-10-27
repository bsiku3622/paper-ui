# Tokens

모든 색·크기·시간의 정본입니다. 컴포넌트는 이 값을 직접 알지 못하고, `tokens` 객체의 `var()` 참조로만 닿습니다. 컬러는 `OKLCH Palette → HEX Palette Token → semantic system → real use` 순서로 흐릅니다. 자세한 경계는 [색 아키텍처](color-architecture.md)에 고정합니다.

2026년 doodle 작업 화면에서 확인한 여백과 면의 조합을 중립 토큰에 반영했습니다. 문서 폭·점무늬·패널 배치 같은 화면 고유의 형태는 공통 토큰으로 올리지 않았습니다. [Tokens Playground](/playground/tokens)의 조합 예시에서 light/dark 결과를 함께 볼 수 있습니다.

## Color

베이스는 종이색 배경과 중립 잉크입니다. 색은 의미가 있을 때 accent로 얹습니다. 컬러 API는 다섯 의미 시스템을 가집니다.

| 시스템 | 경로 | 토큰 |
|---|---|---|
| Surface | `bg.<level>` | `raised · canvas · sunken` |
| Control | `control.<role>` | `track` |
| Border | `border.<level>` | `base · strong · hover` |
| Ink | `ink.<level>` | `primary · secondary · tertiary` |
| Accent | `accent.<name>.<ladder>` | `primary · info · success · warning · error` × `solid · wash · ink · soft · subtle` |
| Interaction | `interaction.<state>` | `bgHover · selected · active · focus` |
| Overlay | `overlay.<role>` | `scrim` |
| Shadow | `shadow.<role>` | `overlay · overlayMinimal` |

예: `tokens.color.bg.canvas`, `tokens.color.control.track`, `tokens.color.ink.primary`, `tokens.color.accent.warning.soft`, `tokens.color.interaction.bgHover.onSurface`, `tokens.color.overlay.scrim`, `tokens.color.shadow.overlay`. Semantic tree의 모든 leaf는 생성된 Palette Token과 값이 같습니다. 다른 semantic leaf를 참조하거나 semantic 단계에서 색 계산을 하지 않습니다.

### OKLCH Palette → HEX Palette Token

`palette.ts`는 테마와 무관한 중립·accent OKLCH anchor와 `alpha05`~`alpha95` percentage scale을 소유하고, color-ladder 함수들을 호출해 완성된 `OKLCH_PALETTE`와 `PALETTE_TOKENS`를 조립해 내보냅니다. `color-ladder.ts`는 palette 데이터를 import하지 않는 순수 계산 모듈입니다. anchor 사이 보간, sRGB gamut mapping, HEX 및 alpha HEX 인코딩을 맡습니다. Raw HEX를 직접 관리하지 않습니다.

중립 step 번호는 밝은 쪽에서 어두운 쪽으로 진행합니다. `0`은 white에 가까운 끝점이고 `950`은 near-black 끝점입니다. Neutral과 Accent 모두 `900 · 925 · 950`을 가지며, `925`는 두 ramp에서 앞뒤 anchor 사이에 생성합니다. Light에서는 `bg.canvas`가 `neutral.50`, `bg.sunken`이 가까운 `neutral.100`, `control.track`이 `neutral.200`을 선택합니다. Dark에서는 `bg.canvas`와 `bg.sunken`이 `neutral.950`, `bg.raised`가 `neutral.925`, `control.track`이 `neutral.900`을 선택합니다. `control.track`은 Switch처럼 조작부 자체의 트랙에 쓰며, 일반 Box surface로 노출하지 않습니다. 기본 경계는 `neutral.900`으로 낮추고, status의 `soft` 면은 각 accent의 `950`을 선택해 반복되는 색 면을 차분하게 합니다. Palette 화면은 테마가 바뀌어도 같은 ramp를 보여줍니다. Light/Dark surface·control·ink·border·accent 의미 역할은 `colors.ts`에서 서로 다른 step을 선택합니다. Neutral은 hue 286°·낮은 chroma의 단일 cool-neutral ramp입니다. Accent palette는 13 step으로 만들고, `primary · info · success · warning · error`가 neutral·blue·green·amber·red의 토큰을 선택합니다.

Accent는 `solid`(채운 면) · `wash`(solid 위 전경) · `ink`(soft·hairline·ghost와 지면 위 색 글자) · `soft`(부드러운 면) · `subtle`(muted 글자)를 공유합니다. `muted`는 Ghost형 투명 면에 선택된 accent의 `subtle` 전경을 쓰는 보조 variant입니다.

### Interaction과 상수

`interaction.bgHover`는 `onSurface`·`onPrimarySolid`·`onAccentSolid` 배경 hover overlay를 제공합니다. `selected`·`active`·`focus`도 Interaction 토큰입니다. Focus ring 색은 `interaction.focus`, 링 두께와 offset은 Shape geometry가 맡습니다. Scrim은 `overlay.scrim`, 그림자 색은 `shadow.overlay`와 `shadow.overlayMinimal`에 둡니다.

Interaction overlay, scrim, shadow tint의 반투명 값은 중립 양 끝점에 고정 percentage alpha step을 적용해 8자리 HEX Palette Token으로 생성합니다. 예를 들어 `alpha05.neutral.950`이나 `alpha60.neutral.0`처럼 Palette에서 확인할 수 있고, Semantic mapping은 테마에 맞는 alpha Palette Token을 선택합니다.

`theme.css.ts`는 이 semantic tree를 light/dark CSS variable로 굽고, package와 app은 `tokens.color` 참조만 씁니다. 색 변경 경로와 예시는 [Color architecture](color-architecture.md), 생성값은 [Palette Playground](/playground/palette), 실제 semantic 결과는 [Tokens Playground](/playground/tokens)에서 확인합니다.

## Shape

Shape은 원본 Palette → 공통 역할 → 내부 recipe → CSS class로 적용합니다. 공개 토큰은 `shape.space`, `radius`, `stroke`, `focus`, `control`, `selection`, `icon`, `shadow`로 나뉩니다. Space는 gap·padding이 함께 쓰는 5단 scale이고, ControlSize는 별도 3단 scale입니다. Box의 폭·높이·읽기 폭·block padding은 `layout.width / height / measure / padding`으로 옮겼습니다.

`shape.control.height`는 30 / 32 / 36px, button inset은 10 / 11 / 14px, input inset은 7 / 8 / 10px입니다. `radius.control`은 4px, `radius.surface.sm / md / lg`는 4 / 6 / 8px이며 Box는 surface 쪽을 선택합니다. Focus ring의 폭과 offset은 `shape.focus`, 선 두께는 `shape.stroke`가 소유합니다.

체크 표시·Radio dot·Switch 비례·Textarea 여백·Select 화살표 예약 공간은 내부 recipe입니다. 파생식은 소비 요소에서 계산하므로 중첩 영역의 공통 토큰 재정의도 반영합니다. 기존 Shape JS 경로와 CSS variable은 호환 alias로 유지하지만 새 코드는 canonical 경로를 사용합니다. 전체 토큰 목록, 수식, 단위와 이관 규칙은 [Shape architecture](shape-architecture.md)에서 확인합니다.

## Motion · Layout

**motion** — `duration`(instant·reduced·fast~slow) · `easing`(linear·standard·decelerate·accelerate·overshoot) · `loop`(spin·pulse) · `role`(press·hover·state·enter…). `reduced`는 reduced-motion 환경용 최소 duration이고 `linear`는 반복 회전 등에 씁니다. 유일하게 CSS 변수로 굽지 않고 값을 직접 듭니다 — `stateTransition("background", "color")`로 인라인됩니다.

**layout** — `z` 6단 tier(base~toast) · `breakpoint`(sm~xl) · `container`(콘텐츠 폭) · `sizeIntent`(full·fit…) · `inset` · `width/height/measure/padding`. 배치 어휘를 노출하되 반응형 Box 프로퍼티를 전면 열지는 않습니다 — 유연함은 escape로 엽니다(정체성: 구조 안전 > 자유도).

## Text

타이포는 원본 수치인 **Typography Palette**, 읽기 역할별 **Text 스타일**, 반복 사용되는 **Control preset**으로 나뉩니다. 각 preset은 Palette의 font size · weight · leading · tracking을 한 스타일로 묶습니다. Text는 `text.display` 같은 클래스, 컨트롤은 `resolveControlTypography("field", size)`처럼 완성 클래스를 선택합니다. Shape의 `size`는 geometry를, resolver는 typography preset을 고릅니다.

| variant | size / leading | weight | 자리 |
|---|---:|---:|---|
| `display` | 32 / 40px | 700 | 랜딩 히어로·표현형 헤드라인 |
| `title` | 24 / 32px | 700 | 페이지 제목 (h1) |
| `heading` | 20 / 28px | 600 | 섹션 제목·강조 수치 (h2) |
| `subheading` | 16 / 24px | 600 | 작은 섹션 제목 (h3/h4) |
| `body` (기본) | 14 / 20px | 500 | 본문 |
| `caption` | 13 / 16px | 400 | 보조·메타 정보 |
| `label` | 12 / 16px | 600 | 필드 라벨·표 머리 |

Weight 열은 Text variant 기본값을 나타냅니다. `display`·`title`은 700, `heading`·`subheading`·`label`은 600, `body`는 500, `caption`은 400을 씁니다. 컨트롤의 기본 문구 weight는 컴포넌트 역할에 따라 선택합니다.

**family — sans · mono.** 서체는 variant 위에 교차하는 축입니다(`<Text family="mono">`). `mono`(시스템 등폭 = macOS SF Mono)는 코드·토큰·식별자 같은 기술적 자리에만 씁니다 — 숫자라고 무조건 등폭으로 두지 않습니다(표의 숫자 열은 sans 그대로 `tabular-nums`). mono는 sans의 역할별 자간을 얹으면 큰 글씨가 짓눌리므로 그걸 버리고 `tracking.mono`(`-0.04em`)를 씁니다 — SF Mono·D2Coding은 advance가 넓어 UI에서 벌어져 보이기 때문에 조입니다. `body`는 기본 weight 500, `caption`은 400이며 mono에서도 variant 기본값을 유지합니다. 같은 px에서 sans보다 크게 읽히므로 크기는 `monoSizeScale`(`0.95`)을 곱합니다(`body` mono는 약 13.3px).

**Control presets** — 반복되는 원자 컨트롤의 글자 조합입니다. `button.regular/strong`은 size 사다리를, `field`는 Field·Select 공통 스타일을, `textarea`와 `badge`는 각 고정 스타일을 제공합니다. `resolveControlTypography("button", size, "strong")`는 완성 CSS class 하나를 반환합니다. `fontSize` prop은 의도적으로 크기를 바꾸는 escape hatch입니다.

| Atom | 스타일 출처 |
|---|---|
| Button · IconButton | `button.regular/strong` × size |
| Field · Select | `field` × size |
| Textarea | `textarea` × size |
| Badge | 고정 `badge` |

그 밖의 글자는 Text 스타일을 사용하고, 제품별 조합 화면은 필요에 따라 이 스타일을 선택합니다. 텍스트를 직접 렌더링하지 않는 Primitive는 별도의 글자 preset을 정의하지 않습니다.

**Typography Palette** — 재사용하는 원본 수치입니다. `tokens.text.palette.fontSize.12`처럼 font size와 leading은 실제 px 값을 키로 쓰므로 서로 다른 단계 이름을 억지로 짝짓지 않습니다. `weight.*` · `tracking.*` · `family.*`도 Palette가 소유하고, Text/Control 스타일은 이 Palette를 조합합니다. Atoms는 원본 수치 대신 완성 스타일을 선택합니다.

`weight` 원본 값은 Palette에 모여 있습니다(`regular` 400 · `normal` 450 · `medium` 500 · `semibold` 600 · `strong` 650 · `bold` 700). Atoms는 raw weight를 직접 고르지 않고 이름 있는 preset을 선택합니다. 그래서 450은 field 입력 잉크, 650은 강조가 필요한 solid Button preset에서 실제로 쓰입니다.

## 참조 방식

컴포넌트는 값이 아니라 참조를 봅니다. `tokens.color.bg.raised`는 `#ffffff`가 아니라 `"var(--pui-color-bg-raised)"`입니다. OKLCH source는 `palette.ts`, generated HEX Palette Token은 `color-ladder.ts`, 의미 역할은 `colors.ts`에 있습니다. `theme.css.ts`는 마지막 tree를 `:root`에 굽고, 컴포넌트는 var 참조만 봅니다. 이 간접층 덕분에 palette·값·화면 역할이 섞이지 않고, 값 하나를 바꿔도 이름이 어긋나지 않습니다. source와 생성값은 Playground [Palette](/playground/palette), semantic 결과는 [Tokens](/playground/tokens)에서 확인합니다. 전체 흐름은 [색 아키텍처](color-architecture.md)와 [아키텍처](architecture.md)에서 다룹니다.
