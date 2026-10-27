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
    │       ├── primitives/     # layout·text·icon building blocks
    │       ├── atoms/
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

- palette.ts만 OKLCH neutral·accent anchor와 `alpha05`~`alpha95` opacity scale을 소유합니다. color-ladder.ts의 순수 함수를 호출해 완성된 coordinates와 HEX Palette Token을 조립해 export합니다. Palette 값은 테마와 무관하며, semantic layer가 light/dark 역할에 맞는 step을 선택합니다.
- color-ladder.ts는 palette.ts를 import하지 않는 순수 계산 모듈입니다. 입력받은 좌표·단계에 대해 보간·gamut-map·HEX 인코딩을 수행하며 semantic role 이름을 두지 않습니다.
- colors.ts의 semantic leaf는 생성된 Palette Token만 선택합니다. 다른 semantic leaf, 직접 입력한 HEX, color math를 참조하지 않습니다.
- theme.css.ts는 semantic tree를 CSS variable로 내보냅니다. Package consumers는 tokens.color var 참조만 씁니다. /playground/palette는 source와 생성 결과를 확인하는 예외입니다. Foundations의 Tokens.tsx inspector도 색상 비교표를 위해 colors·palette 두 source 모듈을 정확한 경로로 읽습니다. 다른 raw-token import 제한은 유지합니다.

semantic color는 surface·ink·border·accent·interaction·overlay·shadow 역할로 나뉩니다.

| system | API | roles |
|---|---|---|
| Surface | `bg.<level>` | raised · canvas · sunken |
| Control | `control.<role>` | track |
| Border | `border.<level>` | base · strong · hover |
| Ink | `ink.<level>` | primary · secondary · tertiary |
| Accent | `accent.<name>.<ladder>` | primary · info · success · warning · error × solid · wash · ink · soft · subtle |
| Interaction | `interaction.<state>` | bgHover (onSurface·onPrimarySolid·onAccentSolid) · selected · active · focus |
| Overlay | `overlay.<role>` | scrim |
| Shadow | `shadow.<role>` | overlay · overlayMinimal |

Accent status는 palette와 분리합니다: info→blue, success→green, warning→amber, error→red. Accent는 같은 다섯 role을 공유합니다. `solid`는 채움, `wash`는 채움 위 글자, `ink`는 soft·hairline·ghost와 의미색 글자, `soft`는 soft surface, `subtle`은 muted foreground에 씁니다.

focus ring 색은 `interaction.focus`에 둡니다. focus는 상호작용 상태이고 색도 Palette Token에서 오기 때문입니다. 링 두께·offset은 색이 아닌 geometry이므로 `shape.focus.width`와 `shape.focus.offset`에 둡니다. Scrim은 `overlay.scrim`, shadow tint는 `shadow.overlay`와 `shadow.overlayMinimal`에 두고, 거리·blur·spread는 shape geometry로 둡니다. Semantic Form hover glow는 사용하지 않습니다.

색을 바꾸면 docs/foundations/color-architecture.md와 Palette·Tokens Playground를 함께 확인합니다. API 경로와 source 규칙을 동시에 갱신합니다.

## 형태

Shape은 `shape-palette.ts` 원본 수치 → `shape.ts` 공통 역할 → `shape-recipes.ts` 내부 anatomy → `.css.ts` className 순서입니다. 전체 경로와 단위·이관 계약은 [docs/foundations/shape-architecture.md](docs/foundations/shape-architecture.md)를 따릅니다.

