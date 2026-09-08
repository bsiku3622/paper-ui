# Tokens

모든 색·크기·시간의 정본입니다. 컴포넌트는 이 값을 직접 알지 못하고, `tokens` 객체의 `var()` 참조로만 닿습니다. 값을 바꾸려면 `tokens/`의 다섯 도메인(`colors` · `shape` · `text` · `motion` · `layout`) 한 곳만 고치면 전 화면이 따라옵니다.

## Color

베이스는 흰색과 검정입니다. 색은 그 위에 의미가 있을 때만 얹습니다.

면(surface)과 잉크색(color)을 **종류로 나눕니다** — 면은 색이 아니라 지면이라, "큰 면을 색으로 안 채운다"는 정체성상 Box 는 accent 를 입을 일이 없습니다. 값은 손으로 잡은 light/dark 쌍이고 `[data-theme]` 스코프가 통째로 교체합니다.

**surface — 면 깊이 4단** (Box 의 `surface` 축 · 토큰 `color.paper.*`). 색이 아니라 깊이입니다.

⚠ **사다리는 양 테마에서 거울이라 순서가 반대입니다.** 각 테마에는 목표(objective)가 있고, `raised`는 그 목표에 가장 가까운 면입니다 — 라이트의 목표는 WHITE, 다크의 목표는 BLACK입니다. 그래서 **다크에서는 `raised`가 최암이고 `well`이 최명입니다.**

| surface | light | dark | 쓰임 |
|---|---|---|---|
| `raised` | `#ffffff` | `#0d0d10` | 떠오른 면 (카드·입력·모달) — 라이트 최명 / 다크 최암 |
| `canvas` | `#fcfcfc` | `#101013` | 기준면 (페이지 바닥). 사다리를 접는 축 |
| `sunken` | `#f4f4f5` | `#161619` | 사이드바·table head |
| `well` | `#e2e2e5` | `#252529` | 더 깊은 well — 라이트 최암 / 다크 최명 |

**ink — 3단** (글자색. 순검정 `#000`도 순백 `#fff`도 넓은 면에서는 눈을 찌릅니다)

| | light | dark | 쓰임 |
|---|---|---|---|
| `ink.base` | `#18181b` | `#e9e9eb` | 본문 |
| `ink.soft` | `#71717a` | `#a1a1a8` | 보조 · 라벨 |
| `ink.faint` | `#a1a1aa` | `#8b8b92` | placeholder · disabled |

**border — 괘선** (거의 안 보이게 — 면과 여백으로 나누는 게 먼저)

| | light | dark |
|---|---|---|
| `border.base` | `#e8e8ea` | `#2b2b31` |
| `border.strong` | `#d8d8dc` | `#3d3d44` |

**괘선은 사다리 밖입니다.** 라이트에서 `border.base`(`#e8e8ea`)는 최암인 `well`(`#e2e2e5`)보다 밝습니다 — GRAY 쪽 끝 너머입니다. 뒤집으면 다크 괘선은 `well` 너머, 즉 사다리보다 *위*입니다. 그래야 면 위 대비가 양 테마에서 나란해집니다.

| `border.base` on | raised | canvas | sunken | well |
|---|---|---|---|---|
| 다크 | `1.38` | `1.35` | `1.27` | `1.10` |
| 라이트 | `1.22` | `1.19` | `1.11` | `1.06` |

### 중립의 캐스트 — hue 286°

중립은 순회색이 아닙니다. **hue 286°** 의 zinc 계열로, 아주 옅은 캐스트가 램프 전체를 관통합니다 — 이것이 "돌 같은" 결을 만듭니다. hue 는 시스템 상수이고, **양 테마가 같은 램프에서 값을 뽑습니다.** 캐스트를 통째로 바꾸려면 이 각도 하나만 돌리면 됩니다.

chroma 는 저명도에서 지각이 약해지므로 다크 쪽을 조금 올려 잡습니다 — 라이트 면 `C .001~.004` ↔ 다크 면 `C .006~.009`. 두 쪽이 같은 세기로 읽히는 지점입니다.

⚠ 한동안 다크가 **완전 무채**(`C .0000`, 전 항목)였습니다. 라이트만 캐스트를 갖고 있어서 다크가 밋밋하게 읽혔습니다 — 사다리 순서·`accent.solid` 방향에 이어 **뒤집히지 않은 채 남아 있던 셋째 축**이었습니다.

**accent — 4색 × 5자리.** 이름이 곧 의미(`info`·`success`·`warning`·`error`) — API 에 hue 이름(blue 등)은 없습니다. 각 색은 다섯 자리: `solid`(채운 면/점) · `solidFg`(solid 위 글자) · `ink`(면 위 글자, AA) · `wash`(옅은 면) · `edge`(wash 의 hover · outline 테두리).

라이트

