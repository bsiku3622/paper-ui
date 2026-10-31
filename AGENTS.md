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
├── .github/workflows/ci.yml    # push · pull request 마다 pnpm verify
├── docs/                       # get-started · foundations · primitives · atoms
└── workspace/
    ├── packages/paper-ui/      # @studio-baeks/paper-ui — 단일 npm 패키지
    │   ├── scripts/            # build-types.mjs — entry 마다 d.ts 하나
    │   └── src/                # 아래 src 구조(생성)
    ├── app/                    # 사이트 · Playground · 문서 · 데모 — routes.tsx + site/ = 사이트 셸 · compositions/ = 앱의 조각 · vite/paper-docs.ts 가 docs/ 를 서빙
    ├── fixtures/harness/       # @paper-ui/harness — e2e 가 패키지를 소비자처럼 마운트하는 페이지(`window.__paper.sourceVars`)
    ├── eslint-rules/           # lint plugin `paper` — manifest.js 가 경계와 예외의 유일한 선언, structural.js 가 구조 값의 유일한 정의
    ├── scripts/                # 레포 검사 (docs-sync · browser-baseline · check-contracts)
    └── tests/                  # Playwright e2e — foundations · primitives · atoms · app · install, support/
```

패키지와 앱의 `src` 구조는 생성됩니다.

<!-- generated:src-tree -->
<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->
```text
workspace/packages/paper-ui/src/
  index.ts                     entry `.` — 컴포넌트 · hook · Provider (`"use client"`)
  inventory.ts                 이름 · 분류 · 순서의 정본 — import가 없고 inventory.test가 export와 대조합니다
  atoms/                       Atom 13개 — 한 가지 역할의 컨트롤, 모두 Primitive 위에 섭니다
    button-base.tsx            Button과 IconButton의 몸 하나 — 내부 모듈
    input-control.ts           입력 틀 셋의 FormField 관계 · 키보드 포커스 · 틀의 속성 — 내부 모듈
    recipes/                   Atom이 함께 쓰는 형태와 상태 조각(input-frame · selection-control) — 색은 없고, 색은 primitives/paint/recipes.css.ts에서 옵니다
  internal/                    패키지 안쪽 도구 — 밖으로 나가지 않습니다
    direction.ts               `directionOf` · `localeDirection`
    errors.ts                  `paperError`
    joinClass.ts               class 문자열 잇기
    locale.ts                  locale과 messages를 읽는 context
    measure.ts                 `measureSpace` · `useMeasuredSpace` — gap 단계를 쓰이는 자리의 픽셀로 잽니다
    messages.ts                Atom 문구 목록
    refs.ts                    `mergeRefs` · `useMergedRef`
    render-target.ts           `as`와 disabled의 유일한 투영 `targetProps`
    shape.ts                   `controlGeometry` — 크기가 있는 모든 Atom의 단일 진입점
    useControllableState.ts    제어 · 비제어 상태를 한 hook으로
    aria/                      React Aria 어댑터 — `@react-aria/*`를 import하는 유일한 자리
  primitives/                  두 차수 — 1차 바탕(Box · Text · Icon · polymorphic · composition)과 2차 Box + 능력 하나
    bare-button.css.ts         부품이 쓰는 button reset
    index.ts                   유일한 배럴 — primitives/orders.test.ts가 폴더 사이의 길을 지킵니다
    a11y/                      1차 A11y — FocusScope · VisuallyHidden · Portal · LiveRegion
    drag/                      2차 Drag — Draggable · Droppable
    field/                     2차 Field — FormField와 입력 연결
    float/                     2차 Float — Floating과 중첩 elevation(nestElevation)
    focus/                     2차 Focus — RovingFocus
    layout/                    2차 Layout — Stack · Inline · Grid, 배치만 맡습니다
    paint/                     2차 Paint — Surface · Paint와 색 규칙이 사는 곳(recipes.css.ts는 내부)
    press/                     2차 Press — Pressable · usePressable, 색을 갖지 않습니다
    select/                    2차 Select — Selectable · SelectableGroup, 상태와 aria만 맡습니다
  resolvers/                   공유 축 이름 → class (styles/의 typed map 인덱싱)
  styles/                      class의 실체 — resolvers를 import하지 않습니다
    color.css.ts               면 · 잉크 · accent × variant
    elevation.css.ts           높이 — position · z · 그림자
    global.css.ts              entry `/styles.css`
    motion.css.ts              presence · loop · reduced-motion 정책
    space.css.ts               간격
    states.css.ts              tint 변수의 `@property` 등록 · 포커스 링 baseline
    theme.css.ts               문서 바탕 · 스코프 잉크
    typography.css.ts          Text 역할 · mono · 숫자 · control preset · fontSize class
  theme/                       테마 — 모드(light · dark)를 고르는 일
    boot.ts                    entry `/theme-boot`
    context.ts                 모드와 제어의 context(`useTheme`)
    engine.ts                  순수 규칙 — React와 CSS가 없습니다
    PaperProvider.tsx          Provider
    scope.ts                   스코프 모드(`useThemeScope` · `usePortalScope`)
    source-carry.ts            Portal이 옮기는 열린 자리의 원본 덮어쓰기
    store.ts                   문서당 저장소
  tokens/                      값의 유일한 정의 위치 — SOURCE → VALUES → 역할. *-recipes는 역할을 조합한 것입니다
    color-modes.ts             모드 어휘
    index.ts                   나머지 패키지가 읽는 유일한 문 — 역할 · 어휘 · 조합뿐이고 barrel.test가 지킵니다
    layers.css.ts              cascade layer의 이름과 `layered()`
    overrides.ts               `sourceVars` — 원본 경로로 덮어쓰는 변수 이름
    public.ts                  entry `/tokens`
    resolve-dp.ts              CSS 길이식을 dp로 푸는 도구 — 테스트와 docs 생성기가 쓰고, 공개하지 않습니다
    state-recipes.ts           상태의 모습을 담은 plain style 조각(`focusRing` · `stateStyle` · `linkStyle`)
    state.ts                   상태 · 값 · 표식 attribute의 이름(`stateAttributes` · `stateSelector`)
    typography-recipes.ts      글자 규칙 함수
    variables.css.ts           그 변수를 스타일시트로 배출합니다
    variables.ts               모든 CSS 변수를 데이터로 모읍니다
    vocabulary.ts              어휘 짝 — 축마다 상수 하나와 타입 하나
    inspect/                   inspector가 시스템마다 읽는 원본의 읽기 전용 재수출 — 패키지와 배포본에 들지 않습니다
workspace/app/src/
  compositions/                앱의 조각 — 패키지가 싣지 않는 것을 시스템의 부품으로 조합합니다
  docs/                        docs 본문 파싱과 링크 해석, Prose 렌더링
    generated/                 문서의 생성 블록 — `pnpm docs:sync`가 원본에서 다시 씁니다
  pages/                       라우트 페이지 — Home · Docs · demo/
    demo/                      Demo 화면 — 이슈 트래커, Primitive · Atom을 실제 조합 안에서 봅니다
  playground/                  Playground — Overview · 사이드바 · 상세와 foundations/ · registry/
    foundations/               Foundations 페이지 — 시스템마다 원본 → 역할 → 조합을 그립니다
    registry/                  항목 spec과 코드 찍기(printJsx) — 항목마다 entries/ 하나
      entries/                 항목마다 Spec 하나 (`<slug>.tsx`)
  site/                        사이트 셸 — SiteLayout · 헤더 · 사이드바 · 사이트 지도(site-map.ts)
```
<!-- /generated:src-tree -->

pnpm 명령은 `workspace/` 에서 실행한다. `core`/`web` 분리는 일부러 없다 — 존재하지
않는 두 번째 medium 을 위한 자리는 만들지 않는다. 작업 로그(`logs.md`)는 이 기계에만
둔다 — `.gitignore`에 있고 추적하지 않는다.

패키지 entry 는 넷이고, 이름 하나는 한 entry 에서만 나간다 — `.`(컴포넌트 · hook · Provider ·
prop 타입, `"use client"`), `/tokens`(React · CSS 없는 값과 어휘), `/theme-boot`(React · CSS 없는 부팅 스크립트 —
`themeBootScript` · `THEME_STORAGE_KEY` · `THEME_ATTRIBUTE`), `/styles.css`(전역 스타일시트).
스타일이 들어오는 길은 `/styles.css` 하나다 — index.ts · Provider · 컴포넌트 stylesheet 는 전역 CSS 를
import 하지 않는다. 앱은 패키지를 이 exports 로만 쓰고(Foundations inspector 는 자기 시스템의 `@paper-ui/inspect/<시스템>` 하나를 더 읽습니다 — 이 alias 는 앱의 Vite 와 tsconfig 에만 있습니다),
workspace 에서는 `paper-ui-source` export 조건(Vite `resolve.conditions` · tsconfig `customConditions`)이
같은 exports 를 소스로 푼다.

패키지 CSS 는 모두 cascade layer `pui` 안에 든다 — `pui.reset < pui.theme < pui.base < pui.utilities <
pui.components`, 뒤의 레이어가 특정도와 무관하게 이긴다. 레이어 이름과 `layered(name)` wrapper 는
`tokens/layers.css.ts` 하나가 정의하고, global.css.ts 가 그것을 맨 먼저 import 해 dist/paper-ui.css 는 레이어
선언으로 시작한다. 파일마다 갈 레이어가 정해져 있다: tokens/variables.css.ts 의 변수는 theme, box-sizing 과 body margin 과 부품의 button reset(`bareButton`)은
reset, body 의 면과 글자(body 역할 전체) · 스코프 잉크 · 포커스 링 baseline(`states.css.ts`) · 전환 중 transition hold 는 base, 면 · 잉크 · 간격 · 높이 지도(color.css 의 fillClass · inkClass, space.css, elevation.css), motion.css 의 presence · loop 와
typography.css 의 class 전부(Text 역할 · mono · 숫자 · control preset · fontSize 탈출구)는 utilities, accent × variant 지도(color.css 의 accentVariantClass)와 primitives · atoms, 그리고 모든 요소에 거는 reduced-motion 정책(motion.css)은 components. `@keyframes` 와 `@property` 만 레이어 밖에 선다. 앱 CSS 는 레이어 밖에
두므로 앱 className 이 로드 순서와 무관하게 패키지를 이긴다.

배포본은 ESM 전용이고 peer 는 react · react-dom `^18.2.0 || ^19.0.0` 이다. 타입은 `tsconfig.build.json`(테스트 ·
inspector 제외)으로 낸 선언을 `scripts/build-types.mjs` 가 entry 마다 한 파일(dist/index.d.ts · dist/tokens.d.ts)로
묶는다. `pnpm --filter @studio-baeks/paper-ui check:package` 가 publint(--strict)와 attw(esm-only)로 배포 형태를
검사한다. 지원 브라우저 하한은 패키지 package.json 의 `browserslist` 한 곳에 둔다(Chrome·Edge 125 · Firefox 121 ·
Safari 16.4). Vite build.target · cssTarget 이 거기서 나오고, CSS 기능을 새로 쓰면 `scripts/browser-baseline.mjs`
표에 행을 더한다 — required 는 하한이 지원해야 하고, enhancement 는 하한에서 움직임만 빠진다.

문서(`docs/`)는 복사 없이 Vite 가 소스에서 곧바로 서빙합니다 — `app/vite/paper-docs.ts` 가 `virtual:paper-docs` 로 목록을, `@docs` alias 가 본문을 줍니다. 모든 문서의 첫 줄은 `# 제목` 이고 그 줄이 사이드바와 페이지의 제목입니다(이 규칙의 주인은 `app/src/docs/parse.ts`). 순서와 라벨은 `app/src/site/site-map.ts` 의 `DOC_GROUPS` 가 정합니다(Vite 플러그인이 Node 에서 읽을 수 있게 정의는 import 없는 `site-core.ts` 에 둡니다). 목록에 없는 문서 · 파일 없는 항목 · 제목 없는 문서는 dev 오버레이와 `vite build` 가 실패로 막고, `docs/` 를 고치면 dev 에서 재시작 없이 다시 불러옵니다.

