// The prose the generators cannot read from a source. Each map is keyed by a source key or a repository path,
// so a renamed key or a new directory is a type error or a failing test, not a stale sentence.

import type { AccentTone, TextVariant } from "@studio-baeks/paper-ui/tokens";

export const TONE_USES: Record<AccentTone, string> = {
  solid: "채운 면, 상태 점",
  wash: "solid 위 글자",
  ink: "soft·hairline·ghost 위 글자와 의미색 글자 (링크는 `interaction.link`)",
  soft: "soft variant의 옅은 면",
  subtle: "muted variant의 글자",
};

export const ROLE_USES: Record<TextVariant, string> = {
  hero: "랜딩 헤드라인",
  display: "큰 제목",
  title: "페이지 제목",
  heading: "섹션 제목",
  subheading: "작은 제목",
  body: "본문 (기본값)",
  caption: "보조 정보·메타",
  label: "필드 라벨·표 머리·짧은 이름",
};

// The default tag a Text variant renders as (Text.tsx).
export const ROLE_TAGS: Record<TextVariant, string> = {
  hero: "h1",
  display: "h1",
  title: "h1",
  heading: "h2",
  subheading: "h3",
  body: "p",
  caption: "p",
  label: "span",
};

export type PresetName = "button.medium" | "button.strong" | "field" | "textarea" | "badge";

export const PRESET_USES: Record<PresetName, string> = {
  "button.medium": "Button·IconButton (solid 외)",
  "button.strong": "solid Button",
  field: "Field · Select",
  textarea: "Textarea",
  badge: "Badge",
};

// Directories of the two source trees the AGENTS tree names, each with its note. A directory without a note
// fails generated.test.ts, so the tree cannot grow a folder nobody described.
export const DIR_NOTES: Record<string, string> = {
  "packages/paper-ui/src/atoms": "Atom 14개 — 한 가지 역할의 컨트롤, 모두 Primitive 위에 섭니다",
  "packages/paper-ui/src/atoms/recipes": "Atom이 함께 쓰는 형태와 상태 조각(input-frame · selection-control) — 색은 없고, 색은 primitives/paint/recipes.css.ts에서 옵니다",
  "packages/paper-ui/src/internal": "패키지 안쪽 도구 — 밖으로 나가지 않습니다",
  "packages/paper-ui/src/internal/aria": "React Aria 어댑터 — `@react-aria/*`를 import하는 유일한 자리",
  "packages/paper-ui/src/primitives": "두 차수 — 1차 바탕(Box · Text · Icon · polymorphic · composition)과 2차 Box + 능력 하나",
  "packages/paper-ui/src/primitives/a11y": "1차 A11y — FocusScope · VisuallyHidden · Portal · LiveRegion",
  "packages/paper-ui/src/primitives/drag": "2차 Drag — Draggable · Droppable",
  "packages/paper-ui/src/primitives/field": "2차 Field — FormField와 입력 연결",
  "packages/paper-ui/src/primitives/float": "2차 Float — Floating과 중첩 elevation(nestElevation)",
  "packages/paper-ui/src/primitives/focus": "2차 Focus — RovingFocus",
  "packages/paper-ui/src/primitives/layout": "2차 Layout — Stack · Inline · Grid, 배치만 맡습니다",
  "packages/paper-ui/src/primitives/paint": "2차 Paint — Surface · Paint와 색 규칙이 사는 곳(recipes.css.ts는 내부)",
  "packages/paper-ui/src/primitives/press": "2차 Press — Pressable · usePressable, 색을 갖지 않습니다",
  "packages/paper-ui/src/primitives/select": "2차 Select — Selectable · SelectableGroup, 상태와 aria만 맡습니다",
  "packages/paper-ui/src/resolvers": "공유 축 이름 → class (styles/의 typed map 인덱싱)",
  "packages/paper-ui/src/styles": "class의 실체 — resolvers를 import하지 않습니다",
  "packages/paper-ui/src/theme": "테마 — 모드(light · dark)를 고르는 일",
  "packages/paper-ui/src/tokens": "값의 유일한 정의 위치 — SOURCE → VALUES → 역할. *-recipes는 역할을 조합한 것입니다",
  "packages/paper-ui/src/tokens/inspect": "inspector가 시스템마다 읽는 원본의 읽기 전용 재수출 — 패키지와 배포본에 들지 않습니다",
  "app/src/compositions": "앱의 조각 — 패키지가 싣지 않는 것을 시스템의 부품으로 조합합니다",
  "app/src/docs": "docs 본문 파싱과 링크 해석, Prose 렌더링",
  "app/src/docs/generated": "문서의 생성 블록 — `pnpm docs:sync`가 원본에서 다시 씁니다",
  "app/src/pages": "라우트 페이지 — Home · Docs · demo/",
  "app/src/pages/demo": "Demo 화면 — 이슈 트래커, Primitive · Atom을 실제 조합 안에서 봅니다",
  "app/src/playground": "Playground — Overview · 사이드바 · 상세와 foundations/ · registry/",
  "app/src/playground/foundations": "Foundations 페이지 — 시스템마다 원본 → 역할 → 조합을 그립니다",
  "app/src/playground/registry": "항목 spec과 코드 찍기(printJsx) — 항목마다 entries/ 하나",
  "app/src/playground/registry/entries": "항목마다 Spec 하나 (`<slug>.tsx`)",
  "app/src/site": "사이트 셸 — SiteLayout · 헤더 · 사이드바 · 사이트 지도(site-map.ts)",
};

