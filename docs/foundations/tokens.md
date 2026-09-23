# Tokens

모든 색·크기·시간의 정본입니다. 컴포넌트는 이 값을 직접 알지 못하고, `tokens` 객체의 `var()` 참조로만 닿습니다. 색은 `palette → ladder → semantic token`으로 한 번 더 나뉘며, 각 층의 책임은 [색 아키텍처](color-architecture.md)에 고정합니다.

## Color

베이스는 흰색과 검정입니다. 색은 그 위에 의미가 있을 때만 얹습니다.

면(surface)과 잉크색(color)을 **종류로 나눕니다** — 면은 색이 아니라 지면이라, "큰 면을 색으로 안 채운다"는 정체성상 Box 는 accent 를 입을 일이 없습니다. 값은 손으로 잡은 light/dark 쌍이고 `[data-theme]` 스코프가 통째로 교체합니다.

**surface — 면 깊이 4단** (Box 의 `surface` 축 · 토큰 `color.surface.*`). 색이 아니라 깊이입니다.

⚠ **사다리는 양 테마에서 거울이라 순서가 반대입니다.** 각 테마에는 목표(objective)가 있고, `raised`는 그 목표에 가장 가까운 면입니다 — 라이트의 목표는 WHITE, 다크의 목표는 BLACK입니다. 그래서 **다크에서는 `raised`가 최암이고 `well`이 최명입니다.**

| surface | light | dark | 쓰임 |
|---|---|---|---|
| `raised` | `#ffffff` | `#0d0d10` | 떠오른 면 (카드·입력·모달) — 라이트 최명 / 다크 최암 |
| `canvas` | `#fcfcfc` | `#101013` | 기준면 (페이지 바닥). 사다리를 접는 축 |
| `sunken` | `#f4f4f5` | `#161619` | 사이드바·table head |
| `well` | `#e2e2e5` | `#252529` | 더 깊은 well — 라이트 최암 / 다크 최명 |

**content — 3단** (글자색. 순검정 `#000`도 순백 `#fff`도 넓은 면에서는 눈을 찌릅니다)

| | light | dark | 쓰임 |
|---|---|---|---|
| `content.primary` | `#18181b` | `#e9e9eb` | 본문 |
| `content.secondary` | `#71717a` | `#a1a1a8` | 보조 · 라벨 |
| `content.tertiary` | `#a1a1aa` | `#8b8b92` | placeholder · disabled |

**border — 괘선.** 두 값 한 벌이고, **화면의 회색 선은 전부 여기서 나옵니다.**

| | light | dark | 쓰는 곳 |
|---|---|---|---|
| `border.base` | `#e8e8ea` | `#2b2b31` | 쉬는 경계 — 카드·구획·빈 입력칸·체크박스·hairline |
| `border.strong` | `#ccccd1` | `#3d3d44` | 중간 회색 선 — table head 밑·Checkbox·Radio 외곽 |
| `border.hover` | `#b3b3bb` | `#4f4f58` | neutral Form 포인터 hover 전용 선 |

한동안 컨트롤 전용 회색을 따로 뒀습니다. 근거는 그럴듯했습니다 — 빈 Field는 상자 말고 아무 단서가 없으니 카드 헤어라인보다 진해야 한다는 것. 그런데 **실물에서는 그게 바로 어긋남으로 읽혔습니다.** 표를 감싼 카드 테두리는 거의 안 보이는데 그 위 검색창만 진하면, 한 화면에 회색이 두 벌이 됩니다. 선의 *역할*이 다르다고 *색*까지 갈리면 화면은 그걸 두 팔레트로 읽습니다.

쉬는 neutral Form은 `base`로 화면의 다른 괘선과 한 벌을 유지합니다. 포인터가 올라오면 전용 `border.hover` 선으로 형태를 분명히 세우되, 배경은 바꾸지 않습니다. semantic Form은 처음부터 해당 accent의 `solid` 선을 쓰고, hover에서는 선을 더 바꾸지 않고 같은 pigment를 중앙 shadow로 번지게 합니다. shadow는 semantic Form에만 적용하며 neutral Form·Button·navigation·data row에는 확장하지 않습니다.

