# CLAUDE.md

## 이 레포지토리

paper-ui — 복잡한 웹앱을 위한, 순백과 검정의 디자인 시스템. Studio Baeks 의 작업용.

**정체성: 순백 위에 부드럽게 그려지는 UI.** 모든 시각 결정의 근거는 [docs/get-started/philosophy.md](docs/get-started/philosophy.md) 의 세 철학(편안한 컬러감 · 조용한 밀도감 · 부드러운 견고함)과 그 아래 일곱 원칙 — 색은 의미가 없으면 쓰지 않는다 · 회색은 카드를 감싸지 않고 받친다 · 크기와 밀도는 다른 축이다 · 떠 있는 것만 그림자를 갖는다 · 시스템이 형태를 정한다 · 빌드가 규칙을 지킨다 · 닫혀 있되 막다른 길은 없다.

```
베이스는 흰색과 검정 둘뿐이다. 그 조화가 화면의 골격을 만든다.
색(blue·green·amber·red)은 status·focus·링크처럼 의미가 있는 자리에만 작게 얹는다 —
장식으로 면을 채우지 않고, 의미가 있을 때만. (색 면은 그 색의 의미를 짊어질 때만 — error 버튼처럼.)

지향: ChatGPT 의 조용함(옅은 면·거의 안 보이는 경계)을 골격으로,
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

## 색 — 면(surface)과 잉크색(color × variant)을 나눈다 (v2)

**두 어휘를 종류로 나눈다** — 면은 색이 아니라 지면이라서. "큰 면을 색으로 안 채운다"는
정체성상 Box 는 accent 색을 입을 일이 없어, 애초에 다른 종류다. 값은 light/dark 쌍이고 `[data-theme]` 스코프가
통째로 교체한다. 중립은 순회색이 아니라 **hue 286°** zinc 캐스트를 양 테마가 공유하고,
chroma 만 저명도 보정으로 다크에서 올린다(라이트 면 `C .001~.004` ↔ 다크 면 `.006~.009`).

**면(surface) — Box 의 구조 축.** 깊이 사다리. 색을 입지 않는다.

| surface | light | dark | 쓰임 |
|---|---|---|---|
| `raised` | `#ffffff` | `#0d0d10` (최암) | 떠오른 면 (카드·입력·모달) |
| `canvas` | `#fcfcfc` | `#101013` (앵커) | 기준면 (페이지 바닥) |
| `sunken` | `#f4f4f5` | `#161619` | 사이드바 · table head |
| `well` | `#e2e2e5` | `#252529` (최명) | 더 깊은 well |

⚠ **깊이 불변식 — 사다리는 양 테마에서 거울이다. 순서가 반대다.**

    라이트   WHITE | raised | canvas | sunken | well | GRAY
    다크     BLACK | raised | canvas | sunken | well | GRAY

`raised` 는 **그 테마의 목표에 가장 가까운 면**이다 — 라이트에서 최명, 다크에서 **최암**.
"raised = 언제나 최명" 은 폐기됐다(2026-09-04). 그게 남아 있는 동안 다크는 뒤집히지 않은 축을
하나 갖고 있었고, 값을 맞춰도 어색함이 안 지워졌다. 간격은 `canvas`(앵커)를 축으로 라이트를
접는다 — 쌍의 거리가 양 테마에서 거의 같아진다. 괘선도 같은 대칭이라 **다크 괘선은 사다리보다
위**다(라이트에서 `well` 아래인 것의 거울).

**Box** = `surface` + `border`(카드 헤어라인) + `inverse`(검은 판) + radius·shadow·padding.
**색·잉크는 Box 에 없다.**

**잉크색(color × variant) — Button·Badge·Alert.** `color` 가 무슨 색, `variant` 가 얼마나 무겁게.