// The files that carry a fact the directory note cannot: an entry, a barrel, an owner. The keys are paths from
// workspace/, and a file that no longer exists fails the tree, so a rename cannot leave a stale line.
export const FILE_NOTES: Record<string, string> = {
  "packages/paper-ui/src/index.ts": "entry `.` — 컴포넌트 · hook · Provider (`\"use client\"`). 공개 이름을 한 곳에 다 적은 목록이고 `export *`가 없습니다",
  "packages/paper-ui/src/inventory.ts": "이름 · 분류 · 순서의 정본 — import가 없고 inventory.test가 export와 대조합니다",
  "packages/paper-ui/src/tokens/index.ts": "나머지 패키지가 읽는 유일한 문 — 역할 · 어휘 · 조합뿐이고 barrel.test가 지킵니다",
  "packages/paper-ui/src/tokens/public.ts": "entry `/tokens`",
  "packages/paper-ui/src/tokens/overrides.ts": "`sourceVars` — 원본 경로로 덮어쓰는 변수 이름",
  "packages/paper-ui/src/tokens/vocabulary.ts": "어휘 짝 — 축마다 상수 하나와 타입 하나",
  "packages/paper-ui/src/tokens/color-modes.ts": "모드 어휘",
  "packages/paper-ui/src/tokens/typography-recipes.ts": "글자 규칙 함수",
  "packages/paper-ui/src/tokens/variables.ts": "모든 CSS 변수를 데이터로 모읍니다",
  "packages/paper-ui/src/tokens/variables.css.ts": "그 변수를 스타일시트로 배출합니다",
  "packages/paper-ui/src/tokens/layers.css.ts": "cascade layer의 이름과 `layered()`",
  "packages/paper-ui/src/tokens/state.ts": "상태 · 값 · 표식 attribute의 이름(`stateAttributes` · `stateSelector`)",
  "packages/paper-ui/src/tokens/state-recipes.ts": "상태의 모습을 담은 plain style 조각(`focusRing` · `stateStyle` · `linkStyle`)",
  "packages/paper-ui/src/tokens/resolve-dp.ts": "CSS 길이식을 dp로 푸는 도구 — 테스트와 docs 생성기가 쓰고, 공개하지 않습니다",
  "packages/paper-ui/src/styles/color.css.ts": "면 · 잉크 · accent × variant",
  "packages/paper-ui/src/styles/space.css.ts": "간격",
  "packages/paper-ui/src/styles/elevation.css.ts": "높이 — position · z · 그림자",
  "packages/paper-ui/src/styles/motion.css.ts": "presence · loop · reduced-motion 정책",
  "packages/paper-ui/src/styles/typography.css.ts": "Text 역할 · mono · 숫자 · control preset · fontSize class",
  "packages/paper-ui/src/styles/theme.css.ts": "문서 바탕 · 스코프 잉크",
  "packages/paper-ui/src/styles/states.css.ts": "tint 변수의 `@property` 등록 · 포커스 링 baseline",
  "packages/paper-ui/src/styles/global.css.ts": "entry `/styles.css`",
  "packages/paper-ui/src/internal/refs.ts": "`mergeRefs` · `useMergedRef`",
  "packages/paper-ui/src/internal/measure.ts": "`measureSpace` · `useMeasuredSpace` — gap 단계를 쓰이는 자리의 픽셀로 잽니다",
  "packages/paper-ui/src/internal/useControllableState.ts": "제어 · 비제어 상태를 한 hook으로",
  "packages/paper-ui/src/internal/errors.ts": "`paperError`",
  "packages/paper-ui/src/internal/render-target.ts": "`as`와 disabled의 유일한 투영 `targetProps`",
  "packages/paper-ui/src/internal/locale.ts": "locale과 messages를 읽는 context",
  "packages/paper-ui/src/internal/messages.ts": "Atom 문구 목록",
  "packages/paper-ui/src/internal/direction.ts": "`directionOf` · `localeDirection`",
  "packages/paper-ui/src/internal/shape.ts": "`controlGeometry` — 크기가 있는 모든 Atom의 단일 진입점",
  "packages/paper-ui/src/internal/joinClass.ts": "class 문자열 잇기",
  "packages/paper-ui/src/theme/engine.ts": "순수 규칙 — React와 CSS가 없습니다",
  "packages/paper-ui/src/theme/store.ts": "문서당 저장소",
  "packages/paper-ui/src/theme/PaperProvider.tsx": "Provider",
  "packages/paper-ui/src/theme/context.ts": "모드와 제어의 context(`useTheme`)",
  "packages/paper-ui/src/theme/scope.ts": "스코프 모드(`useThemeScope` · `usePortalScope`)",
  "packages/paper-ui/src/theme/source-carry.ts": "Portal이 옮기는 열린 자리의 원본 덮어쓰기",
  "packages/paper-ui/src/theme/boot.ts": "entry `/theme-boot`",
  "packages/paper-ui/src/primitives/bare-button.css.ts": "부품이 쓰는 button reset",
  "packages/paper-ui/src/atoms/button-base.tsx": "Button과 IconButton의 몸 하나 — 내부 모듈",
  "packages/paper-ui/src/atoms/input-control.ts": "입력 틀 셋과 선택 표식 셋의 FormField 관계 · 키보드 포커스 · 틀의 속성 — 내부 모듈",
};