| | solid | solidFg | ink | wash | edge |
|---|---|---|---|---|---|
| **info** | `#2563eb` | `#d6e4fd` | `#1d4ed8` | `#eff6ff` | `#bfdbfe` |
| **success** | `#15803d` | `#d6f2df` | `#15803d` | `#f0fdf4` | `#bbf7d0` |
| **warning** | `#b45309` | `#fbe7b4` | `#b45309` | `#fffbeb` | `#fde68a` |
| **error** | `#dc2626` | `#ffe0e0` | `#b91c1c` | `#fef2f2` | `#fecaca` |

다크 — **accent 하나당 hue 하나** (`info` 258 · `success` 153 · `warning` 75 · `error` 22). 라이트는 Tailwind 램프를 섞어 쓴 흔적이 남아 `warning` 이 `solid` H49(주황) / `wash` H95(노랑)로 46° 벌어져 있습니다. 다크는 다섯 톤이 한 각을 공유합니다.

| | solid | solidFg | ink | wash | edge |
|---|---|---|---|---|---|
| **info** | `#5492ec` | `#0a1930` | `#8ebcff` | `#0d1c32` | `#1a355d` |
| **success** | `#32ac64` | `#03200e` | `#81cf99` | `#062211` | `#094021` |
| **warning** | `#c58300` | `#271500` | `#e4b066` | `#291800` | `#4c2e00` |
| **error** | `#df6768` | `#2d0f0f` | `#f99e9b` | `#2f1211` | `#572223` |

톤별 자리(다크, OKLCH `L / C`) — `wash` `.225/.048` · `edge` `.330/.078` · `solid` `.660/.150` · `solidFg` `.215/.050` · `ink` `.790/.110`.

**solid 은 모노크로매틱** — 채움 위에 같은 hue 의 반대 톤 글자가 얹혀 버튼 전체가 한 색으로 통일됩니다.

⚠ **다크에서 채움(`solid`)은 뒤집힙니다 — 밝은 면 + 어두운 글자입니다.** 라이트를 `canvas` 축으로 접은 값입니다.

다크 `solid`는 오래 L `.440`에 **눌려** 있었습니다. 이유는 그럴싸했습니다 — 옅은 글자를 얹어야 하니 면이 어두워야 한다는 것. 그런데 그러면 **채움이 면에서 안 떨어집니다**: `solid`→면 대비가 `1.79~2.45`였습니다(라이트는 `3.74~5.17`). 비텍스트 3:1을 못 넘기니 배지·버튼의 *윤곽 자체*가 계약을 깬 것이고, 글자 없는 상태 점(`pui-{accent}-dot`)은 아예 보이지 않았습니다.

**눌러서는 못 고칩니다. 갈 수 있는 방향이 하나뿐이기 때문입니다.** 채움이 3:1을 넘기려면 가장 밝은 면에서 그만큼 떨어져야 하는데, *아래로* 가려면 채움의 상대휘도가 음수여야 합니다 — 존재하지 않는 값입니다. 다크 면이 좁은 저명도 구간에 몰려 있어 아래에 쓸 자리가 없기 때문입니다. 답은 라이트가 하는 일을 그대로 뒤집는 것입니다. `primary`는 이미 그렇게 하고 있었습니다(다크: 흰 채움 / 검정 글자) — **`accent.solid`만 안 뒤집힌 축으로 남아 있었습니다.**

⚠ **`wash`를 가르는 것은 밝기가 아니라 색입니다.** 한동안 "`wash`는 사다리 밖(`well` 너머)이어야 한다"는 규칙을 뒀는데, 그것이 다크 `wash`를 L `.37`까지 밀어 올려 **파랑·초록·주황이 모두 같은 탁한 회갈색으로 읽히게** 만들었습니다.

| | ΔL (canvas→wash) | chroma |
|---|---|---|
| 라이트 | `−0.004 ~ −0.021` | `.013 ~ .021` |
| 예전 다크 | **`+0.194`** | `.033` |
| 지금 다크 | `+0.052` | `.048` |

근거는 "면 위에 놓인 배지가 그 면과 같은 밝기면 사라진다"였는데, **라이트가 반례입니다**: 라이트 `wash`(L `.970~.987`)는 사다리 *안*이고 `well`(`.914`)보다도 밝습니다. 그런데 사라지지 않습니다 — 화면에서 유일하게 유채색이기 때문입니다.

⚠ `edge`만 접기에서 벗어납니다(엄밀한 거울은 L `.305`). 거기서는 canvas 위 `1.42`로 `border.base`(`1.35`)와 거의 같아 **outline 버튼의 테두리가 보이지 않습니다.** `.330`으로 올려 `1.50~1.60`을 줍니다 — 대신 `soft`의 hover 폭이 ΔL `.104`로 라이트(`.073`)보다 넓습니다. **`edge`가 두 일(테두리 · hover 면)을 겸하는 구조 문제**라 값으로는 여기까지입니다.