- 공개 역할은 `space · radius · stroke · focus · control · selection · icon · shadow`입니다. `space`는 gap/padding 공통 5단(4/8/12/16/24), control은 별도 3단(sm/md/lg)입니다.
- radius는 날만 죽입니다. `radius.control` 4, `radius.surface` sm4/md6/lg8, `full` 999입니다. Box radius는 surface를 선택하며 control과 독립적입니다.
- control 높이는 30/32/36, button inset은 10/11/14, input inset은 7/8/10입니다. Box 여백을 컨트롤에 빌리지 않습니다. `internal/shape.ts`의 typed `controlGeometry`에서 역할을 선택하고 임의 patch 사다리는 만들지 않습니다.
- Textarea block inset은 `input inset − (leading − font size) / 2`로 3.5/4.5/7을 계산합니다. 최소 높이 96은 Textarea recipe가 소유합니다.
- 공통 `selection.size` 15/16/18에서 Checkbox·Radio 외곽과 Switch geometry를 고릅니다. Checkbox mark와 Radio dot의 sm 0.5px 광학 보정은 각자의 recipe입니다. Switch는 thumb=selection−2, track height=selection+2, width=thumb×2+4, travel=width−height입니다.
- Badge 높이20/22/24·inset6/8/10과 spinner artboard16/18/20은 private recipe입니다. Icon은 공개 크기 이름 label/caption/body/heading3와 artboard14/16/18/20을 유지합니다. 아이콘 path의 잉크와 artboard 크기는 다릅니다.
- 내부 원본 geometry는 private `--pui-geometry-*` 변수로 emit합니다. 파생 calc는 실제 소비 요소에서 평가해 중첩 공통 토큰 override를 반영합니다. `:root`에 파생식을 미리 조립하지 않습니다.
- 면의 width/height/measure/block padding은 Layout 책임입니다. Box의 named dimension은 `tokens.layout`으로 해석하고, Box padding prop은 `shape.space`를 선택합니다.
- shadow는 `overlay · overlayMinimal` 두 역할입니다. 떠 있는 것만 지속 그림자를 가지며 tint는 semantic Color, geometry는 Shape가 소유합니다. 회색은 구조를 받치며 `color.control.track`은 Switch 내부 트랙에 사용합니다.
- 패키지 내부에서는 canonical 경로만 사용합니다. `shape-legacy.ts`의 기존 JS/CSS 경로는 호환용이며 새 기능의 source로 사용하지 않습니다. 새 override는 canonical 변수에 적용합니다.
- Select는 native select와 decorative SVG를 wrapper 안에 둡니다. ref와 폼 속성은 native select, className/style은 보이는 wrapper에 전달합니다. 화살표는 semantic ink를 사용합니다.

상위 화면 조합과 그 prop 축은 현재 패키지 API에 포함하지 않습니다. 실제 제품에서 반복되는 요구가 생기면 공통 책임과 축을 먼저 설계합니다.

---

## 글자

Typography는 원본 수치인 **Palette**, 이를 조합한 **Text 스타일**, 실제 반복되는 완성 스타일만 담는 **Control preset**으로 나뉜다. 각 스타일은 Palette의 size · weight · leading · tracking을 참조하므로 컴포넌트가 `"0.875rem"` 같은 raw 값을 박지 않는다. Text variant는 제목 위계와 텍스트 역할을 조합한다:

`display 32 · title 28 · heading 20 · subheading 16 · body 14 · control 13 · caption 12 · label 12`.

서체는 위계가 아니라 **family 축**이다 — `Text` 의 `family`(sans 기본 · mono)가 어느
variant 에도 교차한다. mono 는 `.pui-mono` 가 등폭·전용 tracking·크기 배율을 적용한다.

- **body 14px** anchor — 복잡한 웹앱의 표준 밀도. 자주 쓰지 않는 16px 본문과 body size variant는
  두지 않는다. 조작 문구는 컴포넌트 간 중복을 제거한 `text.control` preset, 보조 정보는 `caption`, 짧은 이름은 `label`로 나눈다.
- **제목 위계** — `display` 는 큰 제목, `title`은 페이지 제목, `heading`과 `subheading`은 섹션 제목용이다. HTML 태그는 `as`로 별도 지정한다.
- **leading은 px 고정값** — Text: `display 32/40 · title 24/32 · heading 20/28 · subheading 16/24 · body 14/20 · caption 13/16 · label 12/16`. Control: `sm 13/16 · md 13/16 · lg 14/16`.
- **weight 는 variant 와 직교한 별도 축** — `regular 400 · normal 450 · medium 500 ·
  semibold 600 · strong 650 · bold 700`. Body·caption은 regular, control은 medium, label은
  semibold를 기본으로 쓴다(`tokens.text.palette.weight.*`).
- **서체** — Pretendard 를 맨 앞에(라틴·한글을 한 몸으로 그려 굵기가 균형), `-apple-system`
  은 fallback. `family="mono"` 는 코드·토큰·식별자 같은 기술적 자리에만 — 숫자를 무조건
  등폭으로 두지 않는다. 데이터 표의 숫자 열은 sans 그대로 `tabular-nums` 로 자리만 맞춘다.
- **label 은 sentence-case semibold** — mono·uppercase 아님.

---

## 레이어 · 빌드 규칙

```
Tokens → Primitives → Atoms
```