accent는 사정이 다릅니다 — 그쪽은 `edge`(wash 괘선)와 `edgeStrong`(outline 테두리)이 갈려 있는데, 색이 있는 선은 *라벨 색과 맞아야* 하므로 애초에 뉴트럴 괘선과 다른 물건입니다.

**괘선은 사다리 밖입니다.** 라이트에서 `border.base`(`#e8e8ea`)는 최암인 `well`(`#e2e2e5`)보다 밝습니다 — GRAY 쪽 끝 너머입니다. 뒤집으면 다크 괘선은 `well` 너머, 즉 사다리보다 *위*입니다. 그래야 면 위 대비가 양 테마에서 나란해집니다.

| `border.base` on | raised | canvas | sunken | well |
|---|---|---|---|---|
| 다크 | `1.38` | `1.35` | `1.27` | `1.10` |
| 라이트 | `1.22` | `1.19` | `1.11` | `1.06` |

`border.hover`는 resting 구조선과 semantic 색선 사이의 interaction 전용 단계입니다.
neutral Form이 포인터 hover에서만 이 토큰으로 올라가며, Button·navigation의 overlay와
혼용하지 않습니다. 현재 light/dark 값은 각각 `#b3b3bb` / `#4f4f58`입니다.

### 중립의 캐스트 — hue 286°

중립은 순회색이 아닙니다. **hue 286°** 의 zinc 계열로, 아주 옅은 캐스트가 램프 전체를 관통합니다 — 이것이 "돌 같은" 결을 만듭니다. hue 는 시스템 상수이고, **양 테마가 같은 램프에서 값을 뽑습니다.** 캐스트를 통째로 바꾸려면 이 각도 하나만 돌리면 됩니다.

chroma 는 저명도에서 지각이 약해지므로 다크 쪽을 조금 올려 잡습니다 — 라이트 면 `C .001~.004` ↔ 다크 면 `C .006~.009`. 두 쪽이 같은 세기로 읽히는 지점입니다.

⚠ 한동안 다크가 **완전 무채**(`C .0000`, 전 항목)였습니다. 라이트만 캐스트를 갖고 있어서 다크가 밋밋하게 읽혔습니다 — 사다리 순서·`accent.solid` 방향에 이어 **뒤집히지 않은 채 남아 있던 셋째 축**이었습니다.

**Accent palette — 5색 × 5 semantic slot.** public 이름은 `primary · info · success · warning · error`이고, 각 component는 `color`가 아닌 `accent` prop을 받습니다. 각 family는 `solid`(채운 면 및 일반 지면 위 pigment text) · `wash`(solid 위 전경 및 가벼운 tint) · `soft`(soft variant 면) · `edge`(hairline 경계) · `edgeStrong`(outline 경계)를 공유합니다. `ink`·`softInk`·`mutedInk`는 중복 슬롯이라 통합했습니다.

| token | 책임 |
|---|---|
| `solid` | solid variant의 면, 지면 위 색 글자 |
| `wash` | solid 면 위 전경, 가장 옅은 tint |
| `soft` | soft variant의 면 |
| `edge` | hairline 경계 |
| `edgeStrong` | outline 경계 |

Accent palette는 11 step(`50`부터 `950`)으로 구성됩니다. `color-ladder.ts`는 기존 Veil 색의 representative anchor를 OKLCH로 저장하고, 사이의 step을 L·C·H를 기준으로 perceptual space에서 보간합니다. hue도 가장 가까운 각도 방향으로 보간하므로 0° 경계에서 큰 색 점프를 만들지 않습니다. Palette Playground는 각 칸에 L/C/H를 함께 보여줍니다.

