## 2026-10-06 — Rebalance the control ladder to 30/34/40

- Files: Shape tokens, Playground specimens and registry descriptions, geometry tests, token documentation, and `AGENTS.md`.
- Summary: Adjust the experimental control heights to 30/34/40px, button padding to 10/12/16px, and input padding to 7/9/12px while keeping interaction radius 4px and typography unchanged.

The 30px small step preserves the Paperdown toolbar size while the 34px default gives general forms more room. Input ink insets including the border are 8/10/13px, within 0.5px of the corresponding vertical ink insets for the existing 13/13/14px type. Textarea uses 3.5/5.5/9px block padding derived from its 20px line height, preserving equal first-line ink insets. Layout, palette, and pill geometry remain independent.

Typecheck, library and app builds, and all three geometry browser checks pass; the latter also assert button padding, value space, cross-control alignment, and keyboard focus. The live Playground shows the updated sizing and documentation. Existing baseline lint failures in Tokens inspector remain outside this geometry change. Full-suite baseline issues recorded in the preceding experiment are not claimed resolved. The experiment stays on `dev/paperdown-control-geometry` without publication or merge. Screenshot and validation logs are preserved under the dated Bufs folder, with the screenshot copied to Downloads.

## 2026-10-06 — Experiment with Paperdown control geometry

- Files: `workspace/packages/paper-ui/src/tokens/shape.ts`, Playground specimens and registry descriptions, geometry E2E tests, token documentation, and `AGENTS.md`.
- Summary: Preserve all pending work in snapshot commit `a818e5e`, then experiment on `dev/paperdown-control-geometry` with heights 26/30/36px, interaction radius 4px, button padding 8/10/12px, and input padding 6/8/10px.

Paperdown has a 30px toolbar field and 4px corner rather than a complete size ladder. The medium step adopts that geometry; small and large steps extrapolate it without changing the existing 13/13/14px typography. Layout heights, Box spacing, layout radii, palette, and pill silhouette stay independent. Shared interaction radius also affects badges, menus, and navigation; this is a deliberate consequence to review on this experimental branch, not a button-only CSS override. Textarea padding follows the actual 20px leading and font size: 2.5/4.5/7px preserves the first-line horizontal/vertical ink relationship. The old perfectly-square single-line ink contract becomes a maximum 1px difference because control height and input inset are independently chosen.

Typecheck, all 45 unit tests, library build, and application build pass. Three new browser integration checks cover cross-control alignment at every size, value space, radius, unchanged type size, and keyboard focus. Existing geometry expectations were updated for intentional changes only. The full 56-test E2E suite reports 39 passing and 17 failing; remaining failures include pre-existing palette, semantic border, typography, and default segmented-shape expectations and are not a declaration of a green release. Lint still reports the two baseline private imports in the Tokens inspector. The previous implementation report already recorded baseline lint and E2E failures before this experiment.

The live Playground control rows and Project Manager demo were visually inspected. No package publication, production deployment, or merge into the parent branch was performed. Validation output and screenshots remain in `/Users/baeks/Bufs/Codex Files/2026-10-06/paper-ui-geometry/`; the review screenshot is also delivered in Downloads.

## 2026-10-06 — Document the current Paper UI implementation

- 변경 파일: Reports의 `2026-10-06_01-49-paper-ui-implementation-report.tex`, 동명 PDF·Markdown 및 `logs.md`; 제품 구현 변경 없음
- 요약: 미커밋 작업 트리를 포함해 Paper UI 전체를 19개 장·3개 부록·36쪽 보고서로 분석했습니다. [보고서](</Users/baeks/Reports/2026-10-06_01-49-paper-ui-implementation-report.pdf>)

파일별 코드 나열 대신 철학과 닫힌 어휘, palette의 생성·semantic 매핑, token 참조·CSS emission, typography와 geometry의 분리, native DOM·compound 상태·접근성 관계, theme context와 portal, 개발 앱·배포·검증의 연결을 설명했습니다. 기준 HEAD는 `6c2c80941e0f6baf93f704d80e3925d4b152ccc1`이며 조사 시작의 tracked 수정 74개와 untracked 3개를 모두 포함했습니다. registry는 실제 5/13/10/11 분포의 39개 항목으로 확인했습니다. 과거 docs·주석·테스트의 수치를 현재 구현값의 근거로 삼으면 잘못된 설명이 생기므로 의도·관찰·해석을 구분했습니다.

`pnpm -r typecheck`·단위 테스트 13파일/45개·library/app production build는 통과했습니다. Lint는 Tokens inspector의 private colors/palette import 2건, Chromium E2E는 53개 중 23개가 실패했습니다. 의도된 palette·size 갱신과 검토가 필요한 여백·border 관계를 구분했으며, semantic hover 검사는 첫 border assertion에서 멈춰 후속 shadow 부재는 source에서 확인했습니다. 제품 source나 테스트를 수정하여 통과시키지 않았습니다.

myformats-latex의 기본 article·kotex·A4·2.5cm 여백·표지 전용 페이지·번호 인용 양식을 적용했습니다. native compiler와 pdfLaTeX 빌드가 성공했고 전체 페이지 overview 및 표지·밀집 본문·References를 렌더링해 확인했습니다. Overfull·missing glyph·미해결 인용은 없습니다. 원본은 Reports, 전달 PDF/TeX 사본은 Downloads, Git diff·status·untracked source 스냅샷과 검증·조판 중간 파일은 Bufs에 보존했습니다.

## 2026-10-02 — Propose cross-app Shape and Typography contracts

- 변경 파일: `/Users/baeks/Reports/Paper UI Cross-App System Proposal 2026-10-02.tex`, 동명 PDF; 제품 구현 변경 없음
- 요약: Doodle·BOM Manager·Todos(daily-todo)·Books(booklog)·Cyclone Atlas(typhoon-atlas)의 source와 로컬 화면을 비교하고 Shape·Typography·컴포넌트 외형·적용 순서를 15쪽 보고서로 제안했습니다. [보고서](</Users/baeks/Reports/Paper UI Cross-App System Proposal 2026-10-02.pdf>)

전역 Dense 모드보다 컨트롤 recipe가 Typography와 Shape 및 root/input/icon slot을 함께 선택하도록 만드는 것이 우선입니다. 반복 행의 density, 실제 hit area, Prose 읽기 리듬, 앱의 콘텐츠 좌표를 분리해야 Books의 116px media 행과 BOM의 52px 편집 행을 예외 토큰으로 늘리지 않고 설명할 수 있습니다. 현재 Text Ladder와 32px 기본 컨트롤을 출발점으로 유지하고, Field/Select/Textarea에는 20px value leading과 첫 줄 정렬을 명시하는 안을 제안했습니다. ListRow·Toolbar·Prose·Toast 등 반복된 공백은 공통화 후보, 책 표지·캔버스·지도/차트 등 domain 형태는 앱 소유로 남겼습니다.

소비 앱의 같은 0.1.0 표기가 같은 패키지 내용은 아니었습니다. 네 앱과 BOM의 설치 CSS fingerprint가 다르며 Atlas는 html 14px로 인해 의도한 13px가 11.375px로 축소됩니다. 10월 1일 검토의 BOM 66px 행/root 축소 문제는 현재 52px 토큰/16px root로 정리되어 있어 현행 결함으로 재기록하지 않았습니다. 이 버전·단위 차이를 baseline 정렬 전에 사다리 평가의 근거로 삼으면 잘못된 결론이 생깁니다.

데스크톱 1280×720 light 화면·computed style을 확인했습니다. 모바일은 source만 조사했고 viewport 도구가 실제 크기를 바꾸지 못해 실행 검증은 하지 못했습니다. dark 전체·접근성·실사용 흐름의 전수 검증도 수행하지 않았습니다. 제품 테스트는 실행하지 않았으며 조사용 dev server 다섯 개는 종료했습니다. native compiler와 pdfLaTeX 빌드가 성공했고 표지·밀집 표·시각 예시·코드·References를 렌더링하여 확인했습니다. overfull/미해결 참조는 없으며 원본은 Reports, 전달 사본은 Downloads, 조사·조판 중간 파일은 Bufs에 보존합니다.

## 2026-10-02 — Review typography contracts and component usage

- 변경 파일: `/Users/baeks/Reports/Paper UI Typography Review 2026-10-02.tex`, 동명 PDF; 제품 구현 변경 없음
- 요약: Typography Palette·Text·Control·CSS 생성·전체 컴포넌트·소비 앱의 경로를 조사하고 12쪽 보고서를 작성했습니다. [보고서](</Users/baeks/Reports/Paper UI Typography Review 2026-10-02.pdf>)

현재 사다리와 Palette 기반은 유지할 가치가 있습니다. 다만 수치가 같다는 이유로 Navbar/Command의 기본 문구를 navigation.active, TOC의 활성 문구를 button regular에 묶으면 의미가 다른 역할이 함께 바뀝니다. 물리적 CSS 중복 제거와 semantic 역할 합병을 분리하는 것이 개선의 중심입니다. 전역 body는 400, Text body는 500이며 Field wrapper leading 16과 실제 input leading 20도 달랐습니다. Textarea padding의 19.5px line-box 가정은 현행 20px과 어긋납니다. 450·650은 현재 preset에서 실제 사용 중이므로 미사용 단계로 삭제할 이유는 없습니다.

Typecheck·패키지 build는 통과했습니다. 관련 E2E 10개 중 8개가 통과했고 입력=본문 weight라는 과거 assertion과 Textarea 여백 근사 관계가 실패했습니다. 전자는 현행 역할 차이, 후자는 geometry 산식 갱신 문제로 구분했습니다. Lint는 Tokens.tsx의 기존 colors/palette import 제한 위반 2개로 실패했습니다. navigation size를 999로 바꾼 격리 복사본도 strict typecheck를 통과하여 leaf 검증 공백을 재현했습니다. native compiler·pdfLaTeX 컴파일 및 표지·밀집 본문·References 조판 검사가 성공했고 overfull/미해결 참조는 없습니다. Reports에 원본, Downloads에 전달 사본, Bufs에 검증용 파일을 보존합니다.

## 2026-10-01 — Review Shape contracts through BOM Manager

- 변경 파일: `/Users/baeks/Reports/Paper UI Shape System Review 2026-10-01.tex`, 동명 PDF; 공유 라이브러리 변경 없음
- 요약: BOM Manager 디자인 정돈 중 Shape·Typography·문서·소비 CSS의 계약을 비교하고 5쪽 보고서를 작성했습니다. [보고서](/Users/baeks/Reports/Paper%20UI%20Shape%20System%20Review%202026-10-01.pdf)

`AGENTS.md`의 radius 6/md height 34와 실제 Shape의 8/32가 다릅니다. Textarea padding 계산은 19.5px line box와 3.25px 반 줄 여백을 전제로 하지만 현재 preset은 13/20 또는 14/20입니다. 다만 실제 glyph 잉크 실측과 line-box 모델을 혼동하면 안 되며, Field 첫 줄 정렬과 사방 같은 여백을 동시에 만족시키는 조건도 먼저 정해야 합니다. 소비 앱의 66px td 높이는 Table comfortable 52px을 무효화했고, root body font-size는 rem 크기를 암묵적으로 축소했습니다. 이 둘은 토큰 자체 결함과 구분해 소비 위험으로 기록했습니다.

공유 시스템의 값 변경은 후속 판단으로 남겼습니다. native LaTeX compiler와 pdfLaTeX 빌드가 성공했고 표지·밀집 본문·References를 렌더링해 확인했습니다. 긴 파일 경로는 `\path`로 줄바꿈하여 overfull과 미해결 참조를 없앴습니다. 출력 사본은 Downloads, 원본은 Reports, 빌드 중간 파일은 Bufs에 보존합니다.

## 2026-09-29 — Keep light well at neutral.200

- 변경 파일: `workspace/packages/paper-ui/src/tokens/colors.ts`, `colors.test.ts`, 색 토큰 설명 문서
- 요약: 라이트 `bg.well`을 `neutral.150`으로 시각 비교한 뒤 `neutral.200`으로 되돌렸습니다. 다크 매핑은 그대로입니다.

스크린샷의 트랙 배경 `#eeeef0`은 현행 팔레트에 없고 옛 `neutral.200` 값이었습니다. 현행 ramp에서 가장 가까운 `neutral.150`(`#ececee`)을 Switch·SegmentedControl과 preview surface에 적용해 봤지만, 컨트롤 트랙은 `neutral.200`(`#e5e5e7`)의 분리가 더 적절하다는 판단으로 되돌렸습니다. `well`을 범용 surface로 둘지는 별도 semantic API 결정으로 남깁니다.

## 2026-09-29 — Add persistent surface comparison to previews

- 변경 파일: `workspace/app/src/playground/Detail.tsx`, `detail.css.ts`, `workspace/tests/detail-surface.spec.ts`
- 요약: 컴포넌트 상세 preview 왼쪽 상단에 네 surface 색상 버튼을 추가하고, 선택을 페이지 이동과 새로고침 뒤에도 유지하도록 했습니다.

선택값은 컴포넌트별 prop 상태와 달리 공유해야 하므로 keyed `DetailView`가 다시 생성될 때 localStorage에서 읽습니다. 버튼은 각 surface 자체를 배경으로 보여주고 현재 선택에만 체크를 그립니다. Table의 flush preview에는 toolbar 높이만큼 위쪽 공간을 둬 표 머리와 겹치지 않게 했습니다.

## 2026-09-29 — Keep well on control tracks after comparison

- 변경 파일: `workspace/packages/paper-ui/src/atoms/Switch.css.ts`, `workspace/packages/paper-ui/src/molecules/SegmentedControl.css.ts`
- 요약: 두 컨트롤의 트랙을 `bg.sunken`으로 비교한 뒤 `bg.well`로 되돌렸습니다.

별도 깊이 토큰 없이도 트랙이 읽히는지 라이트·다크 preview에서 확인했습니다. SegmentedControl은 선택 면과 트랙이 구별됐지만, 꺼진 Switch는 라이트에서 너무 옅어졌고 다크에서도 손잡이와 주변 raised 면의 차이가 작아졌습니다. 라이트 `well=neutral.200`을 유지한 채 두 트랙에 다시 적용했습니다.

## 2026-09-29 — Rebalance light inset surfaces

- 변경 파일: `workspace/packages/paper-ui/src/tokens/colors.ts`, `colors.test.ts`, 색 토큰 설명 문서
- 요약: 라이트 `bg.sunken`을 `neutral.200`에서 `neutral.100`, `bg.well`을 `neutral.300`에서 `neutral.200`으로 옮겼습니다.

다크 매핑을 검토하며 반복되는 inset 면이 정보보다 먼저 보이지 않도록 명도 차이를 좁혔습니다. 같은 원칙을 라이트에도 적용해 `canvas.50 → sunken.100 → well.200` 순서로 정리했습니다. 각 면은 여전히 구별되고, 다크 토큰은 그대로 유지했습니다.

## 2026-09-29 — Calm the dark semantic color mapping

- 변경 파일: `workspace/packages/paper-ui/src/tokens/colors.ts`, `colors.test.ts`, 색 토큰 설명 문서
- 요약: 다크 전용 surface를 좁은 neutral 단계로 다시 매핑해 canvas 위에 raised가 미묘하게 떠 보이도록 하고, border·텍스트·accent 면과 primary control의 대비를 낮췄습니다.

`canvas`와 `sunken`은 같은 가장 어두운 step을 사용합니다. 두 토큰은 같은 화면에서 역할이 다르지만, 반복되는 inset 셀이 카드처럼 튀지 않도록 색 차이를 강제하지 않는 선택입니다. `raised`는 한 단계만 밝히고 `well`도 기존보다 어둡게 내려 큰 면의 깊이를 선이 아닌 명도로 읽히게 했습니다. 이 변경은 semantic 매핑에 한정하며 palette source나 컴포넌트 스타일은 바꾸지 않았습니다.