| color | light | dark | 쓰임 |
|---|---|---|---|
| `primary` | `#18181b` | `#e8e8ea` | 검정 일꾼 (다크선 흰 채움) — 면 채우는 유일한 색 |
| `info` | `#2563eb` | `#5492ec` | 정보 · **focus 링** · 링크 |
| `success` | `#15803d` | `#32ac64` | 성공 |
| `warning` | `#b45309` | `#c58300` | 주의 |
| `error` | `#dc2626` | `#df6768` | 위험 |

accent 는 hue 이름(blue 등)이 **API 에 없다** — 전부 의미색. 각 accent 는 solid·**solidFg**·ink·wash·edge
5 자리. **solid 버튼은 모노크로매틱** — 채움(solid)과 그 위 글자(solidFg)가 **같은 hue** 라 버튼 전체가
한 색으로 통일된다(흰색 아님). 라이트는 채움을 다 진한 대역(green·amber 도 700 톤)으로 맞춰 늘 옅은 색
글자가 얹힌다 — 색마다 글자 밝기가 갈리는 문제를 없앤다.
⚠ **채움은 테마마다 방향이 반대다** — 라이트는 진한 면 + 옅은 글자(L .53~.58 / .92~.94), 다크는 **옅은
면 + 진한 글자**(L .660 / .215). 라이트를 canvas 축으로 접은 값이고, primary 가 이미 그렇게 한다. 다크
채움을 눌러 두면 solid→면 대비가 3:1 을 못 넘고(1.79~2.45) status Banner 글자가 2.2~2.5 로 무너진다.
채운 면 위 글자는 `paper.raised` 가 아니라 **언제나 solidFg** 다 — 다크의 raised 는 최암이다.
⚠ 라이트 solidFg 는 채움 위에서 3.91~4.21 로 아직 AA 미달이다. 값의 문제라 팔레트 확정 뒤로 미뤄 뒀다.

**`variant` 축 = 시각 무게:** `solid`(채움) · `soft`(옅은 면) · `outline`(테두리) · `quiet`(글자만).
- Button 예) 기본=`primary solid`(검정) · `variant="soft"`=회색 secondary · **`variant="outline"`=흰 기본
  버튼** · `color="error"`=빨강. 흰/회색 버튼은 색이 아니라 primary 의 무게로 나온다.
- **Badge** 도 color × variant (기본 soft) + `dot`(상태 점) — solid=카운트·강조, outline=테두리 태그, quiet=글자만.
  Alert 는 언제나 soft, `color` 는 accent 4 색.

**마크 색(ink)은 면이 아니라 글자가 정한다** — `Text`·`Icon` 의 `ink`. 한 축에 뉴트럴
농도(`base·soft·faint`)와 의미색(`info·success·warning·error`)이 함께 있다 — 글자는 색이
하나. accent 는 단일 톤(AA ink)이라 농도×색 직교(죽은 셀)를 안 만든다. `<Text ink="error">`.
**interaction**(hover/selected/active)은 중립=오버레이(라이트=ink alpha, 다크=흰빛 alpha),
색=accent 스텝. **scrim**(모달 뒤)·**shadow**(다크는 더 짙게)도 테마 인식.

**규칙:**
- **면을 색으로 채우지 않는다.** 면은 surface(회색·흰), 채우는 건 primary(검정/다크선 흰색)뿐.
  색은 의미의 자리. **Box 는 색을 안 받는다** — 색 영역은 Button·Badge·Alert, 검은 판은 `inverse`.
- **status = validation 만.** Field·TextField·Textarea 는 `status`, 나머지는 `color`.
  status 이름 == accent color 이름 (danger 폐기 → error).
- **`primaryColor` 가 없다.** 정체성은 색이 아니라 순백·검정·여백. Provider 가 고르는 단 하나는
  *테마*(light·dark·system).

---

## 형태

