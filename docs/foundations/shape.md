# Shape architecture

Shape은 **원본 수치 → 공통 역할 → 내부 geometry recipe → CSS class** 순서로 적용합니다. Color가 Palette에서 역할별 색을 고르듯, Shape도 원본 수치와 사용 역할을 분리합니다. 컴포넌트의 광학 보정과 조립식은 내부 recipe가 소유합니다.

```text
tokens/shape-palette.ts   원본 length · radius · stroke · measure
             ↓
tokens/shape.ts           공통 Shape 역할
tokens/layout.ts         면의 크기 · block padding · 읽기 폭
             ↓
tokens/shape-recipes.ts   Atom anatomy와 파생식
internal/shape.ts         역할별 control geometry
             ↓
*.css.ts                 className으로 실제 적용
```

## 공개 토큰

아래는 새 코드에서 사용하는 canonical 경로입니다. `tokens.shape`의 leaf는 CSS variable 참조이며, 기존 경로는 호환 목적으로 함께 남아 있습니다. 표의 px 환산은 root font size 16px 기준입니다.

| 경로 | 키 | 값 |
| --- | --- | --- |
| `shape.space` | xs / sm / md / lg / xl | 4 / 8 / 12 / 16 / 24px |
| `shape.radius.control` | 단일 | 4px |
| `shape.radius.surface` | sm / md / lg | 4 / 6 / 8px |
| `shape.radius.full` | 단일 | 999px |
| `shape.stroke` | border / emphasis / icon | 1px / 2px / 1.75 |
| `shape.focus` | width / offset | 2px / 2px |
| `shape.control.height` | sm / md / lg | 30 / 32 / 36px |
| `shape.control.inset.button` | sm / md / lg | 10 / 11 / 14px |
| `shape.control.inset.input` | sm / md / lg | 7 / 8 / 10px |
| `shape.selection.size` | sm / md / lg | 15 / 16 / 18px |
| `shape.icon.size` | label / caption / body / heading3 | 14 / 16 / 18 / 20px |
| `shape.shadow` | overlay / overlayMinimal | 테마별 geometry와 semantic shadow tint 조립 |

Space는 gap과 padding이 함께 쓰는 공통 scale입니다. `gap="sm"`과 `padding="sm"`은 같은 8px을 고릅니다. 모든 간격에 별도 의미 이름을 붙이지 않습니다. 버튼 라벨과 입력값처럼 요구가 갈리는 자리에만 `control.inset.button`과 `control.inset.input`을 둡니다.

ControlSize는 `sm · md · lg`, Space는 `xs · sm · md · lg · xl`입니다. 이름 일부가 겹쳐도 서로 다른 축입니다. 같은 ControlSize의 Button·Field·Select는 같은 외곽 높이를 선택하며, typography는 각 역할의 `text.control` preset에서 별도로 선택합니다.

Box의 `radius="sm"`은 `radius.surface.sm`을 선택합니다. Control의 `radius.control`과 값이 같아도 역할과 CSS variable은 독립적입니다. Focus 폭도 `stroke.emphasis`와 독립적인 역할이므로, focus를 두껍게 만들어도 체크 표시가 함께 두꺼워지지 않습니다.

## Layout 경계

면의 폭·높이·읽기 폭·block padding은 Layout이 소유합니다. Box의 공개 props는 유지하며 내부 참조만 새 경로로 바꿨습니다.

| 경로 | xs / sm / md / lg / xl |
| --- | --- |
| `layout.width` | 72 / 108 / 160 / 240 / 360px |
| `layout.height` | 64 / 96 / 144 / 216 / 320px |
| `layout.padding` | 8 / 12 / 16 / 20 / 32px |
| `layout.measure` | 28 / 32 / 38 / 42 / 46rem |

`layout.padding`은 앱의 block 배치를 위한 별도 scale입니다. Box의 `padding` prop은 공통 `shape.space`를 선택합니다. `layout.z`와 기존 breakpoint·container·inset·sizeIntent 어휘도 유지합니다.

## 내부 recipe

`SHAPE_RECIPE_VALUES`에는 원본 anatomy 값을, `SHAPE_RECIPES`에는 그 참조와 파생식을 둡니다. 내부 원본값은 `--pui-geometry-*` 변수로 emit하지만 패키지의 공개 `tokens` API에는 노출하지 않습니다. 앱은 이 private 변수 이름에 의존하지 않습니다.