## 2026-09-29 — Consolidate Control typography presets

- 변경 파일: `workspace/packages/paper-ui/src/tokens/text.ts`, typography resolver/styles, control atoms·navigation consumers, Table, Typography Playground, `docs/foundations/tokens.md`, `AGENTS.md`
- 요약: 전체 컴포넌트의 font-size·weight·leading·tracking 조합을 대조해 중복 preset family를 13개에서 6개로 줄였습니다. Field(Input·Select), Navigation(Menu·Sidebar·Tree·Navbar·Command), Button action(Tab·Segmented 포함)을 공유하고, Badge의 가짜 size별 typography를 하나의 고정 preset으로 통합했습니다. Banner·TableOfContents의 기본 글자는 Control 토큰 대신 Text caption을 사용합니다.

값이 같다는 이유만으로 의미가 다른 스타일을 한 군데로 억지로 합치지 않고, 실제 소비 컴포넌트가 같은 역할을 수행하는지 확인해 매핑했습니다. Text caption과 Navigation active는 숫자 조합이 일부 겹쳐도 잉크 색상과 상태 의미가 다르므로 서로 독립적으로 유지합니다. Table cell의 단일 font-size 지정도 완성된 Text body class로 바꿔 나머지 속성 누락을 막았습니다. `pnpm typecheck`와 패키지 build는 통과했습니다. `pnpm lint`는 기존 `Tokens.tsx`의 palette/colors 직접 import 제한 두 건에서 실패했습니다.

## 2026-09-28 — Apply role-based Typography preset classes

- 변경 파일: Typography token/preset resolver, control atoms·navigation components, Typography Playground, docs/foundations/tokens.md
- 요약: Control Typography를 button/input/select/textarea/badge와 navigation·menu·tab 등 역할별 완성 preset으로 나누고 resolveControlTypography()가 CSS class 하나를 반환하도록 연결했습니다. sizeLadder는 Shape geometry만 소유하며 Playground에는 역할×크기 비교표를 추가했습니다.

폰트 속성을 컴포넌트마다 네 개씩 복사하던 구조에서는 역할별 weight·leading 차이가 흩어져 있고 빠뜨려도 알기 어려웠습니다. 각 프리셋의 원본 조합은 tokens/text.ts, Palette CSS variable 참조는 tokens/index.ts, 완성 클래스 생성은 styles/typography.css.ts에 둡니다. 처음 화면 검토에서 raw 숫자 "16"을 CSS line-height로 넣어 브라우저가 16배로 해석하는 걸 발견했습니다. 클래스 생성은 반드시 tokens.text.control.* variable refs를 사용해야 합니다. pnpm typecheck와 package build를 통과했고 Playground에서 실제 computed font/line-height 및 표 배치를 확인했습니다.

## 2026-09-28 — Make palette assembly own the dependency direction

- 변경 파일: `workspace/packages/paper-ui/src/tokens/palette.ts`, `color-ladder.ts`, `colors.ts`, `tokens/index.ts`, Palette/Tokens playground, color architecture docs
- 요약: `color-ladder.ts`를 palette 데이터를 모르는 순수 계산 모듈로 바꾸고, `palette.ts`가 generator 함수로 완성된 `OKLCH_PALETTE`와 `PALETTE_TOKENS`를 조립해 내보내도록 했습니다.

Semantic colors는 이제 완성된 palette facade만 참조합니다. Palette inspector도 원본 anchor와 중간 생성 좌표를 같은 export에서 읽습니다. 순환 import를 피하면서 palette를 조립하는 책임이 이름 그대로 palette 모듈에 드러나도록 했습니다.

## 2026-09-27 — Move neutral ramp generation into color ladder

- 변경 파일: `workspace/packages/paper-ui/src/tokens/palette.ts`, `workspace/packages/paper-ui/src/tokens/color-ladder.ts`, `workspace/packages/paper-ui/src/tokens/colors.test.ts`, `workspace/app/src/playground/Palette.tsx`
- 요약: Neutral anchor 보간을 `color-ladder.ts`로 옮겨 Neutral·Accent의 ramp 생성 책임을 한곳으로 모았습니다.

Palette source에는 neutral anchors와 accent anchors만 두고, 완성된 neutral 좌표는 `PALETTE_COORDINATES`를 통해 접근하도록 정리했습니다. Playground와 기존 palette assertion도 생성 좌표를 읽게 바꿨습니다. 배열 순서 보간과 150·925의 midpoint 처리, chroma/hue 값은 그대로 유지했습니다.

## 2026-09-26 — Raise caption size to 13px

- 변경 파일: `workspace/packages/paper-ui/src/tokens/text.ts`, Typography 문서와 기존 scale assertion
- 요약: `caption` 크기를 12px에서 13px로 올리고 16px leading과 400 weight는 유지했습니다.

보조 정보도 작은 화면에서 읽기 쉬워야 한다는 판단에 따라 크기만 한 단계 올렸습니다. `control`과 같은 크기지만 용도·기본 weight·ink가 달라 역할은 구분됩니다.

## 2026-09-26 — Set body text weight to 500

- 변경 파일: `text.ts`, Typography playground, 토큰 문서, 기존 scale assertion
- 요약: `body` 기본 weight를 `regular` 400에서 `medium` 500으로 올렸습니다.

본문 샘플과 페이지 전반에서 기준이 되는 굵기이므로 variant 기본값, 비교 표, 문서의 설명을 함께 맞췄습니다. caption의 400은 그대로 둡니다.

## 2026-09-26 — Restore compact typography ladder and show weights

- 변경 파일: Text tokens/API, playground Type scale, Markdown heading styles, typography docs
- 요약: 제목 사다리를 `display 32 · title 24 · heading 20 · subheading 16`으로 복원하고 Type scale 표에 기본 Weight 열을 추가했습니다.

세분화한 heading1–4는 표와 실제 화면에서 단계가 과하게 늘어났습니다. 기존의 간결한 위계가 더 읽기 좋아 이를 되돌렸고, 크기·행간에 더해 variant 기본 weight까지 같은 표에서 비교할 수 있게 했습니다. 좁은 화면에서는 Size/leading 열을 접고 Weight는 남깁니다.

## 2026-09-26 — Expand the heading type ladder

- 변경 파일: text tokens/API, Text 사용처, Markdown heading styles, typography playground, 토큰 문서와 기존 scale assertion
- 요약: `display 40`, `title 28`, `heading1–4 24/20/18/16`으로 사다리를 확장하고 이전 `heading`·`subheading` 사용처를 새 단계에 대응시켰습니다.

페이지 제목은 `title`, 섹션 깊이는 `heading1–4`로 명시해 실제 문서 heading과 맞췄습니다. line-height는 40/48, 28/36, 24/32, 20/28, 18/24, 16/24로 정리했고 body 이하 역할은 기존 값을 유지했습니다.

## 2026-09-26 — Standardize page headers

- 변경 파일: playground overview/detail, demo, docs 페이지
- 요약: 개별 페이지에서 조립하던 페이지 제목·설명·액션 헤더를 공통 `PageHeader` anatomy로 통일했습니다. Home의 표현형 hero는 그대로 둡니다.

문서 페이지 제목은 manifest에서 가져오고 Markdown 본문의 첫 H1을 헤더로 올려 중복을 피했습니다. 컴포넌트 상세의 분류 breadcrumb, 데모의 상태 배지와 공유 액션은 공통 헤더 슬롯 안에 유지했습니다.

## 2026-09-26 — Keep display for expressive headlines

- 변경 파일: `workspace/packages/paper-ui/src/components/PageHeader.tsx`
- 요약: 공통 페이지 제목을 `display`에서 `title`로 되돌렸습니다.

`Primitives`, `Atoms`처럼 현재 위치를 나타내는 페이지명은 히어로 문구와 다른 역할입니다. 일반 페이지 헤더는 `title`을 쓰고, `display`는 랜딩 헤드라인처럼 표현적 강조가 필요한 자리에 남깁니다.

## 2026-09-26 — Refine typography scale and specimen contrast

- 변경 파일: `workspace/packages/paper-ui/src/tokens/text.ts`, `docs/foundations/tokens.md`, `workspace/app/src/playground/Tokens.tsx`
- 요약: `title`을 24/32px로 조정하고 sans tracking의 음수 자간을 완화했습니다. Typography의 Type scale 표는 모든 텍스트를 `ink.primary`로 표시합니다.

본문·설명·측정값의 기본 잉크 역할은 전역에서 유지하고, foundation 표본에서만 색 차이 없이 글자 위계를 비교하도록 명시적으로 덮었습니다. mono는 본래 폭이 넓어 이를 보정하는 자간을 유지합니다.

## 2026-09-26 — Refine typography foundation layout

- 변경 파일: `workspace/app/src/playground/Tokens.tsx`, `foundations.css.ts`
- 요약: Type scale을 역할·실제 샘플·크기/행간이 정렬된 보드로 바꾸고, Weight와 Family는 surface card 없이 비교 섹션으로 정리했습니다.

기존 3열 토큰 목록은 수치 열이 좁아 여러 줄로 깨지고 큰 샘플과 설명의 관계도 흐렸습니다. 새 보드는 token role과 샘플을 정렬하고 측정값을 한 줄에 보여줍니다. Weight/Family는 값의 묶음보다 비교 관점이 중요해 별도 Raised 면 대신 얇은 경계선과 간격으로 Type scale 아래에 이어 붙였습니다.

## 2026-09-26 — Remap typography variants by content role

- 변경 파일: `PageHeader.tsx`, Home/Demo 화면, typography docs
- 요약: 일반 페이지 제목을 `title`, Home의 표현형 헤드라인을 `display`, Demo의 진행률 수치를 `heading`, Home의 설명 문장을 `body`로 매핑했습니다.

기존에는 재사용 PageHeader가 display를 사용해 모든 문서·플레이그라운드 페이지 제목이 홈 랜딩의 큰 헤드라인과 같은 역할을 했습니다. 또한 17% 수치가 페이지 제목과 같은 title 크기라 시선 우선순위가 겹쳤습니다. 크기 사다리는 유지하고 콘텐츠 역할만 바로잡았습니다.

## 2026-09-26 — Increase amber chroma uniformly

- 변경 파일: `workspace/packages/paper-ui/src/tokens/palette.ts`
- 요약: Amber의 OKLCH hue·lightness 흐름을 유지하고 모든 anchor의 chroma를 `+0.015` 평행 이동했습니다.

색상 성격과 명도 리듬을 다시 바꾸지 않고 전체 ramp만 조금 더 선명하게 하려는 조정입니다. Light/dark 의미 매핑도 그대로 유지됩니다.

## 2026-09-26 — Refine amber palette hue trajectory

- 변경 파일: `workspace/packages/paper-ui/src/tokens/palette.ts`
- 요약: Amber의 hue가 밝은 yellow에서 dark brown으로 급격히 회전하던 anchor를 좁히고, 중간·어두운 단계의 chroma를 소폭 보강했습니다.

이전 ramp의 `200 → 600`은 hue가 약 `95° → 49°`로 크게 이동해 한 팔레트 안에서 yellow, orange, brown이 따로 노는 인상을 줬습니다. 새 anchor는 밝은 쪽 `~90°`에서 dark 쪽 `60°`까지 점진적으로 이동하도록 하고, canonical 600의 chroma를 조금 높였습니다. Semantic mapping은 그대로라 라이트·다크 테마가 같은 원천 ramp를 계속 선택합니다.

## 2026-09-26 — Remap typography to role-based heading tokens

- 변경 파일: Text tokens/API, 데모 및 playground 사용처, 마크다운 스타일, 문서
- 요약: `heading1–4`를 `title · heading · subheading`으로 바꾸고, 기존 화면에서 선호한 페이지 제목 크기 28/36을 `title`로 유지했습니다.

“웹사이트 리뉴얼”의 제목 위계는 보기 좋다는 피드백을 기준으로 28/36으로 보존했습니다. 중간 단계를 추가한 뒤 화면 위계가 맞지 않아 해당 보정은 되돌렸습니다. 최종 scale은 heading 20/28, subheading 16/24이며 데모의 제목 역할도 기존 매핑을 유지합니다. `Text`의 시각 variant와 HTML heading 태그는 `as` prop으로 분리합니다.

## 2026-09-26 — Preview revised typography scale

- 변경 파일: `workspace/app/src/playground/Tokens.tsx`, `workspace/app/src/playground/foundations.css.ts`
- 요약: 이슈 트래커 데모의 임시 확대 스타일을 되돌리고, Typography foundation 데모를 `body.md 14px` 기준의 `16 / 14 / 13px` 사다리로 갱신했습니다.

미리보기는 새 위계와 caption의 역할을 화면에서 판단하기 위한 것이므로 패키지의 실제 Text API나 토큰 수치는 변경하지 않았습니다. 이슈 트래커 본문 크기를 16px로 올리자 기존 밀도와 맞지 않아 실제 데모는 원래 스타일로 복원했습니다. caption 미리보기는 Paper UI의 tertiary ink를 사용합니다.

## 2026-09-26 — Merge accent edge into soft

- 변경 파일: `workspace/packages/paper-ui/src/tokens/colors.ts`, accent styles, Tokens playground, color docs/report
- 요약: 중복된 accent `edge` slot을 제거하고 hairline 및 status wash border가 `soft`를 공유하도록 했습니다.

모든 accent에서 `edge`와 `soft`는 같은 palette step을 가리켰습니다. 같은 값을 두 이름으로 유지할 이유가 없어 API를 줄이고 각 사용처를 한 slot으로 모았습니다.

## 2026-09-26 — Add subtle accent tone for muted text

- 변경 파일: `workspace/packages/paper-ui/src/tokens/colors.ts`, accent profile, Tokens playground, color docs/report
- 요약: Accent ladder에 `subtle`을 추가하고 `muted` foreground가 이를 사용하도록 바꿨습니다.

`soft`는 면에 쓰기 좋은 옅은 색이지만 투명 바탕의 글자로는 흐렸습니다. Status accent는 light에서 step 300, dark에서 step 500을 선택하고 primary는 neutral step 400/300을 선택해 soft보다 더 읽히도록 했습니다.

## 2026-09-26 — Use accent soft tones for muted variant

- 변경 파일: `workspace/packages/paper-ui/src/styles/color-profile.ts`, color profile test, token/component docs
- 요약: `muted`의 foreground를 공통 `ink.secondary`에서 선택된 accent의 `soft`로 바꿨습니다.

Muted는 투명 배경과 무테두리 구조를 유지하면서 primary·status accent마다 자기 색조를 보이도록 했습니다. 이에 따라 soft는 표면 역할뿐 아니라 muted 텍스트 역할도 맡습니다.

## 2026-09-26 — Remove the edgeStrong accent slot

- 변경 파일: `workspace/packages/paper-ui/src/tokens/colors.ts`, accent CSS profile, Tokens playground, color docs/report
- 요약: Accent ladder를 `solid · wash · soft · edge` 네 slot으로 줄이고 `edgeStrong`을 제거했습니다. Hairline은 hover 중에도 `edge`를 유지하며 neutral overlay만 적용합니다.

강한 hover 전용 테두리는 edge와 역할이 겹치고 hairline의 기본 무게도 불필요하게 바꾸고 있었습니다. 별도 slot과 CSS override를 없애 색 계약을 단순화했습니다. LaTeX 보고서 표도 네 열로 다시 조판해 렌더링을 확인했습니다.

## 2026-09-26 — Remove the shared outline variant

- 변경 파일: `workspace/packages/paper-ui/src/resolvers/color.ts`, `styles/color-profile.ts`, component usages, Playground, docs, tests
- 요약: 공용 accent `outline` variant를 제거하고 Button·IconButton·Badge·Alert의 사용을 `hairline`으로 옮겼습니다. Pagination의 독립적인 `outline` variant와 CSS focus outline은 유지했습니다.