**Shared variant**는 accent family와 독립적으로 작동합니다. `solid`는 accent `solid` 면에 `wash` 전경을, `soft`는 `soft` 면에 `solid` 전경을 씁니다. muted variant는 별도 pigment가 아니라 wash/soft와 interaction overlay로 밀도를 낮춥니다. `outline`은 `edgeStrong`, `hairline`은 `edge`를 사용합니다. `status`는 Form의 validation 의미를 나타내는 API로만 남고, 내부에서는 같은 semantic accent를 참조합니다.

Amber는 밝은 계열로 간주해 전경을 어둡게 바꾸지 않습니다. 특히 amber 400·600은 palette preview에서 밝은 글자를 사용합니다. 모든 색 변화는 [Color architecture](color-architecture.md)의 순서대로 palette identity → OKLCH ladder → semantic token → component에 전달합니다.

`focus.ring`은 `accent.info.solid`를 사용하고, hover·selected·active는 interaction overlay로 얹습니다. 모달 뒤의 `scrim`도 light/dark 테마별 semantic token입니다.

## Shape

크기는 **5단 사다리(xs~xl) × intent(interaction·layout)** 구조입니다 — chrome(Button·Field)은 `interaction`, container(Box·Modal)는 `layout`을 씁니다. 값은 넉넉한 라운드·부드러운 밀도를 지킵니다.

**height** — `interaction` 24/30/34/40/44 (control = `md.interaction` 34) · `layout` 64~320
**입력 글자는 `weight.normal`(450)입니다.** 이 시스템의 `normal`은 400이 아니라 450인데 — 작은 sans가 Retina에서 힘이 빠지는 걸 잡는 half-step입니다 — 한동안 Field·Select·Textarea만 굵기를 안 정해 브라우저 기본값 400으로 떨어져 있었습니다. 사람이 글자를 *써 넣는* 자리만 그 보정을 못 받고 있었던 셈이고, 크기는 넷 다 14인데 입력만 얇아 보이던 원인입니다. 자간은 `tracking.body`입니다 — 입력칸에 든 것은 UI 라벨이 아니라 사람이 쓴 내용이라, Button의 label 자간(+0.01em)이 아니라 본문 자간을 따릅니다.

⚠ Field의 안쪽 `<input>`은 자간을 따로 이어 붙여야 합니다. `font` 단축 속성은 font-* 만 다시 세우는데, 브라우저 기본 스타일시트가 폼 컨트롤에 `letter-spacing: normal`을 **명시**해 두어 상속이 거기서 끊깁니다.

**controlSize** — 컴포넌트 `size` 3단(`sm`·`md`·`lg`), height·padding만 움직임 · **controlPaddingX** 10/13/17(버튼·탭) · **inputPaddingX** 7/9/12(입력칸) · **textareaPaddingY** 3.5/5.5/8.5 · **controlFontSize** 14/14/14 (밀도와 분리 — 14가 하한이자 상한)

**가로 여백은 라벨과 값이 갈립니다.** 버튼과 탭의 글자는 상자를 *정의하는* 라벨이라 좌우가 넉넉해야 형태가 살고(`controlPaddingX` 10/13/17), 입력칸은 상자가 먼저 있고 값이 그 안에 놓이는 자리라 정사각 geometry를 씁니다(`inputPaddingX` 7/9/12).

입력칸 값은 **보이는 잉크가 정사각**입니다. md 한 줄 입력의 세로 거리는 `(34 − 14) / 2 = 10`, 가로는 `border 1 + padding 9 = 10`입니다. 한때 답답함을 피하려 10/12/15까지 벌렸지만, 아이콘과 chevron이 들어가면 좌우 비대칭이 더 크게 읽혔습니다. 높이를 키우지 않고 Field·Select·Textarea의 공통 x padding을 줄이는 쪽으로 확정했습니다.

`textareaPaddingY`는 **가로에서 세로를 계산합니다** — `inputPaddingX − 반 줄 여백 3.5`입니다. 반 줄 여백은 `(줄상자 21 − 글자 14) / 2`로, 줄상자가 글자 위아래에 이미 갖고 있는 몫입니다. md에서 `1 + 5.5 + 3.5 = 10`이 되어 가로(`1 + 9`)와 같은 자리에 앉습니다. 눈이 읽는 것은 선언값이 아니라 잉크의 자리입니다.