| 대상 | recipe의 책임 |
| --- | --- |
| Button / IconButton | 공유 control 높이·button inset, loading spinner 0.95em, 아이콘 버튼 정사각형 |
| Field / Select | 공유 control 높이·input inset |
| Textarea | input inset, typography 보정식, 독립적인 최소 높이 96px |
| Select 화살표 | 크기 10px + 끝 여백 12px + 글자와의 간격 2px = 예약 공간 24px |
| Badge | 높이 20 / 22 / 24px, inset 6 / 8 / 10px, dot 0.5em |
| Checkbox | 공통 selection 외곽 크기, mark 비율, sm 광학 보정, 작은 모서리, indeterminate dash |
| Radio | 공통 selection 외곽 크기, 독립적인 dot 비율과 sm 광학 보정 |
| Switch | 공통 selection 크기에서 track·thumb·이동 거리 계산 |
| Spinner / Link | spinner 크기·stroke, underline offset |

Textarea의 block inset은 `input inset − (textarea leading − font size) / 2`입니다. 기본 preset에서는 3.5 / 4.5 / 7px이 됩니다. `fontSize` escape prop으로 글자 크기만 바꾸는 경우에도 geometry는 선택한 size의 기본 preset을 기준으로 유지합니다.

Switch는 `thumb = selection − clearance`, `track height = selection + clearance`, `track width = thumb × 2 + clearance × 2`입니다. Clearance는 root 16px 기준 2px이며 rem으로 함께 확대됩니다. 손잡이 inset은 `(track height − thumb) / 2`, 켜졌을 때 이동 거리는 `track width − track height`입니다. RTL에서는 이동 방향을 뒤집습니다.

Checkbox mark와 Radio dot은 외곽의 절반으로 계산하되 sm에서는 각자의 0.5px 보정을 뺍니다. 두 보정은 별도 recipe이므로 체크 모양을 고쳐도 Radio 점이 바뀌지 않습니다. 체크 표시의 회전·이동처럼 glyph에 종속된 보정도 공통 토큰으로 승격하지 않습니다.

파생 `calc()`는 실제 소비 요소의 class 선언에 둡니다. 이를 `:root` 변수에 미리 조립하면 참조가 root에서 계산되어, 중첩 영역의 토큰 재정의를 따라가지 못합니다. 내부 원본값과 공개 역할 변수는 상속하고, 관계식은 소비 위치에서 평가합니다.

## 실제 적용

패키지는 `.css.ts` className으로 토큰을 적용합니다. 같은 size가 필요한 컴포넌트는 `controlGeometry.button / field / select / textarea` 중 역할을 선택합니다. 임의 CSS key를 덮어쓰거나 `null`로 삭제하던 `ladderRules(patch)`는 제거했습니다.

색은 계속 `tokens.color`를 사용합니다. Select는 고정 색이 든 background SVG를 제거하고, native select 옆의 장식 SVG가 semantic ink를 상속하도록 바꿨습니다. 따라서 light/dark·중첩 ThemeScope·placeholder 색을 같은 경로에서 처리합니다. Select의 `className`과 `style`은 보이는 wrapper에, `ref`와 native form 속성은 안쪽 select에 적용됩니다.

Box의 dimension props와 호출자가 제공하는 `style`은 유지합니다. named dimension은 Layout 토큰으로 해석하며, 임의 CSS 길이는 앱의 배치를 위한 escape입니다. 내부 anatomy가 이 통로를 사용하지는 않습니다.

## 호환과 검증

`shape-legacy.ts`는 기존 `gap`, `padding.*.interaction/layout`, `height.*.interaction/layout`, `width.*.layout`, `radius.interaction/layout`, `constants`, 각 Atom geometry 경로를 새 소스로 연결합니다. 기존 JS 경로와 `--pui-shape-*` 변수 이름은 계속 emit합니다. 외곽 size xs/xl처럼 새 control API에 없는 값은 기존 소비자용으로만 유지합니다.

새 패키지 코드와 Playground는 canonical 경로를 사용합니다. 이전 변수 이름을 override해 새 컴포넌트까지 변경하는 동작은 지원하지 않습니다. override가 필요하면 canonical 변수 이름으로 옮깁니다. 호환 alias는 `:root`에서 계산되므로 중첩 영역의 재정의에도 canonical API를 사용합니다.

Lint는 패키지의 inline token 참조와 변수 별칭, 소비처 raw source import, raw color·직접 작성한 token var 문자열, Primitive·Atom stylesheet의 고정 길이 literal을 검사합니다. 0·100%·가운데 정렬·회전 같은 구조적 CSS는 컴포넌트가 소유합니다. 테스트는 변수 참조의 완전성·순환 여부, 세 size의 브라우저 계산값, 중첩 토큰 재정의, native Select의 form·keyboard·theme 계약을 확인합니다.
