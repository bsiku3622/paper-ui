# CLAUDE.md

## 이 레포지토리

paper-ui — 복잡한 웹앱을 위한, 순백과 검정의 디자인 시스템. Studio Baeks 의 작업용.

**정체성: 순백 위의 검정, 포인트로 작게 얹는 색.** 모든 시각 결정의 근거는 [docs/principles.md](docs/principles.md) 의 여섯 원칙 — 색은 점 · 선보다 면 · 떠 있는 것만 그림자 · 조용한 밀도 · 고를 것을 줄인다 · 빌드가 지킨다.

```
베이스는 흰색과 검정 둘뿐이다. 그 조화가 화면의 골격을 만든다.
색(blue·green·red)은 status·focus·링크처럼 의미가 있는 자리에만 작게 얹는다 —
장식으로 면을 채우지 않고, 점으로. (색 면은 그 색의 의미를 짊어질 때만 — danger 버튼처럼.)

지향: ChatGPT 의 조용함(옅은 면·넉넉한 라운드·거의 안 보이는 경계)을 골격으로,
      복잡한 화면의 밀도(Atlassian)와 단정한 마감(SwiftUI)을 얹는다.
```

**모노레포 구조** (pnpm workspace):

```
paper-ui/
├── docs/
└── workspace/
    ├── packages/paper-ui/      # @studio-baeks/paper-ui — 단일 npm 패키지
    │   └── src/
    │       ├── tokens/         # 값의 유일한 정의 위치
    │       ├── styles/         # theme.css.ts (raw 값 → CSS var) · utility.css.ts
    │       ├── resolvers/      # 규칙의 주인 (prop → className)
    │       ├── primitives/     # raw HTML 을 렌더하는 유일한 레이어
    │       ├── atoms/ molecules/ components/
    │       └── provider/
    └── app/                    # 데모 — 이슈 트래커 화면 하나
```

pnpm 명령은 `workspace/` 에서 실행한다. `core`/`web` 분리는 일부러 없다 — 존재하지
않는 두 번째 medium 을 위한 자리는 만들지 않는다.

---

## 색

**베이스 — 흰색과 검정:**

| 자리 | 값 | 쓰임 |
|---|---|---|
| `surface.base` | `#ffffff` | 순백 캔버스 |
| `surface.subtle` | `#f7f7f8` | 카드 · 사이드바 · table head (선 대신 이 면으로 구획) |
| `surface.muted` | `#ececee` | hover · 눌린 자리 |
| `ink.base` | `#18181b` | 본문 (순검정 아님 — 넓은 면에 #000 은 눈을 찌른다) |
| `ink.soft` | `#71717a` | 보조 · 라벨 |
| `ink.faint` | `#a1a1aa` | placeholder · disabled |
| `border.base` | `#e8e8ea` | 거의 안 보이는 경계 — 선보다 면이 먼저 |
| `border.strong` | `#d8d8dc` | 선이 꼭 필요한 자리만 |
| `primary.base` | `#18181b` | 1 차 액션 면 — 색이 아니라 검정이 채운다 |

**포인트 — 작게 얹는 색 (blue·green·red 뿐):**

각 색은 `solid`(채운 점) · `ink`(흰 배경 위 글자, AA) · `wash`(옅은 면) · `edge`(wash 괘선) 4 자리.

- `blue #2563eb` — info · **focus 링** · 링크
- `green #16a34a` — success
- `red #dc2626` — error · danger

**규칙:**
- **primary 는 검정, 파랑이 아니다.** 파랑 버튼이 매 화면 등장하면 색이 더는 포인트가
  아니다. 일꾼은 검정이고, 색은 status·focus·링크처럼 *작은* 자리에만.
- **solid 로 꽉 찬 큰 면을 만들지 않는다.** 색은 점이지 배경이 아니다. 면을 채우는 건
  primary(검정) 뿐.
- **info 도 색을 갖는다(blue).** 파랑을 포인트로 쓰기로 한 정체성의 귀결. status 3 종
  (info·success·error) 전부 색.
- **`primaryColor` 가 없다.** 브랜드가 고를 색이 없다 — 정체성은 색이 아니라 순백·검정·
  여백에서 나온다.

---

## 형태

- **radius 넉넉하게** — `sm 8` (버튼·입력·배지) · `md 12` (카드) · `lg 16` (모달). ChatGPT
  의 부드러운 라운드. 각진 데가 없다.
- **선보다 면** — 구획은 얇은 경계보다 `surface.subtle` 로 나눈다. 카드도 표도 옅은 면이
  감싼다. border 는 정말 선이 필요한 자리(table 행 · navbar 밑)만.
- **그림자는 overlay 의 표식** — 카드는 면으로 정의되고 뜨지 않는다. `raised`(세그먼트
  활성 pill) · `overlay`(Modal · Tooltip) 두 단뿐.
- **hover 는 조용히** — 배경이 `surface.muted` 로 살짝. 테두리 강조 없음.
- **밀도** — space 4px 배수(xs4~xl24, 촘촘하게) · control 높이 34 · table 행 44.

---

## 글자

6 단. `title 22 · heading 15 · label 12 · body 14 · numeric 14(mono) · caption 13`.

- **body 14px** anchor — 복잡한 웹앱의 표준 밀도(shadcn text-sm · Atlassian).
- **서체** — `-apple-system` 을 맨 앞에. macOS 에서 라틴은 SF(SwiftUI 의 얼굴), 한글은
  Pretendard. 숫자는 mono·tabular (데이터 표 열 정렬).
- **label 은 sentence-case medium** — mono·uppercase 아님(그건 ledger 였다). shadcn 결.

---

## 레이어 · 절대 규칙 4

```
Tokens → Primitives → Atoms → Molecules → Components
```

| 레이어 | 수 | |
|---|---|---|
| Primitives | 4 | `Box · Stack · Inline · Text` — raw HTML 을 렌더하는 유일한 자리 |
| Atoms | 9 | `Button · Field · Label · Badge · Checkbox · Icon · Divider · Link · Select` |
| Molecules | 4 | `Card · TextField · Tabs · Tooltip` |
| Components | 3 | `Table · Modal · Navbar` |

**= 20.** 늘리려면 *실제 화면에서 두 번 이상 필요했다는 증거* 가 있어야 한다.

1. **raw 값 금지** — hex 는 `tokens/colors.ts` 에만. `tokens.color.X` 로만 참조.
2. **VALUES import 격리** — raw 값 모듈은 `styles/theme.css.ts` 만 import.
3. **inline style 로 토큰 주입 금지** — `.css.ts` className 으로만.
4. **Primitive 위에서 raw HTML 금지** — Molecule 부터는 Primitive/Atom 합성. raw 태그가
   필요하면 `<Box as="button">` 이 유일한 통로.

네 규칙 모두 **eslint 가** 막는다 (문서가 아니라 빌드가).

---

## 작업 완료 전 체크

- [ ] `pnpm -r typecheck` · `pnpm lint` 통과했는가
- [ ] 색을 추가했다면 — 정말 *의미* 가 있는가. 장식이면 넣지 않는다 (색은 점이다)
- [ ] 큰 면을 색으로 채우지 않았는가 (면은 검정 primary 만)
- [ ] 컴포넌트를 추가했다면 — 실제 화면에서 두 번 이상 필요했다는 증거가 있는가
- [ ] 데모(`app/`)가 여전히 서는가. 데모가 이 시스템의 유일한 검증이다