`Button`·`Field`·`Select`·`Textarea`·`SegmentedControl`·`Tabs`가 이 사다리를 공유합니다 — height와 글자 크기입니다. Select는 오른쪽을 화살표 자리로 한 번 더 덮고, Textarea는 height를 빼고 세로 여백을 더합니다. SegmentedControl은 `sm`, Tabs는 `md`를 각 역할의 기본값으로 고릅니다.

상위 구조의 크기는 control 사다리에 넣지 않습니다. `shape.component.modalWidth`의 360·432·640px은 Modal이 담는 일의 폭이고, `shape.component.tableRowHeight`의 36·44·52px은 Table의 정보 밀도입니다. 전자는 `size`, 후자는 `density`로 노출됩니다. 이름과 값이 비슷해 보여도 누르는 표적 크기와 정보량은 서로 따라 움직이지 않습니다.

Link는 여기 없습니다 — 상자가 아니라 글자라, 높이도 여백도 없이 주변 텍스트에 실려 갑니다.

**베이스에서 벗어나려면 통로로 나갑니다.** `internal/sizeLadder`의 `ladderRules(patch)`가 그 자리입니다 — 인자 없이 부르면 베이스 그대로(Button·SegmentedControl·Tabs), 키를 돌려주면 그 축만 교체하고(Field·Select), `null`을 돌려주면 그 축을 뺍니다(Textarea의 `height`). 사다리를 손으로 베끼면 언젠가 갈라지고(Select가 실제로 그랬습니다), 베이스가 전부를 강제하면 역할이 다른 컨트롤이 억지로 같아집니다. 통로로 나가면 무엇을 왜 바꿨는지가 호출부 한 줄에 남고, 나머지 축은 베이스가 바뀔 때 저절로 따라옵니다.

**badge** — 높이 20/22/24, 가로 여백 `badgePaddingX` 6/8/10, **글자는 12 고정**입니다. 가로 여백이 높이와 같은 보폭(Δ2)으로 움직여 세 크기가 한 실루엣의 축소·확대로 읽힙니다. 배지는 컨트롤이 아니라 자기 축을 듭니다 — 컨트롤의 가로 여백은 세로 여백에 대한 비로 잡히는데, 배지는 20~24 상자에 18짜리 줄상자가 들어가 나눌 세로가 0~2밖에 없습니다. 배지도 컨트롤과 같은 규칙을 집니다. 밀도와 가독성은 다른 축이라, 배지가 작아진다고 글자가 따라 내려가지 않습니다. 컨트롤이 14인 자리에서 배지가 12인 것은 배지가 버튼 라벨보다 한 단 낮은 표식이기 때문이고, 각 tier가 자기 앵커를 하나씩 듭니다.
**padding** — `interaction` 4/8/12/16/24 (Box 여백) · `layout` 8/12/16/24/32 (container)
**gap** — 4/8/12/16/24 (4px 배수)
**radius** — `interaction` 단일 6 · `layout` `sm` 6 · `md` 8 · `lg` 12 · `full` 999(알약)
**fontSize**(chrome text) · **measure**(읽기 폭) — 각 5단
**icon** — 아이콘·스피너 16/18/20. **아트보드지 잉크가 아닙니다.** `Icon`은 viewBox 24짜리 path를 받아 그리는데 아이콘 규격(lucide 등)은 그 24 안에 여백을 두고 18~20만 채우므로, 화면의 잉크는 아트보드의 75~83%입니다. 그래서 아트보드가 Checkbox와 같은 16이면 아이콘만 한 단 작아 보입니다 — 숫자가 같은 것과 같아 보이는 것은 다릅니다. 사다리가 한 단 위에 있는 이유입니다(이 축의 옛 이름은 `dot`이었는데, status dot은 이 축을 안 쓰고 소비처가 Icon·Spinner 둘뿐이라 이름이 축을 잘못 가리키고 있었습니다)
**switch** — 트랙 30×17 / 32×18 / 36×20, 손잡이 13/14/16. 손잡이가 Checkbox 변 − 2라 트랙이 Checkbox + 2로 앉습니다. 옛 규칙은 반대로 손잡이를 Checkbox에 맞춰(16) 트랙이 20이 됐는데, 스위치는 폭이 트랙 두 배라 같은 높이에서도 면적이 세 배입니다 — 높이까지 크면 폼 한 줄에서 스위치만 튑니다. 여백 `(h − thumb) / 2`가 사방에 같이 걸려 켜짐 이동이 `w − h` 한 항등식으로 떨어집니다
**shadow** (2단, 떠 있는 것만) — `overlay`(Modal·Tooltip) · `overlayMinimal`(Switch 손잡이). semantic Form의 hover에는 elevation과 별개인 중앙 pigment shadow(`0 0 12px`, solid 22%)가 잠깐 나타납니다. 상태색이 이미 solid라 선을 더 진하게 만들 수 없는 경우의 interaction 피드백이며, 다른 컴포넌트로 확장하지 않습니다.
**constants** — `borderWidth` 1 · `focusRingWidth` 2 · `overlayBlur` 2 등, **atom** — Checkbox·Switch·Radio 등 사다리 밖 치수