공용 color variant에서 `outline`은 기본 상태가 hairline hover border와 같은 edgeStrong을 써 독립된 역할이 약했습니다. 이에 hairline 하나로 합쳤습니다. 기존 outline 전용 3:1 border 계약과 outline/hairline 차이를 강제하던 테스트는 제거하고, neutral hairline이 Field·Box의 기본 경계와 같은지 확인하는 테스트로 정리했습니다.

## 2026-09-26 — Add the full accent variant matrix

- 변경 파일: `workspace/app/src/pages/Playground.tsx`
- 요약: 전수 페이지 Color 섹션에 primary·info·success·warning·error와 여섯 Button variant의 30개 조합을 표로 추가했습니다.

기존 단일 accent 선택형 recipe 표를 실제 Button 표본이 모두 보이는 matrix로 바꿨습니다. 각 버튼에는 variant명이 아니라 accent 이름만 표시합니다. 가로 폭은 좁은 화면에서 표 내부 스크롤로 처리해 전수 페이지의 나머지 specimen 폭을 바꾸지 않습니다.

## 2026-09-26 — Consolidate accent ladder mapping

- 변경 파일: `workspace/packages/paper-ui/src/tokens/colors.ts`
- 요약: Status accent 네 개가 공유하던 light/dark ladder 선택을 `accentToken()`으로 모았습니다.

팔레트 연결은 `STATUS_PALETTE`에서 계속 명시하고, tone step은 한 곳에서 관리합니다. Primary는 neutral ramp를 쓰므로 별도 매핑으로 유지했습니다.

## 2026-09-26 — Tune dark accent edge contrast

- 변경 파일: `workspace/packages/paper-ui/src/tokens/colors.ts`
- 요약: Dark theme의 `edge`는 한 단계 어둡게, `edgeStrong`은 한 단계 밝게 조정했습니다. Neutral primary와 모든 status accent에 적용했습니다.

이 두 ladder 값이 각각 Button의 hairline과 outline border 색을 결정합니다. 배경과 foreground는 유지하고 border 색 선택만 이동해 variant 간 시각적 무게 차이를 분명하게 했습니다.

## 2026-09-26 — Reverse palette presentation in dark mode

- 변경 파일: `workspace/app/src/playground/Tokens.tsx`
- 요약: Color Foundations의 Palette matrix에서 dark theme일 때만 step 표시 순서를 뒤집었습니다.

Palette token은 단일 SSOT이므로 값이나 semantic mapping은 건드리지 않고 화면 순서만 바꿨습니다. 밝은 theme은 기존처럼 50→950, dark theme은 950→50으로 보여줍니다.

## 2026-09-26 — Add the 925 palette step for canvas separation

- 변경 파일: `workspace/packages/paper-ui/src/tokens/palette.ts`, `colors.ts`, Palette·Color Foundations, color docs
- 요약: Neutral과 Accent ramp 모두에 `925`를 복구하고 dark `bg.canvas`가 `neutral.925`를 선택하도록 했습니다. Semantic Color 값 카드의 바탕은 `raised`에서 `canvas`로 맞췄습니다.

`neutral.900`과 `neutral.950` 사이의 어두운 canvas 값을 주기 위해 925를 넣었습니다. Accent에도 같은 단계를 두어 양 ramp의 간격을 맞췄고, 925는 양쪽 anchor의 OKLCH 중간값으로 생성해 직접 관리하는 색을 늘리지 않았습니다.

## 2026-09-26 — Use one shared color palette across themes

- 변경 파일: `workspace/packages/paper-ui/src/tokens/palette.ts`, `color-ladder.ts`, `colors.ts`, Palette·Color Foundations, color docs
- 요약: Neutral·accent를 테마별 ramp에서 단일 ramp로 합치고 semantic mapping이 light/dark step을 선택하도록 바꿨습니다. Alpha도 `alpha05`~`alpha95`의 공통 percentage palette로 편입했습니다.

기존 구조는 Palette 자체를 테마마다 뒤집어 Palette inspector가 바뀌는 문제가 있었습니다. 이제 palette는 단일 SSOT이고, surface·ink·border·accent·interaction·overlay·shadow의 테마별 값만 semantic layer에서 선택합니다. Alpha opacity를 기존 interaction별 임의값 대신 5% 단위의 공용 scale로 정리해 semantic token이 재사용합니다.

## 2026-09-26 — Align neutral and accent palette steps

- 변경 파일: `workspace/packages/paper-ui/src/tokens/palette.ts`, `colors.ts`, `colors.test.ts`, Palette·Color Foundation previews
- 요약: Neutral과 Accent를 `50, 100, 150, 200, 300 … 900, 950`으로 맞추고 `925` 단계를 제거했습니다.

Neutral의 dark `bg.canvas`는 기존 `925` 대신 `900`을 사용하며, `sunken`과 `well`도 한 단계씩 이동해 네 surface의 구분을 유지합니다. 새 Neutral `150`은 기존 `100`·`200` 사이에서 생성해 다른 단계의 색은 보존했습니다.

## 2026-09-26 — Lift dark soft accent surfaces

- 변경 파일: `workspace/packages/paper-ui/src/tokens/palette.ts`, `colors.ts`, `colors.test.ts`, Palette·Color Foundation preview
- 요약: accent ramp에 `150`을 추가하고 dark theme의 status accent `soft`에 연결했습니다.

다크 ramp는 낮은 번호가 거의 검정에 가까워 `100`을 면에 쓰면 raised surface와 구분이 약했습니다. 이후 palette에 `150`을 새 중간 단계로 추가해 dark `soft`에 연결했습니다. Light mapping과 나머지 semantic accent 단계는 유지합니다.

## 2026-09-26 — Refine the Palette reference page

- 변경 파일: `workspace/app/src/playground/Palette.tsx`, `palette.css.ts`
- 요약: 팔레트 scale을 컴팩트한 swatch 행으로 재배치하고 공통 `PageHeader`와 Paper UI primitives를 사용했습니다.

기존 큰 컬러 타일은 단계와 값, source 좌표가 한 면 안에서 경쟁해 전체 palette를 훑기 어려웠습니다. 칩을 단계·HEX 중심으로 단순화하고, OKLCH 좌표는 각 칩의 title에 남겨 필요할 때 확인하게 했습니다. 작은 화면에서는 scale을 가로로 스크롤해 모든 단계를 보존합니다.

## 2026-09-26 — Split foundations into category pages

- 변경 파일: `workspace/app/src/playground/Tokens.tsx`, `foundation-sections.ts`, `foundations.css.ts`, `shell.tsx`, `workspace/app/src/App.tsx`
- 요약: Color & Typography, Spacing, Sizing, Radius, Border, Elevation, Motion을 각자 독립 경로와 사이드바 항목으로 분리했습니다. 페이지 UI는 Paper UI primitives와 `PageHeader`를 사용합니다.

기존 한 화면의 긴 목차를 페이지별로 나눠 각 foundation을 바로 열고 탐색하게 했습니다. 기존 `/playground/tokens`와 `/playground/foundations` 주소는 Color & Typography 페이지로 연결해 링크를 유지합니다. 콘텐츠의 표면과 타이포그래피는 Paper UI 컴포넌트가 담당하고 별도 CSS는 반응형 배치만 정의합니다.

## 2026-09-26 — Reshape semantic color token groups

- 변경 파일: semantic color tokens, interaction consumers, Tokens·Palette Playground, foundations 문서
- 요약: interaction 배경 hover를 `bgHover` 맥락별 토큰으로 정리하고 scrim·shadow 색을 별도 그룹으로 이동했습니다. Accent ladder 이름은 기존 다섯 항목을 유지하고 semantic Form hover glow를 제거했습니다.

Shadow API는 overlay와 overlayMinimal 두 tint로 단순화했습니다. 기존 overlay 그림자는 두 geometry layer에 서로 다른 tint를 썼지만, 새 토큰 계약은 단일 `shadow.overlay`를 요구해 두 layer가 같은 tint를 공유합니다. 그림자 모양은 유지되며 tint 차이가 사라지므로, 이후 시각 검토 때 overlay가 지나치게 진하거나 평평해 보이는지 확인할 지점입니다.

## 2026-09-26 — Expose Field surface in Playground props

- 변경 파일: `workspace/app/src/playground/registry.tsx`
- 요약: Field Playground에서 `surface="raised" | "sunken"`을 바꾸고 생성 코드에 반영하도록 추가했습니다.

Field의 신규 surface 옵션이 실제 컴포넌트 API에는 있었지만 props 패널에는 노출되지 않아 Playground에서 비교할 수 없었습니다. 기본 raised는 코드에서 생략하고 sunken만 명시해, 생성 예제가 컴포넌트의 기본값 계약과 일치하게 했습니다. 설명도 surface 선택과 wrapper/input의 focus·caret 역할을 반영하도록 갱신했습니다.

## 2026-09-26 — Prevent Field focus selection clipping

- 변경 파일: `workspace/packages/paper-ui/src/atoms/Field.css.ts`
- 요약: 전역 `:focus-visible` radius가 native input 자체에 적용되어 선택 highlight/caret이 잘리던 현상을 수정했습니다.

전역 focus-visible 규칙의 둥근 모서리가 Field 내부 native input에도 적용되고 있었습니다. native input은 자체적으로 `overflow: clip`하므로 선택 영역과 caret이 input의 둥근 모서리에서 잘릴 수 있습니다. 내부 input의 radius를 0으로 고정하고 전체 내부 높이를 차지하게 했으며, 바깥 Field wrapper만 focus ring과 둥근 모서리를 담당합니다.

## 2026-09-26 — Add recessed search surface to Field

- 변경 파일: `Field.tsx`, `Field.css.ts`, Field playground specimen, Field tests, Form recipe
- 요약: Field에 `surface="raised" | "sunken"`을 추가하고, sunken 검색 입력 예제에서 기존 leading/trailing 슬롯으로 아이콘과 `⌘ K` 힌트를 조합했습니다.

깊이는 컴포넌트의 시각 variant보다 surface 역할로 표현해 `Box`와 용어를 맞췄습니다. 기본값은 기존 raised 그대로라 폼 입력의 렌더링은 유지되며, sunken은 semantic `bg.sunken`만 사용하고 공통 border·focus·status 동작은 건드리지 않습니다. 단축키 힌트는 동작이 없는 `kbd` 표면으로 구성해 별도 버튼처럼 오해하지 않게 했습니다.

## 2026-09-26 — Align system controls with the project demo

- 변경 파일: Button·Field·Select·Textarea atoms, control shape/text tokens, size ladder, 관련 foundations 문서
- 요약: 기본 control을 32px 높이·13px 글자·8px 모서리로 맞추고, 버튼은 12px 좌우 여백과 solid 650 weight, 입력류는 역할별 좁은 여백과 normal 450 weight를 사용하도록 정리했습니다.

데모에서 의도한 형태는 단순히 기존 시스템 버튼을 키운 모습이 아니라, 더 단단한 CTA 글자와 8px corner, 입력보다 넉넉한 버튼 좌우 폭의 조합이었습니다. 크기 사다리를 Button·Field·Select·Textarea에서 공유하되 버튼과 입력의 가로 여백은 계속 분리해 이 대비를 유지했습니다. `interaction.radius`는 Badge·Menu·Tooltip·navigation 등의 작은 표면도 공유해 함께 바뀝니다. 여러 줄 입력은 기존 잉크 정렬 계산을 보존하면서 패딩 주석과 값의 불일치를 바로잡았습니다.

## 2026-09-26 — Use the system Button in the project demo

- 변경 파일: `workspace/app/src/pages/Demo.tsx`, `workspace/app/src/pages/Demo.css.ts`
- 요약: 프로젝트 데모의 `새 작업` 버튼을 전용 CSS에서 Paper UI `Button` Atom 기본값으로 교체했습니다.

이 버튼은 제품 데모의 조형을 평가하는 기준점이므로 별도 모양을 유지하지 않고 시스템 기본값을 그대로 드러냅니다. 교체 결과 높이가 32→34px, 글자가 13px/650→14px/550, 모서리가 8→6px가 됐고, 시스템의 1px 경계와 scale press 반응이 적용됐습니다. 아이콘은 데모 호출부의 16px 설정을 유지해 버튼 Atom이 지정하지 않는 콘텐츠 크기 축은 그대로 비교할 수 있습니다.

## 2026-09-26 — Unify project demo emphasis and status tones

- 변경 파일: `workspace/app/src/pages/Demo.tsx`, `workspace/app/src/pages/Demo.css.ts`
- 요약: 탭·상태 필터·완료 토글의 선택 표현을 동일한 중립 표면으로 맞추고, 작업 상태를 의미 기준으로 색상화했습니다. 우측 마일스톤 카드도 다른 패널과 같은 raised 표면으로 정리했습니다.

보기 탭의 밑줄, 필터의 회색 칩, 완료 토글의 파란색은 모두 선택을 뜻하지만 서로 다른 강도로 보여 한 화면의 인터랙션 톤이 갈라졌습니다. 세 컨트롤은 같은 sunken 배경과 경계로 현재 선택을 표시하게 하고, 파랑·노랑·초록은 진행 중·검토·완료라는 실제 상태 데이터에만 남겼습니다. 상태별 색을 Task 데이터에 중복 저장하지 않고 상태값에서 결정해 '할 일'에 완료처럼 보이는 초록이 붙던 불일치도 막았습니다. 강조 패널은 레이아웃 초점인 스프린트 카드에 한정하고 나머지는 공통 raised 표면을 사용합니다.

## 2026-09-26 — Make selected project views and filters explicit

- 변경 파일: `workspace/app/src/pages/Demo.tsx`, `workspace/app/src/pages/Demo.css.ts`
- 요약: 보기 탭과 상태 필터에 선택 상태를 명확한 색·배경·테두리로 표현하고 `aria-selected`·`aria-pressed` 상태를 추가했습니다.

기본 버튼 규칙보다 선택 클래스의 우선순위가 낮아 기존 강조 스타일이 실제 DOM에서 덮이는 문제가 있었습니다. 상태 선택자를 구체화해 active tab은 진한 글자와 밑줄로, 상태 필터는 sunken 면과 경계선으로 드러나게 했습니다. hover에서도 현재 선택을 흐리지 않으며 키보드 포커스는 별도 ring으로 보입니다.

## 2026-09-26 — Refine sprint and task toolbar icons

- 변경 파일: `workspace/app/src/pages/Demo.tsx`, `workspace/app/src/pages/Demo.css.ts`
- 요약: 스프린트 라벨의 얇은 스파클 아이콘을 경고색 면형 아이콘으로 바꾸고 기준선을 정렬했습니다. 검색·필터·새 작업 컨트롤 높이도 32px로 맞췄습니다.

작은 크기의 선형 스파클은 어두운 요약 패널 안에서 장식인지 상태 표식인지 모호하고 존재감도 약했습니다. 같은 의미색을 유지하면서 내부가 채워진 네 방향 형태로 바꾸어 축소 상태에서도 인지되도록 했습니다. 툴바 액션은 서로 다른 기본 높이가 시각적 무게를 흐리지 않도록 공통 높이를 사용합니다.

## 2026-09-26 — Tune workspace picker scale and alignment

- 변경 파일: `workspace/app/src/pages/Demo.tsx`, `workspace/app/src/pages/Demo.css.ts`
- 요약: 워크스페이스 아바타와 이름의 타이포를 사이드바에 맞추고, chevron wrapper를 제거해 양쪽 시각적 padding을 정돈했습니다.

## 2026-09-26 — Use soft accent recipes for project task statuses

- 변경 파일: `workspace/app/src/pages/Demo.tsx`, `workspace/app/src/pages/Demo.css.ts`
- 요약: 작업 상태 배지를 각 상태 accent의 `soft` surface와 `solid` ink 조합으로 바꿨습니다.

