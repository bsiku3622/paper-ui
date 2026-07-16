# CLAUDE.md

## 이 레포지토리

paper-ui — 화면 위의 장부. Studio Baeks 의 두 번째 디자인 시스템이다.

**정체성: 종이 위에 잉크로 쓴다.**

```
studio-ui 는 8 색 팔레트를 깔아두고 문서로 "절제해서 쓰세요" 라고 부탁했다.
지켜지지 않았다. paper-ui 는 팔레트에서 색을 빼버렸다.

화면의 99% 는 종이(paper)와 잉크(ink) 다. 색은 3 개뿐이고 셋 다 의미를 갖는다
(error·success·danger). 색이 등장하면 반드시 이유가 있다 — 아껴 쓰는 게 아니라
꺼낼 이유가 없는 구조다.
```

**모노레포 구조** (pnpm workspace):

```
paper-ui/
├── docs/                       # 시스템 문서
└── workspace/
    ├── packages/paper-ui/      # @studio-baeks/paper-ui — 단일 npm 패키지
    │   └── src/
    │       ├── tokens/         # 값의 유일한 정의 위치
    │       ├── styles/         # theme.css.ts (raw 값 → CSS var) · utility.css.ts
    │       ├── resolvers/      # 규칙의 주인 (prop → className)
    │       ├── primitives/     # raw HTML 을 렌더하는 유일한 레이어
    │       ├── atoms/ molecules/ components/
    │       └── provider/
    └── app/                    # 데모 — ledger 화면 하나
```

pnpm 명령은 `workspace/` 에서 실행한다.

`core`/`web` 분리는 **일부러 없다**. studio-ui 는 존재하지 않는 두 번째 medium 을
위해 그 경계를 미리 만들었고, 2 년 뒤에도 medium 은 하나였다. 필요해지면 그때 가른다.

---

## 척추 — `line`

```ts
LINE = 44px   // 장부 한 줄
```

괘선 간격도, 행 높이도, 표 머리 높이도 전부 여기서 나온다. `.paper-rules` 가 배경에
44px 간격으로 가로줄을 긋고 Row 의 높이가 같은 44px 이라, 항목이 선 *위에 앉는다*.
이게 이 시스템이 종이로 읽히는 이유의 8 할이다.

**격자를 벗어나는 높이를 새로 만들지 않는다.** 임의 높이가 하나 생기면 그 아래
모든 행이 밀려 배경 괘선과 이중선이 된다. (`height.control` = line × 3/4 = 33px 은
한 줄 *안에* 들어가는 자리다.)

---

## 레이어

```
Tokens → Primitives → Atoms → Molecules → Components
```

| 레이어 | 수 | 것 |
|---|---|---|
| Primitives | 4 | `Box · Stack · Inline · Text` — raw HTML 을 렌더하는 유일한 자리 |
| Atoms | 9 | `Button · Field · Label · Badge · Checkbox · Icon · Divider · Link · Select` |
| Molecules | 4 | `Card · TextField · Tabs · Tooltip` |
| Components | 3 | `Table · Modal · Navbar` |

**= 20.** 이보다 늘리려면 *그 컴포넌트가 실제 화면에서 두 번 이상 필요했다는 증거*
가 있어야 한다. "있으면 좋을 것 같아서" 는 증거가 아니다. studio-ui 는 82 개였고
그중 실사용 검증된 건 손에 꼽았다.

`Select` 가 Atom 인 이유 — native `<select>` 를 렌더하므로 root 태그 하나짜리
단일 컨트롤이다. 규칙 4 를 우회하지 않으려면 Atom 이어야 한다.

---

## 절대 규칙 4

1. **raw 값 금지** — hex 는 `tokens/colors.ts` 에만. 컴포넌트는 `tokens.color.X`
   참조 객체로만 색에 닿는다. `var(--paper-...)` 문자열도 직접 쓰지 않는다 (이름이
   어긋난다). *eslint 가 막는다.*
