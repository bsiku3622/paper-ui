# Architecture

값 하나가 어떻게 화면까지 흐르는지, 그리고 왜 이름이 어긋날 수 없는지를 다룹니다. 핵심은 하나입니다 — **각 도메인마다 값 트리가 하나 있고, 같은 헬퍼가 그 트리를 한 번 걸어서 두 산출물을 만든다.**

## 트리를 한 번 걷는다

`shape` · `text` · `motion` · `layout`은 각자 한 values tree를 갖습니다. 색은 **OKLCH Palette → generated HEX Palette Tokens → semantic systems** 순서로 만듭니다. `walkValues`와 `buildVarTree`는 마지막 semantic tree를 걸어 CSS 변수와 컴포넌트 참조 객체를 함께 만듭니다. 색의 네 단계는 [색 아키텍처](color-architecture.md)가 정본입니다. Shape과 Layout은 원본만 변수로 굽고, 역할은 그 변수의 별칭이거나 소비 요소의 class에서 계산되는 식입니다. 규칙은 [Shape](shape.md)과 [Layout](layout.md)에 있습니다.

```
palette.ts (L0 OKLCH source)
        ↓
color-ladder.ts (L1 generated HEX Palette Tokens)
        ↓
colors.ts (L2 semantic bg/border/ink/accent/interaction/constants tree)
        │  walkValues() / buildVarTree() — 같은 tree, 같은 규칙
        ├──► theme.css.ts   :root { --pui-color-ink-primary: … }
        └──► tokens 객체     tokens.color.ink.primary = "var(--pui-color-ink-primary)"
                            (컴포넌트가 보는 것)
```

트리 leaf 하나가 CSS 변수 이름과 TS 참조 경로를 *동시에* 낳습니다. 한쪽만 고쳐 어긋날 수가 없습니다. 실제로 이 방식이 아니었다면 한 축이 var를 emit하지 않은 채 죽어 있어도 아무도 몰랐을 겁니다 — 그래서 축 목록을 손으로 나열하지 않고 `Object.keys`로 트리를 통째로 걷습니다.

**motion은 예외입니다.** duration+easing+변위 세 값은 한 var로 줄여 쓰기 어려워, CSS 변수로 굽지 않고 `tokens.motion`이 값을 직접 듭니다 — 컴포넌트의 `.css.ts`에 `stateTransition(...)`으로 인라인됩니다.

## resolver — 규칙의 주인

색은 `.css.ts`마다 흩어지지 않고 **resolver + 중앙 emission** 한 자리에 모입니다. 컴포넌트는 "내가 어떤 accent·variant인지"(또는 어떤 surface인지)만 말하고, 그게 무슨 클래스가 되는지는 모릅니다.

```
resolveAccent(accent, variant)  →  "pui-a-error-solid"   (이름 규칙)
        │                              │
styles/color.css.ts  ── ACCENTS × VARIANTS 를 loop ──┘  (그 클래스의 실체)
```

`resolveAccent("error", "solid")`가 `"pui-a-error-solid"`를 돌려주고, 그 클래스가 무엇인지(background·color·border)는 `styles/color.css.ts`가 같은 `ACCENTS × VARIANTS` 배열을 걸어 굳힙니다. 면은 색과 다른 종류라 resolver도 따로입니다 — `resolveSurface(surface)` → `"pui-surface-raised"`. 두 자리가 한 배열을 돌기 때문에 resolver가 만들 수 있는 모든 이름에 대응하는 규칙이 반드시 있습니다 — 조합이 빠지거나 어긋날 수 없습니다. shared accent hover는 `.pui-interactive` gate가 함께 있을 때만 물고, Form atoms의 border/focus와 선택 가능한 행의 우선순위는 각 소비자가 소유합니다. 전체 계약은 [Interaction](interaction.md)에 고정합니다.

## Primitive 기반

Primitives는 Layout(Box·Stack·Inline·Grid), Content(Text·Icon), Interaction(Pressable·Hoverable·Toggleable·Draggable·Droppable·ToggleGroup·Overlay), A11y(FocusScope·VisuallyHidden·RovingFocus·FormField)로 나뉩니다. 행동과 그룹 상태·입력 관계는 hook으로도 조립합니다. Paper는 공개 API와 native ref·상태 연결을 소유하고, React Aria가 입력 정규화·포커스·Overlay·native drag and drop을 처리합니다. MergeProps·mergeRefs·composeEventHandlers는 같은 DOM에 행동을 연결하는 도구입니다. 전체 계약과 예시는 [Primitives](../components/primitives.md)에 있습니다.

## 패키지 경계

```
Tokens → Primitives → Atoms
```

패키지는 레이아웃을 조합하는 Primitive와 단일 역할의 Atom까지 제공합니다. 페이지 헤더·표·메뉴 같은 더 큰 조합은 실제 제품의 요구가 반복되어 공통 API의 경계가 분명해질 때까지 소비 앱이 소유합니다. 앱에서 의미 있는 HTML이 필요하면 `<Box as="button">`처럼 Primitive의 typed `as` 경로를 사용하거나, 앱의 semantic markup을 직접 작성합니다.

Atom에도 `as`가 있지만(`<Button as={Link} to="/docs">`) 그건 raw 태그를 뚫는 구멍이 아니라 같은 자리의 역할을 바꾸는 축입니다. 버튼처럼 생겼는데 실제로 하는 일이 이동이라면 그것은 링크여야 하고, 그렇다고 `<Link>`로 `<Button>`을 감싸면 `<a>` 안에 `<button>`이 들어가 탭 정지가 둘로 늘어납니다. 태그 하나만 그리게 하는 것이 `as`의 몫입니다.

## 빌드 규칙

원칙은 기억이 아니라 빌드가 지킵니다. 아래 세 규칙은 eslint가 강제합니다.

1. **raw 색값 금지** — OKLCH source는 `tokens/palette.ts`, HEX 생성과 gamut mapping은 `tokens/color-ladder.ts`에만 둡니다. 소비처는 `tokens.color.X`만 참조하고 runtime color math를 하지 않습니다.
2. **color layer import 격리** — palette·ladder·semantic VALUES는 component·resolver·app에서 import하지 않습니다.
3. **패키지의 inline style로 토큰 주입 금지** — 내부 스타일은 `.css.ts`의 className으로 적용합니다. 호출자가 제공한 style과 Box의 dimension escape는 유지합니다.
4. **컴포넌트의 고정 geometry literal 금지** — Primitive·Atom stylesheet의 길이는 공통 역할이나 private recipe에서 선택합니다. 0·100%·정렬 같은 구조적 CSS는 소비처에 둡니다.
## 검증

데모(이슈 트래커)는 Primitive와 Atom을 실제 화면에 조합해 보는 자리입니다. Playground는 Palette와 Foundations 값을 표시합니다. 제품 조합은 별도의 라이브러리 카탈로그에 포함하지 않습니다.
