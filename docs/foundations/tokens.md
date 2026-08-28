# Tokens

모든 색·크기·시간의 정본입니다. 컴포넌트는 이 값을 직접 알지 못하고, `tokens` 객체의 `var()` 참조로만 닿습니다. 값을 바꾸려면 `tokens/`의 다섯 도메인(`colors` · `shape` · `text` · `motion` · `layout`) 한 곳만 고치면 전 화면이 따라옵니다.

## Color

베이스는 흰색과 검정입니다. 색은 그 위에 의미가 있을 때만 얹습니다.

면(surface)과 잉크색(color)을 **종류로 나눕니다** — 면은 색이 아니라 지면이라, "큰 면을 색으로 안 채운다"는 정체성상 Box 는 accent 를 입을 일이 없습니다. 값은 손으로 잡은 light/dark 쌍이고 `[data-theme]` 스코프가 통째로 교체합니다.

**surface — 면 깊이 4단** (Box 의 `surface` 축 · 토큰 `color.paper.*`). 색이 아니라 깊이. raised 최명 · well 최암(다크도 순서 유지).

| surface | light | dark | 쓰임 |
|---|---|---|---|
| `raised` | `#ffffff` | `#212121` | 떠오른 면 (카드·입력·모달) — 최명 |
| `canvas` | `#fcfcfc` | `#171717` | 기준면 (페이지 바닥) |
| `sunken` | `#f4f4f5` | `#101010` | 사이드바·table head |
| `well` | `#e2e2e5` | `#0a0a0a` | 더 깊은 well — 최암 |

**ink — 검정 3단** (글자색. 순검정 `#000`은 넓은 면에서 눈을 찌른다)

| | light | dark | 쓰임 |
|---|---|---|---|
| `ink.base` | `#18181b` | `#dcdcdc` | 본문 |
| `ink.soft` | `#71717a` | `#9a9a9a` | 보조 · 라벨 |
| `ink.faint` | `#a1a1aa` | `#6a6a6a` | placeholder · disabled |

**border — 괘선** (거의 안 보이게 — 면과 여백으로 나누는 게 먼저)

| | light | dark |
|---|---|---|
| `border.base` | `#e8e8ea` | `#2a2a2a` |
| `border.strong` | `#d8d8dc` | `#3a3a3a` |

**accent — 4색 × 5자리.** 이름이 곧 의미(`info`·`success`·`warning`·`error`) — API 에 hue 이름(blue 등)은 없습니다. 각 색은 다섯 자리: `solid`(채운 면/점) · `solidFg`(solid 위 글자 — **같은 hue 의 옅은 톤**) · `ink`(흰 배경 위 글자, AA·700톤) · `wash`(옅은 면·50톤) · `edge`(wash 괘선·200톤).

| | solid | solidFg | ink | wash | edge |
|---|---|---|---|---|---|
| **info** | `#2563eb` | `#d6e4fd` | `#1d4ed8` | `#eff6ff` | `#bfdbfe` |
| **success** | `#15803d` | `#d6f2df` | `#15803d` | `#f0fdf4` | `#bbf7d0` |
| **warning** | `#b45309` | `#fbe7b4` | `#b45309` | `#fffbeb` | `#fde68a` |
| **error** | `#dc2626` | `#ffe0e0` | `#b91c1c` | `#fef2f2` | `#fecaca` |

**solid 은 모노크로매틱** — 진한 채움(solid) 위에 같은 hue 의 옅은 글자(solidFg)가 얹혀 버튼 전체가 한 색으로 통일됩니다. green·amber 채움도 700톤으로 낮춰 늘 옅은 글자가 얹히게 했습니다(밝은 채움 + 흰 글자의 AA 미달을 없앰).

**color × variant — 잉크색을 입는 컴포넌트(Button·Badge·Alert).** `color`(primary + 4 accent) × `variant`(`solid`·`soft`·`outline`·`quiet`)로 색을 받습니다. 이건 면(surface)과 **다른 종류**라 Box 는 `color` 를 안 받습니다. `status`(validation)는 Field·Textarea 만 받고, 이름은 accent 와 같습니다(`danger` 폐기 → `error`).

**primary / focus / interaction.** `primary`는 검정 일꾼(`base` `#18181b` · `hover` `#3f3f46` · `fg` `#ffffff`, 다크선 흰 채움으로 반전). 검정 면은 hover 때 *밝아진다* — 이미 검정에 가까워 더 어둡게는 눈에 안 보이기 때문(원칙 3의 예외). `focus.ring`은 파란 링 `#2563eb`(= `accent.info.solid`, 한 곳에서 굳힘). hover·selected·active 는 solid 회색이 아니라 **interaction 오버레이**(ink 계열 alpha — 어느 면 위든 밑을 그대로 어둡게, 다크는 흰빛 alpha)로 얹고, `scrim`(모달 뒤)도 테마 인식입니다.

## Shape