- **radius 는 날만 죽인다** — `interaction` 단일 6 (버튼·입력·배지) · `layout` `sm 6`(Tooltip) ·
  `md 8`(카드) · `lg 12`(모달) · `full 999`(알약). 알약을 여는 prop 이름은 Box 가 `radius="full"`
  (사다리 한 칸), Button·Badge 가 `shape="pill"`(실루엣) 이다. 사다리를 한 단 조인 건 큰 곡선이 밀도와
  싸우기 때문 — 모서리가 물러날수록 면과 헤어라인이 앞으로 나온다. `full` 은 intent 로
  갈리지 않아 두 가지와 나란한 셋째 가지다.
- **회색은 받친다** — 카드는 흰 면 + 얇은 헤어라인으로 선다. 회색(`sunken`·`well`)은 그 아래
  well(table head · marker)에만 온다 — 회색 위에 회색을 얹지 않는다. 구획은 여백과 헤어라인으로.
- **shadow 는 2 단 토큰(elevation 축 아님)** — 떠 있는 것만 그림자를 갖는다. `overlay`
  (Modal·Tooltip·Popover) · `overlayMinimal`(Switch 손잡이 등). 붙어있는 면(Button·Field·
  Card·Table)은 그림자 없음(prop 을 안 준다). 다크에선 near-black 이 사라지므로 더 짙은 그림자로
  교체(테마 인식). `raised` 는 이제 surface color 지 그림자가 아니다(옛 elevation.raised 충돌 해소).
  radius 는 독립 — 면 크기가 정한다(작은 Tooltip 6, 큰 Modal 12).
- **hover 는 조용히** — interaction 오버레이가 밑 면 위에 얹혀 한 단 어두워/밝아진다. 테두리 강조 없음.
- **밀도** — 간격(Space) 5단(4px 배수 xs4~xl24)과 컨트롤 크기(ControlSize) 3단(sm·md·lg)을 분리한다. 컨트롤 크기가 바뀌어도 글자는 14 고정(controlFontSize 14/14/14). control 높이 md 34 · table 행 44.
  여백도 컨트롤 전용 축이다 — `controlPaddingX` 10/13/17 · `controlPaddingY` 8/10/13(= (height−14)/2).
  **Box 여백 사다리(8/12/16)를 컨트롤에 빌려 쓰지 말 것** — 비가 눌려 답답해지고 형제와 1~2px 어긋난다.
  Button·Field·Select·Textarea·Tabs 가 `internal/sizeLadder` 를 공유한다(Link 는 글자라 제외).
  Badge 는 자기 높이 사다리(20/22/24)를 쓰되 **글자는 12 고정** — 컨트롤 14 와 같은 규칙, 다른 tier.

---

## 글자

네 축이 직교한다 — **size · weight · leading · tracking**. 각 축이 `tokens.text.*`
토큰이라 컴포넌트가 `"0.875rem"` 같은 raw 값을 박지 못한다. variant 는 이 축들을
조합한 7 단 위계다:

`display 32 · title 22 · heading 18 · subheading 15 · body 14 · caption 13 · label 12`.

서체는 위계가 아니라 **family 축**이다 — `Text` 의 `family`(sans 기본 · mono)가 어느
variant 에도 교차한다. mono 는 `.pui-mono` 가 등폭으로 바꾸며 음수 tracking 을 지운다.

- **body 14px** anchor — 복잡한 웹앱의 표준 밀도(shadcn text-sm · Atlassian).
- **제목 위계 셋** — `title·heading·subheading` = h1·h2·h3. 페이지·문서의 계층이 또렷.
  `display` 는 랜딩 hero 한 자리만.
- **weight 는 variant 와 직교한 별도 축** — `normal 450 · medium 550 · semibold 600 ·
  bold 700`. Button·Tab 은 variant 기본 굵기 대신 여기서 골라 쓴다(`tokens.text.weight.*`).