다크 계약 (전 항목 통과) — `solid`↔`well` `4.56~5.25` (비텍스트 3:1) · `solidFg`↔`solid` `5.29~5.93` (AA 4.5) · `ink`↔`wash` `8.55~9.09` · `ink`↔`raised` `9.60~10.46`.

⚠ **`Banner`가 조용히 깨져 있었습니다.** 채운 면 위 글자를 `paper.raised`로 하드코딩하고 있었는데("종이색"이라는 뜻이었습니다), 다크의 `raised`는 최암입니다. 그래서 status Banner 의 글자가 다크에서 **`2.24~2.45`**였습니다. 지금은 Banner 도 `solidFg`를 씁니다 — 채움 위 글자의 정본은 처음부터 그 자리였습니다. 중립 tone 만 `paper.raised`를 그대로 씁니다: 거기 배경은 `ink.base`인데 둘이 테마마다 함께 뒤집혀 저절로 맞습니다.

⚠ **라이트 `solidFg`는 아직 AA 미달입니다.** 옅은 글자가 진한 채움 위에서 `3.91~4.21`로 4.5를 못 넘습니다(`error` `3.91`이 최악). 다크와 달리 라이트는 채움을 더 진하게 내리면 풀리므로 구조가 아니라 값의 문제입니다.
**color × variant — 잉크색을 입는 컴포넌트(Button·Badge·Alert).** `color`(primary + 4 accent) × `variant`(`solid`·`soft`·`outline`·`quiet`)로 색을 받습니다. 이건 면(surface)과 **다른 종류**라 Box 는 `color` 를 안 받습니다. `status`(validation)는 Field·TextField·Textarea 만 받고, 이름은 accent 와 같습니다(`danger` 폐기 → `error`).

**primary / focus / interaction.** `primary`는 검정 일꾼(`base` `#18181b` · `hover` `#3f3f46` · `fg` `#ffffff`, 다크선 흰 채움으로 반전). 검정 면은 hover 때 *밝아진다* — 이미 검정에 가까워 더 어둡게는 눈에 안 보이기 때문(원칙 3의 예외). `focus.ring`은 파란 링 `#2563eb`(= `accent.info.solid`, 한 곳에서 굳힘). hover·selected·active 는 solid 회색이 아니라 **interaction 오버레이**(ink 계열 alpha — 어느 면 위든 밑을 그대로 어둡게, 다크는 흰빛 alpha)로 얹고, `scrim`(모달 뒤)도 테마 인식입니다.

## Shape

크기는 **5단 사다리(xs~xl) × intent(interaction·layout)** 구조입니다 — chrome(Button·Field)은 `interaction`, container(Card·Modal)는 `layout`을 씁니다. 값은 넉넉한 라운드·부드러운 밀도를 지킵니다.

**height** — `interaction` 24/30/34/40/44 (control = `md.interaction` 34) · `layout` 64~320
**controlSize** — 컴포넌트 `size` 3단(`sm`·`md`·`lg`), height·padding만 움직임 · **controlPaddingX** 10/13/17 · **controlPaddingY** 8/10/13 · **controlFontSize** 14/14/14 (밀도와 분리 — 14가 하한이자 상한)

세로 여백은 `(height − 14) / 2`입니다. 라벨이 14로 고정이니 한 줄짜리 컨트롤에서는 height가 이 값을 정해 버리고, 가로 여백도 그 세로를 분모로 삼은 비(1.25·1.30·1.31)로 잡습니다. 이 관계는 오래 주석에만 있었는데, 높이를 못 박는 컨트롤이 생기면서 토큰이 되었습니다 — Textarea는 줄 수만큼 자라 `height`를 쓸 수 없어 세로 여백을 직접 받아야 하고, 그때 이 값을 쓰면 첫 줄이 같은 `size`의 Field와 같은 높이에서 시작합니다.

`Button`·`Field`·`Select`·`Textarea`·`Tabs`가 이 사다리를 공유합니다. Select는 오른쪽만 화살표 자리로 덮고, Textarea는 height를 뺀 나머지를 가져옵니다. Link는 여기 없습니다 — 상자가 아니라 글자라, 높이도 여백도 없이 주변 텍스트에 실려 갑니다.

