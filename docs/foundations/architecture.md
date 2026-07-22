# 아키텍처

값 하나가 어떻게 화면까지 흐르는지, 그리고 왜 이름이 어긋날 수 없는지를 다룹니다. 핵심은 하나입니다 — **각 도메인마다 값 트리가 하나 있고, 같은 헬퍼가 그 트리를 한 번 걸어서 두 산출물을 만든다.**

## 트리를 한 번 걷는다

`tokens/`의 다섯 도메인(`colors` · `shape` · `text` · `motion` · `layout`)에 raw 값(hex·rem·ms)이 트리로 있습니다. `walkValues`와 `buildVarTree`가 그 트리를 걸어 두 곳에 값을 흘려보냅니다 — 하나는 CSS 변수를 굽고, 하나는 컴포넌트가 볼 참조 객체를 만듭니다.

```
VALUES (raw hex/rem/ms — 유일한 정의 위치)
        │  walkValues() / buildVarTree() — 같은 트리, 같은 규칙
        ├──► theme.css.ts   :root { --pui-color-ink-base: #18181b … }
        │                   (raw hex 를 import 하는 유일한 모듈)
        └──► tokens 객체     tokens.color.ink.base = "var(--pui-color-ink-base)"
                            (컴포넌트가 보는 것)
```

트리 leaf 하나가 CSS 변수 이름과 TS 참조 경로를 *동시에* 낳습니다. 한쪽만 고쳐 어긋날 수가 없습니다. 실제로 이 방식이 아니었다면 한 축이 var를 emit하지 않은 채 죽어 있어도 아무도 몰랐을 겁니다 — 그래서 축 목록을 손으로 나열하지 않고 `Object.keys`로 트리를 통째로 걷습니다.

**motion은 예외입니다.** duration+easing+변위 세 값은 한 var로 줄여 쓰기 어려워, CSS 변수로 굽지 않고 `tokens.motion`이 값을 직접 듭니다 — 컴포넌트의 `.css.ts`에 `stateTransition(...)`으로 인라인됩니다.

## resolver — 규칙의 주인

색은 `.css.ts`마다 흩어지지 않고 **resolver + 중앙 emission** 한 자리에 모입니다. 컴포넌트는 "내가 어떤 variant·status인지"만 말하고, 그게 무슨 클래스가 되는지는 모릅니다.

```
resolveColorClassnames(variant, status)  →  "pui-c-solid-danger"   (이름 규칙)
        │                                          │
styles/color.css.ts  ── VARIANTS × STATUS 를 loop ──┘  (그 클래스의 실체)
```

`resolveColorClassnames("solid", "danger")`가 `"pui-c-solid-danger"`를 돌려주고, 그 클래스가 무엇인지(background·color·border)는 `styles/color.css.ts`가 같은 `VARIANTS × STATUS` 배열을 걸어 굳힙니다. 두 자리가 한 배열을 돌기 때문에 resolver가 만들 수 있는 모든 이름에 대응하는 규칙이 반드시 있습니다 — 조합이 빠지거나 어긋날 수 없습니다. hover는 `.pui-interactive` gate가 함께 있을 때만 뭅니다(Button은 붙이고, 표시용 Badge는 안 붙입니다).

## 레이어

```
Primitives(4) → Atoms(13) → Molecules(6) → Components(3)
```

**Primitive만 raw HTML을 렌더합니다.** `Box · Stack · Inline · Text` 넷이 `div`·`span` 같은 태그에 닿는 유일한 레이어입니다. Molecule부터는 이들로 합성하고, raw 태그가 필요하면 `<Box as="button">`이 유일한 통로입니다.

## 절대 규칙 4

원칙은 기억이 아니라 빌드가 지킵니다. 넷 다 eslint가 강제합니다.

1. **raw 값 금지** — hex는 `tokens/colors.ts`에만. `tokens.color.X`로만 참조합니다.
2. **VALUES import 격리** — raw 값 모듈은 `styles/theme.css.ts`만 import 합니다.
3. **inline style로 토큰 주입 금지** — `.css.ts`의 className으로만 적용합니다.
4. **Primitive 위에서 raw HTML 금지** — Molecule부터는 Primitive/Atom으로 합성합니다.

## 검증

시스템에는 검증 표면이 둘 있습니다. 데모(이슈 트래커)는 실제 화면에서 시스템이 서는지 보는 자리이고, playground는 컴포넌트를 전수 깔아 자동 테스트가 정렬·색·포커스·타입을 계산값으로 assert하는 표면입니다. 값을 하드코딩해 두어, 토큰이 의도치 않게 바뀌면 테스트가 걸립니다. `surface`를 `paper`로, CSS prefix를 `pui-`로, 토큰 구조를 studio-ui 결로 재개편하면서도 마음이 편했던 건 이 하네스 덕입니다.