- **서체** — Pretendard 를 맨 앞에(라틴·한글을 한 몸으로 그려 굵기가 균형), `-apple-system`
  은 fallback. `family="mono"` 는 코드·토큰·식별자 같은 기술적 자리에만 — 숫자를 무조건
  등폭으로 두지 않는다. 데이터 표의 숫자 열은 sans 그대로 `tabular-nums` 로 자리만 맞춘다.
- **label 은 sentence-case medium** — mono·uppercase 아님(그건 ledger 였다). shadcn 결.

---

## 레이어 · 절대 규칙 4

```
Tokens → Primitives → Atoms → Molecules → Components
```

| 레이어 | 수 | |
|---|---|---|
| Primitives | 4 | `Box · Stack · Inline · Text` — raw HTML 을 렌더하는 유일한 자리 |
| Atoms | 13 | `Button · Field · Textarea · Select · Checkbox · Switch · Radio · Label · Badge · Icon · Spinner · Divider · Link` |
| Molecules | 6 | `Card · TextField · RadioGroup · Tabs · Tooltip · Alert` |
| Components | 4 | `Table · Modal · Navbar · Banner` |

**= 27(기준선).** 폼(Textarea·Switch·Radio)·피드백(Alert)·로딩(Spinner)까지 시스템이
완결되는 최소 집합. Banner 는 데모·공지 chrome 의 얇은 풀폭 바(검정 solid + status).

**컴포넌트 추가 잣대는 단계로 갈린다.** *"실제 화면에서 두 번 이상 필요했다는 증거"* 는
**v1 배포 이후** 의 규칙이다 — 배포 전엔 소비자가 없어 "수요 2회" 가 성립할 수 없다. **v1 로
가는 지금은** 기준이 다르다: **표준 primitive 이거나(공개 DS 가 으레 제공하는 것) 실제
semantic 공백을 메우는가.** 그래도 장식적 중복(같은 걸 이름만 바꿔 두 개)은 여전히 금지 —
가능하면 새 컴포넌트보다 기존 것의 확장(prop·폴리모피즘)을 먼저 본다.

1. **raw 값 금지** — hex 는 `tokens/colors.ts` 에만. `tokens.color.X` 로만 참조.
2. **VALUES import 격리** — raw 값 모듈은 `styles/theme.css.ts` 만 import.
3. **inline style 로 토큰 주입 금지** — `.css.ts` className 으로만.
4. **Primitive 위에서 raw HTML 금지** — Molecule 부터는 Primitive/Atom 합성. raw 태그가
   필요하면 `<Box as="button">` 이 유일한 통로.

네 규칙 모두 **eslint 가** 막는다 (문서가 아니라 빌드가).

**+ 접근성도 빌드가 지킨다.** `eslint-plugin-jsx-a11y`(recommended)를 `polymorphicPropName:"as"`
로 걸어 `<Box as="button">` 같은 폴리모픽 요소까지 검사한다 — 유효한 role·aria, 대체텍스트,
양수 tabindex 금지 등. 우리 폼 아톰은 `label-has-associated-control` 의 `controlComponents`
로 컨트롤 등록. runtime 계약(Modal focus trap 등)은 lint 로 못 잡으니 컴포넌트가 직접 진다.
원칙 6("빌드가 규칙을 지킨다")의 확장.

---

## 작업 완료 전 체크

- [ ] `pnpm -r typecheck` · `pnpm lint` 통과했는가
- [ ] 색을 추가했다면 — 정말 *의미* 가 있는가. 장식이면 넣지 않는다 (색은 의미가 없으면 쓰지 않는다)
- [ ] 큰 면을 색으로 채우지 않았는가 (면은 검정 primary 만)
- [ ] 컴포넌트를 추가했다면 — (v1 배포 후) 실제 화면에서 두 번 이상 필요했다는 증거가 있는가 / (배포 전, 지금) 표준 primitive·semantic 공백을 메우는가, 기존 것의 확장으로 안 되는가
- [ ] 데모(`app/`)가 여전히 서는가. 데모가 이 시스템의 유일한 검증이다