**badge** — 높이 20/22/24, **글자는 12 고정**입니다. 배지도 컨트롤과 같은 규칙을 집니다. 밀도와 가독성은 다른 축이라, 배지가 작아진다고 글자가 따라 내려가지 않습니다. 컨트롤이 14인 자리에서 배지가 12인 것은 배지가 버튼 라벨보다 한 단 낮은 표식이기 때문이고, 각 tier가 자기 앵커를 하나씩 듭니다.
**padding** — `interaction` 4/8/12/16/24 (Box 여백) · `layout` 8/12/16/24/32 (container)
**gap** — 4/8/12/16/24 (4px 배수)
**radius** — `interaction` 단일 6 · `layout` `sm` 6 · `md` 8 · `lg` 12 · `full` 999(알약)
**fontSize**(chrome text) · **dot**(아이콘) · **measure**(읽기 폭) — 각 5단
**shadow** (2단, 떠 있는 것만) — `overlay`(Modal·Tooltip) · `overlayMinimal`(Switch 손잡이)
**constants** — `borderWidth` 1 · `focusRingWidth` 2 · `overlayBlur` 2 등, **atom** — Checkbox·Switch·Radio 등 사다리 밖 치수

`radius.full`은 사다리의 끝이 아니라 사다리 밖입니다. 999px은 크기가 아니라 "높이의 절반까지"라는 규칙이어서, 같은 값이 34px 버튼에서는 17px 곡선이 되고 22px 배지에서는 11px 곡선이 됩니다. 어디에 얹히느냐가 실제 반경을 정하니 intent(interaction·layout)로 갈릴 이유가 없고, 그래서 둘과 나란한 셋째 가지로 섭니다.

이 값은 원래 `constants.pillRadius`였습니다. 이름은 맞았지만 자리가 틀렸습니다. radius 축을 읽는 사람에게 알약이 보이지 않았고, 쓰려면 축 바깥의 서랍을 뒤져야 했습니다. 그러는 동안 데모의 hero CTA는 라이브러리 밖에서 CSS로 버튼 모서리를 덮어쓰고 있었습니다. 축이 자기 최대값을 API로 들지 않으면 소비처는 축을 우회합니다.

토큰의 이름은 `radius.full`이지만 컴포넌트가 여는 prop은 `shape="pill"`입니다. 이름이 갈리는 데는 이유가 있습니다. Box는 곡선의 크기를 고릅니다 — `sm`·`md`·`lg`·`full`이 한 사다리 위에 있고, `radius`는 그중 어느 칸이냐를 묻습니다. Button·Badge·Field·Select는 사다리를 아예 열지 않습니다. 물어보는 것은 실루엣이 알약이냐 아니냐 하나뿐이라, `radius`라는 이름은 있지도 않은 선택지를 암시합니다. 같은 999px을 두 이름으로 부르는 게 아니라, 서로 다른 두 질문에 각자의 이름을 준 것입니다.

`shape`는 실루엣 축이지 밀도 축이 아닙니다. 알약이 되어도 여백은 컨트롤 사다리 그대로여서, 같은 `size`의 형제와 글자 시작점이 갈리지 않습니다. 그리고 Textarea에는 이 축이 없습니다 — 999px은 "높이의 절반"이라는 규칙이라 한 줄짜리 컨트롤에서만 알약이 되고, 여러 줄 상자에서는 경기장이 됩니다.

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

**family — sans · mono.** 서체는 variant 위에 교차하는 축입니다(`<Text family="mono">`). `mono`(시스템 등폭 = macOS SF Mono)는 코드·토큰·식별자 같은 기술적 자리에만 씁니다 — 숫자라고 무조건 등폭으로 두지 않습니다(표의 숫자 열은 sans 그대로 `tabular-nums`). mono는 variant마다 다른 sans 자간(display `-0.03em` 등)을 얹으면 큰 글씨가 짓눌리므로 그걸 버리고 단일 자간(`-0.04em`)을 씁니다 — SF Mono·D2Coding은 advance가 넓어 UI에서 벌어져 보이기 때문에 조입니다. half-step weight도 쓰지 않습니다(그 보정은 작은 sans용) — `body`·`caption`의 mono는 whole-step `400`으로 렌더됩니다. 같은 px에서 sans보다 크게 읽히므로 크기는 variant 값의 `0.95`배로 그립니다(`body` mono는 13.3px).

`weight`는 variant와 **직교하는 별도 축**입니다(`normal` 450 · `medium` 550 · `semibold` 600 · `bold` 700). Button·Tab처럼 UI 컨트롤은 variant 기본 굵기 대신 여기서 골라 씁니다 — 값이 반 단계 무거운 건(450·550) dense 시스템에서 작은 글씨가 Retina에 눌리지 않게 하기 위함입니다.

## 참조 방식

컴포넌트는 값이 아니라 참조를 봅니다. `tokens.color.paper.raised`는 `#ffffff`가 아니라 `"var(--pui-color-paper-raised)"`입니다. 실제 hex는 `styles/theme.css.ts`가 `:root`에 굽고, 그 파일이 raw hex를 import하는 유일한 모듈입니다(절대 규칙). 이 간접층 덕분에 raw 값과 화면이 분리되고, 값 하나를 바꿔도 이름이 어긋나지 않습니다. 그 구조는 [아키텍처](architecture.md)에서 다룹니다.
