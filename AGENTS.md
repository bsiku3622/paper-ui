# AGENTS.md

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

## 색 — OKLCH Palette에서 의미 시스템까지

색은 한 방향으로 흐릅니다.

```
OKLCH Palette source → HEX Palette Token generation → semantic systems → real use
     palette.ts              color-ladder.ts           colors.ts       CSS vars / UI
```

- palette.ts만 단일 OKLCH neutral·accent ramp와 `alpha05`~`alpha95` opacity scale을 소유합니다. Palette 값은 테마와 무관하며, semantic layer가 light/dark 역할에 맞는 step을 선택합니다.
- color-ladder.ts는 source를 보간·gamut-map해 6자리 HEX와 alpha scale의 8자리 HEX Palette Token을 생성합니다. 여기에는 semantic role 이름을 두지 않습니다.
- colors.ts의 semantic leaf는 생성된 Palette Token만 선택합니다. 다른 semantic leaf, 직접 입력한 HEX, color math를 참조하지 않습니다.
- theme.css.ts는 semantic tree를 CSS variable로 내보냅니다. Component·resolver·app은 tokens.color var 참조만 씁니다. /playground/palette만 source와 생성 결과를 확인하는 예외입니다.

semantic color는 surface·ink·border·accent·interaction·overlay·shadow 역할로 나뉩니다.

| system | API | roles |
|---|---|---|
| Surface | `bg.<level>` | raised · canvas · sunken · well |
| Border | `border.<level>` | base · strong · hover |
| Ink | `ink.<level>` | primary · secondary · tertiary |
| Accent | `accent.<name>.<ladder>` | primary · info · success · warning · error × solid · wash · soft · subtle |
| Interaction | `interaction.<state>` | bgHover (onSurface·onPrimarySolid·onAccentSolid) · selected · active · focus |
| Overlay | `overlay.<role>` | scrim |
| Shadow | `shadow.<role>` | overlay · overlayMinimal |

Accent status는 palette와 분리합니다: info→blue, success→green, warning→amber, error→red. Accent는 같은 네 role을 공유합니다. `soft`는 soft surface와 hairline 경계에, `subtle`은 muted foreground에 씁니다.

focus ring 색은 `interaction.focus`에 둡니다. focus는 상호작용 상태이고 색도 Palette Token에서 오기 때문입니다. 링 두께·offset은 색이 아닌 geometry이므로 `shape.constants.focusRingWidth`와 shape 상수에 둡니다. Scrim은 `overlay.scrim`, shadow tint는 `shadow.overlay`와 `shadow.overlayMinimal`에 두고, 거리·blur·spread는 shape geometry로 둡니다. Semantic Form hover glow는 사용하지 않습니다.

색을 바꾸면 docs/foundations/color-architecture.md와 Palette·Tokens Playground를 함께 확인합니다. API 경로와 source 규칙을 동시에 갱신합니다.

## 형태

- **radius 는 날만 죽인다** — `interaction` 단일 6 (버튼·입력·배지) · `layout` `sm 6`(Tooltip) ·
  `md 8`(카드) · `lg 12`(모달) · `full 999`(알약). 알약을 여는 prop 이름은 Box 가 `radius="full"`
  (사다리 한 칸), Button·Badge·Field·Select·Tabs 가 `shape="pill"`(실루엣) 이다. Tabs 는 한 축이
  트랙·항목 두 곡선을 함께 정하고, 각진 쪽 안쪽 반경은 `바깥 − 트랙 여백` 동심 계산이다.
  Textarea 엔 없다 —
  알약은 "높이의 절반" 이라 한 줄짜리에서만 성립하고, 여러 줄 상자에선 경기장이 된다. 사다리를 한 단 조인 건 큰 곡선이 밀도와
  싸우기 때문 — 모서리가 물러날수록 면과 헤어라인이 앞으로 나온다. `full` 은 intent 로
  갈리지 않아 두 가지와 나란한 셋째 가지다.