기존에는 `할 일` 상태가 중립 배경으로 처리돼 나머지 상태 배지와 색상 규칙이 끊겼습니다. 상태별 색을 임의로 섞지 않고 `info`, `warning`, `success`, `error` semantic token의 soft variant를 배경에, solid variant를 전경에 연결했습니다.

## 2026-09-25 — Rebuild the project manager demo as a standalone HTML interface

- 변경 파일: `workspace/app/src/pages/Demo.tsx`, `workspace/app/src/pages/Demo.css.ts`
- 요약: Paper UI component 조합을 모두 걷어내고 시맨틱 HTML과 전용 레이아웃으로 대시보드 화면을 새로 구성했습니다.

색만 Paper UI semantic token 참조로 제한하고, 반복 KPI 카드 대신 스프린트 요약을 단일 초점으로 두었습니다. 데스크톱은 프로젝트 탐색·작업 표·일정 레일의 3열 구조이며 모바일에서는 탐색을 접고 작업 표의 보조 열을 숨겨 핵심 작업/상태를 먼저 보여줍니다. 필터, 검색, 보기 전환, 작업 생성, 완료 토글을 유지했습니다. 첫 시각 검토에서 작은 글자와 가는 control weight를 발견해 보조 정보의 크기·굵기를 올리고 검색·필터·액션 버튼을 13px 기준으로 맞췄습니다. 작은 화면에서 CSS media-query를 전역 규칙처럼 쓸 경우 Vanilla Extract에 기대한 반응형 규칙이 생성되지 않는 점을 확인해 각 class recipe 안으로 breakpoint를 이동했습니다.

## 2026-09-25 — Use canvas surface for project demo backdrop

- 변경 파일: `workspace/app/src/pages/Demo.tsx`
- 요약: 프로젝트 매니저 페이지 바탕을 `sunken`에서 `canvas`로 바꿨습니다.

페이지 전체를 한 단계 눌린 회색 면으로 처리하면 국소적인 inset 요소와 구분되지 않고 대시보드가 회색 판처럼 읽혔습니다. 작업 페이지에는 canvas 역할을 쓰고, sunken은 작은 내부 그룹이나 트랙에만 남깁니다.

## 2026-09-25 — Constrain wide project dashboard layout

- 변경 파일: `workspace/app/src/pages/Demo.tsx`
- 요약: 넓은 화면에서 프로젝트 대시보드가 가로로 과도하게 늘어나던 현상을 고치고 전체 작업 영역을 가운데 정렬했습니다.

초기 레이아웃은 본문 중앙 열이 남는 너비를 모두 차지해 작업 표의 상태·우선순위·담당자·기한 열이 멀리 흩어졌습니다. 메인 작업 영역에 100rem 상한을 두어 큰 모니터에서도 정보 군집과 우측 일정 패널의 관계를 유지하고, 작은 화면에서는 원래처럼 자연스럽게 줄바꿈하도록 했습니다.

## 2026-09-25 — Replace issue demo with Paper UI project manager

- 변경 파일: `workspace/app/src/pages/Demo.tsx`
- 요약: 이슈 목록 데모를 사이드바·프로젝트 요약·진행률·작업 목록/보드/타임라인·일정/활동으로 구성된 프로젝트 매니저로 바꿨습니다.

Shape를 평가할 실제 화면을 만들되 컴포넌트별 임의 CSS나 새 색상값을 넣지 않고 Paper UI의 surface, controls, typography, semantic accents를 조합했습니다. 작업 검색·상태/우선순위 필터·완료 토글·새 작업 생성은 동작하며, 데모 전용 컴포넌트 규격을 추가하지 않아 기존 Shape의 실제 장단점을 관찰할 수 있습니다. 캡처 검토 중 Box의 `height="lg"`가 interaction 높이 40px이 아니라 layout 높이 216px로 해석되는 차이를 확인했고, 아이콘·상태 표식에는 interaction token 치수를 명시해 수정했습니다. 모바일에서 document 가로 overflow가 없는 것도 확인했습니다.

## 2026-09-25 — Add accent variant recipe table to Playground

- 변경 파일: `workspace/app/src/pages/Playground.tsx`
- 요약: Color 섹션에 Table 8의 여섯 variant recipe를 추가하고, accent 선택에 따라 표본 버튼과 solid hover 설명을 바꾸도록 했습니다.

Playground에서 표를 읽는 동시에 각 variant의 실제 버튼을 비교할 수 있도록 한 행 안에 버튼 표본과 bg·fg·border·hover recipe를 배치했습니다. `muted`는 accent 선택기와 무관하게 `ink.secondary`를 유지하도록 recipe 설명을 고정했습니다.

## 2026-09-25 — Replace muted variants with one neutral ghost

- 변경 파일: Button/Badge variant resolver와 color profile, Modal·Pagination, Playground, color-system 문서와 보고서
- 요약: `softMuted`, `outlineMuted`, `hairlineMuted`, `ghostMuted`를 제거하고 Ghost형 투명 면에 `ink.secondary` 전경을 쓰는 단일 `muted`를 추가했습니다.

기존 muted 이름 다수는 대응 variant와 색 recipe가 중복되어 선택지만 늘렸습니다. Accent의 `soft`는 밝거나 어두운 표면용 tint여서 전경 텍스트로 직접 쓰기엔 대비가 부족하므로, 새 `muted`는 status pigment를 버리고 의미가 분명한 중립 보조 잉크를 씁니다. 이로써 Muted는 Accent × Variant의 다른 조합이 아니라 공통 보조 액션이 됩니다.

## 2026-09-25 — Expand the color-system report into a full specification

- 변경 파일: `docs/reports/color-system-report.tex`, Downloads PDF
- 요약: 라이트·다크의 전체 OKLCH 및 HEX ramp, semantic palette step, accent variant의 bg/fg/border/hover 조합, interaction alpha, CSS 생성·테마 적용 경로, 컴포넌트 상태, 자동 검사의 범위와 알려진 예외를 추가했습니다.

팔레트 표는 생성기에서 실제 산출된 모든 값을 사용하고 source 좌표는 표시 정밀도만 제한했습니다. 특히 Select 화살표의 data URI에 남은 직접 HEX는 숨기지 않고 tokens-only 원칙의 예외로 명시했습니다. 구조적 테스트와 시각 대비 검증은 서로 다른 계약이므로 보고서에서 구분했습니다.

## 2026-09-25 — Unify neutral palette step direction

- 변경 파일: `workspace/packages/paper-ui/src/tokens/palette.ts`, `colors.ts`, color contract tests, foundations, report
- 요약: Light와 dark neutral ramp를 모두 `0 = 밝은 끝점`에서 `950 = 어두운 끝점`으로 재색인하고 semantic 및 alpha source 참조를 함께 옮겼습니다.

숫자 방향은 팔레트 값을 읽는 규칙이므로 neutral 양 테마에서 공유해야 합니다. 이전 ramp의 HEX와 화면 역할은 그대로 보존하고 주소만 반전해, 표기 계약 개선이 제품 색상의 의도치 않은 변경으로 번지지 않게 했습니다. Accent step은 별도 계열 규칙이라 건드리지 않았습니다.

## 2026-09-25 — Rebalance the full light neutral ramp

- 변경 파일: `workspace/packages/paper-ui/src/tokens/palette.ts`, 보고서, `daily-todo`·`booklog`·`doodle` vendored 패키지
- 요약: neutral의 ink·canvas 양 끝 등 의미 기준점을 유지하고, 구간별로 중간 lightness를 생성하도록 바꿨습니다. 500–900 구간은 동일한 OKLCH lightness 간격으로 정렬했습니다.

손으로 600만 옮기는 대신 ramp 전체에 하나의 보간 규칙을 적용했습니다. surface의 주요 기준 HEX는 유지하면서 well, border, sunken 사이의 간격을 정돈하고, 다크 neutral 및 accent family는 변경 범위에서 제외했습니다.

## 2026-09-25 — Show OKLCH beside palette HEX values

- 변경 파일: `workspace/app/src/playground/Palette.tsx`, `workspace/packages/paper-ui/src/tokens/color-ladder.ts`, `docs/reports/color-system-report.tex`, Downloads의 PDF
- 요약: neutral과 accent 모든 swatch에서 HEX와 OKLCH를 함께 보여주고, accent 중간 단계도 실제 생성 좌표를 확인할 수 있게 했습니다. 보고서 semantic 표에도 light/dark의 step·HEX·OKLCH를 병기했습니다.

중간 accent 좌표를 UI에서 별도 재계산하면 팔레트 generator와 미세하게 달라질 수 있어, HEX 생성에 쓰는 보간 결과를 같은 L1 source에서 inspector에 노출했습니다. 보고서는 step의 source 좌표와 gamut mapping 후 HEX가 다를 수 있음을 명시했습니다.

## 2026-09-25 — Generate a consistent cool-neutral ramp

- 변경 파일: `workspace/packages/paper-ui/src/tokens/palette.ts`, `docs/reports/color-system-report.tex`, 다운로드 PDF, 세 앱의 vendored 패키지
- 요약: 라이트 neutral 13단계 전체를 hue `286°`·chroma `0.003`으로 통일해 기존 무채색과 zinc tint의 중간 톤으로 낮췄습니다. 패키지 빌드와 세 앱의 production build를 확인했습니다.

900에서만 쿨톤이 도드라지고 925·950이 무채색으로 갑자기 바뀌지 않도록 모든 source anchor에 같은 recipe를 사용합니다. 가장 밝은 끝의 거의 흰 표면은 gamut mapping이 색도를 자연스럽게 제한합니다. 다크 neutral과 accent는 이번 조정 범위가 아니므로 유지했습니다.

## 2026-09-25 — Document the color-system contract

- 변경 파일: `docs/reports/color-system-report.tex`, Downloads의 PDF
- 요약: OKLCH source부터 HEX palette token, 다섯 semantic system, CSS 사용과 정합성 검사까지 현재 Color System을 기록했습니다.

보고서는 구현과 문서를 기준으로 매핑과 현재 생성 HEX를 대조하고, palette-token 경계와 자동 검사의 범위를 분리해 설명합니다. 특히 구조적 토큰 정합성이 실제 텍스트·surface 조합의 대비를 자동 보장하지 않는 점을 남은 검증 과제로 구분했습니다.

## 2026-09-25 — Restore a subtle zinc cast to light neutrals

- 변경 파일: `workspace/packages/paper-ui/src/tokens/palette.ts`, 패키지 배포 아카이브, `daily-todo`·`booklog`·`doodle` vendored 패키지
- 요약: 라이트 neutral ramp에만 낮은 OKLCH chroma(`0.006`, hue `286°`)를 되돌려 흰 surface의 밝기를 유지하면서 은근한 cool-zinc 기운을 복원했습니다. 다크 charcoal과 semantic surface 매핑은 유지했습니다.

순수 achromatic neutral은 정돈돼 보이지만 화면의 밝은 면이 조금 딱딱하게 느껴졌습니다. 이전에 문서화한 zinc hue를 기준으로 chroma를 크게 절제해, 컬러감보다는 면의 온도로만 구별되게 했습니다. 앱별 HEX override를 두지 않고 같은 package를 세 앱에 배포해 팔레트 출처를 하나로 유지합니다.

## 2026-09-25 — Tune dark neutrals toward charcoal

- 변경 파일: `tokens/palette.ts`, Tokens Playground, Foundations 문서
- 요약: 다크 surface의 기존 역할 순서는 유지하고 zinc cast를 거의 무채색 charcoal로 낮췄습니다. 의미색은 차트·상태 같은 용도에 남겨둡니다.

ChatGPT의 중립적인 charcoal 화면과 사용자가 공유한 대시보드 사례를 참고해, 다크 모드에서 채도보다 명도 차가 먼저 읽히게 했습니다. surface mapping과 semantic 순서는 바꾸지 않아 기존 깊이 모델은 그대로입니다. 강한 채도는 데이터 시각화·상태 등 의미를 가진 자리에만 남깁니다.

## 2026-09-24 — Balance neutral tokens around the doodle prototype

- 변경 파일: `tokens/palette.ts`, `tokens/shape.ts`, `tokens/text.ts`, Tokens Playground, Foundations 문서
- 요약: doodle에서 잘 읽혔던 흰 문서·회색 바탕·약한 괘선·떠 있는 패널의 대비를 Paper UI의 중립 토큰에 반영했습니다. 양 테마의 surface와 글자·선 사다리를 함께 조정하고, heading/caption 크기와 큰 레이아웃 여백, overlay 그림자를 다듬었습니다.

실제 화면의 균형을 토큰으로 되돌리되, 문서 폭이나 패널 배치·점무늬처럼 앱 맥락에 따른 형태는 공통 규칙으로 고정하지 않았습니다. 기존 Molecule/Component 구현은 교체 예정이므로 건드리지 않았고, Tokens Playground에 Atom만으로 만든 조합 예시를 넣어 라이트·다크에서 면과 깊이 관계를 확인할 수 있게 했습니다. 작은 글자와 선의 대비는 개별 수치보다 바탕 면 위에 놓인 상태로 검토해야 합니다.

## 2026-09-23 — Generate accent palette steps in OKLCH

- 변경 파일: `tokens/color-ladder.ts`, Palette Playground, Foundations 문서
- 요약: 각 accent의 대표 색을 OKLCH anchor로 두고 중간 step을 지각 공간에서 보간했습니다. Palette preview는 L/C/H를 표시하고 swatch 명도에 따라 전경색을 고릅니다.

기존 palette에는 일부 step의 색만 있었고 나머지는 별도 로직/값으로 채워져 연속적인 밝기·색상 흐름을 검토하기 어려웠습니다. 기존 Veil의 핵심 색을 anchor로 유지하면서 hue는 최단 각도로 보간해, 색 정체성은 살리고 사이 색만 OKLCH에서 생성합니다. 글자색은 step 번호가 아니라 실제 OKLCH 명도를 기준으로 골라 다크 테마의 역방향 ladder도 처리합니다. amber 400의 밝은 전경은 앞서 확정된 palette 판단을 예외로 보존합니다.

## 2026-09-23 — Unify muted color-family mechanics

- 변경 파일: `tokens/colors.ts`, `styles/color-profile.ts`, Tokens Playground·Foundations 문서
- 요약: primary를 neutral color family로 확장해 status와 같은 `wash / soft / mutedInk / ink / edge` contract를 부여하고, 모든 Muted variant를 하나의 profile helper로 통합했습니다.

기존 primary `softMuted`는 `soft`와 같은 well 위에서 글자만 약했고, status `softMuted`는
더 옅은 wash 위에서 한 단계 낮은 pigment ink를 썼습니다. primary도 neutral wash와
mutedInk를 갖게 해 이 관계를 통일했습니다. `hairlineMuted`·`outlineMuted`·`ghostMuted`는
status만 tinted wash로 hover하던 갈림을 없애, primary와 같이 neutral overlay에서 ink와
필요한 edge만 강화합니다. 색 family는 pigment 값만 바꾸고 shared variant의 구조는 바꾸지
않아야 이후 palette를 조정할 때 예외가 생기지 않습니다.

## 2026-09-22 — Expose source palettes in Playground

- 변경 파일: `tokens/palette.ts`, `tokens/color-ladder.ts`, `app/src/playground/Palette.tsx`, Foundations 문서
- 요약: zinc surface ramp를 L0 `SURFACE_PALETTE`로 올리고, 새 Palette 화면에서 L0 source와 L1 calibrated ladder를 분리해 확인하게 했습니다.

