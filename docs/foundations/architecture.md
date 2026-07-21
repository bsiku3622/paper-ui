# 아키텍처

값 하나가 어떻게 화면까지 흐르는지, 그리고 왜 이름이 어긋날 수 없는지를 다룹니다. 핵심은 하나입니다 — **각 도메인마다 값 트리가 하나 있고, 같은 헬퍼가 그 트리를 한 번 걸어서 두 산출물을 만든다.**

## 트리를 한 번 걷는다

`tokens/colors.ts` · `shape.ts` · `text.ts`에 raw 값(hex·rem)이 트리로 있습니다. `walkValues`와 `buildVarTree`가 그 트리를 걸어 세 곳에 값을 흘려보냅니다.

```
VALUES (raw hex/rem — 유일한 정의 위치)
        │  walkValues() / buildVarTree() — 같은 트리, 같은 규칙
        ├──► theme.css.ts   :root { --pui-color-ink-base: #18181b … }
        │                   (raw hex 를 import 하는 유일한 모듈)
        ├──► tokens 객체     tokens.color.ink.base = "var(--pui-color-ink-base)"
        │                   (컴포넌트가 보는 것)
        └──► utility.css.ts  .pui-paper-muted · .pui-blue-wash …
                            (resolver 가 가리키는 클래스의 실체)
```

트리 leaf 하나가 CSS 변수 이름과 TS 참조 경로를 *동시에* 낳습니다. 한쪽만 고쳐 어긋날 수가 없습니다. 실제로 이 방식이 아니었다면 한 축이 var를 emit하지 않은 채 죽어 있어도 아무도 몰랐을 겁니다 — 그래서 축 목록을 손으로 나열하지 않고 `Object.keys`로 트리를 통째로 걷습니다.

## 레이어

```
resolvers/   prop → className  (규칙의 주인)
   │
Primitives(4) → Atoms(9) → Molecules(4) → Components(3)
```

**Resolver가 규칙의 주인입니다.** 컴포넌트는 "내가 어떤 색인지"만 말하고, 그게 무슨 클래스가 되는지는 모릅니다. 색 해석이 Button 안에도 Badge 안에도 흩어지면 둘이 조용히 달라지기 때문입니다. `resolveStatus("error")`가 `"pui-red-ink"`를 돌려주고, 그 클래스가 무엇인지는 `utility.css.ts`가 굳힙니다 — 두 자리가 같은 토큰 트리를 돌아 조합이 빠질 수 없습니다.

**Primitive만 raw HTML을 렌더합니다.** `Box · Stack · Inline · Text` 넷이 `div`·`span` 같은 태그에 닿는 유일한 레이어입니다. Molecule부터는 이들로 합성하고, raw 태그가 필요하면 `<Box as="button">`이 유일한 통로입니다.

## 절대 규칙 4

원칙은 기억이 아니라 빌드가 지킵니다. 넷 다 eslint가 강제합니다.

1. **raw 값 금지** — hex는 `tokens/colors.ts`에만. `tokens.color.X`로만 참조합니다.
2. **VALUES import 격리** — raw 값 모듈은 `styles/theme.css.ts`만 import 합니다.
3. **inline style로 토큰 주입 금지** — `.css.ts`의 className으로만 적용합니다.
4. **Primitive 위에서 raw HTML 금지** — Molecule부터는 Primitive/Atom으로 합성합니다.

## 검증

시스템에는 검증 표면이 둘 있습니다. 데모(이슈 트래커)는 실제 화면에서 시스템이 서는지 보는 자리이고, playground는 20개를 전수 깔아 자동 테스트가 정렬·색·포커스·타입을 계산값으로 assert하는 표면입니다. 값을 하드코딩해 두어, 토큰이 의도치 않게 바뀌면 테스트가 걸립니다. `surface`를 `paper`로, CSS prefix를 `pui-`로 두 번 연속 이름을 바꾸면서도 마음이 편했던 건 이 하네스 덕입니다.