- **회색은 받친다** — Card의 기본은 shared `primary × hairline`이고, 강조가 필요할 때도
  별도 Card variant를 만들지 않고 shared `accent × variant` 안에서 고릅니다. `well`은 table head·marker·segmented track처럼
  구조를 받치는 더 깊은 면입니다. 같은 깊이의 회색 위에 같은 회색을 겹치지 않습니다.
- **shadow 는 2 단 토큰(elevation 축 아님)** — 떠 있는 것만 지속 그림자를 갖는다. `overlay`
  (Modal·Tooltip·Popover) · `overlayMinimal`(Switch 손잡이 등). 붙어있는 면(Button·Field·
  Card·Table)은 그림자 없음(prop 을 안 준다). 다크에선 near-black 이 사라지므로 더 짙은 그림자로
  교체(테마 인식). `raised` 는 이제 surface color 지 그림자가 아니다(옛 elevation.raised 충돌 해소).
  radius 는 독립 — 면 크기가 정한다(작은 Tooltip 6, 큰 Modal 12). semantic Form hover의 중앙
  pigment shadow는 elevation이 아니라 상태를 잃지 않고 hover를 보이는 일시적 예외다.
- **hover 는 조용히** — 면은 interaction 오버레이로 한 단 움직인다. neutral Form은 면을 흔들지
  않고 `primary.base` solid 선으로 올라가고, semantic Form만 같은 accent의 중앙 shadow를 더한다.
- **밀도** — 간격(Space) 5단(4px 배수 xs4~xl24)과 컨트롤 크기(ControlSize) 3단(sm·md·lg)을 분리한다. 컨트롤 글자는 `text.size.body`를 공유하고, control size는 height·padding만 바꾼다. control 높이 md 34 · table 행 44.
  가로 여백은 **라벨과 값이 갈린다** — 버튼·탭은 `controlPaddingX` 10/13/17, 입력칸은
  `inputPaddingX` 7/9/12. Field·Select·Textarea의 보이는 잉크가 사방 같은 거리다. md는 세로
  `(34 − 14) / 2 = 10`, 가로 `border 1 + padding 9 = 10`이다. Textarea의 `textareaPaddingY`는
  3.5/5.5/8.5 = 가로 − 반 줄 3.5
  (= (height − 테두리 2 − 줄상자 21) / 2). 분모는 글자 크기가 아니라 **줄상자**다 — 브라우저가
  세로 가운데 두는 게 줄상자라, 이 산식이라야 Textarea 첫 줄이 Field 와 같은 자리에 앉는다.
  Badge 는 컨트롤이 아니라 자기 축 `badgePaddingX` 6/8/10 을 쓴다(높이 20/22/24 와 같은 Δ2).
  **Box 여백 사다리(8/12/16)를 컨트롤에 빌려 쓰지 말 것** — 비가 눌려 답답해지고 형제와 1~2px 어긋난다.
  Button·Field·Select·Textarea·Tabs 가 `internal/sizeLadder` 를 공유한다(Link 는 글자라 제외).
  ⚠ **공유하는 건 height 와 글자고, 벗어나는 축은 통로로 나간다** — `ladderRules(patch)`.
  인자 없으면 베이스 그대로, 키를 돌려주면 그 축만 교체, `null` 이면 그 축을 뺀다(Textarea height).
  사다리를 손으로 베끼지 말 것 — Select 가 그래서 갈라졌다.
  작은 표식은 따로 묶인다 — `icon` 16/18/20(**아트보드**지 잉크가 아니다. viewBox 24 안에서
  path 는 18~20 만 채워 잉크는 75~83%. 그래서 Checkbox 와 같은 16 이면 아이콘만 작아 보인다),
  `checkbox` 15/16/18, `switch` 손잡이 = checkbox − 2 → 트랙 = checkbox + 2, 이동 = w − h.
  Badge 는 자기 높이 사다리(20/22/24)를 쓰되 **글자는 12 고정** — 컨트롤 14 와 같은 규칙, 다른 tier.