surface 값은 semantic 역할이 생기기 전에도 하나의 중립 pigment ramp로 존재해야 합니다. 기존
neutral ladder의 실제 값을 L0 surface palette로 옮기고, L1은 같은 값을 `NEUTRAL_LADDER`라는
순서·step 계약으로만 연결했습니다. 따라서 `surface.raised` 등 L2 결과와 현재 화면 색감은 바뀌지
않습니다. Playground Palette만 raw layer를 import하는 lint 예외로 뒀습니다. 이것은 component
소비가 아니라 source 자체를 검사하는 Foundations inspector라, 일반 app code에 raw import를 여는
것과는 다른 책임입니다.

## 2026-09-22 — Add palette-to-semantic color layers

- 변경 파일: `tokens/palette.ts`, `tokens/color-ladder.ts`, `tokens/colors.ts`, semantic token 소비처·Playground·문서
- 요약: 색 정의를 palette identity → calibrated ladder → semantic token → CSS variable 소비 경로로 나누고, 기존 component API는 status 중심으로 보존했습니다.

Studio UI의 색 slot 구조처럼 hue identity와 실제 light/dark tone을 분리하되, Paper UI에서는
surface·content·border·action·status가 화면에서 읽히는 semantic 종착점이 됩니다. 따라서 component는
palette hue나 600/700 같은 tone 번호를 모르고, `tokens.color.status.error.ink`처럼 역할만 봅니다.
특히 기존 green·warning에서 normal과 Muted text가 같은 값이던 문제를 600 `mutedInk`와 700 `ink`로
갈라, colored `softMuted`도 wash surface와 함께 실제 한 단계 물러나게 했습니다. outlineMuted는 muted여도
강한 border를 유지합니다. 경계가 형태를 만드는 자리까지 약해지면 variant의 목적 자체가 사라지기 때문입니다.

후속으로, palette 계층을 만들며 light/dark hue를 하나로 평탄화했던 변경은 되돌렸습니다. warning의
light soft가 본래 amber-yellow에서 red-orange로 기울었기 때문입니다. palette는 “한 hue로 모두 생성”하는
도구가 아니라 기존 Paper UI의 Veil 조정을 보존하는 identity registry이며, mode별 calibrated hue를 둬야
구조와 화면의 색감을 함께 지킬 수 있습니다.

## 2026-09-15 — Widen Tooltip content through Box layout props

- 변경 파일: Box·Tooltip API, Playground registry, component docs·tests
- 요약: Tooltip의 shrink-to-fit 폭이 trigger 주변에서 세로로 찌그러지던 문제를 고치고, Box에 재사용 가능한 dimension·overflow API를 추가했습니다.

기존 Tooltip은 `max-width`만 정하고 실제 width를 두지 않아 absolute positioning의 shrink-to-fit 계산에 따라 긴 한국어 문장이 한두 글자씩 꺾였습니다. Content의 기본을 `width="max-content"`, `maxWidth="xl"`로 바꿔 짧은 설명은 가로로 읽고 긴 설명만 360px에서 줄바꿈하게 했습니다. `Tooltip.Content`는 Box props를 이어받으므로 `maxWidth="sm | md | lg | xl"`이나 앱 고유 CSS 길이로 정보량에 맞는 폭을 정할 수 있습니다.

Box는 임의의 CSS prop 전체를 복제하지 않고 box model의 크기와 잘림만 공통 API로 열었습니다. `width/minWidth/maxWidth`, `height/minHeight/maxHeight`, `overflow/overflowX/overflowY`가 그 범위이며, `xs~xl`은 기존 layout token으로 해석합니다. `full/fit/min-content/max-content`는 반복되는 intent, 그 밖의 CSS 길이는 저수준 primitive의 escape hatch입니다. position과 flex 배치는 소비처 className 및 Stack·Inline의 책임으로 남겨 Box가 두 번째 layout engine이 되지 않게 했습니다.

Playground의 Box 상세에서 width·maxWidth·overflow를, Tooltip 상세에서 maxWidth 사다리를 직접 바꿀 수 있습니다. 기본 Tooltip이 충분히 가로로 펼쳐지는지는 실제 bounding box와 360px 상한을 E2E로 고정했습니다.

## 2026-09-14 — Split segmented selection from Tabs

- 변경 파일: Tabs·SegmentedControl API, selection tokens, Playground·Demo·docs·tests
- 요약: 서로 다른 역할과 권장 크기를 한 variant 축에 묶던 Tabs를 panel navigation과 compact single-selection 두 컴포넌트로 분리했습니다.

기존 Tabs의 `segmented`와 `underline`은 단순한 외형 차이가 아니었습니다. segmented는 닫힌 track 안에서 값을 고르는 radio 관계이고 `sm`이 자연스러운 반면, underline은 실제 content panel을 전환하는 tab 관계이고 `md`가 기본입니다. 한 Root에서 variant로 바꾸면 shape가 한쪽에서만 의미를 갖고 기본 size도 역할에 따라 달라지는 invalid matrix가 생겼습니다.

따라서 `SegmentedControl.Item`은 `radiogroup/radio`, `size="sm"`, `shape="default | pill"`을 소유하고, Tabs는 `Tabs.List/Trigger/Content`, `tablist/tab/tabpanel`, `size="md"`만 소유합니다. 둘의 controlled 문법은 `value / defaultValue / onValueChange`로 유지했고 방향키·Home/End 이동도 각각의 접근성 역할 안에서 보존했습니다. Tabs.Content는 빈 wrapper로 끝내지 않고 trigger와 본문 사이의 12px 리듬, reduced-motion을 존중하는 짧은 reveal, keyboard focus box를 맡기되 surface는 강제하지 않았습니다. Playground에는 실제 heading과 body를 넣어 content composition도 함께 확인하도록 했습니다. SegmentedControl은 NEW, 재설계한 Tabs는 MOD로 표시합니다.

⚠ `Tabs.Item`, `variant="segmented | underline"`, Tabs의 `shape`는 제거된 breaking API입니다. 필터·보기 방식은 SegmentedControl로, 실제 panel 전환은 Tabs로 이관해야 합니다.

## 2026-09-14 — Remove generic Card abstraction

- 변경 파일: Card implementation·exports, Box Playground, component docs·tests
- 요약: Box와 책임이 겹치고 실제 제품 사용처가 없던 Card를 제거해 일반적인 붙은 면을 Box 조합 하나로 통일했습니다.

Card가 추가하던 것은 shared color variant, 기본 radius, Header·Body·Footer padding과 divider였지만 의미·상태·접근성 계약은 없었습니다. 실제 Demo에서는 사용되지 않고 Playground 표본만 존재했으며, semantic 색면은 Alert와 겹치고 고정 anatomy는 사용처마다 다른 card content를 제대로 설명하지 못했습니다. 따라서 더 강한 visual preset으로 확장하지 않고 public implementation과 export를 제거했습니다.

일반적인 붙은 면은 `Box surface + border + radius + padding`으로 조합합니다. semantic 상태는 Alert, 실제로 뜨는 surface는 Modal·Tooltip·DropdownMenu가 계속 맡습니다. E2E의 shared Card variant 검증은 제거했지만 화면의 헤어라인이 한 벌이라는 계약은 `Box border`를 기준으로 이관해 Field·Select·Textarea·hairline과 계속 비교합니다.

⚠ `Card`, `Card.Header/Body/Footer`, `CardProps`, `CardPartProps` export는 제거된 breaking API입니다. 기준선은 37개(Primitives 4 · Atoms 13 · Molecules 9 · Components 11)로 줄었고 Playground Sidebar와 문서의 수치도 함께 갱신했습니다.

## 2026-09-14 — Collapse form composition into FormField

- 변경 파일: FormField API, TextField·SearchField exports, Playground·Demo·docs·tests
- 요약: 겹치던 TextField와 SearchField를 제거하고, Field·Select·Textarea가 하나의 FormField compound 문법을 쓰도록 통합했습니다.

TextField는 `Field + Label + Hint/Error`를 prop으로 감싼 두 번째 문법이라 FormField와 책임이 겹쳤고, SearchField는 Field의 `type="search" + leading + clearable` 조합 외에 독립된 상태나 형태가 없었습니다. 두 컴포넌트를 public API와 구현에서 제거하고 기존 사용처를 각각 FormField composition과 Field recipe로 옮겼습니다. CommandMenu의 검색 input도 내부에서 Field anatomy를 직접 조합합니다.

FormField에는 `align="start | center | end | stretch"`를 추가했습니다. 이 align은 Label·Control·메시지 묶음의 배치를 정하고, Field의 기존 align은 입력값 정렬을 계속 맡습니다. 기본 `stretch`는 control이 가용 폭을 채우는 기존 폼 동작을 보존합니다. Playground 상세에서는 control을 Field·Select·Textarea로 바꿔 끼우고 align 네 값을 비교할 수 있습니다.

⚠ `TextField`, `TextFieldProps`, `SearchField`, `SearchFieldProps` export는 제거된 breaking API입니다. FormField는 임의 control을 받으므로 Error가 시각 pigment를 추측하지 않습니다. Error가 접근성 상태를 연결하고, Field·Textarea의 `status`는 해당 Atom이 명시적으로 소유하는 경계를 유지했습니다.

## 2026-09-14 — Unify component state prop naming

- 변경 파일: selection·navigation components, Banner·Pagination, Playground·docs·tests
- 요약: compound selection을 `value / defaultValue / onValueChange`로 통일하고, native event와 domain state의 이름 규칙을 분리했습니다.

Tabs·RadioGroup·Menu·Steps·TableOfContents·Navbar·Sidebar·DropdownMenu·TreeNavigation은 모두 같은 controlled/uncontrolled 문법을 씁니다. 반복 구현은 내부 `useControllableState`로 모아 callback 호출과 local state 전환도 동일하게 유지했습니다. `onChange`는 Field·Select·Checkbox처럼 React DOM event object를 그대로 전달하는 native control에만 남기고, `onSelect`는 CommandMenu의 command activation처럼 지속 상태가 아닌 실행 사건에만 남겼습니다.

값 하나로 환원되지 않는 상태는 대상을 이름에 보존했습니다. Pagination은 `page / onPageChange`, Tree branch는 `expandedValues / defaultExpandedValues / onExpandedValuesChange`, disclosure는 `open / defaultOpen / onOpenChange`를 씁니다. 의미색은 shared `color`로 통일해 Banner의 `tone`을 제거했고, Pagination의 local variant도 shared 철자인 `outline`에 맞췄습니다.

⚠ `active`, `current`, selection용 `onSelect/onChange`, Banner `tone`, Pagination `outlined`, Sidebar Badge `activeVariant`, Tree `expanded/defaultExpanded/onExpandedChange`는 제거된 breaking API입니다. Playground·Demo·문서와 테스트를 새 이름으로 함께 이관했습니다.

## 2026-09-14 — Make native Select anatomy compound

- 변경 파일: Select API·Playground·Demo·recipes·tests
- 요약: `options` 객체 배열을 제거하고 `Select.Option/Group`으로 native option 구조를 JSX에 드러냈습니다.

Select의 option은 단순 계산 결과처럼 보이지만 순서·disabled·optgroup이 실제 사용자 인터페이스 구조이므로, 다른 compound 컴포넌트와 같은 기준을 적용했습니다. API에서 받은 배열은 `options.map(option => <Select.Option …>)`으로 조립할 수 있어 별도 data adapter를 유지할 이유가 적습니다.

⚠ native `<select>`의 option은 rich content를 안정적으로 렌더링하지 못합니다. `Select.Option`의 children 타입을 `string | number`로 제한해 Badge·Icon 같은 조합이 가능하다는 잘못된 기대를 막았습니다. 빈 value option을 placeholder로 읽는 기존 색상 규칙은 실제 `<option>` 구조에서도 그대로 유지됩니다.

## 2026-09-14 — Expose remaining visible anatomy as compound parts

- 변경 파일: Tooltip·FormField·Card·Alert·Banner·PageHeader·EmptyState, Playground·Demo·docs·tests
- 요약: JSX prop 안에 숨었던 trigger/content와 title/description/action 구조를 이름 있는 compound parts로 옮겼습니다.

compound 전환 기준은 “사용자가 화면의 내부 anatomy를 직접 조립하는가”입니다. Tooltip은 `Trigger/Content`, FormField는 `Label/Control/Hint/Error`, PageHeader와 EmptyState는 각 content slot이 markup에 그대로 드러납니다. Card는 `Header/Body/Footer`를 제공하되 단순 컨테이너 용례의 raw children과 root padding도 유지해, 구조를 강요하지 않고 필요할 때만 anatomy를 사용합니다. Alert의 상태 아이콘은 기본값을 유지하면서 `Alert.Icon`으로 교체할 수 있게 했습니다.

Pagination의 page range와 SearchField의 검색 icon처럼 컴포넌트가 내부에서 계산하거나 목적상 고정한 구조는 compound로 바꾸지 않았습니다. 외부 데이터와 내부 구현까지 모두 parts로 노출하면 API가 길어질 뿐 의미가 늘지 않기 때문입니다.

⚠ `Tooltip content`, `FormField label/hint/error`, `Alert title`, `Banner action`, `PageHeader`와 `EmptyState`의 slot props는 제거한 breaking change입니다. Playground 전수·상세 화면, Demo, recipe와 접근성 테스트를 새 API로 함께 이관했습니다. FormField Root는 control id와 설명 관계를 소유하며 Error가 있으면 Hint를 숨기고 `aria-invalid`를 자동으로 연결합니다.

## 2026-09-14 — Make visible component anatomy compound by default

- 변경 파일: Table·Tabs·RadioGroup·Breadcrumb·Menu·Steps·TableOfContents·Navbar·DropdownMenu·CommandMenu·TreeNavigation, Playground·docs·tests
- 요약: 반복되는 화면 구조를 객체 배열에 숨기던 API를 JSX compound parts로 전환하고, Table의 기본 표본을 외곽 Card가 없는 직각형 데이터 표로 교체했습니다.

사용자가 화면에서 직접 읽고 조합하는 구조는 `Component.Item`, `Table.Column`, `Table.Cell`처럼 markup에 드러나야 Badge·Link·복합 content를 중첩 객체 없이 자연스럽게 넣을 수 있습니다. Root는 selection·keyboard·orientation 같은 공유 상태만 context로 소유하고, 각 part가 자기 semantic element와 content를 소유하도록 나눴습니다. Table은 이 구조를 기본 `Table` API로 삼았고, 단순 데이터 렌더링이 필요한 경우만 별도 `DataTable` adapter로 남겼습니다.

모든 배열 prop을 기계적으로 없애지는 않았습니다. Select의 native option과 Pagination의 계산된 page range처럼 화면 anatomy가 아니라 닫힌 데이터인 경우는 scalar/data API가 더 정확합니다. 반대로 TableOfContents·TreeNavigation처럼 계층 자체가 보이는 navigation은 compound API가 구조와 접근성 계약을 함께 보여줍니다.

⚠ 기존 `items`, `commands`, `columns/rows`, `brand/trailing` 기반 호출은 breaking change입니다. Playground 전수·상세 예제, Demo/Home, 문서와 테스트를 새 API로 함께 이관했습니다. Table 상세 preview는 showcase용 둥근 frame을 제거해 `paper.sunken` header와 선 없는 body가 실제 직각 silhouette로 보이게 했습니다.

## 2026-09-14 — Complete the navigation component family

- 변경 파일: Menu·Steps·TableOfContents·DropdownMenu·CommandMenu·TreeNavigation, Sidebar compound API, Playground·docs·tests
- 요약: 위치와 탐색의 빈 구간을 역할별 여섯 컴포넌트로 채우고, Sidebar를 구조가 JSX에 드러나는 compound API로 전환했습니다.

Menu는 한 열의 action/navigation, Steps는 실제 순서, TableOfContents는 문서 내부 위치로 역할을 좁혔습니다. 고수준에서는 DropdownMenu만 떠 있는 surface라 overlay shadow를 갖고, CommandMenu는 검색 가능한 listbox, TreeNavigation은 branch 확장과 leaf 선택을 분리합니다. 비슷해 보이는 목록을 하나의 범용 컴포넌트로 합치지 않은 이유는 ARIA role과 키보드 계약이 서로 다르기 때문입니다.

