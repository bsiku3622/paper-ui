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
    │   └── src/
    │       ├── index.ts        # entry `.` — 컴포넌트 · hook · Provider ("use client")
    │       ├── inventory.ts    # 이름 · 분류 · 순서의 정본 — import 가 없고 inventory.test 가 export 와 대조
    │       ├── tokens/         # 값의 유일한 정의 위치 — SOURCE → VALUES → 역할, *-recipes = 조합(typography-recipes = 글자 규칙 함수) · vocabulary.ts = 어휘 짝 · color-modes.ts = 모드 어휘 · variables.ts · variables.css.ts = 모든 CSS 변수의 배출 · public.ts = entry `/tokens` · layers.css.ts = cascade layer
    │       ├── styles/         # class 의 실체 — color.css.ts (면 · 잉크 · accent × variant) · space.css.ts · typography.css.ts (Text 역할 · mono · 숫자 · control preset · fontSize class) · theme.css.ts (문서 바탕 · 스코프 잉크) · global.css.ts = entry `/styles.css`. resolvers 를 import 하지 않음
    │       ├── resolvers/      # 공유 축 이름 → class (styles/ 의 typed map 인덱싱)
    │       ├── theme/          # 테마 — engine.ts (React · CSS 없음) · store.ts = 문서당 저장소 · PaperProvider · context · scope · boot.ts = entry `/theme-boot`
    │       ├── primitives/     # layout·text·icon building blocks
    │       └── atoms/
    ├── app/                    # 사이트 · Playground · 문서 · 데모 — vite/paper-docs.ts 가 docs/ 를 서빙
    ├── fixtures/harness/       # @paper-ui/harness — e2e 가 패키지를 소비자처럼 마운트하는 페이지
    ├── eslint-rules/           # lint plugin `paper`
    ├── scripts/                # 레포 검사 (docs-sync · browser-baseline · check-contracts)
    └── tests/                  # Playwright e2e — foundations · primitives · atoms · app · install, support/