---

## 색 — OKLCH Palette에서 의미 시스템까지

색은 한 방향으로 흐릅니다.

```
OKLCH Palette source → HEX Palette Token generation → semantic selection table → real use
     palette.ts              color-ladder.ts           colors.ts (COLOR_SELECTION)   CSS vars / UI
```

원본 소유 파일은 이 표 하나가 정합니다.

| 원본 | 소유 파일 |
|---|---|
| OKLCH neutral·accent anchor, `ACCENT_IDENTITIES`, `NEUTRAL_BETWEEN`, `alpha05`~`alpha95` | `tokens/palette.ts` |
| OKLCH → HEX 생성 (순수 계산, palette를 import하지 않음) | `tokens/color-ladder.ts` |
| 테마별 역할 → Palette 경로 (`COLOR_SELECTION`) | `tokens/colors.ts` |
| 그림자 색 · 면 · 잉크 · accent 조합 | `tokens/colors.ts`, `tokens/color-recipes.ts` |
| 글자 수치 (`TYPOGRAPHY_SOURCE`: fontSize · leading · weight · tracking …) | `tokens/typography.ts` |
| 길이 scale · radius · stroke · 컨트롤 높이 · anatomy (`SHAPE_SOURCE`) | `tokens/shape.ts` |
| 거리 · blur · spread (그림자 기하) · elevation tier | `tokens/layout.ts` (`LAYOUT_SOURCE`) |
| 시간 · 곡선 · 반복 (`DURATION` · `EASING` · `LOOP`) | `tokens/motion.ts` |

- palette.ts는 color-ladder.ts의 순수 함수를 호출해 완성된 coordinates와 HEX Palette Token을 조립해 export합니다. Palette 값은 테마와 무관하며, semantic layer가 light/dark 역할에 맞는 step을 선택합니다. accent hue·chroma와 amber의 옅은 끝 보정은 `ACCENT_IDENTITIES`, 중립의 중간 단계는 `NEUTRAL_BETWEEN` 데이터입니다.
- color-ladder.ts는 palette.ts를 import하지 않는 순수 계산 모듈입니다. 입력받은 좌표·단계에 대해 보간·gamut-map·HEX 인코딩을 수행하며 semantic role 이름을 두지 않습니다.
- colors.ts의 `COLOR_SELECTION`이 테마별로 역할마다 Palette 경로 하나를 고르는 유일한 표이고, `COLOR_VALUES`(_DARK)는 그 표에서 파생합니다. semantic leaf는 생성된 Palette Token만 선택하며 다른 semantic leaf, 직접 입력한 HEX, color math를 참조하지 않습니다. 상태색의 tone은 `ACCENT_TONE_STEPS`·`PRIMARY_TONE_STEPS`가 고르고, 표를 벗어나는 예외(light warning)는 pigment 이름이 아니라 status 이름으로 `STATUS_EXCEPTIONS`에 적습니다.
- tokens/variables.ts는 semantic tree를 CSS variable 묶음으로 만들고 tokens/variables.css.ts가 그것을 내보냅니다. Package consumers는 tokens.color var 참조만 쓰고, 토큰 층(`tokens/`)만 원본 값을 읽습니다. Playground Foundations inspector는 자기 시스템 하나를 `@paper-ui/inspect/<시스템>`(`tokens/inspect/<시스템>.ts`의 읽기 전용 재수출)으로 읽어 원본을 그대로 보여줍니다 — 표시용이지 스타일용이 아닙니다. 원본에서 읽은 값은 글자로 찍거나 kit의 표시 부품(Swatch · Chip · StepGrid · Meter · Travel · Curve · FontSample)을 거쳐서만 화면에 닿고, `style` · `className` · 패키지 컴포넌트의 prop(children · title · aria-* 제외)에는 닿지 않습니다. 클래스와 컴포넌트 prop은 `/tokens` 어휘나 손으로 적은 표본 지도에서 옵니다. 이 경계는 `paper/source-isolation`이 지킵니다.

semantic color는 surface·ink·border·accent·interaction·overlay·shadow 역할로 나뉩니다.

| system | API | roles |
|---|---|---|
| Surface | `bg.<level>` | raised · canvas · sunken |
| Control | `control.<role>` | track |
| Border | `border.<level>` | base · strong · hover |
| Ink | `ink.<level>` | primary · secondary · tertiary |
| Accent | `accent.<name>.<tone>` | primary · info · success · warning · error × solid · wash · ink · soft · subtle |
| Interaction | `interaction.<state>` | bgHover (onSurface·onPrimarySolid·onAccentSolid) · selected · active · focus · link |
| Overlay | `overlay.<role>` | scrim |
| Shadow | `shadow.<depth>` | floating · lifted |
| Opacity | `opacity.<role>` | disabled (alpha 50) · subdued (alpha 70) — 테마 불변, `COLOR_VALUES` 밖. Atom의 비활성은 `stateStyle.disabled`가 이 역할을 읽고 숫자는 쓰지 않습니다 |

Accent status는 palette와 분리합니다: info→blue, success→green, warning→amber, error→red. Accent는 같은 다섯 role을 공유합니다. `solid`는 채움, `wash`는 채움 위 글자, `ink`는 soft·hairline·ghost와 의미색 글자, `soft`는 soft surface, `subtle`은 muted foreground에 씁니다. Text·Icon의 `ink`(`INKS`)는 Color 이름 그대로 `primary · secondary · tertiary`, 상태 넷, `inherit`입니다.

focus ring 색은 `interaction.focus`에, 링크 색은 `interaction.link`에 둡니다. focus는 상호작용 상태이고 링크는 눌러서 이동한다는 표시이며, 둘 다 색은 Palette Token에서 옵니다. 링크는 info 상태색과 같은 blue.700/300을 고르지만 뜻이 다른 별도 역할입니다. 링 두께·offset은 색이 아닌 geometry이므로 `shape.focus.width`와 `shape.focus.offset`에 둡니다. Scrim은 `overlay.scrim`, 그림자 색(shadow colour)은 깊이로 이름 붙인 `shadow.floating`과 `shadow.lifted`에 두고, 거리·blur·spread는 Layout(`LAYOUT_SOURCE.shadow`)의 기하로 둡니다. "overlay"는 떠 있는 층(Floating · elevation `overlay` · `overlay.scrim`)만 가리키고, 면 위의 상태 wash는 tint입니다. Semantic Form hover glow는 사용하지 않습니다.

`interaction`의 상태 역할은 뜻이 다릅니다. `active`는 중립 항목이 눌리는 동안의 면, `selected`는 중립 항목이 선택된 면, `focus`는 입력이 향하는 자리(키보드 포커스 링과 drop 대상의 경계)입니다.