Sidebar의 `groups` data API는 항목 안에 Badge나 추가 요소를 넣을수록 중첩 객체가 UI 구조를 감추는 문제가 있었습니다. `Sidebar.Group/Item/Badge` compound parts로 바꾸어 실제 계층과 조합을 JSX에 남겼고, Root의 active/onSelect context와 selected badge overlay는 그대로 공유합니다. Playground 전수 화면과 각 상세 registry를 40개 기준으로 갱신했습니다.

## 2026-09-14 — Make Sidebar selection win immediately after click

- 변경 파일: Sidebar active style·Playground E2E
- 요약: 클릭 뒤 포인터가 같은 위치에 남아 있어도 일반 hover가 active 면을 덮지 못하게 하고, selected 배경을 badge overlay와 같은 프레임에 적용했습니다.

원인은 `.sidebarItem:hover`와 active class의 CSS 우선순위가 같아 hover 규칙이 selected background를 계속 이기던 것이었습니다. active 자체에 `:hover`를 명시해 selected 값을 다시 고정했고, active에서는 background transition도 제외해 badge의 selected overlay만 먼저 보이는 짧은 불일치를 없앴습니다. E2E는 Button 항목에서 Badge 항목을 실제로 클릭해 포인터가 남은 상태의 URL·배경·transition property를 함께 검증합니다.

## 2026-09-14 — Preserve soft Sidebar badges under selected overlay

- 변경 파일: Sidebar badge state style·unit test·component docs
- 요약: selected badge의 기본을 `quiet`로 낮추는 대신, `soft` pigment 위에 행과 같은 neutral selected overlay를 합성하는 안으로 교체했습니다.

`quiet`는 중첩 surface를 확실히 없애지만 NEW/MOD의 작은 색면까지 사라져 release 표식의 스캔성이 줄었습니다. 후속 시안은 색면을 유지하면서 같은 `interaction.selected` overlay를 행과 badge 양쪽에 적용해 서로 같은 조명 아래 놓인 것처럼 묶습니다. 명시적인 `activeVariant`가 `soft`가 아닐 때는 overlay를 더하지 않아 호출자의 선택을 보존합니다.

## 2026-09-14 — Integrate badges into selected Sidebar rows

- 변경 파일: Sidebar API·unit test·component docs
- 요약: 선택된 행에서는 badge를 `soft`에서 `quiet`로 낮춰, selected 면 위에 작은 색면이 별도 레이어처럼 뜨지 않게 했습니다.

비활성 badge는 목록을 훑을 때 변경 표식이 보여야 하므로 기존 `soft`를 유지합니다. 활성 행은 행 전체의 selected 면이 이미 상태를 말하므로 badge까지 면을 가지면 중첩 surface가 됩니다. 기본 전이는 `soft → quiet`이며, 특별한 navigation에서는 `badge.variant`와 `badge.activeVariant`로 두 상태를 shared variant 안에서 각각 지정할 수 있습니다.

## 2026-09-14 — Complete the shared component architecture

- 변경 파일: shared color profile, Card·Table·Modal·navigation components, Playground registry/sidebar, component docs/tests
- 요약: 상위 컴포넌트를 개별 시안 모음이 아니라 shared 축과 compound anatomy로 정리하고, 빠져 있던 location·navigation·empty/pagination 관계를 채웠습니다.

Card의 `outlined·filled·solid·plain` 지역 문법은 제거하고 Button·Badge·Alert와 같은 `color × variant`를 직접 받게 했습니다. 기본은 `primary × hairline`이며 semantic Card도 별도 status API 없이 `info · success · warning · error`를 그대로 조합합니다. Card는 정적인 면이므로 shared 색 profile만 재사용하고 interactive hover gate와 shadow는 의도적으로 제외했습니다. 지역 variant는 Table의 행 구분(`plain·ruled·striped`)이나 Tabs의 navigation 구조처럼 shared 색 무게로 표현할 수 없는 경우에만 남깁니다.

Table은 간단한 목록을 위한 data API와 `Root/Header/Body/Row/Column/Cell` compound API를 같은 스타일 계약으로 제공하며 열별 align·numeric을 소유합니다. Modal도 Header·Title·Description·Body·Footer·Close anatomy와 자동 aria 연결을 갖습니다. Tooltip content는 `ReactNode`로 넓혔고, Breadcrumb·PageHeader·Sidebar·EmptyState·Pagination을 추가했습니다. Playground navigation의 `NEW`·`MOD` 표식은 전용 마크업이 아니라 Sidebar item metadata로 전달합니다.

⚠ accent soft를 sRGB로 primary neutral과 섞으면 hue가 틀어지고 탁해졌습니다. 최종 값은 OKLCH에서 accent hue를 고정하고 lightness는 wash→primary soft의 75%, chroma는 wash→edge의 75%로 이동시켰습니다. darker surface에 맞춰 `softInk`를 분리해 색을 맑게 유지하면서 작은 글자 대비도 보존했습니다.

## 2026-09-13 — Finalize solid Form borders and semantic hover shadow

- 변경 파일: Field·Select·Textarea 스타일, shape helper, 관련 문서·Playground E2E
- 요약: Lab에서 비교한 `solid / solid / semantic Form only` 조합을 확정하고 실험 UI를 제거했습니다.

neutral Field·Select·Textarea는 쉬는 `border.base`를 유지하다 hover에서 `primary.base` solid 선으로 올라갑니다. semantic Field·Textarea는 처음부터 해당 accent의 `solid` 선을 쓰며, hover에서는 선을 더 진하게 만들지 않고 같은 pigment를 `0 0 12px / 22%` 중앙 halo로 번지게 합니다. focus/focus-within에서는 hover shadow를 끄고 기존 파란 outline만 남깁니다.

⚠ 색 shadow를 Button·navigation·data row·neutral Form까지 넓히는 안도 비교했지만, 모든 hover가 떠 보이면 elevation 문법이 흐려집니다. 상태선이 이미 최종 농도라 hover 변화를 선으로 만들 수 없는 semantic Form만 예외로 남겼습니다. geometry와 농도는 `semanticFormHoverShadow` helper에 모으고 status별 accent solid만 주입합니다.

결정이 끝난 `?lab=form-hover` UI, runtime data attribute, override stylesheet와 Lab 전용 E2E는 모두 제거했습니다. 영구 관계 테스트가 neutral Form 세 종류의 solid hover·무그림자와 semantic Field의 solid rest·중앙 pigment shadow를 검증합니다.

## 2026-09-10 — Add a Paper UI design lab for field and pigment decisions

- 변경 파일: `workspace/app/src/lab/`, Field·Textarea 상태 스타일, color token 및 관련 문서·테스트
- 요약: 기존 spacing·shape 작업을 `92f3c50`으로 먼저 고정한 뒤, Field geometry 4안과 light accent pigment 3안을 실제 Playground 전체에 적용해 비교하는 Lab을 추가했습니다.

Field hover는 쉬는 상태의 `border.base`를 유지하다 포인터가 올라온 순간에만 대비 1.60의 `border.strong`으로 이동합니다. semantic status는 기본부터 `solid`를 써서 상태가 내용보다 먼저 튀던 문제를 `edge → hover edgeStrong` 구조로 바꿨습니다.

아이콘 Field는 높이를 키우면 같은 size의 Button·Select와 정렬 계약이 깨집니다. 그래서 기본 토큰을 바로 확정하지 않고, 높이를 유지한 채 어도먼트가 있는 변만 안으로 당기는 안을 포함해 네 geometry를 `?lab=design`에서 비교하도록 했습니다. 팔레트 후보는 아직 light만 검산했으므로 dark selector를 덮지 않게 제한했습니다.

첫 비교 뒤에는 현재 accent의 진한 `solid`·`ink`가 가장 낫다는 판단을 반영해 후보를 다시 좁혔습니다. 새 Veil·Pulp는 진한 축과 hover용 `edgeStrong`을 고정하고, 넓게 닿는 `wash`·쉬는 `edge`에만 paper neutral을 각각 45%·65% 섞습니다. Geometry에는 높이 변경 없이 모든 Field의 x padding을 세로 여백과 맞추는 7·9·12px 안을 추가했습니다.

Veil을 최종 accent로 확정해 package의 light `wash`·`edge` 토큰에 반영하고 palette 선택 UI는 제거했습니다. Lab의 geometry도 Field 전용이 아니라 Form 공통 축으로 고쳤습니다. Form 정사각 후보는 `inputPaddingX`와 `textareaPaddingY` 변수를 함께 바꿔 Field·Select·Textarea를 동시에 움직이며, 아이콘 보정안은 그 위에서 Field 어도먼트와 Select chevron만 추가 보정합니다.

Hairline은 outline보다 선만 옅고 ink가 같아서 실제 시각 무게가 충분히 갈리지 않는다는 문제가 남았습니다. 전역 토큰을 바로 늘리지 않고, light AA를 지키는 hue별 `subInk` 후보를 Lab에 추가했습니다. 쉬는 hairline만 낮추고 interactive hover에서는 기존 ink로 복귀합니다.

별도 `solidFg`는 `wash`와 같은 hue의 끝점을 중복하면서 라이트 solid 위 대비가 더 약했습니다. 슬롯을 제거하고 solid 위 글자와 Banner가 `wash`를 재사용하도록 통일했습니다. Veil wash 기준 대비는 라이트 4.56~4.89, 다크 5.16~5.80입니다.

Ink 비교는 `ink / subInk 1 / subInk 2` 세 단계로 확장했습니다. subInk 1은 AA 여유를 둔 짙은 안, subInk 2는 `ink.faint`처럼 물러나되 normal text AA를 지키는 끝값입니다. 농도와 적용 범위를 섞지 않도록 `Hairline만 / + Form 값`을 별도 축으로 두었습니다. 후보는 아직 light 전용이며 확정 전까지 package 토큰에는 넣지 않습니다.

최종 선택은 `Form 정사각 + 기존 ink`입니다. `inputPaddingX`를 7/9/12, `textareaPaddingY`를 3.5/5.5/8.5로 확정해 Field·Select·Textarea가 함께 소비하도록 했습니다. subInk는 가독성과 위계가 흐려져 도입하지 않았습니다. 선택이 끝난 Lab 컴포넌트, runtime stylesheet, session state, 비교용 data attribute와 Lab 전용 테스트는 모두 제거하고 확정 토큰의 관계 테스트로 환원했습니다.
## 2026-09-13 — Select placeholder tone

- 변경 파일: `workspace/packages/paper-ui/src/atoms/Select.css.ts` · `workspace/app/src/pages/Playground.tsx`
- 요약: 빈 value option이 선택된 Select는 label과 chevron을 `ink.faint`로 함께 낮췄다.

Native select에는 placeholder 속성이 없으므로 빈 value option을 그 상태의 계약으로 삼았다. `:has(option[value=""]:checked)`가 실제 선택값을 읽기 때문에 controlled와 uncontrolled Select가 별도 React 상태 없이 같은 규칙을 따르고, 선택 후에는 원래 ink·chevron 색으로 즉시 돌아온다. Playground에도 빈 선택 예시를 남겨 이 상태를 바로 검토할 수 있게 했다.
## 2026-09-13 — Molecule · Component baseline expansion (`dev/molecule-components`)

- 변경 파일: `workspace/packages/paper-ui/src/{molecules,components}` · app demo/playground · component docs
- 요약: FormField·SearchField와 PageHeader·EmptyState·Pagination을 추가해 27개 기준선을 32개로 확장했다.

새 컴포넌트는 card·색면·shadow를 새로 만들지 않고 기존 paper/ink 축 안에서 반복 조립과 접근성 연결을 맡는다. FormField는 Select·Textarea까지 label/note 관계를 연결하지만 visual status를 빼앗지 않아 Atom의 status 계약을 보존했다. Pagination은 데모에서도 실제 행을 slice하고 필터 변경 시 첫 페이지로 돌아가며, EmptyState는 결과가 없을 때에만 다음 행동을 제시한다. 따라서 "컴포넌트가 많아 보이는" 방향이 아니라 데이터 화면의 시작·빈 상태·이동이라는 빠져 있던 문장을 닫는다.
## 2026-09-14 — Define structural axes for Molecules and Components

- 변경 파일: Card·Tabs·RadioGroup·Table·Modal, component architecture 문서, Playground·Demo·E2E
- 요약: 상위 레이어를 개수로만 채우지 않고 variant·density·size·orientation의 소유권을 정한 뒤 실제 컴포넌트와 비교 표본에 반영했습니다.

Atom의 `color × variant`는 의미색과 시각 무게지만, Card·Table·Tabs의 `variant`는 구조를 고릅니다. Card는 `outlined·filled·plain`, Table은 `plain·ruled·striped`, Tabs는 `segmented·underline`으로 닫았습니다. Table의 `density`는 14px 글자를 그대로 둔 행 높이 36·44·52이고, Modal의 `size`는 담는 일의 폭 360·432·640입니다. RadioGroup에는 짧고 대등한 선택지를 위한 horizontal 배치를 열었습니다.

⚠ shadow를 Card variant로 열지 않았고 ruled와 striped를 겹치는 조합도 만들지 않았습니다. 둘은 각각 붙어 있는 면의 경계와 행 구분을 한 번만 말해야 하기 때문입니다. underline Tabs에서는 닫힌 실루엣이 없으므로 `shape`를 무시합니다. 이런 금지 조합까지 `docs/foundations/component-architecture.md`에 정본으로 남겼습니다.

Playground 시각 검토에서 Table 세 variant와 세 density가 한 줄에서 바로 비교되도록 표본 폭을 15rem으로 맞췄습니다. Card의 세 경계, underline의 선형 구조, Table의 구분법·행 높이, Modal 폭을 computed style로 고정했으며 전체 52개 E2E가 통과합니다.
## 2026-09-15 — Rename shape default to rounded

- 변경 파일: Button·Badge·Field·Select·SegmentedControl API, Playground registry, architecture docs
- 요약: shape 축의 모호한 `default` 이름을 `rounded`로 바꾸고, 컴포넌트별 기본 shape를 분리했습니다.

`default`는 상태 기본값처럼 읽혀 실제 모양을 설명하지 못했습니다. 기존 곡선은 `rounded`, 알약형은 `pill`로 명명하고, SegmentedControl만 생략 시 `pill`을 기본으로 두었습니다. 나머지 한 줄 컨트롤은 기존 곡선을 유지하며 명시적인 override는 `shape="rounded"`로 표현합니다.
## 2026-09-15 — Clarify Select defaults in Playground

- 변경 파일: Playground registry·detail control
- 요약: Select의 실제 기본값(`md · rounded`)을 `default(md)`, `default(rounded)`로 표시하고 명시값과 구분했습니다.

기본 선택지는 별도 sentinel로 유지해 미지정 prop을 preview와 생성 코드에서 재현합니다. Select 컴포넌트 자체의 기본 계약은 변경하지 않았습니다.
## 2026-09-15 — Expose defaults in every Playground prop select

- 변경 파일: Playground Detail control
- 요약: 모든 enum prop select에 `default (실제값)` 옵션을 공통으로 노출했습니다.

기본값을 선택하면 실제 상태는 기존 `def`를 유지해 preview와 생성 코드가 prop 생략 상태를 재현합니다. 명시값과 기본값을 같은 값으로 중복 저장하지 않고 select 표시만 sentinel로 분리했습니다.
## 2026-09-15 — Omit default props in Playground code output

- 변경 파일: Playground Detail control·registry
- 요약: 모든 enum control에 `default (값)`을 노출하고, 기본 선택 시 생성 코드에서 prop을 생략하도록 정리했습니다. Box generator의 잘못된 기본 비교와 존재하지 않는 padding 출력도 수정했습니다.