```

pnpm 명령은 `workspace/` 에서 실행한다. `core`/`web` 분리는 일부러 없다 — 존재하지
않는 두 번째 medium 을 위한 자리는 만들지 않는다. 작업 로그(`logs.md`)는 이 기계에만
둔다 — `.gitignore`에 있고 추적하지 않는다.

패키지 entry 는 넷이고, 이름 하나는 한 entry 에서만 나간다 — `.`(컴포넌트 · hook · Provider ·
prop 타입, `"use client"`), `/tokens`(React · CSS 없는 값과 어휘), `/theme-boot`(React · CSS 없는 부팅 스크립트 —
`themeBootScript` · `THEME_STORAGE_KEY` · `THEME_ATTRIBUTE`), `/styles.css`(전역 스타일시트).
스타일이 들어오는 길은 `/styles.css` 하나다 — index.ts · Provider · 컴포넌트 stylesheet 는 전역 CSS 를
import 하지 않는다. 앱은 패키지를 이 exports 로만 쓰고(Foundations inspector 의 원본 import 만 예외),
workspace 에서는 `paper-ui-source` export 조건(Vite `resolve.conditions` · tsconfig `customConditions`)이
같은 exports 를 소스로 푼다.

패키지 CSS 는 모두 cascade layer `pui` 안에 든다 — `pui.reset < pui.theme < pui.base < pui.utilities <
pui.components`, 뒤의 레이어가 특정도와 무관하게 이긴다. 레이어 이름과 `layered(name)` wrapper 는
`tokens/layers.css.ts` 하나가 정의하고, global.css.ts 가 그것을 맨 먼저 import 해 dist/paper-ui.css 는 레이어
선언으로 시작한다. 파일마다 갈 레이어가 정해져 있다: tokens/variables.css.ts 의 변수는 theme, box-sizing 과 body margin 은
reset, body 의 면과 글자(body 역할 전체) · 스코프 잉크 · 포커스 링 · reduced motion 은 base, 면 · 잉크 · 간격 지도(color.css 의 surfaceClass · inkClass, space.css)와
typography.css 의 class 전부(Text 역할 · mono · 숫자 · control preset · fontSize 탈출구)는 utilities, accent × variant 지도(color.css 의 accentVariantClass)와 primitives · atoms 는 components. `@keyframes` 와 `@property` 만 레이어 밖에 선다. 앱 CSS 는 레이어 밖에
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

- palette.ts만 OKLCH neutral·accent anchor와 `alpha05`~`alpha95` opacity scale을 소유합니다. color-ladder.ts의 순수 함수를 호출해 완성된 coordinates와 HEX Palette Token을 조립해 export합니다. Palette 값은 테마와 무관하며, semantic layer가 light/dark 역할에 맞는 step을 선택합니다. accent hue·chroma와 amber의 옅은 끝 보정은 `ACCENT_IDENTITIES`, 중립의 중간 단계는 `NEUTRAL_BETWEEN` 데이터입니다.
- color-ladder.ts는 palette.ts를 import하지 않는 순수 계산 모듈입니다. 입력받은 좌표·단계에 대해 보간·gamut-map·HEX 인코딩을 수행하며 semantic role 이름을 두지 않습니다.
- colors.ts의 `COLOR_SELECTION`이 테마별로 역할마다 Palette 경로 하나를 고르는 유일한 표이고, `COLOR_VALUES`(_DARK)는 그 표에서 파생합니다. semantic leaf는 생성된 Palette Token만 선택하며 다른 semantic leaf, 직접 입력한 HEX, color math를 참조하지 않습니다. 상태색의 tone은 `ACCENT_TONE_STEPS`·`PRIMARY_TONE_STEPS`가 고르고, 표를 벗어나는 예외(light warning)는 pigment 이름이 아니라 status 이름으로 `STATUS_EXCEPTIONS`에 적습니다.
- tokens/variables.ts는 semantic tree를 CSS variable 묶음으로 만들고 tokens/variables.css.ts가 그것을 내보냅니다. Package consumers는 tokens.color var 참조만 씁니다. Playground Foundations inspector(`app/src/playground/foundations/*.ts(x)`, 스타일시트 `*.css.ts` 제외)만 원본을 그대로 보여주기 위해 colors·palette·color-recipes·typography·shape·shape-recipes·layout 원본 모듈을 읽습니다 — 표시용이지 스타일용이 아닙니다. 원본에서 읽은 값은 글자로 찍거나 kit의 표시 부품(Swatch · Chip · StepGrid · Meter)을 거쳐서만 화면에 닿고, 클래스와 컴포넌트 prop은 `/tokens` 어휘나 손으로 적은 표본 지도에서 옵니다. 다른 raw-token import 제한은 유지합니다.

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
| Opacity | `opacity.<role>` | disabled (alpha 50) · subdued (alpha 70) — 테마 불변, `COLOR_VALUES` 밖 |

Accent status는 palette와 분리합니다: info→blue, success→green, warning→amber, error→red. Accent는 같은 다섯 role을 공유합니다. `solid`는 채움, `wash`는 채움 위 글자, `ink`는 soft·hairline·ghost와 의미색 글자, `soft`는 soft surface, `subtle`은 muted foreground에 씁니다. Text·Icon의 `ink`(`INKS`)는 Color 이름 그대로 `primary · secondary · tertiary`, 상태 넷, `inherit`입니다.

focus ring 색은 `interaction.focus`에, 링크 색은 `interaction.link`에 둡니다. focus는 상호작용 상태이고 링크는 눌러서 이동한다는 표시이며, 둘 다 색은 Palette Token에서 옵니다. 링크는 info 상태색과 같은 blue.700/300을 고르지만 뜻이 다른 별도 역할입니다. 링 두께·offset은 색이 아닌 geometry이므로 `shape.focus.width`와 `shape.focus.offset`에 둡니다. Scrim은 `overlay.scrim`, 그림자 색(shadow colour)은 깊이로 이름 붙인 `shadow.floating`과 `shadow.lifted`에 두고, 거리·blur·spread는 shape geometry로 둡니다. "overlay"는 떠 있는 층(Overlay · elevation `overlay` · `overlay.scrim`)만 가리키고, 면 위의 상태 wash는 tint입니다. Semantic Form hover glow는 사용하지 않습니다.

**테마**는 모드(light · dark) 한 벌 — 색 역할 전체와 Layout의 그림자 기하 — 을 고르는 일이고, `<html>`이나 요소의 `data-pui-theme` 속성이 정합니다. `<html>`에 속성이 없으면 OS(`prefers-color-scheme`)가 정하고, 스타일시트와 엔진(`readRootMode`)이 같은 규칙을 씁니다. 스코프는 자기 요소에 그 모드의 고유 역할을 걸고 상속 잉크(`ink.primary`)를 다시 선언하며, 지면 역할(`GROUND_ROLES`: 포커스 링 색 · 그림자 색 · 그림자 기하)은 스코프의 자식부터 바뀝니다. `prefers-contrast: more`는 `COLOR_CONTRAST_MORE`(경계 셋과 `ink.tertiary`)를 같은 스코프에서 한 단 올립니다. 면 사다리는 라이트가 raised > canvas > sunken, 다크는 sunken = canvas입니다(`SURFACE_ORDER`).

하위 트리의 테마는 Box · Stack · Inline · Grid의 `theme`(light · dark · inverse) 축입니다. 테마가 있는 Box는 면을 주지 않아도 그 모드의 canvas를 깔고, 안쪽 글자·Icon·Pressable·Overlay 내용은 그 모드의 잉크를 받으며, 자기 포커스 링과 그림자는 바깥 지면의 모드를 따릅니다. 테마 속성을 `<html>` 아래에서 쓰는 길은 `theme/scope.ts`(Box의 `useThemeScope`, Overlay 포털 루트의 `usePortalScope`) 하나뿐입니다. 테마 엔진(`src/theme/`)은 이렇게 나뉩니다.

- `engine.ts` — 순수 규칙(`resolvePreference` · `resolveBoxTheme` · `invertMode`), `<html>` 읽기(`readRootMode` · `subscribeRootMode`), 전환 동안의 `holdTransitions`, 부팅 스크립트(`bootTheme` · `themeBootScript`)와 저장 키 `THEME_STORAGE_KEY`(`pui-theme`). React도 CSS도 없습니다.
- `store.ts` — 문서당 하나의 저장소(`getThemeStore`). 선택(light · dark · system)을 들고 `<html>`에 모드를 쓰며, 쓰기마다 전환을 즉시로 묶습니다. `<html>` 속성이 정본이라 밖에서 쓴 값은 읽을 뿐 되돌리지 않습니다. Provider가 몇 개든 이 저장소 하나에 붙고, 마지막 Provider가 사라지면 붙기 전의 속성으로 돌아갑니다.
- `context.ts` · `PaperProvider.tsx` — Provider는 저장소를 React에 묶을 뿐 자기 상태도 DOM wrapper도 CSS import도 없습니다. `useResolvedTheme`은 Box 테마 → Provider → `<html>`/OS 순으로 읽어 Provider 없이도 참이고, `useTheme`은 Provider 안에서만 씁니다.
- `boot.ts` — entry `/theme-boot`. 앱은 `<head>` 맨 앞에 `themeBootScript`를 넣어 첫 화면 전에 모드를 정하고, 같은 옵션을 Provider에 넘깁니다(`app/src/theme.ts`).

색을 바꾸면 [docs/foundations/color.md](docs/foundations/color.md)와 Playground Foundations › Color를 함께 확인합니다. API 경로와 source 규칙을 동시에 갱신합니다.

## 형태 — Shape와 Layout

시스템은 `Color → Typography → Shape → Layout → Motion → Primitives`로 쌓이고, 각 층은 자기보다 위의 층만 참조합니다. **Shape은 요소 하나의 형태**(곡률·선·포커스 링·크기·안쪽 여백), **Layout은 요소 사이의 관계**(형제 간격·gutter·container·breakpoint·elevation)입니다. 경계는 "빈 캔버스에 그 요소 하나만 놓아도 남는가"로 가릅니다. 정본은 [docs/foundations/shape.md](docs/foundations/shape.md)와 [docs/foundations/layout.md](docs/foundations/layout.md)입니다.

- 숫자는 `SHAPE_SOURCE`(tokens/shape.ts)·`LAYOUT_SOURCE`(tokens/layout.ts)에 dp로 한 번만 씁니다. **원본만 CSS 변수로 굽고**, 역할은 원본 변수의 별칭이거나 소비 요소에서 계산되는 calc() 식입니다. 역할에 변수를 따로 만들지 않습니다 — 하위 트리에서 원본 하나를 덮으면 그 위의 역할·recipe가 모두 다시 계산되어야 합니다.
- 길이 scale은 하나입니다: `xs4 · sm8 · md12 · lg16 · xl24 · 2xl32 · 3xl48`. 안쪽 여백은 `tokens.shape.inset`, 형제 사이·margin·위치 offset은 `tokens.layout.gap`으로 고릅니다. 둘은 같은 단계면 같은 길이입니다.
- radius는 날만 죽이고 가족마다 한 값입니다: `control` 4 · `selection` 3 · `surface` sm4/md6/lg8 · `full` 999px. Box radius는 surface를 선택합니다.
- control은 높이 30/32/36만 원본입니다. input inset = (높이 − 컨트롤 글자 줄)/2 = 7/8/10, button inset = input × 1.4 반올림 = 10/11/14, selection = 높이/2 = 15/16/18, `control.icon` 16/18/20(옆 글자가 아니라 컨트롤 높이를 따릅니다), `control.gap` 8. `internal/shape.ts`의 `controlGeometry`에서 역할을 고르고 stylesheet가 자기 사다리를 만들지 않습니다.
- recipe(`tokens/shape-recipes.ts`)에는 숫자가 없습니다. Switch 트랙 폭 = 컨트롤 높이, 테 = `stroke.emphasis`, 손잡이는 자기 폭만큼 이동. Textarea 한 줄 = 같은 size Field 높이(block 여백 4/5/7). Select 화살표는 `control.icon` 크기 Icon, 입력 inset 자리, 값은 `control.gap` 앞에서 멈춤. Checkbox mark·Radio dot = 선택 상자의 절반(크기별 보정 없음). Badge 높이 20/22/24·inset 6/8/10만 원본 anatomy입니다.
- 선(`stroke.border` 1 · `emphasis` 2)과 포커스 링(`focus.width`·`offset` 2)은 px, `stroke.icon` 1.75는 SVG 단위입니다. 누르는 표식의 최소 크기 `target.min` 24도 px이고, 이에 못 미치는 표식은 `targetReach`(= (min(표식, 24) − 24) / 2)만큼 보이지 않는 hit area를 넓힙니다. 모든 포커스 링은 `focusRing` 하나를 씁니다(색은 `interaction.focus`).
- Icon 크기 이름은 Text 역할 이름의 부분집합이고 타입으로 묶여 있습니다: label 14 · caption 16 · body 18 · subheading 20. Box의 named size는 `dimension.width/height`(xs~xl), 읽기 폭 `measure`, Layout의 `container`를 가족 접두어(`md` · `measure.md` · `container.content`)와 키워드(`full · fit · min-content · max-content`)로 고르고 모두 class가 됩니다. 이름이 아닌 CSS 길이만 inline입니다.
- elevation은 `base 0 · raised 10 · sticky 20 · overlay 30 · modal 40 · toast 50` 여섯 층이고, **층 하나가 z와 그림자를 함께 정합니다.** 그림자 깊이는 lifted(raised)·floating(overlay·modal·toast) 둘뿐, base·sticky는 그림자가 없습니다. 기하는 Layout(모드별 원본 변수 `--pui-layout-shadow-<depth>-<i>`), 색은 Color의 shadow colour이고, 그림자는 쓰이는 요소에서 둘을 이어 붙여 조립합니다(`castShadow`). Box는 `elevation` prop으로 고릅니다.
- breakpoint(30/48/64/80em = 480/768/1024/1280)는 미디어 쿼리가 변수를 못 읽어 값입니다. 길이는 rem, 미디어 쿼리는 em, 선·포커스 링은 px입니다. `layout.section`(start · end)은 뷰포트 높이를 따라 자라는 선언된 유동 단계로, Typography의 `hero`와 함께 고정 사다리의 예외는 둘뿐입니다. `color.control.track`은 Switch 트랙과 진행 막대 홈에 씁니다.
- gap 가족(`gap · rowGap · columnGap`)은 자식을 늘어놓는 Stack·Inline·Grid가 같은 지도에서 고르고 Box에는 없습니다. 세 컴포넌트는 정렬 어휘 하나(`ALIGNS · JUSTIFIES · JUSTIFY_ITEMS`)를 나눠 쓰고, 기본값은 root가 갖고 class는 prop을 줄 때만 붙습니다. Grid의 `justify`는 track 분배이고 칸 안의 정렬은 `justifyItems`입니다.
- Select는 native select와 장식 Icon을 wrapper 안에 둡니다. ref와 폼 속성은 native select, className/style은 보이는 wrapper에 전달합니다. 화살표는 semantic ink를 사용합니다.

상위 화면 조합과 그 prop 축은 현재 패키지 API에 포함하지 않습니다. 실제 제품에서 반복되는 요구가 생기면 공통 책임과 축을 먼저 설계합니다.

---

## 글자

Typography는 원본 수치인 **Palette**, 이를 조합한 **글자 역할**, 실제 반복되는 완성 스타일만 담는 **Control preset**으로 나뉜다. 각 스타일은 Palette의 size · weight · leading · tracking을 참조하므로 컴포넌트가 `"0.875rem"` 같은 raw 값을 박지 않는다. 정본은 [docs/foundations/typography.md](docs/foundations/typography.md)다. Text variant는 제목 위계와 텍스트 역할을 조합한다:

`hero 36–60 유동 · display 32 · title 24 · heading 20 · subheading 16 · body 14 · caption 13 · label 12`, 컨트롤 글자는 preset으로 `13 · 13 · 14`.

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
- **줄바꿈은 서체가 정한다** — sans 는 `keep-all` + `break-word`(한글은 어절 사이에서만), mono 는 어디서든 끊는다(`anywhere`). Button · Badge preset은 `white-space: nowrap`까지 담아 한 줄 정책을 소유하고, Field · Textarea는 값이 줄을 정한다. 앱은 단어를 끊는 규칙(`word-break` · `overflow-wrap`)을 따로 두지 않는다.
- **fontSize 탈출구는 하나** — `label · caption · body`(`CONTROL_FONT_SIZES`)만 받고, 크기만 바꾸며 행간과 geometry는 preset에 남는다. Field 입력값은 preset의 `inputLeading` 20 줄상자에 앉고, Shape의 inset 식은 글자 줄 16을 읽는다. Text는 `numeric`으로 숫자 글리프만 `tabular-nums`로 맞춘다.
- **서체** — Pretendard Variable 은 필수다. 굵기 사다리 400·450·500·600·650·700 이 그것을 전제하고, 없으면
  시스템 폰트가 가까운 굵기로 접힌다(기하는 그대로). Pretendard 를 맨 앞에(라틴·한글을 한 몸으로 그려 굵기가 균형), `-apple-system`
  은 fallback. `family="mono"` 는 코드·토큰·식별자 같은 기술적 자리에만 — 숫자를 무조건
  등폭으로 두지 않는다. 데이터 표의 숫자 열은 sans 그대로 `tabular-nums` 로 자리만 맞춘다.
  폰트 스타일시트 주소(Pretendard · D2Coding, 버전 고정)의 정본은 `FONT_STYLESHEETS`(`tokens/typography.ts`, `/tokens`)이고,
  [install.md](docs/get-started/install.md#폰트) 의 스니펫과 `app/index.html` 이 그 두 줄을 그대로 쓴다 — `scripts/docs-sync.test.mjs` 가 둘을 정본과 대조한다.
- **label 은 sentence-case semibold** — mono·uppercase 아님.

---

## 계층 · 빌드 규칙

```
Foundations → Primitives → Atoms
```

문서(`docs/`)와 Playground 사이드바는 이 순서와 이름을 그대로 씁니다 — Foundations(Color · Typography · Shape · Layout · Motion), Primitives(Layout · Content · Interaction · A11y), Atoms. Foundations 페이지는 그 시스템의 원본 → 역할 → 조합 순서로 그립니다. Typography·Shape·Layout·Motion은 같은 보드(`app/src/playground/foundations/kit.tsx`)를 쓰고, Color는 예전 형태(팔레트 행렬 + 그룹별 값 카드)를 바탕으로 하되, 다른 페이지처럼 지금 테마의 값만 보여주고, 맨 아래에 accent × variant 조합 절(실제 Button·Badge 5 × 5)이 붙습니다. 모든 inspector 행은 원본(선택표 · 역할 spec · SOURCE)에서 파생합니다.

| 계층 | 수 | |
|---|---|---|
| Layout | 4 | `Box · Stack · Inline · Grid` |
| Content | 2 | `Text · Icon` |
| Interaction | 7 | `Pressable · Hoverable · Toggleable · Draggable · Droppable · ToggleGroup · Overlay` |
| A11y | 4 | `FocusScope · VisuallyHidden · RovingFocus · FormField` |
| Provider | 3 | `PaperProvider · useTheme · useResolvedTheme` — 테마 엔진의 entry이고 문서당 저장소 하나에 붙습니다. 첫 화면 전에 모드를 정하는 `themeBootScript`는 `/theme-boot`에서 나갑니다 |
| Atoms | 13 | `Button · IconButton · Field · Textarea · Select · Checkbox · Switch · Radio · Label · Badge · Spinner · Divider · Link` |

Primitive·Atom 인벤토리의 정본은 `packages/paper-ui/src/inventory.ts`입니다. `inventory.test.ts`가 `.` entry의 실제 export와 1:1로 대조하고, 앱의 사이트 지도(`app/src/site/site-map.ts`)가 Playground 목록(Foundations → Primitives → Atoms)을 거기서 파생합니다. 위 표는 그 목록을 옮긴 것이므로 인벤토리를 바꾸면 표도 함께 고칩니다.

Playground는 같은 계층을 파생해서 보여줍니다. 사이드바와 상세 페이지의 순서·이름·slug는 사이트 지도의 `PLAYGROUND_NAV`(인벤토리에서 파생)가 정하고, 항목마다 `app/src/playground/registry/entries/<slug>.tsx` 하나가 `Spec`을 맡습니다 — 만질 수 있는 prop(controls), 컴포넌트 자신의 기본값(defaults), 그리고 화면에 그려지면서 코드로도 찍히는 subject. 코드 패널은 손으로 쓴 문자열이 아니라 그 subject를 `printJsx`로 찍은 것이라 미리보기와 어긋날 수 없고, 코드를 고치면 같은 문법(`registry/jsx.ts`)으로 읽혀 컨트롤이 따라옵니다. select의 선택지는 `/tokens` 어휘 상수에서 오며, 부분집합(`subset`)·컴포넌트 지역 union(`local`)·열린 prop의 표본(`sample`)은 사유를 달아 표시합니다. 손으로 쓴 임시 목록은 두지 않습니다 — 출처 종류가 이 넷뿐이라 타입이 그 밖을 막고, `registry.test.tsx`가 사이트 지도와의 일치, 코드 왕복, 기본값(prop을 생략한 렌더와 같은지), 어휘 일치를 지킵니다. 생략한 prop을 root가 이미 쥐고 있어 기본값으로 적으면 쓸데없는 class가 붙는 경우(Inline의 `align`)에는 `rootDefault`가 select의 "default (…)" 이름만 대고 코드와 화면은 그대로 둡니다. Primitive·Atom의 API를 바꾸면 같은 변경에서 그 항목도 고칩니다. Overview(`/playground`, `app/src/playground/Overview.tsx`)는 표본의 파생 색인입니다 — 목록은 어휘에서 오고, 캡션의 수치는 토큰에서 읽거나 역할 이름으로 적습니다. Type scale과 Color 절은 소유자가 정한 형태로 남아 있고, 모든 표본 testid는 `tests/app/overview.spec.ts`가 계산값에 묶습니다.

패키지는 세 가지를 공개합니다 — 컴포넌트·hook(Primitive와 Atom, `.` entry), `tokens`와 역할 규칙(`/tokens`), 어휘 짝(축마다 상수 하나와 타입 하나, `/tokens`). 어휘 짝은 각자 자기 시스템 파일에 한 번 정의되고 `tokens/vocabulary.ts`가 모아 내보냅니다. 새 축은 원본 tree에서 파생하거나 `satisfies`로 양방향 묶어 그 파일에 더합니다. 제품별 조합은 앱이 소유하고, 여러 제품에서 반복된 뒤에만 공통 API로 승격합니다.

RovingFocus는 등록 항목의 Tab 진입점과 실제 DOM focus 탐색을 관리하며 선택과 분리합니다. ToggleGroup은 toggle button 그룹의 단일·복수 선택이고 다른 위젯의 role을 대체하지 않습니다. Overlay는 Trigger·Content·Close를 연결하며 기본 non-modal dialog, modal opt-in입니다. React Aria가 Portal·배치·중첩 dismissal·배경 inert·스크롤 잠금을 담당합니다. FormField/useField는 기존 Field Atom을 유지하면서 native label·설명·오류 ID를 연결합니다. 합성 도구 mergeProps는 additive handler 병합, composeEventHandlers는 caller preventDefault에 의한 내부 handler 취소, mergeRefs는 같은 DOM ref 연결입니다. 새 공통 상태·입력 관계 API도 Playground와 문서·실제 브라우저 검증을 함께 갱신합니다.

Primitive 계약의 정본은 [docs/primitives/](docs/primitives/README.md)(Layout · Content · Interaction · A11y)이고, Atom은 [docs/atoms/](docs/atoms/README.md)입니다. 기존 Layout·Content props를 유지하고 native ref를 전달합니다. Interaction은 컴포넌트와 usePress/useHover/useToggle/useDrag/useDrop을 함께 제공하고, FocusScope·VisuallyHidden·focus hook은 A11y에 둡니다. press는 일시적 입력, toggle은 유지되는 boolean 선택입니다. Draggable은 move/transfer 모드를 구분하며 Handle은 부모 전체 박스를 조작합니다. handle activation에서는 pointer·keyboard 모두 손잡이에서만 시작합니다. inline style은 실행 중에 정해지는 값에만 씁니다(Draggable 이동 좌표, Grid track, Overlay 층 깊이 변수, Overlay 앵커 위치, Overlay 원본 변수 운반, 호출자가 넘긴 style). semantic 토큰은 기존 class 경로를 유지합니다. 저수준 입력·포커스·native transfer 처리는 React Aria를 재사용합니다. 기존 Atom을 자동으로 새 행동 컴포넌트로 교체하지 않습니다.

1. **raw 색값 금지** (`paper/raw-color`) — surface hex는 `tokens/palette.ts`, accent hex·OKLCH는 `tokens/color-ladder.ts`에만. 소비처는 `tokens.color.X`로만 참조.
2. **원본 import 격리** (`no-restricted-imports`) — palette·ladder·shape·layout 원본과 semantic VALUES는 consumer에서 import 금지. Playground Foundations inspector만 원본을 보여주기 위한 예외입니다.
3. **inline style 로 토큰 주입 금지** (`paper/inline-token`) — package 스타일은 `.css.ts` className 으로만 토큰을 적용합니다. 패키지의 `.ts` · `.tsx` 에서 `tokens` · `styles` · `internal` · 패키지 자신에서 온 값이 `style` 에 닿으면(변수 · 함수 호출 · hook · 구조 분해를 거쳐도) 막습니다. runtime 값만 예외이고 목록은 이것이 전부입니다: Draggable 이동 좌표, Grid track, Overlay 층 깊이 변수, Overlay 앵커 위치, Overlay 원본 변수 운반, 호출자가 넘긴 style. 예외 모듈(`internal/aria` · `internal/measure` · `theme/source-carry`)은 `eslint.config.js` 의 `runtime` 옵션에 이유와 함께 선언합니다.
4. **길이는 token source에만** (`paper/source-numbers`) — 패키지는 예외 없이 원본 파일(shape·layout·typography·motion·색)에만 숫자를 씁니다. 앱은 간격·형태·깊이(padding·margin·gap·offset·radius·선·그림자·z)를 역할로 고르고, 그 화면에만 있는 치수(폭·높이·그리드 트랙)만 직접 씁니다. 0·100%·정렬·회전 같은 구조적 CSS는 컴포넌트가 소유합니다.
5. **패키지 CSS는 레이어 안에** (`paper/layered-styles`) — 패키지 `.css.ts`는 vanilla-extract의 규칙 API(`style` · `styleVariants` · `globalStyle` · `globalLayer` …)를 직접 import하지 않고 `tokens/layers.css.ts`의 `layered(name)`으로 규칙을 만듭니다. 레이어를 정의하는 layers.css.ts만 예외이고, `keyframes` · `createVar` · `fallbackVar` · `createGlobalVar`는 그대로 씁니다.
6. **규칙은 주석으로 끄지 않음** (`paper/no-rule-disable`) — paper 규칙은 `eslint-disable` 주석으로 끄지 않고, 예외는 `eslint.config.js`에만 선언합니다. 다른 규칙을 끄는 주석은 `-- 이유`를 답니다. 쓰이지 않는 disable 주석도 오류입니다.
7. **앱은 내부 class 이름 문자열을 쓰지 않음** (`paper/internal-class`) — 앱(`app/src`)과 테스트(`tests/`)는 `pui-` 뒤에 글자가 오는 문자열(템플릿 포함)을 쓰지 않습니다. 공유 축의 class 는 resolver 가 styles/ 의 typed map(`surfaceClass` · `inkClass` · `accentVariantClass` · `spaceClass`)을 인덱싱해 고르고 이름은 빌드가 짓습니다. 변수 `--pui-*` 와 속성 `data-pui-*` 는 통과합니다.

일곱 규칙은 eslint가 막고 build·prepublish·CI가 그 검사를 돌립니다.

**접근성도 빌드가 지킵니다.** `eslint-plugin-jsx-a11y`(recommended)를 `polymorphicPropName:"as"`로 설정해 `<Box as="button">` 같은 polymorphic 요소까지 검사합니다. 유효한 role·aria, 대체텍스트, 양수 tabindex 금지 등을 lint하며, 폼 아톰은 `label-has-associated-control`의 `controlComponents`에 등록합니다. 상호작용별 runtime 계약은 실제 제품 구현과 검토가 책임집니다.

---

## 계약과 테스트

`docs/`의 계약 문장·문단·표 바로 앞에는 렌더되지 않는 표시 `[contract:<area>.<subject>.<slug>]: #`를 한 줄로 둡니다. area는 foundations · primitives · atoms · install · guardrails · app 중 하나입니다. 그 계약을 단언하는 테스트는 제목을 `[<id>]`로 시작하고, 한 테스트가 계약 여럿을 단언하면 id를 이어 씁니다(`[a] [b] 제목`). 새 계약 문장은 같은 변경에서 표시와 테스트를 함께 얻습니다. `scripts/check-contracts.mjs`가 `pnpm test` 안에서 둘을 1:1로 대조합니다 — 같은 id의 표시가 둘이거나, 테스트 없는 표시(skip · todo · fixme · fail 테스트는 세지 않습니다), 표시 없는 테스트 id, 내용 블록이 뒤따르지 않는 표시, 문단·목록·표에 이어 붙어 글자로 보이는 표시는 실패입니다. 표 바로 위의 표시는 GitHub에서 글자로 보이므로 표와 표시 사이에 빈 줄을 둡니다.

테스트 파일은 계층과 시스템 이름을 따릅니다. 단위 테스트는 소스 옆에 `tokens/{color,typography,shape,layout}.test.ts` · `styles/typography.test.ts` · `theme/{engine,store}.test.ts` · `theme/provider.test.tsx` · `primitives/{layout,content,theme,interaction,a11y}.test.tsx` · `atoms/<Atom>.test.tsx`로, e2e는 `tests/{foundations,primitives,atoms,app,install}/<시스템>.spec.ts`로 둡니다. 테스트 이름에서 Foundations는 Color부터 Motion까지 다섯 시스템만 뜻합니다. e2e 도구(하네스 · 키보드 · 기하 · 콘솔 · 계산된 스타일 probe `style.ts`)와 단위 테스트도 함께 쓰는 `dp()`는 `tests/support/`에 있습니다. 앱의 단위 테스트(`app/src/**/*.test.ts(x)`)는 문서 파서 · 링크 해석 · `docs/` 전체의 링크와 앵커 · 사이트 지도 · Playground registry와 JSX 문법에 더해, Foundations inspector(`playground/foundations/inspector.test.ts`: 역할 설명 `ROLE_NOTES`의 누락 없음 · 두 테마의 Palette 경로 이름 · 타이포 preset 범위)를 지킵니다.

e2e는 자기 서버를 직접 띄웁니다. 앱은 41731, 하네스(`fixtures/harness`, `?case=geometry|theme|layers|layout|typography`)는 41732 포트에서 `--strictPort`로 뜨고 이미 떠 있는 서버를 재사용하지 않으므로, 포트를 다른 서버가 쓰고 있으면 실행이 실패합니다. 포트는 `E2E_APP_PORT` · `E2E_HARNESS_PORT`로 바꿉니다. 하네스는 Vite 내부 경로 없이 패키지를 exports로만 불러옵니다. 프로젝트는 chromium · chromium-dark · chromium-reduced-motion · chromium-forced-colors · firefox · webkit 여섯입니다. firefox · webkit은 `foundations/shape` · `primitives` · `atoms` spec을 돌고, `tests/dist/`는 배포본 전용 설정만 돌립니다 — 이름은 dist여도 산출물이 아니라 소스이므로 git · eslint · check-contracts는 산출물 `dist/`와 달리 이 디렉터리를 읽습니다. Tab은 `tests/support/keyboard.ts`의 `tab()`으로만 누릅니다 — macOS WebKit에서는 Alt+Tab이어야 버튼까지 닿습니다. 한 엔진에서만 나는 실패는 `playwright.config.ts`의 `ENGINE_EXCLUSIONS`에 이유와 다시 켜는 단계를 적어 그 엔진에서만 끕니다.

---

## 작업 완료 전 체크

- [ ] `pnpm verify` 가 통과했는가 — check(lint · typecheck · 단위 테스트 · 계약 대조) → build(패키지 → 앱) → e2e. CI 와 배포 전 검사(`prepublishOnly`)가 같은 명령을 돌린다
- [ ] 작업 중에는 `pnpm check` 로 빠르게 확인하고, Foundations · Primitives · Atoms 를 바꿨다면 `pnpm test:e2e` 도 함께 돌렸는가
- [ ] 패키지 package.json · entry · 빌드를 바꿨다면 `pnpm --filter @studio-baeks/paper-ui check:package` 도 돌렸는가
- [ ] CSS 기능을 새로 썼다면 `scripts/browser-baseline.mjs` 표에 그 행을 더했는가
- [ ] 색을 추가했다면 — 정말 *의미* 가 있는가. 장식이면 넣지 않는다
- [ ] 큰 면을 색으로 채우지 않았는가 (면은 검정 primary만)
- [ ] Primitive·Atom API를 수정했다면 — app의 실제 사용 예와 문서, 그리고 Playground 항목(`app/src/playground/registry/entries/`)을 갱신했는가
- [ ] prop이 받는 닫힌 값의 집합(축)을 더하거나 바꿨다면 — 원본 tree에서 파생하거나 `satisfies`로 묶고 `tokens/vocabulary.ts`에 상수·타입 짝으로 공개했는가
- [ ] 문서에 계약 문장을 더했다면 — 같은 변경에서 `[contract:…]: #` 표시와 그 id로 시작하는 테스트를 더했는가
- [ ] 데모(`app/`)가 여전히 서는가