- **상위 레이어의 축** — 공유 `accent × variant`는 레이어와 무관하게 의미색과 시각 무게가 필요한
  컴포넌트가 우선 사용합니다(Button·Badge·Alert·Card). 지역 `variant`는 shared 축으로 표현할 수 없는
  구조만 고릅니다(Table `plain·ruled·striped`, Tabs `segmented·underline`). Table의 `density`는 같은 14px 정보의 행 높이(36·44·52)이고, Modal의
  `size`는 담는 일의 폭(360·432·640)입니다. 상태(`selected·open·error`)는 이 축들과 섞지 않습니다.
  전체 매트릭스와 금지 조합은 `docs/foundations/component-architecture.md`가 정본입니다.

---

## 글자

네 축이 직교한다 — **size · weight · leading · tracking**. 각 축이 `tokens.text.*`
토큰이라 컴포넌트가 `"0.875rem"` 같은 raw 값을 박지 못한다. variant 는 이 축들을
조합한 7 단 위계다:

`display 32 · title 22 · heading 17 · subheading 15 · body 14 · caption 12 · label 12`.

서체는 위계가 아니라 **family 축**이다 — `Text` 의 `family`(sans 기본 · mono)가 어느
variant 에도 교차한다. mono 는 `.pui-mono` 가 등폭·전용 tracking·크기 배율을 적용한다.

- **body 14px** anchor — 복잡한 웹앱의 표준 밀도(shadcn text-sm · Atlassian).
- **제목 위계 셋** — `title·heading·subheading` = h1·h2·h3. 페이지·문서의 계층이 또렷.
  `display` 는 랜딩 hero 한 자리만.
- **weight 는 variant 와 직교한 별도 축** — `regular 400 · normal 450 · medium 550 ·
  semibold 600 · bold 700`. `regular`는 mono 본문·caption 전용이고 Button·Tab 은 variant 기본
  굵기 대신 여기서 골라 쓴다(`tokens.text.weight.*`).
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
| Molecules | 12 | `Card · TextField · FormField · SearchField · RadioGroup · Tabs · Tooltip · Alert · Breadcrumb · Menu · Steps · TableOfContents` |
| Components | 11 | `Table · Modal · Navbar · Banner · PageHeader · EmptyState · Pagination · Sidebar · DropdownMenu · CommandMenu · TreeNavigation` |

**= 40(기준선).** 폼의 라벨 연결(FormField)·검색(SearchField)·피드백(Alert)·로딩(Spinner)과
데이터 화면의 위치·시작·빈 상태·이동·계층 탐색까지 시스템이 완결되는 최소 집합.
Banner 는 데모·공지 chrome 의 얇은 풀폭 바(검정 solid + status).

**컴포넌트 추가 잣대는 단계로 갈린다.** *"실제 화면에서 두 번 이상 필요했다는 증거"* 는
**v1 배포 이후** 의 규칙이다 — 배포 전엔 소비자가 없어 "수요 2회" 가 성립할 수 없다. **v1 로
가는 지금은** 기준이 다르다: **표준 primitive 이거나(공개 DS 가 으레 제공하는 것) 실제
semantic 공백을 메우는가.** 그래도 장식적 중복(같은 걸 이름만 바꿔 두 개)은 여전히 금지 —
가능하면 새 컴포넌트보다 기존 것의 확장(prop·폴리모피즘)을 먼저 본다.

1. **raw 색값 금지** — surface hex는 `tokens/palette.ts`, accent hex·OKLCH는 `tokens/color-ladder.ts`에만. 소비처는 `tokens.color.X`로만 참조.
2. **color layer import 격리** — palette·ladder·semantic VALUES는 component·resolver·app에서 import 금지. `/playground/palette` Foundations inspector만 예외.
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
- [ ] 큰 면을 색으로 채우지 않았는가 (면은 검정 primary만)
- [ ] 컴포넌트를 추가했다면 — (v1 배포 후) 실제 화면에서 두 번 이상 필요했다는 증거가 있는가 / (배포 전, 지금) 표준 primitive·semantic 공백을 메우는가, 기존 것의 확장으로 안 되는가
- [ ] 컴포넌트·prop·variant·token을 수정했다면 — 반드시 `app` Playground의 해당 preview·Props table·생성 코드를 함께 반영하고, 실제 Playground에서 동작을 확인했는가
- [ ] 데모(`app/`)가 여전히 서는가. 데모가 이 시스템의 유일한 검증이다