표시용 sentinel은 내부 상태를 바꾸지 않고 실제 `def` 값으로 환원됩니다. 따라서 preview와 code가 동일한 기본 계약을 유지하며, Box는 `raised · md · md` 기본값을 코드에 중복 출력하지 않습니다.
## 2026-09-15 — Make Playground code editable

- 변경 파일: Playground Detail editor·styles
- 요약: 코드 박스를 editable textarea로 바꾸고, 생성된 Paper UI JSX의 props·단순 text children을 다시 읽어 preview를 갱신하도록 연결했습니다.

임의 JavaScript를 실행하지 않고 각 component spec의 선언된 prop만 opening tag에서 읽습니다. 따라서 문법이 깨진 편집 중에도 앱은 안전하게 유지되고, preview는 마지막 유효 상태를 보여주며 오류 문구를 편집 영역에 남깁니다. Props 패널을 조작하면 편집 초안을 버리고 canonical code를 재생성합니다.
## 2026-09-15 — Read stateful Playground snippets

- 변경 파일: Playground Detail parser
- 요약: `value={value}` 형태를 쓰는 Menu·Tabs·SegmentedControl도 코드 안의 `useState("...")` 초기값을 읽어 preview와 연결했습니다.

기존 code generator가 동작 예제를 보여주기 위해 hook 표현식을 포함하고 있어 literal attribute만 읽으면 선택값이 기본값으로 되돌아갔습니다. hook의 단순 문자열 초기값만 해석하고, 임의 JavaScript 실행은 여전히 하지 않습니다.
## 2026-09-15 — Remove visible code placeholders

- 변경 파일: Playground Detail code expansion·registry
- 요약: 코드 편집 영역에 보이던 `<Box>…</Box>` 같은 placeholder를 실제 Text·Icon·Breadcrumb JSX로 확장했습니다.

코드박스가 이제 복사·수정 가능한 source surface인 만큼 생략 기호를 남기지 않도록 했습니다. Box 기본 예제는 preview와 같은 `surface=raised` 내용을 출력하고, 단순한 반복 예제와 아이콘·breadcrumb도 실제로 읽을 수 있는 JSX 조각을 보여줍니다.
## 2026-09-16 — Keep Playground code read-only until edit mode

- 변경 파일: Playground Detail code surface·styles
- 요약: 코드 박스를 기본 read-only pre로 바꾸고 우측 상단 연필 icon button으로만 편집 모드에 진입하게 했습니다.

코드는 평소 preview를 설명하는 조용한 reference로 두고, 사용자가 의도적으로 연필을 누른 경우에만 textarea가 열립니다. 복사와 편집 액션을 같은 우측 상단 action cluster에 배치해 코드 영역의 시각적 위계를 유지했습니다.
## 2026-09-16 — Use hairline edit toggle state

- 변경 파일: Playground Detail code action
- 요약: 코드 편집 버튼을 `hairline` variant로 통일하고, 편집 중에는 pencil 대신 X 아이콘을 표시합니다.

아이콘만 바꾸는 대신 현재 동작 상태를 닫기 affordance로 직접 표현해 편집 모드 진입·종료를 한 자리에서 이해할 수 있게 했습니다.
## 2026-09-16 — Align read-only and edit code typography

- 변경 파일: Playground detail styles
- 요약: read-only `pre`와 edit `textarea`에 동일한 mono font, weight, style, caption tracking을 명시했습니다.

폼 컨트롤의 브라우저 기본 타이포그래피가 편집 상태에서만 남아 자간이 달라 보일 수 있었습니다. 두 상태가 같은 텍스트 surface처럼 보이도록 typography 축을 직접 공유하게 했습니다.
## 2026-09-16 — Contrast code surface by edit state

- 변경 파일: Playground code block state styles
- 요약: read-only 코드는 `sunken`, 편집 중 코드는 `raised` surface를 사용하도록 전환했습니다.

브라우저에서 Box Playground를 확인한 결과 평소에는 코드가 한 단계 물러나고, 편집 모드에서는 textarea가 흰 면으로 올라와 입력 대상이 분명해졌습니다. 편집 버튼을 누를 때만 class가 바뀌므로 preview나 Props surface에는 영향이 없습니다.
## 2026-09-16 — Remove copy button fill

- 변경 파일: Playground code action styles
- 요약: 복사 버튼의 raised 배경과 border를 제거해 quiet 텍스트 액션으로 정리했습니다.

편집 toggle만 hairline shape를 유지하고, 복사는 코드 surface 위에 조용히 놓이는 보조 액션으로 분리했습니다.
## 2026-09-16 — Use system Button for code copy

- 변경 파일: Playground Detail code action·styles
- 요약: raw `<button>` 복사 액션을 Paper UI `Button`의 `hairline` variant로 교체하고 전용 raw button CSS를 제거했습니다.

편집 toggle과 복사 액션 모두 공개 디자인 시스템 Button을 사용해 높이·focus·hover·radius 계약을 공유합니다.
## 2026-09-16 — Add compact xs control size

- 변경 파일: `workspace/packages/paper-ui/src/tokens/shape.ts`, `workspace/packages/paper-ui/src/atoms/Button.css.ts`, `workspace/app/src/playground/Detail.tsx`
- 요약: Playground 코드 액션을 `Button size="xs"`로 전환하고, 컨트롤 사다리에 xs 높이·패딩·폰트·아이콘·폼·배지 값을 추가했습니다.

복사 액션만 `sm`의 34px 실루엣을 유지한 채 폰트만 줄이면 같은 size 계약이 컴포넌트별로 갈라집니다. xs를 독립 단계로 두어 마이크로 액션의 높이와 글자 크기를 함께 줄이고, 기존 sm의 14px 가독성 계약은 보존했습니다. Variant 확장은 현재 매핑을 정리한 뒤 별도 작업으로 진행합니다.
## 2026-09-16 — Separate button typography from control size and expand variants

- 변경 파일: `workspace/packages/paper-ui/src/atoms/Button.tsx`, `workspace/packages/paper-ui/src/atoms/Button.css.ts`, `workspace/packages/paper-ui/src/resolvers/color.ts`, `workspace/packages/paper-ui/src/styles/color-profile.ts`, `workspace/packages/paper-ui/src/styles/color.css.ts`
- 요약: 컨트롤 size는 기존 `sm/md/lg`로 유지하고 Button에 `fontSize` override를 추가했습니다. 복사 액션은 `sm + label` 조합을 사용합니다. `hairlineMuted`, `muted`, `ghost`, `ghostMuted`, `tonal`, `tonalMuted`를 4축 color profile로 확장했습니다.

xs를 전체 컨트롤 사다리에 넣어 보니 복사 버튼 하나를 줄이기 위해 높이·아이콘·폼 밀도까지 함께 내려가는 부작용이 생겼습니다. 따라서 size는 geometry 축으로 고정하고, 작은 보조 라벨만 typography 축에서 조절하도록 분리했습니다. Variant는 기존 `quiet` 호환성을 남긴 채 각 profile이 foreground·background·border·interaction을 독립적으로 정의하며, muted 계열만 hover 시 잉크와 선을 함께 강화합니다.
## 2026-09-16 — Expose typography overrides in Playground controls

- 변경 파일: `workspace/app/src/playground/registry.tsx`, `workspace/packages/paper-ui/src/atoms/Badge.tsx`, `workspace/packages/paper-ui/src/atoms/Field.tsx`, `workspace/packages/paper-ui/src/atoms/Select.tsx`, `workspace/packages/paper-ui/src/atoms/Textarea.tsx`
- 요약: Button·Badge·Field·Select·Textarea의 Props table에 `fontSize`를 노출하고, 기본값은 코드에서 생략되도록 했습니다. 각 컴포넌트의 `size` geometry는 유지한 채 typography만 조정합니다.

`size`와 `fontSize`를 같은 축으로 묶으면 작은 라벨 하나 때문에 컨트롤 높이와 아이콘까지 축소됩니다. Playground에서는 `default / label / caption / body`만 노출해 의도적인 typography override만 허용하고, 기본값은 기존 컴포넌트의 size 사다리를 따르게 두었습니다.
## 2026-09-16 — Rename muted variant to softMuted

- 변경 파일: `workspace/packages/paper-ui/src/resolvers/color.ts`, `workspace/packages/paper-ui/src/styles/color-profile.ts`, `workspace/app/src/playground/registry.tsx`
- 요약: `muted` variant를 `softMuted`로 이름을 명확히 바꿨습니다.

이 variant는 일반적인 약화 상태가 아니라 soft 배경·soft border·softInk를 한 묶음으로 쓰는 조합이므로, 이름에 기반면을 드러내는 편이 shared variant 사다리를 읽기 쉽습니다. 시각값과 hover 동작은 바꾸지 않았습니다.
## 2026-09-16 — Remove unused tonal variants

- 변경 파일: `workspace/packages/paper-ui/src/resolvers/color.ts`, `workspace/packages/paper-ui/src/styles/color-profile.ts`, `workspace/app/src/playground/registry.tsx`
- 요약: `tonal`과 `tonalMuted`를 shared variant 사다리에서 제거했습니다.

현재는 solid·soft와 역할이 겹치고, 별도의 tonal surface를 요구하는 실제 사용처가 없습니다. 필요할 때 다시 추가할 수 있도록 색 profile 축을 유지하되 공개 variant로는 노출하지 않았습니다.
## 2026-09-16 — Rebalance muted variants and remove quiet

- 변경 파일: `workspace/packages/paper-ui/src/resolvers/color.ts`, `workspace/packages/paper-ui/src/styles/color-profile.ts`, `workspace/packages/paper-ui/src/components/Modal.tsx`, `workspace/packages/paper-ui/src/components/Pagination.tsx`, `workspace/app/src/playground/registry.tsx`
- 요약: `quiet`을 제거하고 `plainMuted`, `outlineMuted`를 추가했습니다. `softMuted`는 무테 soft variant로 분리했으며, 기존 quiet 사용처는 `ghostMuted`로 치환했습니다. Playground variant 순서도 기본 variant 뒤 muted 대응 variant가 오도록 재정렬했습니다.

이제 면과 선의 조합이 겹치지 않습니다. `softMuted`는 soft 면만, `plainMuted`는 soft 면과 hairline 선, `outlineMuted`는 투명 면과 강한 선, `hairlineMuted`는 투명 면과 page hairline을 담당합니다.
## 2026-09-16 — Preserve strong borders in muted variants

- 변경 파일: `workspace/packages/paper-ui/src/styles/color-profile.ts`
- 요약: `plainMuted`의 border를 `plain`과 같은 강한 `edgeStrong`으로 복원했습니다. `outlineMuted`도 `outline`과 동일하게 이미 강한 border를 사용하고 있음을 확인했습니다.

Muted는 foreground만 낮추고 원본 variant의 구조적 border 강도는 보존해야 합니다. 따라서 plain·outline의 muted 버전은 각각 원본과 같은 강한 선을 유지하고, soft·hairline 계열만 해당 계층의 약한 선을 사용합니다.
## 2026-09-16 — Tune Playground code viewer surfaces

- 변경 파일: `workspace/app/src/playground/Detail.tsx`, `workspace/app/src/playground/detail.css.ts`
- 요약: 코드뷰어의 복사·편집 버튼을 `hairlineMuted`로 통일하고, 읽기 상태는 `raised`, 편집 상태는 `sunken`으로 조정했습니다.

코드는 평소에는 떠 있는 reference surface로 읽히고, 편집 중에는 입력 surface로 가라앉아야 한다는 상태 대비를 적용했습니다. 버튼은 약한 잉크와 hairline을 함께 사용해 코드 영역 위에서 과하게 튀지 않게 했습니다.
## 2026-09-16 — Add Button icon size axis

- 변경 파일: `workspace/packages/paper-ui/src/atoms/Button.tsx`, `workspace/app/src/playground/registry.tsx`
- 요약: Button에 `iconSize` prop을 추가해 외곽 `size`, 텍스트 `fontSize`, 아이콘 아트보드 크기를 독립적으로 조절하도록 했습니다. `iconOnly`와 아이콘+라벨 조합 모두 지원합니다.

Button은 기존처럼 children으로 `<Icon>`을 받되, `iconSize`가 지정되면 직접 자식 Icon의 size를 덮어씁니다. 아이콘이 아닌 children은 건드리지 않으므로 라벨·복합 콘텐츠 API와 충돌하지 않습니다. Playground Props table에도 `iconSize`를 노출했습니다.
## 2026-09-16 — Use Button iconSize for code editor toggle

- 변경 파일: `workspace/app/src/playground/Detail.tsx`
- 요약: 코드뷰어 연필·닫기 버튼이 `Button iconSize="sm"`을 사용하도록 정리하고, Icon의 직접적인 size 우회를 제거했습니다.

아이콘 크기 축을 추가한 뒤 실제 소비처도 새 API를 사용하게 맞췄습니다. 화면 크기는 기존과 동일하지만, 버튼 외곽·아이콘 아트보드의 책임이 코드에 명확히 드러납니다.
## 2026-09-16 — Add icon plus label state to Button Playground

- 변경 파일: `workspace/app/src/playground/registry.tsx`
- 요약: Button Props table에 `leadingIcon` 토글을 추가해 일반 라벨 버튼에서도 아이콘+라벨 조합을 preview와 코드에 함께 노출합니다.

`iconOnly`는 접근성 이름이 필요한 별도 상태로 유지하고, `leadingIcon`은 기존 compound children API(`<Icon />라벨`)를 보여주는 Playground 전용 조합 토글로 분리했습니다.
## 2026-09-16 — Split IconButton from Button

- 변경 파일: `workspace/packages/paper-ui/src/atoms/Button.tsx`, `workspace/packages/paper-ui/src/atoms/IconButton.tsx`, `workspace/app/src/playground/registry.tsx`, `workspace/app/src/playground/Detail.tsx`
- 요약: Button의 `iconOnly`, `iconSize`, leading icon 해석을 제거하고 `IconButton`을 별도 atom으로 추가했습니다. Modal·코드뷰어·전수 Playground 사용처를 새 API로 전환했습니다.

텍스트 버튼이 children 내부의 아이콘을 해석하면 Button API가 compound layout까지 책임지게 됩니다. 이제 IconButton만 정사각 geometry와 `iconSize`를 소유하며, Button은 텍스트 액션에 집중합니다. Playground에도 IconButton 전용 Props table을 추가했습니다.
## 2026-09-16 — Require Playground parity for system changes

- 변경 파일: `CLAUDE.md`
- 요약: 컴포넌트·prop·variant·token 변경 시 app Playground의 preview·Props table·생성 코드까지 반드시 반영하고 실제 동작을 확인하도록 작업 완료 체크리스트에 추가했습니다.

Playground가 이 레포의 유일한 시각 검증 surface이므로, 패키지 코드만 바뀐 상태를 완료로 보지 않도록 규칙을 명문화했습니다.
## 2026-09-16 — Move Icon to primitives and align its size vocabulary

- 변경 파일: Icon primitive·tokens, public exports, IconButton·form consumers, Playground registry
- 요약: Icon을 Atom에서 Primitive로 이동하고 `sm/md/lg` 대신 typography ladder의 `label/caption/body/subheading`을 사용하도록 정리했습니다.

아이콘은 텍스트처럼 조합되는 가장 낮은 수준의 표시 primitive라 Button·Field 같은 Atom과 같은 서랍에 둘 이유가 없었습니다. 공개 크기 이름은 typography ladder와 공유하되, 24 viewBox path의 내부 여백 때문에 실제 아트보드는 14·16·18·20px로 광학 보정했습니다. IconButton의 기본은 기존 `md`와 같은 18px인 `body`로 유지해 화면 크기를 보존했습니다. Playground에서도 Icon을 Primitives 그룹으로 옮기고 size·iconSize 선택지를 새 어휘로 갱신했습니다.
## 2026-09-16 — Keep Sidebar state overlay above badges

