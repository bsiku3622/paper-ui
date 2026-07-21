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

**primary / focus.** `primary`는 검정 일꾼(`base` `#18181b` · `hover` `#0a0a0a` · `fg` `#ffffff`), `focus.ring`은 파란 링 `#2563eb`. accent가 다른 축보다 깊은 건 "색은 이 네 방식으로만 등장한다"를 트리 모양에 박아둔 것입니다.

## Shape

**space** (4px 배수) — `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 24
**height** — `sm` 28 · `control` 34(기본) · `lg` 40 · `row` 44
**radius** — `sm` 8 · `md` 12 · `lg` 16 · `pill` 999px
**shadow** (2단, overlay만 뜬다) — `raised` · `overlay`
**z** — base 0 · sticky 20 · overlay 30 · modal 40 · **measure** 608px · **borderWidth** 1px

## Text

여섯 variant가 크기·굵기·서체·잉크 농도를 한 번에 정합니다.

| variant | size | weight | family |
|---|---|---|---|
| `title` | 22px | 650 | sans |
| `heading` | 15px | 600 | sans |
| `label` | 12px | 500 | sans |
| `body` (기본) | 14px | 400 | sans |
| `mono` | 14px | 450 | mono |
| `caption` | 13px | 400 | sans |

**body 14px**가 anchor입니다 — 복잡한 앱의 표준 밀도(shadcn·Atlassian·Linear). 콘텐츠 사이트의 16px로 키우면 밀도가 풀려 대시보드가 늘어집니다. `mono`는 코드·토큰 같은 기술적 자리에만 씁니다 — 숫자라고 무조건 등폭으로 두지 않습니다. 표의 숫자 열은 sans 그대로 `tabular-nums`로 자리만 맞춥니다.

## 참조 방식

컴포넌트는 값이 아니라 참조를 봅니다. `tokens.color.paper.base`는 `#ffffff`가 아니라 `"var(--pui-color-paper-base)"`입니다. 실제 hex는 `styles/theme.css.ts`가 `:root`에 굽고, 그 파일이 raw hex를 import하는 유일한 모듈입니다(절대 규칙). 이 간접층 덕분에 raw 값과 화면이 분리되고, 값 하나를 바꿔도 이름이 어긋나지 않습니다. 그 구조는 [아키텍처](architecture.md)에서 다룹니다.