`radius.full`은 사다리의 끝이 아니라 사다리 밖입니다. 999px은 크기가 아니라 "높이의 절반까지"라는 규칙이어서, 같은 값이 34px 버튼에서는 17px 곡선이 되고 22px 배지에서는 11px 곡선이 됩니다. 어디에 얹히느냐가 실제 반경을 정하니 intent(interaction·layout)로 갈릴 이유가 없고, 그래서 둘과 나란한 셋째 가지로 섭니다.

이 값은 원래 `constants.pillRadius`였습니다. 이름은 맞았지만 자리가 틀렸습니다. radius 축을 읽는 사람에게 알약이 보이지 않았고, 쓰려면 축 바깥의 서랍을 뒤져야 했습니다. 그러는 동안 데모의 hero CTA는 라이브러리 밖에서 CSS로 버튼 모서리를 덮어쓰고 있었습니다. 축이 자기 최대값을 API로 들지 않으면 소비처는 축을 우회합니다.

토큰의 이름은 `radius.full`이지만 컴포넌트가 여는 prop은 `shape="pill"`입니다. 이름이 갈리는 데는 이유가 있습니다. Box는 곡선의 크기를 고릅니다 — `sm`·`md`·`lg`·`full`이 한 사다리 위에 있고, `radius`는 그중 어느 칸이냐를 묻습니다. Button·Badge·Field·Select·SegmentedControl은 사다리를 아예 열지 않습니다. 물어보는 것은 실루엣이 알약이냐 아니냐 하나뿐이라, `radius`라는 이름은 있지도 않은 선택지를 암시합니다. 같은 999px을 두 이름으로 부르는 게 아니라, 서로 다른 두 질문에 각자의 이름을 준 것입니다. Tabs는 열린 underline navigation이라 이 shape 축 자체를 갖지 않습니다.

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

컴포넌트는 값이 아니라 참조를 봅니다. `tokens.color.surface.raised`는 `#ffffff`가 아니라 `"var(--pui-color-surface-raised)"`입니다. raw surface hex는 `palette.ts`, raw accent hex·OKLCH는 `color-ladder.ts`에 있고, `colors.ts`가 이를 semantic tree로 번역합니다. `theme.css.ts`는 마지막 tree를 `:root`에 굽고, 컴포넌트는 var 참조만 봅니다. 이 간접층 덕분에 palette·값·화면 역할이 섞이지 않고, 값 하나를 바꿔도 이름이 어긋나지 않습니다. source와 ladder는 Playground [Palette](/playground/palette), semantic 결과는 [Tokens](/playground/tokens)에서 확인합니다. 전체 흐름은 [색 아키텍처](color-architecture.md)와 [아키텍처](architecture.md)에서 다룹니다.