- 변경 파일: Sidebar layer CSS·compound badge test
- 요약: Sidebar hover/selected overlay를 행 pseudo-element로 올려 Badge까지 같은 상태 틴트 아래에 두었습니다.

기존에는 selected soft Badge 자체에 별도 gradient를 붙여 배지가 행의 overlay 위로 튀어나온 것처럼 보였습니다. 이제 행이 stacking context를 소유하고 텍스트와 Badge는 overlay보다 아래에 놓입니다. selected는 클릭 즉시, hover는 포인터 진입 즉시 같은 레이어에서 합성되며 Badge의 의미 색은 유지하면서 별도 칩처럼 떠 보이지 않습니다.
## 2026-09-16 — Lift neutral Field hover border to primary hover

- 변경 파일: `workspace/packages/paper-ui/src/atoms/Field.css.ts`
- 요약: 일반 Field의 hover 테두리를 `primary.base`에서 한 단계 밝은 `primary.hover`로 조정했습니다.

일반 Field는 배경을 바꾸지 않고 선으로만 hover를 알리므로, resting border와의 차이는 유지하면서 primary solid보다 덜 무거운 `#3f3f46`을 사용하도록 했습니다. Select·Textarea는 이번 비교 범위에서 기존 동작을 유지합니다.
## 2026-09-16 — Use soft ink for neutral form hover edges

- 변경 파일: Field·Select·Textarea hover styles
- 요약: 일반 input류의 hover 테두리를 primary 계열이 아닌 `ink.soft`로 통일했습니다.

일반 Form의 resting edge는 구조선이고 hover는 그 선을 읽기용 잉크 농도까지 한 단계 올리는 피드백으로 정리했습니다. `primary`는 주요 행동 surface에만 남기며, semantic Form은 기존처럼 처음부터 status solid edge와 pigment halo를 사용합니다.
## 2026-09-16 — Lighten neutral form hover edges

- 변경 파일: Field·Select·Textarea hover styles
- 요약: 일반 input류 hover edge를 `ink.soft`에서 `ink.faint`로 낮췄습니다.

기본 edge보다 한 단계만 또렷해지는 가벼운 hover를 목표로 조정했습니다. 이 상태도 semantic Form의 명시적인 status edge와는 충분히 구분됩니다.
## 2026-09-16 — Limit form focus rings to keyboard navigation

- 변경 파일: Field·Select·Textarea focus styles
- 요약: 클릭 포커스에서는 ring을 표시하지 않고 `:focus-visible`인 keyboard focus에만 표시하도록 바꿨습니다.

입력 중인 위치는 caret과 hover edge로 충분히 드러나므로, blue focus ring은 Tab 탐색처럼 키보드 위치를 잃기 쉬운 상황에만 남겼습니다. Field는 wrapper가 outline을 맡아 내부 input의 `:focus-visible` 상태를 읽습니다.
## 2026-09-16 — Replace pointer focus ring with soft form edge

- 변경 파일: Field·Select·Textarea focus modality styles
- 요약: pointer click으로 focus된 일반 input류는 blue ring 대신 `ink.soft` border를 사용합니다.

브라우저가 text input의 pointer focus도 `:focus-visible`로 판정하는 경우가 있어 input modality를 DOM attribute로 즉시 기록합니다. keyboard focus는 기존 blue ring을 유지하고, pointer focus는 hover(`ink.faint`)보다 한 단계 또렷한 `ink.soft` edge로 현재 입력 위치만 알립니다.
## 2026-09-21 — Document hover and focus contracts

- 변경 파일: `docs/foundations/interaction.md`, foundation 문서
- 요약: shared color, neutral Form, semantic Form, navigation의 hover 우선순위와 keyboard/pointer focus 차이를 하나의 계약으로 정리했습니다.

현재 구현은 shared color의 overlay와 Form의 border/halo가 서로 다른 책임을 갖는데, 기존 문서에서는 이 경계가 여러 파일의 주석에 흩어져 있었습니다. 새 문서는 `border.hover`를 neutral Form 전용 단계로 명시하고, selected가 hover보다 우선하는 이유와 정적 Badge에 hover를 붙이지 않는 기준을 함께 고정합니다. 코드나 색 값은 바꾸지 않았고, 작업 중이던 토큰 변경도 포함하지 않았습니다.
## 2026-09-23 — Consolidate accent palette and semantic contract

- 변경 파일: `tokens/color-ladder.ts`, `tokens/colors.ts`, shared accent components, Playground·Foundations 문서
- 요약: accent palette를 11-step으로 완성하고, component의 의미색 prop을 `color`에서 `accent`로 통일했으며 semantic accent token을 `solid / wash / soft / edge / edgeStrong` 다섯 자리로 축소했습니다.

⚠ `status`는 색 prop으로 바꾸지 않았습니다. Field·Select·Textarea에서 validation 상태를 말하는
도메인 API라 그대로 유지하고, 내부에서만 같은 `accent[status]` contract로 연결했습니다. 이번
정리는 public API와 token tree를 함께 움직이는 변경이므로, raw palette는 Playground Palette에서만
검토하고 component·app은 semantic token 또는 `accent`만 소비해야 합니다. amber는 다른 accent보다
연한 색으로 취급하지 않아 light palette의 400 이상 label에 밝은 전경을 사용했습니다.
## 2026-09-25 — Revert the dense timeline experiment

- 변경 파일: `workspace/app/src/pages/Demo.tsx`, Paper UI의 실험적 surface·control 조정, 관련 문서
- 요약: 타임라인 데모와 그에 맞춘 다크 surface 순서·SegmentedControl·Field 효과를 되돌리고, 실험 전의 이슈 트래커 데모와 `dev/palette-ladder` 브랜치로 복귀했습니다.

데모의 크기와 밀도를 계속 조절하는 방식으로는 원하는 Shape 정체성이 명확해지지 않았습니다. doodle 기반 토큰 조정과 기존 charcoal 중립화 작업은 별개의 선행 작업이므로 유지했습니다. 실험 브랜치는 복구 가능하도록 남겼습니다.
## 2026-09-25 — Rebuild semantic color systems from OKLCH

- 변경 파일: Palette source/generator, semantic color tokens, component color consumers, Playground, foundations 문서
- 요약: OKLCH source에서 6/8자리 HEX Palette Token을 생성하고, Surface·Ink·Accent·Interaction·Constants 다섯 semantic system을 Palette Token만으로 구성했습니다.

Focus ring 색은 상태색이므로 `interaction.focus`에 두고, shadow tint는 `constants.shadow`로 분리했습니다. 두 경우 모두 생성된 Palette Token만 참조하며 링과 그림자의 geometry는 shape 계층에 남깁니다. semantic leaf가 다른 semantic leaf를 참조하지 않는 구조적 불변조건을 유지해야 합니다.
## 2026-09-25 — Align token ownership and color derivation

- 변경 파일: color·shape·text·layout token definitions, semantic consumers, lint rules, Foundations 문서
- 요약: 상태 glow를 accent 기반 HEX Palette Token으로 생성하고, 중복·미사용 shape 값과 소유권 오류를 정리했습니다. focus ring, spinner, checkbox mark, tab indicator의 서로 다른 geometry도 전용 token으로 분리했습니다.

Palette leaf에는 nominal `PaletteToken` 타입을 붙여 semantic 계층이 임의 string을 받을 수 없게 했습니다. 컨트롤 글자 크기·mono 보정·weight는 Text의 단일 출처를 공유하며, navbar와 segmented track 치수는 component intrinsic으로 옮겼습니다. 색상 합성은 Palette 생성 단계로 한정하고, 소비처의 runtime color math를 lint에서 막습니다.
## 2026-09-25 — Clarify token layers in Playground

- 변경 파일: `workspace/app/src/playground/Tokens.tsx`, `Palette.tsx`, 관련 Playground styles
- 요약: Tokens 화면에 Palette source → generated Palette Token → semantic trees → consumers 계층도를 추가하고 Color family를 역할별로 분리했습니다. Palette의 고정 최소폭을 반응형 grid로 바꾸고 긴 label이 셀 밖으로 밀지 않도록 했습니다.

기존 화면은 값 자체는 실시간으로 읽었지만 생성 단계와 semantic system의 소유 관계가 본문 설명에 묻혀 있었습니다. 이번에는 위계와 family를 먼저 보여준 뒤 각 토큰을 확인하도록 순서를 재배치했습니다. 팔레트는 가로 스크롤에 의존하지 않고 좁은 화면에서 열 수를 줄여 전체 스케일과 HEX를 함께 비교할 수 있게 했습니다.
## 2026-09-25 — Neutralize light surface palette chroma

- 변경 파일: `workspace/packages/paper-ui/src/tokens/palette.ts`
- 요약: Light neutral palette의 미세한 보라/청색 chroma를 0으로 낮췄습니다. 기존 lightness 단계는 유지해 표면 밝기와 hierarchy는 그대로 둡니다.

Neutral source가 사실상 achromatic한 dark ramp와 달리 light 쪽은 hue 286°의 작은 chroma를 계속 갖고 있어, 넓은 surface 면적에서 zinc/stone 계열 기운으로 읽힐 수 있었습니다. 이 변경은 saturation cast만 걷어내고 step 밝기와 semantic mapping은 손대지 않습니다.
## 2026-09-26 — Rebuild Paper UI demo with primitives and atoms

- 변경 파일: `workspace/app/src/pages/Demo.tsx`, `workspace/app/src/pages/Demo.css.ts`
- 요약: 이슈 트래커 데모를 Paper UI의 Primitive와 Atom으로 재구성했습니다. 검색·필터·작업 완료·작업 추가 동작은 유지하고, 화면 배치만 데모 전용 CSS로 정의했습니다.

데모의 구조 태그는 모두 `Box as`로 표현하고 텍스트·레이아웃·컨트롤은 Paper UI API를 사용합니다. 프로젝트 전용 표와 진행 표시처럼 전용 시각 배치가 필요한 부분만 className으로 꾸몄습니다.
## 2026-09-26 — Separate Text roles from control typography presets

- 변경 파일: `workspace/packages/paper-ui/src/tokens/text.ts`, `internal/sizeLadder.ts`, control atoms, Typography playground, token docs, 기존 type-scale assertion
- 요약: `control`을 Text variant에서 분리하고 `tokens.text.control.sm/md/lg`를 신설했습니다. Shape의 컨트롤 `size`가 각 preset의 글자 크기와 leading을 geometry와 함께 선택합니다.

조작 문구는 제목·본문 같은 읽기 위계가 아니라 컴포넌트 밀도에 붙는다는 구조를 반영했습니다. 현재 화면의 크기는 sm 13/16, md 13/16, lg 14/16으로 유지하고, 본문·캡션 같은 Text 역할을 컨트롤 크기 매핑에 빌려 쓰지 않게 했습니다. 컨트롤 종류별 weight 차이는 컴포넌트에서 계속 선택합니다.
## 2026-09-26 — Fix Typography playground ink type errors

- 변경 파일: `workspace/app/src/playground/Tokens.tsx`
- 요약: 지원하지 않는 `ink="primary"` 값을 유효한 `ink="base"`로 교체해 앱 typecheck 오류를 해결했습니다.

Typography 표의 specimen과 메타 라벨은 중립 기본 잉크를 의도하므로 API에 실제로 존재하는 `base`가 맞습니다. `primary`는 semantic `tokens.color.ink` 경로와 혼동해 사용한 이름이었습니다.
## 2026-09-26 — Add a Typography Palette layer

- 변경 파일: Typography tokens, component token consumers, Typography Playground, foundation docs
- 요약: raw typography values를 `text.palette.*`로 모으고, Text 역할은 `text.style.*`, Control 크기는 `text.control.*` preset으로 Palette를 참조하도록 계층화했습니다.

이름은 Primitive 대신 Typography Palette로 정했습니다. Text variant와 Control preset이 같은 수치 원본을 재사용하지만, 컨트롤 `size`는 Shape geometry와 Control typography를 함께 고릅니다. 컴포넌트가 의미 역할별 size를 직접 조합하던 지점도 완성된 Text 스타일 경로로 옮겼습니다.
## 2026-09-26 — Keep caption weight at regular 400

- 변경 파일: `workspace/packages/paper-ui/src/tokens/text.ts`, Typography Playground, 기존 type-scale assertion, Typography 문서
- 요약: `caption`을 `normal` 450으로 시각 검토했지만 보조 정보에는 `regular` 400이 더 적합해 되돌렸습니다. `regular` Palette weight도 유지했습니다.

13px caption은 450에서도 읽히지만 본문·컨트롤과의 위계가 덜 분명해졌습니다. 400이 secondary ink와 함께 보조 정보의 톤을 더 잘 유지한다는 판단을 반영했습니다.
## 2026-09-26 — Present the Control Ladder as a type table

- 변경 파일: `workspace/app/src/playground/Tokens.tsx`
- 요약: Typography의 Control 미리보기를 `Control Ladder`로 이름 짓고, Type scale과 같은 raised 표로 구성했습니다.

각 sm·md·lg 행에서 실제 컨트롤 문구, preset weight, size/leading을 같은 열 구조로 비교할 수 있게 했습니다. 샘플은 공통 크기 사다리를 쓰는 Button의 ghost variant를 사용해 색 강조가 측정값을 가리지 않게 했습니다.
## 2026-09-26 — Rename typography palette size to fontSize

- 변경 파일: `workspace/packages/paper-ui/src/tokens/text.ts`, `workspace/packages/paper-ui/src/tokens/index.ts`, `workspace/app/src/playground/Tokens.tsx`, `docs/foundations/tokens.md`
- 요약: 원본 타이포그래피 크기 축을 `text.palette.size.*`에서 `text.palette.fontSize.*`로 명확히 했습니다.

`size`는 Shape의 control size나 완성된 Text style의 크기 속성과 혼동될 수 있어 CSS 속성 축을 직접 드러내는 이름으로 바꿨습니다. Text/Control preset 내부의 `size`는 preset field이므로 그대로 유지합니다. 최초 변경에서 preset → palette CSS variable 참조 경로가 이전 키를 가리켜 Text 크기 적용이 깨졌고, 같은 날 참조 경로를 `fontSize`로 맞춰 복구했습니다.
## 2026-09-26 — Name typography palette steps by pixel value

- 변경 파일: `workspace/packages/paper-ui/src/tokens/text.ts`, `workspace/app/src/playground/Tokens.tsx`, `docs/foundations/tokens.md`
- 요약: fontSize와 leading Palette 키를 단계 별칭 대신 실제 px 값으로 바꾸고, Text·Control preset 조합을 갱신했습니다.

두 scale은 단계 수와 대응이 달라 `fontSize.3xl → leading.2xl`처럼 같은 단계를 기대하게 하는 이름이 혼란을 만들었습니다. 실제 px 키를 사용하면 display 32/40px처럼 서로 다른 축의 조합을 명확히 읽을 수 있습니다.
## 2026-09-29 — Move control tracks out of the surface scale

- 변경 파일: `workspace/packages/paper-ui/src/tokens/colors.ts`, `workspace/app/src/`, `docs/`, `workspace/tests/`
- 요약: 일반 `bg.well`과 네 번째 Box surface를 제거하고 `color.control.track`으로 이동했습니다. Light는 `neutral.200`, dark는 `neutral.900`을 유지하며 Switch·SegmentedControl만 이 토큰을 사용합니다.

트랙은 조작부의 내부 구조라 페이지·패널과 같은 Box surface 목록에 두면 surface scale이 컴포넌트 구현 세부까지 떠안습니다. 그래서 semantic branch를 분리했고, playground의 네 번째 배경은 트랙 비교 옵션으로 보존했습니다. 이전에 저장된 `well` 선택값은 `track`으로 자동 이전합니다.