**대비 계약.** 글자는 4.5:1, 컨트롤과 그 상태 표식(선택 표식의 테 · Switch 트랙의 테 · 켜진 면과 그 위의 표식 · 포커스 링 · 오류 테)은 3:1입니다. 꺼진 Checkbox · Radio와 꺼진 Switch 트랙의 테는 `ink.tertiary`(`markProfile.rest.ring`, Switch는 `strokeRing`)입니다 — 3:1을 지키는 가장 옅은 기존 역할이고 컨트롤 전용 경계색을 만들지 않습니다. 입력 경계(`border.base`)와 옅은 selected 면은 문서화된 예외이고 `prefers-contrast: more`가 보완합니다. forced colors에서는 선택 표식 · Spinner · selected 면만 `forced-color-adjust: none`으로 빼 `SYSTEM_COLORS`로 직접 그립니다. 값은 `tokens/color.test.ts`가, 모습은 `tests/atoms/forced-colors.spec.ts`가 지킵니다([docs/foundations/color.md](docs/foundations/color.md#대비-계약)).

**테마**는 모드(light · dark) 한 벌 — 색 역할 전체와 Layout의 그림자 기하 — 을 고르는 일이고, `<html>`이나 요소의 `data-pui-theme` 속성이 정합니다. `<html>`에 속성이 없으면 OS(`prefers-color-scheme`)가 정하고, 스타일시트와 엔진(`readRootMode`)이 같은 규칙을 씁니다. 스코프는 자기 요소에 그 모드의 고유 역할을 걸고 상속 잉크(`ink.primary`)를 다시 선언하며, 지면 역할(`GROUND_ROLES`: 포커스 링 색 · 그림자 색 · 그림자 기하)은 스코프의 자식부터 바뀝니다. `prefers-contrast: more`는 `COLOR_CONTRAST_MORE`(경계 셋과 `ink.tertiary`)를 같은 스코프에서 한 단 올립니다. 면 사다리는 라이트가 raised > canvas > sunken, 다크는 sunken = canvas입니다(`SURFACE_ORDER`).

하위 트리의 테마는 Surface의 `theme`(light · dark · inverse) 축입니다(Stack · Inline · Grid 위에서는 `<Surface as={Stack} theme=…>`). 테마가 있는 Surface는 fill을 주지 않아도 그 모드의 canvas를 깔고, 안쪽 글자·Icon·Pressable·Floating 내용은 그 모드의 잉크를 받으며, 자기 포커스 링과 그림자는 바깥 지면의 모드를 따릅니다. 테마 속성을 `<html>` 아래에서 쓰는 길은 `theme/scope.ts`(Surface의 `useThemeScope`, Portal 루트의 `usePortalScope`) 하나뿐입니다. 테마 엔진(`src/theme/`)은 이렇게 나뉩니다.

- `engine.ts` — 순수 규칙(`resolvePreference` · `resolveSurfaceTheme` · `invertMode`), `<html>` 읽기(`readRootMode` · `subscribeRootMode`), 전환 동안의 `holdTransitions`, 부팅 스크립트(`bootTheme` · `themeBootScript`)와 저장 키 `THEME_STORAGE_KEY`(`pui-theme`). React도 CSS도 없습니다.
- `store.ts` — 문서당 하나의 저장소(`getThemeStore`). 선택(light · dark · system)을 들고 `<html>`에 모드를 쓰며, 쓰기마다 전환을 즉시로 묶습니다. `<html>` 속성이 정본이라 밖에서 쓴 값은 읽을 뿐 되돌리지 않습니다. Provider가 몇 개든 이 저장소 하나에 붙고, 마지막 Provider가 사라지면 붙기 전의 속성으로 돌아갑니다.
- `context.ts` · `PaperProvider.tsx` — Provider는 저장소를 React에 묶을 뿐 자기 상태도 DOM wrapper도 CSS import도 없습니다. 언어(`locale` · `messages`)는 `internal/locale.ts`의 context에 담고 `<html lang>` · `<html dir>`은 `locale`을 줄 때만 씁니다. `useResolvedTheme`은 Surface 테마 → Provider → `<html>`/OS 순으로 읽어 Provider 없이도 참이고, `useTheme`은 Provider 안에서만 씁니다.
- `boot.ts` — entry `/theme-boot`. 앱은 `<head>` 맨 앞에 `themeBootScript`를 넣어 첫 화면 전에 모드를 정하고, 같은 옵션을 Provider에 넘깁니다(`app/src/theme.ts`).

색을 바꾸면 [docs/foundations/color.md](docs/foundations/color.md)와 Playground Foundations › Color를 함께 확인합니다. API 경로와 source 규칙을 동시에 갱신합니다.

## 형태 — Shape와 Layout

시스템은 `Color → Typography → Shape → Layout → Motion → Primitives`로 쌓이고, 각 층은 자기보다 위의 층만 참조합니다. **Shape은 요소 하나의 형태**(곡률·선·포커스 링·크기·안쪽 여백), **Layout은 요소 사이의 관계**(형제 간격·gutter·container·breakpoint·elevation)입니다. 경계는 "빈 캔버스에 그 요소 하나만 놓아도 남는가"로 가릅니다. 정본은 [docs/foundations/shape.md](docs/foundations/shape.md)와 [docs/foundations/layout.md](docs/foundations/layout.md)입니다.

- 숫자는 `SHAPE_SOURCE`·`LAYOUT_SOURCE`에 dp로 한 번만 씁니다. **원본만 CSS 변수로 굽고**, 역할은 원본 변수의 별칭이거나 소비 요소에서 계산되는 calc() 식입니다. 역할에 변수를 따로 만들지 않습니다 — 하위 트리에서 원본 하나를 덮으면 그 위의 역할·recipe가 모두 다시 계산되어야 합니다.
- 길이 scale은 하나입니다: <!-- generated:agents-scale --><!-- 이 블록은 생성됩니다 — pnpm docs:sync -->`xs4 · sm8 · md12 · lg16 · xl24 · 2xl32 · 3xl48`<!-- /generated:agents-scale -->. 안쪽 여백은 `tokens.shape.inset`, 형제 사이·margin·위치 offset은 `tokens.layout.gap`으로 고릅니다. 둘은 같은 단계면 같은 길이입니다. 실행 중에 숫자 픽셀이 필요한 배치 값(Floating의 `offset` · `crossOffset`, Draggable의 `keyboardStep`)도 같은 단계 이름을 받고 `internal/measure`가 쓰이는 자리에서 잽니다. 뷰포트 가장자리에 닿는 popover의 여백은 `layout.gutter`입니다.
- radius는 날만 죽이고 가족마다 한 값입니다: `control` 4 · `selection` 3 · `surface` sm4/md6/lg8 · `full` 999px. Surface radius는 surface를 선택합니다.
- 컨트롤 원본은 <!-- generated:shape-source --><!-- 이 블록은 생성됩니다 — pnpm docs:sync -->높이 사다리(`control.height`: sm 30 · md 32 · lg 36)와 button inset 배율(`control.buttonInsetRatio`: 1.4)이고, `anatomy`는 Badge 높이·inset(`anatomy.badge`)과 inline 점 · spinner 크기(`anatomy.inline`: 0.5em · 1em)입니다.<!-- /generated:shape-source --> input inset = (높이 − 컨트롤 글자 줄)/2 = 7/8/10, button inset = input × 1.4 반올림 = 10/11/14, selection = 높이/2 = 15/16/18, `control.icon` 16/18/20(옆 글자가 아니라 컨트롤 높이를 따릅니다), `control.gap` 8. `internal/shape.ts`의 `controlGeometry`가 크기가 있는 모든 Atom(button · iconButton · field · select · selectArrow · textarea · selection · checkbox · radio · switch · badge · spinner · spinnerInline)의 단일 진입점이고 stylesheet가 자기 사다리를 만들지 않습니다. 컨트롤 안의 Icon은 그 크기를 `IconSizeContext`로 받고(Field의 어도먼트와 지우기·보기 버튼 포함), 명시한 `size`가 이깁니다.
- recipe(`tokens/shape-recipes.ts`)에는 숫자가 없습니다. Switch 트랙 폭 = 컨트롤 높이, 테 = `stroke.emphasis`, 손잡이는 자기 폭만큼 이동. Textarea 한 줄 = 같은 size Field 높이(block 여백 4/5/7)이고 최소 높이는 없이 `rows`(기본 4)가 높이를 정함(90/92/96). Select 화살표는 `control.icon` 크기 Icon(레시피에 따로 둔 값 없음), 입력 inset 자리, 값은 `control.gap` 앞에서 멈춤. Checkbox mark·Radio dot = 선택 상자의 절반(크기별 보정 없음). Badge 높이 20/22/24·inset 6/8/10만 원본 anatomy입니다.
- 선(`stroke.border` 1 · `emphasis` 2)과 포커스 링(`focus.width`·`offset` 2)은 px, `stroke.icon` 1.75는 SVG 단위입니다. 누르는 표식의 최소 크기 `target.min` 24도 px이고, 이에 못 미치는 표식은 `targetReach`(= (min(표식, 24) − 24) / 2)만큼 보이지 않는 hit area를 넓힙니다(Checkbox · Radio · Switch와 Field의 지우기·보기 버튼의 `::before` — 테두리가 있는 상자는 padding box에서 놓이므로 테두리만큼 더 멀리서 시작합니다). 모든 포커스 링은 `focusRing` 하나를 씁니다(색은 `interaction.focus`). 키보드 판정은 `useFocusRing` 하나이고 링은 링 주인(Field · Select는 wrapper, Textarea · Button · Link · Checkbox · Radio · Switch는 자기 자신)이 `[data-focus-visible]`에서 그립니다. 링은 요소 자신의 곡률을 따릅니다 — 전역 `:where(:focus-visible)`(`styles/states.css.ts`)은 링 주인이 없는 요소의 baseline이라 링만 그리고 요소의 모양을 바꾸지 않습니다. 상자 안쪽에 긋는 1px 선은 `strokeRing(color)`(`tokens/shape-recipes.ts`)가 `box-shadow` 값 하나로 만들고, elevation 말고 `box-shadow`를 쓰는 유일한 자리입니다.
- Icon 크기 이름은 Text 역할 이름의 부분집합이고 타입으로 묶여 있습니다: label 14 · caption 16 · body 18 · subheading 20. Box의 named size는 `dimension.width/height`(xs~xl), 읽기 폭 `measure`, Layout의 `container`를 가족 접두어(`md` · `measure.md` · `container.content`)와 키워드(`full · fit · min-content · max-content`)로 고르고 모두 class가 됩니다. 이름이 아닌 CSS 길이만 inline입니다.
- elevation은 <!-- generated:agents-elevation --><!-- 이 블록은 생성됩니다 — pnpm docs:sync -->`lifted 10 · sticky 20 · overlay 30 · modal 40 · toast 50`<!-- /generated:agents-elevation --> 다섯 tier(지면은 tier가 아닙니다)이고, **tier 하나가 position · z · 그림자를 한 단위로 정합니다.** position은 lifted·overlay·modal·toast가 relative, sticky가 sticky입니다. 그림자 깊이는 lifted(lifted tier)·floating(overlay·modal·toast) 둘뿐, sticky는 그림자가 없습니다. 기하는 Layout(모드별 원본 변수 `--pui-layout-shadow-<depth>-<i>`), 색은 Color의 shadow colour이고, 그림자는 쓰이는 요소에서 둘을 이어 붙여 조립합니다(`castShadow`). 단위는 `tokens/elevation-recipes.ts`(`elevationStack` · `elevationCast` · `elevationStyle`)가 한 곳에서 만들고, `elevation` class 지도(`styles/elevation.css.ts`, `.` entry)와 Surface의 `elevation` prop, Floating, Switch 손잡이가 그것을 씁니다 — `zIndex`와 깊이 그림자는 이 레시피를 spread한 자리 밖에 쓰지 않습니다. tier 사이는 10이고 같은 tier 안의 한 걸음(`nudge` 1)이 중첩을 만듭니다: 같은 tier에 중첩된 Floating은 `ELEVATION_NEST_LIMIT`(9)번까지 한 걸음씩 오르고, 더 높은 tier 위에서는 그 tier를 따릅니다. 흐름 안의 견본과 목업은 `isolation: isolate` 무대에 두고, 페이지 헤더(sticky tier) 아래의 sticky 레일도 같은 tier라 DOM 순서로 헤더를 덮으므로 `isolation: isolate` 프레임 안에 둡니다.
- breakpoint(30/48/64/80em = 480/768/1024/1280)는 미디어 쿼리가 변수를 못 읽어 값입니다. 길이는 rem, 미디어 쿼리는 em, 선·포커스 링은 px입니다. `layout.section`(start · end)은 뷰포트 높이를 따라 자라는 선언된 유동 단계로, Typography의 `hero`와 함께 고정 사다리의 예외는 둘뿐입니다. `color.control.track`은 Switch 트랙과 진행 막대 홈에 씁니다.
- gap 가족(`gap · rowGap · columnGap`)은 자식을 늘어놓는 Stack·Inline·Grid가 같은 지도에서 고르고 Box에는 없습니다. 세 컴포넌트는 정렬 어휘 하나(`ALIGNS · JUSTIFIES · JUSTIFY_ITEMS`)를 나눠 쓰고, 기본값은 root가 갖고 class는 prop을 줄 때만 붙습니다. Grid의 `justify`는 track 분배이고 칸 안의 정렬은 `justifyItems`입니다.
- Select는 native select와 장식 Icon을 wrapper 안에 둡니다. ref와 폼 속성은 native select, className/style/data-testid는 보이는 wrapper에 전달합니다. `status` · `fill`은 Field와 같은 축이고 `multiple`은 없습니다. 화살표는 semantic ink를 사용합니다.

상위 화면 조합과 그 prop 축은 현재 패키지 API에 포함하지 않습니다. 실제 제품에서 반복되는 요구가 생기면 공통 책임과 축을 먼저 설계합니다.

---

## 움직임 — Motion

Motion은 가장 마지막 층이라 자기 길이를 갖지 않습니다. 시간(`DURATION`)과 곡선(`EASING`), 반복(`LOOP`)이 원본이고, 읽는 곳은 그 소유 파일과 Foundations inspector(`@paper-ui/inspect/motion`)뿐입니다. `styles/motion.css.ts`는 원본이 아니라 배럴의 합성 셋(`MOTION` · `MOTION_LOOPS` · `MOTION_REDUCED`)으로만 읽습니다. 공개 트리는 `tokens.motion.role` 하나입니다. 정본은 [docs/foundations/motion.md](docs/foundations/motion.md)입니다.

- 역할은 `MOTION_ROLES`(`press · hover · state · enter · exit · theme`)이고 포커스에는 역할이 없습니다. 컴포넌트는 역할을 고르고 `transition(role, …속성)`으로 transition 문자열을 조립합니다. 원본 duration·easing을 stylesheet에서 직접 쓰지 않고, 역할마다 쓰는 곳은 `MOTION_CONSUMERS`가 한 곳에서 정합니다.
- 변위는 Shape·Layout 역할을 가리킵니다: `press`는 `shape.stroke.border`, `enter`는 `layout.gap.xs`(scale 0.99는 Motion의 값).
- 조합은 `transition()`(`/tokens`)과 class 지도 `presence`(`surface` · `scrim`, `data-presence`의 `entering` · `exiting`에 `enter` · `exit` 역할 — 속성은 Floating이 달고 퇴장이 끝날 때까지 mount해 둡니다)·`loop`(`spin` · `pulse`)입니다. 두 지도는 `.` entry의 class 지도입니다. keyframe은 `styles/motion.css.ts`에만 있습니다.
- reduced-motion: 전이와 유한한 animation은 `::before` · `::after`까지 즉시 끝나고(components 레이어, `!important`), 반복은 `LOOP_REDUCED`가 정한 맥박으로 바뀝니다(utilities 레이어, `!important` — 중요 선언은 레이어 순서가 뒤집혀 앞선 레이어가 이기므로 반복이 정책에 지지 않습니다). 전환 중 hold(`data-pui-theme-swap`)는 base에 남습니다.
- Atom의 전이는 속성 묶음마다 역할을 고릅니다: Button · IconButton은 hover tint(`--pui-state-tint`)와 테두리 `hover`, 배경색·글자 `state`, 눌림 `press`; Field 래퍼 · Select · Textarea · Checkbox · Radio · Switch는 `state`; Field의 지우기·비밀번호 버튼은 `hover`.
- Playground Foundations › Motion은 원본 → 역할(견본은 역할을 쓰는 실제 컴포넌트와 `presence` · `loop` class) → 조합 순서이고, 역할 행은 `MOTION_ROLES`에서 파생합니다.

## 상태 — State recipe

hover · 눌림 · 선택 · 비활성 · 키보드 포커스의 모습은 `tokens/state-recipes.ts`가 plain 객체 조각으로 정하고 `/tokens`로 내보냅니다 — `focusRing` · `stateStyle`(`focusVisible` · `disabled` · `disabledCursor` · `press` · `tinted` · `item` · `field` · `dropTarget` · `hoverUnderline`) · `linkStyle` · `STATE_TINT`. selector는 모두 `tokens/state.ts`의 이름에서 만들어지고, 조각은 transition을 정하지 않습니다(요소가 `transition()`으로 묶습니다). 면 위에 얹는 tint는 등록된 변수 `--pui-state-tint`(`STATE_TINT_PROPERTY`) 하나이고, 우선순위는 비활성 > 눌림(`:active` · `data-active`) > 선택(`data-selected` · `aria-current`) > hover입니다. hover는 가장 약해 selector에 특정도를 더하지 않고, 포인터가 올라갈 수 있는 환경과 막히지 않은 대상에서만 뜹니다. 색은 `tokens/color-recipes.ts`의 profile(`accentProfile` · `outlinedControlProfile` · `itemProfile` · `markProfile` · `markForcedProfile`)에서 옵니다 — 데이터만 있고 selector는 없습니다. 입력의 틀(Field · Select의 wrapper, Textarea 자신)은 `inputFrame`(geometry · `focusVisible` · `disabled`)에 색 `fieldPaint`(`field`)와 Surface fill을 얹고, `data-status` · `data-invalid` · `data-disabled` · `data-focus-visible`이 상태를 말합니다.

## 글자

Typography는 원본 수치인 **Palette**, 이를 조합한 **글자 역할**, 실제 반복되는 완성 스타일만 담는 **Control preset**으로 나뉜다. 각 스타일은 Palette의 size · weight · leading · tracking을 참조하므로 컴포넌트가 `"0.875rem"` 같은 raw 값을 박지 않는다. 정본은 [docs/foundations/typography.md](docs/foundations/typography.md)다. Text variant는 제목 위계와 텍스트 역할을 조합한다:

<!-- generated:agents-ladder -->
<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->
`hero 36–60 유동 · display 32 · title 24 · heading 20 · subheading 16 · body 14 · caption 13 · label 12`, 컨트롤 글자는 preset으로 `13 · 13 · 14`.
<!-- /generated:agents-ladder -->

서체는 위계가 아니라 **family 축**이다 — `Text` 의 `family`(sans 기본 · mono)가 어느
variant 에도 교차한다. mono 는 등폭·전용 tracking·크기 배율을 적용하고 어디서든 줄을 끊는다.

- **body 14px** anchor — 복잡한 웹앱의 표준 밀도. 자주 쓰지 않는 16px 본문과 body size variant는
  두지 않는다. 조작 문구는 컴포넌트 간 중복을 제거한 `typography.preset`, 보조 정보는 `caption`, 짧은 이름은 `label`로 나눈다.
- **제목 위계** — `hero`는 랜딩 헤드라인, `display` 는 큰 제목, `title`은 페이지 제목, `heading`과 `subheading`은 섹션 제목용이다. HTML 태그는 `as`로 별도 지정한다.
- **leading은 px 고정값** — Text: `display 32/40 · title 24/32 · heading 20/28 · subheading 16/24 · body 14/20 · caption 13/16 · label 12/16`. Control: `sm 13/16 · md 13/16 · lg 14/16`. **선언된 예외는 `hero` 하나다** — 크기는 뷰포트 폭을 따라 자라는 `clamp(2.25rem, 6vw, 3.75rem)`, 행간은 단위 없는 1.04.
- **weight 는 variant 와 직교한 별도 축** — `regular 400 · normal 450 · medium 500 ·
  semibold 600 · strong 650 · bold 700`. hero·display·title 700, heading·subheading·label 600,
  body 500, caption 400. 버튼은 medium(solid는 strong 650), 입력값은 normal 450이다(`tokens.typography.palette.weight.*`). preset의 굵기 이름은 Palette와 같다 — `button.medium`은 500, `button.strong`은 650이다. 앱은 Palette를 직접 읽지 않고 문장 속 강조를 `emphasisRule('regular' | 'medium' | 'semibold' | 'bold')`로 고른다.
- **역할을 적용하는 단위는 `tokens/typography-recipes.ts` 하나** — 컴포넌트는 `Text`, 앱 stylesheet는 `typographyRule` · `monoRule` · `codeRule`(`inline` · `compact` · `block`) · `presetRule` · `emphasisRule`(`/tokens`)로 같은 선언을 가져온다. body 요소는 body 역할 전체(굵기 500과 줄바꿈 포함)를 받아 Text 밖의 글자도 같은 글자로 그려진다.
- **줄바꿈은 서체가 정한다** — sans 는 `keep-all` + `break-word`(한글은 어절 사이에서만), mono 는 어디서든 끊는다(`anywhere`). 문장 속 코드 조각(`codeRule`의 `inline` · `compact`)은 둘러싼 글자의 줄바꿈을 따르고, 코드 블록만 mono 로 끊는다. Button · Badge preset은 `white-space: nowrap`까지 담아 한 줄 정책을 소유하고, Field · Textarea는 값이 줄을 정한다. 앱은 단어를 끊는 규칙(`word-break` · `overflow-wrap`)을 따로 두지 않는다.
- **fontSize 탈출구는 하나** — `label · caption · body`(`CONTROL_FONT_SIZES`)만 받고, 크기만 바꾸며 행간과 geometry는 preset에 남는다. Field 입력값은 preset의 `inputLeading` 20 줄상자에 앉고, Shape의 inset 식은 글자 줄 16을 읽는다. Text는 `numeric`으로 숫자 글리프만 `tabular-nums`로 맞춘다.
- **서체** — Pretendard Variable 은 필수다. 굵기 사다리 400·450·500·600·650·700 이 그것을 전제하고, 없으면
  시스템 폰트가 가까운 굵기로 접힌다(기하는 그대로). Pretendard 를 맨 앞에(라틴·한글을 한 몸으로 그려 굵기가 균형), `-apple-system`
  은 fallback. `family="mono"` 는 코드·토큰·식별자 같은 기술적 자리에만 — 숫자를 무조건
  등폭으로 두지 않는다. 데이터 표의 숫자 열은 sans 그대로 `tabular-nums` 로 자리만 맞춘다.
  폰트 스타일시트 주소(Pretendard · D2Coding, 버전 고정)의 정본은 `FONT_STYLESHEETS`(`tokens/typography.ts`, `/tokens`)이고,
  [install.md](docs/get-started/install.md#폰트) 의 스니펫과 `app/index.html` 이 그 두 줄을 그대로 쓴다 — `scripts/docs-sync.test.mjs` 가 둘을 정본과 대조한다.
- **label 은 sentence-case semibold** — mono·uppercase 아님.

---

## 앱 — 사이트 셸과 조합

사이트(`app/src`)는 패키지 위의 조합 층입니다. 패키지는 Primitive와 Atom에서 멈추고, 화면의 틀과 페이지와 제품의 조각은 앱이 가집니다.

- **라우트 표는 하나입니다.** `routes.tsx`가 `createBrowserRouter`(basename `BASE_URL`)에 들어가는 라우트 객체를 정하고, 모든 페이지는 layout route `site/SiteLayout.tsx` 아래에 섭니다. 페이지는 lazy이고 셸의 Suspense 안에서 불립니다.
- **셸이 소유하는 것은 페이지가 다시 그리지 않습니다.** 본문으로 건너뛰기 링크 · header · 사이드바 · 유일한 `<main id="main" tabIndex={-1}>` · header 아래에 뜨는 로딩 표시(`불러오는 중…`) · 이동 때의 스크롤(`ScrollRestoration`: 새 페이지는 맨 위, 앵커는 header 아래) · 탭 제목(`<페이지> — paper-ui`, 홈은 `paper-ui`) · 페이지의 틀과 가장자리.
- **`SiteHandle`.** 라우트의 `handle`이 셸에 무엇을 시킬지 말합니다 — `{ title?, chrome?: 'site' | 'none', sidebar?: 'docs' | 'playground', frame?: 'content' | 'full' }`. 필드마다 가장 깊은 라우트의 값이 이깁니다(`site/handle.ts`). `title`은 이름이거나, 모르는 이름에 `undefined`를 돌려주는 params의 함수입니다. Home은 `frame: 'full'` — 자기 칼럼(`container.content`)과 푸터를 직접 그리는 유일한 풀블리드 랜딩입니다. `/demo`(`pages/demo/` — `Demo.tsx` · `demo.css.ts` · `layout.ts`)는 `chrome: 'none'` — 셸은 skip link · 로딩 · 제목만 맡고, Demo의 최상위 `<header>`가 banner이며 그 Stack이 `<main id="main" tabIndex={-1}>`입니다. Demo는 이슈 트래커이고 Primitive · Atom을 실제 조합 안에서 확인하는 자리라, 상태 필터는 `SelectableGroup`(`<Button as={SelectableGroup.Item}>`), '완료 포함'은 `<Button as={Selectable}>`, 사이드바 항목은 `<Button as={RouterLink}>`와 `aria-current`, '새 작업'은 `TaskDialog`(modal)입니다. 어느 라우트에서나 main 하나와 banner 하나입니다(`tests/app/shell.spec.ts`가 `tests/support/crawl.ts`로 닿는 모든 라우트를 1440과 390에서 확인합니다).
- **셸의 부품.** `SiteHeader`(브랜드 · `SITE_NAV` · `ThemeToggle` · 버전) · `SidebarNav`(Docs와 Playground가 `docs/DocsNav` · `playground/PlaygroundNav`로 같은 컴포넌트를 씁니다. 목록은 그룹 → 블록 → 섹션 → 링크이고 간격이 구조입니다. 항목은 `<Surface as={RouterLink} hoverable>`이라 현재 항목의 면과 포인터의 tint가 Surface의 것이고 `aria-current`가 현재를 말합니다) · `PageHeader`(경로 · 제목 · 설명) · `SectionHeading`(제목 · 설명, `variant` `heading` | `label`). 면은 Surface입니다.
- **지오메트리는 `site/shell.css.ts` 한 곳입니다.** header 높이(`navHeight` 변수, md 아래에서 0) · 틀(`container.content` 안쪽에 `layout.gutter`) · 사이드바 틀과 본문 칸 · `navLink`(`bar` = header의 링크, `plain` = 자기 표시가 없는 링크) · skip link. 쌓임은 elevation입니다 — header는 `sticky` tier, skip link는 `toast` tier이고 이 파일에 z-index는 없습니다. md 아래(`narrow`)에서는 header가 정적이고 사이드바는 본문 위의 닫힌 disclosure이며 본문 가장자리는 gutter입니다. 앵커는 `html`의 `scroll-padding-top`으로 header 아래에 닿습니다. 요소 수준 전역은 이 파일의 `:root` · `html` · `main:focus`뿐입니다.
- **조합은 `app/src/compositions/`에 둡니다.** 패키지가 싣지 않는 앱의 조각입니다. `icons.tsx`가 앱의 유일한 글리프 세트이고(path를 복사하지 않고 `SearchIcon`처럼 가져다 씁니다. 글자 ☀ ☾ → ←나 ✓는 쓰지 않습니다) `ThemeToggle`은 `IconButton`이며 `Dot`은 `Surface`로 그린 작은 표식입니다. `ProgressBar`(트랙 `control.track` · 채움 accent의 `solid` · `role="progressbar"`와 값) · `Avatar`와 `DayChip`(Paint의 짧은 알약 — 14px Badge가 만들던 상자 그대로) · `Toast`(처음부터 마운트한 `LiveRegion`과 toast tier의 Surface) · `TaskDialog`(`Floating` modal과 `FormField` · `Field`, 제출하면 닫고 `announce`)는 Demo의 조각이고, 시스템에 없는 것을 시스템의 부품으로 조합한 것입니다. 조각은 둘 이상의 제품에서 반복된 뒤에만 패키지로 올립니다.
- **앱 스타일 경로.** 앱이 스타일을 고르는 순서는 하나입니다. (1) Primitive · Atom의 prop. (2) prop이 없는 정적인 값 · 상태 selector · 미디어 쿼리는 scoped `.css.ts`의 `style()` · `styleVariants()`이고, 하위 요소는 `globalStyle(`${scoped} …`)`처럼 scoped class 아래의 selector로 고릅니다. 분기점은 `tokens.layout.breakpoint`, 페이지 틀은 `container.content`와 `layout.gutter`, 읽기 폭은 `shape.measure`에서만 가져옵니다. (3) inline style은 위치 · 퍼센트 · 항목마다 다른 표시 값처럼 실행 중에 정해지는 값에만 쓰고 토큰을 넣는 데 쓰지 않습니다(앱 `.tsx`도 `paper/inline-token`이 막습니다). 이름을 손으로 지은 전역 class는 없습니다(`paper/global-class`) — 요소 수준 전역은 `site/shell.css.ts`의 `:root` · `html` · `main:focus`뿐이고, 마크다운 prose · 홈 · Playground 상세 · Demo의 스타일은 모두 자기 scoped class입니다. 글자는 `Text`의 역할이나 `typographyRule` · `codeRule` · `emphasisRule`로, 불투명도는 `tokens.color.opacity` 역할로 고르고(홈의 `hero` · `section`, 푸터 로고의 `subdued`), 앱은 Palette를 읽지 않습니다(Palette를 보여주는 Typography inspector만 예외). 미디어 쿼리의 길이를 손으로 적는 일도 `paper/source-numbers`가 막습니다. 앱이 직접 쓰는 길이는 그 화면의 치수(폭 · 높이 · 그리드 트랙)뿐이고, `/demo`의 제품 틀과 분기점(`DEMO_LAYOUT` 1540 · 218/190/260 · 1180/900/600dp, `DEMO_MEDIA`는 em)은 `pages/demo/layout.ts` 한 모듈에 선언합니다. 색은 의미가 있는 자리에만 씁니다 — 브랜드 라벨과 팀 같은 분류는 상태색이 아니라 중립(primary)이고, 사람 · 작업 공간 표식과 진행 막대의 채움은 accent.primary의 solid 면과 wash 글자(또는 soft 면과 ink 글자)입니다.
- **버전.** 사이트가 보여 주는 버전은 `__PAPER_UI_VERSION__`입니다. Vite `define`이 패키지 package.json에서 읽습니다.

---

## 계층 · 빌드 규칙

```
Foundations → Primitives → Atoms
```

문서(`docs/`)와 Playground 사이드바는 이 순서와 이름을 그대로 씁니다 — Foundations(Color · Typography · Shape · Layout · Motion), Primitives(1차 Element · Content · A11y, 2차 Paint · Press · Select · Float · Drag · Focus · Field · Layout), Atoms. Foundations 페이지는 그 시스템의 원본 → 역할 → 조합 순서로 그립니다. Typography·Shape·Layout·Motion은 같은 보드(`app/src/playground/foundations/kit.tsx`)를 쓰고, Color는 예전 형태(팔레트 행렬 + 그룹별 값 카드)를 바탕으로 하되, 다른 페이지처럼 지금 테마의 값만 보여주고, 맨 아래에 accent × variant 조합 절(실제 Button·Badge 5 × 5)이 붙습니다. 모든 inspector 행은 원본(선택표 · 역할 spec · SOURCE)에서 파생합니다.

<!-- generated:inventory.agents -->
<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->
| 계층 | 수 |  |
| --- | --- | --- |
| Element (1차) | 1 | `Box` |
| Content (1차) | 2 | `Text · Icon` |
| A11y (1차) | 4 | `FocusScope · VisuallyHidden · Portal · LiveRegion` — 함수 `announce · clearAnnouncements` |
| Paint (2차) | 2 | `Surface · Paint` — class 함수 `surfaceClass · paintClass`, class 지도 `elevation · presence · loop` |
| Press (2차) | 1 | `Pressable` |
| Select (2차) | 2 | `Selectable · SelectableGroup` |
| Float (2차) | 1 | `Floating` |
| Drag (2차) | 2 | `Draggable · Droppable` |
| Focus (2차) | 1 | `RovingFocus` |
| Field (2차) | 1 | `FormField` |
| Layout (2차) | 3 | `Stack · Inline · Grid` |
| Provider | 3 | `PaperProvider · useTheme · useResolvedTheme` — 테마 엔진의 entry이고 문서당 저장소 하나에 붙습니다. `locale` · `messages`로 언어도 정합니다. 첫 화면 전에 모드를 정하는 `themeBootScript`는 `/theme-boot`에서 나갑니다 |
| Atoms | 13 | `Button · IconButton · Field · Textarea · Select · Checkbox · Switch · Radio · Label · Badge · Spinner · Divider · Link` |
<!-- /generated:inventory.agents -->

Primitive·Atom 인벤토리의 정본은 `packages/paper-ui/src/inventory.ts`입니다(`PRIMITIVE_ORDERS`가 두 차수의 분류를, `PRIMITIVE_GROUPS`가 그 파생 순서를 정합니다). `inventory.test.ts`가 `.` entry의 실제 export와 1:1로 대조하고, 앱의 사이트 지도(`app/src/site/site-map.ts`)가 Playground 목록(Foundations → Primitives → Atoms)을 거기서 파생합니다. 위 표는 그 목록을 옮긴 것이므로 인벤토리를 바꾸면 표도 함께 고칩니다.

Playground는 같은 계층을 파생해서 보여줍니다. 사이드바와 상세 페이지의 순서·이름·slug는 사이트 지도의 `PLAYGROUND_NAV`(인벤토리에서 파생)가 정하고(Primitives의 섹션마다 차수가 붙어, 사이드바가 `1차 — 바탕` · `2차 — Box + 능력 하나` 제목을 그 차수의 첫 섹션 위에 세웁니다. 사이드바는 `playground/PlaygroundNav.tsx`가 그 지도에서 그리는 셸의 `SidebarNav`입니다), 항목마다 `app/src/playground/registry/entries/<slug>.tsx` 하나가 `Spec`을 맡습니다 — 만질 수 있는 prop(controls), 컴포넌트 자신의 기본값(defaults), 그리고 화면에 그려지면서 코드로도 찍히는 subject. 코드 패널은 손으로 쓴 문자열이 아니라 그 subject를 `printJsx`로 찍은 것이라 미리보기와 어긋날 수 없고, 코드를 고치면 같은 문법(`registry/jsx.ts`)으로 읽혀 컨트롤이 따라옵니다. select의 선택지는 `/tokens` 어휘 상수에서 오며, 부분집합(`subset`)·컴포넌트 지역 union(`local`)·열린 prop의 표본(`sample`)은 사유를 달아 표시합니다. 손으로 쓴 임시 목록은 두지 않습니다 — 출처 종류가 이 넷뿐이라 타입이 그 밖을 막고, `registry.test.tsx`가 사이트 지도와의 일치, 코드 왕복, 기본값(prop을 생략한 렌더와 같은지), 어휘 일치를 지킵니다. 생략한 prop을 root가 이미 쥐고 있어 기본값으로 적으면 쓸데없는 class가 붙는 경우(Inline의 `align`)에는 `rootDefault`가 select의 "default (…)" 이름만 대고 코드와 화면은 그대로 둡니다. Primitive·Atom의 API를 바꾸면 같은 변경에서 그 항목도 고칩니다. Overview(`/playground`, `app/src/playground/Overview.tsx`)는 표본의 파생 색인이고 다른 페이지처럼 셸의 본문 칸을 채웁니다 — 목록은 어휘에서 오고, 캡션의 수치는 토큰에서 읽거나 역할 이름으로 적습니다. Type scale과 Color 절은 소유자가 정한 형태로 남아 있고, 모든 표본 testid는 `tests/app/overview.spec.ts`가 계산값에 묶습니다.

패키지는 세 가지를 공개합니다 — 컴포넌트·hook(Primitive와 Atom, `.` entry), `tokens`와 역할 규칙(`/tokens`), 어휘 짝(축마다 상수 하나와 타입 하나, `/tokens`). 어휘 짝은 각자 자기 시스템 파일에 한 번 정의되고 `tokens/vocabulary.ts`가 모아 내보냅니다. 새 축은 원본 tree에서 파생하거나 `satisfies`로 양방향 묶어 그 파일에 더합니다. 제품별 조합은 앱이 소유하고, 여러 제품에서 반복된 뒤에만 공통 API로 승격합니다.

RovingFocus는 등록 항목의 Tab 진입점과 실제 DOM focus 탐색을 관리하며 선택과 분리합니다. 항목 목록의 정본은 root가 가진 등록부 하나이고(같은 value는 먼저 온 쪽만 인정하며 개발 오류를 한 번 냅니다), `dir`은 줄 때만 DOM에 쓰고 방향키는 가장 가까운 `dir`이나 계산된 direction을 따릅니다. SelectableGroup은 Selectable 그룹의 단일·복수 선택이고 role을 주면 그 role의 aria로 선택을 알리며, 그 등록부를 읽어 선택값을 정리합니다. Floating은 Trigger·Content·Close를 연결하며 Root는 열린 상태만 들고, Content의 `presentation`이 `popover`(기본, overlay tier, `anchorRef` 또는 Trigger 곁)와 `modal`(modal tier, scrim 위 가운데)을 고릅니다. 앵커가 없는 popover는 개발 오류를 한 번 내고 아무것도 그리지 않으며, 처음부터 열려 있는 panel은 Trigger와 앵커의 ref가 차도록 첫 commit 다음(그리기 전)에 섭니다. 자기 elevation(z와 그림자)과 scrim은 스스로 그리고 면·테두리·모서리는 호출자의 className이 정합니다. 열리면 `enter`, 닫히면 `exit` 역할로 움직이며(`data-presence`) 퇴장이 끝날 때까지 `inert`·`aria-hidden`인 채 mount됩니다. React Aria가 배치·중첩 dismissal·배경 inert·스크롤 잠금을 담당하고, Portal 컴포넌트가 옮겨진 내용에 열린 자리의 테마와 덮어쓴 Shape·Layout·Typography 원본을 다시 겁니다. FormField는 입력 하나를 위한 context입니다 — 안의 입력이 `useFormFieldControl`을 부르면 field의 id · 설명 · 오류 · disabled · required가 `controlProps`(값이 있는 키만)로 닿고, `aria-invalid`는 직접 준 값, 없으면 error status 또는 field의 invalid로 이 hook 한 곳에서 정해집니다. Atom은 자기 props를 먼저, `controlProps`를 마지막에 펼칩니다. Floating.Content는 context를 끊습니다. useFormField는 같은 관계를 DOM 없이 조립합니다. 합성 도구는 Paper의 계약입니다 — `mergeProps`는 handler를 차례로 실행하고 className을 잇고 style을 키별로 합치며 undefined가 값을 지우지 못하고(`id`는 합치지 않음), `composeEventHandlers`는 caller 먼저 실행하고 취소할 수 있는 이벤트에서 caller가 preventDefault했을 때만 내부 handler를 건너뛰며(PressEvent는 늘 뒤따름), `mergeRefs`는 같은 DOM에 ref를 모읍니다. 새 공통 상태·입력 관계 API도 Playground와 문서·실제 브라우저 검증을 함께 갱신합니다.

Primitive 계약의 정본은 [docs/primitives/](docs/primitives/README.md)(1차 Element · Content · A11y, 2차 Paint · Press · Select · Float · Drag · Focus · Field · Layout)이고, Atom은 [docs/atoms/](docs/atoms/README.md)입니다. Primitive는 두 차수입니다 — 1차는 바탕이라 서로 기대지 않고, 2차는 Box에 능력 하나를 더한 것이며 Atom이 hook과 class 함수로 묶습니다. 2차 폴더는 서로 기대지 않고, 소유자가 승인한 예외는 select → focus(SelectableGroup은 Tab 정지가 하나라 RovingFocus 위에 섭니다)와 float → paint(scrim만) 둘뿐이며 `primitives/orders.test.ts`가 지킵니다. Press에는 Atom과 호출자 말고 아무도 닿지 않습니다 — 부품(Selectable · SelectableGroup.Item · Floating.Trigger · Floating.Close · RovingFocus.Item)은 `onClick`을 받는 native button이고, `<Pressable as={부품}>`이 press 장치를 올립니다(press 한 번은 늘 click 한 번입니다). `bareButton` reset은 `primitives/bare-button.css.ts`에 있고 reset 레이어라 타입 preset(utilities)과 크기·색(components) 어느 것에도 집니다. Pressable은 `motion`(`none` · `press`)을 받아, `press`면 눌리는 동안의 한 단계 내려앉음과 포인터 커서와 비활성의 모습을 `press/press.css.ts`의 class 하나로 입힙니다(색도 전이도 정하지 않습니다). Button · IconButton은 늘 `Pressable as={대상}`을 `motion="press"`로 그려 `as`가 태그든 라우터 Link든 부품이든 눌림 장치가 한 벌이고(`<Button as={Floating.Trigger}>`가 Atom의 모습을 행동에 입히는 하나뿐인 길이고 `<부품 as={Button}>`은 개발 오류입니다), 선택은 `useSelectable`(`selected`는 hairline · ghost · muted만), 로딩은 포커스를 잃지 않는 `aria-busy`이고, 색은 `paintClass`입니다. Field · Textarea · Select는 입력 틀 하나(`inputFrame`)에 `useFormFieldControl`과 `useFocusRing`(`atoms/input-control.ts`)으로 서고 — 키보드 포커스는 안쪽 native control이 판정하되 링은 틀이 `data-focus-visible`에서 그립니다 — Field의 지우기는 `Pressable`, 보기 토글은 `Pressable as={Selectable}`이며 아이콘은 `IconSizeContext`로 컨트롤 크기를 받습니다. Link는 자기 대상 태그에 `useFocusRing`과 `linkPaint`, Spinner는 `Box as="span"`에 `loop.spin`과 `spinnerPaint`를 얹어 서고, 둘 다 `recipes.css.ts`에서 색을 빌립니다. 모든 색 규칙은 `primitives/paint/`에 있습니다 — Surface(fill · border · radius · elevation · theme, 그리고 항목이 되는 `hoverable`과 `data-selected`를 다는 `selected`)와 Paint(accent × variant · hover · `selected`), 그리고 Atom과 부품이 빌려 쓰는 `recipes.css.ts`(`scrimPaint` · `fieldPaint` · `fieldPlaceholderPaint` · `fieldAdornmentPaint` · `fieldActionPaint` · `selectEmptyPaint` · `selectArrowPaint` · `markPaint` · `linkPaint` · `linePaint` · `spinnerPaint`)입니다. Atom의 stylesheet(`atoms/`와 그 recipe)도 `tokens.color`를 읽지 않습니다(`atoms/color-ownership.test.ts`). 상태 조각 중 색을 칠하는 것(`stateStyle.tinted` · `item` · `field` · `dropTarget`)은 이 층과 패키지 밖의 앱만 spread합니다. Floating의 그림자 색은 `tokens.color`가 아니라 elevation 레시피(`elevationCast`)로 오므로 `float/`에는 색을 읽는 줄이 없습니다. hover는 CSS(`@media (hover: hover)`와 막히지 않은 대상)이고 어떤 컴포넌트도 hover 속성을 내보내지 않습니다. `hoverable` Paint는 면 위에 `--pui-state-tint` 한 겹을 깔고 hover가 그 변수만 옮기며(hairline은 경계), 면(`backgroundColor`)은 건드리지 않습니다. `as`를 받는 primitive와 부품은 `disabled`를 대상에 옮기는 길이 `internal/render-target.ts`의 `targetProps` 하나이고(control은 native button이면 `disabled`, 그 밖의 태그는 `role="button"` · tabIndex · `aria-disabled`, 컴포넌트는 부품이면 `disabled` 아니면 `aria-disabled`와 클릭 차단 · region은 native 태그만), 비활성 대상은 늘 `data-disabled`를 답니다. press가 없는 부품(Selectable · Floating.Trigger · Floating.Close)은 `activateOnKey`로 `role="button"`을 받은 태그에 Enter · Space를 줍니다. children 함수는 읽기 전용 스냅샷(`XState`)을 받습니다. 기존 Layout·Content props를 유지하고 native ref를 전달합니다. Press · Select · Float · Drag는 컴포넌트와 usePressable/useSelectable/useFloating(·useFloatingContext)/useDraggable/useDroppable을 함께 제공하고, FocusScope·VisuallyHidden·Portal·focus hook은 A11y에 둡니다. DOM에 닿는 hook은 `{ <부분>Props, ...상태 }`를 돌려주고, 그 props에 자기 ref와 상태 attribute(`tokens/state.ts`의 `stateAttributes`)가 들어 있어 ref 인자를 받지 않습니다. 눌리는 동안의 순간 상태는 `active`(`isActive` · `data-active`)이고 `pressed`는 `aria-pressed`만 뜻합니다. press는 일시적 입력, select는 유지되는 boolean 선택입니다. Draggable은 move/transfer 모드를 구분하며 Handle은 부모 전체 박스를 조작합니다. handle activation에서는 pointer·keyboard 모두 손잡이에서만 시작합니다. inline style은 실행 중에 정해지는 값에만 씁니다(Draggable 이동 좌표, Grid track, Floating rank 변수, Floating 앵커 위치, Floating 원본 변수 운반, 호출자가 넘긴 style). semantic 토큰은 기존 class 경로를 유지합니다. 저수준 입력·포커스·native transfer 처리는 React Aria를 재사용하되 `internal/aria` 어댑터 뒤에 둡니다 — 공개 옵션 · 이벤트 · 결과 타입은 `primitives/types.ts`와 각 hook이 Paper의 이름으로 선언합니다. Atom은 Primitive와 공용 recipe 위에 섭니다 — Checkbox · Radio · Switch는 native input에 `useFocusRing`과 `useFormFieldControl`(`atoms/input-control.ts`)로 서고 색은 `markPaint`이며(꺼진 표식의 테는 `ink.tertiary`, 오류는 `ChoiceStatus`의 `status="error"`), Label은 Text, Badge는 `Paint as="span"`, Divider는 `Box as="hr"`와 border로 긋는 `linePaint`입니다. 열세 Atom 모두 Primitive와 hook 위에 서고 native control이 있는 자리에서는 그 control이 의미를 가진 요소로 남으며, 표는 [docs/atoms/](docs/atoms/README.md#primitive-위의-atom)에 있습니다. 모든 Atom은 같은 계약을 따라 ref와 native 속성은 의미를 가진 요소에, className · style · data-testid는 눈에 보이는 상자에 건넵니다(`atoms/contract.test.tsx`). 2차 폴더가 함께 쓰는 `internal/` 모듈은 범용 도구뿐이고(`orders.test.ts`의 `SHARED_INTERNAL`), 어떤 능력의 상태를 `internal/`로 옮겨 이 규칙을 비켜 가지 않습니다. FormField는 `usePortalDepth`로 Portal 너머의 입력과 끊어지므로 Floating은 FormField를 모릅니다.

Atom이 스스로 말하는 문구(접근성 이름 같은 것)는 prop이고 기본값은 `PaperProvider`의 locale이 고른 문구 목록(`internal/messages.ts`: en · ko)에서 옵니다. 개발자 오류는 늘 영어이고 `[paper-ui] `로 시작합니다. 로딩 알림처럼 요소 없이 읽혀야 하는 것은 `announce()`(LiveRegion과 같은 A11y 그룹)로 보냅니다.

<!-- generated:rules.ko -->
<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->
1. **raw 색값 금지** (`paper/raw-color`). 색 원본은 `tokens/palette.ts`의 OKLCH 좌표뿐이고 HEX는 `tokens/color-ladder.ts`가 생성합니다. 어떤 파일도 색 리터럴을 손으로 쓰지 않습니다 — HEX, `oklch()` 같은 색 함수, 색을 받는 속성의 이름 있는 색과 CSS 시스템 색 키워드가 모두 막히고, 시스템 색은 `SYSTEM_COLORS`를 거칩니다. 패키지에서 `tokens.color`를 읽는 곳은 paint 층(`primitives/paint/`)과 `styles/`의 class 지도, Icon의 잉크뿐입니다(`manifest.js`의 `COLOR_OWNERS`; `primitives/orders.test.ts`와 `atoms/color-ownership.test.ts`가 backstop).
2. **원본 격리** (`paper/source-isolation`). 원본 값을 읽는 곳은 토큰 층(`tokens/`)뿐입니다. 패키지의 나머지는 tokens 배럴(`tokens/index.ts`)로만 들어가고(바인딩 없는 `variables.css` import와 이름만 담은 `layers.css`는 예외, `tokens/inspect`는 import하지 않음), 앱과 fixture는 패키지 소스를 import하지 않고 exports로만 씁니다(`vite.config`가 읽는 boot 스크립트 하나가 manifest의 `TOOLING`입니다). Foundations inspector는 자기 시스템 하나를 `@paper-ui/inspect/<시스템>`으로 읽어 글자나 kit의 표시 부품(`Swatch` · `Meter` …)으로만 보여 주고, 그 값은 `style` · `className` · 패키지 컴포넌트의 prop에 닿지 않습니다. `--pui-` 변수는 토큰 층 밖에서 문자열로 쓰지 않습니다 — `tokens`로 읽고 `sourceVars()`로 덮어씁니다. 테스트는 검증 코드라 받지 않습니다. 같은 묶음이 React Aria 경계도 지킵니다(`no-restricted-imports`, 패턴은 manifest의 `ARIA_BOUNDARY`): `@react-aria/*` · `@react-stately/*` · `@react-types/*`는 `packages/paper-ui/src/internal/aria` 밖에서 import하지 않고(`@react-stately`는 쓰지도 않습니다), 어댑터가 Paper의 이름과 타입으로 옮깁니다. 번들한 d.ts에 그 경로가 남으면 `build-types.mjs`가 빌드를 실패시킵니다.
3. **inline style로 토큰 주입 금지** (`paper/inline-token`). 토큰은 `.css.ts` className으로만 적용합니다. 패키지와 앱의 `.tsx`에서 `tokens` · `styles` · `internal` · 패키지 자신(`@studio-baeks/paper-ui*`)에서 온 값이 `style`에 닿으면(변수 · 함수 호출 · hook · 구조 분해를 거쳐도, 던지는 오류는 따라가지 않고) 막습니다. 실행 중에 정해지는 값만 예외이고 목록은 이것이 전부입니다: Draggable 이동 좌표, Grid track, Floating rank 변수, Floating 앵커 위치, Floating 원본 변수 운반, 호출자가 넘긴 style. 예외 모듈(`internal/aria` · `internal/measure` · `theme/source-carry`)은 manifest의 `RUNTIME_STYLE`에 이유와 함께 선언합니다.
4. **숫자는 원본에만** (`paper/source-numbers`). 스타일 자리(`.css.ts`의 vanilla-extract 호출 인자, `.ts` · `.tsx`의 `style`)의 숫자 · 단위 · easing은 구조 값(0 · 100% · 50% · 1fr · 45° 배수 · calc의 `/ 2` · `* -1`, 정본은 `eslint-rules/structural.js`)이 아니면 원본의 값입니다. 패키지는 토큰 층 밖에서 간격 · 형태 · 깊이 · 글자 · 투명도 · 시간 · 치수 모두를 역할로 고르고, 앱은 콘텐츠 치수(폭 · 높이 · 그리드 트랙)만 직접 씁니다. 미디어 · container 쿼리의 길이는 `tokens.layout.breakpoint`로만 적고, 깊이(`zIndex` · `boxShadow` · `filter`)는 Surface와 Floating의 stylesheet(manifest의 `ELEVATION_OWNERS`)나 elevation 조각의 spread, 안쪽 선은 `strokeRing()`에서만 나옵니다. 앱은 Typography Palette를 읽지 않습니다(Typography inspector만 예외). 한 화면의 치수 모듈(`pages/demo/layout.ts`)은 `APP_DIMENSION_MODULES`에 선언합니다.
5. **패키지 CSS는 레이어 안에** (`paper/layered-styles`). 패키지 `.css.ts`는 vanilla-extract의 규칙 API(`style` · `styleVariants` · `globalStyle` · `globalLayer` …)를 직접 import하지 않고 `tokens/layers.css.ts`의 `layered(name)`으로 규칙을 만듭니다. 그래서 모든 규칙이 cascade layer `pui` 안에 들고, 레이어 밖의 앱 CSS가 로드 순서와 무관하게 이깁니다. 레이어를 정의하는 `layers.css.ts`만 예외이고, `keyframes` · `createVar` · `fallbackVar` · `createGlobalVar`는 그대로 씁니다.
6. **내부 class 이름 문자열 금지** (`paper/internal-class`). 앱(`app/src`)과 테스트(`tests/`)는 `pui-` 뒤에 글자가 오는 문자열(템플릿 포함)을 쓰지 않습니다. 공유 축의 class는 resolver가 `styles/`의 typed map(`fillClass` · `inkClass` · `accentVariantClass` · `spaceClass`)을 인덱싱해 고르고 이름은 빌드가 짓습니다. 변수 `--pui-*`와 속성 `data-pui-*`는 이 규칙을 통과합니다(변수 문자열은 원본 격리가 막습니다).
7. **손으로 지은 전역 class 금지** (`paper/global-class`). 앱 `.css.ts`의 `globalStyle` selector는 scoped class에서 시작합니다. 요소 · `:root` selector는 `site/shell.css.ts`(manifest의 `GLOBAL_SELECTOR_FILES`)뿐이고, 전역 keyframes와 전역 변수 이름은 짓지 않습니다.
8. **규칙은 주석으로 끄지 않음** (`paper/no-rule-disable`). paper 규칙은 `eslint-disable` 주석으로 끄지 않고, 예외는 `eslint-rules/manifest.js`에만 선언합니다. 다른 규칙을 끄는 주석은 `-- 이유`를 달고, 아무것도 가리지 않는 disable 주석도 오류입니다. `pnpm lint`는 두 번 돕니다 — 두 번째 판(`eslint.paper.config.js`)은 paper 규칙만 주석 설정을 끈 채 읽어서 `/* eslint paper/…: "off" */` 같은 설정 주석도 아무것도 끄지 못합니다.
<!-- /generated:rules.ko -->

규칙의 이름과 요약(한국어 · 영어)은 `eslint-rules/manifest.js`의 `RULES`가 정본이고, 규칙이 읽는 경로와 예외도 거기에만 선언합니다. 여덟 규칙은 eslint가 막고 build·prepublish·CI가 그 검사를 돌립니다.

**접근성도 빌드가 지킵니다.** `eslint-plugin-jsx-a11y`(recommended)를 `polymorphicPropName:"as"`로 설정해 `<Box as="button">` 같은 polymorphic 요소까지 검사합니다. 유효한 role·aria, 대체텍스트, 양수 tabindex 금지 등을 lint하며, 폼 아톰은 `label-has-associated-control`의 `controlComponents`에 등록합니다. 글자·비텍스트 대비는 단위 테스트가, 키보드 포커스·touch hover·forced colors·prefers-contrast·target 크기는 e2e가 지킵니다. 상호작용별 runtime 계약은 실제 제품 구현과 검토가 책임집니다.

---

## 계약과 테스트

`docs/`의 계약 문장·문단·표 바로 앞에는 렌더되지 않는 표시 `[contract:<area>.<subject>.<slug>]: #`를 한 줄로 둡니다. area는 foundations · primitives · atoms · install · guardrails · app 중 하나입니다. 그 계약을 단언하는 테스트는 제목을 `[<id>]`로 시작하고, 한 테스트가 계약 여럿을 단언하면 id를 이어 씁니다(`[a] [b] 제목`). 새 계약 문장은 같은 변경에서 표시와 테스트를 함께 얻습니다. `scripts/check-contracts.mjs`가 `pnpm test` 안에서 둘을 1:1로 대조합니다 — 같은 id의 표시가 둘이거나, 테스트 없는 표시(skip · todo · fixme · fail 테스트는 세지 않습니다), 표시 없는 테스트 id, 내용 블록이 뒤따르지 않는 표시, 문단·목록·표에 이어 붙어 글자로 보이는 표시는 실패입니다. 표 바로 위의 표시는 GitHub에서 글자로 보이므로 표와 표시 사이에 빈 줄을 둡니다.

테스트 파일은 계층과 시스템 이름을 따릅니다. 단위 테스트는 소스 옆에 `tokens/{color,color-recipes,typography,shape,layout,motion,state,barrel,overrides}.test.ts` · `styles/{typography,states}.test.ts`(`states`는 패키지 소스 전체의 상태 철자 훑기) · `theme/{engine,store}.test.ts` · `theme/{provider,source-carry}.test.tsx` · `primitives/{layout,content,theme,paint,interaction,a11y}.test.tsx` · `primitives/orders.test.ts` · `primitives/composition.test.ts` · `internal/*.test.ts(x)` · `public-types.test.ts`(공개 타입과 React Aria 경계) · `atoms/<Atom>.test.tsx` · `atoms/contract.test.tsx`(Atom이 함께 말하는 것 — 열세 Atom의 ref · 속성 · 상자 대상, 입력 가족과 선택 표식의 invalid)로, e2e는 `tests/{foundations,primitives,atoms,app,install}/<시스템>.spec.ts`로 둡니다. 테스트 이름에서 Foundations는 Color부터 Motion까지 다섯 시스템만 뜻합니다. e2e 도구(하네스 · 키보드 · 기하 · 콘솔 · 사이트를 링크로 훑는 `crawl.ts` · 계산된 스타일 probe `style.ts`)와 단위 테스트도 함께 쓰는 `dp()`는 `tests/support/`에 있습니다. 앱의 단위 테스트(`app/src/**/*.test.ts(x)`)는 문서 파서 · 링크 해석 · `docs/` 전체의 링크와 앵커와 앱 링크(라우트 표에 있는지) · 사이트 지도 · 라우트 handle · Playground registry와 JSX 문법에 더해, Foundations inspector(`playground/foundations/inspector.test.ts`: 역할 설명 `ROLE_NOTES`의 누락 없음 · 두 테마의 Palette 경로 이름 · 타이포 preset 범위 · Motion 역할과 반복의 설명)를 지킵니다. lint 규칙은 `eslint-rules/<규칙>.test.js`(`node --test`)가 계약 id로 지키고, manifest의 경로와 예외가 실제로 있는지는 `manifest.test.js`가 봅니다.

e2e는 자기 서버를 직접 띄웁니다. 앱은 41731, 하네스(`fixtures/harness`, `?case=geometry|carry|theme|layers|layout|elevation|typography|motion|press|states|marks|drag|overrides`)는 41732 포트에서 `--strictPort`로 뜨고 이미 떠 있는 서버를 재사용하지 않으므로, 포트를 다른 서버가 쓰고 있으면 실행이 실패합니다. 포트는 `E2E_APP_PORT` · `E2E_HARNESS_PORT`로 바꿉니다. 하네스는 Vite 내부 경로 없이 패키지를 exports로만 불러오고, `window.__paper.sourceVars`로 원본 덮어쓰기를 spec에 내줍니다. 프로젝트는 chromium · chromium-dark · chromium-reduced-motion · chromium-forced-colors · firefox · webkit 여섯입니다. `foundations/motion` spec은 chromium에서 역할 타이밍을, chromium-reduced-motion에서 reduced-motion 정책을 돌립니다(프로젝트 옵션으로 서로의 테스트를 건너뜁니다). firefox · webkit은 `foundations/shape` · `primitives` · `atoms` spec을 돌고, `tests/dist/`는 배포본 전용 설정만 돌립니다 — 이름은 dist여도 산출물이 아니라 소스이므로 git · eslint · check-contracts는 산출물 `dist/`와 달리 이 디렉터리를 읽습니다. Tab은 `tests/support/keyboard.ts`의 `tab()`으로만 누릅니다 — macOS WebKit에서는 Alt+Tab이어야 버튼까지 닿습니다. 한 엔진에서만 나는 실패는 `playwright.config.ts`의 `ENGINE_EXCLUSIONS`에 이유와 다시 켜는 단계를 적어 그 엔진에서만 끕니다.

---

## 문서 — 생성과 검사

문서의 숫자 표와 규칙 목록은 소스에서 생성합니다. 생성 블록은 `<!-- generated:<id> -->`와 `<!-- /generated:<id> -->` 사이이고, 블록의 정의(어느 소스에서 쓰는지)는 `app/src/docs/generated/`에 있습니다. 블록을 손으로 고치지 않고 `pnpm docs:sync`로 다시 씁니다. 표식은 사이트에 그려지지 않고(Prose가 HTML 주석을 버립니다), 줄 맨 앞에 두면 그 줄 전체가 HTML 블록으로 읽히므로 문장 속 블록은 앞에 글자를 두고 엽니다. `pnpm docs:check`는 블록이 소스와 같은지, 문서의 ts·tsx 코드 블록이 패키지 타입으로 컴파일되는지(`app/scripts/docs/extract-snippets.mjs`), 문서 안의 상대 링크와 앵커와 앱 경로가 존재하는지, 산문에 HEX 리터럴이 없는지, 단위 리터럴(px · rem · em · ms)이 원본 값에 있는지, 패키지 description이 README의 첫 문장과 같은지를 검사합니다.

코드 블록은 실제로 컴파일되는 예제만 `ts` · `tsx`로 씁니다. 개념을 보이는 의사 코드는 `text`로 씁니다. 문서의 링크는 파일 경로와 `#` 앵커로 씁니다.

---

## 작업 완료 전 체크

- [ ] `pnpm verify` 가 통과했는가 — check(lint · typecheck · 단위 테스트 · 계약 대조) → build(패키지 → 앱) → e2e. CI 와 배포 전 검사(`prepublishOnly`)가 같은 명령을 돌린다
- [ ] 작업 중에는 `pnpm check` 로 빠르게 확인하고, Foundations · Primitives · Atoms 를 바꿨다면 `pnpm test:e2e` 도 함께 돌렸는가
- [ ] 패키지 package.json · entry · 빌드를 바꿨다면 `pnpm --filter @studio-baeks/paper-ui check:package` 도 돌렸는가
- [ ] CSS 기능을 새로 썼다면 `scripts/browser-baseline.mjs` 표에 그 행을 더했는가
- [ ] 색을 추가했다면 — 정말 *의미* 가 있는가. 장식이면 넣지 않는다
- [ ] 큰 면을 색으로 채우지 않았는가 (색 면은 그 색의 의미를 짊어질 때만 — error 버튼처럼. 일상의 채움은 검정)
- [ ] 상태를 추가하거나 바꿨다면 — `docs/atoms/states.md`의 표, recipe(`tokens/color-recipes.ts` · `tokens/state-recipes.ts`), Playground를 함께 갱신했는가
- [ ] Primitive·Atom API를 수정했다면 — app의 실제 사용 예와 문서, 그리고 Playground 항목(`app/src/playground/registry/entries/`)을 갱신했는가
- [ ] prop이 받는 닫힌 값의 집합(축)을 더하거나 바꿨다면 — 원본 tree에서 파생하거나 `satisfies`로 묶고 `tokens/vocabulary.ts`에 상수·타입 짝으로 공개했는가
- [ ] 문서에 계약 문장을 더했다면 — 같은 변경에서 `[contract:…]: #` 표시와 그 id로 시작하는 테스트를 더했는가
- [ ] 데모(`app/`)가 여전히 서는가
- [ ] 문서를 고쳤다면 — 생성 블록은 `pnpm docs:sync`로 다시 썼고, `pnpm docs:check`(타입 · 코드 블록 · 링크 · 산문 · description)가 통과했는가