| 레이어 | 수 | |
|---|---|---|
| Layout | 4 | `Box · Stack · Inline · Grid` |
| Content | 2 | `Text · Icon` |
| Interaction | 7 | `Pressable · Hoverable · Toggleable · Draggable · Droppable · ToggleGroup · Overlay` |
| A11y | 4 | `FocusScope · VisuallyHidden · RovingFocus · FormField` |
| Atoms | 13 | `Button · IconButton · Field · Textarea · Select · Checkbox · Switch · Radio · Label · Badge · Spinner · Divider · Link` |

패키지는 Primitive와 Atom만 공개합니다. 제품별 조합은 앱이 소유하고, 여러 제품에서 반복된 뒤에만 공통 API로 승격합니다.

RovingFocus는 등록 항목의 Tab 진입점과 실제 DOM focus 탐색을 관리하며 선택과 분리합니다. ToggleGroup은 toggle button 그룹의 단일·복수 선택이고 다른 위젯의 role을 대체하지 않습니다. Overlay는 Trigger·Content·Close를 연결하며 기본 non-modal dialog, modal opt-in입니다. React Aria가 Portal·배치·중첩 dismissal·배경 inert·스크롤 잠금을 담당합니다. FormField/useField는 기존 Field Atom을 유지하면서 native label·설명·오류 ID를 연결합니다. 합성 도구 mergeProps는 additive handler 병합, composeEventHandlers는 caller preventDefault에 의한 내부 handler 취소, mergeRefs는 같은 DOM ref 연결입니다. 새 공통 상태·입력 관계 API도 Playground와 문서·실제 브라우저 검증을 함께 갱신합니다.

Primitive 계약의 정본은 [docs/components/primitives.md](docs/components/primitives.md)입니다. 기존 Layout·Content props를 유지하고 native ref를 전달합니다. Interaction은 컴포넌트와 usePress/useHover/useToggle/useDrag/useDrop을 함께 제공하고, FocusScope·VisuallyHidden·focus hook은 A11y에 둡니다. press는 일시적 입력, toggle은 유지되는 boolean 선택입니다. Draggable은 move/transfer 모드를 구분하며 Handle은 부모 전체 박스를 조작합니다. handle activation에서는 pointer·keyboard 모두 손잡이에서만 시작합니다. Move 좌표·Grid track은 runtime 값이므로 inline style을 사용하지만 semantic 토큰은 기존 class 경로를 유지합니다. 저수준 입력·포커스·native transfer 처리는 React Aria를 재사용합니다. 기존 Atom을 자동으로 새 행동 컴포넌트로 교체하지 않습니다.

1. **raw 색값 금지** — surface hex는 `tokens/palette.ts`, accent hex·OKLCH는 `tokens/color-ladder.ts`에만. 소비처는 `tokens.color.X`로만 참조.
2. **color layer import 격리** — palette·ladder·semantic VALUES는 consumer에서 import 금지. `/playground/palette` Foundations inspector만 허용된 source 예외입니다.
3. **inline style 로 토큰 주입 금지** — package 스타일은 `.css.ts` className 으로만 토큰을 적용합니다.

Primitive·Atom stylesheet의 고정 geometry literal도 semantic 역할이나 private recipe로 옮깁니다. 0·100%·정렬·회전 같은 구조적 CSS는 컴포넌트가 소유합니다.

네 규칙은 **eslint 가** 막습니다 (문서가 아니라 빌드가).

**접근성도 빌드가 지킵니다.** `eslint-plugin-jsx-a11y`(recommended)를 `polymorphicPropName:"as"`로 설정해 `<Box as="button">` 같은 polymorphic 요소까지 검사합니다. 유효한 role·aria, 대체텍스트, 양수 tabindex 금지 등을 lint하며, 폼 아톰은 `label-has-associated-control`의 `controlComponents`에 등록합니다. 상호작용별 runtime 계약은 실제 제품 구현과 검토가 책임집니다.

---

## 작업 완료 전 체크

- [ ] `pnpm -r typecheck` · `pnpm lint` 통과했는가
- [ ] 색을 추가했다면 — 정말 *의미* 가 있는가. 장식이면 넣지 않는다
- [ ] 큰 면을 색으로 채우지 않았는가 (면은 검정 primary만)
- [ ] Primitive·Atom API를 수정했다면 — app의 실제 사용 예와 문서를 갱신했는가
- [ ] 데모(`app/`)가 여전히 서는가