2. **VALUES import 격리** — `COLOR_VALUES · SHAPE_VALUES` 의 *값* 은
   `styles/theme.css.ts` 만 import 한다. *eslint 가 막는다.*
3. **inline style 로 토큰 주입 금지** — `.css.ts` 의 className 으로만. *eslint 가 막는다.*
4. **Primitive 위에서 raw HTML 금지** — Molecule 부터는 `Box · Stack · Inline · Text`
   또는 Atom 으로 합성한다. raw 태그가 필요하면 `<Box as="button">` 이 유일한 통로다.
   *eslint 가 막는다.*

네 규칙 모두 문서가 아니라 **빌드가** 지킨다. 적어두고 기억력에 맡기면 3 개월 뒤에
안 지켜져 있다.

---

## 색

| 자리 | 값 | 쓰임 |
|---|---|---|
| `paper.base` | `#fbf9f5` | 기본 지면. RGB 편차 6 — 순백(0)과 누런 장부지(10+) 사이 |
| `paper.sunk` | `#f2efe8` | 눌린 칸 — table head · input · sidebar |
| `paper.deep` | `#e9e5dc` | 더 눌린 칸 |
| `ink.base` | `#1a1917` | 본문. 순검정이 아니다 |
| `ink.soft` | `#6b655c` | 보조 · 라벨 · **info** |
| `ink.faint` | `#a8a29a` | placeholder · disabled |
| `rule.base` | `rgba(26,25,23,0.10)` | 괘선 |
| `rule.strong` | `rgba(26,25,23,0.18)` | 섹션 경계 |
| `accent.red` | `#c8322a` | **error** · 적자 |
| `accent.green` | `#1f7a3d` | **success** |
| `accent.orange` | `#c2610d` | **danger** |

**면은 뜨지 않고 판다.** `raised` 가 없다 — 장부에서 강조는 띄우는 게 아니라 칸을
파는 것이다. 그림자는 *떠 있는 것*(Modal · Tooltip) 의 표식이지 장식이 아니다.

**info 에 유채색이 없다.** info 는 소리칠 일이 없으므로 `ink.soft` 로 간다. status
4 종 중 하나가 무채색인 건 결함이 아니라 이 시스템의 주장이다.

**`primaryColor` 가 없다.** 브랜드가 고를 색이 없다 — 정체성은 색이 아니라 종이와
괘선에서 나온다.

accent 를 쓰는 방법은 둘뿐 — `ink`(글자·선만) 와 `wash`(옅은 면 + 같은 색 괘선).
색으로 꽉 찬 면(solid)은 **Button 1 차 액션 한 자리** 에만 있다.

---

## 글자

6 단. `title · heading · label · body · numeric · caption`.

- **`body` 15px** 이 anchor. 장부는 읽는 문서지 대시보드가 아니다 — 13px 로 조이면
  밀도는 오르지만 읽기를 포기하게 된다.
- **`numeric`** = mono + `tabular-nums`. 금액 열에서 1 과 8 의 폭이 다르면 눈이
  합계를 못 따라간다. `Table` 의 `numeric: true` 열이 자동으로 붙인다.
- **`label`** = mono + uppercase + tracking. 표 머리와 라벨의 결.
- size/weight/color 를 따로 고르는 prop 은 없다. 6 개 중 하나를 고르는 게 전부다.

---

## 작업 완료 전 체크

- [ ] `pnpm -r typecheck` · `pnpm lint` 통과했는가
- [ ] 새 높이를 만들었다면 `line` 격자 위에 있는가
- [ ] 색을 추가했다면 — 정말 *의미* 가 있는가. 장식이면 넣지 않는다
- [ ] 컴포넌트를 추가했다면 — 실제 화면에서 두 번 이상 필요했다는 증거가 있는가
- [ ] 데모(`app/`)가 여전히 서는가. 데모가 이 시스템의 유일한 검증이다
