# 토큰

모든 색·크기·시간의 정본입니다. 컴포넌트는 이 값을 직접 알지 못하고, `tokens` 객체의 `var()` 참조로만 닿습니다. 값을 바꾸려면 여기 세 파일(`colors.ts` · `shape.ts` · `text.ts`) 한 곳만 고치면 전 화면이 따라옵니다.

## Color

베이스는 흰색과 검정입니다. 색은 그 위에 작게 얹는 점입니다.

**paper — 흰 바탕 3단** (위로 갈수록 옅게 내려앉음)

| | 값 | 쓰임 |
|---|---|---|
| `paper.base` | `#ffffff` | 순백 캔버스 |
| `paper.subtle` | `#f7f7f8` | 카드 · 사이드바 · table head |
| `paper.muted` | `#ececee` | hover · 눌린 칸 · 선택 |

**ink — 검정 3단** (순검정 `#000`은 넓은 면에서 눈을 찌른다)

| | 값 | 쓰임 |
|---|---|---|
| `ink.base` | `#18181b` | 본문 |
| `ink.soft` | `#71717a` | 보조 · 라벨 |
| `ink.faint` | `#a1a1aa` | placeholder · disabled |

**border — 괘선** (거의 안 보이게 — 선보다 면으로 나누는 게 먼저)

| | 값 |
|---|---|
| `border.base` | `#e8e8ea` |
| `border.strong` | `#d8d8dc` |

**accent — 3색 × 4자리.** `solid`(채운 점) · `ink`(흰 배경 위 글자, AA) · `wash`(옅은 면) · `edge`(wash 괘선).

| | solid | ink | wash | edge |
|---|---|---|---|---|
| **blue** (info) | `#2563eb` | `#1d4ed8` | `#eff6ff` | `#bfdbfe` |
| **green** (success) | `#16a34a` | `#15803d` | `#f0fdf4` | `#bbf7d0` |
| **red** (error) | `#dc2626` | `#b91c1c` | `#fef2f2` | `#fecaca` |

**primary / focus.** `primary`는 검정 일꾼(`base` `#18181b` · `hover` `#3f3f46` · `fg` `#ffffff`), `focus.ring`은 파란 링 `#2563eb`. 검정 면은 hover 때 *밝아진다* — 이미 검정에 가까워 더 어둡게는 눈에 안 보이기 때문(원칙 4의 예외). accent가 다른 축보다 깊은 건 "색은 이 네 방식으로만 등장한다"를 트리 모양에 박아둔 것입니다.

## Shape

**space** (4px 배수) — `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 24
**height** — `sm` 28 · `control` 34(기본) · `lg` 40 · `row` 44
**radius** — `sm` 8 · `md` 12 · `lg` 16 · `pill` 999px
**shadow** (2단, overlay만 뜬다) — `raised` · `overlay`
**z** — base 0 · sticky 20 · overlay 30 · modal 40 · **measure** 608px · **borderWidth** 1px

## Text

타이포는 네 축이 직교합니다 — **size · weight · leading · tracking**. 각 축이 토큰(`tokens.text.size.body` = `var(--pui-text-size-body)`)이라, 컴포넌트가 `"0.875rem"` 같은 raw 값을 박을 일이 없습니다. variant는 이 축들을 조합한 8단 위계일 뿐입니다.

| variant | size | weight | family | 자리 |
|---|---|---|---|---|
| `display` | 32px | 700 | sans | 랜딩 hero (페이지당 하나) |
| `title` | 22px | 700 | sans | 페이지 제목 (h1) |
| `heading` | 18px | 600 | sans | 섹션 제목 (h2) |
| `subheading` | 15px | 600 | sans | 카드·소제목 (h3) |
| `body` (기본) | 14px | 450 | sans | 본문 |
| `caption` | 13px | 450 | sans | 부연·메타 |
| `label` | 12px | 600 | sans | 폼 라벨·표 머리 |
| `mono` | 14px | 450 | mono | 코드·토큰 |

**body 14px**가 anchor입니다 — 복잡한 앱의 표준 밀도(shadcn·Atlassian·Linear). 콘텐츠 사이트의 16px로 키우면 밀도가 풀려 대시보드가 늘어집니다. 제목 위계는 셋(`title`·`heading`·`subheading` = h1·h2·h3)이라 페이지와 문서의 계층이 또렷합니다. `mono`는 코드·토큰 같은 기술적 자리에만 — 숫자라고 무조건 등폭으로 두지 않습니다. 표의 숫자 열은 sans 그대로 `tabular-nums`로 자리만 맞춥니다.

`weight`는 variant와 **직교하는 별도 축**입니다(`normal` 450 · `medium` 550 · `semibold` 600 · `bold` 700). Button·Tab처럼 UI 컨트롤은 variant 기본 굵기 대신 여기서 골라 씁니다 — 값이 반 단계 무거운 건(450·550) dense 시스템에서 작은 글씨가 Retina에 눌리지 않게 하기 위함입니다.

## 참조 방식

컴포넌트는 값이 아니라 참조를 봅니다. `tokens.color.paper.base`는 `#ffffff`가 아니라 `"var(--pui-color-paper-base)"`입니다. 실제 hex는 `styles/theme.css.ts`가 `:root`에 굽고, 그 파일이 raw hex를 import하는 유일한 모듈입니다(절대 규칙). 이 간접층 덕분에 raw 값과 화면이 분리되고, 값 하나를 바꿔도 이름이 어긋나지 않습니다. 그 구조는 [아키텍처](architecture.md)에서 다룹니다.