크기는 **5단 사다리(xs~xl) × intent(interaction·layout)** 구조입니다 — chrome(Button·Field)은 `interaction`, container(Card·Modal)는 `layout`을 씁니다. 값은 넉넉한 라운드·부드러운 밀도를 지킵니다.

**height** — `interaction` 24/28/34/40/44 (control = `md.interaction` 34) · `layout` 64~320
**controlSize** — 컴포넌트 `size` 3단(`sm`·`md`·`lg`), height·padding만 움직임 · **controlFontSize** 14/14/16 (밀도와 분리, 14가 가독성 하한)
**padding** — `interaction` 4/8/12/16/24 (Box 여백) · `layout` 8/12/16/24/32 (container)
**gap** — 4/8/12/16/24 (4px 배수)
**radius** — `interaction` 단일 8 · `layout` `sm` 8 · `md` 12 · `lg` 16
**fontSize**(chrome text) · **dot**(아이콘) · **measure**(읽기 폭) — 각 5단
**shadow** (2단, overlay만 뜬다) — `raised` · `overlay`
**constants** — `borderWidth` 1 · `focusRingWidth` 2 · `pillRadius` 999 등, **atom** — Checkbox·Switch·Radio 등 사다리 밖 치수

## Motion · Layout

**motion** — `duration`(instant~slow) · `easing`(standard·decelerate·accelerate·overshoot) · `loop`(spin·pulse) · `role`(hover·state·enter…). 유일하게 CSS 변수로 굽지 않고 값을 직접 듭니다 — `stateTransition("background", "color")`로 인라인됩니다.

**layout** — `z` 6단 tier(base~toast) · `breakpoint`(sm~xl) · `container`(콘텐츠 폭) · `sizeIntent`(full·fit…) · `inset`. 배치 어휘를 노출하되 반응형 Box 프로퍼티를 전면 열지는 않습니다 — 유연함은 escape로 엽니다(정체성: 구조 안전 > 자유도).

## Text

타이포는 네 축이 직교합니다 — **size · weight · leading · tracking**. 각 축이 토큰(`tokens.text.size.body` = `var(--pui-text-size-body)`)이라, 컴포넌트가 `"0.875rem"` 같은 raw 값을 박을 일이 없습니다. variant는 이 축들을 조합한 7단 위계입니다. 서체는 위계가 아니라 별도의 **family 축**(sans·mono)으로, 어느 variant에도 교차합니다.

| variant | size | weight | 자리 |
|---|---|---|---|
| `display` | 32px | 700 | 랜딩 hero (페이지당 하나) |
| `title` | 22px | 700 | 페이지 제목 (h1) |
| `heading` | 18px | 600 | 섹션 제목 (h2) |
| `subheading` | 15px | 600 | 카드·소제목 (h3) |
| `body` (기본) | 14px | 450 | 본문 |
| `caption` | 13px | 450 | 부연·메타 |
| `label` | 12px | 600 | 폼 라벨·표 머리 |

**body 14px**가 anchor입니다 — 복잡한 앱의 표준 밀도(shadcn·Atlassian·Linear). 콘텐츠 사이트의 16px로 키우면 밀도가 풀려 대시보드가 늘어집니다. 제목 위계는 셋(`title`·`heading`·`subheading` = h1·h2·h3)이라 페이지와 문서의 계층이 또렷합니다.

**family — sans · mono.** 서체는 variant 위에 교차하는 축입니다(`<Text family="mono">`). `mono`(시스템 등폭 = macOS SF Mono)는 코드·토큰·식별자 같은 기술적 자리에만 씁니다 — 숫자라고 무조건 등폭으로 두지 않습니다(표의 숫자 열은 sans 그대로 `tabular-nums`). mono는 monospace가 이미 제 간격을 가지므로 sans의 음수 자간 대신 자체 자간(`-0.02em`)을 쓰고, half-step weight도 쓰지 않습니다(그 보정은 작은 sans용) — `body`·`caption`의 mono는 whole-step `400`으로 렌더됩니다.

`weight`는 variant와 **직교하는 별도 축**입니다(`normal` 450 · `medium` 550 · `semibold` 600 · `bold` 700). Button·Tab처럼 UI 컨트롤은 variant 기본 굵기 대신 여기서 골라 씁니다 — 값이 반 단계 무거운 건(450·550) dense 시스템에서 작은 글씨가 Retina에 눌리지 않게 하기 위함입니다.

## 참조 방식

컴포넌트는 값이 아니라 참조를 봅니다. `tokens.color.paper.raised`는 `#ffffff`가 아니라 `"var(--pui-color-paper-raised)"`입니다. 실제 hex는 `styles/theme.css.ts`가 `:root`에 굽고, 그 파일이 raw hex를 import하는 유일한 모듈입니다(절대 규칙). 이 간접층 덕분에 raw 값과 화면이 분리되고, 값 하나를 바꿔도 이름이 어긋나지 않습니다. 그 구조는 [아키텍처](architecture.md)에서 다룹니다.
